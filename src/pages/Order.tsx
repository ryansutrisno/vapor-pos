/* eslint-disable @typescript-eslint/no-explicit-any */
import { LanguageToggle } from '@/components/LanguageToggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/contexts/LanguageContext'
import type { BillingCycle, PlanType } from '@/lib/supabase'
import { showError, showSuccess } from '@/lib/toast'
import { getPricingPlans } from '@/lib/translations'
import { ArrowLeft, Check, CreditCard, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function Order() {
  const [searchParams] = useSearchParams()
  const { t, language } = useTranslation()
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('multi_store_5')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly')

  // Set default plan from URL parameter
  useEffect(() => {
    const planParam = searchParams.get('plan') as PlanType
    const validPlans: PlanType[] = ['single_store', 'multi_store_5', 'multi_store_20', 'multi_store_unlimited']

    if (planParam && validPlans.includes(planParam)) {
      setSelectedPlan(planParam)
    }
  }, [searchParams])
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    phone: '',
    address: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pricingPlans = getPricingPlans(language)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const selectedPlanData = pricingPlans.find(plan => plan.id === selectedPlan)!
  const totalAmount = billingCycle === 'monthly' ? selectedPlanData.monthlyPrice : selectedPlanData.yearlyPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_company: formData.company,
          customer_address: formData.address,
          customer_notes: formData.notes,
          plan_type: selectedPlan,
          billing_cycle: billingCycle,
          amount: totalAmount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const orderData = await response.json()

      // Check if we have Midtrans Snap token
      if (orderData.payment && orderData.payment.token) {
        // Load Midtrans Snap script if not already loaded
        if (!window.snap) {
          const script = document.createElement('script')
          script.src = import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js'
          script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY)
          document.head.appendChild(script)

          // Wait for script to load
          await new Promise((resolve) => {
            script.onload = resolve
          })
        }

        // Open Midtrans Snap payment
        window.snap?.pay(orderData.payment.token, {
          onSuccess: function (result) {
            console.log('Payment success:', result)
            showSuccess(t('order.paymentSuccess'), t('order.paymentSuccessDescription'))
            // Reset form
            setFormData({
              email: '',
              name: '',
              company: '',
              phone: '',
              address: '',
              notes: ''
            })
          },
          onPending: function (result) {
            console.log('Payment pending:', result)
            showError(t('order.paymentPending'), t('order.paymentPendingDescription'))
          },
          onError: function (result) {
            console.log('Payment error:', result)
            showError(t('order.paymentError'), t('order.paymentErrorDescription'))
          },
          onClose: function () {
            console.log('Payment popup closed')
          }
        })
      } else {
        // Fallback: redirect to payment URL
        if (orderData.payment_url) {
          window.location.href = orderData.payment_url
        } else {
          throw new Error('No payment method available')
        }
      }
    } catch (error: any) {
      console.error('Error creating order:', error)
      const errorMessage = error.message || t('order.orderError')
      showError(t('order.orderError'), errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">VaporaPOS</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <Link to="/login">
                <Button variant="ghost">{t('order.login')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {t('order.title')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t('order.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Plan Selection */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('order.selectPlan')}</h2>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {t('common.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {t('common.yearly')}
                <Badge variant="secondary" className="ml-2">{t('landing.saveTwoMonths')}</Badge>
              </button>
            </div>

            <div className="space-y-4">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatPrice(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                        </div>
                        <div className="text-sm text-slate-500">
                          /{billingCycle === 'monthly' ? t('common.month') : t('common.year')}
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-xs text-slate-500 line-through">
                            {formatPrice(plan.originalYearlyPrice)}/{t('common.year')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {t('common.maximum')} {plan.maxStores} {typeof plan.maxStores === 'number' ? t('common.store') : ''}
                      </li>
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Form */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('order.orderInfo')}</h2>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('order.orderDetails')}
                </CardTitle>
                <CardDescription>
                  {t('order.orderDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('order.fullName')}</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('order.fullNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('auth.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t('order.emailPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">{t('order.companyName')}</Label>
                      <Input
                        id="company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder={t('order.companyPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('order.phoneNumber')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t('order.phonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">{t('order.fullAddress')}</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder={t('order.addressPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">{t('order.additionalNotes')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={t('order.notesPlaceholder')}
                      rows={3}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{t('order.orderSummary')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('order.package')}</span>
                        <span className="font-medium">{selectedPlanData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('order.period')}</span>
                        <span className="font-medium">{billingCycle === 'monthly' ? t('common.monthly') : t('common.yearly')}</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="flex justify-between text-green-600">
                          <span>{t('order.discount')}</span>
                          <span className="font-medium">
                            -{formatPrice(selectedPlanData.originalYearlyPrice - selectedPlanData.yearlyPrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>{t('order.total')}</span>
                        <span>{formatPrice(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('order.processing') : t('order.continuePayment')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}