'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw, Plus, ToggleLeft, ToggleRight, Save, Edit2 } from 'lucide-react'
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
    priceReseller:'', skuH2h:''
  })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<string>('')

  // Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncOptions, setSyncOptions] = useState({
    marginReseller: 2000
  })
  const [deletingInactive, setDeletingInactive] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products)
    } finally { setLoading(false) }
  }

  async function handleSync() {
    setSyncing(true)
    setShowSyncModal(false)
    try {
      const res = await api.post('/products/sync', {
        marginReseller: Number(syncOptions.marginReseller),
      })
      toast.success(res.data.message || 'Sync berhasil')
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
      })
      toast.success('Produk ditambahkan')
      setShowForm(false)
      setForm({ code:'', name:'', category:'PULSA', costPrice:'', priceReseller:'', skuH2h:'' })
      fetchProducts()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal')
    } finally { setSaving(false) }
  }

  async function toggleProduct(id: string, isActive: boolean) {
    try {
      await api.patch('/products', { id, isActive })
      toast.success(isActive ? 'Produk diaktifkan' : 'Produk dinonaktifkan')
      fetchProducts()
    } catch {
      toast.error('Gagal mengubah status produk')
    }
  }

  async function handleSavePrice(id: string) {
    try {
      await api.patch('/products/price', { id, priceReseller: Number(editPrice) })
      toast.success('Harga diperbarui')
      setEditingId(null)
      fetchProducts()
    } catch {
      toast.error('Gagal simpan harga')
    }
  }

  function handleDeleteInactiveClick() {
    setShowDeleteModal(true)
  }

  async function executeDeleteInactive() {
    setDeletingInactive(true)
    try {
      const res = await api.delete('/products?action=deleteInactive')
      toast.success(res.data.message)
      fetchProducts()
      setShowDeleteModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menghapus produk')
    } finally {
      setDeletingInactive(false)
    }
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
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900">Sinkronisasi Digiflazz</h3>
          <p className="text-sm text-gray-500">Tarik atau perbarui harga produk otomatis dari pusat</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDeleteInactiveClick} 
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm"
          >
            Hapus Produk Tercoret
          </button>
          <button 
            onClick={() => setShowSyncModal(true)} 
            disabled={syncing}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Menyinkronkan...' : 'Mulai Sync'}
          </button>
        </div>
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
              { key:'priceReseller', label:'Harga Jual (Rp)', placeholder:'11000', type:'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type={f.type ?? 'text'} className="input" placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})} required />
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
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Produk</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">SKU / Kode</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Harga Beli</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Harga Jual</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Margin</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 w-10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => {
                  const margin = Number(p.priceReseller) - Number(p.costPrice)
                  const isEditing = editingId === p.id
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 ${!p.isActive ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <p className={`font-semibold max-w-48 truncate ${!p.isActive ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{p.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded mt-0.5 inline-block ${!p.isActive ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{p.category}</span>
                      </td>
                      <td className={`px-4 py-3 font-mono text-xs ${!p.isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                        {p.code}<br/>
                        <span className={p.isActive ? 'text-gray-400' : 'text-gray-300'}>H2H: {p.skuH2h}</span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${!p.isActive ? 'text-gray-400' : 'text-red-600'}`}>{formatRupiah(Number(p.costPrice))}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input 
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="input text-sm py-1 px-2 w-28"
                            autoFocus
                          />
                        ) : (
                          <span className={`font-semibold ${!p.isActive ? 'text-gray-400' : 'text-gray-900'}`}>{formatRupiah(Number(p.priceReseller))}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${!p.isActive ? 'text-gray-400' : margin > 0 ? 'text-emerald-600' : margin < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {margin > 0 ? '+' : ''}{formatRupiah(margin)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                        <button onClick={() => toggleProduct(p.id, !p.isActive)} title={p.isActive ? 'Nonaktifkan' : 'Aktifkan'} className={`p-1.5 rounded-lg ${p.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                          {p.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        {isEditing ? (
                          <button onClick={() => handleSavePrice(p.id)} className="p-1.5 text-[#00B4A0] hover:bg-[#00B4A0]/10 rounded-lg">
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => { setEditingId(p.id); setEditPrice(p.priceReseller.toString()) }} className="p-1.5 text-gray-400 hover:text-[#00B4A0] hover:bg-gray-100 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
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

      {/* SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sync Produk</h2>
            <p className="text-sm text-gray-500 mb-6">Tarik produk dari server Digiflazz untuk memperbarui stok dan harga.</p>
            
            <div className="space-y-4 my-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margin (Keuntungan) per Produk <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={syncOptions.marginReseller}
                    onChange={e => setSyncOptions({...syncOptions, marginReseller: Number(e.target.value)})}
                    className="input pl-9"
                    placeholder="Contoh: 2000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Harga Jual otomatis = Harga Beli Digiflazz + Margin ini.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowSyncModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Batal
              </button>
              <button onClick={handleSync} className="flex-1 py-3 bg-[#00B4A0] text-white font-bold rounded-xl hover:bg-[#009B8A] transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Mulai Sync
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🗑️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hapus Produk Tercoret?</h2>
            <p className="text-sm text-gray-500 mb-6">Semua produk yang sudah tidak aktif (tercoret) akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                disabled={deletingInactive}
              >
                Batal
              </button>
              <button 
                onClick={executeDeleteInactive}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                disabled={deletingInactive}
              >
                {deletingInactive ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
