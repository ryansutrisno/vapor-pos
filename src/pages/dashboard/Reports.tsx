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
import { useTranslation } from '@/contexts/LanguageContext'
import jsPDF from 'jspdf'
import {
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Filter,
  Package,
  PieChart,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'
import * as XLSX from 'xlsx'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  sku: string
  minimum_stock: number
  tenant_id: string
}

interface StockMovement {
  id: string
  product_id: string
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  notes?: string
  created_at: string
  created_by: string
  tenant_id: string
  product?: Product
}

interface StockReport {
  product_id: string
  product_name: string
  product_sku: string
  category: string
  current_stock: number
  minimum_stock: number
  total_in: number
  total_out: number
  total_movements: number
  last_movement: string
}

// Category labels will be handled by translation function
const getCategoryLabel = (category: string, t: any) => {
  const labels = {
    device: t('reports.categoryLabels.device'),
    liquid: t('reports.categoryLabels.liquid'),
    peripheral: t('reports.categoryLabels.peripheral'),
    service: t('reports.categoryLabels.service')
  }
  return labels[category as keyof typeof labels] || category
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

export default function Reports() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [stockReports, setStockReports] = useState<StockReport[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [reportType, setReportType] = useState('stock_summary')

  // Fetch data functions
  const fetchProducts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error(t('stock.errorFetchingProducts'))
    }
  }

  const fetchStockMovements = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(*)
        `)
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStockMovements(data || [])
    } catch (error) {
      console.error('Error fetching stock movements:', error)
      toast.error(t('stock.errorFetchingMovements'))
    }
  }

  const generateStockReport = () => {
    const reportMap = new Map<string, StockReport>()

    // Initialize with current products
    products.forEach(product => {
      reportMap.set(product.id, {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        category: product.category,
        current_stock: product.stock,
        minimum_stock: product.minimum_stock,
        total_in: 0,
        total_out: 0,
        total_movements: 0,
        last_movement: ''
      })
    })

    // Aggregate stock movements
    stockMovements.forEach(movement => {
      if (movement.product_id && reportMap.has(movement.product_id)) {
        const report = reportMap.get(movement.product_id)!

        if (movement.type === 'in' || movement.type === 'adjustment') {
          report.total_in += movement.quantity
        } else {
          report.total_out += movement.quantity
        }

        report.total_movements += 1

        if (!report.last_movement || movement.created_at > report.last_movement) {
          report.last_movement = movement.created_at
        }
      }
    })

    const reports = Array.from(reportMap.values())

    // Filter by category
    const filteredReports = categoryFilter === 'all'
      ? reports
      : reports.filter(report => report.category === categoryFilter)

    setStockReports(filteredReports)
  }

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchProducts(),
        fetchStockMovements()
      ]).finally(() => setLoading(false))
    }
  }, [user, dateRange])

  useEffect(() => {
    if (products.length > 0) {
      generateStockReport()
    }
  }, [products, stockMovements, categoryFilter])

  // Calculate summary statistics
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.stock <= p.minimum_stock).length
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0)
  const totalMovements = stockMovements.length
  const totalStockIn = stockMovements
    .filter(m => m.type === 'in' || m.type === 'adjustment')
    .reduce((sum, m) => sum + m.quantity, 0)
  const totalStockOut = stockMovements
    .filter(m => m.type === 'out')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Category breakdown
  const categoryBreakdown = ['device', 'liquid', 'peripheral', 'service'].map(category => {
    const categoryProducts = products.filter(p => p.category === category)
    const categoryMovements = stockMovements.filter(m =>
      m.product && m.product.category === category
    )

    return {
      category,
      label: getCategoryLabel(category, t),
      products: categoryProducts.length,
      totalStock: categoryProducts.reduce((sum, p) => sum + p.stock, 0),
      totalValue: categoryProducts.reduce((sum, p) => sum + (p.stock * p.price), 0),
      movements: categoryMovements.length
    }
  })

  const exportToExcel = () => {
    const worksheetData = [
      [t('reports.product'), t('reports.sku'), t('reports.category'), t('reports.currentStock'), t('reports.minStock'), t('reports.totalIn'), t('reports.totalOut'), t('reports.totalMovements'), t('reports.lastMovement')],
      ...stockReports.map(report => [
        report.product_name,
        report.product_sku,
        getCategoryLabel(report.category, t),
        report.current_stock,
        report.minimum_stock,
        report.total_in,
        report.total_out,
        report.total_movements,
        report.last_movement ? formatDate(report.last_movement) : '-'
      ])
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()

    // Set column widths
    worksheet['!cols'] = [
      { width: 25 }, // Produk
      { width: 15 }, // SKU
      { width: 12 }, // Kategori
      { width: 12 }, // Stok Saat Ini
      { width: 12 }, // Minimum Stok
      { width: 12 }, // Total Masuk
      { width: 12 }, // Total Keluar
      { width: 15 }, // Total Pergerakan
      { width: 15 }  // Pergerakan Terakhir
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.title'))
    XLSX.writeFile(workbook, `laporan-stok-${dateRange.start}-${dateRange.end}.xlsx`)
    toast.success(t('reports.excelDownloaded'))
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(16)
    doc.text(t('reports.title'), 14, 22)

    doc.setFontSize(12)
    doc.text(`${t('reports.period')}: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 14, 32)
    doc.text(`${t('reports.totalProducts')}: ${totalProducts || 0} | ${t('reports.lowStock')}: ${lowStockProducts || 0}`, 14, 42)
    doc.text(`${t('reports.inventoryValue')}: ${formatPrice(totalStockValue || 0)}`, 14, 52)

    // Table header
    doc.setFontSize(10)
    let yPos = 70
    const headers = [t('reports.product'), 'SKU', t('reports.category'), t('reports.stock'), t('reports.min'), t('reports.in'), t('reports.out'), t('reports.movement'), t('reports.last')]
    const colWidths = [35, 20, 20, 15, 15, 15, 15, 20, 25]
    let xPos = 14

    // Draw header
    doc.setFillColor(59, 130, 246)
    doc.rect(14, yPos - 5, 180, 10, 'F')
    doc.setTextColor(255, 255, 255)

    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, yPos)
      xPos += colWidths[index]
    })

    // Reset text color and move to next row
    doc.setTextColor(0, 0, 0)
    yPos += 15

    // Table data
    doc.setFontSize(8)
    stockReports.slice(0, 25).forEach((report, index) => { // Limit to 25 rows to fit on page
      if (yPos > 270) { // Start new page if needed
        doc.addPage()
        yPos = 20
      }

      xPos = 14
      const rowData = [
        (report.product_name || '').substring(0, 15), // Truncate long names
        report.product_sku || '',
        getCategoryLabel(report.category, t) || report.category || '',
        (report.current_stock || 0).toString(),
        (report.minimum_stock || 0).toString(),
        (report.total_in || 0).toString(),
        (report.total_out || 0).toString(),
        (report.total_movements || 0).toString(),
        report.last_movement ? formatDate(report.last_movement) : '-'
      ]

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(14, yPos - 5, 180, 10, 'F')
      }

      rowData.forEach((data, colIndex) => {
        const textData = String(data || '')
        if (textData) {
          doc.text(textData, xPos + 2, yPos)
        }
        xPos += colWidths[colIndex]
      })

      yPos += 10
    })

    // Footer
    if (stockReports.length > 25) {
      doc.setFontSize(10)
      doc.text(`${t('reports.showing')} 25 ${t('reports.of')} ${stockReports.length} ${t('reports.products')}`, 14, yPos + 10)
    }

    doc.save(`laporan-stok-${dateRange.start}-${dateRange.end}.pdf`)
    toast.success(t('reports.pdfDownloaded'))
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('reports.title')}</h1>
          <p className="text-slate-600 dark:text-slate-300">{t('reports.subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {t('reports.exportExcel')}
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            {t('reports.exportPDF')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            {t('reports.filterReport')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">{t('reports.startDate')}</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">{t('reports.endDate')}</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category-filter">{t('reports.category')}</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allCategories')}</SelectItem>
                  <SelectItem value="device">{t('reports.categoryLabels.device')}</SelectItem>
                  <SelectItem value="liquid">{t('reports.categoryLabels.liquid')}</SelectItem>
                  <SelectItem value="peripheral">{t('reports.categoryLabels.peripheral')}</SelectItem>
                  <SelectItem value="service">{t('reports.categoryLabels.service')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-type">{t('reports.reportType')}</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_summary">{t('reports.stockSummary')}</SelectItem>
                  <SelectItem value="movement_detail">{t('reports.movementDetail')}</SelectItem>
                  <SelectItem value="category_analysis">{t('reports.categoryAnalysis')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalProducts')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.productsRegistered')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.lowStock')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.needRefill')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.inventoryValue')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.totalStockValue')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.movements')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovements}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.inThisPeriod')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Movement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              {t('reports.stockIn')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalStockIn}</div>
            <p className="text-sm text-muted-foreground">
              {t('reports.totalUnitsIn')} {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
              {t('reports.stockOut')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalStockOut}</div>
            <p className="text-sm text-muted-foreground">
              {t('reports.totalUnitsOut')} {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            {t('reports.categoryBreakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryBreakdown.map((category) => (
              <div key={category.category} className="p-4 border rounded-lg">
                <h3 className="font-medium text-sm mb-2">{category.label}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>{t('reports.products')}: {category.products}</div>
                  <div>{t('reports.totalStock')}: {category.totalStock}</div>
                  <div>{t('reports.value')}: {formatPrice(category.totalValue)}</div>
                  <div>{t('reports.movement')}: {category.movements}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Report Table */}
      {reportType === 'stock_summary' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {t('reports.stockSummaryPerProduct')}
            </CardTitle>
            <CardDescription>
              {t('reports.stockSummaryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stockReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  {t('reports.noDataForPeriod')}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.product')}</TableHead>
                    <TableHead>{t('reports.category')}</TableHead>
                    <TableHead className="text-right">{t('reports.currentStock')}</TableHead>
                    <TableHead className="text-right">{t('reports.minStock')}</TableHead>
                    <TableHead className="text-right">{t('reports.totalIn')}</TableHead>
                    <TableHead className="text-right">{t('reports.totalOut')}</TableHead>
                    <TableHead className="text-right">{t('reports.totalMovements')}</TableHead>
                    <TableHead>{t('reports.lastMovement')}</TableHead>
                    <TableHead>{t('reports.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockReports.map((report) => (
                    <TableRow key={report.product_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.product_name}</div>
                          <div className="text-xs text-slate-500">SKU: {report.product_sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(report.category, t)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {report.current_stock}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.minimum_stock}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        +{report.total_in}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{report.total_out}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.total_movements}
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.last_movement ? formatDate(report.last_movement) : '-'}
                      </TableCell>
                      <TableCell>
                        {report.current_stock <= report.minimum_stock ? (
                          <Badge variant="destructive">{t('reports.running_low')}</Badge>
                        ) : (
                          <Badge variant="default">{t('reports.normal')}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Movement Detail Report */}
      {reportType === 'movement_detail' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {t('reports.stockMovementDetail')}
            </CardTitle>
            <CardDescription>
              {t('reports.stockMovementDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stockMovements.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  {t('reports.noMovementInPeriod')}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.date')}</TableHead>
                    <TableHead>{t('reports.product')}</TableHead>
                    <TableHead>{t('reports.type')}</TableHead>
                    <TableHead className="text-right">{t('reports.quantity')}</TableHead>
                    <TableHead>{t('reports.notes')}</TableHead>
                    <TableHead>{t('reports.by')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.slice(0, 100).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        {formatDate(movement.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{movement.product?.name}</div>
                          <div className="text-xs text-slate-500">
                            SKU: {movement.product?.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={movement.type === 'in' ? 'default' :
                            movement.type === 'out' ? 'destructive' :
                              movement.type === 'transfer' ? 'secondary' : 'outline'}
                        >
                          {movement.type === 'in' && `📈 ${t('reports.in')}`}
                          {movement.type === 'out' && `📉 ${t('reports.out')}`}
                          {movement.type === 'transfer' && `🔄 ${t('reports.transfer')}`}
                          {movement.type === 'adjustment' && `⚖️ ${t('reports.adjustment')}`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={movement.type === 'in' || movement.type === 'adjustment' ?
                          'text-green-600' : 'text-red-600'}>
                          {movement.type === 'in' || movement.type === 'adjustment' ? '+' : '-'}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {movement.notes || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.created_by}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}