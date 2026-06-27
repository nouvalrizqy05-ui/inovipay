'use client'

import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Search, ChevronLeft, ChevronRight, Smartphone, Wifi, Zap, Droplets,
  Gamepad2, ShoppingBag, Tv, CreditCard, Phone, Signal, Gift, Globe,
  Shield, Radio, Building2, Landmark, FileCheck, Receipt, CircleDollarSign,
  X, ArrowLeft, Clock, CheckCircle2, XCircle
} from 'lucide-react'

// ─── Kategori Prabayar ────────────────────────────
const PRABAYAR_CATEGORIES = [
  { key: 'PULSA',         label: 'Pulsa',              icon: Smartphone,      color: 'bg-green-100 text-green-600' },
  { key: 'DATA',          label: 'Paket Data',         icon: Wifi,            color: 'bg-blue-100 text-blue-600' },
  { key: 'GAME',          label: 'Top-up Game',        icon: Gamepad2,        color: 'bg-purple-100 text-purple-600' },
  { key: 'TOKEN_PLN',     label: 'Token PLN',          icon: Zap,             color: 'bg-yellow-100 text-yellow-600' },
  { key: 'VOUCHER',       label: 'Voucher',            icon: Gift,            color: 'bg-pink-100 text-pink-600' },
  { key: 'EMONEY',        label: 'E-Money',            icon: CreditCard,      color: 'bg-teal-100 text-teal-600' },
  { key: 'SMS_TELPON',    label: 'SMS & Telpon',       icon: Phone,           color: 'bg-indigo-100 text-indigo-600' },
  { key: 'STREAMING',     label: 'Streaming',          icon: Radio,           color: 'bg-red-100 text-red-600' },
  { key: 'TV',            label: 'Paket TV',           icon: Tv,              color: 'bg-sky-100 text-sky-600' },
  { key: 'MASA_AKTIF',    label: 'Masa Aktif',         icon: Clock,           color: 'bg-orange-100 text-orange-600' },
  { key: 'WIFI_ID',       label: 'Wifi.ID',            icon: Globe,           color: 'bg-cyan-100 text-cyan-600' },
  { key: 'LAINNYA',       label: 'Lainnya',            icon: ShoppingBag,     color: 'bg-gray-100 text-gray-600' },
]

// ─── Kategori Pascabayar ──────────────────────────
const PASCABAYAR_CATEGORIES = [
  { key: 'PLN_PASCA',     label: 'PLN Pascabayar',     icon: Zap,             color: 'bg-yellow-100 text-yellow-600' },
  { key: 'PDAM',          label: 'PDAM',               icon: Droplets,        color: 'bg-blue-100 text-blue-600' },
  { key: 'HP_PASCA',      label: 'HP Pascabayar',      icon: Smartphone,      color: 'bg-green-100 text-green-600' },
  { key: 'INTERNET_PASCA',label: 'Internet',           icon: Wifi,            color: 'bg-indigo-100 text-indigo-600' },
  { key: 'BPJS',          label: 'BPJS Kesehatan',     icon: Shield,          color: 'bg-emerald-100 text-emerald-600' },
  { key: 'MULTIFINANCE',  label: 'Multifinance',       icon: Building2,       color: 'bg-gray-100 text-gray-600' },
  { key: 'PBB',           label: 'PBB',                icon: Landmark,        color: 'bg-amber-100 text-amber-600' },
  { key: 'TV_PASCA',      label: 'TV Pascabayar',      icon: Tv,              color: 'bg-sky-100 text-sky-600' },
  { key: 'SAMSAT',        label: 'SAMSAT',             icon: FileCheck,       color: 'bg-red-100 text-red-600' },
  { key: 'GAS_NEGARA',    label: 'Gas Negara',         icon: Zap,             color: 'bg-orange-100 text-orange-600' },
]

