import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  BarChart3,
  Boxes,
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  Maximize,
  Menu,
  Minimize,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  User,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode
}

const getNavigationItems = (t: (key: string) => string) => ({
  superadmin: [
    { name: t('navigation.dashboard'), href: '/dashboard/superadmin', icon: BarChart3 },
    { name: t('navigation.userManagement'), href: '/dashboard/superadmin/users', icon: Users },
    { name: t('navigation.trialManagement'), href: '/dashboard/superadmin/trial-management', icon: User },
    { name: t('navigation.manualActivation'), href: '/dashboard/superadmin/manual-activation', icon: FileText },
    { name: t('navigation.invoiceManagement'), href: '/dashboard/superadmin/invoices', icon: FileText },
    { name: t('navigation.auditLogs'), href: '/dashboard/superadmin/audit-logs', icon: FileText },
    { name: 'Orders', href: '/dashboard/superadmin/orders', icon: ShoppingBag },
    { name: t('navigation.analytics'), href: '/dashboard/superadmin/analytics', icon: BarChart3 },
    { name: t('navigation.settings'), href: '/dashboard/superadmin/settings', icon: Settings }
  ],
  admin: [
    { name: t('navigation.dashboard'), href: '/dashboard/admin', icon: BarChart3 },
    { name: t('navigation.stores'), href: '/dashboard/admin/stores', icon: Store },
    { name: t('navigation.staff'), href: '/dashboard/admin/staff', icon: Users },
    { name: t('navigation.reports'), href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: t('navigation.settings'), href: '/dashboard/admin/settings', icon: Settings }
  ],
  warehouse: [
    { name: t('navigation.dashboard'), href: '/dashboard/warehouse', icon: BarChart3 },
    { name: t('navigation.products'), href: '/dashboard/warehouse/products', icon: Package },
    { name: t('navigation.categories'), href: '/dashboard/warehouse/categories', icon: Tag },
    { name: t('navigation.stock'), href: '/dashboard/warehouse/stock', icon: Boxes },
    { name: t('navigation.reports'), href: '/dashboard/warehouse/reports', icon: BarChart3 }
  ],
  kasir: [
    { name: t('navigation.pos'), href: '/dashboard/kasir', icon: Calculator },
    { name: t('navigation.transactions'), href: '/dashboard/kasir/transactions', icon: ShoppingCart },
    { name: t('navigation.customers'), href: '/dashboard/kasir/customers', icon: Users },
    { name: t('navigation.reports'), href: '/dashboard/kasir/reports', icon: BarChart3 }
  ]
})

const getRoleLabels = (t: (key: string) => string) => ({
  superadmin: t('roles.superadmin'),
  admin: t('roles.admin'),
  warehouse: t('roles.warehouse'),
  kasir: t('roles.kasir')
})

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/superadmin/trial-management')) return 'Trial Management'
    if (path.includes('/superadmin/manual-activation')) return 'Manual Activation'
    if (path.includes('/superadmin/invoices')) return 'Invoice Management'
    if (path.includes('/superadmin/audit-logs')) return 'Audit Logs'
    if (path.includes('/superadmin')) return `${t('roles.superadmin')} ${t('common.dashboard')}`
    if (path.includes('/admin')) return `${t('roles.admin')} ${t('common.dashboard')}`
    if (path.includes('/warehouse')) return `${t('roles.warehouse')} ${t('common.dashboard')}`
    if (path.includes('/kasir')) return `${t('navigation.pos')} ${t('common.dashboard')}`
    if (path.includes('/profile')) return t('common.profile')
    return t('common.dashboard')
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  if (!user) return null

  const userRole = (user?.role as keyof ReturnType<typeof getNavigationItems>) || 'kasir'
  const navigationItems = getNavigationItems(t)
  const roleLabels = getRoleLabels(t)
  const navigation = navigationItems[userRole] || []

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-background border-r border-border 
        transform transition-all duration-300 ease-in-out 
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex items-center justify-between px-4 border-b border-border">
          <div className={`flex items-center space-x-2 h-14 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">VP</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold">Vapora POS</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex h-8 w-8"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <nav className="px-4 py-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                      ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                    `}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Top navigation */}
        <header className={`fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300 ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'}`}>
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-base sm:text-lg font-semibold truncate">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
              <ThemeToggle />
              <LanguageToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {roleLabels[userRole]}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('common.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('common.settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 px-4 sm:px-6 pb-4 sm:pb-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  )
}