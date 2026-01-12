import { useState } from 'react'
import { Printer, X, Eye } from 'lucide-react'
import { generateReceiptHTML, printReceipt, ReceiptData, ReceiptSettings } from '../utils/receiptGenerator'
import { formatPhoneForDisplay } from '../utils/phone'

interface ReceiptPreviewProps {
  data: ReceiptData
  settings: ReceiptSettings
  isOpen: boolean
  onClose: () => void
  onPrint?: () => void
}

export function ReceiptPreview({
  data,
  settings,
  isOpen,
  onClose,
  onPrint
}: ReceiptPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'whatsapp'>('preview')

  const receiptHTML = generateReceiptHTML(data, settings)
  const previewStyle: React.CSSProperties = {
    width: settings.paperSize === '58mm' ? '200px' : '280px',
    fontSize: settings.paperSize === '58mm' ? '10px' : '11px',
    fontFamily: "'Courier New', Consolas, monospace",
    lineHeight: '1.3',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    overflow: 'hidden'
  }

  const handlePrint = () => {
    printReceipt(receiptHTML)
    onPrint?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Preview Struk</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'whatsapp'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            WhatsApp
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'preview' ? (
            <div className="flex justify-center">
              <div style={previewStyle}>
                <div dangerouslySetInnerHTML={{ __html: receiptHTML }} />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">WhatsApp Preview:</div>
              <div className="bg-white rounded-lg p-3 border text-sm font-sans whitespace-pre-wrap">
{`STRUK PEMBAYARAN
${data.store.name}
--------------------
Tgl: ${new Date(data.transaction.createdAt).toLocaleDateString('id-ID')}
TRX: ${data.transaction.id.slice(0, 8).toUpperCase()}
--------------------
${data.items.map(i => `${i.name} x${i.quantity} = Rp${i.subtotal.toLocaleString('id-ID')}`).join('\n')}
--------------------
TOTAL: Rp${data.payment.total.toLocaleString('id-ID')}
--------------------
Kasir: ${data.transaction.cashierName}
--------------------
Terima kasih!
${data.store.name}`}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-500">
            Ukuran: {settings.paperSize}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ReceiptPreviewButtonProps {
  data: ReceiptData
  settings: ReceiptSettings
  variant?: 'button' | 'icon'
  children?: React.ReactNode
}

export function ReceiptPreviewButton({
  data,
  settings,
  variant = 'button',
  children
}: ReceiptPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Preview Struk"
        >
          <Eye className="w-4 h-4" />
        </button>
        <ReceiptPreview
          data={data}
          settings={settings}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Eye className="w-4 h-4" />
        {children || 'Preview Struk'}
      </button>
      <ReceiptPreview
        data={data}
        settings={settings}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
