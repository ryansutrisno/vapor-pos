/* eslint-disable prefer-const */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import { ArrowLeft, Eye, EyeOff, Store } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        throw authError
      }

      if (!authData?.user) {
        throw new Error('Authentication failed - no user data')
      }

      // Get user profile from users table
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id) // Use auth_id for lookup
        .single()

      if (userError) {
        console.error('User lookup error:', userError)
        // If user not found by auth_id, try fallback by email for migration period
        if (userError.code === 'PGRST116') {
          console.log('User not found by auth_id, trying email fallback...')
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('users')
            .select('*')
            .eq('email', formData.email)
            .single()

          if (fallbackError) {
            throw new Error('User data not found in database')
          }

          // Update the user record with auth_id for future logins
          if (fallbackData && !fallbackData.auth_id) {
            console.log('Updating user record with auth_id...')
            await supabase
              .from('users')
              .update({ auth_id: authData.user.id })
              .eq('id', fallbackData.id)
          }

          userData = fallbackData
        } else {
          throw userError
        }
      }

      if (!userData) {
        throw new Error('User data not found in database')
      }

      // Set user in store
      setUser(userData)

      // Determine redirect URL based on role
      let redirectUrl = '/dashboard'
      switch (userData.role) {
        case 'superadmin':
          redirectUrl = '/dashboard/superadmin'
          break
        case 'admin':
          redirectUrl = '/dashboard/admin'
          break
        case 'warehouse':
          redirectUrl = '/dashboard/warehouse'
          break
        case 'kasir':
          redirectUrl = '/dashboard/kasir'
          break
        default:
          redirectUrl = '/dashboard'
      }

      // Navigate to dashboard
      navigate(redirectUrl, { replace: true })

    } catch (error) {
      setError(error instanceof Error ? error.message : t('auth.loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back')}</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">VaporaPOS</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.signIn')}</CardTitle>
            <CardDescription>
              {t('auth.loginSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('auth.emailPlaceholder')}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={t('auth.passwordPlaceholder')}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.signIn')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t('auth.noAccess')}{' '}
                <Link to="/order" className="text-blue-600 hover:text-blue-500 font-medium">
                  {t('auth.orderNow')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">
              Gunakan akun demo untuk mencoba aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">Superadmin:</span>
                <span className="text-slate-600">superadmin@vaporpos.com</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span className="text-slate-600">admin@demo.com</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Warehouse:</span>
                <span className="text-slate-600">warehouse@demo.com</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Kasir:</span>
                <span className="text-slate-600">kasir@demo.com</span>
              </div>
              <div className="text-center pt-2 border-t">
                <span className="font-medium">Password:</span>
                <span className="text-slate-600 ml-1">demo123</span>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}