/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import { supabase } from '../lib/supabase'
import crypto from 'crypto'
import { z } from 'zod'
import { sendWelcomeEmail, sendReactivationEmail } from '../lib/email.js'

const router = express.Router()

// Validation schemas
const createOrderSchema = z.object({
  email: z.string().email(),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  customer_company: z.string().min(1),
  customer_address: z.string().min(1),
  customer_notes: z.string().optional(),
  plan_type: z.enum(['single_store', 'multi_store_5', 'multi_store_20', 'multi_store_unlimited']),
  billing_cycle: z.enum(['monthly', 'yearly']),
  amount: z.number().positive()
})

const updateOrderStatusSchema = z.object({
  payment_status: z.enum(['pending', 'processing', 'paid', 'failed', 'expired', 'cancelled', 'refunded']),
  payment_gateway_transaction_id: z.string().optional(),
  payment_method: z.string().optional(),
  reason: z.string().optional()
})

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2'

// Helper function to create Midtrans transaction
async function createMidtransTransaction(orderData: any): Promise<any> {
  const transactionDetails = {
    transaction_details: {
      order_id: orderData.id,
      gross_amount: orderData.amount
    },
    customer_details: {
      first_name: orderData.customer_name,
      email: orderData.email,
      phone: orderData.customer_phone,
      billing_address: {
        address: orderData.customer_address,
        city: 'Jakarta', // Default city
        postal_code: '12345', // Default postal code
        country_code: 'IDN'
      }
    },
    item_details: [{
      id: orderData.plan_type,
      price: orderData.amount,
      quantity: 1,
      name: `VaporPOS ${orderData.plan_type} - ${orderData.billing_cycle}`,
      category: 'Software Subscription'
    }],
    callbacks: {
      finish: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success`,
      error: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/error`,
      pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/pending`
    },
    expiry: {
      start_time: new Date().toISOString(),
      unit: 'hour',
      duration: 24
    }
  }

  const response = await fetch(`${MIDTRANS_API_URL}/charge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`
    },
    body: JSON.stringify(transactionDetails)
  })

  if (!response.ok) {
    throw new Error(`Midtrans API error: ${response.statusText}`)
  }

  return await response.json()
}

// Helper function to verify Midtrans signature
function verifyMidtransSignature(data: any, signature: string): boolean {
  const orderId = data.order_id
  const statusCode = data.status_code
  const grossAmount = data.gross_amount
  const serverKey = MIDTRANS_SERVER_KEY
  
  const signatureKey = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex')
  
  return signatureKey === signature
}

// Helper function to create tenant user
async function createTenantUser(orderData: any): Promise<{ user: any; password: string }> {
  try {
    // Generate random password
    const password = crypto.randomBytes(12).toString('base64').slice(0, 12)
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: orderData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: orderData.customer_name,
        role: 'admin',
        company: orderData.customer_company,
        phone: orderData.customer_phone,
        plan_type: orderData.plan_type,
        billing_cycle: orderData.billing_cycle
      }
    })

    if (authError) throw authError

    // Insert user into users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: orderData.customer_name,
        email: orderData.email,
        role: 'admin',
        tenant_id: authData.user.id, // User becomes their own tenant
        is_active: true,
        must_change_password: true
      })
      .select()
      .single()

    if (userError) throw userError

    // Update order with tenant user ID
    await supabase
      .from('orders')
      .update({ 
        tenant_created: true, 
        tenant_user_id: authData.user.id 
      })
      .eq('id', orderData.id)

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
    await sendWelcomeEmail(orderData.email, orderData.customer_name, password, loginUrl)

    return { user: userData, password }
  } catch (error) {
    console.error('Error creating tenant user:', error)
    throw error
  }
}

// POST /api/orders - Create new order and initiate payment
router.post('/', async (req, res) => {
  try {
    console.log('Creating order with data:', req.body)
    
    // Validate environment variables
    if (!MIDTRANS_SERVER_KEY) {
      console.error('MIDTRANS_SERVER_KEY is not configured')
      return res.status(500).json({ error: 'Payment gateway not configured' })
    }
    
    const validatedData = createOrderSchema.parse(req.body)
    console.log('Validated data:', validatedData)
    
    // Create order in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: validatedData.email,
        customer_name: validatedData.customer_name,
        customer_phone: validatedData.customer_phone,
        customer_company: validatedData.customer_company,
        customer_address: validatedData.customer_address,
        customer_notes: validatedData.customer_notes,
        plan_type: validatedData.plan_type,
        billing_cycle: validatedData.billing_cycle,
        amount: validatedData.amount,
        payment_status: 'pending',
        payment_gateway: 'midtrans',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        order_items: {
          plan_type: validatedData.plan_type,
          billing_cycle: validatedData.billing_cycle,
          amount: validatedData.amount
        }
      })
      .select()
      .single()

    if (orderError) {
      console.error('Database error creating order:', orderError)
      return res.status(400).json({ error: orderError.message })
    }
    
    console.log('Order created successfully:', orderData.id)

    // Create Midtrans transaction
    try {
      console.log('Creating Midtrans transaction for order:', orderData.id)
      const midtransResponse = await createMidtransTransaction(orderData)
      console.log('Midtrans response:', midtransResponse)
      
      // Update order with payment details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_token: midtransResponse.token,
          payment_url: midtransResponse.redirect_url,
          payment_gateway_transaction_id: midtransResponse.transaction_id,
          payment_gateway_response: midtransResponse
        })
        .eq('id', orderData.id)

      if (updateError) {
        console.error('Error updating order with payment details:', updateError)
      }

      res.json({
        success: true,
        order: orderData,
        payment: {
          token: midtransResponse.token,
          redirect_url: midtransResponse.redirect_url
        }
      })
    } catch (midtransError) {
      console.error('Midtrans error:', midtransError)
      res.status(500).json({ 
        error: 'Payment gateway error', 
        details: midtransError.message 
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return res.status(400).json({ error: 'Validation error', details: error.issues })
    }
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// GET /api/orders - List orders (superadmin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan_type, search } = req.query
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_status_history(
          id,
          old_status,
          new_status,
          reason,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (status) {
      query = query.eq('payment_status', status)
    }
    if (plan_type) {
      query = query.eq('plan_type', plan_type)
    }
    if (search) {
      query = query.or(`email.ilike.%${search}%,customer_name.ilike.%${search}%,customer_company.ilike.%${search}%`)
    }
    
    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit)
    query = query.range(offset, offset + Number(limit) - 1)
    
    const { data: orders, error } = await query
    
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    
    // Get total count for pagination
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/orders/:id - Get order details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_status_history(
          id,
          old_status,
          new_status,
          reason,
          changed_by,
          created_at
        ),
        tenant_user:tenant_user_id(
          id,
          name,
          email,
          is_active
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    res.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/orders/:id/status - Update order status (superadmin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateOrderStatusSchema.parse(req.body)
    
    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: validatedData.payment_status,
        payment_gateway_transaction_id: validatedData.payment_gateway_transaction_id || currentOrder.payment_gateway_transaction_id,
        payment_method: validatedData.payment_method || currentOrder.payment_method
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      return res.status(400).json({ error: updateError.message })
    }
    
    // If status changed to 'paid' and tenant not created yet, create tenant
    if (validatedData.payment_status === 'paid' && !currentOrder.tenant_created) {
      try {
        await createTenantUser(updatedOrder)
      } catch (tenantError) {
        console.error('Error creating tenant:', tenantError)
        // Don't fail the status update if tenant creation fails
      }
    }
    
    res.json({ 
      success: true, 
      order: updatedOrder 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues })
    }
    console.error('Error updating order status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/orders/webhook - Midtrans webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body
    const signature = req.headers['x-signature'] as string
    
    // Verify signature
    if (!verifyMidtransSignature(notification, signature)) {
      return res.status(401).json({ error: 'Invalid signature' })
    }
    
    const orderId = notification.order_id
    const transactionStatus = notification.transaction_status
    const fraudStatus = notification.fraud_status
    
    let paymentStatus = 'pending'
    
    // Map Midtrans status to our payment status
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'processing'
      } else if (fraudStatus === 'accept') {
        paymentStatus = 'paid'
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'paid'
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      paymentStatus = 'failed'
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending'
    }
    
    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (fetchError) {
      console.error('Order not found for webhook:', orderId)
      return res.status(404).json({ error: 'Order not found' })
    }
    
    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_method: notification.payment_type,
        payment_gateway_response: notification
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating order from webhook:', updateError)
      return res.status(500).json({ error: 'Database update failed' })
    }
    
    // If payment is successful and tenant not created yet, create tenant
    if (paymentStatus === 'paid' && !currentOrder.tenant_created) {
      try {
        await createTenantUser(updatedOrder)
      } catch (tenantError) {
        console.error('Error creating tenant from webhook:', tenantError)
        // Don't fail the webhook if tenant creation fails
      }
    }
    
    // If payment is successful, reactivate trial user if exists
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      try {
        await reactivateTrialUser(orderId)
      } catch (reactivationError) {
        console.error('Error reactivating trial user:', reactivationError)
        // Don't fail the webhook if reactivation fails
      }
    }
    
    console.log(`Webhook processed for order ${orderId}: ${paymentStatus}`)
    res.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// Helper function to reactivate trial user after successful payment
async function reactivateTrialUser(orderId: string): Promise<void> {
  try {
    console.log(`Attempting to reactivate trial user for order: ${orderId}`)
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (orderError || !order) {
      console.log(`Order not found: ${orderId}`)
      return
    }
    
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', order.email)
      .single()
    
    if (userError || !user) {
      console.log(`User not found for order ${orderId}: ${order.email}`)
      return
    }
    
    // Only reactivate if user is a trial user or suspended
    if (!user.is_trial_user && user.is_active) {
      console.log(`User ${user.email} is already active and not a trial user`)
      return
    }
    
    // Calculate new subscription period based on plan
    const now = new Date()
    
    // Note: subscriptionExpires calculated but not used in current implementation
    // This could be used for future subscription expiry tracking
    
    // Update user account
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        is_trial_user: false,
        subscription_plan: order.plan_type,
        trial_expires_at: null,
        trial_started_at: null,
        updated_at: now.toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error(`Error updating user ${user.id}:`, updateError)
      throw updateError
    }
    
    // Mark order as tenant created
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        tenant_created: true,
        tenant_user_id: user.id,
        updated_at: now.toISOString()
      })
      .eq('id', order.id)
    
    if (orderUpdateError) {
      console.error(`Error updating order ${order.id}:`, orderUpdateError)
      throw orderUpdateError
    }
    
    console.log(`Successfully reactivated user ${user.email} with plan ${order.plan_type}`)
    
    // Send welcome back email
    try {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
      await sendReactivationEmail(user.email, user.name, order.plan_type, order.billing_cycle, loginUrl)
    } catch (emailError) {
      console.error('Error sending reactivation email:', emailError)
      // Don't fail the reactivation if email fails
    }
    
  } catch (error) {
    console.error(`Error reactivating trial user for order ${orderId}:`, error)
    throw error
  }
}

export default router