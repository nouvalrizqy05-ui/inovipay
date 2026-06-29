'use client'
import Link from 'next/link'
import { Calculator, StickyNote, Image as ImageIcon, Printer, Store } from 'lucide-react'

const FITUR = [
  { label: 'Kasir',        icon: Store,       href: '/reseller/kasir',        color: 'bg-orange-500 text-white shadow-md shadow-orange-500/30' },
  { label: 'Catatan',      icon: StickyNote,  href: '/reseller/catatan',      color: 'bg-orange-500 text-white shadow-md shadow-orange-500/30' },
  { label: 'Banner',       icon: ImageIcon,   href: '/reseller/promo',        color: 'bg-orange-500 text-white shadow-md shadow-orange-500/30' },
  { label: 'Kalkulator',   icon: Calculator,  href: '/reseller/kasir',        color: 'bg-orange-500 text-white shadow-md shadow-orange-500/30' },
  { label: 'Cetak Struk',  icon: Printer,     href: '/reseller/transactions', color: 'bg-orange-500 text-white shadow-md shadow-orange-500/30' },
]

export default function FiturPenjualan() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm relative -mt-4 z-10 mx-4 border border-gray-100">
      <div className="mb-4">
        <p className="font-bold text-[15px] text-gray-900 leading-tight">Fitur Penjualan</p>
        <p className="text-[11px] text-gray-500">Fitur pelengkap transaksi penjualan Anda</p>
      </div>
      <div className="flex justify-between items-start">
        {FITUR.map(f => (
          <Link key={f.label} href={f.href}
            className="flex flex-col items-center gap-2 flex-1 transition-colors active:scale-95">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${f.color}`}>
              <f.icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 text-center whitespace-nowrap">{f.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
