'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'

export default function WalletPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    api.get(`/wallet?page=${page}&limit=${limit}`).then(r => setData(r.data)).finally(() => setLoading(false))
  }, [page])

  if (loading) return <Loading />

  const totalPages = Math.ceil((data?.total ?? 0) / limit)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-gray-900">Riwayat Saldo</h1>

      {/* Saldo summary */}
      <div className="saldo-card">
        <p className="text-teal-100 text-xs mb-1">Saldo Tersedia</p>
        <p className="text-3xl font-black">{formatRupiah(data?.available ?? 0)}</p>
        <div className="flex gap-6 mt-3 text-xs">
          <div>
            <p className="text-teal-200">Total Saldo</p>
            <p className="font-bold">{formatRupiah(data?.balance ?? 0)}</p>
          </div>
          <div>
            <p className="text-teal-200">Ditahan</p>
            <p className="font-bold">{formatRupiah(data?.balanceHold ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="card">
        <p className="font-bold text-sm text-gray-900 mb-3">Mutasi Saldo</p>
        {!data?.ledger?.length ? (
          <Empty text="Belum ada mutasi saldo" />
        ) : (
          <div className="space-y-2">
            {data.ledger.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  l.type === 'CREDIT' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {l.type === 'CREDIT'
                    ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                    : <TrendingDown className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{l.note}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(l.createdAt)}</p>
                </div>
                <p className={`text-sm font-black flex-shrink-0 ${
                  l.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {l.type === 'CREDIT' ? '+' : '-'}{formatRupiah(Number(l.amount))}
                </p>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="p-2 bg-gray-50 rounded-xl disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500">Hal {page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="p-2 bg-gray-50 rounded-xl disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
