import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import { toast } from '@/lib/toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Store,
  MapPin,
  Users,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react'

interface Store {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: 'active' | 'inactive' | 'maintenance'
  staffCount: number
  monthlyRevenue: number
  manager?: string
  createdAt: string
}

interface StoreFormData {
  name: string
  address: string
  city: string
  phone: string
  status: 'active' | 'inactive' | 'maintenance'
  manager?: string
}

interface Staff {
  id: string
  name: string
  email: string
  role: 'kasir' | 'warehouse'
  storeId?: string
  isAssigned: boolean
}

// Remove mock data - will be fetched from database

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800'
}

// Status labels will be handled by translation function
const getStatusLabel = (status: string, t: any) => {
  return t(`stores.statusLabels.${status}`) || status
}

export default function Stores() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  
  const [stores, setStores] = useState<Store[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [assigningStore, setAssigningStore] = useState<Store | null>(null)
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    address: '',
    city: '',
    phone: '',
    status: 'active',
    manager: ''
  })

  const loadData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch stores
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
      
      if (storesError) throw storesError
      
      // Transform stores data
      const transformedStores: Store[] = (storesData || []).map(store => ({
        id: store.id,
        name: store.name,
        address: store.address || '',
        city: store.city || '',
        phone: store.phone || '',
        status: store.is_active ? 'active' : 'inactive',
        staffCount: 0, // Will be calculated from staff data
        monthlyRevenue: 0, // Will be calculated from orders data
        manager: store.manager || '',
        createdAt: store.created_at
      }))
      
      setStores(transformedStores)
      
      // Fetch staff
      const { data: staffData, error: staffError } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .in('role', ['kasir', 'warehouse'])
      
      if (staffError) throw staffError
      
      // Transform staff data
      const transformedStaff: Staff[] = (staffData || []).map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role as 'kasir' | 'warehouse',
        storeId: member.store_id,
        isAssigned: !!member.store_id
      }))
      
      setStaff(transformedStaff)
      
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      toast.error(t('stores.errorLoadingData'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    try {
      if (editingStore) {
        // Update existing store
        const { error } = await supabase
          .from('stores')
          .update({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            phone: formData.phone,
            is_active: formData.status === 'active',
            manager: formData.manager
          })
          .eq('id', editingStore.id)
          .eq('tenant_id', user.tenant_id)
        
        if (error) throw error
        toast.success(t('stores.storeUpdated'))
      } else {
        // Create new store
        const { error } = await supabase
          .from('stores')
          .insert({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            phone: formData.phone,
            is_active: formData.status === 'active',
            manager: formData.manager,
            tenant_id: user.tenant_id
          })
        
        if (error) throw error
        toast.success(t('stores.storeAdded'))
      }
      
      resetForm()
      await loadData()
      
    } catch (error) {
      console.error('Error saving store:', error)
      toast.error(error instanceof Error ? error.message : t('stores.failedToSaveStore'))
    }
  }

  const handleEdit = (store: Store) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      address: store.address,
      city: store.city,
      phone: store.phone,
      status: store.status,
      manager: store.manager || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (storeId: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)
        .eq('tenant_id', user.tenant_id)
      
      if (error) throw error
      
      toast.success(t('stores.storeDeleted'))
      await loadData()
      
    } catch (error) {
      console.error('Error deleting store:', error)
      toast.error(error instanceof Error ? error.message : t('stores.failedToDeleteStore'))
    }
  }

  const handleAssignStaff = (store: Store) => {
    setAssigningStore(store)
    // Get currently assigned staff for this store
    const currentlyAssigned = staff
      .filter(s => s.storeId === store.id)
      .map(s => s.id)
    setSelectedStaffIds(currentlyAssigned)
    setIsAssignDialogOpen(true)
  }

  const handleSaveAssignment = () => {
    if (!assigningStore) return
    
    // Update staff assignments
    setStaff(staff.map(s => {
      if (selectedStaffIds.includes(s.id)) {
        return { ...s, storeId: assigningStore.id, isAssigned: true }
      } else if (s.storeId === assigningStore.id) {
        return { ...s, storeId: undefined, isAssigned: false }
      }
      return s
    }))
    
    // Update store staff count
    setStores(stores.map(store => 
      store.id === assigningStore.id 
        ? { ...store, staffCount: selectedStaffIds.length }
        : store
    ))
    
    toast.success(t('stores.staffAssigned'), {
      description: `${selectedStaffIds.length} ${t('stores.staffAssignedDescription')} ${assigningStore?.name}`
    })
    setIsAssignDialogOpen(false)
    setAssigningStore(null)
    setSelectedStaffIds([])
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      status: 'active',
      manager: ''
    })
    setEditingStore(null)
    setIsDialogOpen(false)
  }

  const getAvailableStaff = () => {
    return staff.filter(s => !s.isAssigned || (assigningStore && s.storeId === assigningStore.id))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  useEffect(() => {
    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 text-destructive">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Error Loading Stores Data</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={loadData} variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('stores.title')}</h1>
          <p className="text-muted-foreground">
            {t('stores.subtitle')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStore(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('stores.addStore')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingStore ? t('stores.editStore') : t('stores.addNewStore')}
              </DialogTitle>
              <DialogDescription>
                {editingStore 
                  ? t('stores.updateStoreInfo')
                  : t('stores.addNewBranch')
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t('stores.storeName')}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    {t('stores.address')}
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="city" className="text-right">
                    {t('stores.city')}
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    {t('stores.phone')}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manager" className="text-right">
                    {t('stores.manager')}
                  </Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="col-span-3"
                    placeholder={t('stores.optional')}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    {t('stores.status')}
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'maintenance') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('stores.statusLabels.active')}</SelectItem>
                      <SelectItem value="inactive">{t('stores.statusLabels.inactive')}</SelectItem>
                      <SelectItem value="maintenance">{t('stores.statusLabels.maintenance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('stores.cancel')}
                </Button>
                <Button type="submit">
                  {editingStore ? t('stores.update') : t('stores.add')} {t('common.store')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Assign Staff Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('stores.assignStaffToStore')}</DialogTitle>
              <DialogDescription>
                {t('stores.selectStaffToAssign')} {assigningStore?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">{t('stores.availableStaff')}</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getAvailableStaff().map((staffMember) => (
                      <div key={staffMember.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={staffMember.id}
                          checked={selectedStaffIds.includes(staffMember.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStaffIds([...selectedStaffIds, staffMember.id])
                            } else {
                              setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffMember.id))
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{staffMember.name}</p>
                              <p className="text-xs text-muted-foreground">{staffMember.email}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {staffMember.role === 'kasir' ? 'Kasir' : 'Warehouse'}
                            </Badge>
                          </div>
                          {staffMember.storeId && staffMember.storeId !== assigningStore?.id && (
                            <p className="text-xs text-yellow-600">
                              {t('stores.currentlyAt')} {stores.find(s => s.id === staffMember.storeId)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {getAvailableStaff().length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t('stores.noAvailableStaff')}
                      </p>
                    )}
                  </div>
                </div>
                
                {selectedStaffIds.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('stores.selectedStaff')} {selectedStaffIds.length}</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedStaffIds.map(staffId => {
                        const staffMember = staff.find(s => s.id === staffId)
                        return staffMember ? (
                          <Badge key={staffId} variant="secondary" className="text-xs">
                            {staffMember.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAssignDialogOpen(false)
                    setAssigningStore(null)
                    setSelectedStaffIds([])
                  }}
                >
                  {t('stores.cancel')}
                </Button>
                <Button type="button" onClick={handleSaveAssignment}>
                  {t('stores.assignStaffCount')} ({selectedStaffIds.length})
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stores.totalStores')}</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">
              {stores.filter(s => s.status === 'active').length} {t('stores.active')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stores.totalStaff')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.reduce((total, store) => total + store.staffCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stores.averagePerStore')} {Math.round(stores.reduce((total, store) => total + store.staffCount, 0) / stores.length)} per {t('common.store')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stores.monthlyRevenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stores.reduce((total, store) => total + store.monthlyRevenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stores.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stores.averagePerStore')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stores.reduce((total, store) => total + store.monthlyRevenue, 0) / stores.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stores.revenuePerBranch')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stores.storeList')}</CardTitle>
          <CardDescription>
            {t('stores.storeListDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('stores.storeName')}</TableHead>
                <TableHead>{t('stores.location')}</TableHead>
                <TableHead>{t('stores.manager')}</TableHead>
                <TableHead>{t('stores.staff')}</TableHead>
                <TableHead>{t('stores.status')}</TableHead>
                <TableHead>{t('stores.monthlyRevenue')}</TableHead>
                <TableHead className="text-right">{t('stores.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span>{store.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{store.city}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{store.address}</div>
                  </TableCell>
                  <TableCell>{store.manager || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{store.staffCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[store.status]}>
                      {getStatusLabel(store.status, t)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(store.monthlyRevenue)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('stores.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(store)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('stores.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignStaff(store)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          {t('stores.assignStaff')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(store.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('stores.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}