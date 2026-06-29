'use client'
import { BookOpen, Phone, MessageCircle, HelpCircle, FileText, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'

const TUTORIALS = [
  { title: 'Cara Transaksi Pulsa', desc: 'Panduan lengkap membeli pulsa lewat platform', icon: '📱' },
  { title: 'Cara Top Up Saldo', desc: 'Transfer dan konfirmasi deposit dengan mudah', icon: '💰' },
  { title: 'Cara Mengatur PIN', desc: 'Keamanan transaksi dengan PIN 6 digit', icon: '🔐' },
  { title: 'Cara Simpan Nomor Favorit', desc: 'Hemat waktu dengan daftar nomor favorit', icon: '⭐' },
  { title: 'Cara Melihat Laporan', desc: 'Pantau omzet dan keuntungan harianmu', icon: '📊' },
  { title: 'Naik Level Tier', desc: 'Cara upgrade dari Reseller ke Agen', icon: '🚀' },
]

export default function OfficialPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[#00B4A0]" />
        <h1 className="text-xl font-black text-gray-900">Official InoviStore</h1>
      </div>

      {/* Kontak */}
      <div className="card bg-gradient-to-r from-[#00B4A0] to-[#009B8A] text-white">
        <p className="font-black text-lg mb-1">Butuh Bantuan?</p>
        <p className="text-teal-100 text-sm mb-4">Tim kami siap membantu kamu 24 jam</p>
        <div className="flex gap-2">
          <a href="https://wa.me/6281234567890" target="_blank"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <a href="tel:081234567890"
            className="flex-1 bg-white text-[#00B4A0] text-sm font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 hover:bg-teal-50 transition-all">
            <Phone className="w-4 h-4" /> Telepon
          </a>
        </div>
      </div>

      {/* Rating app */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">Beri Rating Aplikasi</p>
          <p className="text-xs text-gray-500 mt-0.5">Bantu kami berkembang lebih baik</p>
        </div>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>

      {/* Tutorial */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-[#00B4A0]" />
          <h2 className="font-bold text-gray-900">Tutorial & Panduan</h2>
        </div>
        <div className="space-y-1">
          {TUTORIALS.map(t => (
            <button key={t.title} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <span className="text-xl w-8 text-center">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-400 truncate">{t.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Syarat & Kebijakan */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3">Dokumen Legal</h2>
        <div className="space-y-1">
          {[
            { label: 'Syarat & Ketentuan', href: '/terms' },
            { label: 'Kebijakan Privasi', href: '/privacy' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{l.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">InoviStore v1.0.0 · Made with ❤️</p>
    </div>
  )
}
