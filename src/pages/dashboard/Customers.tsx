import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Edit,
  Gift,
  MapPin,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'

interface Customer {
  id: string
  name: string
  phone?: string
  address?: string
  loyalty_points: number
  total_spent: number
  visit_count: number
  last_visit?: string
  notes?: string
  created_at: string
  tenant_id: string
}

interface CustomerFormData {
  name: string
  phone: string
  address: string
  notes: string
}

interface CustomerTransaction {
  id: string
  total_amount: number
  created_at: string
  payment_method: string
  status: string
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
    day: 'numeric'
  })
}

const getLoyaltyTier = (points: number) => {
  if (points >= 1000) return { name: 'Platinum', color: 'bg-purple-100 text-purple-800', icon: '💎' }
  if (points >= 500) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: '🥇' }
  if (points >= 200) return { name: 'Silver', color: 'bg-gray-100 text-gray-800', icon: '🥈' }
  return { name: 'Bronze', color: 'bg-orange-100 text-orange-800', icon: '🥉' }
}

export default function Customers() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [loyaltyFilter, setLoyaltyFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([])

  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    address: '',
    notes: ''
  })

  // Fetch customers
  const fetchCustomers = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error(t('customers.errorFetchingCustomers'))
    }
  }

  // Fetch customer transactions
  const fetchCustomerTransactions = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, total_amount, created_at, payment_method, status')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setCustomerTransactions(data || [])
    } catch (error) {
      console.error('Error fetching customer transactions:', error)
      toast.error(t('customers.errorFetchingTransactions'))
    }
  }

  useEffect(() => {
    if (user) {
      fetchCustomers().finally(() => setLoading(false))
    }
  }, [user])

  // Apply filters
  useEffect(() => {
    let filtered = [...customers]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      )
    }

    // Loyalty tier filter
    if (loyaltyFilter !== 'all') {
      filtered = filtered.filter(customer => {
        const tier = getLoyaltyTier(customer.loyalty_points)
        return tier.name.toLowerCase() === loyaltyFilter
      })
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Customer]
      const bValue = b[sortBy as keyof Customer]

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredCustomers(filtered)
  }, [customers, searchTerm, loyaltyFilter, sortBy, sortOrder])

  // Form validation
  const validateForm = () => {
    const errors = []
    if (!formData.name.trim()) errors.push('Nama wajib diisi')
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      errors.push('Format nomor telepon tidak valid')
    }
    return errors
  }

  // Handle save customer
  const handleSaveCustomer = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }

    try {
      const customerData = {
        ...formData,
        phone: formData.phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
        tenant_id: user?.tenant_id
      }

      if (selectedCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', selectedCustomer.id)

        if (error) throw error
        toast.success('Data pelanggan berhasil diperbarui')
        setIsEditDialogOpen(false)
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...customerData,
            loyalty_points: 0,
            total_spent: 0,
            visit_count: 0
          }])

        if (error) throw error
        toast.success('Pelanggan baru berhasil ditambahkan')
        setIsAddDialogOpen(false)
      }

      resetForm()
      fetchCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Gagal menyimpan data pelanggan')
    }
  }

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) throw error
      toast.success('Pelanggan berhasil dihapus')
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Gagal menghapus pelanggan')
    }
  }

  // Handle add loyalty points
  const handleAddLoyaltyPoints = async (customerId: string, points: number) => {
    try {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) return

      const { error } = await supabase
        .from('customers')
        .update({
          loyalty_points: customer.loyalty_points + points
        })
        .eq('id', customerId)

      if (error) throw error
      toast.success(`${points} poin loyalty berhasil ditambahkan`)
      fetchCustomers()
    } catch (error) {
      console.error('Error adding loyalty points:', error)
      toast.error('Gagal menambahkan poin loyalty')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      notes: ''
    })
    setSelectedCustomer(null)
  }

  // Open edit dialog
  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  // Open detail dialog
  const openDetailDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    fetchCustomerTransactions(customer.id)
    setIsDetailDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Manajemen Pelanggan</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola data pelanggan dan program loyalty</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pelanggan
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Pelanggan terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.last_visit &&
                new Date(c.last_visit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktif 30 hari terakhir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poin Loyalty</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.loyalty_points, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Poin terdistribusi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Spending</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(customers.length > 0
                ? customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length
                : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Per pelanggan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Cari nama, email, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loyalty Filter */}
            <Select value={loyaltyFilter} onValueChange={setLoyaltyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Loyalty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tier</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Terbaru</SelectItem>
                <SelectItem value="created_at-asc">Terlama</SelectItem>
                <SelectItem value="name-asc">Nama A-Z</SelectItem>
                <SelectItem value="name-desc">Nama Z-A</SelectItem>
                <SelectItem value="total_spent-desc">Spending Tertinggi</SelectItem>
                <SelectItem value="loyalty_points-desc">Poin Terbanyak</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
              {filteredCustomers.length} dari {customers.length} pelanggan
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm || loyaltyFilter !== 'all'
                  ? 'Tidak ada pelanggan yang sesuai dengan filter'
                  : 'Belum ada pelanggan terdaftar'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Loyalty Tier</TableHead>
                    <TableHead>Total Belanja</TableHead>
                    <TableHead>Kunjungan</TableHead>
                    <TableHead>Terakhir</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const loyaltyTier = getLoyaltyTier(customer.loyalty_points)
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium">{customer.name}</div>
                        </TableCell>
                        <TableCell>
                          {customer.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {customer.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={loyaltyTier.color}>
                            {loyaltyTier.icon} {loyaltyTier.name}
                          </Badge>
                          <div className="text-xs text-slate-500 mt-1">
                            {customer.loyalty_points} poin
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(customer.total_spent)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{customer.visit_count}</div>
                            <div className="text-xs text-slate-500">kali</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.last_visit ? formatDate(customer.last_visit) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetailDialog(customer)}
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(customer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Pelanggan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus pelanggan {customer.name}?
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCustomer(customer.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer ? 'Perbarui informasi pelanggan' : 'Masukkan data pelanggan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor Telepon WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Masukkan alamat lengkap"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan tambahan tentang pelanggan"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setIsEditDialogOpen(false)
              resetForm()
            }}>
              Batal
            </Button>
            <Button onClick={handleSaveCustomer}>
              {selectedCustomer ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
            <DialogDescription>
              Informasi lengkap dan riwayat transaksi
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Pelanggan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">{selectedCustomer.name}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                        <span>{selectedCustomer.address}</span>
                      </div>
                    )}
                    {selectedCustomer.notes && (
                      <div className="flex items-start space-x-2">
                        <span className="text-slate-500 text-sm">Catatan:</span>
                        <span className="text-sm">{selectedCustomer.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistik & Loyalty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Loyalty Tier:</span>
                      <Badge className={getLoyaltyTier(selectedCustomer.loyalty_points).color}>
                        {getLoyaltyTier(selectedCustomer.loyalty_points).icon} {getLoyaltyTier(selectedCustomer.loyalty_points).name}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Poin Loyalty:</span>
                      <span className="font-medium">{selectedCustomer.loyalty_points}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Belanja:</span>
                      <span className="font-medium">{formatPrice(selectedCustomer.total_spent)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Jumlah Kunjungan:</span>
                      <span className="font-medium">{selectedCustomer.visit_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Kunjungan Terakhir:</span>
                      <span className="font-medium">
                        {selectedCustomer.last_visit ? formatDate(selectedCustomer.last_visit) : 'Belum pernah'}
                      </span>
                    </div>

                    {/* Add Loyalty Points */}
                    <div className="pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddLoyaltyPoints(selectedCustomer.id, 10)}
                        >
                          <Gift className="w-4 h-4 mr-1" />
                          +10 Poin
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddLoyaltyPoints(selectedCustomer.id, 50)}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          +50 Poin
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Riwayat Transaksi (10 Terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerTransactions.length === 0 ? (
                    <div className="text-center py-4">
                      <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">Belum ada transaksi</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customerTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{formatPrice(transaction.total_amount)}</div>
                            <div className="text-sm text-slate-500">
                              {formatDate(transaction.created_at)} • {transaction.payment_method}
                            </div>
                          </div>
                          <Badge
                            variant={transaction.status === 'completed' ? 'default' :
                              transaction.status === 'refunded' ? 'destructive' : 'secondary'}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
            {selectedCustomer && (
              <Button onClick={() => {
                setIsDetailDialogOpen(false)
                openEditDialog(selectedCustomer)
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Pelanggan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}