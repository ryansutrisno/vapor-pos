/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import {
  AlertTriangle,
  Download,
  Edit,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Upload
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'

interface Category {
  id: string
  name: string
  icon: string
  tenant_id: string
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  sku: string
  image_url?: string
  variants?: any
  minimum_stock: number
  created_at: string
  tenant_id: string
}

const categoryLabels = {
  device: 'Device',
  liquid: 'Liquid',
  peripheral: 'Peripheral',
  service: 'Service'
}

export default function Products() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  // Categories state (for dropdown)
  const [categories, setCategories] = useState<Category[]>([])

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [productDialog, setProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    sku: '',
    minimum_stock: 10,
    image_url: ''
  })
  const [productSearch, setProductSearch] = useState('')
  const [productFilter, setProductFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])

  // Fetch data functions
  const fetchCategories = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon, tenant_id')
        .eq('tenant_id', user.tenant_id)
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error(t('products.errorFetchingCategories'))
    }
  }

  const fetchProducts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])

      // Filter low stock products
      const lowStock = data?.filter(product => product.stock <= product.minimum_stock) || []
      setLowStockProducts(lowStock)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error(t('products.errorFetchingProducts'))
    }
  }

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchCategories(),
        fetchProducts()
      ]).finally(() => setLoading(false))
    }
  }, [user])

  // Form validation
  const validateProductForm = () => {
    const errors = []
    if (!productForm.name.trim()) errors.push(t('products.validation.nameRequired'))
    if (productForm.name.length < 3) errors.push(t('products.validation.nameMinLength'))
    if (!productForm.sku.trim()) errors.push(t('products.validation.skuRequired'))
    if (productForm.sku.length < 3) errors.push(t('products.validation.skuMinLength'))
    if (!productForm.category) errors.push(t('products.validation.categoryRequired'))
    if (productForm.price <= 0) errors.push(t('products.validation.priceRequired'))
    if (productForm.minimum_stock < 1) errors.push(t('products.validation.minimumStockRequired'))

    // Check SKU uniqueness
    const existingSku = products.find(p =>
      p.sku.toLowerCase() === productForm.sku.toLowerCase() &&
      (!editingProduct || p.id !== editingProduct.id)
    )
    if (existingSku) errors.push(t('products.validation.skuExists'))

    return errors
  }



  // Product functions
  const handleSaveProduct = async () => {
    if (!user) return

    const validationErrors = validateProductForm()
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }

    try {
      const productData = {
        ...productForm,
        tenant_id: user.tenant_id
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success(t('products.productUpdated'))
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
        toast.success(t('products.productAdded'))
      }

      setProductDialog(false)
      setEditingProduct(null)
      setProductForm({
        name: '',
        description: '',
        category: '',
        price: 0,
        stock: 0,
        sku: '',
        minimum_stock: 10,
        image_url: ''
      })
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Gagal menyimpan produk')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Produk berhasil dihapus')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Gagal menghapus produk')
    }
  }



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearch.toLowerCase())
    const matchesFilter = productFilter === 'all' || product.category === productFilter
    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id))
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return

    try {
      if (bulkAction === 'delete') {
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedProducts)

        if (error) throw error
        toast.success(`${selectedProducts.length} produk berhasil dihapus`)
      } else if (bulkAction === 'low-stock') {
        const { error } = await supabase
          .from('products')
          .update({ minimum_stock: 5 })
          .in('id', selectedProducts)

        if (error) throw error
        toast.success(`Minimum stok diperbarui untuk ${selectedProducts.length} produk`)
      }

      setSelectedProducts([])
      setBulkAction('')
      fetchProducts()
    } catch (error) {
      console.error('Error in bulk action:', error)
      toast.error('Gagal melakukan aksi bulk')
    }
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Produk</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola semua produk vapor dengan detail lengkap</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

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
                    <Button size="sm" variant="outline" disabled>
                      Isi Stok
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle>Daftar Produk</CardTitle>
              <CardDescription>
                Kelola semua produk vapor dengan detail lengkap
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Cari produk atau SKU..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={productFilter} onValueChange={(value) => {
                setProductFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-40">
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
              <Dialog open={productDialog} onOpenChange={setProductDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingProduct(null)
                    setProductForm({
                      name: '',
                      description: '',
                      category: '',
                      price: 0,
                      stock: 0,
                      sku: '',
                      minimum_stock: 10,
                      image_url: ''
                    })
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Produk
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </DialogTitle>
                    <DialogDescription>
                      Lengkapi informasi produk dengan detail yang akurat
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product-name">Nama Produk *</Label>
                        <Input
                          id="product-name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Masukkan nama produk"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-sku">SKU *</Label>
                        <Input
                          id="product-sku"
                          value={productForm.sku}
                          onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                          placeholder="SKU-001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-category">Kategori *</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="device">📱 Device</SelectItem>
                            <SelectItem value="liquid">🧪 Liquid</SelectItem>
                            <SelectItem value="peripheral">🔧 Peripheral</SelectItem>
                            <SelectItem value="service">⚙️ Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="product-price">Harga (Rp) *</Label>
                          <Input
                            id="product-price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-stock">Stok Awal</Label>
                          <Input
                            id="product-stock"
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="product-minimum-stock">Minimum Stok</Label>
                        <Input
                          id="product-minimum-stock"
                          type="number"
                          value={productForm.minimum_stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, minimum_stock: Number(e.target.value) }))}
                          placeholder="10"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product-description">Deskripsi</Label>
                        <Textarea
                          id="product-description"
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Deskripsi produk..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-image">URL Gambar</Label>
                        <Input
                          id="product-image"
                          value={productForm.image_url}
                          onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                        {productForm.image_url && (
                          <div className="mt-2">
                            <img
                              src={productForm.image_url}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=product%20placeholder%20vapor%20device&image_size=square'
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-medium mb-2">Informasi Tambahan</h4>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <p>• Pastikan SKU unik untuk setiap produk</p>
                          <p>• Harga dalam Rupiah tanpa titik/koma</p>
                          <p>• Minimum stok untuk alert otomatis</p>
                          <p>• Gambar akan ditampilkan di POS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setProductDialog(false)}>
                      Batal
                    </Button>
                    <Button
                      onClick={handleSaveProduct}
                      disabled={!productForm.name || !productForm.sku || !productForm.category || productForm.price <= 0}
                    >
                      {editingProduct ? 'Perbarui' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {productSearch || productFilter !== 'all' ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk'}
              </p>
              {!productSearch && productFilter === 'all' && (
                <Button onClick={() => setProductDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">
                      {selectedProducts.length} produk dipilih
                    </span>
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Pilih aksi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delete">🗑️ Hapus</SelectItem>
                        <SelectItem value="low-stock">⚠️ Set Min Stok</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                    >
                      Jalankan
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedProducts([])}
                  >
                    Batal
                  </Button>
                </div>
              )}

              {/* Select All */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Pilih semua ({paginatedProducts.length})
                  </label>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Halaman {currentPage} dari {totalPages}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedProducts.map((product) => (
                  <Card key={product.id} className={`relative overflow-hidden ${selectedProducts.includes(product.id) ? 'ring-2 ring-blue-500' : ''
                    }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded border-slate-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <Badge variant="outline">
                                {categoryLabels[product.category as keyof typeof categoryLabels]}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingProduct(product)
                              setProductForm({
                                name: product.name,
                                description: product.description,
                                category: product.category,
                                price: product.price,
                                stock: product.stock,
                                sku: product.sku,
                                minimum_stock: product.minimum_stock,
                                image_url: product.image_url || ''
                              })
                              setProductDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus produk "{product.name}"?
                                  Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {product.image_url && (
                        <div className="mb-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.src = 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=vapor%20product%20placeholder&image_size=square'
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(product.price)}
                          </span>
                          <div className={`text-right ${product.stock <= product.minimum_stock ? 'text-orange-600' :
                            product.stock <= 5 ? 'text-red-600' : 'text-green-600'
                            }`}>
                            <div className="text-lg font-bold">{product.stock}</div>
                            <div className="text-xs">unit</div>
                          </div>
                        </div>
                        {product.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>Min: {product.minimum_stock}</span>
                          <span>{formatDate(product.created_at)}</span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled
                            title="Gunakan halaman Stock untuk manajemen stok"
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Stok
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t space-y-4 sm:space-y-0">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-slate-400">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}