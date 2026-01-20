import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import SuperadminDashboard from '@/pages/dashboard/SuperadminDashboard'
import AdminDashboard from '@/pages/dashboard/AdminDashboard'
import WarehouseDashboard from '@/pages/dashboard/WarehouseDashboard'
import KasirDashboard from '@/pages/dashboard/CashierDashboard'
import Profile from '@/pages/dashboard/Profile'
import UserManagement from '@/pages/dashboard/UserManagement'
import Analytics from '@/pages/dashboard/Analytics'
import Settings from '@/pages/dashboard/Settings'
import Stores from '@/pages/dashboard/Stores'
import Staff from '@/pages/dashboard/Staff'
import Reports from '@/pages/dashboard/Reports'
import Products from '@/pages/dashboard/Products'
import Categories from '@/pages/dashboard/Categories'
import Stock from '@/pages/dashboard/Stock'
import Transactions from '@/pages/dashboard/Transactions'
import Customers from '@/pages/dashboard/Customers'
import CashierReports from '@/pages/dashboard/CashierReports'
import Orders from '@/pages/dashboard/Orders'
import { TrialManagementPage } from '@/pages/dashboard/TrialManagement'
import { ManualActivationPage } from '@/pages/dashboard/ManualActivation'
import { AuditLogsPage } from '@/pages/dashboard/AuditLogs'
import { InvoiceManagementPage } from '@/pages/dashboard/InvoiceManagement'

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Dashboard: Auth state check:', { isAuthenticated, user: user?.role, email: user?.email })
    if (!isAuthenticated) {
      console.log('Dashboard: Not authenticated, redirecting to login')
      navigate('/login')
    }
  }, [isAuthenticated, navigate, user])

  useEffect(() => {
    if (user) {
      console.log('Dashboard: User loaded with role:', user.role)
    }
  }, [user])

  if (!isAuthenticated || !user) {
    console.log('Dashboard: Rendering null - not authenticated or no user')
    return null
  }

  console.log('Dashboard: Rendering with user role:', user.role)

  return (
    <DashboardLayout>
      <Routes>
        {/* Role-based dashboard routes */}
        <Route 
          path="/superadmin" 
          element={
            user.role === 'superadmin' ? (
              (() => {
                console.log('Dashboard: Rendering SuperadminDashboard for user:', user.email)
                return <SuperadminDashboard />
              })()
            ) : (
              (() => {
                console.log('Dashboard: Access denied to superadmin, redirecting to:', user.role)
                return <Navigate to={`/dashboard/${user.role}`} replace />
              })()
            )
          } 
        />
        <Route 
          path="/superadmin/users" 
          element={
            user.role === 'superadmin' ? (
              <UserManagement />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/superadmin/analytics" 
          element={
            user.role === 'superadmin' ? (
              <Analytics />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/superadmin/orders" 
          element={
            user.role === 'superadmin' ? (
              <Orders />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/superadmin/settings" 
          element={
            user.role === 'superadmin' ? (
              <Settings />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/superadmin/trial-management" 
          element={
            user.role === 'superadmin' ? (
              <TrialManagementPage />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/superadmin/manual-activation" 
          element={
            user.role === 'superadmin' ? (
              <ManualActivationPage />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/superadmin/audit-logs" 
          element={
            user.role === 'superadmin' ? (
              <AuditLogsPage />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/superadmin/invoices" 
          element={
            user.role === 'superadmin' ? (
              <InvoiceManagementPage />
            ) : (
              <Navigate to={`/dashboard/${user.role}`} replace />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            user.role === 'admin' ? 
            <AdminDashboard /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/admin/stores" 
          element={
            user.role === 'admin' ? 
            <Stores /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/admin/staff" 
          element={
            user.role === 'admin' ? 
            <Staff /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            user.role === 'admin' ? 
            <Reports /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            user.role === 'admin' ? 
            <Settings /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/warehouse" 
          element={
            user.role === 'warehouse' ? 
            <WarehouseDashboard /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/warehouse/products" 
          element={
            user.role === 'warehouse' ? 
            <Products /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/warehouse/categories" 
          element={
            user.role === 'warehouse' ? 
            <Categories /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/warehouse/stock" 
          element={
            user.role === 'warehouse' ? 
            <Stock /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/warehouse/reports" 
          element={
            user.role === 'warehouse' ? 
            <Reports /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/kasir" 
          element={
            user.role === 'kasir' ? 
            <KasirDashboard /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/kasir/transactions" 
          element={
            user.role === 'kasir' ? 
            <Transactions /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/kasir/customers" 
          element={
            user.role === 'kasir' ? 
            <Customers /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        <Route 
          path="/kasir/reports" 
          element={
            user.role === 'kasir' ? 
            <CashierReports /> : 
            <Navigate to={`/dashboard/${user.role}`} replace />
          } 
        />
        
        {/* Common routes */}
        <Route path="/profile" element={<Profile />} />
        
        {/* Default redirect based on role */}
        <Route 
          path="/" 
          element={<Navigate to={`/dashboard/${user.role}`} replace />} 
        />
        
        {/* Catch all - redirect to role dashboard */}
        <Route 
          path="*" 
          element={<Navigate to={`/dashboard/${user.role}`} replace />} 
        />
      </Routes>
    </DashboardLayout>
  )
}