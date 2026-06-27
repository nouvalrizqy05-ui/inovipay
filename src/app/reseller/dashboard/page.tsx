'use client'
import { useEffect, useState } from 'react'
import { CreditCard, TrendingUp, CheckCircle, Wallet } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '@/components/ui/stat-card'
import Loading from '@/components/ui/loading'
import api from '@/lib/api-client'
import { formatRupiah, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function ResellerDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reseller/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading text="Memuat dashboard..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang kembali!</p>
      </div>

      {/* Saldo banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm">Saldo Tersedia</p>
        <p className="text-4xl font-bold mt-1">{formatRupiah(data?.wallet?.available ?? 0)}</p>
        <div className="flex gap-4 mt-4">
          <div>
            <p className="text-blue-200 text-xs">Total Saldo</p>
            <p className="font-semibold">{formatRupiah(data?.wallet?.balance ?? 0)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Saldo Ditahan</p>
            <p className="font-semibold">{formatRupiah(data?.wallet?.balanceHold ?? 0)}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Link href="/reseller/deposit" className="bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50">+ Deposit</Link>
          <Link href="/reseller/transactions" className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-400">Transaksi Baru</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Transaksi Hari Ini" value={data?.stats?.txToday ?? 0} icon={<CreditCard className="w-5 h-5" />} color="blue" />
        <StatCard title="Berhasil Hari Ini" value={data?.stats?.txSuccessToday ?? 0} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        <StatCard title="Keuntungan Hari Ini" value={formatRupiah(data?.stats?.marginToday ?? 0)} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
      </div>

      {/* Chart keuntungan 7 hari */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Keuntungan 7 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data?.txChart ?? []}>
            <defs>
              <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v/1000}k`} />
            <Tooltip formatter={(v: any) => formatRupiah(v)} />
            <Area type="monotone" dataKey="keuntungan" stroke="#3b82f6" fill="url(#colorMargin)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Notifikasi terbaru */}
      {data?.notifications?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Notifikasi Terbaru</h2>
          <div className="space-y-2">
            {data.notifications.map((n: any) => (
              <div key={n.id} className={`p-3 rounded-lg border ${n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
