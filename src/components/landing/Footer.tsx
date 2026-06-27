import { Rocket } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-500 p-1.5 rounded-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white">InoviPay</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
              Platform PPOB andalan untuk Mitra Inovi di seluruh Indonesia. Solusi cerdas mengubah waktu luang menjadi penghasilan tambahan nyata.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Layanan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Pulsa & Data</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Token PLN</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Top-up Game</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">E-Wallet</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Cara Daftar</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Hubungi CS</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} InoviPay. Hak Cipta Dilindungi.</p>
          <p className="mt-4 md:mt-0 text-gray-500">
            Dibuat dengan ❤️ untuk seluruh Mitra Inovi.
          </p>
        </div>
      </div>
    </footer>
  )
}
