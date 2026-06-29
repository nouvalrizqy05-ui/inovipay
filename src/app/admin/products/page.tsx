'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'

const CATEGORIES = [
  // Prabayar
  'PULSA','DATA','GAMES','VOUCHER','EMONEY','TOKEN_PLN','PAKET_SMS_TELPON',
  'AKTIVASI_VOUCHER','TV_PRABAYAR','MASA_AKTIF','AKTIVASI_PERDANA','MEDIA_SOSIAL',
  'ESIM','GAS','HAYAKA_TOPUP','CHINA_TOPUP','VIETNAM_TOPUP','THAILAND_TOPUP',
  'PHILIPPINES_TOPUP','SRILANKA_TOPUP','BUNDLING',
  // Pascabayar
  'PLN_PASCABAYAR','PDAM','HP_PASCABAYAR','INTERNET_PASCABAYAR','BPJS_KESEHATAN',
  'MULTIFINANCE','PBB','GAS_NEGARA','TV_PASCABAYAR','BPJS_KETENAGAKERJAAN',
  'PLN_NONTAGLIS','EMONEY_PASCABAYAR','TELKOM_INDIHOME','INDOSAT_PASCABAYAR','TRI_PASCABAYAR',
  // Legacy
  'GAME','LAINNYA',
]

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [form, setForm] = useState({
    code:'', name:'', category:'PULSA', costPrice:'',
    priceReseller:'', priceAgen:'', priceMasterDealer:'', skuH2h:''
  })
  const [saving, setSaving] = useState(false)
  const [syncMargin, setSyncMargin] = useState({ reseller:'2000', agen:'1500', md:'1000' })

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products)
    } finally { setLoading(false) }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await api.post('/products/sync', {
        marginReseller: Number(syncMargin.reseller),
        marginAgen: Number(syncMargin.agen),
        marginMD: Number(syncMargin.md),
      })
      toast.success(res.data.message)
      fetchProducts()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Sync gagal')
    } finally { setSyncing(false) }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/products', {
        ...form,
        costPrice: Number(form.costPrice),
        priceReseller: Number(form.priceReseller),
        priceAgen: Number(form.priceAgen || form.priceReseller),
        priceMasterDealer: Number(form.priceMasterDealer || form.priceReseller),
      })
      toast.success('Produk ditambahkan')
      setShowForm(false)
      setForm({ code:'', name:'', category:'PULSA', costPrice:'', priceReseller:'', priceAgen:'', priceMasterDealer:'', skuH2h:'' })
      fetchProducts()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal')
    } finally { setSaving(false) }
  }

  async function toggleProduct(id: string, isActive: boolean) {
    try {
      // Update via PATCH - we'll need to add this endpoint
      toast.info('Fitur toggle akan tersedia di update berikutnya')
    } catch { toast.error('Gagal') }
  }

  const filtered = categoryFilter === 'ALL' ? products : products.filter(p => p.category === categoryFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-gray-900">Manajemen Produk</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Tambah Manual
          </button>
        </div>
      </div>

      {/* Sync panel */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3">Sync dari Digiflazz</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { key:'reseller', label:'Margin Reseller' },
            { key:'agen', label:'Margin Agen' },
            { key:'md', label:'Margin Master Dealer' },
          ].map(f => (
            <div key={f.key}>
              <label className="label text-xs">{f.label} (Rp)</label>
              <input type="number" className="input" placeholder="2000"
                value={(syncMargin as any)[f.key]}
                onChange={e => setSyncMargin({...syncMargin, [f.key]: e.target.value})} />
            </div>
          ))}
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sync...' : 'Sync Semua Produk'}
        </button>
        <p className="text-xs text-gray-400 mt-2">Margin diaplikasikan otomatis ke semua tier. Produk yang sudah ada akan diupdate harganya.</p>
      </div>

      {/* Form tambah manual */}
      {showForm && (
        <div className="card">
          <h2 className="font-bold mb-4">Tambah Produk Manual</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key:'code', label:'Kode Produk', placeholder:'XL10' },
              { key:'name', label:'Nama Produk', placeholder:'XL 10.000' },
              { key:'skuH2h', label:'SKU Digiflazz', placeholder:'xl10' },
              { key:'costPrice', label:'Harga Beli (Rp)', placeholder:'9300', type:'number' },
              { key:'priceReseller', label:'Harga Reseller (Rp)', placeholder:'11000', type:'number' },
              { key:'priceAgen', label:'Harga Agen (Rp)', placeholder:'10500', type:'number' },
              { key:'priceMasterDealer', label:'Harga Master Dealer (Rp)', placeholder:'10200', type:'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type={f.type ?? 'text'} className="input" placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})} required={f.key !== 'priceAgen' && f.key !== 'priceMasterDealer'} />
              </div>
            ))}
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter kategori */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              categoryFilter === c ? 'bg-[#00B4A0] text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}>
            {c === 'ALL' ? 'Semua' : c} {c !== 'ALL' && `(${products.filter(p=>p.category===c).length})`}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <Empty text="Belum ada produk. Sync dari Digiflazz dulu." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Produk','SKU','Harga Beli','Reseller','Agen','Master Dealer','Margin'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => {
                  const margin = Number(p.priceReseller) - Number(p.costPrice)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 max-w-48 truncate">{p.name}</p>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.skuH2h}</td>
                      <td className="px-4 py-3 text-gray-600">{formatRupiah(Number(p.costPrice))}</td>
                      <td className="px-4 py-3 font-semibold">{formatRupiah(Number(p.priceReseller))}</td>
                      <td className="px-4 py-3 text-blue-600">{formatRupiah(Number(p.priceAgen))}</td>
                      <td className="px-4 py-3 text-purple-600">{formatRupiah(Number(p.priceMasterDealer))}</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">{formatRupiah(margin)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            {filtered.length} produk ditampilkan
          </div>
        </div>
      )}
    </div>
  )
}
