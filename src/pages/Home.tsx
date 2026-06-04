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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to='/'>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">VaporaPOS</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">{t('landing.features')}</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">{t('landing.pricing')}</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">FAQ</a>
              {/* <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.about')}</a> */}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <ThemeToggle />
                <LanguageToggle />
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                >
                  {t('auth.signIn')}
                </Link>
                <Link
                  to="/order"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                >
                  {t('landing.getStarted')}
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-primary/10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative z-50"
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
            <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg z-50 md:hidden transform transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
              <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <nav className="space-y-4">
                  <a 
                    href="#features" 
                    className="block text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('landing.features')}
                  </a>
                  <a 
                    href="#pricing" 
                    className="block text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('landing.pricing')}
                  </a>
                  <a 
                    href="#faq" 
                    className="block text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] py-2"
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
                    className="block text-center text-muted-foreground hover:text-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth.signIn')}
                  </Link>
                  <Link
                    to="/order"
                    className="block bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] text-center"
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
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[48px] bg-card px-6 py-20 sm:px-12 lg:px-20">
            {/* Organic blur shapes */}
            <div className="w-72 h-72 bg-primary/20 rounded-full blur-3xl absolute -top-10 -left-10" aria-hidden="true" />
            <div className="w-96 h-96 bg-secondary/30 rounded-full blur-3xl absolute top-20 right-0 translate-x-1/4" aria-hidden="true" />
            <div className="w-64 h-64 bg-[var(--md-tertiary)]/15 rounded-full blur-3xl absolute bottom-0 left-1/3" aria-hidden="true" />

            <div className="relative z-10 text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
                {t('landing.heroTitle')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                {t('landing.heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto active:scale-95">
                    {t('landing.tryFree')}
                  </Button>
                </Link>
                <Link to="/order">
                  <Button size="lg" className="w-full sm:w-auto active:scale-95">
                    {t('landing.getStarted')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.featuresSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFeatures(t).map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-md hover:scale-[1.02] cursor-pointer group transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-xl font-medium">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-card">
        {/* Organic blur shapes */}
        <div className="w-80 h-80 bg-primary/15 rounded-full blur-3xl absolute -top-20 -right-20" aria-hidden="true" />
        <div className="w-72 h-72 bg-secondary/20 rounded-full blur-3xl absolute bottom-10 -left-10" aria-hidden="true" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
              {t('landing.pricingTitle')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('landing.pricingSubtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {t('common.monthly')}
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${billingCycle === 'yearly' ? 'bg-primary' : 'bg-muted'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {t('common.yearly')}
                <Badge variant="secondary" className="ml-2">{t('landing.saveTwoMonths')}</Badge>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${plan.popular ? 'ring-2 ring-primary md:-translate-y-4 shadow-lg' : 'hover:shadow-md hover:scale-[1.02]'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    {t('landing.mostPopular')}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /{billingCycle === 'monthly' ? t('common.month') : t('common.year')}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(plan.originalYearlyPrice)}/{t('common.year')}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-primary mr-2 shrink-0" />
                      <span className="text-sm">{t('common.maximum')} {plan.maxStores} {typeof plan.maxStores === 'number' ? t('common.store') : ''}</span>
                    </li>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-4 h-4 text-primary mr-2 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to={`/order?plan=${plan.id}`} className="w-full">
                    <Button className={`w-full active:scale-95 ${plan.popular ? '' : ''}`}>
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
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('faq.subtitle')}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-card rounded-3xl px-6 border-0 hover:bg-card/80 transition-colors duration-300">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {t('faq.questions.q1.question')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {t('faq.questions.q1.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-card rounded-3xl px-6 border-0 hover:bg-card/80 transition-colors duration-300">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {t('faq.questions.q2.question')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {t('faq.questions.q2.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-card rounded-3xl px-6 border-0 hover:bg-card/80 transition-colors duration-300">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {t('faq.questions.q3.question')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {t('faq.questions.q3.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="bg-card rounded-3xl px-6 border-0 hover:bg-card/80 transition-colors duration-300">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {t('faq.questions.q4.question')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {t('faq.questions.q4.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="bg-card rounded-3xl px-6 border-0 hover:bg-card/80 transition-colors duration-300">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {t('faq.questions.q5.question')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {t('faq.questions.q5.answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6" className="bg-card rounded-3xl px-6 border-0 hover:bg-card/80 transition-colors duration-300">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {t('faq.questions.q6.question')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {t('faq.questions.q6.answer')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[48px] mx-4 md:mx-8 lg:mx-auto lg:max-w-7xl bg-primary px-6 py-20 sm:px-12">
          {/* Organic blur shapes */}
          <div className="w-80 h-80 bg-white/10 rounded-full blur-3xl absolute -top-10 -left-10" aria-hidden="true" />
          <div className="w-96 h-96 bg-white/5 rounded-full blur-3xl absolute bottom-0 right-0 translate-x-1/4" aria-hidden="true" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              {t('landing.ctaSubtitle')}
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 active:scale-95">
                {t('landing.startNowFree')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">VaporaPOS</span>
              </div>
              <p className="text-background/60">
                {t('landing.footerDescription')}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">{t('footer.product.title')}</h3>
              <ul className="space-y-2 text-background/60">
                {translations[language].footer.product.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">{t('footer.support.title')}</h3>
              <ul className="space-y-2 text-background/60">
                {translations[language].footer.support.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">{t('footer.company.title')}</h3>
              <ul className="space-y-2 text-background/60">
                {translations[language].footer.company.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
            <p>&copy; 2024 VaporaPOS. {t('landing.allRightsReserved')}.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}