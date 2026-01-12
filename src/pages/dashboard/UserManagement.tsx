/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/contexts/LanguageContext'
import { createTenantDefaultSettings } from '@/lib/settings'
import { supabase } from '@/lib/supabase'
import { handleSupabaseError, showSuccess, toast } from '@/lib/toast'
import type { User as UserType } from '@/stores/authStore'
import {
  Calculator,
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  Users,
  UserX,
  Warehouse,
  XCircle
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
}

const roleIcons = {
  superadmin: Shield,
  admin: User,
  warehouse: Warehouse,
  kasir: Calculator
}

const getRoleLabels = (t: any) => ({
  superadmin: t('roles.superadmin'),
  admin: t('roles.admin'),
  warehouse: t('roles.warehouse'),
  kasir: t('roles.kasir')
})

const roleColors = {
  superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warehouse: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  kasir: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

export default function UserManagement() {
  const { t } = useTranslation()
  const roleLabels = getRoleLabels(t)

  const [users, setUsers] = useState<UserType[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy] = useState<string>('created_at')
  const [sortOrder] = useState<'asc' | 'desc'>('desc')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'kasir' as UserType['role'],
    password: '',
    is_active: true
  })
  const [formLoading, setFormLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all users
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (error) throw error

      setUsers(usersData || [])

      // Calculate stats
      const totalUsers = usersData?.length || 0
      const activeUsers = usersData?.filter(user => user.is_active === true).length || 0
      const pendingUsers = usersData?.filter(user => user.is_active === null).length || 0
      const suspendedUsers = usersData?.filter(user => user.is_active === false).length || 0

      setStats({
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder])

  useEffect(() => {
    fetchUsers()
  }, [sortBy, sortOrder, fetchUsers])

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId)

      if (error) throw error

      fetchUsers()
      showSuccess(t('userManagement.userApproved'), t('userManagement.userApprovedDescription'))
    } catch (error) {
      console.error('Error approving user:', error)
      handleSupabaseError(error, t('userManagement.approveError'))
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) throw error

      fetchUsers()
      showSuccess(t('userManagement.userRejected'), t('userManagement.userRejectedDescription'))
    } catch (error) {
      console.error('Error rejecting user:', error)
      handleSupabaseError(error, t('userManagement.rejectError'))
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) throw error

      fetchUsers()
      showSuccess(t('userManagement.userSuspended'), t('userManagement.userSuspendedDescription'))
    } catch (error) {
      console.error('Error suspending user:', error)
      handleSupabaseError(error, t('userManagement.suspendError'))
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId)

      if (error) throw error

      fetchUsers()
      showSuccess(t('userManagement.userActivated'), t('userManagement.userActivatedDescription'))
    } catch (error) {
      console.error('Error activating user:', error)
      handleSupabaseError(error, t('userManagement.activateError'))
    }
  }

  const handleAddUser = async () => {
    try {
      setFormLoading(true)

      // Get current user's session token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error(t('userManagement.noValidSession'))
      }

      // Call backend API to create user
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          is_active: formData.is_active
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('userManagement.failedToCreateUser'))
      }

      // Create default settings for new tenant (admin only)
      if (formData.role === 'admin' && result.data?.tenant_id) {
        try {
          await createTenantDefaultSettings(result.data.tenant_id)
          console.log(`Default settings created for tenant: ${result.data.tenant_id}`)
        } catch (settingsError) {
          console.error('Error creating default settings:', settingsError)
          // Don't fail the user creation if settings creation fails
        }
      }

      setShowAddModal(false)
      setFormData({ name: '', email: '', role: 'kasir', password: '', is_active: true })
      fetchUsers()

      // Show success message
      showSuccess(
        t('userManagement.userAdded'),
        `${formData.name} ${t('userManagement.userAddedDescription')} ${formData.role}`
      )
    } catch (error) {
      console.error('Error adding user:', error)

      let errorMessage = t('userManagement.addError')
      let description = t('userManagement.unknownError')

      if (error instanceof Error) {
        description = error.message
      } else if (typeof error === 'string') {
        description = error
      }

      // Provide specific guidance for common errors
      if (description.includes('403') || description.includes('Forbidden')) {
        errorMessage = t('userManagement.accessDenied')
        description = t('userManagement.accessDeniedDescription')
      } else if (description.includes('401') || description.includes('Unauthorized')) {
        errorMessage = t('userManagement.authFailed')
        description = t('userManagement.authFailedDescription')
      } else if (description.includes('No valid session')) {
        errorMessage = t('userManagement.sessionExpired')
        description = t('userManagement.sessionExpiredDescription')
      } else if (description.includes('duplicate')) {
        errorMessage = t('userManagement.emailExists')
        description = t('userManagement.emailExistsDescription')
      }

      toast.error(errorMessage, { description })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      setFormLoading(true)

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      setShowEditModal(false)
      setSelectedUser(null)
      setFormData({ name: '', email: '', role: 'kasir', password: '', is_active: true })
      fetchUsers()

      // Show success message
      showSuccess(
        t('userManagement.userUpdated'),
        t('userManagement.userUpdatedDescription')
      )
    } catch (error) {
      console.error('Error updating user:', error)
      handleSupabaseError(error, t('userManagement.updateError'))
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setFormLoading(true)

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id)

      if (error) throw error

      setShowDeleteDialog(false)
      setSelectedUser(null)
      fetchUsers()

      // Show success message
      showSuccess(
        t('userManagement.userDeleted'),
        `${selectedUser.name || selectedUser.email} ${t('userManagement.userDeletedDescription')}`
      )
    } catch (error) {
      console.error('Error deleting user:', error)
      handleSupabaseError(error, t('userManagement.deleteError'))
    } finally {
      setFormLoading(false)
    }
  }

  const openEditModal = (user: UserType) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '',
      is_active: user.is_active ?? true
    })
    setShowEditModal(true)
  }

  const openDeleteDialog = (user: UserType) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active === true) ||
      (statusFilter === 'pending' && user.is_active === null) ||
      (statusFilter === 'suspended' && user.is_active === false)

    return matchesSearch && matchesRole && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (isActive: boolean | null) => {
    if (isActive === true) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('userManagement.active')}</Badge>
    } else if (isActive === false) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t('userManagement.suspended')}</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{t('userManagement.pending')}</Badge>
    }
  }

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('userManagement.title')}</h1>
          <p className="text-slate-600 dark:text-slate-300">{t('userManagement.subtitle')}</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t('userManagement.addNewUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('userManagement.addUserTitle')}</DialogTitle>
              <DialogDescription>
                {t('userManagement.addUserDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('userManagement.fullName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('userManagement.fullNamePlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('userManagement.emailPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t('userManagement.passwordPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">{t('userManagement.selectRole')}</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserType['role'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('userManagement.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">{t('roles.superadmin')}</SelectItem>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    <SelectItem value="warehouse">{t('roles.warehouse')}</SelectItem>
                    <SelectItem value="kasir">{t('roles.kasir')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddUser} disabled={formLoading}>
                {formLoading ? t('userManagement.creating') : t('userManagement.createUser')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('userManagement.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t('userManagement.allUsers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('userManagement.activeUsers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t('userManagement.activeUsersDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('userManagement.pendingApproval')}</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t('userManagement.pendingDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('userManagement.suspended')}</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspendedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t('userManagement.suspendedDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userManagement.filterSearch')}</CardTitle>
          <CardDescription>
            {t('userManagement.filterSearchDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('userManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('userManagement.filterRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userManagement.allRoles')}</SelectItem>
                <SelectItem value="superadmin">{t('roles.superadmin')}</SelectItem>
                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                <SelectItem value="warehouse">{t('roles.warehouse')}</SelectItem>
                <SelectItem value="kasir">{t('roles.kasir')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('userManagement.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userManagement.allStatus')}</SelectItem>
                <SelectItem value="active">{t('userManagement.active')}</SelectItem>
                <SelectItem value="pending">{t('userManagement.pending')}</SelectItem>
                <SelectItem value="suspended">{t('userManagement.suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userManagement.userList')}</CardTitle>
          <CardDescription>
            {filteredUsers.length} {t('userManagement.usersCount')} {users.length} {t('userManagement.totalUsers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">{t('userManagement.noUsersFound')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleIcons[user.role as keyof typeof roleIcons]
                    return (
                      <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-slate-900 dark:text-white truncate">
                                {user.name || user.email.split('@')[0]}
                              </p>
                              <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {roleLabels[user.role as keyof typeof roleLabels]}
                              </Badge>
                              {getStatusBadge(user.is_active)}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('userManagement.joinedOn')} {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          {user.is_active === null && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveUser(user.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {t('userManagement.approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectUser(user.id)}
                                className="flex-1 sm:flex-none"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                {t('userManagement.reject')}
                              </Button>
                            </>
                          )}

                          {user.is_active === true && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspendUser(user.id)}
                              className="flex-1 sm:flex-none"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              {t('userManagement.suspend')}
                            </Button>
                          )}

                          {user.is_active === false && (
                            <Button
                              size="sm"
                              onClick={() => handleActivateUser(user.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              {t('userManagement.activate')}
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditModal(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t('userManagement.editUser')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('userManagement.deleteUser')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('userManagement.editUserTitle')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.editUserDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t('userManagement.fullName')}</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('userManagement.fullNamePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">{t('auth.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={t('userManagement.emailPlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">{t('userManagement.selectRole')}</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserType['role'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('userManagement.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">{t('roles.superadmin')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  <SelectItem value="warehouse">{t('roles.warehouse')}</SelectItem>
                  <SelectItem value="kasir">{t('roles.kasir')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">{t('userManagement.selectStatus')}</Label>
              <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('userManagement.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('userManagement.active')}</SelectItem>
                  <SelectItem value="inactive">{t('userManagement.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEditUser} disabled={formLoading}>
              {formLoading ? t('userManagement.updating') : t('userManagement.updateUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('userManagement.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('userManagement.deleteConfirmDescription')} <strong>{selectedUser?.email}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={formLoading}
            >
              {formLoading ? t('userManagement.deleting') : t('userManagement.deleteUser')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}