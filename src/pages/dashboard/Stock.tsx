import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import {
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  Building2,
  Download,
  History,
  Package,
  Plus,
  Search,
  TrendingUp
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  sku: string
  minimum_stock: number
  tenant_id: string
}

interface StockMovement {
  id: string
  product_id: string
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  notes?: string
  created_at: string
  created_by: string
  tenant_id: string
  source_store_id?: string
  destination_store_id?: string
  product?: Product
  source_store?: { name: string; city: string }
  destination_store?: { name: string; city: string }
}

interface Store {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: 'active' | 'inactive' | 'maintenance'
  tenant_id: string
}

const categoryLabels = {
  device: 'Device',
  liquid: 'Liquid',
  peripheral: 'Peripheral',
  service: 'Service'
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

export default function Stock() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])

  // Stores state
  const [stores, setStores] = useState<Store[]>([])

  // Stock Management state
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [stockDialog, setStockDialog] = useState(false)
  const [transferDialog, setTransferDialog] = useState(false)
  const [stockForm, setStockForm] = useState({
    product_id: '',
    type: 'in' as 'in' | 'out' | 'transfer' | 'adjustment',
    quantity: 0,
    notes: ''
  })
  const [transferForm, setTransferForm] = useState({
    product_id: '',
    quantity: 0,
    source_store_id: 'none',
    destination_store_id: 'none',
    notes: ''
  })
  const [stockSearch, setStockSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  // Fetch data functions
  const fetchProducts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])

      // Filter low stock products
      const lowStock = data?.filter(product => product.stock <= product.minimum_stock) || []
      setLowStockProducts(lowStock)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error(t('stock.errorFetchingProducts'))
    }
  }

  const fetchStores = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('status', 'active')
        .order('name', { ascending: true })

      if (error) throw error
      setStores(data || [])
    } catch (error) {
      console.error('Error fetching stores:', error)
      toast.error(t('stock.errorFetchingStores'))
    }
  }

  const fetchStockMovements = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(*),
          source_store:stores!stock_movements_source_store_id_fkey(name, city),
          destination_store:stores!stock_movements_destination_store_id_fkey(name, city)
        `)
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setStockMovements(data || [])
    } catch (error) {
      console.error('Error fetching stock movements:', error)
      toast.error(t('stock.errorFetchingMovements'))
    }
  }

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchProducts(),
        fetchStores(),
        fetchStockMovements()
      ]).finally(() => setLoading(false))
    }
  }, [user])

  // Form validation
  const validateStockForm = () => {
    const errors = []
    if (!stockForm.product_id) errors.push('Produk wajib dipilih')
    if (stockForm.quantity <= 0) errors.push('Jumlah harus lebih dari 0')
    if (!stockForm.type) errors.push('Jenis pergerakan wajib dipilih')
    return errors
  }

  const validateTransferForm = () => {
    const errors = []
    if (!transferForm.product_id) errors.push('Produk wajib dipilih')
    if (transferForm.quantity <= 0) errors.push('Jumlah harus lebih dari 0')
    if ((!transferForm.source_store_id || transferForm.source_store_id === 'none') &&
      (!transferForm.destination_store_id || transferForm.destination_store_id === 'none')) {
      errors.push('Minimal pilih cabang asal atau tujuan')
    }
    if (transferForm.source_store_id === transferForm.destination_store_id &&
      transferForm.source_store_id !== 'none') {
      errors.push('Cabang asal dan tujuan tidak boleh sama')
    }
    return errors
  }

  // Stock functions
  const handleSaveStockMovement = async () => {
    if (!user) return

    const validationErrors = validateStockForm()
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }

    try {
      const stockData = {
        ...stockForm,
        created_by: user.id,
        tenant_id: user.tenant_id
      }

      const { error } = await supabase
        .from('stock_movements')
        .insert([stockData])

      if (error) throw error

      // Update product stock
      const product = products.find(p => p.id === stockForm.product_id)
      if (product) {
        const newStock = stockForm.type === 'in' || stockForm.type === 'adjustment'
          ? product.stock + stockForm.quantity
          : product.stock - stockForm.quantity

        await supabase
          .from('products')
          .update({ stock: Math.max(0, newStock) })
          .eq('id', stockForm.product_id)
      }

      toast.success('Pergerakan stok berhasil dicatat')
      setStockDialog(false)
      setStockForm({
        product_id: '',
        type: 'in',
        quantity: 0,
        notes: ''
      })
      fetchProducts()
      fetchStockMovements()
    } catch (error) {
      console.error('Error saving stock movement:', error)
      toast.error('Gagal menyimpan pergerakan stok')
    }
  }

  const handleSaveStockTransfer = async () => {
    if (!user) return

    const validationErrors = validateTransferForm()
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }

    try {
      const transferData = {
        product_id: transferForm.product_id,
        type: 'transfer' as const,
        quantity: transferForm.quantity,
        notes: transferForm.notes,
        source_store_id: transferForm.source_store_id === 'none' ? null : transferForm.source_store_id || null,
        destination_store_id: transferForm.destination_store_id === 'none' ? null : transferForm.destination_store_id || null,
        created_by: user.id,
        tenant_id: user.tenant_id
      }

      const { error } = await supabase
        .from('stock_movements')
        .insert([transferData])

      if (error) throw error

      toast.success('Transfer stok berhasil dicatat')
      setTransferDialog(false)
      setTransferForm({
        product_id: '',
        quantity: 0,
        source_store_id: 'none',
        destination_store_id: 'none',
        notes: ''
      })
      fetchProducts()
      fetchStockMovements()
    } catch (error) {
      console.error('Error saving stock transfer:', error)
      toast.error('Gagal menyimpan transfer stok')
    }
  }

  // Filter stock movements based on search
  const filteredStockMovements = stockMovements.filter(movement => {
    if (!stockSearch) return true
    return movement.product?.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
      movement.product?.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(stockSearch.toLowerCase())
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Manajemen Stok</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola stok produk dan distribusi ke tenant/cabang</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Transfer Stok
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={stockDialog} onOpenChange={setStockDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Catat Pergerakan
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Cari produk, SKU, atau catatan..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="device">Device</SelectItem>
                <SelectItem value="liquid">Liquid</SelectItem>
                <SelectItem value="peripheral">Peripheral</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Peringatan Stok Menipis ({lowStockProducts.length})
            </CardTitle>
            <CardDescription>
              Produk dengan stok di bawah minimum yang perlu segera diisi ulang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[product.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {formatPrice(product.price)} • SKU: {product.sku}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-orange-600 font-medium">
                      Stok: {product.stock}/{product.minimum_stock} unit
                    </span>
                    <Button size="sm" variant="outline" onClick={() => {
                      setStockForm({
                        product_id: product.id,
                        type: 'in',
                        quantity: product.minimum_stock - product.stock + 10,
                        notes: `Pengisian stok untuk ${product.name}`
                      })
                      setStockDialog(true)
                    }}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Isi Stok
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inter-Branch Transfer Monitoring */}
      {stores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Monitoring Transfer Antar Cabang
            </CardTitle>
            <CardDescription>
              Status transfer stok dan level stok per cabang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => {
                const storeTransfers = stockMovements.filter(
                  movement => movement.type === 'transfer' &&
                    (movement.source_store_id === store.id || movement.destination_store_id === store.id)
                ).slice(0, 3)

                return (
                  <div key={store.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{store.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {store.city}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Transfer Terbaru:
                      </div>
                      {storeTransfers.length > 0 ? (
                        storeTransfers.map((transfer) => (
                          <div key={transfer.id} className="text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            <div className="font-medium">{transfer.product?.name}</div>
                            <div className="text-slate-500">
                              {transfer.source_store_id === store.id ? '📤 Keluar' : '📥 Masuk'} {transfer.quantity} unit
                            </div>
                            <div className="text-slate-400">
                              {formatDate(transfer.created_at)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          Belum ada transfer
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Produk terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cabang</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">
              Cabang aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Perlu diisi ulang
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Stok</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(products.reduce((total, product) => total + (product.stock * product.price), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Nilai inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUpDown className="w-5 h-5 mr-2" />
            Laporan Transfer Antar Cabang
          </CardTitle>
          <CardDescription>
            Ringkasan transfer stok dalam 30 hari terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stockMovements.filter(m => m.type === 'transfer').length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stockMovements.filter(m => m.type === 'transfer').length}
                  </div>
                  <div className="text-sm text-slate-600">Total Transfer</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stockMovements.filter(m => m.type === 'transfer').reduce((sum, m) => sum + m.quantity, 0)}
                  </div>
                  <div className="text-sm text-slate-600">Total Unit</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(stockMovements.filter(m => m.type === 'transfer').map(m => m.product_id)).size}
                  </div>
                  <div className="text-sm text-slate-600">Produk Berbeda</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Transfer Terbaru:</h4>
                {stockMovements.filter(m => m.type === 'transfer').slice(0, 5).map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{transfer.product?.name}</div>
                      <div className="text-sm text-slate-600">
                        {transfer.source_store?.name || 'Pusat'} → {transfer.destination_store?.name || 'Pusat'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{transfer.quantity} unit</div>
                      <div className="text-xs text-slate-500">
                        {formatDate(transfer.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowUpDown className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Belum ada transfer stok antar cabang
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Movement History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Riwayat Pergerakan Stok
              </CardTitle>
              <CardDescription>
                100 pergerakan stok terbaru
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStockMovements.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {stockSearch ? 'Tidak ada riwayat yang sesuai dengan pencarian' : 'Belum ada riwayat pergerakan stok'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Transfer Info</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead>Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStockMovements.slice(0, 50).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        {formatDate(movement.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{movement.product?.name}</div>
                          <div className="text-xs text-slate-500">
                            SKU: {movement.product?.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={movement.type === 'in' ? 'default' :
                            movement.type === 'out' ? 'destructive' :
                              movement.type === 'transfer' ? 'secondary' : 'outline'}
                        >
                          {movement.type === 'in' && '📈 Masuk'}
                          {movement.type === 'out' && '📉 Keluar'}
                          {movement.type === 'transfer' && '🔄 Transfer'}
                          {movement.type === 'adjustment' && '⚖️ Penyesuaian'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={movement.type === 'in' || movement.type === 'adjustment' ?
                          'text-green-600' : 'text-red-600'}>
                          {movement.type === 'in' || movement.type === 'adjustment' ? '+' : '-'}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.type === 'transfer' ? (
                          <div className="space-y-1">
                            {movement.source_store && (
                              <div className="text-red-600">
                                📤 Dari: {movement.source_store.name}
                              </div>
                            )}
                            {movement.destination_store && (
                              <div className="text-green-600">
                                📥 Ke: {movement.destination_store.name}
                              </div>
                            )}
                            {!movement.source_store && !movement.destination_store && (
                              <span className="text-slate-500">-</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {movement.notes || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.created_by}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Movement Dialog */}
      <Dialog open={stockDialog} onOpenChange={setStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pergerakan Stok</DialogTitle>
            <DialogDescription>
              Tambahkan catatan pergerakan stok untuk produk yang dipilih
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dialog-stock-product">Produk</Label>
              <Select
                value={stockForm.product_id}
                onValueChange={(value) => setStockForm(prev => ({ ...prev, product_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Stok: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dialog-stock-type">Jenis Pergerakan</Label>
              <Select
                value={stockForm.type}
                onValueChange={(value: 'in' | 'out' | 'transfer' | 'adjustment') =>
                  setStockForm(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">📈 Stok Masuk</SelectItem>
                  <SelectItem value="out">📉 Stok Keluar</SelectItem>
                  <SelectItem value="transfer">🔄 Transfer</SelectItem>
                  <SelectItem value="adjustment">⚖️ Penyesuaian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dialog-stock-quantity">Jumlah</Label>
              <Input
                id="dialog-stock-quantity"
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="0"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="dialog-stock-notes">Catatan</Label>
              <Textarea
                id="dialog-stock-notes"
                value={stockForm.notes}
                onChange={(e) => setStockForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan pergerakan stok..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveStockMovement}
              disabled={!stockForm.product_id || stockForm.quantity <= 0}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Transfer Dialog */}
      <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Stok Antar Cabang</DialogTitle>
            <DialogDescription>
              Transfer stok produk dari satu cabang ke cabang lain
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transfer-product">Produk</Label>
              <Select
                value={transferForm.product_id}
                onValueChange={(value) => setTransferForm(prev => ({ ...prev, product_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Stok: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-quantity">Jumlah</Label>
              <Input
                id="transfer-quantity"
                type="number"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="0"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="source-store">Cabang Asal</Label>
              <Select
                value={transferForm.source_store_id}
                onValueChange={(value) => setTransferForm(prev => ({ ...prev, source_store_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang asal (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada (stok pusat)</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} - {store.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destination-store">Cabang Tujuan</Label>
              <Select
                value={transferForm.destination_store_id}
                onValueChange={(value) => setTransferForm(prev => ({ ...prev, destination_store_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang tujuan (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada (stok pusat)</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} - {store.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-notes">Catatan</Label>
              <Textarea
                id="transfer-notes"
                value={transferForm.notes}
                onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan transfer stok..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveStockTransfer}
              disabled={!transferForm.product_id || transferForm.quantity <= 0}
            >
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}