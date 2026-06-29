'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import api from '@/lib/api-client'
import { formatRupiah, formatDate } from '@/lib/utils'
import { FileText, Search, Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react'
import Loading from '@/components/ui/loading'

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/transactions')
      setTransactions(res.data.transactions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'SUCCESS':
        return { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
      case 'PENDING':
        return { icon: <Clock className="w-4 h-4 text-orange-500" />, color: 'text-orange-600 bg-orange-50 border-orange-100' }
      case 'FAILED':
        return { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-600 bg-red-50 border-red-100' }
      default:
        return { icon: <AlertCircle className="w-4 h-4 text-gray-500" />, color: 'text-gray-600 bg-gray-50 border-gray-100' }
    }
  }

  const filteredData = transactions.filter(t => {
    if (filter !== 'ALL' && t.status !== filter) return false
    if (search) {
      return (t.product?.name || '').toLowerCase().includes(search.toLowerCase()) || 
             (t.targetNumber || '').includes(search)
    }
    return true
  })

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <PageHeader title="Riwayat Transaksi" />

      {/* Filter & Search */}
      <div className="px-4 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-[60px] z-10">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari transaksi atau nomor..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4A0] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filter === f 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'ALL' ? 'Semua' : f === 'SUCCESS' ? 'Berhasil' : f === 'PENDING' ? 'Pending' : 'Gagal'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loading text="Memuat Riwayat..." />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium text-sm">Belum ada riwayat transaksi</p>
          </div>
        ) : (
          filteredData.map(trx => {
            const statusConfig = getStatusConfig(trx.status)
            return (
              <div key={trx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#00B4A0]/10 text-[#00B4A0] rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight mb-0.5 line-clamp-1">{trx.product?.name || 'Produk'}</p>
                      <p className="text-xs text-gray-500 font-mono">{trx.targetNumber}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1 ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {trx.status}
                  </div>
                </div>

                <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(trx.createdAt)}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{formatRupiah(trx.sellPrice)}</p>
                  </div>
                </div>
                
                {trx.sn && (
                  <div className="mt-3 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <p className="text-[10px] text-gray-500 font-bold mb-0.5">SN / KODE VOUCHER:</p>
                    <p className="font-mono text-xs text-gray-900 break-all">{trx.sn}</p>
                  </div>
                )}
                {trx.failReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-600 line-clamp-2">{trx.failReason}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
