import CtaSection from '@/components/landing/CtaSection'
import FaqSection from '@/components/landing/FaqSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import FooterSection from '@/components/landing/FooterSection'
import HeroSection from '@/components/landing/HeroSection'
import Navbar from '@/components/landing/Navbar'
import PricingSection from '@/components/landing/PricingSection'
import ShowcaseSection from '@/components/landing/ShowcaseSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  )
}
