'use client'
import { useEffect, useState } from 'react'
import { Users, CreditCard, TrendingUp, AlertTriangle, Clock, Wallet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '@/components/ui/stat-card'
import Loading from '@/components/ui/loading'
import api from '@/lib/api-client'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false)) }, [])

  if (loading) return <Loading text="Memuat dashboard admin..." />

  const { stats, txChart, notifications } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm">Pantau semua aktivitas platform</p>
      </div>

      {/* Alert saldo Digiflazz */}
      {stats.digiflazzBalance !== null && stats.digiflazzBalance < 500000 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Saldo Digiflazz Menipis!</p>
            <p className="text-sm text-red-600">Saldo saat ini: {formatRupiah(stats.digiflazzBalance)}. Segera top up untuk menghindari transaksi gagal.</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Reseller Aktif" value={stats.totalReseller} subtitle={`${stats.resellerPending} menunggu aktivasi`} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard title="Deposit Pending" value={stats.depositPending} subtitle="Perlu konfirmasi" icon={<Clock className="w-5 h-5" />} color="yellow" />
        <StatCard title="Transaksi Hari Ini" value={stats.txToday} subtitle={`${stats.txSuccessToday} berhasil`} icon={<CreditCard className="w-5 h-5" />} color="green" />
        <StatCard title="Margin Hari Ini" value={formatRupiah(stats.marginToday)} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
        <StatCard
          title="Saldo Digiflazz"
          value={stats.digiflazzBalance !== null ? formatRupiah(stats.digiflazzBalance) : 'Gagal cek'}
          subtitle="Update real-time"
          icon={<Wallet className="w-5 h-5" />}
          color={stats.digiflazzBalance < 500000 ? 'red' : 'green'} />
      </div>

      {/* Chart transaksi 7 hari */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Transaksi 7 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={txChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="transaksi" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Notifikasi terbaru */}
      {notifications?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Notifikasi Terbaru</h2>
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div key={n.id} className={`p-3 rounded-lg border ${n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-yellow-50 border-yellow-100'}`}>
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
