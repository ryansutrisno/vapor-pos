import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/contexts/LanguageContext'
import { handleApiError, showError, showSuccess } from '@/lib/toast'
import { CheckCircle, Clock, Mail, RefreshCw, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export default function VerifyEmail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [countdown, setCountdown] = useState(0)

  // Get email from location state or URL params
  const email = location.state?.email || searchParams.get('email') || ''
  const token = searchParams.get('token')
  const message = location.state?.message || ''

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && email) {
      verifyEmailToken(token, email)
    }
  }, [token, email])

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const verifyEmailToken = async (verificationToken: string, userEmail: string) => {
    setIsVerifying(true)

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationToken,
          email: userEmail
        }),
      })

      if (response.ok) {
        setVerificationStatus('success')
        showSuccess(t('verifyEmail.success'), t('verifyEmail.successDescription'))

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              email: userEmail,
              message: t('verifyEmail.canNowLogin')
            }
          })
        }, 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setVerificationStatus('error')
        if (response.status === 400) {
          showError(t('verifyEmail.invalidToken'))
        } else if (response.status === 404) {
          showError(t('verifyEmail.tokenNotFound'))
        } else {
          showError(t('verifyEmail.error'), errorData.message || response.statusText)
        }
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setVerificationStatus('error')
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError(t('verifyEmail.networkError'))
      } else {
        handleApiError(error, t('verifyEmail.error'))
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!email) {
      showError(t('verifyEmail.emailRequired'))
      return
    }

    setIsResending(true)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        showSuccess(t('verifyEmail.resendSuccess'))
        setCountdown(60) // 60 second cooldown
      } else {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 404) {
          showError(t('verifyEmail.emailNotFound'))
        } else if (response.status === 429) {
          showError(t('verifyEmail.tooManyRequests'))
        } else {
          showError(t('verifyEmail.resendError'), errorData.message || response.statusText)
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError(t('verifyEmail.networkError'))
      } else {
        handleApiError(error, t('verifyEmail.resendError'))
      }
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      case 'error':
        return <Mail className="w-16 h-16 text-red-500 mx-auto" />
      default:
        return isVerifying ? (
          <RefreshCw className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
        ) : (
          <Clock className="w-16 h-16 text-blue-500 mx-auto" />
        )
    }
  }

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return t('verifyEmail.verified')
      case 'error':
        return t('verifyEmail.verificationFailed')
      default:
        return isVerifying ? t('verifyEmail.verifying') : t('verifyEmail.title')
    }
  }

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'success':
        return t('verifyEmail.successDescription')
      case 'error':
        return t('verifyEmail.errorDescription')
      default:
        return isVerifying ? t('verifyEmail.verifyingDescription') : (message || t('verifyEmail.subtitle'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to='/'>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">VaporaPOS</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Verification Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">{getStatusTitle()}</CardTitle>
            <CardDescription>{getStatusDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {email && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{t('verifyEmail.sentTo')}</p>
                <p className="font-medium text-primary">{email}</p>
              </div>
            )}

            {verificationStatus === 'pending' && !isVerifying && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('verifyEmail.checkInbox')}
                  </p>
                </div>

                <Button
                  onClick={resendVerificationEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {countdown > 0
                    ? `${t('verifyEmail.resendIn')} ${countdown}s`
                    : isResending
                      ? t('verifyEmail.resending')
                      : t('verifyEmail.resendEmail')
                  }
                </Button>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center">
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  {t('verifyEmail.redirecting')}
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  {t('verifyEmail.goToLogin')}
                </Button>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <Button
                  onClick={resendVerificationEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {countdown > 0
                    ? `${t('verifyEmail.resendIn')} ${countdown}s`
                    : isResending
                      ? t('verifyEmail.resending')
                      : t('verifyEmail.resendEmail')
                  }
                </Button>

                <Button
                  onClick={() => navigate('/register')}
                  variant="ghost"
                  className="w-full"
                >
                  {t('verifyEmail.backToRegister')}
                </Button>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {t('verifyEmail.helpText')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}