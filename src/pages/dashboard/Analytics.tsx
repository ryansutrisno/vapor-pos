/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import {
  DollarSign,
  Download,
  Store,
  TrendingUp,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number; newUsers: number }>
  revenueData: Array<{ month: string; revenue: number; orders: number }>
  roleDistribution: Array<{ role: string; count: number; percentage: number }>
  storePerformance: Array<{ store: string; revenue: number; orders: number; growth: number }>
}

interface KPIData {
  totalRevenue: number
  totalUsers: number
  totalStores: number
  totalOrders: number
  revenueGrowth: number
  userGrowth: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const roleLabels = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  warehouse: 'Warehouse',
  kasir: 'Kasir'
}

export default function Analytics() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    roleDistribution: [],
    storePerformance: []
  })
  const [kpiData, setKPIData] = useState<KPIData>({
    totalRevenue: 0,
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    revenueGrowth: 0,
    userGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('6months')

  const fetchAnalyticsData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)

      // Fetch users data for current tenant
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at')
      
      if (usersError) throw usersError

      // Fetch orders data for current tenant
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at')
      
      if (ordersError) throw ordersError

      // Fetch stores data for current tenant
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('tenant_id', user.tenant_id)
      
      if (storesError) throw storesError

      // Process user growth data
      const userGrowthData = generateUserGrowthData(users || [])

      // Process revenue data
      const revenueData = generateRevenueData(orders || [])

      // Process role distribution
      const roleDistribution = generateRoleDistribution(users || [])

      // Process store performance
      const storePerformance = generateStorePerformance(stores || [], orders || [])

      // Calculate KPIs
      const totalRevenue = (orders || []).reduce((sum, order) => {
        return order.payment_status === 'completed' ? sum + (order.amount || 0) : sum
      }, 0)
      const totalUsers = (users || []).length
      const totalStores = (stores || []).length
      const totalOrders = (orders || []).filter(order => order.payment_status === 'completed').length

      // Calculate growth rates (simplified - would need historical data for accurate calculation)
      const currentMonth = new Date().getMonth()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      
      const currentMonthRevenue = (orders || []).filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.getMonth() === currentMonth && order.payment_status === 'completed'
      }).reduce((sum, order) => sum + (order.amount || 0), 0)
      
      const lastMonthRevenue = (orders || []).filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.getMonth() === lastMonth && order.payment_status === 'completed'
      }).reduce((sum, order) => sum + (order.amount || 0), 0)
      
      const revenueGrowth = lastMonthRevenue > 0 ? 
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
      
      const currentMonthUsers = (users || []).filter(user => {
        const userDate = new Date(user.created_at)
        return userDate.getMonth() === currentMonth
      }).length
      
      const lastMonthUsers = (users || []).filter(user => {
        const userDate = new Date(user.created_at)
        return userDate.getMonth() === lastMonth
      }).length
      
      const userGrowth = lastMonthUsers > 0 ? 
        ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

      setAnalyticsData({
        userGrowth: userGrowthData,
        revenueData,
        roleDistribution,
        storePerformance
      })

      setKPIData({
        totalRevenue,
        totalUsers,
        totalStores,
        totalOrders,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        userGrowth: Math.round(userGrowth * 10) / 10
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError(error instanceof Error ? error.message : t('analytics.errorLoadingDescription'))
    } finally {
      setLoading(false)
    }
  }

  const generateUserGrowthData = (users: any[]) => {
    const monthlyData: { [key: string]: { users: number; newUsers: number } } = {}

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
      monthlyData[monthKey] = { users: 0, newUsers: 0 }
    }

    // Count users by month
    users.forEach(user => {
      const userDate = new Date(user.created_at)
      const monthKey = userDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].newUsers++
      }
    })

    // Calculate cumulative users
    let cumulativeUsers = 0
    return Object.entries(monthlyData).map(([month, data]) => {
      cumulativeUsers += data.newUsers
      return {
        month,
        users: cumulativeUsers,
        newUsers: data.newUsers
      }
    })
  }

  const generateRevenueData = (orders: any[]) => {
    const monthlyData: { [key: string]: { revenue: number; orders: number } } = {}

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
      monthlyData[monthKey] = { revenue: 0, orders: 0 }
    }

    // Sum revenue by month
    orders.forEach(order => {
      if (order.payment_status === 'completed') {
        const orderDate = new Date(order.created_at)
        const monthKey = orderDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += order.amount || 0
          monthlyData[monthKey].orders++
        }
      }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders
    }))
  }

  const generateRoleDistribution = (users: any[]) => {
    const roleCounts: { [key: string]: number } = {
      superadmin: 0,
      admin: 0,
      warehouse: 0,
      kasir: 0
    }

    users.forEach(user => {
      if (Object.prototype.hasOwnProperty.call(roleCounts, user.role)) {
        roleCounts[user.role]++
      }
    })

    const total = users.length
    return Object.entries(roleCounts).map(([role, count]) => ({
      role: roleLabels[role as keyof typeof roleLabels],
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
  }

  const generateStorePerformance = (stores: any[], orders: any[]) => {
    const storePerformance: { [key: string]: { revenue: number; orders: number } } = {}
    
    // Initialize store data
    stores.forEach(store => {
      storePerformance[store.id] = { revenue: 0, orders: 0 }
    })
    
    // Calculate revenue and orders per store
    orders.forEach(order => {
      if (order.payment_status === 'completed' && order.store_id && storePerformance[order.store_id]) {
        storePerformance[order.store_id].revenue += order.amount || 0
        storePerformance[order.store_id].orders++
      }
    })
    
    // Convert to array format with store names
    return stores.map(store => {
      const performance = storePerformance[store.id] || { revenue: 0, orders: 0 }
      return {
        store: store.name,
        revenue: performance.revenue,
        orders: performance.orders,
        growth: 0 // Growth calculation would require historical data
      }
    }).filter(store => store.revenue > 0 || store.orders > 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
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
                <h3 className="text-lg font-semibold">{t('analytics.errorLoading')}</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={fetchAnalyticsData} variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                {t('analytics.tryAgain')}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('analytics.title')}</h1>
          <p className="text-slate-600 dark:text-slate-300">{t('analytics.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('analytics.selectPeriod')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">{t('analytics.last3Months')}</SelectItem>
              <SelectItem value="6months">{t('analytics.last6Months')}</SelectItem>
              <SelectItem value="1year">{t('analytics.lastYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.export')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{kpiData.revenueGrowth}%</span> {t('analytics.fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpiData.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{kpiData.userGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalStores')}</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpiData.totalStores)}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.activeStores')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalOrders')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpiData.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.allTimeOrders')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.userGrowth')}</CardTitle>
            <CardDescription>
              {t('analytics.userGrowthDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name={t('analytics.totalUsers')}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#10b981"
                  strokeWidth={2}
                  name={t('analytics.newUsers')}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.revenueTrends')}</CardTitle>
            <CardDescription>
              {t('analytics.revenueTrendsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value as number) : value,
                  name === 'revenue' ? t('analytics.revenue') : t('analytics.orders')
                ]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name={t('analytics.revenue')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.roleDistribution')}</CardTitle>
            <CardDescription>
              {t('analytics.roleDistributionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.role} (${entry.percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Store Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.storePerformance')}</CardTitle>
            <CardDescription>
              {t('analytics.storePerformanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.storePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="store" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value as number) : value,
                  name === 'revenue' ? t('analytics.revenue') : t('analytics.orders')
                ]} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name={t('analytics.revenue')} />
                <Bar dataKey="orders" fill="#10b981" name={t('analytics.orders')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}