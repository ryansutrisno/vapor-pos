import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Users, TrendingUp, Package, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import type { Store as StoreType, User } from '@/lib/supabase'

interface DashboardStats {
  totalStores: number
  totalStaff: number
  totalProducts: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardStats>({
    totalStores: 0,
    totalStaff: 0,
    totalProducts: 0,
    monthlyRevenue: 0
  })
  const [stores, setStores] = useState<StoreType[]>([])
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = React.useCallback(async () => {
    if (!user) return

    try {
      // Fetch stores owned by this admin
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .eq('admin_id', user.id)
        .eq('is_active', true)

      setStores(storesData || [])

      // Fetch staff under this admin
      const { data: staffData } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .in('role', ['warehouse', 'kasir'])

      setStaff(staffData || [])

      // Calculate stats
      const storeIds = storesData?.map(store => store.id) || []
      
      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .in('store_id', storeIds)

      // Get monthly revenue (current month)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount')
        .in('store_id', storeIds)
        .gte('created_at', startOfMonth.toISOString())

      const monthlyRevenue = transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0

      setStats({
        totalStores: storesData?.length || 0,
        totalStaff: staffData?.length || 0,
        totalProducts: productsCount || 0,
        monthlyRevenue
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
    }
  }, [user, fetchDashboardData])

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('adminDashboard.title')}</h1>
          <p className="text-slate-600 dark:text-slate-300">{t('adminDashboard.subtitle')}</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          {t('adminDashboard.addStore')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminDashboard.totalStores')}</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              {t('adminDashboard.stores')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminDashboard.totalStaff')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              {t('adminDashboard.staff')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminDashboard.totalProducts')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {t('adminDashboard.products')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminDashboard.monthlyRevenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('adminDashboard.revenue')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Stores List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminDashboard.yourStores')}</CardTitle>
            <CardDescription>
              {t('adminDashboard.storeListDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8">
                <Store className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {t('adminDashboard.noStores')}
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('adminDashboard.addFirstStore')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{store.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {store.address}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('adminDashboard.created')}: {formatDate(store.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={store.is_active ? 'default' : 'secondary'}>
                        {store.is_active ? t('adminDashboard.active') : t('adminDashboard.inactive')}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {t('adminDashboard.manage')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminDashboard.latestStaff')}</CardTitle>
            <CardDescription>
              {t('adminDashboard.newStaffDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {t('adminDashboard.noStaff')}
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('adminDashboard.inviteStaff')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {staff.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{member.name}</h3>
                        <Badge variant="outline">
                          {member.role === 'warehouse' ? t('adminDashboard.warehouse') : t('adminDashboard.cashier')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {member.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('adminDashboard.joined')}: {formatDate(member.created_at)}
                      </p>
                    </div>
                    <Badge variant={member.is_active ? 'default' : 'secondary'}>
                      {member.is_active ? t('adminDashboard.active') : t('adminDashboard.inactive')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}