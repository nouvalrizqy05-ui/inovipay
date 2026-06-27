import Link from 'next/link'
import { Rocket } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
          <Rocket className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-9xl font-extrabold text-gray-900 mb-4 tracking-tighter">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Maaf, halaman yang Anda cari mungkin sudah dihapus, namanya diganti, atau untuk sementara tidak tersedia.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-full transition-colors shadow-lg hover:shadow-xl"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
