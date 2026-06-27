'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'

const CATEGORIES = ['Semua', 'PULSA', 'DATA', 'TOKEN_PLN', 'PDAM', 'GAME', 'LAINNYA']

export default function TransactionsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(false)
  const [category, setCategory] = useState('Semua')
  const [form, setForm] = useState({ productId: '', targetNumber: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchProducts(); fetchTransactions() }, [])
  useEffect(() => { fetchProducts() }, [category])

  async function fetchProducts() {
    try {
      const params = category !== 'Semua' ? `?category=${category}` : ''
      const res = await api.get(`/products${params}`)
      setProducts(res.data.products)
    } catch {}
  }

  async function fetchTransactions() {
    setTxLoading(true)
    try {
      const res = await api.get('/transactions?limit=20')
      setTransactions(res.data.transactions)
    } catch {} finally { setTxLoading(false); setLoading(false) }
  }

  async function handleTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!form.productId || !form.targetNumber) { toast.error('Pilih produk dan isi nomor tujuan'); return }
    setSubmitting(true)
    try {
      const res = await api.post('/transactions', form)
      toast.success(res.data.message)
      setForm({ productId: '', targetNumber: '' })
      fetchTransactions()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Transaksi gagal')
    } finally { setSubmitting(false) }
  }

  if (loading) return <Loading />

  const selectedProduct = products.find(p => p.id === form.productId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>

      {/* Form transaksi */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Transaksi Baru</h2>

        {/* Filter kategori */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
              {c === 'TOKEN_PLN' ? 'Token PLN' : c === 'Semua' ? 'Semua' : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleTransaction} className="space-y-4">
          <div>
            <label className="label">Pilih Produk</label>
            <select className="input" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
              <option value="">-- Pilih produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatRupiah(Number(p.sellPrice))}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-900">{selectedProduct.name}</p>
              <p className="text-blue-700">Harga: <span className="font-bold">{formatRupiah(Number(selectedProduct.sellPrice))}</span></p>
            </div>
          )}

          <div>
            <label className="label">Nomor Tujuan</label>
            <input type="text" className="input" placeholder="Nomor HP / ID Pelanggan / ID Meter"
              value={form.targetNumber} onChange={e => setForm({ ...form, targetNumber: e.target.value })} />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Memproses...' : `Beli Sekarang${selectedProduct ? ' — ' + formatRupiah(Number(selectedProduct.sellPrice)) : ''}`}
          </button>
        </form>
      </div>

      {/* Riwayat transaksi */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Riwayat Transaksi</h2>
        {txLoading ? <Loading /> : transactions.length === 0 ? <Empty text="Belum ada transaksi" /> : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.product?.name}</p>
                  <p className="text-xs text-gray-500">{tx.targetNumber} · {formatDate(tx.createdAt)}</p>
                  {tx.sn && <p className="text-xs text-green-600 mt-0.5">SN: {tx.sn}</p>}
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatRupiah(Number(tx.sellPrice))}</p>
                  <span className={getStatusBadge(tx.status)}>{getStatusLabel(tx.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
