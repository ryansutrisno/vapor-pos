import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calculator, ShoppingCart, Users, TrendingUp, Plus, Search, Minus, Building2, Printer, MessageCircle, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useStore, useStoreId } from '@/contexts/StoreContext'
import { useCash } from '@/contexts/CashContext'
import CashSessionStatus from '@/components/CashSessionStatus'
import { CustomerSearch, CustomerDisplay } from '@/components/CustomerSearch'
import { ReceiptPreview } from '@/components/ReceiptPreview'
import { generateReceiptHTML, printReceipt } from '@/utils/receiptGenerator'
import { formatPhoneForStorage } from '@/utils/phone'
import type { Product, Transaction } from '@/lib/supabase'
import { toast } from '@/lib/toast'

interface CartItem {
  product: Product
  quantity: number
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

interface DashboardStats {
  todaySales: number
  todayTransactions: number
  todayCustomers: number
  averageTransaction: number
}

interface ReceiptSettings {
  paperSize: '58mm' | '80mm'
  showLogo: boolean
  showBarcode: boolean
  footerText: string
  thankYouMessage: string
  taxRate: number
}

const categoryLabels = {
  device: 'Device',
  liquid: 'Liquid',
  peripheral: 'Peripheral',
  service: 'Service'
}

export default function KasirDashboard() {
  const { user } = useAuthStore()
  const { selectedStore } = useStore()
  const storeId = useStoreId()
  const { recordSale, isSessionActive } = useCash()
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayTransactions: 0,
    todayCustomers: 0,
    averageTransaction: 0
  })
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  
  // New state for print & WhatsApp options
  const [shouldPrint, setShouldPrint] = useState(false)
  const [shouldSendWhatsApp, setShouldSendWhatsApp] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerPhone, setCustomerPhone] = useState('')
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    paperSize: '80mm',
    showLogo: false,
    showBarcode: false,
    footerText: '',
    thankYouMessage: '',
    taxRate: 11
  })

  const fetchDashboardData = React.useCallback(async () => {
    if (!user) return

    try {
      // For kasir role, filter by selected store
      const tenantId = user.tenant_id
      
      // Fetch products available for this store/tenant
      let productsQuery = supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .gt('stock', 0)
        .order('name')
      
      // If kasir has selected store, filter by store_id
      if (user.role === 'kasir' && storeId) {
        productsQuery = productsQuery.eq('store_id', storeId)
      }
      
      const { data: productsData } = await productsQuery
      setProducts(productsData || [])

      // Fetch today's transactions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let todayTransactionsQuery = supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('created_at', today.toISOString())
      
      // If kasir has selected store, filter by store_id
      if (user.role === 'kasir' && storeId) {
        todayTransactionsQuery = todayTransactionsQuery.eq('store_id', storeId)
      }
      
      const { data: todayTransactions } = await todayTransactionsQuery

      // Fetch recent transactions
      let recentTransQuery = supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(5)
      
      // If kasir has selected store, filter by store_id
      if (user.role === 'kasir' && storeId) {
        recentTransQuery = recentTransQuery.eq('store_id', storeId)
      }
      
      const { data: recentTrans } = await recentTransQuery

      setRecentTransactions(recentTrans || [])

      // Calculate stats
      const todaySales = todayTransactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0
      const todayCount = todayTransactions?.length || 0
      const uniqueCustomers = new Set(todayTransactions?.map(t => t.customer_name).filter(Boolean)).size
      const averageTransaction = todayCount > 0 ? todaySales / todayCount : 0

      setStats({
        todaySales,
        todayTransactions: todayCount,
        todayCustomers: uniqueCustomers,
        averageTransaction
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchReceiptSettings()
    }
  }, [user, fetchDashboardData])

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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerPhone(customer.phone)
    if (!customerName) {
      setCustomerName(customer.name)
    }
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerPhone('')
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id)
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
        return prev
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prev.filter(item => item.product.id !== productId)
    })
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setSelectedCustomer(null)
    setCustomerPhone('')
    setShouldPrint(false)
    setShouldSendWhatsApp(false)
  }

  const getReceiptData = (transaction: any) => {
    const taxRate = receiptSettings.taxRate / 100
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const taxAmount = Math.round(subtotal * taxRate)
    const total = subtotal + taxAmount

    return {
      store: {
        name: selectedStore?.name || 'Vapor Store',
        address: selectedStore?.address || '',
        phone: ''
      },
      transaction: {
        id: transaction.id,
        createdAt: transaction.created_at,
        cashierName: user?.name || 'Kasir',
        customerName: customerName || undefined
      },
      items: cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      })),
      payment: {
        subtotal,
        taxAmount,
        total,
        amountPaid: total,
        change: 0,
        method: 'cash'
      }
    }
  }

  const handlePrintReceipt = (transaction: any) => {
    const receiptData = getReceiptData(transaction)
    const html = generateReceiptHTML(receiptData, receiptSettings)
    printReceipt(html)
  }

  const handleSendWhatsApp = async (transactionId: string, phone: string) => {
    try {
      const res = await fetch('/api/whatsapp/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: user?.tenant_id,
          transaction_id: transactionId,
          phone: formatPhoneForStorage(phone)
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        if (data.via === 'wa_link' && data.link) {
          window.open(data.link, '_blank')
          toast.success('Link WhatsApp berhasil dibuat!')
        } else {
          toast.success('Struk berhasil dikirim via WhatsApp!')
        }
      } else {
        toast.error(data.error || 'Gagal mengirim struk')
      }
    } catch (error) {
      console.error('WhatsApp error:', error)
      toast.error('Gagal mengirim struk via WhatsApp')
    }
  }

  const processTransaction = async () => {
    if (cart.length === 0) return

    if (shouldSendWhatsApp && !customerPhone) {
      toast.error('Masukkan nomor WhatsApp untuk pengiriman struk!')
      return
    }

    try {
      const taxRate = receiptSettings.taxRate / 100
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      const taxAmount = Math.round(subtotal * taxRate)
      const total = subtotal + taxAmount

      // Get or create customer
      let customerId: string | undefined
      if (customerPhone) {
        try {
          const customerRes = await fetch('/api/customers/upsert-by-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenant_id: user?.tenant_id,
              name: customerName || 'Pelanggan',
              phone: formatPhoneForStorage(customerPhone)
            })
          })
          const customerData = await customerRes.json()
          if (customerData.success && customerData.customer) {
            customerId = customerData.customer.id
          }
        } catch (error) {
          console.error('Error creating customer:', error)
        }
      }

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          store_id: cart[0].product.store_id,
          cashier_id: user.id,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          customer_id: customerId,
          total_amount: total,
          subtotal: subtotal,
          tax_amount: taxAmount,
          payment_method: 'cash',
          tenant_id: user.tenant_id
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create transaction items
      const transactionItems = cart.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id)
      }

      // Record sale in cash session if active
      if (isSessionActive && transaction.payment_method === 'cash') {
        await recordSale(total, transaction.id)
      }

      // Handle print receipt
      if (shouldPrint) {
        handlePrintReceipt(transaction)
      }

      // Handle WhatsApp
      if (shouldSendWhatsApp && customerPhone) {
        await handleSendWhatsApp(transaction.id, customerPhone)
      }

      // Clear cart and refresh data
      clearCart()
      fetchDashboardData()
      toast.success('Transaksi berhasil!', {
        description: `Total: ${formatPrice(total)} - ${cart.length} item terjual`
      })
    } catch (error) {
      console.error('Error processing transaction:', error)
      toast.error('Terjadi kesalahan saat memproses transaksi', {
        description: 'Silakan coba lagi atau hubungi administrator'
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">POS Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300">Point of Sales - Kasir</p>
        {selectedStore && (
          <div className="flex items-center gap-2 mt-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">{selectedStore?.name}</span>
          </div>
        )}
      </div>

      {/* Cash Session Status */}
      <CashSessionStatus />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.todaySales)}</div>
            <p className="text-xs text-muted-foreground">
              Total penjualan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Transaksi hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Pelanggan unik
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.averageTransaction)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Produk</CardTitle>
                <CardDescription>
                  Pilih produk untuk ditambahkan ke keranjang
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" onClick={() => addToCart(product)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{product.name}</h3>
                    <Badge variant="outline">
                      {categoryLabels[product.category]}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-blue-600 mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Stok: {product.stock} unit
                    </span>
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle>Keranjang</CardTitle>
            <CardDescription>
              {cart.length} item dalam keranjang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Name & Phone */}
            <div>
              <label className="text-sm font-medium">Nama Pelanggan (Opsional)</label>
              <Input
                placeholder="Nama pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Receipt Options */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Opsi Struk
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldPrint}
                  onChange={(e) => setShouldPrint(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Cetak Struk</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldSendWhatsApp}
                  onChange={(e) => {
                    setShouldSendWhatsApp(e.target.checked)
                    if (!e.target.checked) {
                      setSelectedCustomer(null)
                      setCustomerPhone('')
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Kirim via WhatsApp
                </span>
              </label>
            </div>

            {/* Customer Search - muncul jika WhatsApp dipilih */}
            {shouldSendWhatsApp && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Pelanggan (untuk WhatsApp)</label>
                {selectedCustomer ? (
                  <CustomerDisplay
                    customer={selectedCustomer}
                    onClear={handleClearCustomer}
                    onEdit={() => setSelectedCustomer(null)}
                  />
                ) : (
                  <CustomerSearch
                    tenantId={user?.tenant_id || ''}
                    value={customerPhone}
                    onSelect={handleCustomerSelect}
                    onChange={setCustomerPhone}
                    placeholder="Cari customer atau input nomor..."
                  />
                )}
                {customerPhone && !selectedCustomer && (
                  <Input
                    placeholder="Nomor WhatsApp..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Keranjang kosong
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {formatPrice(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => removeFromCart(item.product.id)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => addToCart(item.product)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {cart.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                
                {/* Preview Receipt Button */}
                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={() => setShowReceiptPreview(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Struk
                </Button>
                
                <div className="space-y-2">
                  <Button className="w-full" onClick={processTransaction}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Proses Transaksi
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Bersihkan Keranjang
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receipt Preview Modal */}
      {cart.length > 0 && (
        <ReceiptPreview
          data={{
            store: {
              name: selectedStore?.name || 'Vapor Store',
              address: selectedStore?.address || '',
              phone: ''
            },
            transaction: {
              id: 'preview',
              createdAt: new Date().toISOString(),
              cashierName: user?.name || 'Kasir',
              customerName: customerName || undefined
            },
            items: cart.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              subtotal: item.product.price * item.quantity
            })),
            payment: {
              subtotal: cartTotal,
              taxAmount: Math.round(cartTotal * (receiptSettings.taxRate / 100)),
              total: cartTotal + Math.round(cartTotal * (receiptSettings.taxRate / 100)),
              amountPaid: cartTotal + Math.round(cartTotal * (receiptSettings.taxRate / 100)),
              change: 0,
              method: 'cash'
            }
          }}
          settings={receiptSettings}
          isOpen={showReceiptPreview}
          onClose={() => setShowReceiptPreview(false)}
          onPrint={() => setShouldPrint(true)}
        />
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>
            5 transaksi terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              Belum ada transaksi
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {transaction.customer_name || 'Pelanggan Umum'}
                      </span>
                      <Badge variant="outline">{transaction.payment_method}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(transaction.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}