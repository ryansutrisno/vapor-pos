/* eslint-disable @typescript-eslint/no-explicit-any */
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
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
import { Building, Check, CreditCard, Mail, MapPin, Phone, Store, User } from 'lucide-react'
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
    const validPlans: PlanType[] = ['single_store', 'multi_store_5', 'multi_store_20']

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

  const pricingPlans = getPricingPlans(language).slice(0, 3)

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
    <div className="min-h-screen bg-background">
      {/* Organic blur shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to='/' className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.08]">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">VaporPOS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              <Link to="/login">
                <Button variant="ghost">{t('order.login')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Page Title Area */}
        <div className="text-center mb-12 relative">
          {/* Decorative organic shape behind title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="w-[300px] h-[120px] rounded-full bg-primary/8 blur-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 relative">
            {t('order.title')}
          </h1>
          <p className="text-lg text-muted-foreground relative">
            {t('order.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Plan Selection */}
          <div className="relative">
            {/* Subtle blur shapes behind plan cards */}
            <div className="absolute -top-8 -left-8 w-[200px] h-[200px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" aria-hidden="true" />

            <h2 className="text-2xl font-medium text-foreground mb-6 relative">{t('order.selectPlan')}</h2>

            {/* Billing Toggle - Pill-shaped */}
            <div className="flex items-center justify-center mb-8 bg-muted rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-md ${billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('common.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-md ${billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('common.yearly')}
                <Badge variant="secondary" className="ml-2">{t('landing.saveTwoMonths')}</Badge>
              </button>
            </div>

            <div className="space-y-4 relative">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer group transition-all duration-300 ease-md ${selectedPlan === plan.id
                    ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                    : 'hover:shadow-md hover:scale-[1.01]'
                    }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {formatPrice(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          /{billingCycle === 'monthly' ? t('common.month') : t('common.year')}
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatPrice(plan.originalYearlyPrice)}/{t('common.year')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-foreground">
                        <Check className="w-4 h-4 text-[hsl(var(--color-secondary))] mr-2 shrink-0" />
                        {t('common.maximum')} {plan.maxStores} {typeof plan.maxStores === 'number' ? t('common.store') : ''}
                      </li>
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-foreground">
                          <Check className="w-4 h-4 text-[hsl(var(--color-secondary))] mr-2 shrink-0" />
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
          <div className="relative">
            <h2 className="text-2xl font-medium text-foreground mb-6">{t('order.orderInfo')}</h2>

            <Card className="shadow-lg">
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
                    <div className="space-y-1">
                      <Label htmlFor="name" className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {t('order.fullName')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('order.fullNamePlaceholder')}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {t('auth.email')} <span className="text-destructive">*</span>
                      </Label>
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
                    <div className="space-y-1">
                      <Label htmlFor="company" className="flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {t('order.companyName')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder={t('order.companyPlaceholder')}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {t('order.phoneNumber')} <span className="text-destructive">*</span>
                      </Label>
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

                  <div className="space-y-1">
                    <Label htmlFor="address" className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {t('order.fullAddress')} <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder={t('order.addressPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notes" className="flex items-center gap-1.5">
                      {t('order.additionalNotes')}
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={t('order.notesPlaceholder')}
                      rows={3}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-secondary/50 rounded-2xl p-6 mt-6">
                    <h3 className="font-medium text-foreground mb-3">{t('order.orderSummary')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-foreground">
                        <span>{t('order.package')}</span>
                        <span className="font-medium">{selectedPlanData.name}</span>
                      </div>
                      <div className="flex justify-between text-foreground">
                        <span>{t('order.period')}</span>
                        <span className="font-medium">{billingCycle === 'monthly' ? t('common.monthly') : t('common.yearly')}</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="flex justify-between text-[hsl(var(--color-secondary))]">
                          <span>{t('order.discount')}</span>
                          <span className="font-medium">
                            -{formatPrice(selectedPlanData.originalYearlyPrice - selectedPlanData.yearlyPrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border/50 pt-3 mt-3">
                        <span className="text-lg font-medium text-foreground">{t('order.total')}</span>
                        <span className="text-2xl font-bold text-primary">{formatPrice(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg active:scale-95 transition-all duration-300 ease-md"
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