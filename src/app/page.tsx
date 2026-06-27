import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Simulation from '@/components/landing/Simulation'
import Testimonials from '@/components/landing/Testimonials'
import CTASection from '@/components/landing/CTASection'
import FAQSection from '@/components/landing/FAQSection'
import TrustBar from '@/components/landing/TrustBar'
import ProductCatalog from '@/components/landing/ProductCatalog'
import PriceList from '@/components/landing/PriceList'
import StatsCounter from '@/components/landing/StatsCounter'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <ProductCatalog />
      <PriceList />
      <HowItWorks />
      <Simulation />
      <StatsCounter />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </>
  )
}
