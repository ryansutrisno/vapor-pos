/* eslint-disable @typescript-eslint/no-unused-vars */
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import {
  ArrowUpDown,
  CreditCard,
  Filter,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  User,
  MessageCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'
import { formatPhoneForStorage } from '@/utils/phone'
import { generateReceiptHTML } from '@/utils/receiptGenerator'

interface Transaction {
  id: string
  store_id: string
  cashier_id: string
  customer_name?: string
  customer_phone?: string
  total_amount: number
  payment_method: 'cash' | 'card' | 'digital'
  status: 'completed' | 'refunded' | 'cancelled'
  created_at: string
  updated_at: string
  tenant_id: string
  items?: TransactionItem[]
}

interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function Transactions() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Dialog states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  
  // Receipt settings
  const [receiptSettings, setReceiptSettings] = useState({
    paperSize: '80mm' as '58mm' | '80mm',
    showLogo: false,
    showBarcode: false,
    footerText: '',
    thankYouMessage: '',
    taxRate: 11
  })

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
      setFilteredTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Gagal memuat transaksi')
    }
  }

  useEffect(() => {
    if (user) {
      fetchTransactions().finally(() => setLoading(false))
      fetchReceiptSettings()
    }
  }, [user])

  const fetchReceiptSettings = async () => {
    if (!user?.tenant_id) return
    
    try {
      const { data: settings } = await supabase
        .from('tenant_settings')
        .select('receipt_paper_size, receipt_show_logo, receipt_show_qrcode, receipt_footer_text, receipt_thank_you_message, tax_rate')
        .eq('tenant_id', user.tenant_id)
        .single()
      
      if (settings) {
        setReceiptSettings({
          paperSize: (settings.receipt_paper_size as '58mm' | '80mm') || '80mm',
          showLogo: settings.receipt_show_logo || false,
          showBarcode: settings.receipt_show_qrcode || false,
          footerText: settings.receipt_footer_text || '',
          thankYouMessage: settings.receipt_thank_you_message || '',
          taxRate: settings.tax_rate || 11
        })
      }
    } catch (error) {
      console.error('Error fetching receipt settings:', error)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.created_at)

        switch (dateFilter) {
          case 'today':
            return transactionDate >= today
          case 'week': {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return transactionDate >= weekAgo
          }
          case 'month': {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return transactionDate >= monthAgo
          }
          default:
            return true
        }
      })
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.payment_method === paymentFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Transaction]
      const bValue = b[sortBy as keyof Transaction]

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, dateFilter, paymentFilter, statusFilter, sortBy, sortOrder])

  // Handle refund
  const handleRefund = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (error) throw error

      toast.success('Transaksi berhasil direfund')
      setIsRefundDialogOpen(false)
      fetchTransactions()
    } catch (error) {
      console.error('Error refunding transaction:', error)
      toast.error('Gagal melakukan refund')
    }
  }

  // Handle print receipt
  const handlePrintReceipt = (transaction: Transaction) => {
    const receiptData = {
      store: {
        name: 'Vapor Store',
        address: '',
        phone: ''
      },
      transaction: {
        id: transaction.id,
        createdAt: transaction.created_at,
        cashierName: user?.name || 'Kasir',
        customerName: transaction.customer_name || undefined
      },
      items: transaction.items?.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price,
        subtotal: item.total_price
      })) || [],
      payment: {
        subtotal: transaction.total_amount,
        taxAmount: 0,
        total: transaction.total_amount,
        amountPaid: transaction.total_amount,
        change: 0,
        method: transaction.payment_method
      }
    }

    const html = generateReceiptHTML(receiptData, receiptSettings)
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 300)
    }
  }

  // Handle resend WhatsApp
  const handleResendWhatsApp = async (transaction: Transaction) => {
    if (!transaction.customer_phone) {
      toast.error('Nomor WhatsApp tidak tersedia untuk transaksi ini')
      return
    }

    try {
      const res = await fetch('/api/whatsapp/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: user?.tenant_id,
          transaction_id: transaction.id,
          phone: formatPhoneForStorage(transaction.customer_phone)
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        if (data.via === 'wa_link' && data.link) {
          window.open(data.link, '_blank')
          toast.success('Link WhatsApp berhasil dibuat!')
        } else {
          toast.success('Struk berhasil dikirim ulang via WhatsApp!')
        }
      } else {
        toast.error(data.error || 'Gagal mengirim struk')
      }
    } catch (error) {
      console.error('WhatsApp error:', error)
      toast.error('Gagal mengirim struk via WhatsApp')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Riwayat Transaksi</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola dan pantau semua transaksi penjualan</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Cari transaksi atau pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tanggal</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">30 Hari Terakhir</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Filter */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="card">Kartu</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="refunded">Refund</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Terbaru</SelectItem>
                <SelectItem value="created_at-asc">Terlama</SelectItem>
                <SelectItem value="total_amount-desc">Nilai Tertinggi</SelectItem>
                <SelectItem value="total_amount-asc">Nilai Terendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Dari {transactions.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari transaksi yang difilter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(filteredTransactions.length > 0
                ? filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0) / filteredTransactions.length
                : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Unik</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredTransactions.map(t => t.customer_name).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Pelanggan berbeda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaksi ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm || dateFilter !== 'all' || paymentFilter !== 'all' || statusFilter !== 'all'
                  ? 'Tidak ada transaksi yang sesuai dengan filter'
                  : 'Belum ada transaksi'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        {transaction.customer_name || 'Pelanggan Umum'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(transaction.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.payment_method === 'cash' && '💵 Tunai'}
                          {transaction.payment_method === 'card' && '💳 Kartu'}
                          {transaction.payment_method === 'digital' && '📱 Digital'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.status === 'completed' ? 'default' :
                            transaction.status === 'refunded' ? 'destructive' : 'secondary'}
                        >
                          {transaction.status === 'completed' && '✅ Selesai'}
                          {transaction.status === 'refunded' && '↩️ Refund'}
                          {transaction.status === 'cancelled' && '❌ Batal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setIsDetailDialogOpen(true)
                            }}
                          >
                            Detail
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintReceipt(transaction)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          {transaction.customer_phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleResendWhatsApp(transaction)}
                              title="Kirim Ulang WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {transaction.status === 'completed' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  Refund
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Refund</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin melakukan refund untuk transaksi ini?
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRefund(transaction.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Ya, Refund
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              Informasi lengkap transaksi {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID Transaksi</Label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label>Tanggal</Label>
                  <p>{formatDate(selectedTransaction.created_at)}</p>
                </div>
                <div>
                  <Label>Pelanggan</Label>
                  <p>{selectedTransaction.customer_name || 'Pelanggan Umum'}</p>
                </div>
                <div>
                  <Label>Total</Label>
                  <p className="font-bold text-lg">{formatPrice(selectedTransaction.total_amount)}</p>
                </div>
                <div>
                  <Label>Metode Pembayaran</Label>
                  <p>{selectedTransaction.payment_method}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant={selectedTransaction.status === 'completed' ? 'default' :
                      selectedTransaction.status === 'refunded' ? 'destructive' : 'secondary'}
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                <div>
                  <Label>Detail Pembelian</Label>
                  <div className="mt-2 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTransaction.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatPrice(item.unit_price)}</TableCell>
                            <TableCell>{formatPrice(item.total_price)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
            {selectedTransaction && (
              <Button onClick={() => handlePrintReceipt(selectedTransaction)}>
                <Printer className="w-4 h-4 mr-2" />
                Cetak Struk
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}