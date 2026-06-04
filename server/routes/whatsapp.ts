/**
 * WhatsApp API Routes
 * Send receipt via Fonnte or wa.me fallback
 */
import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { sendViaFonnte, formatPhoneForFonnte, isValidFonnteResponse, getFonnteErrorMessage } from '../services/fonnte'

const router = Router()

function formatWhatsAppMessage(data: {
  storeName: string
  storeAddress: string
  storePhone: string
  transactionId: string
  date: string
  items: Array<{ name: string; quantity: number; subtotal: number }>
  total: number
  cashierName: string
}): string {
  const dateStr = new Date(data.date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

  let message = `*STRUK PEMBAYARAN*\n`
  message += `${data.storeName}\n`
  message += `─────────────────\n`
  message += `Tgl: ${dateStr}\n`
  message += `TRX: ${data.transactionId.slice(0, 8).toUpperCase()}\n`
  message += `─────────────────\n`

  data.items.forEach(item => {
    const subtotal = item.subtotal.toLocaleString('id-ID')
    message += `${item.name} x${item.quantity} = Rp${subtotal}\n`
  })

  message += `─────────────────\n`
  message += `*TOTAL: Rp${data.total.toLocaleString('id-ID')}*\n`
  message += `─────────────────\n`
  message += `Kasir: ${data.cashierName}\n`
  message += `─────────────────\n`
  message += `Terima kasih!\n`
  message += `${data.storeName}`

  return message
}

function generateWALink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const formattedPhone = cleaned.startsWith('62') ? cleaned : '62' + cleaned.slice(1)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

router.post('/send-receipt', async (req, res) => {
  try {
    const { tenant_id, transaction_id, phone, force_wa_link } = req.body

    if (!tenant_id || !transaction_id || !phone) {
      return res.status(400).json({
        error: 'tenant_id, transaction_id, dan phone wajib diisi'
      })
    }

    const { data: settings, error: settingsError } = await supabase
      .from('tenant_settings')
      .select('fonnte_api_key, use_fonnte, use_wa_link_fallback')
      .eq('tenant_id', tenant_id)
      .single()

    if (settingsError) {
      console.error('Error fetching tenant settings:', settingsError)
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select(`
        id,
        created_at,
        total_amount,
        customer_name,
        cashier_name,
        payment_method,
        transaction_items (
          id,
          product_name,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .eq('id', transaction_id)
      .single()

    if (txError || !transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' })
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', tenant_id)
      .single()

    if (tenantError) {
      console.error('Error fetching tenant:', tenantError)
    }

    const storeInfo = {
      storeName: tenant?.name || 'Vapor Store',
      storeAddress: '',
      storePhone: '',
      transactionId: transaction.id,
      date: transaction.created_at,
      items: transaction.transaction_items.map((item: { product_name: string; quantity: number; subtotal: number }) => ({
        name: item.product_name,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      total: transaction.total_amount,
      cashierName: transaction.cashier_name || 'Kasir'
    }

    const message = formatWhatsAppMessage(storeInfo)

    const useFonnte = settings?.use_fonnte && settings?.fonnte_api_key && !force_wa_link
    const useWALinkFallback = settings?.use_wa_link_fallback !== false

    if (useFonnte && settings.fonnte_api_key) {
      const fonntePayload = {
        target: formatPhoneForFonnte(phone),
        message: message,
        countryCode: '62'
      }

      const fonnteResult = await sendViaFonnte(settings.fonnte_api_key, fonntePayload)

      if (isValidFonnteResponse(fonnteResult)) {
        await supabase
          .from('transactions')
          .update({
            wa_sent: true,
            wa_message_id: fonnteResult.id[0],
            wa_phone: phone
          })
          .eq('id', transaction_id)

        return res.json({
          success: true,
          via: 'fonnte',
          messageId: fonnteResult.id[0],
          message: 'Struk berhasil dikirim via WhatsApp'
        })
      } else {
        const errorMsg = getFonnteErrorMessage(fonnteResult)
        console.error('Fonnte error:', fonnteResult)

        if (useWALinkFallback) {
          const waLink = generateWALink(phone, message)
          return res.json({
            success: true,
            via: 'wa_link',
            link: waLink,
            warning: `Fonnte gagal: ${errorMsg}. Menggunakan wa.me sebagai alternatif.`
          })
        }

        return res.status(500).json({
          success: false,
          error: errorMsg
        })
      }
    } else if (useWALinkFallback) {
      const waLink = generateWALink(phone, message)
      return res.json({
        success: true,
        via: 'wa_link',
        link: waLink,
        message: 'Link WhatsApp berhasil dibuat'
      })
    } else {
      return res.status(400).json({
        success: false,
        error: 'Tidak ada provider WhatsApp yang dikonfigurasi'
      })
    }
  } catch (error) {
    console.error('Error sending WhatsApp receipt:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/send-message', async (req, res) => {
  try {
    const { tenant_id, phone, message } = req.body

    if (!tenant_id || !phone || !message) {
      return res.status(400).json({
        error: 'tenant_id, phone, dan message wajib diisi'
      })
    }

    const { data: settings } = await supabase
      .from('tenant_settings')
      .select('fonnte_api_key, use_fonnte')
      .eq('tenant_id', tenant_id)
      .single()

    if (settings?.use_fonnte && settings?.fonnte_api_key) {
      const fonntePayload = {
        target: formatPhoneForFonnte(phone),
        message: message,
        countryCode: '62'
      }

      const fonnteResult = await sendViaFonnte(settings.fonnte_api_key, fonntePayload)

      if (isValidFonnteResponse(fonnteResult)) {
        return res.json({
          success: true,
          via: 'fonnte',
          messageId: fonnteResult.id[0]
        })
      } else {
        return res.status(500).json({
          success: false,
          error: getFonnteErrorMessage(fonnteResult)
        })
      }
    }

    const waLink = generateWALink(phone, message)
    return res.json({
      success: true,
      via: 'wa_link',
      link: waLink
    })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/preview-message', async (req, res) => {
  try {
    const { store_name, transaction_id } = req.query

    if (!store_name || !transaction_id) {
      return res.status(400).json({
        error: 'store_name dan transaction_id wajib diisi'
      })
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        id,
        created_at,
        total_amount,
        customer_name,
        cashier_name,
        transaction_items (
          product_name,
          quantity,
          subtotal
        )
      `)
      .eq('id', transaction_id)
      .single()

    if (error || !transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' })
    }

    const message = formatWhatsAppMessage({
      storeName: store_name as string,
      storeAddress: '',
      storePhone: '',
      transactionId: transaction.id,
      date: transaction.created_at,
      items: transaction.transaction_items.map((item: { product_name: string; quantity: number; subtotal: number }) => ({
        name: item.product_name,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      total: transaction.total_amount,
      cashierName: transaction.cashier_name || 'Kasir'
    })

    res.json({ message })
  } catch (error) {
    console.error('Error generating message preview:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
