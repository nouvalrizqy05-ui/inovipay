import Link from 'next/link'
import { Rocket } from 'lucide-react'

export default function Header() {
  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent tracking-tight">
              InoviPay
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="#fitur" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Keunggulan</Link>
            <Link href="#cara-kerja" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Cara Kerja</Link>
            <Link href="#simulasi" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Simulasi Profit</Link>
            <Link href="#testimoni" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Testimoni</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-amber-600 font-bold hover:text-amber-700 px-4 py-2">
              Masuk
            </Link>
            <Link href="/auth/register" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Daftar Mitra Inovi
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
