import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Simulation from '@/components/landing/Simulation'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'
import Faq from '@/components/landing/Faq'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <Simulation />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Faq />
        
        {/* Additional CTA Section */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-600 py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-96 h-96 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-yellow-300/20 rounded-full blur-2xl" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Siap Memulai Perjalanan Sukses Anda?
            </h2>
            <p className="text-amber-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
              Ribuan pencari sidejob telah membuktikan kemudahan meraih penghasilan tambahan bersama InoviPay. Jangan buang waktu luang Anda, jadikan mesin pencetak uang sekarang juga!
            </p>
            <a 
              href="/auth/register" 
              className="inline-block bg-white text-orange-600 font-extrabold px-12 py-5 rounded-full hover:bg-gray-50 hover:scale-105 transition-all shadow-2xl text-lg"
            >
              Daftar Sekarang - 100% Gratis!
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
