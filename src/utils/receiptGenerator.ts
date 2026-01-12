/**
 * Receipt Generator Utility
 * Generate thermal receipt HTML for 58mm and 80mm paper sizes
 */

export interface ReceiptSettings {
  paperSize: '58mm' | '80mm'
  showLogo: boolean
  showBarcode: boolean
  footerText: string
  thankYouMessage: string
  taxRate: number
}

export interface ReceiptData {
  store: {
    name: string
    address: string
    phone: string
    logoUrl?: string
  }
  transaction: {
    id: string
    createdAt: string
    cashierName: string
    customerName?: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
  }>
  payment: {
    subtotal: number
    taxAmount: number
    total: number
    amountPaid: number
    change: number
    method: string
  }
}

function getCharsPerLine(paperSize: '58mm' | '80mm'): number {
  return paperSize === '58mm' ? 32 : 42
}

function getFontSize(paperSize: '58mm' | '80mm'): number {
  return paperSize === '58mm' ? 10 : 11
}

function formatLine(text: string, align: 'left' | 'right' | 'center' = 'left', charsPerLine: number): string {
  const pad = charsPerLine - text.length
  if (pad < 0) {
    return text.slice(0, charsPerLine)
  }
  if (align === 'right') {
    return ' '.repeat(pad) + text
  } else if (align === 'center') {
    const left = Math.floor(pad / 2)
    return ' '.repeat(left) + text + ' '.repeat(pad - left)
  }
  return text + ' '.repeat(pad)
}

function formatPrice(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID')
}

function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function generateReceiptHTML(data: ReceiptData, settings: ReceiptSettings): string {
  const charsPerLine = getCharsPerLine(settings.paperSize)
  const fontSize = getFontSize(settings.paperSize)
  
  const styles = `
    @page { margin: 0; size: ${settings.paperSize} auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', 'Consolas', monospace; 
      font-size: ${fontSize}px;
      width: ${settings.paperSize};
      margin: 0;
      padding: 4px;
      line-height: 1.3;
      color: #000;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .line { border-bottom: 1px dashed #000; margin: 2px 0; }
    .double-line { border-bottom: 1px solid #000; margin: 2px 0; }
    .item { display: flex; justify-content: space-between; margin: 1px 0; }
    .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .item-qty { text-align: center; min-width: 50px; }
    .item-price { text-align: right; min-width: 70px; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; }
  `
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Struk Pembayaran</title>
  <style>${styles}</style>
</head>
<body>
`
  
  if (settings.showLogo && data.store.logoUrl) {
    html += `<div class="text-center"><img src="${data.store.logoUrl}" style="max-width: ${settings.paperSize === '58mm' ? '40px' : '60px'}; height: auto;"></div>`
  }
  
  html += `<div class="text-center bold">${data.store.name}</div>`
  if (data.store.address) {
    html += `<div class="text-center">${data.store.address}</div>`
  }
  if (data.store.phone) {
    html += `<div class="text-center">${data.store.phone}</div>`
  }
  
  html += `<div class="line"></div>`
  
  const dateStr = formatDate(data.transaction.createdAt)
  const timeStr = formatTime(data.transaction.createdAt)
  html += `<div>${dateStr}  ${timeStr}</div>`
  html += `<div>TRX: ${data.transaction.id.slice(0, 8).toUpperCase()}</div>`
  if (data.transaction.customerName) {
    html += `<div>Cust: ${data.transaction.customerName}</div>`
  }
  
  html += `<div class="line"></div>`
  
  data.items.forEach(item => {
    const name = item.name.length > 18 ? item.name.slice(0, 18) + '..' : item.name
    html += `<div>${name} x${item.quantity}</div>`
    html += `<div class="text-right">${formatPrice(item.subtotal)}</div>`
  })
  
  html += `<div class="line"></div>`
  
  html += `<div>${formatLine('SUBTOTAL:', 'left', charsPerLine)}${formatPrice(data.payment.subtotal)}</div>`
  html += `<div>${formatLine(`PPN (${settings.taxRate}%):`, 'left', charsPerLine)}${formatPrice(data.payment.taxAmount)}</div>`
  html += `<div class="double-line"></div>`
  html += `<div class="total-row"><span>${formatLine('TOTAL:', 'left', charsPerLine)}</span><span>${formatPrice(data.payment.total)}</span></div>`
  
  html += `<div>${formatLine('TUNAI:', 'left', charsPerLine)}${formatPrice(data.payment.amountPaid)}</div>`
  html += `<div>${formatLine('KEMBALI:', 'left', charsPerLine)}${formatPrice(data.payment.change)}</div>`
  
  html += `<div class="line"></div>`
  
  html += `<div class="text-center">${data.transaction.cashierName}</div>`
  
  if (settings.thankYouMessage) {
    html += `<div class="text-center">${settings.thankYouMessage}</div>`
  }
  
  if (settings.footerText) {
    html += `<div class="text-center" style="font-size: ${fontSize - 1}px;">${settings.footerText}</div>`
  }
  
  if (settings.showBarcode) {
    const barcodeId = data.transaction.id.slice(0, 8).toUpperCase()
    html += `<div class="text-center" style="margin-top: 8px;">`
    html += `<div style="font-family: 'Libre Barcode 39', monospace; font-size: 24px;">${barcodeId}</div>`
    html += `<div style="font-size: 8px;">${barcodeId}</div>`
    html += `</div>`
  }
  
  html += `<div class="double-line"></div>`
  html += `</body></html>`
  
  return html
}

export function printReceipt(html: string): void {
  const printWindow = window.open('', '_blank', `width=350,height=600`)
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }
}

export function downloadReceiptAsPDF(html: string, _filename: string): void {
  const printWindow = window.open('', '_blank', `width=350,height=600`)
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }
}

export function getReceiptDimensions(paperSize: '58mm' | '80mm'): { width: string; fontSize: number } {
  return {
    width: paperSize,
    fontSize: getFontSize(paperSize)
  }
}
