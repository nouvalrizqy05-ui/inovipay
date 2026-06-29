import Link from 'next/link'
import { ArrowRight, CheckCircle2, Star } from 'lucide-react'
import InstallPwaButton from '../InstallPwaButton'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background decoration matching the image colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-blue-50 -z-10" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-amber-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left Column - Copywriting */}
          <div className="max-w-2xl mb-12 lg:mb-0 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold text-sm mb-6 shadow-sm border border-amber-200">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping absolute"></span>
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              Peluang Sidejob Terbaik 2026 🔥
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Lompat Lebih Tinggi, <br /> Raih Penghasilan Tambahan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Jutaan Rupiah!</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Bergabunglah menjadi <strong>Mitra Inovi</strong>. Platform keagenan PPOB dan Top-up Game termurah yang dirancang khusus untuk Anda yang mencari <em>side-job</em> menguntungkan, tanpa risiko, dan bisa dikerjakan dari mana saja.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
              <Link href="/auth/register" className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg">
                Daftar Sekarang - Gratis
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link href="#simulasi" className="flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 font-bold px-8 py-4 rounded-full transition-all border-2 border-gray-200 shadow-sm text-lg">
                Lihat Simulasi Profit
              </Link>
              <InstallPwaButton className="w-full sm:w-auto" />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="Mitra" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="Mitra" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="Mitra" />
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="ml-2">Telah dipercaya 10.000+ Mitra Inovi</span>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-xl">
            <div className="relative z-10 transform transition-transform hover:-translate-y-2 duration-500">
              <img
                src="/hero-illustration.png"
                alt="InoviStore Kesuksesan Mitra"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>

            {/* Floating badges */}
            <div className="absolute top-10 -left-8 bg-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20 animate-bounce" style={{ animationDuration: '3.5s' }}>
              <div className="bg-green-100 p-2 rounded-full text-xl">🚀</div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Margin Maksimal</p>
                <p className="text-green-600 font-bold text-sm">Cepat Untung</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
