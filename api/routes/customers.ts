/**
 * Customers API Routes
 * Customer management with auto-format phone (08xx → 62xx)
 */
import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { z } from 'zod'

const router = Router()

const createCustomerSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().min(1, 'Nomor HP wajib diisi'),
  email: z.string().email().optional().nullable(),
})

const updateCustomerSchema = createCustomerSchema.partial()

function formatPhoneForStorage(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1)
  }
  return cleaned
}

function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) {
    return '+' + cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 5) + '-' + cleaned.slice(5)
  }
  return phone
}

router.get('/', async (req, res) => {
  try {
    const { tenant_id, search, page = '1', limit = '20' } = req.query

    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' })
    }

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenant_id as string)
      .order('name')

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    query = query.range(offset, offset + limitNum - 1)

    const { data: customers, error, count } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      customers: customers || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/search', async (req, res) => {
  try {
    const { tenant_id, q } = req.query

    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' })
    }

    if (!q || (q as string).length < 2) {
      return res.json({ results: [] })
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, phone, email')
      .eq('tenant_id', tenant_id as string)
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(10)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ results: customers || [] })
  } catch (error) {
    console.error('Error searching customers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    res.json({ customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const validatedData = createCustomerSchema.parse(req.body)

    const formattedPhone = formatPhoneForStorage(validatedData.phone)

    const { data: existing, error: findError } = await supabase
      .from('customers')
      .select('id, name, phone')
      .eq('tenant_id', validatedData.tenant_id)
      .eq('phone', formattedPhone)
      .single()

    if (existing) {
      return res.json({
        success: true,
        customer: existing,
        isNew: false,
        message: 'Customer found'
      })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        tenant_id: validatedData.tenant_id,
        name: validatedData.name,
        phone: formattedPhone,
        email: validatedData.email || null
      })
      .select('id, name, phone, email')
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({
      success: true,
      customer,
      isNew: true,
      message: 'Customer created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error creating customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateCustomerSchema.parse(req.body)

    if (validatedData.phone) {
      validatedData.phone = formatPhoneForStorage(validatedData.phone)
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .update(validatedData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    res.json({
      success: true,
      customer,
      message: 'Customer updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error updating customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ success: true, message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/upsert-by-phone', async (req, res) => {
  try {
    const { tenant_id, name, phone, email } = req.body

    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' })
    }

    const formattedPhone = formatPhoneForStorage(phone)

    const { data: existing, error: findError } = await supabase
      .from('customers')
      .select('id, name, phone, email, total_transactions, total_spent')
      .eq('tenant_id', tenant_id)
      .eq('phone', formattedPhone)
      .single()

    if (existing) {
      return res.json({
        success: true,
        customer: existing,
        isNew: false
      })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        tenant_id,
        name: name || 'Pelanggan',
        phone: formattedPhone,
        email: email || null
      })
      .select('id, name, phone, email, total_transactions, total_spent')
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({
      success: true,
      customer,
      isNew: true
    })
  } catch (error) {
    console.error('Error upserting customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/update-stats', async (req, res) => {
  try {
    const { customer_id, amount } = req.body

    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' })
    }

    const { error } = await supabase.rpc('increment_customer_stats', {
      customer_id_input: customer_id,
      amount_input: amount || 0
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating customer stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