// ─── Mapping SKU prefix → kategori ────────────────
function classifyProduct(product: any): string {
  const name = (product.name || '').toLowerCase()
  const code = (product.code || '').toLowerCase()

  // Pascabayar
  if (name.includes('pascabayar') || name.includes('pasca')) {
    if (name.includes('pln'))      return 'PLN_PASCA'
    if (name.includes('pdam'))     return 'PDAM'
    if (name.includes('internet')) return 'INTERNET_PASCA'
    if (name.includes('bpjs'))     return 'BPJS'
    if (name.includes('tv'))       return 'TV_PASCA'
    if (name.includes('hp') || name.includes('halo') || name.includes('xplor') || name.includes('matrix')) return 'HP_PASCA'
    if (name.includes('multifinance') || name.includes('fif') || name.includes('adira') || name.includes('baf')) return 'MULTIFINANCE'
    if (name.includes('pbb'))      return 'PBB'
    if (name.includes('samsat'))   return 'SAMSAT'
    if (name.includes('gas'))      return 'GAS_NEGARA'
    return 'LAINNYA'
  }

  // Prabayar — berdasarkan category dari database atau auto-detect dari nama
  const cat = (product.category || '').toUpperCase()
  if (cat === 'PULSA')     return 'PULSA'
  if (cat === 'DATA')      return 'DATA'
  if (cat === 'TOKEN_PLN') return 'TOKEN_PLN'
  if (cat === 'PDAM')      return 'PDAM'
  if (cat === 'GAME')      return 'GAME'

  // Auto-detect dari nama produk
  if (name.includes('pulsa'))                                        return 'PULSA'
  if (name.includes('data') || name.includes('internet'))            return 'DATA'
  if (name.includes('game') || name.includes('mobile legend') || name.includes('free fire') || name.includes('pubg') || name.includes('valorant') || name.includes('garena') || name.includes('steam')) return 'GAME'
  if (name.includes('token') || name.includes('pln'))                return 'TOKEN_PLN'
  if (name.includes('pdam'))                                         return 'PDAM'
  if (name.includes('voucher'))                                      return 'VOUCHER'
  if (name.includes('gopay') || name.includes('ovo') || name.includes('dana') || name.includes('shopeepay') || name.includes('e-money') || name.includes('emoney') || name.includes('linkaja')) return 'EMONEY'
  if (name.includes('sms') || name.includes('telpon') || name.includes('nelpon')) return 'SMS_TELPON'
  if (name.includes('streaming') || name.includes('spotify') || name.includes('netflix') || name.includes('youtube') || name.includes('vidio') || name.includes('disney')) return 'STREAMING'
  if (name.includes('tv') || code.includes('tv'))                    return 'TV'
  if (name.includes('masa aktif'))                                   return 'MASA_AKTIF'
  if (name.includes('wifi'))                                         return 'WIFI_ID'

  return 'LAINNYA'
}

type ViewState = 'home' | 'products' | 'order' | 'history'

