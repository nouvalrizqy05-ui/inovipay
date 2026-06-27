'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { fetchTransactions() }, [statusFilter])

  async function fetchTransactions() {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}&limit=50` : '?limit=50'
      const res = await api.get(`/transactions${params}`)
      setTransactions(res.data.transactions)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Semua Transaksi</h1>
      <div className="flex gap-2 flex-wrap">
        {[{ v: '', l: 'Semua' }, { v: 'SUCCESS', l: 'Sukses' }, { v: 'PENDING', l: 'Pending' }, { v: 'FAILED', l: 'Gagal' }].map(s => (
          <button key={s.v} onClick={() => setStatusFilter(s.v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s.v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
            {s.l}
          </button>
        ))}
      </div>
      {loading ? <Loading /> : transactions.length === 0 ? <Empty text="Tidak ada transaksi" /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Reseller', 'Produk', 'Tujuan', 'Harga', 'Margin', 'Status', 'Waktu'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{tx.user?.name}</p>
                      <p className="text-xs text-gray-400">{tx.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{tx.product?.name}</p>
                      <p className="text-xs text-gray-400">{tx.product?.category}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{tx.targetNumber}</td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(Number(tx.sellPrice))}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatRupiah(Number(tx.margin))}</td>
                    <td className="px-4 py-3"><span className={getStatusBadge(tx.status)}>{getStatusLabel(tx.status)}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.createdAt)}</td>
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
