'use client'
import { useEffect, useState } from 'react'
import { Users, CreditCard, TrendingUp, AlertTriangle, Clock, Wallet, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Loading from '@/components/ui/loading'
import api from '@/lib/api-client'
import { formatRupiah, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchData() {
    setRefreshing(true)
    try {
      const res = await api.get('/admin/dashboard')
      setData(res.data)
    } finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <Loading text="Memuat dashboard admin..." />

  const { stats, txChart, notifications } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-400 text-sm">Pantau semua aktivitas platform</p>
        </div>
        <button onClick={fetchData} disabled={refreshing}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alert saldo rendah */}
      {stats.digiflazzBalance !== null && stats.digiflazzBalance < 500000 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-black text-red-800">⚠️ Saldo Digiflazz Menipis!</p>
            <p className="text-sm text-red-600">
              Saldo: <span className="font-bold">{formatRupiah(stats.digiflazzBalance)}</span>. Segera top up di dashboard Digiflazz!
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label:'Reseller Aktif', value:stats.totalReseller, sub:`${stats.resellerPending} menunggu aktivasi`, icon:'👥', color:'bg-blue-50 text-blue-600' },
          { label:'Deposit Pending', value:stats.depositPending, sub:'Perlu konfirmasi segera', icon:'⏳', color:'bg-amber-50 text-amber-600' },
          { label:'Transaksi Hari Ini', value:stats.txToday, sub:`${stats.txSuccessToday} berhasil`, icon:'💳', color:'bg-emerald-50 text-emerald-600' },
          { label:'Margin Hari Ini', value:formatRupiah(stats.marginToday), sub:'Keuntungan platform', icon:'📈', color:'bg-purple-50 text-purple-600', small:true },
          {
            label:'Saldo Digiflazz',
            value: stats.digiflazzBalance !== null ? formatRupiah(stats.digiflazzBalance) : '— Error —',
            sub:'Real-time',
            icon:'💰',
            color: stats.digiflazzBalance < 500000 ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600',
            small: true,
          },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{s.label}</p>
                <p className={`font-black mt-1 ${(s as any).small ? 'text-sm' : 'text-2xl'} text-gray-900`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{s.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <span className="text-lg">{s.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shortcut actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Aktivasi Reseller', href:'/admin/resellers?status=PENDING', color:'bg-blue-600', icon:'👥' },
          { label:'Approve Deposit', href:'/admin/deposits', color:'bg-amber-500', icon:'💰' },
          { label:'Kelola Produk', href:'/admin/products', color:'bg-[#00B4A0]', icon:'📦' },
          { label:'Kelola Banner', href:'/admin/banners', color:'bg-purple-600', icon:'🖼️' },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 active:scale-95 transition-all`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-bold">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Transaksi 7 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={txChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="transaksi" fill="#00B4A0" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Notifikasi terbaru */}
      {notifications?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Notifikasi Terbaru</h2>
            <Link href="/admin/notifications" className="text-xs text-[#00B4A0] font-bold">Semua →</Link>
          </div>
          <div className="space-y-2">
            {notifications.slice(0,5).map((n: any) => (
              <div key={n.id} className={`p-3 rounded-xl border text-sm ${n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-amber-50 border-amber-200'}`}>
                <p className="font-semibold text-gray-900 text-xs">{n.title}</p>
                <p className="text-gray-600 text-xs mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
