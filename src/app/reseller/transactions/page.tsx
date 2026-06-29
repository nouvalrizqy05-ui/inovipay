'use client'
import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Search, ChevronLeft, ChevronRight, Shield, ArrowLeft, Share2, RefreshCw, Clock, X,
  Smartphone, Wifi, Gamepad2, Gift, Zap, PhoneCall, Ticket, Tv, SmartphoneNfc, 
  MessageCircle, QrCode, Flame, Droplet, Globe, HeartPulse, Landmark, 
  Home, Briefcase, PlugZap, Router, MoreHorizontal, Package, Joystick, CreditCard
} from 'lucide-react'

// ── Category Constants ──

const PRABAYAR = [
  { key: 'PULSA',      label: 'Pulsa',          icon: Smartphone, color: 'bg-green-100 text-green-600' },
  { key: 'DATA',       label: 'Data',           icon: Wifi, color: 'bg-blue-100 text-blue-600' },
  { key: 'GAMES',      label: 'Games',          icon: Gamepad2, color: 'bg-purple-100 text-purple-600' },
  { key: 'VOUCHER',    label: 'Voucher',        icon: Gift, color: 'bg-pink-100 text-pink-600' },
  { key: 'EMONEY',     label: 'E-Money',        icon: CreditCard, color: 'bg-teal-100 text-teal-600' },
  { key: 'TOKEN_PLN',  label: 'PLN',            icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { key: 'PAKET_SMS_TELPON', label: 'Paket SMS & Telpon', icon: PhoneCall, color: 'bg-indigo-100 text-indigo-600' },
  { key: 'AKTIVASI_VOUCHER', label: 'Aktivasi Voucher', icon: Ticket, color: 'bg-rose-100 text-rose-600' },
  { key: 'TV_PRABAYAR', label: 'TV',            icon: Tv, color: 'bg-sky-100 text-sky-600' },
  { key: 'MASA_AKTIF', label: 'Masa Aktif',     icon: Clock, color: 'bg-orange-100 text-orange-600' },
  { key: 'AKTIVASI_PERDANA', label: 'Aktivasi Perdana', icon: SmartphoneNfc, color: 'bg-lime-100 text-lime-600' },
  { key: 'MEDIA_SOSIAL', label: 'Media Sosial', icon: MessageCircle, color: 'bg-violet-100 text-violet-600' },
  { key: 'ESIM',       label: 'eSIM',           icon: QrCode, color: 'bg-cyan-100 text-cyan-600' },
  { key: 'GAS',        label: 'Gas',            icon: Flame, color: 'bg-amber-100 text-amber-600' },
  { key: 'HAYAKA_TOPUP', label: 'Hayaka Topup', icon: Package, color: 'bg-red-100 text-red-600' },
  { key: 'CHINA_TOPUP', label: 'China Topup',   icon: Package, color: 'bg-red-100 text-red-600' },
  { key: 'VIETNAM_TOPUP', label: 'Vietnam Topup', icon: Package, color: 'bg-red-100 text-red-600' },
  { key: 'THAILAND_TOPUP', label: 'Thailand Topup', icon: Package, color: 'bg-blue-100 text-blue-600' },
  { key: 'PHILIPPINES_TOPUP', label: 'Philippines Topup', icon: Package, color: 'bg-blue-100 text-blue-600' },
  { key: 'SRILANKA_TOPUP', label: 'Srilanka Topup', icon: Package, color: 'bg-yellow-100 text-yellow-600' },
  { key: 'BUNDLING',   label: 'Bundling',       icon: Package, color: 'bg-gray-100 text-gray-600' },
  { key: 'GAME',       label: 'Game (Legacy)',  icon: Joystick, color: 'bg-purple-100 text-purple-600' },
  { key: 'LAINNYA',    label: 'Lainnya',        icon: MoreHorizontal,  color: 'bg-gray-100 text-gray-600' },
]

const PASCABAYAR = [
  { key: 'PLN_PASCABAYAR', label: 'PLN Pascabayar', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { key: 'PDAM',       label: 'PDAM',           icon: Droplet, color: 'bg-blue-100 text-blue-600' },
  { key: 'HP_PASCABAYAR', label: 'HP Pascabayar', icon: Smartphone, color: 'bg-green-100 text-green-600' },
  { key: 'INTERNET_PASCABAYAR', label: 'Internet Pascabayar', icon: Globe, color: 'bg-indigo-100 text-indigo-600' },
  { key: 'BPJS_KESEHATAN', label: 'BPJS Kesehatan', icon: HeartPulse, color: 'bg-emerald-100 text-emerald-600' },
  { key: 'MULTIFINANCE', label: 'Multifinance', icon: Landmark, color: 'bg-purple-100 text-purple-600' },
  { key: 'PBB',        label: 'PBB',            icon: Home, color: 'bg-orange-100 text-orange-600' },
  { key: 'GAS_NEGARA', label: 'Gas Negara',     icon: Flame, color: 'bg-orange-100 text-orange-600' },
  { key: 'TV_PASCABAYAR', label: 'TV Pascabayar', icon: Tv, color: 'bg-sky-100 text-sky-600' },
  { key: 'BPJS_KETENAGAKERJAAN', label: 'BPJS Ketenagakerjaan', icon: Briefcase, color: 'bg-teal-100 text-teal-600' },
  { key: 'PLN_NONTAGLIS', label: 'PLN Non Taglis', icon: PlugZap, color: 'bg-amber-100 text-amber-600' },
  { key: 'EMONEY_PASCABAYAR', label: 'E-Money', icon: CreditCard, color: 'bg-pink-100 text-pink-600' },
  { key: 'TELKOM_INDIHOME', label: 'Telkom IndiHome', icon: Router, color: 'bg-cyan-100 text-cyan-600' },
  { key: 'INDOSAT_PASCABAYAR', label: 'Indosat Ooredoo', icon: Wifi, color: 'bg-rose-100 text-rose-600' },
  { key: 'TRI_PASCABAYAR', label: 'Tri', icon: Smartphone, color: 'bg-red-100 text-red-600' },
]

const ALL_CATEGORIES = [...PRABAYAR, ...PASCABAYAR]

// ── Helpers ──

function classifyProduct(p: any): string {
  return (p.category || 'LAINNYA').toUpperCase()
}

function detectOperator(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('telkomsel') || n.includes('tsel') || n.includes('simpati') || n.includes('as ') || n.includes('loop')) return 'Telkomsel'
  if (n.includes('indosat') || n.includes('im3') || n.includes('mentari') || n.includes('ooredoo')) return 'Indosat'
  if (n.includes('xl') || n.includes('xtra')) return 'XL'
  if (n.includes('axis')) return 'Axis'
  if (n.includes('tri') || n.includes('three')) return 'Tri'
  if (n.includes('smartfren') || n.includes('smart')) return 'Smartfren'
  if (n.includes('by.u') || n.includes('byu')) return 'By.U'
  return 'Lainnya'
}

const OPERATOR_CATEGORIES = new Set(['PULSA', 'DATA'])

// ── PIN Modal ──

function PinModal({ onConfirm, onCancel, hasPIN }: { onConfirm: (pin: string) => void; onCancel: () => void; hasPIN: boolean }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  if (!hasPIN) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
        <div className="bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-sm p-6">
          <h3 className="text-lg font-bold text-center mb-2">PIN Belum Diatur</h3>
          <p className="text-sm text-gray-500 text-center mb-4">Atur PIN 6 digit untuk keamanan transaksi di menu Profil.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1">Batal</button>
            <button onClick={() => { onCancel(); window.location.href = '/reseller/profile' }} className="btn-primary flex-1">Atur PIN</button>
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit() {
    if (pin.length !== 6) { toast.error('PIN harus 6 digit'); return }
    setLoading(true)
    try {
      await api.post('/auth/verify-pin', { pin })
      onConfirm(pin)
    } catch {
      toast.error('PIN salah')
      setPin('')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-sm p-6">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1"><X className="w-5 h-5 text-gray-400" /></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#E6F7F5] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-[#00B4A0]" />
          </div>
          <h3 className="text-lg font-bold">Masukkan PIN Transaksi</h3>
          <p className="text-sm text-gray-500 mt-1">PIN 6 digit untuk konfirmasi transaksi</p>
        </div>
        <div className="flex gap-2 justify-center mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-colors ${
              i < pin.length ? 'border-[#00B4A0] bg-[#E6F7F5] text-[#00B4A0]' : 'border-gray-200'
            }`}>
              {i < pin.length ? '●' : ''}
            </div>
          ))}
        </div>
        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
            <button key={i} disabled={k === ''}
              onClick={() => {
                if (k === '⌫') setPin(p => p.slice(0, -1))
                else if (pin.length < 6) setPin(p => p + k)
              }}
              className={`h-12 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                k === '' ? 'invisible' :
                k === '⌫' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' :
                'bg-gray-50 hover:bg-gray-100 text-gray-900'
              }`}>
              {k}
            </button>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={pin.length !== 6 || loading}
          className="btn-primary w-full py-3">
          {loading ? 'Memverifikasi...' : 'Konfirmasi'}
        </button>
      </div>
    </div>
  )
}

// ── Receipt Modal ──

function ReceiptModal({ txId, onClose }: { txId: string; onClose: () => void }) {
  const [receipt, setReceipt] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/transactions/receipt/${txId}`).then(r => setReceipt(r.data.receipt)).finally(() => setLoading(false))
  }, [txId])

  function shareWA() {
    if (!receipt) return
    const tx = receipt.transaction
    const text = `*STRUK TRANSAKSI ${receipt.platform}*\n\n` +
      `No: ${tx.id}\nTanggal: ${formatDate(tx.date)}\n` +
      `Produk: ${tx.product}\nNomor: ${tx.targetNumber}\n` +
      (tx.customerName ? `Nama: ${tx.customerName}\n` : '') +
      `Total: ${formatRupiah(tx.amount)}\n` +
      `Status: ${tx.status === 'SUCCESS' ? '✅ SUKSES' : tx.status === 'FAILED' ? '❌ GAGAL' : '⏳ PENDING'}\n` +
      (tx.sn ? `SN: ${tx.sn}\n` : '') +
      `\nReseller: ${receipt.reseller.name}\n${receipt.phone ? 'WA: ' + receipt.phone : ''}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-sm max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center"><Loading /></div>
        ) : receipt ? (
          <div>
            {/* Header struk */}
            <div className="bg-[#00B4A0] text-white text-center py-5 px-4 rounded-t-3xl">
              <p className="font-black text-xl">{receipt.platform}</p>
              <p className="text-teal-100 text-xs mt-1">Struk Transaksi Digital</p>
            </div>
            {/* Status */}
            <div className={`py-4 text-center border-b border-dashed border-gray-200 ${
              receipt.transaction.status === 'SUCCESS' ? 'bg-emerald-50' :
              receipt.transaction.status === 'FAILED' ? 'bg-red-50' : 'bg-yellow-50'
            }`}>
              <p className="text-3xl mb-1">
                {receipt.transaction.status === 'SUCCESS' ? '✅' : receipt.transaction.status === 'FAILED' ? '❌' : '⏳'}
              </p>
              <p className="font-bold text-lg">{getStatusLabel(receipt.transaction.status)}</p>
            </div>
            {/* Detail */}
            <div className="p-5 space-y-3 border-b border-dashed border-gray-200">
              {[
                ['No. Transaksi', receipt.transaction.id],
                ['Produk', receipt.transaction.product],
                ['Nomor Tujuan', receipt.transaction.targetNumber],
                receipt.transaction.customerName ? ['Nama Pelanggan', receipt.transaction.customerName] : null,
                ['Total', formatRupiah(receipt.transaction.amount)],
                receipt.transaction.sn ? ['Serial Number', receipt.transaction.sn] : null,
                ['Waktu', formatDate(receipt.transaction.date)],
                ['Reseller', receipt.reseller.name],
              ].filter((item): item is [string, any] => Boolean(item)).map(([k, v]) => (
                <div key={k as string} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-right max-w-48 break-all">{v}</span>
                </div>
              ))}
            </div>
            {/* Actions */}
            <div className="p-4 flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Tutup</button>
              <button onClick={shareWA} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" /> Share WA
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Struk tidak ditemukan</p>
            <button onClick={onClose} className="btn-secondary mt-4">Tutup</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Content (uses useSearchParams) ──

type View = 'home' | 'products' | 'order' | 'history'

function TransactionsContent() {
  const searchParams = useSearchParams()
  const urlCat = searchParams.get('cat')
  const urlTab = searchParams.get('tab')

  const [view, setView] = useState<View>('home')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selCat, setSelCat] = useState('')
  const [selCatLabel, setSelCatLabel] = useState('')
  const [selProduct, setSelProduct] = useState<any>(null)
  const [targetNumber, setTargetNumber] = useState('')
  const [search, setSearch] = useState('')
  const [selOperator, setSelOperator] = useState<string | null>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [loadingTxs, setLoadingTxs] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<'prabayar' | 'pascabayar'>(
    urlTab === 'pascabayar' ? 'pascabayar' : 'prabayar'
  )
  const [showPin, setShowPin] = useState(false)
  const [hasPIN, setHasPIN] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [showReceipt, setShowReceipt] = useState<string | null>(null)
  const [reportPeriod, setReportPeriod] = useState('today')
  const [report, setReport] = useState<any>(null)
  const [initialUrlHandled, setInitialUrlHandled] = useState(false)
  const limit = 10

  // Fetch products + check PIN on mount
  useEffect(() => {
    api.get('/reseller/products')
      .then(r => setProducts(r.data.products))
      .finally(() => setLoading(false))
    checkPIN()
  }, [])

  async function checkPIN() {
    try {
      const res = await api.get('/reseller/profile')
      setHasPIN(!!res.data.user?.hasPIN)
    } catch { /* ignore */ }
  }

  // Classify products
  const classified = useMemo(
    () => products.map(p => ({ ...p, cls: classifyProduct(p) })),
    [products]
  )

  const countByCat = useMemo(() => {
    const counts: Record<string, number> = {}
    classified.forEach(p => { counts[p.cls] = (counts[p.cls] || 0) + 1 })
    return counts
  }, [classified])

  // Handle initial URL params after products load
  useEffect(() => {
    if (loading || initialUrlHandled || !urlCat) return
    const catKey = urlCat.toUpperCase()
    const found = ALL_CATEGORIES.find(c => c.key === catKey)
    if (found && countByCat[catKey] > 0) {
      // Determine correct tab for this category
      const isPasca = PASCABAYAR.some(c => c.key === catKey)
      setActiveTab(isPasca ? 'pascabayar' : 'prabayar')
      setSelCat(catKey)
      setSelCatLabel(found.label)
      setSearch('')
      setSelOperator(null)
      setView('products')
    }
    setInitialUrlHandled(true)
  }, [loading, urlCat, initialUrlHandled, countByCat])

  // Fetch history when entering history view
  useEffect(() => {
    if (view === 'history') fetchTxs()
  }, [view, page])

  async function fetchTxs() {
    setLoadingTxs(true)
    try {
      const res = await api.get(`/transactions?page=${page}&limit=${limit}`)
      setTxs(res.data.transactions)
      setTotal(res.data.total)
    } finally { setLoadingTxs(false) }
  }

  // Products filtered for the selected category
  const filteredProducts = useMemo(() => {
    let list = classified.filter(p => p.cls === selCat)

    // Text search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }

    // Operator filter
    if (selOperator && OPERATOR_CATEGORIES.has(selCat)) {
      list = list.filter(p => detectOperator(p.name) === selOperator)
    }

    return list.sort((a, b) => Number(a.sellPrice) - Number(b.sellPrice))
  }, [classified, selCat, search, selOperator])

  // Available operators for PULSA/DATA categories
  const availableOperators = useMemo(() => {
    if (!OPERATOR_CATEGORIES.has(selCat)) return []
    const catProducts = classified.filter(p => p.cls === selCat)
    const ops = new Set(catProducts.map(p => detectOperator(p.name)))
    return Array.from(ops).sort()
  }, [classified, selCat])

  const activePra = PRABAYAR.filter(c => countByCat[c.key] > 0)
  const activePas = PASCABAYAR.filter(c => countByCat[c.key] > 0)

  async function handleOrder() {
    if (!targetNumber.trim()) { toast.error('Nomor tujuan wajib diisi'); return }
    setOrdering(true)
    try {
      const res = await api.post('/transactions', { productId: selProduct.id, targetNumber: targetNumber.trim() })
      if (res.data.status === 'SUCCESS') {
        toast.success('Transaksi berhasil!')
        setShowReceipt(res.data.transactionId)
      } else {
        toast.info('Transaksi sedang diproses')
      }
      setView('history')
      setPage(1)
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Transaksi gagal')
    } finally { setOrdering(false); setShowPin(false) }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) return <Loading text="Memuat produk..." />

  // ═══════════════════════════════════════
  // VIEW: Products
  // ═══════════════════════════════════════
  if (view === 'products') return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => { setView('home'); setSelOperator(null); setSearch('') }} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{selCatLabel}</h1>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
          {filteredProducts.length} produk
        </span>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          className="input pl-10"
          placeholder="Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-3 p-0.5 hover:bg-gray-200 rounded-full">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Operator filter pills */}
      {availableOperators.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelOperator(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selOperator === null
                ? 'bg-[#00B4A0] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {availableOperators.map(op => (
            <button
              key={op}
              onClick={() => setSelOperator(selOperator === op ? null : op)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selOperator === op
                  ? 'bg-[#00B4A0] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      )}

      {/* Product list */}
      {filteredProducts.length === 0 ? <Empty text="Produk tidak tersedia" /> : (
        <div className="space-y-2 pb-4">
          {filteredProducts.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelProduct(p); setTargetNumber(''); setView('order') }}
              className="product-item w-full"
            >
              <div className="flex items-center justify-between">
                <div className="text-left min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{p.code}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Tersedia" />
                  <p className="font-black text-[#00B4A0]">{formatRupiah(Number(p.sellPrice))}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // ═══════════════════════════════════════
  // VIEW: Order
  // ═══════════════════════════════════════
  if (view === 'order' && selProduct) return (
    <div className="space-y-4">
      {showPin && (
        <PinModal hasPIN={hasPIN} onCancel={() => setShowPin(false)} onConfirm={handleOrder} />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setView('products')} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Konfirmasi</h1>
      </div>

      <div className="card space-y-4">
        {/* Product summary */}
        <div className="bg-[#E6F7F5] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{selProduct.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{selProduct.code}</p>
          </div>
          <p className="text-xl font-black text-[#00B4A0]">{formatRupiah(Number(selProduct.sellPrice))}</p>
        </div>

        {/* Target number input */}
        <div>
          <label className="label">Nomor Tujuan</label>
          <input
            type="tel"
            className="input text-lg font-mono"
            placeholder="08xxxxxxxxxx"
            value={targetNumber}
            onChange={e => setTargetNumber(e.target.value)}
            autoFocus
          />
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          ⚠️ Pastikan nomor tujuan benar. Transaksi yang sudah berhasil tidak dapat dibatalkan.
        </div>

        {/* Pay button */}
        <button
          onClick={() => setShowPin(true)}
          disabled={!targetNumber.trim() || ordering}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
        >
          <Shield className="w-5 h-5" />
          Bayar {formatRupiah(Number(selProduct.sellPrice))}
        </button>
      </div>
    </div>
  )

  // ═══════════════════════════════════════
  // VIEW: History
  // ═══════════════════════════════════════
  if (view === 'history') return (
    <div className="space-y-3">
      {showReceipt && <ReceiptModal txId={showReceipt} onClose={() => setShowReceipt(null)} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Riwayat Transaksi</h1>
        </div>
        <button onClick={() => fetchTxs()} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Report summary card */}
      <div className="card">
        <div className="flex gap-2 mb-3 flex-wrap">
          {[
            { v: 'today', l: 'Hari Ini' },
            { v: 'week', l: '7 Hari' },
            { v: 'month', l: 'Bulan Ini' },
            { v: 'last_month', l: 'Bulan Lalu' },
          ].map(p => (
            <button
              key={p.v}
              onClick={async () => {
                setReportPeriod(p.v)
                const res = await api.get(`/reseller/report?period=${p.v}`)
                setReport(res.data)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                reportPeriod === p.v ? 'bg-[#00B4A0] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
        {report && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Total Transaksi', v: report.summary.total, color: 'text-gray-900' },
              { l: 'Sukses', v: report.summary.success, color: 'text-emerald-600' },
              { l: 'Total Pembelian', v: formatRupiah(report.summary.totalAmount), color: 'text-blue-600' },
              { l: 'Total Keuntungan', v: formatRupiah(report.summary.totalMargin), color: 'text-[#00B4A0]' },
            ].map(s => (
              <div key={s.l} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400">{s.l}</p>
                <p className={`font-black text-sm mt-0.5 ${s.color}`}>{s.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction list */}
      {loadingTxs ? <Loading /> : txs.length === 0 ? <Empty text="Belum ada transaksi" /> : (
        <div className="space-y-2">
          {txs.map(tx => (
            <div key={tx.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                    {tx.status === 'SUCCESS' ? '✅' : tx.status === 'FAILED' ? '❌' : '⏳'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{tx.product.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{tx.targetNumber}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="font-black text-sm">{formatRupiah(Number(tx.sellPrice))}</p>
                  <span className={getStatusBadge(tx.status)}>{getStatusLabel(tx.status)}</span>
                </div>
              </div>
              {tx.sn && <p className="text-xs text-green-600 mt-2 font-mono bg-green-50 px-2 py-1 rounded-lg">SN: {tx.sn}</p>}
              {tx.status === 'SUCCESS' && (
                <button onClick={() => setShowReceipt(tx.id)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-teal-50 text-[#00B4A0] text-xs font-semibold rounded-xl hover:bg-teal-100 transition-colors">
                  <Share2 className="w-3 h-3" /> Lihat & Share Struk
                </button>
              )}
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3">
              <span className="text-sm text-gray-500">Hal {page}/{totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-gray-50 rounded-lg disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-gray-50 rounded-lg disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // ═══════════════════════════════════════
  // VIEW: Home (default)
  // ═══════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">Transaksi</h1>
        <button
          onClick={() => { setView('history'); setPage(1) }}
          className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 text-[#00B4A0] text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors"
        >
          <Clock className="w-3.5 h-3.5" /> Riwayat
        </button>
      </div>

      {/* Tab Prabayar / Pascabayar */}
      <div className="card p-1">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['prabayar', 'pascabayar'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === t ? 'bg-white shadow-sm text-[#00B4A0]' : 'text-gray-500'
              }`}
            >
              {t === 'prabayar' ? 'Prabayar' : 'Pascabayar'}
            </button>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <div className="card">
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
          {(activeTab === 'prabayar' ? activePra : activePas).map(c => (
            <button
              key={c.key}
              onClick={() => {
                setSelCat(c.key)
                setSelCatLabel(c.label)
                setSearch('')
                setSelOperator(null)
                setView('products')
              }}
              className="cat-btn hover:bg-gray-50 group"
            >
              <div className={`cat-icon ${c.color} shadow-inner`}>
                <c.icon className="w-6 h-6 drop-shadow-sm group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">{c.label}</span>
              <span className="text-[9px] text-gray-400">{countByCat[c.key] || 0} produk</span>
            </button>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div className="bg-gradient-to-r from-[#00B4A0] to-[#009B8A] rounded-2xl p-4 text-white">
        <p className="font-black">⚡ Transaksi Super Cepat</p>
        <p className="text-teal-100 text-xs mt-1">Semua produk diproses otomatis real-time 24 jam</p>
      </div>
    </div>
  )
}

// ── Default Export with Suspense boundary ──

export default function TransactionsPage() {
  return (
    <Suspense fallback={<Loading text="Memuat..." />}>
      <TransactionsContent />
    </Suspense>
  )
}
