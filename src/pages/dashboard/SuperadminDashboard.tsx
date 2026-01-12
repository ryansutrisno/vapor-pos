import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Store, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/stores/authStore'
import type { Order } from '@/lib/supabase'
import { useTranslation } from '@/contexts/LanguageContext'

interface DashboardStats {
  totalUsers: number
  totalStores: number
  totalRevenue: number
  pendingOrders: number
}

export default function SuperadminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [usersResult, storesResult, ordersResult, revenueResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('stores').select('id', { count: 'exact' }),
        supabase.from('orders').select('*').eq('payment_status', 'pending'),
        supabase.from('orders').select('amount').eq('payment_status', 'completed')
      ])

      const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + order.amount, 0) || 0

      setStats({
        totalUsers: usersResult.count || 0,
        totalStores: storesResult.count || 0,
        totalRevenue,
        pendingOrders: ordersResult.data?.length || 0
      })

      setPendingOrders(ordersResult.data || [])

      // Fetch recent users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentUsers(users || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'completed' })
        .eq('id', orderId)

      if (error) throw error

      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving order:', error)
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'cancelled' })
        .eq('id', orderId)

      if (error) throw error

      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error rejecting order:', error)
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('superadminDashboard.title')}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t('superadminDashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superadminDashboard.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t('superadminDashboard.users')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superadminDashboard.totalStores')}</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              {t('superadminDashboard.stores')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superadminDashboard.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('superadminDashboard.revenue')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superadminDashboard.pendingOrders')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {t('superadminDashboard.orders')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t('superadminDashboard.recentOrders')}</CardTitle>
            <CardDescription>
              {t('superadminDashboard.ordersDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                {t('superadminDashboard.noOrders')}
              </p>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="flex flex-col p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-medium truncate">{order.email}</p>
                          <Badge variant="outline" className="shrink-0">{order.plan_type}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {formatPrice(order.amount)} - {order.billing_cycle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApproveOrder(order.id)}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-w-[100px]"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('superadminDashboard.approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectOrder(order.id)}
                          className="w-full sm:w-auto min-w-[100px]"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {t('superadminDashboard.reject')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>{t('superadminDashboard.recentUsers')}</CardTitle>
            <CardDescription>
              {t('superadminDashboard.usersDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                {t('superadminDashboard.noUsers')}
              </p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {user.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? t('superadminDashboard.active') : t('superadminDashboard.inactive')}
                      </Badge>
                    </div>
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