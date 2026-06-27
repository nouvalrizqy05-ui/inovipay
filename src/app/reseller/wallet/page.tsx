'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function WalletPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/wallet').then(r => setData(r.data)).finally(() => setLoading(false)) }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mutasi Saldo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Saldo', value: data?.balance ?? 0, color: 'text-blue-600' },
          { label: 'Saldo Ditahan', value: data?.balanceHold ?? 0, color: 'text-yellow-600' },
          { label: 'Saldo Tersedia', value: data?.available ?? 0, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{formatRupiah(s.value)}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Riwayat Mutasi</h2>
        {!data?.ledger?.length ? <Empty text="Belum ada mutasi" /> : (
          <div className="space-y-2">
            {data.ledger.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.note}</p>
                  <p className="text-xs text-gray-500">{formatDate(l.createdAt)}</p>
                </div>
                <p className={`text-sm font-bold ${l.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {l.type === 'CREDIT' ? '+' : '-'}{formatRupiah(Number(l.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
