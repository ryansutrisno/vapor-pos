/**
 * WhatsApp Receipt Utility
 * Format receipt message for WhatsApp
 */

export interface WhatsAppReceiptData {
  storeName: string
  storeAddress?: string
  storePhone?: string
  transactionId: string
  date: string
  items: Array<{
    name: string
    quantity: number
    subtotal: number
  }>
  total: number
  cashierName: string
  customerName?: string
}

export function formatWhatsAppReceipt(data: WhatsAppReceiptData): string {
  const dateObj = new Date(data.date)
  const dateStr = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const timeStr = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })

  let message = `*STRUK PEMBAYARAN*\n`
  message += `${data.storeName}\n`
  message += `─────────────────\n`
  message += `Tgl: ${dateStr} ${timeStr}\n`
  message += `TRX: ${data.transactionId.slice(0, 8).toUpperCase()}\n`
  
  if (data.customerName) {
    message += `Cust: ${data.customerName}\n`
  }
  
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

export function formatWALink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  let formattedPhone = cleaned
  if (cleaned.startsWith('0')) {
    formattedPhone = '62' + cleaned.slice(1)
  } else if (!cleaned.startsWith('62')) {
    formattedPhone = '62' + cleaned
  }

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

export function openWhatsAppLink(phone: string, message: string): void {
  const link = formatWALink(phone, message)
  window.open(link, '_blank')
}

export function formatWhatsAppQuickMessage(
  storeName: string,
  transactionId: string,
  total: number
): string {
  return `Halo ${storeName}!

Berikut struk pembelian Anda:
TRX: ${transactionId.slice(0, 8).toUpperCase()}
Total: Rp${total.toLocaleString('id-ID')}

Terima kasih!`
}

export function createWhatsAppBroadcastMessage(
  storeName: string,
  message: string,
  promoLink?: string
): string {
  let broadcast = `*PROMO DARI ${storeName.toUpperCase()}*\n\n`
  broadcast += `${message}\n\n`
  
  if (promoLink) {
    broadcast += `Link: ${promoLink}\n\n`
  }
  
  broadcast += `--\n`
  broadcast += `${storeName}`
  
  return broadcast
}
