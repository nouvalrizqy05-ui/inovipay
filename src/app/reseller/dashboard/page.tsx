'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import FiturPenjualan from '@/components/fitur-penjualan'
import { 
  CreditCard, Star, Plus, 
  Smartphone, Wifi, Gamepad2, Gift, Zap, PhoneCall, Ticket, Tv, Clock, 
  MessageCircle, QrCode, Flame, Droplet, Globe, HeartPulse, Landmark, 
  Home, Briefcase, PlugZap, Router, MoreHorizontal, SmartphoneNfc,
  Search, ScanLine, Wallet, RefreshCw
} from 'lucide-react'

const PRABAYAR_MENU = [
  { label: 'Pulsa',         icon: Smartphone, href: 'pulsa',             color: 'text-teal-500 bg-teal-50' },
  { label: 'Data',          icon: Wifi,       href: 'data',              color: 'text-blue-500 bg-blue-50' },
  { label: 'Games',         icon: Gamepad2,   href: 'games',             color: 'text-purple-500 bg-purple-50' },
  { label: 'Voucher',       icon: Gift,       href: 'voucher',           color: 'text-pink-500 bg-pink-50' },
  { label: 'E-Money',       icon: CreditCard, href: 'emoney',            color: 'text-cyan-500 bg-cyan-50' },
  { label: 'PLN',           icon: Zap,        href: 'pln-token',         color: 'text-yellow-500 bg-yellow-50' },
  { label: 'Paket SMS\n& Telpon', icon: PhoneCall, href: 'paket-sms-telpon', color: 'text-indigo-500 bg-indigo-50' },
  { label: 'Aktivasi\nVoucher',  icon: Ticket, href: 'aktivasi-voucher', color: 'text-rose-500 bg-rose-50' },
  { label: 'TV',            icon: Tv,         href: 'tv',                color: 'text-sky-500 bg-sky-50' },
  { label: 'Masa Aktif',    icon: Clock,      href: 'masa-aktif',        color: 'text-orange-500 bg-orange-50' },
  { label: 'Aktivasi\nPerdana',  icon: SmartphoneNfc, href: 'aktivasi-perdana', color: 'text-lime-600 bg-lime-50' },
  { label: 'Media\nSosial',     icon: MessageCircle, href: 'media-sosial',    color: 'text-violet-500 bg-violet-50' },
  { label: 'eSIM',          icon: QrCode,     href: 'esim',              color: 'text-fuchsia-500 bg-fuchsia-50' },
  { label: 'Gas',           icon: Flame,      href: 'gas',               color: 'text-amber-500 bg-amber-50' },
]

const PASCABAYAR_MENU = [
  { label: 'PLN\nPascabayar',    icon: Zap,        href: 'pln-pasca',    color: 'text-yellow-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'PDAM',               icon: Droplet,    href: 'pdam',         color: 'text-blue-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'HP\nPascabayar',     icon: Smartphone, href: 'hp-pasca',     color: 'text-teal-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'Internet\nPascabayar', icon: Globe,    href: 'internet-pasca', color: 'text-indigo-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'BPJS\nKesehatan',    icon: HeartPulse, href: 'bpjs-kesehatan', color: 'text-emerald-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'Multifinance',       icon: Landmark,   href: 'multifinance', color: 'text-purple-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'PBB',                icon: Home,       href: 'pbb',          color: 'text-orange-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'Gas Negara',         icon: Flame,      href: 'gas',          color: 'text-red-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'TV\nPascabayar',     icon: Tv,         href: 'tv',           color: 'text-sky-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'BPJS\nKetenagakerjaan', icon: Briefcase, href: 'bpjs-ketenagakerjaan', color: 'text-cyan-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'PLN Non\nTaglis',    icon: PlugZap,    href: 'pln-nontaglis', color: 'text-amber-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'E-Money',            icon: CreditCard, href: 'emoney-pasca', color: 'text-pink-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'Telkom\nIndiHome',   icon: Router,     href: 'telkom-indihome', color: 'text-blue-500 bg-white border border-gray-100 shadow-sm' },
  { label: 'Indosat\nOoredoo',   icon: Wifi,       href: 'indosat-ooredoo', color: 'text-rose-500 bg-white border border-gray-100 shadow-sm' },
]

// Polyfill CheckCircle2 since we just imported it inside array but not up top
import { CheckCircle2 } from 'lucide-react'

