'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw, Plus } from 'lucide-react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'

const CATEGORIES = ['PULSA','DATA','TOKEN_PLN','PDAM','GAME','LAINNYA']

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code:'', name:'', category:'PULSA', costPrice:'', sellPrice:'', skuH2h:'' })
  const [saving, setSaving] = useState(false)
  const [syncMargin, setSyncMargin] = useState('2000')

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
      const res = await api.post('/products/sync', { marginAmount: Number(syncMargin) })
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
      await api.post('/products', { ...form, costPrice: Number(form.costPrice), sellPrice: Number(form.sellPrice) })
      toast.success('Produk ditambahkan')
      setShowForm(false)
      setForm({ code:'', name:'', category:'PULSA', costPrice:'', sellPrice:'', skuH2h:'' })
      fetchProducts()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal tambah produk')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <input type="number" className="input w-32 text-sm" placeholder="Margin (Rp)" value={syncMargin} onChange={e => setSyncMargin(e.target.value)} />
          <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sync...' : 'Sync dari Digiflazz'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />Tambah Manual
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">Tambah Produk Manual</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key:'code', label:'Kode Produk', placeholder:'XL10' },
              { key:'name', label:'Nama Produk', placeholder:'XL 10.000' },
              { key:'skuH2h', label:'SKU Digiflazz', placeholder:'xl10' },
              { key:'costPrice', label:'Harga Beli (Rp)', placeholder:'9300', type:'number' },
              { key:'sellPrice', label:'Harga Jual (Rp)', placeholder:'11000', type:'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type={f.type ?? 'text'} className="input" placeholder={f.placeholder}
                  value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required />
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

      {loading ? <Loading /> : products.length === 0 ? <Empty text="Belum ada produk. Coba sync dari Digiflazz." /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Produk', 'Kategori', 'SKU H2H', 'Harga Beli', 'Harga Jual', 'Margin'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.code}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.skuH2h}</td>
                    <td className="px-4 py-3">{formatRupiah(Number(p.costPrice))}</td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(Number(p.sellPrice))}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatRupiah(Number(p.sellPrice) - Number(p.costPrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
