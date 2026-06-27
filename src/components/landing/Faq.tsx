'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: "Apakah pendaftaran benar-benar gratis?",
    a: "Tentu saja! Menjadi Mitra Inovi 100% gratis tanpa biaya pendaftaran atau admin bulanan tersembunyi."
  },
  {
    q: "Berapa minimum deposit saldo?",
    a: "Tidak ada minimum yang memberatkan. Namun kami menyarankan minimal Rp50.000 agar Anda bisa langsung mencoba transaksi."
  },
  {
    q: "Produk apa saja yang bisa dijual?",
    a: "Sangat lengkap! Mulai dari Pulsa all operator, Paket Data, Token Listrik, PDAM, hingga Top-Up Game seperti Mobile Legends, PUBG, dan Free Fire."
  },
  {
    q: "Bagaimana jika transaksi gagal?",
    a: "Sistem kami beroperasi secara otomatis 24/7. Jika terjadi kegagalan dari pihak provider, saldo Anda akan otomatis dikembalikan (refund) dalam hitungan detik."
  }
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-gray-600">Masih ragu? Temukan jawabannya di sini.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-amber-300 transition-colors">
              <button 
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 flex justify-between items-center bg-gray-50 focus:outline-none"
              >
                <span className="font-bold text-gray-900">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 py-4 bg-white text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