export default function ResellerDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    api.get('/reseller/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const r = await api.get('/reseller/dashboard')
      setData(r.data)
      toast.success('Saldo diperbarui', { style: { background: '#22c55e', color: 'white', border: 'none' } })
    } catch (err) {
      toast.error('Gagal memperbarui saldo')
    } finally {
      setIsRefreshing(false)
    }
  }

  if (loading) return <Loading text="Memuat dashboard..." />

  const wallet = data?.wallet ?? {}

  return (
    <div className="relative pb-24 min-h-screen bg-[#F5F6FA] overflow-x-hidden -mt-16 -mx-4 lg:mt-0 lg:mx-0">
      
      {/* ── TOP BACKGROUND SHAPE ── */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-orange-500 rounded-b-[40px] z-0" />
      
      <div className="relative z-10">
        
        {/* ── HEADER / SALDO CARDS ── */}
        <div className="px-4 pt-2">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mb-4">
            {/* Dekorasi Background */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full opacity-50" />
            <div className="absolute right-12 top-12 w-16 h-16 bg-teal-50 rounded-full opacity-50" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-7 h-7 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">Saldo Anda</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[26px] font-black text-gray-900 tracking-tight leading-none">{formatRupiah(wallet.available ?? 0)}</p>
                  <button onClick={handleRefresh} disabled={isRefreshing} className={`p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-500' : ''}`} />
                  </button>
                </div>
              </div>
              
              <Link href="/reseller/deposit" className="flex flex-col items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 transition-colors text-white rounded-2xl h-14 w-14 shadow-md shadow-orange-500/20 active:scale-95">
                <Plus className="w-6 h-6" />
                <span className="text-[9px] font-bold">Topup</span>
              </Link>
            </div>
          </div>
          
          {/* User Tier & Coins (Extra details placed below cards) */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2 text-white/90">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold">{data?.points ?? 0} Koin Inovi</span>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-white text-[10px] font-bold border border-white/30">
              Tier: {user?.tier?.replace('_',' ') || 'RESELLER'}
            </div>
          </div>
        </div>

        {/* ── FITUR PENJUALAN ── */}
        <FiturPenjualan />

        {/* ── PRODUK DIGITAL (PRABAYAR) ── */}
        <div className="bg-white mx-4 mt-6 p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-3">
            <h2 className="text-[15px] font-bold text-gray-900 leading-tight">Produk Digital</h2>
            <p className="text-[11px] text-gray-500">Beli Pulsa, Paket Data, Act Voucher</p>
          </div>
          
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari Produk Digital..." className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-orange-300 transition-colors" />
          </div>

          <div className="grid grid-cols-5 gap-y-4 gap-x-2">
            {PRABAYAR_MENU.map((m) => (
              <Link key={m.label} href={`/reseller/transaction/${m.href}`}
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${m.color}`}>
                  <m.icon className="w-5 h-5 drop-shadow-sm" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] font-semibold text-gray-700 text-center leading-[1.1] whitespace-pre-line">{m.label}</span>
              </Link>
            ))}
            <Link href="/reseller/transaction/lainnya-prabayar"
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform">
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-50 text-gray-500">
                <MoreHorizontal className="w-5 h-5 drop-shadow-sm" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] font-semibold text-gray-700 text-center leading-[1.1] whitespace-pre-line">Lainnya</span>
            </Link>
          </div>
        </div>

        {/* ── PROMO BANNER (PAKET CUAN) ── */}
        <div className="mx-4 mt-6">
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 text-white relative overflow-hidden shadow-sm border border-orange-400">
            <div className="relative z-10 flex flex-col items-start w-2/3">
              <div className="flex items-center gap-1 text-white font-black text-sm mb-1">
                <Star className="w-4 h-4" /> Paket Cuan <Star className="w-4 h-4" />
              </div>
              <p className="text-xs text-white/90 font-medium leading-tight mb-3">
                Upgrade akunmu! Paket spesial dan dapatkan dengan harga admin terendah!
              </p>
              <button className="bg-white text-orange-500 text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors active:scale-95">
                Beli Sekarang
              </button>
            </div>
            {/* Box graphic replacement */}
            <Gift className="w-20 h-20 text-white/20 absolute -right-2 -bottom-2 rotate-12" />
          </div>
        </div>

        {/* ── TOP UP E-WALLET & TAGIHAN (PASCABAYAR) ── */}
        <div className="bg-white mx-4 mt-6 p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-3">
            <h2 className="text-[15px] font-bold text-gray-900 leading-tight">Top Up E-Walet & Bayar Tagihan</h2>
            <p className="text-[11px] text-gray-500">Top Up E-Walet dan Bayar Tagihan secara mudah dan cepat</p>
          </div>

          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari E-Walet atau Tagihan..." className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-orange-300 transition-colors" />
          </div>

          <div className="grid grid-cols-5 gap-y-4 gap-x-2">
            {PASCABAYAR_MENU.map((m) => (
              <Link key={m.label} href={`/reseller/transaction/${m.href}`}
                className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${m.color}`}>
                  <m.icon className="w-5 h-5 drop-shadow-sm" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] font-semibold text-gray-700 text-center leading-[1.1] whitespace-pre-line">{m.label}</span>
              </Link>
            ))}
            <Link href="/reseller/transaction/lainnya-pasca"
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform">
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-500">
                <MoreHorizontal className="w-5 h-5 drop-shadow-sm" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] font-semibold text-gray-700 text-center leading-[1.1] whitespace-pre-line">Lainnya</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
