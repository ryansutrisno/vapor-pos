import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Tag
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import { toast } from '@/lib/toast'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  created_at: string
  tenant_id: string
}

interface Product {
  id: string
  name: string
  category: string
  tenant_id: string
}

const categoryIcons = {
  device: '📱',
  liquid: '🧪',
  peripheral: '🔧',
  service: '⚙️'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function Categories() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'device'
  })

  // Fetch data functions
  const fetchCategories = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error(t('categories.errorFetchingCategories'))
    }
  }

  const fetchProducts = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, tenant_id')
        .eq('tenant_id', user.tenant_id)
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error(t('categories.errorFetchingProducts'))
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
  const validateCategoryForm = () => {
    const errors = []
    if (!categoryForm.name.trim()) errors.push('Nama kategori wajib diisi')
    if (categoryForm.name.length < 3) errors.push('Nama kategori minimal 3 karakter')
    if (!categoryForm.icon) errors.push('Jenis kategori wajib dipilih')
    return errors
  }

  // Category functions
  const handleSaveCategory = async () => {
    if (!user) return
    
    const validationErrors = validateCategoryForm()
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }
    
    try {
      const categoryData = {
        ...categoryForm,
        tenant_id: user.tenant_id
      }
      
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
        
        if (error) throw error
        toast.success('Kategori berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData])
        
        if (error) throw error
        toast.success('Kategori berhasil ditambahkan')
      }
      
      setCategoryDialog(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '', icon: 'device' })
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Gagal menyimpan kategori')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Kategori berhasil dihapus')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Gagal menghapus kategori')
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Kategori Produk</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola kategori produk vapor (Device, Liquid, Peripheral, Service)</p>
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

      {/* Categories Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Kategori</CardTitle>
              <CardDescription>
                Kelola kategori produk untuk mengorganisir inventory
              </CardDescription>
            </div>
            <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCategory(null)
                  setCategoryForm({ name: '', description: '', icon: 'device' })
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kategori
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    Buat atau edit kategori produk untuk mengorganisir inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Nama Kategori</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama kategori"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">Deskripsi</Label>
                    <Textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi kategori"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-icon">Jenis Kategori</Label>
                    <Select
                      value={categoryForm.icon}
                      onValueChange={(value) => setCategoryForm(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="device">📱 Device (Mod, Pod, Atomizer)</SelectItem>
                        <SelectItem value="liquid">🧪 Liquid (E-juice, Salt Nic)</SelectItem>
                        <SelectItem value="peripheral">🔧 Peripheral (Coil, Cotton, Wire)</SelectItem>
                        <SelectItem value="service">⚙️ Service (Recoil, Maintenance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCategoryDialog(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSaveCategory}>
                    {editingCategory ? 'Perbarui' : 'Simpan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Belum ada kategori produk
              </p>
              <Button onClick={() => setCategoryDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kategori Pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{categoryIcons[category.icon as keyof typeof categoryIcons]}</span>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(category)
                            setCategoryForm({
                              name: category.name,
                              description: category.description,
                              icon: category.icon
                            })
                            setCategoryDialog(true)
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
                              <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus kategori "{category.name}"? 
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {category.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                      <span>Dibuat: {formatDate(category.created_at)}</span>
                      <Badge variant="outline">
                        {products.filter(p => p.category === category.icon).length} produk
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}