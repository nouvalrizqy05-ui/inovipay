'use client'
import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

export default function Simulation() {
  const [trxPerDay, setTrxPerDay] = useState(25)
  const [margin, setMargin] = useState(2000)

  const dailyProfit = trxPerDay * margin
  const monthlyProfit = dailyProfit * 30

  return (
    <section id="simulasi" className="py-24 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="mb-12 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold text-sm mb-6">
              <Calculator className="w-4 h-4" />
              Kalkulator Keuntungan
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Hitung Sendiri <span className="text-amber-500">Potensi Income Anda!</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Tanpa sadar, semua orang di sekitar Anda butuh pulsa, kuota, atau top-up game. Bayangkan jika mereka membelinya dari Anda. Lihat berapa banyak uang tambahan yang bisa Anda dapatkan setiap bulannya hanya dari *smartphone*.
            </p>
            <ul className="space-y-4 text-gray-700 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                Kerja santai, cukup via WhatsApp
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                Tanpa terikat waktu dan target
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl relative">
            {/* Range Inputs */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-gray-700">Rata-rata Transaksi per Hari</label>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg font-bold">{trxPerDay} Trx</span>
              </div>
              <input 
                type="range" min="1" max="100" value={trxPerDay} 
                onChange={(e) => setTrxPerDay(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-gray-700">Rata-rata Keuntungan (Margin) / Trx</label>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg font-bold">{formatRupiah(margin)}</span>
              </div>
              <input 
                type="range" min="500" max="5000" step="500" value={margin} 
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white text-center shadow-inner">
              <p className="text-gray-400 font-medium mb-1">Potensi Penghasilan Bulanan</p>
              <p className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                {formatRupiah(monthlyProfit)}
              </p>
              <div className="w-full h-px bg-gray-700 my-4"></div>
              <p className="text-sm text-gray-400">
                Peluang nyata tanpa ganggu pekerjaan utama Anda!
              </p>
            </div>
            
          </div>

        </div>
      </div>
    </section>
  )
}
