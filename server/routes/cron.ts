/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import { supabase } from '../lib/supabase'
import sgMail from '@sendgrid/mail'

const router = express.Router()

// Helper function to get SendGrid configuration
async function getSendGridConfig() {
  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['sendgrid_api_key', 'sendgrid_from_email', 'sendgrid_from_name'])
    .is('tenant_id', null)

  const config: Record<string, string> = {}
  settings?.forEach(setting => {
    config[setting.key] = setting.value
  })

  return config
}

// Helper function to send trial expiration email
async function sendTrialExpirationEmail(email: string, name: string, companyName: string): Promise<void> {
  try {
    const config = await getSendGridConfig()
    
    if (!config.sendgrid_api_key) {
      throw new Error('SendGrid API key not configured')
    }

    sgMail.setApiKey(config.sendgrid_api_key)

    const upgradeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order`

    const msg = {
      to: email,
      from: {
        email: config.sendgrid_from_email || 'noreply@vaporpos.com',
        name: config.sendgrid_from_name || 'VaporPOS'
      },
      subject: 'Your VaporPOS Trial Has Expired - Upgrade Now',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trial Expired - Upgrade Now</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Trial Expired</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Your 14-day free trial for <strong>${companyName}</strong> has expired. We hope you enjoyed using VaporPOS!</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">To continue using VaporPOS and keep your business running smoothly, please upgrade to one of our paid plans:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${upgradeUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Upgrade Now</a>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">What happens next?</h3>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Your account has been temporarily suspended</li>
                <li>Your data is safely stored and will be restored when you upgrade</li>
                <li>Choose a plan that fits your business needs</li>
                <li>Get back to managing your vapor store efficiently</li>
              </ul>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Why Choose VaporPOS?</h3>
              <ul style="color: #424242; margin: 0; padding-left: 20px;">
                <li>Complete POS system designed for vapor stores</li>
                <li>Inventory management with real-time tracking</li>
                <li>Detailed sales reporting and analytics</li>
                <li>Multi-store management capabilities</li>
                <li>24/7 customer support</li>
                <li>Regular updates and new features</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6c757d;">Need help choosing the right plan? Our support team is here to help. Simply reply to this email or contact us through our website.</p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    }

    await sgMail.send(msg)
    console.log('Trial expiration email sent to:', email)
  } catch (error) {
    console.error('Error sending trial expiration email:', error)
    throw error
  }
}

// Helper function to send trial reminder email (2 days before expiration)
async function sendTrialReminderEmail(email: string, name: string, companyName: string, daysLeft: number): Promise<void> {
  try {
    const config = await getSendGridConfig()
    
    if (!config.sendgrid_api_key) {
      throw new Error('SendGrid API key not configured')
    }

    sgMail.setApiKey(config.sendgrid_api_key)

    const upgradeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order`

    const msg = {
      to: email,
      from: {
        email: config.sendgrid_from_email || 'noreply@vaporpos.com',
        name: config.sendgrid_from_name || 'VaporPOS'
      },
      subject: `Your VaporPOS Trial Expires in ${daysLeft} Days`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trial Reminder - ${daysLeft} Days Left</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${daysLeft} Days Left!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Your VaporPOS trial for <strong>${companyName}</strong> expires in <strong>${daysLeft} days</strong>. Don't let your business operations stop!</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Upgrade now to continue enjoying all the benefits of VaporPOS without any interruption.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${upgradeUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Upgrade Before It's Too Late</a>
            </div>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">What You'll Keep:</h3>
              <ul style="color: #155724; margin: 0; padding-left: 20px;">
                <li>All your product data and inventory</li>
                <li>Customer information and transaction history</li>
                <li>Sales reports and analytics</li>
                <li>User accounts and permissions</li>
                <li>Store configurations and settings</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6c757d;">Questions about upgrading? Our team is ready to help you choose the perfect plan for your business needs.</p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    }

    await sgMail.send(msg)
    console.log('Trial reminder email sent to:', email)
  } catch (error) {
    console.error('Error sending trial reminder email:', error)
    throw error
  }
}

// GET /api/cron/check-trial-expiration - Check and suspend expired trial users
router.get('/check-trial-expiration', async (req, res) => {
  try {
    console.log('Checking for expired trial users and sending reminders')
    
    const now = new Date()
    const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000))
    
    // Find expired trial users
    const { data: expiredUsers, error: expiredError } = await supabase
      .from('users')
      .select('id, email, name, trial_expires_at')
      .eq('is_trial_user', true)
      .eq('is_active', true)
      .lt('trial_expires_at', now.toISOString())
    
    if (expiredError) {
      console.error('Error finding expired users:', expiredError)
      return res.status(500).json({ error: 'Failed to check expired users' })
    }
    
    // Find users whose trial expires in 2 days (for reminder)
    const { data: reminderUsers, error: reminderError } = await supabase
      .from('users')
      .select('id, email, name, trial_expires_at')
      .eq('is_trial_user', true)
      .eq('is_active', true)
      .gte('trial_expires_at', now.toISOString())
      .lt('trial_expires_at', twoDaysFromNow.toISOString())
    
    if (reminderError) {
      console.error('Error finding reminder users:', reminderError)
    }
    
    let suspendedCount = 0
    let reminderCount = 0
    
    // Suspend expired users
    if (expiredUsers && expiredUsers.length > 0) {
      console.log(`Found ${expiredUsers.length} expired trial users`)
      
      const userIds = expiredUsers.map(user => user.id)
      const { error: suspendError } = await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: now.toISOString()
        })
        .in('id', userIds)
      
      if (suspendError) {
        console.error('Error suspending expired users:', suspendError)
      } else {
        suspendedCount = expiredUsers.length
        console.log(`Successfully suspended ${suspendedCount} expired trial users`)
        
        // Send expiration emails
        for (const user of expiredUsers) {
          try {
            await sendTrialExpirationEmail(user.email, user.name, 'Your Company')
          } catch (emailError) {
            console.error(`Failed to send expiration email to ${user.email}:`, emailError)
          }
        }
      }
    }
    
    // Send reminder emails
    if (reminderUsers && reminderUsers.length > 0) {
      console.log(`Found ${reminderUsers.length} users needing trial reminders`)
      
      for (const user of reminderUsers) {
        try {
          const expiresAt = new Date(user.trial_expires_at)
          const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
          await sendTrialReminderEmail(user.email, user.name, 'Your Company', daysLeft)
          reminderCount++
        } catch (emailError) {
          console.error(`Failed to send reminder email to ${user.email}:`, emailError)
        }
      }
      
      console.log(`Successfully sent ${reminderCount} trial reminder emails`)
    }
    
    res.json({ 
      message: 'Trial expiration check completed',
      suspended_count: suspendedCount,
      reminder_count: reminderCount,
      timestamp: now.toISOString()
    })
    
  } catch (error) {
    console.error('Check trial expiration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/cron/reactivate-paid-users - Reactivate users who have completed payment
router.get('/reactivate-paid-users', async (req, res) => {
  try {
    console.log('Checking for paid users to reactivate')
    
    // Find paid orders that haven't created tenants yet
    const { data: paidOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid')
      .eq('tenant_created', false)
    
    if (ordersError) {
      console.error('Error finding paid orders:', ordersError)
      return res.status(500).json({ error: 'Failed to check paid orders' })
    }
    
    let reactivatedCount = 0
    
    if (paidOrders && paidOrders.length > 0) {
      console.log(`Found ${paidOrders.length} paid orders to process`)
      
      for (const order of paidOrders) {
        try {
          // Find user by email
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', order.email)
            .single()
          
          if (userError || !user) {
            console.log(`User not found for order ${order.id}: ${order.email}`)
            continue
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
            continue
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
          } else {
            reactivatedCount++
            console.log(`Successfully reactivated user ${user.email} with plan ${order.plan_type}`)
          }
          
        } catch (error) {
          console.error(`Error processing order ${order.id}:`, error)
        }
      }
    }
    
    res.json({ 
      message: 'User reactivation check completed',
      reactivated_count: reactivatedCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Reactivate paid users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ========================
// INVOICE BILL REMINDER SYSTEM
// ========================

async function sendInvoiceReminderWithPDF(invoice: any, daysUntilDue: number): Promise<void> {
  try {
    const { generateInvoicePDF } = await import('../lib/pdf-invoice.js')
    const { sendBillReminderEmail } = await import('../lib/email.js')

    const pdfBuffer = await generateInvoicePDF(invoice.id)

    await sendBillReminderEmail(
      invoice.user.email,
      invoice.user.name,
      {
        invoiceNumber: invoice.invoice_number,
        amountDue: invoice.amount,
        currency: invoice.currency,
        dueDate: invoice.due_date,
        daysUntilDue: daysUntilDue,
        planName: invoice.plan_name,
        billingCycle: invoice.billing_cycle,
        invoicePdfBuffer: pdfBuffer,
        paymentUrl: `${process.env.FRONTEND_URL}/payment/${invoice.invoice_number}`
      }
    )

    await supabase
      .from('invoices')
      .update({
        reminder_status: `sent_${daysUntilDue}d`,
        last_reminder_sent_at: new Date().toISOString()
      })
      .eq('id', invoice.id)

    console.log(`Invoice reminder sent for ${invoice.invoice_number} (${daysUntilDue} days before due)`)
  } catch (error) {
    console.error(`Error sending invoice reminder for ${invoice.invoice_number}:`, error)
  }
}

async function processInvoice14DayReminders() {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 14)
  targetDate.setHours(0, 0, 0, 0)

  const targetDateEnd = new Date(targetDate)
  targetDateEnd.setDate(targetDateEnd.getDate() + 1)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, user:users(email, name)')
    .eq('status', 'sent')
    .eq('reminder_status', 'none')
    .gte('due_date', targetDate.toISOString())
    .lt('due_date', targetDateEnd.toISOString())

  if (invoices && invoices.length > 0) {
    console.log(`Processing ${invoices.length} invoices for 14-day reminder`)
    for (const invoice of invoices) {
      await sendInvoiceReminderWithPDF(invoice, 14)
    }
  }
}

async function processInvoice7DayReminders() {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 7)
  targetDate.setHours(0, 0, 0, 0)

  const targetDateEnd = new Date(targetDate)
  targetDateEnd.setDate(targetDateEnd.getDate() + 1)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, user:users(email, name)')
    .eq('status', 'sent')
    .eq('reminder_status', 'sent_14d')
    .gte('due_date', targetDate.toISOString())
    .lt('due_date', targetDateEnd.toISOString())

  if (invoices && invoices.length > 0) {
    console.log(`Processing ${invoices.length} invoices for 7-day reminder`)
    for (const invoice of invoices) {
      await sendInvoiceReminderWithPDF(invoice, 7)
    }
  }
}

async function processInvoice3DayReminders() {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 3)
  targetDate.setHours(0, 0, 0, 0)

  const targetDateEnd = new Date(targetDate)
  targetDateEnd.setDate(targetDateEnd.getDate() + 1)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, user:users(email, name)')
    .eq('status', 'sent')
    .eq('reminder_status', 'sent_7d')
    .gte('due_date', targetDate.toISOString())
    .lt('due_date', targetDateEnd.toISOString())

  if (invoices && invoices.length > 0) {
    console.log(`Processing ${invoices.length} invoices for 3-day reminder`)
    for (const invoice of invoices) {
      await sendInvoiceReminderWithPDF(invoice, 3)
    }
  }
}

async function processInvoice1DayReminders() {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 1)
  targetDate.setHours(0, 0, 0, 0)

  const targetDateEnd = new Date(targetDate)
  targetDateEnd.setDate(targetDateEnd.getDate() + 1)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, user:users(email, name)')
    .eq('status', 'sent')
    .eq('reminder_status', 'sent_3d')
    .gte('due_date', targetDate.toISOString())
    .lt('due_date', targetDateEnd.toISOString())

  if (invoices && invoices.length > 0) {
    console.log(`Processing ${invoices.length} invoices for 1-day reminder`)
    for (const invoice of invoices) {
      await sendInvoiceReminderWithPDF(invoice, 1)
    }
  }
}

async function suspendUsersWithOverdueInvoices() {
  const now = new Date()

  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('*, user:users(id, email, name, is_active)')
    .eq('status', 'sent')
    .lt('due_date', now.toISOString())

  if (overdueInvoices && overdueInvoices.length > 0) {
    console.log(`Processing ${overdueInvoices.length} overdue invoices for suspension`)

    for (const invoice of overdueInvoices) {
      await supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .eq('id', invoice.id)

      if (invoice.user.is_active) {
        await supabase
          .from('users')
          .update({
            is_active: false,
            suspended_at: now.toISOString(),
            suspension_reason: 'overdue_invoice'
          })
          .eq('id', invoice.user.id)

        try {
          const { sendAccountSuspendedEmail } = await import('../lib/email.js')
          await sendAccountSuspendedEmail(
            invoice.user.email,
            invoice.user.name,
            {
              invoiceNumber: invoice.invoice_number,
              dueDate: invoice.due_date,
              amountDue: invoice.amount,
              currency: invoice.currency
            }
          )
          console.log(`Suspension email sent to ${invoice.user.email}`)
        } catch (emailError) {
          console.error(`Failed to send suspension email to ${invoice.user.email}:`, emailError)
        }

        console.log(`User ${invoice.user.email} suspended for overdue invoice ${invoice.invoice_number}`)
      }
    }
  }
}

router.get('/invoice-reminders', async (req, res) => {
  try {
    console.log('Running invoice reminder cron jobs...')

    await processInvoice14DayReminders()
    await processInvoice7DayReminders()
    await processInvoice3DayReminders()
    await processInvoice1DayReminders()
    await suspendUsersWithOverdueInvoices()

    res.json({
      message: 'Invoice reminder jobs completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Invoice reminder cron error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router