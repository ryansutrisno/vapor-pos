/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import jsPDF from 'jspdf'
import {
  BarChart3,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  FileText,
  PieChart,
  ShoppingCart,
  Star,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'
import * as XLSX from 'xlsx'

interface SalesData {
  date: string
  total_sales: number
  transaction_count: number
  customer_count: number
}

interface ProductSales {
  product_name: string
  category: string
  quantity_sold: number
  total_revenue: number
  profit_margin: number
}

interface PaymentMethodData {
  payment_method: string
  count: number
  total_amount: number
  percentage: number
}

interface DashboardMetrics {
  todaySales: number
  todayTransactions: number
  todayCustomers: number
  averageTransaction: number
  weeklyGrowth: number
  monthlyGrowth: number
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

const formatPercentage = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export default function CashierReports() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7') // days
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaySales: 0,
    todayTransactions: 0,
    todayCustomers: 0,
    averageTransaction: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productSales, setProductSales] = useState<ProductSales[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])

  // Initialize date range
  useEffect(() => {
    const today = new Date()
    const pastDate = new Date(today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000)

    setEndDate(today.toISOString().split('T')[0])
    setStartDate(pastDate.toISOString().split('T')[0])
  }, [dateRange])

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    if (!user) return

    try {
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Today's data
      const { data: todayData } = await supabase
        .from('transactions')
        .select('total_amount, customer_name')
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', todayStart.toISOString())
        .eq('status', 'completed')

      // Week's data for comparison
      const { data: weekData } = await supabase
        .from('transactions')
        .select('total_amount, created_at')
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', weekAgo.toISOString())
        .lt('created_at', todayStart.toISOString())
        .eq('status', 'completed')

      // Month's data for comparison
      const { data: monthData } = await supabase
        .from('transactions')
        .select('total_amount, created_at')
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', monthAgo.toISOString())
        .lt('created_at', weekAgo.toISOString())
        .eq('status', 'completed')

      const todaySales = todayData?.reduce((sum, t) => sum + t.total_amount, 0) || 0
      const todayTransactions = todayData?.length || 0
      const todayCustomers = new Set(todayData?.map(t => t.customer_name).filter(Boolean)).size
      const averageTransaction = todayTransactions > 0 ? todaySales / todayTransactions : 0

      const weekSales = weekData?.reduce((sum, t) => sum + t.total_amount, 0) || 0
      const monthSales = monthData?.reduce((sum, t) => sum + t.total_amount, 0) || 0

      const weeklyGrowth = weekSales > 0 ? ((todaySales - weekSales) / weekSales) * 100 : 0
      const monthlyGrowth = monthSales > 0 ? ((todaySales - monthSales) / monthSales) * 100 : 0

      setMetrics({
        todaySales,
        todayTransactions,
        todayCustomers,
        averageTransaction,
        weeklyGrowth,
        monthlyGrowth
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  // Fetch sales data
  const fetchSalesData = async () => {
    if (!user || !startDate || !endDate) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('created_at, total_amount, customer_name')
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .eq('status', 'completed')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date
      const groupedData: { [key: string]: SalesData } = {}

      data?.forEach(transaction => {
        const date = transaction.created_at.split('T')[0]
        if (!groupedData[date]) {
          groupedData[date] = {
            date,
            total_sales: 0,
            transaction_count: 0,
            customer_count: 0
          }
        }

        groupedData[date].total_sales += transaction.total_amount
        groupedData[date].transaction_count += 1
        if (transaction.customer_name) {
          groupedData[date].customer_count += 1
        }
      })

      setSalesData(Object.values(groupedData))
    } catch (error) {
      console.error('Error fetching sales data:', error)
      toast.error('Gagal memuat data penjualan')
    }
  }

  // Fetch product sales
  const fetchProductSales = async () => {
    if (!user || !startDate || !endDate) return

    try {
      const { data, error } = await supabase
        .from('transaction_items')
        .select(`
          product_name,
          quantity,
          unit_price,
          total_price,
          transactions!inner (
            created_at,
            status,
            tenant_id
          ),
          products (
            category
          )
        `)
        .eq('transactions.tenant_id', user.tenant_id)
        .gte('transactions.created_at', startDate)
        .lte('transactions.created_at', endDate + 'T23:59:59')
        .eq('transactions.status', 'completed')

      if (error) throw error

      // Group by product
      const productMap: { [key: string]: ProductSales } = {}

      data?.forEach(item => {
        const productName = item.product_name
        if (!productMap[productName]) {
          productMap[productName] = {
            product_name: productName,
            category: (item.products as any)?.category || 'Unknown',
            quantity_sold: 0,
            total_revenue: 0,
            profit_margin: 0
          }
        }

        productMap[productName].quantity_sold += item.quantity
        productMap[productName].total_revenue += item.total_price
        // Simplified profit margin calculation (assuming 30% margin)
        productMap[productName].profit_margin = 30
      })

      const sortedProducts = Object.values(productMap)
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10)

      setProductSales(sortedProducts)
    } catch (error) {
      console.error('Error fetching product sales:', error)
      toast.error('Gagal memuat data produk')
    }
  }

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    if (!user || !startDate || !endDate) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('payment_method, total_amount')
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .eq('status', 'completed')

      if (error) throw error

      // Group by payment method
      const methodMap: { [key: string]: { count: number, total: number } } = {}
      let grandTotal = 0

      data?.forEach(transaction => {
        const method = transaction.payment_method
        if (!methodMap[method]) {
          methodMap[method] = { count: 0, total: 0 }
        }

        methodMap[method].count += 1
        methodMap[method].total += transaction.total_amount
        grandTotal += transaction.total_amount
      })

      const paymentData = Object.entries(methodMap).map(([method, data]) => ({
        payment_method: method,
        count: data.count,
        total_amount: data.total,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0
      }))

      setPaymentMethods(paymentData)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      toast.error('Gagal memuat data metode pembayaran')
    }
  }

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchMetrics(),
        fetchSalesData(),
        fetchProductSales(),
        fetchPaymentMethods()
      ]).finally(() => setLoading(false))
    }
  }, [user, startDate, endDate])

  // Export to Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new()

      // Sales data sheet
      const salesWs = XLSX.utils.json_to_sheet(salesData.map(item => ({
        'Tanggal': formatDate(item.date),
        'Total Penjualan': item.total_sales,
        'Jumlah Transaksi': item.transaction_count,
        'Jumlah Pelanggan': item.customer_count
      })))
      XLSX.utils.book_append_sheet(wb, salesWs, 'Penjualan Harian')

      // Product sales sheet
      const productWs = XLSX.utils.json_to_sheet(productSales.map(item => ({
        'Produk': item.product_name,
        'Kategori': item.category,
        'Terjual': item.quantity_sold,
        'Revenue': item.total_revenue,
        'Margin (%)': item.profit_margin
      })))
      XLSX.utils.book_append_sheet(wb, productWs, 'Produk Terlaris')

      // Payment methods sheet
      const paymentWs = XLSX.utils.json_to_sheet(paymentMethods.map(item => ({
        'Metode Pembayaran': item.payment_method,
        'Jumlah Transaksi': item.count,
        'Total Amount': item.total_amount,
        'Persentase (%)': item.percentage.toFixed(1)
      })))
      XLSX.utils.book_append_sheet(wb, paymentWs, 'Metode Pembayaran')

      const fileName = `laporan-kasir-${startDate}-${endDate}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast.success('Laporan Excel berhasil diunduh')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Gagal mengexport ke Excel')
    }
  }

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF()

      // Header
      doc.setFontSize(18)
      doc.text('Laporan Penjualan Kasir', 20, 20)
      doc.setFontSize(12)
      doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, 30)
      doc.text(`Kasir: ${user?.name || 'Unknown'}`, 20, 40)

      let yPos = 60

      // Metrics summary
      doc.setFontSize(14)
      doc.text('Ringkasan Metrics', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.text(`Total Penjualan Hari Ini: ${formatPrice(metrics.todaySales)}`, 20, yPos)
      yPos += 8
      doc.text(`Jumlah Transaksi: ${metrics.todayTransactions}`, 20, yPos)
      yPos += 8
      doc.text(`Rata-rata per Transaksi: ${formatPrice(metrics.averageTransaction)}`, 20, yPos)
      yPos += 8
      doc.text(`Pertumbuhan Mingguan: ${formatPercentage(metrics.weeklyGrowth)}`, 20, yPos)
      yPos += 20

      // Top products table
      doc.setFontSize(14)
      doc.text('Produk Terlaris', 20, yPos)
      yPos += 15

      // Table headers
      doc.setFontSize(9)
      doc.text('Produk', 20, yPos)
      doc.text('Kategori', 80, yPos)
      doc.text('Terjual', 120, yPos)
      doc.text('Revenue', 150, yPos)
      yPos += 8

      // Draw line
      doc.line(20, yPos - 2, 190, yPos - 2)

      // Table data
      productSales.slice(0, 10).forEach((product) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.text(product.product_name.substring(0, 25), 20, yPos)
        doc.text(product.category, 80, yPos)
        doc.text(product.quantity_sold.toString(), 120, yPos)
        doc.text(formatPrice(product.total_revenue), 150, yPos)
        yPos += 8
      })

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Halaman ${i} dari ${pageCount}`, 170, 285)
        doc.text(`Digenerate pada ${new Date().toLocaleString('id-ID')}`, 20, 285)
      }

      const fileName = `laporan-kasir-${startDate}-${endDate}.pdf`
      doc.save(fileName)

      toast.success('Laporan PDF berhasil diunduh')
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error('Gagal mengexport ke PDF')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Laporan Penjualan</h1>
          <p className="text-slate-600 dark:text-slate-300">Analytics dan insights penjualan kasir</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Hari Ini</SelectItem>
                <SelectItem value="7">7 Hari Terakhir</SelectItem>
                <SelectItem value="30">30 Hari Terakhir</SelectItem>
                <SelectItem value="90">3 Bulan Terakhir</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === 'custom' && (
              <>
                <div>
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tanggal Akhir</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.todaySales)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {metrics.weeklyGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              )}
              {formatPercentage(metrics.weeklyGrowth)} dari minggu lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Transaksi berhasil
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Hari Ini</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Pelanggan unik
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.averageTransaction)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Tren Penjualan Harian
            </CardTitle>
            <CardDescription>
              Penjualan dalam periode {dateRange === 'custom' ? 'custom' : `${dateRange} hari terakhir`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Tidak ada data penjualan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {salesData.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">{formatDate(day.date)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(day.total_sales)}</div>
                      <div className="text-xs text-slate-500">{day.transaction_count} transaksi</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Metode Pembayaran
            </CardTitle>
            <CardDescription>
              Distribusi metode pembayaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Tidak ada data pembayaran</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.payment_method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {method.payment_method === 'cash' && '💵'}
                        {method.payment_method === 'card' && '💳'}
                        {method.payment_method === 'digital' && '📱'}
                        {method.payment_method.charAt(0).toUpperCase() + method.payment_method.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(method.total_amount)}</div>
                      <div className="text-xs text-slate-500">
                        {method.count} transaksi ({method.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Produk Terlaris
          </CardTitle>
          <CardDescription>
            10 produk dengan penjualan tertinggi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productSales.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">Tidak ada data produk</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Terjual</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productSales.map((product, index) => (
                    <TableRow key={product.product_name}>
                      <TableCell>
                        <div className="flex items-center">
                          {index < 3 && (
                            <span className="mr-2">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                            </span>
                          )}
                          #{index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{product.quantity_sold}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(product.total_revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600">{product.profit_margin}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Sales Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Ringkasan Penjualan Harian
          </CardTitle>
          <CardDescription>
            Detail penjualan per hari dalam periode yang dipilih
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesData.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">Tidak ada data penjualan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Total Penjualan</TableHead>
                    <TableHead className="text-right">Transaksi</TableHead>
                    <TableHead className="text-right">Pelanggan</TableHead>
                    <TableHead className="text-right">Rata-rata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">{formatDate(day.date)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(day.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">{day.transaction_count}</TableCell>
                      <TableCell className="text-right">{day.customer_count}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(day.transaction_count > 0 ? day.total_sales / day.transaction_count : 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}