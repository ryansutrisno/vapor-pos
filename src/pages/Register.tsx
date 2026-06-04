import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/contexts/LanguageContext'
import { handleApiError, showError, showSuccess } from '@/lib/toast'
import { Building, Eye, EyeOff, Mail, MapPin, Phone, Store, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  company: string
  phone: string
  address: string
}

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    address: ''
  })

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showError(t('register.nameRequired'))
      return false
    }
    if (!formData.email.trim()) {
      showError(t('register.emailRequired'))
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError(t('register.emailInvalid'))
      return false
    }
    if (!formData.password) {
      showError(t('register.passwordRequired'))
      return false
    }
    if (formData.password.length < 6) {
      showError(t('register.passwordTooShort'))
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      showError(t('register.passwordMismatch'))
      return false
    }
    if (!formData.company.trim()) {
      showError(t('register.companyRequired'))
      return false
    }
    if (!formData.phone.trim()) {
      showError(t('register.phoneRequired'))
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          company: formData.company.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        }),
      })

      if (response.ok) {
        await response.json()
        showSuccess(t('register.success'), t('register.successDescription'))
        // Redirect to email verification page
        navigate('/verify-email', {
          state: {
            email: formData.email.trim().toLowerCase(),
            message: t('register.checkEmail')
          }
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 409) {
          showError(t('register.emailExists'))
        } else {
          showError(t('register.error'), errorData.message || response.statusText)
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError(t('register.networkError'))
      } else {
        handleApiError(error, t('register.error'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to='/'>
              <div className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.08]">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">VaporaPOS</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-primary/10 px-3 py-1.5 rounded-full"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <div className="relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Organic blur shapes */}
        <div className="w-80 h-80 bg-primary/15 rounded-full blur-3xl absolute -top-20 -right-20" aria-hidden="true" />
        <div className="w-64 h-64 bg-secondary/20 rounded-full blur-3xl absolute bottom-10 -left-20" aria-hidden="true" />
        <div className="w-48 h-48 bg-[var(--md-tertiary)]/10 rounded-full blur-3xl absolute top-1/2 right-1/4" aria-hidden="true" />

        <Card className="w-full max-w-lg shadow-lg relative z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">{t('register.title')}</CardTitle>
            {/* Decorative accent line */}
            <div className="mx-auto mt-2 mb-1 w-12 h-1 rounded-full bg-primary/60" aria-hidden="true" />
            <CardDescription>{t('register.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {t('register.fullName')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('register.fullNamePlaceholder')}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {t('auth.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('register.emailPlaceholder')}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={t('register.passwordPlaceholder')}
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-4 h-4 w-4 text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Company */}
              <div className="space-y-1">
                <Label htmlFor="company" className="flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  {t('register.companyName')}
                </Label>
                <Input
                  id="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder={t('register.companyPlaceholder')}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {t('register.phoneNumber')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('register.phonePlaceholder')}
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {t('register.address')}
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('register.addressPlaceholder')}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('register.processing') : t('register.startTrial')}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('register.alreadyHaveAccount')}{' '}
                <Link to="/login" className="font-medium text-primary hover:underline transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                  {t('auth.signIn')}
                </Link>
              </p>
            </div>

            {/* Trial Info */}
            <div className="mt-4 p-4 bg-secondary rounded-3xl">
              <p className="text-sm text-secondary-foreground text-center">
                {t('register.trialInfo')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}