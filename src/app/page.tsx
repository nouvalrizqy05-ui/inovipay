import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Simulation from '@/components/landing/Simulation'
import Testimonials from '@/components/landing/Testimonials'
import Faq from '@/components/landing/Faq'
import TrustBar from '@/components/landing/TrustBar'
import ProductCatalog from '@/components/landing/ProductCatalog'
import PriceList from '@/components/landing/PriceList'
import StatsCounter from '@/components/landing/StatsCounter'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import FloatingWhatsApp from '@/components/landing/FloatingWhatsApp'

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <Hero />
        <TrustBar />
        <Features />
        <ProductCatalog />
        <PriceList />
        <HowItWorks />
        <Simulation />
        <StatsCounter />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