export default function TransactionsPage() {
  // ── State ──
  const [view, setView] = useState<ViewState>('home')
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [targetNumber, setTargetNumber] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [searchProduct, setSearchProduct] = useState('')

  // ── History State ──
  const [txs, setTxs] = useState<any[]>([])
  const [loadingTxs, setLoadingTxs] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    api.get('/products').then(r => setAllProducts(r.data.products)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (view === 'history') fetchTxs()
  }, [view, page])

  async function fetchTxs() {
    setLoadingTxs(true)
    try {
      const res = await api.get(`/transactions?page=${page}&limit=${limit}`)
      setTxs(res.data.transactions)
      setTotal(res.data.total)
    } finally {
      setLoadingTxs(false)
    }
  }

  // ── Group products by classified category ──
  const classifiedProducts = allProducts.map(p => ({ ...p, classifiedCategory: classifyProduct(p) }))

  // Hitung jumlah produk per kategori (untuk menampilkan badge counter)
  const countByCategory: Record<string, number> = {}
  classifiedProducts.forEach(p => {
    countByCategory[p.classifiedCategory] = (countByCategory[p.classifiedCategory] || 0) + 1
  })

  // Filter produk yang termasuk kategori yang dipilih
  const filteredProducts = classifiedProducts
    .filter(p => p.classifiedCategory === selectedCategory)
    .filter(p => !searchProduct || p.name.toLowerCase().includes(searchProduct.toLowerCase()))
    .sort((a, b) => Number(a.sellPrice) - Number(b.sellPrice))

  // Hanya tampilkan kategori yang memiliki produk
  const activePrabayar = PRABAYAR_CATEGORIES.filter(c => (countByCategory[c.key] || 0) > 0)
  const activePascabayar = PASCABAYAR_CATEGORIES.filter(c => (countByCategory[c.key] || 0) > 0)

  function openCategory(key: string, label: string) {
    setSelectedCategory(key)
    setSelectedCategoryLabel(label)
    setSearchProduct('')
    setView('products')
  }

  function openOrder(product: any) {
    setSelectedProduct(product)
    setTargetNumber('')
    setView('order')
  }

  async function handleOrder() {
    if (!targetNumber.trim()) {
      toast.error('Nomor tujuan wajib diisi')
      return
    }
    setOrdering(true)
    try {
      const res = await api.post('/transactions', {
        productId: selectedProduct.id,
        targetNumber: targetNumber.trim(),
      })
      if (res.data.status === 'SUCCESS') {
        toast.success(`Transaksi berhasil! SN: ${res.data.sn}`)
      } else {
        toast.info('Transaksi sedang diproses...')
      }
      setView('history')
      setPage(1)
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Transaksi gagal')
    } finally {
      setOrdering(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) return <Loading text="Memuat produk..." />

  // ───────────────────────────────────────────────
  //  VIEW: Product List (setelah pilih kategori)
  // ───────────────────────────────────────────────
  if (view === 'products') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{selectedCategoryLabel}</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari produk..."
            className="input pl-10"
            value={searchProduct}
            onChange={e => setSearchProduct(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>

        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <Empty text="Tidak ada produk dalam kategori ini" />
        ) : (
          <div className="space-y-2">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => openOrder(product)}
                className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.code}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold text-blue-600 text-sm">{formatRupiah(Number(product.sellPrice))}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ───────────────────────────────────────────────
  //  VIEW: Order Form
  // ───────────────────────────────────────────────
  if (view === 'order' && selectedProduct) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView('products')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Konfirmasi Pembelian</h1>
        </div>

        {/* Product Detail */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <p className="font-bold text-gray-900">{selectedProduct.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{selectedProduct.code}</p>
            </div>
            <p className="text-xl font-bold text-blue-600">{formatRupiah(Number(selectedProduct.sellPrice))}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Nomor Tujuan</label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                className="input text-lg font-mono tracking-wider"
                value={targetNumber}
                onChange={e => setTargetNumber(e.target.value)}
                autoFocus
              />
            </div>

            <button
              onClick={handleOrder}
              disabled={ordering || !targetNumber.trim()}
              className={`w-full py-3.5 px-4 flex justify-center items-center gap-2 rounded-xl text-white font-bold text-base transition-all ${ordering || !targetNumber.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'}`}
            >
              {ordering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ───────────────────────────────────────────────
  //  VIEW: History
  // ───────────────────────────────────────────────
  if (view === 'history') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Riwayat Transaksi</h1>
        </div>

        {loadingTxs ? <Loading /> : txs.length === 0 ? (
          <Empty text="Belum ada riwayat transaksi" />
        ) : (
          <>
            <div className="space-y-3">
              {txs.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{t.product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{t.targetNumber}</p>
                    </div>
                    <span className={getStatusBadge(t.status)}>{getStatusLabel(t.status)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{formatDate(t.createdAt)}</span>
                    <span className="font-bold text-sm text-gray-900">{formatRupiah(Number(t.sellPrice))}</span>
                  </div>
                  {t.sn && (
                    <p className="text-xs text-green-600 mt-1.5 font-mono bg-green-50 px-2 py-1 rounded">SN: {t.sn}</p>
                  )}
                  {t.failReason && (
                    <p className="text-xs text-red-600 mt-1.5 bg-red-50 px-2 py-1 rounded">{t.failReason}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
                <span className="text-sm text-gray-600">Hal {page}/{totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ───────────────────────────────────────────────
  //  VIEW: HOME (Beranda Transaksi — seperti Mitra Konter)
  // ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header with History button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pilih kategori layanan di bawah ini</p>
        </div>
        <button
          onClick={() => { setView('history'); setPage(1) }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Clock className="w-4 h-4" />
          Riwayat
        </button>
      </div>

      {/* ── PRABAYAR ─────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
          <h2 className="text-base font-bold text-gray-900">Isi Ulang / Prabayar</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {activePrabayar.map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.key}
                onClick={() => openCategory(cat.key, cat.label)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.label}</span>
                <span className="text-[10px] text-gray-400">{countByCategory[cat.key]} produk</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── PASCABAYAR ───────────────────────── */}
      {activePascabayar.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-900">Tagihan / Pascabayar</h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {activePascabayar.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.key}
                  onClick={() => openCategory(cat.key, cat.label)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.label}</span>
                  <span className="text-[10px] text-gray-400">{countByCategory[cat.key]} produk</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Info Banner ──────────────────────── */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CircleDollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Harga Termurah & Tercepat ⚡</p>
            <p className="text-xs text-gray-600 mt-1">Semua transaksi diproses otomatis secara real-time melalui InoviPay. Hubungi admin untuk informasi margin terbaik!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
