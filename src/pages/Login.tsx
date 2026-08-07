/* eslint-disable prefer-const */
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/contexts/LanguageContext'
import { Eye, EyeOff, Store } from 'lucide-react'
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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to='/'>
              <div className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.08]">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">VaporPOS</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content - two grid layout */}
      <div className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        {/* Left side - Branding (desktop only) */}
        <div className="hidden lg:flex relative flex-col justify-center px-12 xl:px-20 overflow-hidden">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 -right-16 w-[24rem] h-[24rem] rounded-full bg-[hsl(var(--color-secondary))]/15 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-[18rem] h-[18rem] rounded-full bg-[hsl(var(--color-accent))]/10 blur-3xl" />
          </div>

          {/* Brand mark */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Store className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">VaporPOS</span>
          </div>

          {/* Badge */}
          <span className="inline-flex items-center self-start gap-2 rounded-full bg-[hsl(var(--color-accent))]/15 text-[hsl(var(--color-accent-dark,41_95%_45%))] dark:text-[hsl(var(--color-accent))] px-4 py-1.5 text-xs font-semibold tracking-wide ring-1 ring-[hsl(var(--color-accent))]/30 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-accent))]" />
            {t('landing.hero.badge')}
          </span>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-xl">
            {t('landing.hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">
            {t('landing.hero.subtitle')}
          </p>

          {/* Accent line */}
          <div className="mt-8 w-16 h-1 rounded-full bg-primary/60" aria-hidden="true" />
        </div>

        {/* Right side - Login form */}
        <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
          {/* Organic blur shapes */}
          <div className="w-80 h-80 bg-primary/15 rounded-full blur-3xl absolute -top-20 -right-20" aria-hidden="true" />
          <div className="w-64 h-64 bg-secondary/20 rounded-full blur-3xl absolute bottom-10 -left-20" aria-hidden="true" />
          <div className="w-48 h-48 bg-[var(--md-tertiary)]/10 rounded-full blur-3xl absolute top-1/2 right-1/4" aria-hidden="true" />

          <Card className="w-full max-w-md shadow-lg relative z-10">
            <CardHeader className="text-center pb-2">
              {/* Mobile brand mark (hidden on desktop where left panel shows) */}
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <Store className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">VaporPOS</span>
              </div>

              <CardTitle className="text-2xl font-bold text-foreground">{t('auth.loginTitle')}</CardTitle>
              {/* Decorative accent line */}
              <div className="mx-auto mt-2 mb-1 w-12 h-1 rounded-full bg-primary/60" aria-hidden="true" />
              <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
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
                      className="absolute right-3 top-4 h-4 w-4 text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('auth.signIn')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('auth.noAccess')}{' '}
                  <Link to="/order" className="font-medium text-primary hover:underline transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                    {t('auth.orderNow')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}