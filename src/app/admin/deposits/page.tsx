'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [modal, setModal] = useState<any>(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => { fetchDeposits() }, [statusFilter])

  async function fetchDeposits() {
    setLoading(true)
    try {
      const res = await api.get(`/admin/deposits?status=${statusFilter}`)
      setDeposits(res.data.deposits)
    } finally { setLoading(false) }
  }

  async function handleAction(action: 'approve' | 'reject') {
    setProcessing(true)
    try {
      await api.patch(`/admin/deposits/${modal.id}`, { action, adminNote })
      toast.success(action === 'approve' ? 'Deposit disetujui' : 'Deposit ditolak')
      setModal(null); setAdminNote('')
      fetchDeposits()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal')
    } finally { setProcessing(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Deposit</h1>

      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
            {getStatusLabel(s)}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : deposits.length === 0 ? <Empty text={`Tidak ada deposit ${getStatusLabel(statusFilter).toLowerCase()}`} /> : (
        <div className="space-y-3">
          {deposits.map(d => (
            <div key={d.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900 text-lg">{formatRupiah(Number(d.amount))}</p>
                  <span className={getStatusBadge(d.status)}>{getStatusLabel(d.status)}</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{d.user?.name}</p>
                <p className="text-xs text-gray-500">{d.user?.phone} · {d.user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(d.createdAt)}</p>
                {d.note && <p className="text-xs text-gray-600 mt-1">Catatan: {d.note}</p>}
                {d.proofUrl && <a href={d.proofUrl} target="_blank" className="text-xs text-blue-600 hover:underline">Lihat Bukti Transfer →</a>}
                {d.adminNote && <p className="text-xs text-red-500 mt-1">Catatan admin: {d.adminNote}</p>}
              </div>
              {d.status === 'PENDING' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setModal(d)} className="btn-primary text-sm">Konfirmasi</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal konfirmasi deposit */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold">Konfirmasi Deposit</h3>
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="font-bold text-xl">{formatRupiah(Number(modal.amount))}</p>
              <p className="text-sm text-gray-600">{modal.user?.name} · {modal.user?.phone}</p>
              {modal.proofUrl && <a href={modal.proofUrl} target="_blank" className="text-sm text-blue-600 hover:underline">Lihat Bukti →</a>}
            </div>
            <div className="mt-4">
              <label className="label">Catatan Admin (opsional)</label>
              <textarea className="input resize-none" rows={2} placeholder="Alasan approve/reject..."
                value={adminNote} onChange={e => setAdminNote(e.target.value)} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setModal(null); setAdminNote('') }} className="btn-secondary flex-1">Batal</button>
              <button onClick={() => handleAction('reject')} disabled={processing} className="btn-danger flex-1">Tolak</button>
              <button onClick={() => handleAction('approve')} disabled={processing} className="btn-primary flex-1">Setujui</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
