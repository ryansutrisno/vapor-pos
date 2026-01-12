/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  copyToClipboard,
  generateInvitationToken,
  generatePassword,
  getInvitationExpiryDate,
  getPasswordStrengthLabel,
  isInvitationExpired,
  validatePasswordStrength
} from '@/lib/password'
import { supabase } from '@/lib/supabase'
import { handleSupabaseError, showError, showSuccess } from '@/lib/toast'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  Eye,
  Key,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Shield,
  Trash2,
  UserPlus,
  Users,
  XCircle
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

// Types and Interfaces
interface StaffMember {
  id: string
  name: string
  email: string
  role: 'warehouse' | 'kasir'
  storeId?: string
  storeName?: string
  status: 'active' | 'inactive' | 'pending'
  permissions: {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canManageInventory?: boolean
    canProcessTransactions?: boolean
  }
  lastActivity: string
  invitedAt: string
  invitedBy: string
  // New fields for password and invitation management
  invitationStatus: 'sent' | 'accepted' | 'expired' | 'resent'
  passwordStatus: 'temporary' | 'permanent' | 'not_set'
  invitationToken?: string
  invitationExpiryDate?: string
  temporaryPassword?: string
  lastLogin?: string
  mustChangePassword: boolean
  passwordSetAt?: string
}

interface StaffStats {
  totalStaff: number
  activeStaff: number
  pendingInvites: number
  warehouseStaff: number
  kasirStaff: number
}

interface StaffFormData {
  name: string
  email: string
  role: 'warehouse' | 'kasir'
  storeId: string
  permissions: {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canManageInventory?: boolean
    canProcessTransactions?: boolean
  }
  // New password-related fields
  passwordOption: 'generate' | 'manual' | 'invitation'
  customPassword?: string
  sendWelcomeEmail: boolean
}

interface PasswordOption {
  value: 'generate' | 'manual' | 'invitation'
  label: string
  description: string
}

interface ActivityLog {
  id: string
  staffId: string
  action: string
  timestamp: string
  details: string
}

// Role and status labels will be handled by translation function
const getRoleLabel = (role: string, t: any) => {
  const labels = {
    admin: t('staff.roles.admin'),
    kasir: t('staff.roles.kasir'),
    warehouse: t('staff.roles.warehouse')
  }
  return labels[role as keyof typeof labels] || role
}

const getStatusLabel = (status: string, t: any) => {
  const labels = {
    active: t('staff.status.active'),
    inactive: t('staff.status.inactive'),
    pending: t('staff.status.pending')
  }
  return labels[status as keyof typeof labels] || status
}

