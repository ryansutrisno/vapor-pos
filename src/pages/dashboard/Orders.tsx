import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from '@/contexts/LanguageContext'
import { handleApiError, showError, showSuccess } from '@/lib/toast'
import { Building, Calendar, CreditCard, Download, Eye, FileText, Filter, Mail, MapPin, Phone, RefreshCw, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Order {
  id: string
  email: string
  customer_name: string
  customer_phone: string
  customer_company: string
  customer_address: string
  customer_notes?: string
  plan_type: string
  billing_cycle: 'monthly' | 'yearly'
  amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'expired'
  payment_gateway?: string
  payment_method?: string
  payment_gateway_transaction_id?: string
  created_at: string
  updated_at: string
  expires_at?: string
  tenant_created: boolean
  tenant_user_id?: string
}

interface OrderStatusHistory {
  id: string
  order_id: string
  old_status: string
  new_status: string
  changed_by?: string
  notes?: string
  created_at: string
}

export default function Orders() {
  const { t } = useTranslation()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistory[]>([])
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    plan_type: 'all',
    date_from: '',
    date_to: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: t('orders.pending') },
      paid: { variant: 'default' as const, label: t('orders.paid') },
      failed: { variant: 'destructive' as const, label: t('orders.failed') },
      expired: { variant: 'outline' as const, label: t('orders.expired') }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPlanName = (planType: string) => {
    const planNames = {
      single_store: t('pricing.singleStore.name'),
      multi_store_5: t('pricing.multiStore5.name'),
      multi_store_20: t('pricing.multiStore20.name'),
      multi_store_unlimited: t('pricing.enterprise.name')
    }
    return planNames[planType as keyof typeof planNames] || planType
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })

      const response = await fetch(`/api/orders?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setPagination(prev => ({ ...prev, total: data.total }))
      } else {
        const errorData = await response.json().catch(() => ({}))
        showError(t('orders.fetchError'), errorData.message || response.statusText)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError(t('orders.networkError'))
      } else {
        handleApiError(error, t('orders.fetchError'))
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetail = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedOrder(data.order)
        setOrderHistory(data.history || [])
        setShowOrderDetail(true)
      } else {
        const errorData = await response.json().catch(() => ({}))
        showError(t('orders.fetchError'), errorData.message || response.statusText)
      }
    } catch (error) {
      console.error('Error fetching order detail:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError(t('orders.networkError'))
      } else {
        handleApiError(error, t('orders.fetchError'))
      }
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        showSuccess(t('orders.statusUpdated'))
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          fetchOrderDetail(orderId)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        showError(t('orders.statusUpdateFailed'), errorData.message || response.statusText)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError(t('orders.networkError'))
      } else {
        handleApiError(error, t('orders.statusUpdateFailed'))
      }
    }
  }

  const createTenantAccount = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paid', force_tenant_creation: true }),
      })

      if (response.ok) {
        showSuccess(t('orders.tenantCreated'))
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          fetchOrderDetail(orderId)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        showError(t('orders.tenantCreationFailed'), errorData.message || response.statusText)
      }
    } catch (error) {
      console.error('Error creating tenant account:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError(t('orders.networkError'))
      } else {
        handleApiError(error, t('orders.tenantCreationFailed'))
      }
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, filters])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('orders.title')}</h1>
          <p className="text-slate-600 dark:text-slate-300">{t('orders.subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('orders.refresh')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('orders.export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            {t('orders.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">{t('orders.search')}</Label>
              <Input
                id="search"
                placeholder={t('orders.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="status">{t('orders.status')}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('orders.allStatus')}</SelectItem>
                  <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                  <SelectItem value="paid">{t('orders.paid')}</SelectItem>
                  <SelectItem value="failed">{t('orders.failed')}</SelectItem>
                  <SelectItem value="expired">{t('orders.expired')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="plan_type">{t('orders.planType')}</Label>
              <Select value={filters.plan_type} onValueChange={(value) => setFilters(prev => ({ ...prev, plan_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('orders.allPlans')}</SelectItem>
                  <SelectItem value="single_store">{t('pricing.singleStore.name')}</SelectItem>
                  <SelectItem value="multi_store_5">{t('pricing.multiStore5.name')}</SelectItem>
                  <SelectItem value="multi_store_20">{t('pricing.multiStore20.name')}</SelectItem>
                  <SelectItem value="multi_store_unlimited">{t('pricing.enterprise.name')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_from">{t('orders.fromDate')}</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date_to">{t('orders.toDate')}</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orders.title')} ({pagination.total})</CardTitle>
          <CardDescription>{t('orders.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('orders.orderId')}</TableHead>
                    <TableHead>{t('orders.customer')}</TableHead>
                    <TableHead>{t('orders.plan')}</TableHead>
                    <TableHead>{t('orders.amount')}</TableHead>
                    <TableHead>{t('orders.status')}</TableHead>
                    <TableHead>{t('orders.tenant')}</TableHead>
                    <TableHead>{t('orders.created')}</TableHead>
                    <TableHead>{t('orders.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-slate-500">{order.email}</div>
                          <div className="text-sm text-slate-500">{order.customer_company}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getPlanName(order.plan_type)}</div>
                          <div className="text-sm text-slate-500 capitalize">{order.billing_cycle}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.amount)}</TableCell>
                      <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                      <TableCell>
                        {order.tenant_created ? (
                          <Badge variant="default">{t('orders.created_')}</Badge>
                        ) : (
                          <Badge variant="outline">{t('orders.notCreated')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchOrderDetail(order.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.payment_status === 'paid' && !order.tenant_created && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('orders.createTenantConfirm')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('orders.createTenantDescription')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => createTenantAccount(order.id)}>
                                    {t('orders.createTenant')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-slate-500">
                  {t('orders.showing')} {(pagination.page - 1) * pagination.limit + 1} {t('orders.to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('orders.of')} {pagination.total} {t('orders.title').toLowerCase()}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    {t('orders.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    {t('orders.next')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('orders.orderDetails')}</DialogTitle>
            <DialogDescription>
              {t('orders.orderInfo')} {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t('orders.orderInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('orders.orderId')}:</span>
                      <span className="font-mono">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('orders.plan')}:</span>
                      <span className="font-medium">{getPlanName(selectedOrder.plan_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('order.period')}:</span>
                      <span className="capitalize">{selectedOrder.billing_cycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('orders.amount')}:</span>
                      <span className="font-bold">{formatPrice(selectedOrder.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('orders.status')}:</span>
                      {getStatusBadge(selectedOrder.payment_status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('orders.tenant')}:</span>
                      {selectedOrder.tenant_created ? (
                        <Badge variant="default">{t('orders.created_')}</Badge>
                      ) : (
                        <Badge variant="outline">{t('orders.notCreated')}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      {t('orders.customerInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-slate-600 min-w-[80px]">{t('orders.name')}:</span>
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span>{selectedOrder.email}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span>{selectedOrder.customer_company}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span>{selectedOrder.customer_address}</span>
                    </div>
                    {selectedOrder.customer_notes && (
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                        <span className="text-sm text-slate-600">{selectedOrder.customer_notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Payment Info */}
              {selectedOrder.payment_gateway && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('orders.paymentInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-600">{t('orders.gateway')}:</span>
                        <div className="font-medium">{selectedOrder.payment_gateway}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">{t('orders.method')}:</span>
                        <div className="font-medium">{selectedOrder.payment_method || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">{t('orders.transactionId')}:</span>
                        <div className="font-mono text-sm">{selectedOrder.payment_gateway_transaction_id || 'N/A'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status History */}
              {orderHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      {t('orders.statusHistory')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {orderHistory.map((history) => (
                        <div key={history.id} className="border-l-2 border-slate-200 pl-4 pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {history.old_status} → {history.new_status}
                              </div>
                              {history.notes && (
                                <div className="text-sm text-slate-600 mt-1">{history.notes}</div>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">
                              {formatDate(history.created_at)}
                            </div>
                          </div>
                          {history.changed_by && (
                            <div className="text-xs text-slate-400 mt-1">
                              {t('orders.changedBy')}: {history.changed_by}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <div className="space-x-2">
                  {selectedOrder.payment_status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                        variant="default"
                      >
                        Mark as Paid
                      </Button>
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'failed')}
                        variant="destructive"
                      >
                        Mark as Failed
                      </Button>
                    </>
                  )}
                  {selectedOrder.payment_status === 'paid' && !selectedOrder.tenant_created && (
                    <Button
                      onClick={() => createTenantAccount(selectedOrder.id)}
                      variant="default"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Tenant Account
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setShowOrderDetail(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}