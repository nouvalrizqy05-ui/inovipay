'use client'

import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function TransactionsPage() {
  const [txs, setTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const limit = 10

  useEffect(() => {
    fetchTxs()
  }, [page, search])

  async function fetchTxs() {
    try {
      const res = await api.get(`/transactions?page=${page}&limit=${limit}&search=${search}`)
      setTxs(res.data.transactions)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari nomor tujuan / produk..." 
            className="input pl-10 w-full md:w-72"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Produk</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Tujuan</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Harga</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600">SN / Ket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txs.length === 0 ? (
                <tr><td colSpan={6}><Empty text="Tidak ada transaksi ditemukan" /></td></tr>
              ) : txs.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                  <td className="px-6 py-4 font-medium">{t.product.name}</td>
                  <td className="px-6 py-4 font-mono">{t.targetNumber} {t.targetZone ? `(${t.targetZone})` : ''}</td>
                  <td className="px-6 py-4 font-bold">{formatRupiah(Number(t.sellPrice))}</td>
                  <td className="px-6 py-4"><span className={getStatusBadge(t.status)}>{getStatusLabel(t.status)}</span></td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-xs truncate">
                    {t.sn || t.failReason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
