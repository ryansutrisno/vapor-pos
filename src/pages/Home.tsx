import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/contexts/LanguageContext'
import { getPricingPlans, translations } from '@/lib/translations'
import { BarChart3, Check, Cloud, Shield, Store, Users, Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const getFeatures = (t: (key: string) => string) => [
  {
    icon: Store,
    title: t('landing.multiStore.title'),
    description: t('landing.multiStore.description')
  },
  {
    icon: Users,
    title: t('landing.roleAccess.title'),
    description: t('landing.roleAccess.description')
  },
  {
    icon: BarChart3,
    title: t('landing.analytics.title'),
    description: t('landing.analytics.description')
  },
  {
    icon: Shield,
    title: t('landing.secure.title'),
    description: t('landing.secure.description')
  },
  {
    icon: Zap,
    title: t('landing.performance.title'),
    description: t('landing.performance.description')
  },
  {
    icon: Cloud,
    title: t('landing.cloud.title'),
    description: t('landing.cloud.description')
  }
]

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, language } = useTranslation()
  const pricingPlans = getPricingPlans(language).map(plan => ({
    ...plan,
    popular: plan.id === 'multi_store_5' // Set popular plan
  }))

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background border-b border-border relative">
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
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.features')}</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.pricing')}</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              {/* <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.about')}</a> */}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <ThemeToggle />
                <LanguageToggle />
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('auth.signIn')}
                </Link>
                <Link
                  to="/order"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t('landing.getStarted')}
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors relative z-50"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile menu content */}
            <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50 md:hidden transform transition-all duration-200 ease-in-out">
              <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <nav className="space-y-4">
                  <a 
                    href="#features" 
                    className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('landing.features')}
                  </a>
                  <a 
                    href="#pricing" 
                    className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('landing.pricing')}
                  </a>
                  <a 
                    href="#faq" 
                    className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </a>
                </nav>
                
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <LanguageToggle />
                  </div>
                </div>
                
                <div className="border-t border-border pt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block text-center text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth.signIn')}
                  </Link>
                  <Link
                    to="/order"
                    className="block bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('landing.getStarted')}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('landing.tryFree')}
              </Button>
            </Link>
            <Link to="/order">
              <Button size="lg" className="w-full sm:w-auto">
                {t('landing.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('landing.featuresSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFeatures(t).map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {t('landing.pricingTitle')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              {t('landing.pricingSubtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'}`}>
                {t('common.monthly')}
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'}`}>
                {t('common.yearly')}
                <Badge variant="secondary" className="ml-2">{t('landing.saveTwoMonths')}</Badge>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-2 ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-slate-200 dark:border-slate-700'} hover:shadow-lg transition-shadow`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    {t('landing.mostPopular')}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                      </span>
                      <span className="text-slate-500 ml-1">
                        /{billingCycle === 'monthly' ? t('common.month') : t('common.year')}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-slate-500 line-through">
                        {formatPrice(plan.originalYearlyPrice)}/{t('common.year')}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{t('common.maximum')} {plan.maxStores} {typeof plan.maxStores === 'number' ? t('common.store') : ''}</span>
                    </li>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to={`/order?plan=${plan.id}`} className="w-full">
                    <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                      {t('landing.selectPlan')}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {t('faq.subtitle')}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:no-underline">
                {t('faq.questions.q1.question')}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 pb-4">
                {t('faq.questions.q1.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:no-underline">
                {t('faq.questions.q2.question')}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 pb-4">
                {t('faq.questions.q2.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:no-underline">
                {t('faq.questions.q3.question')}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 pb-4">
                {t('faq.questions.q3.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:no-underline">
                {t('faq.questions.q4.question')}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 pb-4">
                {t('faq.questions.q4.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:no-underline">
                {t('faq.questions.q5.question')}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 pb-4">
                {t('faq.questions.q5.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:no-underline">
                {t('faq.questions.q6.question')}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 pb-4">
                {t('faq.questions.q6.answer')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('landing.ctaSubtitle')}
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              {t('landing.startNowFree')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VaporaPOS</span>
              </div>
              <p className="text-slate-400">
                {t('landing.footerDescription')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('footer.product.title')}</h3>
              <ul className="space-y-2 text-slate-400">
                {translations[language].footer.product.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('footer.support.title')}</h3>
              <ul className="space-y-2 text-slate-400">
                {translations[language].footer.support.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('footer.company.title')}</h3>
              <ul className="space-y-2 text-slate-400">
                {translations[language].footer.company.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 VaporaPOS. {t('landing.allRightsReserved')}.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}