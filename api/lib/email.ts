import sgMail from '@sendgrid/mail'
import { supabase } from './supabase'

interface EmailConfig {
  sendgrid_api_key: string
  sendgrid_from_email: string
  sendgrid_from_name: string
}

async function getEmailConfig(): Promise<EmailConfig> {
  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['sendgrid_api_key', 'sendgrid_from_email', 'sendgrid_from_name'])
    .is('tenant_id', null)

  const config: EmailConfig = {
    sendgrid_api_key: '',
    sendgrid_from_email: 'noreply@vaporpos.com',
    sendgrid_from_name: 'VaporPOS'
  }

  settings?.forEach(setting => {
    config[setting.key as keyof EmailConfig] = setting.value
  })

  return config
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const config = await getEmailConfig()

    if (!config.sendgrid_api_key) {
      console.warn('SendGrid API key not configured')
      return false
    }

    sgMail.setApiKey(config.sendgrid_api_key)

    await sgMail.send({
      to,
      from: {
        email: config.sendgrid_from_email,
        name: config.sendgrid_from_name
      },
      subject,
      html
    })

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  password: string,
  loginUrl: string
): Promise<boolean> {
  const subject = 'Welcome to VaporPOS - Your Account Credentials'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VaporPOS</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VaporPOS!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! Your VaporPOS account has been created. Here are your login credentials:</p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
        </div>
        
        <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">For security reasons, please change your password after your first login.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to VaporPOS</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

export async function sendReactivationEmail(
  email: string,
  name: string,
  planType: string,
  billingCycle: string,
  loginUrl: string
): Promise<boolean> {
  const subject = 'Your VaporPOS Trial Has Been Reactivated'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VaporPOS Trial Reactivated</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Trial Reactivated!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your VaporPOS trial has been reactivated with the following plan:</p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${planType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
          <p style="margin: 0;"><strong>Billing:</strong> ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}</p>
        </div>
        
        <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">You now have full access to all VaporPOS features. Don't miss this opportunity to streamline your vapor store operations!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Using VaporPOS</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

export async function sendTrialExtendedEmail(
  email: string,
  name: string,
  newExpiryDate: string,
  extendedBy: string,
  reason: string | null
): Promise<boolean> {
  const subject = 'Your VaporPOS Trial Has Been Extended'
  const formattedDate = new Date(newExpiryDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trial Extended - VaporPOS</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Trial Extended!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your VaporPOS trial has been extended by our team.</p>
        
        <div style="background: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>New Trial Expiry Date:</strong></p>
          <p style="margin: 0; font-size: 24px; color: #059669; font-weight: bold;">${formattedDate}</p>
        </div>
        
        ${reason ? `<p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;"><strong>Reason:</strong> ${reason}</p>` : ''}
        
        <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">You now have more time to explore all VaporPOS features. Make the most of this extended trial period!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Using VaporPOS</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

export async function sendTrialCancelledEmail(
  email: string,
  name: string,
  cancelledBy: string,
  reason: string | null
): Promise<boolean> {
  const subject = 'Your VaporPOS Trial Has Been Cancelled'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trial Cancelled - VaporPOS</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Trial Cancelled</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">We regret to inform you that your VaporPOS trial has been cancelled.</p>
        
        <div style="background: #fee2e2; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Cancelled by:</strong> ${cancelledBy}</p>
          ${reason ? `<p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">If you believe this was a mistake or would like to discuss further, please contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

export async function sendTrialActivatedEmail(
  email: string,
  name: string,
  planType: string,
  billingCycle: string,
  loginUrl: string
): Promise<boolean> {
  const subject = 'Welcome to VaporPOS - Your Paid Subscription is Active!'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VaporPOS</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VaporPOS!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! Your VaporPOS paid subscription is now active.</p>
        
        <div style="background: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${planType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
          <p style="margin: 0;"><strong>Billing Cycle:</strong> ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}</p>
        </div>
        
        <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">You now have full access to all VaporPOS features for your business.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to VaporPOS</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  data: {
    invoiceNumber: string
    amount: number
    currency: string
    paymentMethod: string
    planName: string
    billingCycle: string
    transactionDate: string
    nextBillingDate: string
    invoicePdfBuffer?: Buffer
    companyName?: string
  }
): Promise<boolean> {
  const subject = `[Invoice ${data.invoiceNumber}] Payment Confirmed - VaporPOS`

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful - VaporPOS</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">&#10003; Payment Successful!</h1>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>

        <p style="font-size: 16px; margin-bottom: 20px;">Thank you! Your payment has been confirmed and your subscription is now active.</p>

        <div style="background: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin-top: 0; margin-bottom: 15px; font-size: 16px;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Number</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px;">${data.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px;">${formatCurrency(data.amount, data.currency)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method</td>
              <td style="padding: 8px 0; text-align: right; font-size: 14px;">${data.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Transaction Date</td>
              <td style="padding: 8px 0; text-align: right; font-size: 14px;">${formatDate(data.transactionDate)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0; margin-bottom: 10px; font-size: 14px;">Subscription Details</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Plan:</strong> ${data.planName}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Billing Cycle:</strong> ${data.billingCycle.charAt(0).toUpperCase() + data.billingCycle.slice(1)}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Next Billing Date:</strong> ${formatDate(data.nextBillingDate)}</p>
        </div>

        <p style="font-size: 14px; color: #6b757d; margin-bottom: 20px;">
          Your invoice has been attached to this email as a PDF file. You can also download it anytime from your dashboard.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard"
             style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;">
            Access Dashboard
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">

        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          &#169; ${new Date().getFullYear()} VaporPOS. All rights reserved.<br>
          Questions? Contact support@vaporpos.com
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmailWithAttachment(email, subject, html, data.invoicePdfBuffer, `${data.invoiceNumber}.pdf`)
}

export async function sendBillReminderEmail(
  email: string,
  name: string,
  data: {
    invoiceNumber: string
    amountDue: number
    currency: string
    dueDate: string
    daysUntilDue: number
    planName: string
    billingCycle: string
    invoicePdfBuffer?: Buffer
    paymentUrl?: string
  }
): Promise<boolean> {
  const urgency = data.daysUntilDue <= 3 ? 'urgent' : data.daysUntilDue <= 7 ? 'warning' : 'info'

  const subjectTemplates = {
    info: `Reminder: Your subscription renews in ${data.daysUntilDue} days`,
    warning: `Action Required: Subscription renews in ${data.daysUntilDue} days`,
    urgent: `FINAL REMINDER: Payment due in ${data.daysUntilDue} day${data.daysUntilDue > 1 ? 's' : ''}`
  }

  const subject = subjectTemplates[urgency]
  const headerGradient = urgency === 'urgent'
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : urgency === 'warning'
      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'

  const urgencyMessage = urgency === 'urgent'
    ? 'Your payment is due immediately to avoid service interruption.'
    : urgency === 'warning'
      ? 'Please complete your payment to ensure uninterrupted service.'
      : 'This is a friendly reminder about your upcoming renewal.'

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const urgencyColor = urgency === 'urgent' ? '#dc2626' : urgency === 'warning' ? '#d97706' : '#2563eb'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${headerGradient}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          ${urgency === 'urgent' ? '&#9888; Payment Required' : urgency === 'warning' ? '&#9201; Time is Running Out' : '&#128200; Billing Reminder'}
        </h1>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>

        <p style="font-size: 16px; margin-bottom: 20px;">${urgencyMessage}</p>

        <div style="background: ${urgency === 'urgent' ? '#fee2e2' : urgency === 'warning' ? '#fef3c7' : '#dbeafe'};
                    padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Number</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px;">${data.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Due</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 18px; color: ${urgencyColor};">${formatCurrency(data.amountDue, data.currency)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px; color: ${urgency === 'urgent' ? '#dc2626' : '#374151'};">${formatDate(data.dueDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Days Remaining</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px; color: ${urgency === 'urgent' ? '#dc2626' : '#374151'};">${data.daysUntilDue} day${data.daysUntilDue > 1 ? 's' : ''}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0; margin-bottom: 10px; font-size: 14px;">Subscription Details</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Plan:</strong> ${data.planName}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Billing Cycle:</strong> ${data.billingCycle.charAt(0).toUpperCase() + data.billingCycle.slice(1)}</p>
        </div>

        ${urgency === 'urgent' ? `
        <div style="background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #dc2626; font-weight: bold; font-size: 14px;">
            &#9888; Your service will be suspended if payment is not received by the due date.
          </p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          ${data.paymentUrl ? `
          <a href="${data.paymentUrl}"
             style="background: ${urgency === 'urgent' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#3b82f6'};
                    color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;">
            Pay Now
          </a>
          ` : `
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/billing"
             style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;">
            View Invoice
          </a>
          `}
        </div>

        <p style="font-size: 14px; color: #6b757d; margin-bottom: 20px; text-align: center;">
          Please complete your payment before the due date to avoid any service interruption.<br>
          Your invoice has been attached to this email for your records.
        </p>

        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">

        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          &#169; ${new Date().getFullYear()} VaporPOS. All rights reserved.<br>
          Questions? Contact support@vaporpos.com
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmailWithAttachment(email, subject, html, data.invoicePdfBuffer, `Invoice-${data.invoiceNumber}.pdf`)
}

export async function sendAccountSuspendedEmail(
  email: string,
  name: string,
  data: {
    invoiceNumber: string
    dueDate: string
    amountDue: number
    currency: string
    paymentUrl?: string
  }
): Promise<boolean> {
  const subject = 'Account Suspended - Payment Required - VaporPOS'

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Suspended</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">&#9888; Account Suspended</h1>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>

        <p style="font-size: 16px; margin-bottom: 20px;">Your VaporPOS account has been temporarily suspended due to non-payment.</p>

        <div style="background: #fee2e2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #dc2626; margin-top: 0; margin-bottom: 15px; font-size: 16px;">Why was my account suspended?</h3>
          <p style="margin: 5px 0; font-size: 14px;">Your subscription payment for invoice <strong>${data.invoiceNumber}</strong> is overdue.</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Amount Due:</strong> ${formatCurrency(data.amountDue, data.currency)}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Due Date:</strong> ${formatDate(data.dueDate)}</p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin-top: 0; margin-bottom: 10px; font-size: 14px;">How to restore your account?</h3>
          <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
            <li style="margin: 5px 0;">Complete your payment</li>
            <li style="margin: 5px 0;">Contact our support team to confirm payment</li>
            <li style="margin: 5px 0;">Your account will be reactivated within 24 hours</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:support@vaporpos.com"
             style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;">
            Contact Support
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">

        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          &#169; ${new Date().getFullYear()} VaporPOS. All rights reserved.<br>
          Questions? Contact support@vaporpos.com
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

export async function sendEmailWithAttachment(
  to: string,
  subject: string,
  html: string,
  pdfBuffer?: Buffer,
  filename?: string
): Promise<boolean> {
  try {
    const config = await getEmailConfig()

    if (!config.sendgrid_api_key) {
      console.warn('SendGrid API key not configured')
      return false
    }

    sgMail.setApiKey(config.sendgrid_api_key)

    const msg: {
      to: string
      from: { email: string; name: string }
      subject: string
      html: string
      attachments?: Array<{
        content: string
        filename: string
        type: string
        disposition: string
      }>
    } = {
      to,
      from: {
        email: config.sendgrid_from_email,
        name: config.sendgrid_from_name
      },
      subject,
      html
    }

    if (pdfBuffer && filename) {
      msg.attachments = [
        {
          content: pdfBuffer.toString('base64'),
          filename: filename,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    }

    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Error sending email with attachment:', error)
    return false
  }
}