export default function Staff() {
  const { user } = useAuthStore()
  const { t } = useTranslation()

  // State Management
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    pendingInvites: 0,
    warehouseStaff: 0,
    kasirStaff: 0
  })
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog States
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form States
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    role: 'kasir',
    storeId: '',
    permissions: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canManageInventory: false,
      canProcessTransactions: false
    },
    passwordOption: 'generate',
    customPassword: '',
    sendWelcomeEmail: true
  })

  // Password-related states
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, score: 0, feedback: [] })
  const [showPassword, setShowPassword] = useState(false)

  // Password options
  const passwordOptions: PasswordOption[] = [
    {
      value: 'generate',
      label: t('staff.passwordOptions.generate.label'),
      description: t('staff.passwordOptions.generate.description')
    },
    {
      value: 'manual',
      label: t('staff.passwordOptions.manual.label'),
      description: t('staff.passwordOptions.manual.description')
    },
    {
      value: 'invitation',
      label: t('staff.passwordOptions.invitation.label'),
      description: t('staff.passwordOptions.invitation.description')
    }
  ]

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [storeFilter, setStoreFilter] = useState<string>('all')

  // Selected Items
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null)

  // State for stores data
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])

  // Load Data
  useEffect(() => {
    loadStaffData()
  }, [])

  const loadStaffData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Fetch stores for the current tenant
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('tenant_id', user.tenant_id)
        .order('name')

      if (storesError) throw storesError
      setStores(storesData || [])

      // Fetch staff (users) for the current tenant
      const { data: staffData, error: staffError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          store_id,
          is_active,
          created_at,
          updated_at,
          stores(name)
        `)
        .eq('tenant_id', user.tenant_id)
        .in('role', ['warehouse', 'kasir'])
        .order('created_at', { ascending: false })

      if (staffError) throw staffError

      // Transform data to match StaffMember interface
      const transformedStaff: StaffMember[] = (staffData || []).map(member => {
        const storeData = member.stores as any
        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role as 'warehouse' | 'kasir',
          storeId: member.store_id,
          storeName: storeData?.name || stores.find(s => s.id === member.store_id)?.name || '-',
          status: member.is_active ? 'active' : 'inactive',
          permissions: {
            canView: true,
            canEdit: member.role === 'warehouse',
            canDelete: false,
            canManageInventory: member.role === 'warehouse',
            canProcessTransactions: member.role === 'kasir'
          },
          lastActivity: '-',
          invitedAt: member.created_at,
          invitedBy: 'Admin',
          invitationStatus: 'accepted',
          passwordStatus: 'permanent',
          mustChangePassword: false
        }
      })

      setStaff(transformedStaff)

      // Calculate stats
      const totalStaff = transformedStaff.length
      const activeStaff = transformedStaff.filter(s => s.status === 'active').length
      const pendingInvites = transformedStaff.filter(s => s.status === 'pending').length
      const warehouseStaff = transformedStaff.filter(s => s.role === 'warehouse').length
      const kasirStaff = transformedStaff.filter(s => s.role === 'kasir').length

      setStats({
        totalStaff,
        activeStaff,
        pendingInvites,
        warehouseStaff,
        kasirStaff
      })

      // For now, set empty activity logs (can be implemented later)
      setActivityLogs([])

    } catch (error) {
      console.error('Error loading staff data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load staff data')
      handleSupabaseError(error, 'Gagal memuat data staff')
    } finally {
      setLoading(false)
    }
  }

  // Password Management Functions
  const handleGeneratePassword = () => {
    const newPassword = generatePassword(12, true)
    setGeneratedPassword(newPassword)
    setFormData(prev => ({ ...prev, customPassword: newPassword }))
  }

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, customPassword: password }))
    const validation = validatePasswordStrength(password)
    setPasswordStrength(validation)
  }

  const handleCopyPassword = async (password: string) => {
    const success = await copyToClipboard(password)
    if (success) {
      showSuccess('Password disalin', 'Password berhasil disalin ke clipboard')
    } else {
      showError('Gagal menyalin', 'Tidak dapat menyalin password ke clipboard')
    }
  }

  const handleResendInvitation = async (member: StaffMember) => {
    try {
      // Simulate API call to resend invitation
      const newToken = generateInvitationToken()
      const newExpiryDate = getInvitationExpiryDate(new Date().toISOString())

      const updatedStaff = staff.map(s =>
        s.id === member.id
          ? {
            ...s,
            invitationStatus: 'resent' as const,
            invitationToken: newToken,
            invitationExpiryDate: newExpiryDate.toISOString()
          }
          : s
      )

      setStaff(updatedStaff)
      showSuccess('Invitation terkirim', `Invitation berhasil dikirim ulang ke ${member.email}`)
    } catch {
      showError('Gagal mengirim invitation', 'Tidak dapat mengirim ulang invitation')
    }
  }

  // Filter Functions
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    const matchesStore = storeFilter === 'all' || member.storeId === storeFilter

    return matchesSearch && matchesRole && matchesStatus && matchesStore
  })

  // Form Handlers
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'kasir',
      storeId: '',
      permissions: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canManageInventory: false,
        canProcessTransactions: false
      },
      passwordOption: 'generate',
      customPassword: '',
      sendWelcomeEmail: true
    })
    setEditingStaff(null)
    setGeneratedPassword('')
    setPasswordStrength({ isValid: false, score: 0, feedback: [] })
    setShowPassword(false)
  }

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let password = ''
      let mustChangePassword = false

      // Handle different password options
      switch (formData.passwordOption) {
        case 'generate':
          password = generatedPassword || generatePassword(12, true)
          mustChangePassword = true
          break

        case 'manual': {
          if (!formData.customPassword) {
            showError('Password kosong', 'Password harus diisi untuk melanjutkan')
            return
          }
          const validation = validatePasswordStrength(formData.customPassword)
          if (!validation.isValid) {
            showError('Password lemah', 'Password tidak memenuhi kriteria keamanan yang diperlukan')
            return
          }
          password = formData.customPassword
          break
        }

        case 'invitation': 
          // For invitation flow, we don't set password immediately
          // User will set password when they accept the invitation
          break
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: password || generatePassword(12, true),
        email_confirm: true,
        user_metadata: {
          name: formData.name,
          role: formData.role,
          tenant_id: user.tenant_id,
          store_id: formData.storeId,
          must_change_password: mustChangePassword
        }
      })

      if (authError) throw authError

      // Insert user into users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          tenant_id: user.tenant_id,
          store_id: formData.storeId,
          is_active: true,
          must_change_password: mustChangePassword
        })

      if (userError) throw userError

      setIsInviteDialogOpen(false)
      resetForm()

      // Reload staff data to reflect changes
      await loadStaffData()

      // Show success message based on password option
      if (formData.passwordOption === 'invitation') {
        showSuccess('Invitation terkirim', `Email invitation berhasil dikirim ke ${formData.email}`)
      } else {
        showSuccess('Staff ditambahkan', `${formData.name} berhasil ditambahkan sebagai ${getRoleLabel(formData.role, t)}`)
      }

    } catch (error) {
      console.error('Error inviting staff:', error)
      handleSupabaseError(error, 'Gagal menambahkan staff')
    }
  }

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member)
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      storeId: member.storeId || '',
      permissions: member.permissions,
      passwordOption: 'generate',
      customPassword: '',
      sendWelcomeEmail: true
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingStaff || !user) return

    try {
      // Update user in users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          store_id: formData.storeId
        })
        .eq('id', editingStaff.id)
        .eq('tenant_id', user.tenant_id)

      if (userError) throw userError

      setIsEditDialogOpen(false)
      resetForm()

      // Reload staff data to reflect changes
      await loadStaffData()

      showSuccess('Data diperbarui', `Data ${formData.name} berhasil diperbarui`)

    } catch (error) {
      console.error('Error updating staff:', error)
      handleSupabaseError(error, 'Gagal memperbarui data staff')
    }
  }

  const handleDeleteStaff = async () => {
    if (!deletingStaff || !user) return

    try {
      // Delete user from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', deletingStaff.id)
        .eq('tenant_id', user.tenant_id)

      if (userError) throw userError

      // Delete user from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(deletingStaff.id)
      if (authError) console.warn('Warning: Could not delete user from auth:', authError)

      setIsDeleteDialogOpen(false)
      setDeletingStaff(null)

      // Reload staff data to reflect changes
      await loadStaffData()

      showSuccess('Staff dihapus', `${deletingStaff.name} berhasil dihapus dari sistem`)

    } catch (error) {
      console.error('Error deleting staff:', error)
      handleSupabaseError(error, 'Gagal menghapus staff')
    }
  }

  const handleToggleStatus = async (member: StaffMember) => {
    if (!user) return

    const newStatus: 'active' | 'inactive' = member.status === 'active' ? 'inactive' : 'active'
    const isActive = newStatus === 'active'

    try {
      // Update user status in users table
      const { error: userError } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', member.id)
        .eq('tenant_id', user.tenant_id)

      if (userError) throw userError

      // Reload staff data to reflect changes
      await loadStaffData()

      showSuccess(
        `Staff ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        `${member.name} berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`
      )

    } catch (error) {
      console.error('Error toggling staff status:', error)
      handleSupabaseError(error, 'Gagal mengubah status staff')
    }
  }

  const handleViewActivity = (member: StaffMember) => {
    setSelectedStaff(member)
    setIsActivityDialogOpen(true)
  }

  const handleManagePermissions = (member: StaffMember) => {
    setSelectedStaff(member)
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      storeId: member.storeId || '',
      permissions: member.permissions,
      passwordOption: 'generate',
      customPassword: '',
      sendWelcomeEmail: true
    })
    setIsPermissionDialogOpen(true)
  }

  const handleUpdatePermissions = async () => {
    if (!selectedStaff || !user) return

    try {
      // Note: Permissions are typically handled at application level
      // For now, we'll just close the dialog and show success
      // In a real implementation, you might store permissions in a separate table

      setIsPermissionDialogOpen(false)
      setSelectedStaff(null)

      showSuccess('Permissions diperbarui', `Permissions ${selectedStaff.name} berhasil diperbarui`)

    } catch (error) {
      console.error('Error updating permissions:', error)
      handleSupabaseError(error, 'Gagal memperbarui permissions')
    }
  }

  const formatDate = (dateString: string) => {
    if (dateString === '-') return '-'
    return new Date(dateString).toLocaleString('id-ID')
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'pending': return 'outline'
      default: return 'secondary'
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'warehouse': return 'default'
      case 'kasir': return 'secondary'
      default: return 'outline'
    }
  }

  const getInvitationStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return { variant: 'outline' as const, label: 'Terkirim', icon: Send }
      case 'accepted': return { variant: 'default' as const, label: 'Diterima', icon: CheckCircle }
      case 'expired': return { variant: 'destructive' as const, label: 'Expired', icon: XCircle }
      case 'resent': return { variant: 'secondary' as const, label: 'Dikirim Ulang', icon: RefreshCw }
      default: return { variant: 'outline' as const, label: 'Unknown', icon: AlertCircle }
    }
  }

  const getPasswordStatusBadge = (status: string) => {
    switch (status) {
      case 'temporary': return { variant: 'outline' as const, label: 'Sementara', icon: Clock }
      case 'permanent': return { variant: 'default' as const, label: 'Permanen', icon: Key }
      case 'not_set': return { variant: 'secondary' as const, label: 'Belum Set', icon: AlertCircle }
      default: return { variant: 'outline' as const, label: 'Unknown', icon: AlertCircle }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
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
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Error Loading Staff Data</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={loadStaffData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staff.totalStaff')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">{t('staff.allRegisteredStaff')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staff.activeStaff')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStaff}</div>
            <p className="text-xs text-muted-foreground">{t('staff.activeWorkingStaff')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staff.pendingInvites')}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvites}</div>
            <p className="text-xs text-muted-foreground">{t('staff.invitationsNotAccepted')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staff.warehouse')}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warehouseStaff}</div>
            <p className="text-xs text-muted-foreground">{t('staff.warehouseStaff')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staff.cashier')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kasirStaff}</div>
            <p className="text-xs text-muted-foreground">{t('staff.cashierStaff')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>{t('staff.title')}</CardTitle>
              <CardDescription>
                {t('staff.subtitle')}
              </CardDescription>
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('staff.inviteStaff')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('staff.searchStaff')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('staff.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('staff.allRoles')}</SelectItem>
                <SelectItem value="warehouse">{t('staff.warehouse')}</SelectItem>
                <SelectItem value="kasir">{t('staff.cashier')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('staff.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('staff.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('staff.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('staff.status.inactive')}</SelectItem>
                <SelectItem value="pending">{t('staff.status.pending')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('staff.branch')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('staff.allBranches')}</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('staff.staff')}</TableHead>
                  <TableHead>{t('staff.role')}</TableHead>
                  <TableHead>{t('staff.branch')}</TableHead>
                  <TableHead>{t('staff.status')}</TableHead>
                  <TableHead>{t('staff.invitation')}</TableHead>
                  <TableHead>{t('staff.password')}</TableHead>
                  <TableHead>{t('staff.lastLogin')}</TableHead>
                  <TableHead className="text-right">{t('staff.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">{t('staff.noStaffFound')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => {
                    const invitationBadge = getInvitationStatusBadge(member.invitationStatus)
                    const passwordBadge = getPasswordStatusBadge(member.passwordStatus)
                    const invitationExpired = member.invitationExpiryDate && isInvitationExpired(member.invitedAt)

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {getRoleLabel(member.role, t)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {member.storeName || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {getStatusLabel(member.status, t)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={invitationBadge.variant} className="text-xs">
                              <invitationBadge.icon className="w-3 h-3 mr-1" />
                              {invitationBadge.label}
                            </Badge>
                            {invitationExpired && (
                              <div className="text-xs text-red-600">Expired</div>
                            )}
                            {member.invitationExpiryDate && !invitationExpired && (
                              <div className="text-xs text-muted-foreground">
                                Expires: {formatDate(member.invitationExpiryDate)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={passwordBadge.variant} className="text-xs">
                              <passwordBadge.icon className="w-3 h-3 mr-1" />
                              {passwordBadge.label}
                            </Badge>
                            {member.mustChangePassword && (
                              <div className="text-xs text-orange-600">Must change</div>
                            )}
                            {member.temporaryPassword && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleCopyPassword(member.temporaryPassword!)}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {member.lastLogin ? formatDate(member.lastLogin) : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManagePermissions(member)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Manage Permissions
                              </DropdownMenuItem>
                              {(member.invitationStatus === 'sent' || member.invitationStatus === 'expired') && (
                                <DropdownMenuItem onClick={() => handleResendInvitation(member)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Resend Invitation
                                </DropdownMenuItem>
                              )}
                              {member.temporaryPassword && (
                                <DropdownMenuItem onClick={() => handleCopyPassword(member.temporaryPassword!)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Password
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleViewActivity(member)}>
                                <Activity className="mr-2 h-4 w-4" />
                                View Activity
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(member)}
                                className={member.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {member.status === 'active' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeletingStaff(member)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Staff
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Staff Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite New Staff</DialogTitle>
            <DialogDescription>
              Add new staff member with secure password setup
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteStaff} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'warehouse' | 'kasir') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store">Assign to Store</Label>
              <Select value={formData.storeId} onValueChange={(value) => setFormData({ ...formData, storeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password Options */}
            <div className="space-y-3">
              <Label>Password Setup</Label>
              <div className="space-y-3">
                {passwordOptions.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id={option.value}
                      name="passwordOption"
                      value={option.value}
                      checked={formData.passwordOption === option.value}
                      onChange={(e) => setFormData({ ...formData, passwordOption: e.target.value as any })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Password Option */}
            {formData.passwordOption === 'generate' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Password</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePassword}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                {generatedPassword && (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={generatedPassword}
                      readOnly
                      type={showPassword ? 'text' : 'password'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPassword(generatedPassword)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Password Option */}
            {formData.passwordOption === 'manual' && (
              <div className="space-y-2">
                <Label htmlFor="customPassword">Set Password</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="customPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.customPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter secure password"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                {formData.customPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Password Strength:</span>
                      <span className={`text-sm font-medium ${getPasswordStrengthLabel(passwordStrength.score).color}`}>
                        {getPasswordStrengthLabel(passwordStrength.score).label}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li key={index}>• {feedback}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Email Options */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) => setFormData({ ...formData, sendWelcomeEmail: checked as boolean })}
              />
              <Label htmlFor="sendWelcomeEmail">Send welcome email with login instructions</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsInviteDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {formData.passwordOption === 'invitation' ? (
                  <><Send className="mr-2 h-4 w-4" />Send Invitation</>
                ) : (
                  <><UserPlus className="mr-2 h-4 w-4" />Add Staff</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>
              Update staff information and role
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStaff} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'warehouse' | 'kasir') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-store">Assign to Store</Label>
              <Select value={formData.storeId} onValueChange={(value) => setFormData({ ...formData, storeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Update Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Set permissions for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canView"
                  checked={formData.permissions.canView}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canView: checked as boolean }
                    })
                  }
                />
                <Label htmlFor="canView">Can View Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canEdit"
                  checked={formData.permissions.canEdit}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canEdit: checked as boolean }
                    })
                  }
                />
                <Label htmlFor="canEdit">Can Edit Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canDelete"
                  checked={formData.permissions.canDelete}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canDelete: checked as boolean }
                    })
                  }
                />
                <Label htmlFor="canDelete">Can Delete Data</Label>
              </div>
              {formData.role === 'warehouse' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageInventory"
                    checked={formData.permissions.canManageInventory}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canManageInventory: checked as boolean }
                      })
                    }
                  />
                  <Label htmlFor="canManageInventory">Can Manage Inventory</Label>
                </div>
              )}
              {formData.role === 'kasir' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canProcessTransactions"
                    checked={formData.permissions.canProcessTransactions}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canProcessTransactions: checked as boolean }
                      })
                    }
                  />
                  <Label htmlFor="canProcessTransactions">Can Process Transactions</Label>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setIsPermissionDialogOpen(false)
              setSelectedStaff(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions}>
              Update Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Activity Log</DialogTitle>
            <DialogDescription>
              Recent activities for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activityLogs
              .filter(log => log.staffId === selectedStaff?.id)
              .map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{log.action}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  </div>
                </div>
              ))
            }
            {activityLogs.filter(log => log.staffId === selectedStaff?.id).length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No activity logs found</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsActivityDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingStaff?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingStaff(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}