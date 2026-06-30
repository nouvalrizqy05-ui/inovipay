'use client'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import ConfirmModal from '@/components/ui/confirm-modal'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'

export default function ResellersPage() {
  const [resellers, setResellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState<{ open: boolean; reseller: any; action: string }>({ open: false, reseller: null, action: '' })
  const [newMaxDevices, setNewMaxDevices] = useState(1)

  useEffect(() => { fetchResellers() }, [search, statusFilter])

  async function fetchResellers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/admin/resellers?${params}`)
      setResellers(res.data.resellers)
    } finally { setLoading(false) }
  }

  async function handleAction() {
    try {
      if (modal.action === 'reset_session') {
        await api.patch(`/admin/resellers/${modal.reseller.id}`, { action: 'RESET_SESSION' })
        toast.success('Sesi perangkat berhasil direset')
      } else if (modal.action === 'set_max_devices') {
        await api.patch(`/admin/resellers/${modal.reseller.id}`, { action: 'SET_MAX_DEVICES', maxDevices: newMaxDevices })
        toast.success('Batas perangkat berhasil diubah')
      } else if (modal.action === 'delete') {
        await api.delete(`/admin/resellers/${modal.reseller.id}`)
        toast.success('Akun reseller berhasil dihapus permanen')
      } else {
        await api.patch(`/admin/resellers/${modal.reseller.id}`, { status: modal.action === 'activate' ? 'ACTIVE' : 'SUSPENDED' })
        toast.success(modal.action === 'activate' ? 'Reseller diaktifkan' : 'Reseller disuspend')
      }
      setModal({ open: false, reseller: null, action: '' })
      fetchResellers()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Reseller</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Cari nama, email, HP..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Aktif</option>
          <option value="SUSPENDED">Disuspend</option>
        </select>
      </div>

      {loading ? <Loading /> : resellers.length === 0 ? <Empty text="Tidak ada reseller" /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Reseller', 'Saldo', 'Transaksi', 'Perangkat', 'Status', 'Bergabung', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resellers.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.email}</p>
                      <p className="text-xs text-gray-400">{r.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatRupiah(Number(r.wallet?.balance ?? 0))}</p>
                      <p className="text-xs text-gray-400">Ditahan: {formatRupiah(Number(r.wallet?.balanceHold ?? 0))}</p>
                    </td>
                    <td className="px-4 py-3 text-center">{r._count?.transactions ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Maks {r.maxDevices || 1}</span>
                        {r.deviceRequest && (
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-bold" title="Request Tambah Perangkat">Req: {r.deviceRequest}</span>
                        )}
                        <button onClick={() => { setNewMaxDevices(r.deviceRequest || r.maxDevices || 1); setModal({ open: true, reseller: r, action: 'set_max_devices' }) }} className="text-blue-500 hover:text-blue-700 text-xs">Edit</button>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={getStatusBadge(r.status)}>{getStatusLabel(r.status)}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {r.status !== 'ACTIVE' && (
                          <button onClick={() => setModal({ open: true, reseller: r, action: 'activate' })}
                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded">Aktifkan</button>
                        )}
                        {r.status === 'ACTIVE' && (
                          <button onClick={() => setModal({ open: true, reseller: r, action: 'suspend' })}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded">Suspend</button>
                        )}
                        <button onClick={() => setModal({ open: true, reseller: r, action: 'reset_session' })}
                          className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 px-2 py-1 rounded">Reset Perangkat</button>
                        <button onClick={() => setModal({ open: true, reseller: r, action: 'delete' })}
                          className="text-xs bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700 px-2 py-1 rounded transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && modal.action === 'set_max_devices' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2">Batas Perangkat</h2>
            <p className="text-sm text-gray-500 mb-4">Ubah batas maksimal HP/Perangkat yang bisa digunakan untuk login oleh akun {modal.reseller?.name}.</p>
            <input 
              type="number" min="1"
              value={newMaxDevices} onChange={e => setNewMaxDevices(Number(e.target.value))}
              className="input mb-6"
            />
            <div className="flex gap-2">
              <button onClick={() => setModal({ open: false, reseller: null, action: '' })} className="flex-1 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleAction} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      ) : (
        <ConfirmModal
          isOpen={modal.open}
          title={modal.action === 'activate' ? 'Aktifkan Reseller?' : modal.action === 'reset_session' ? 'Reset Perangkat?' : modal.action === 'delete' ? 'Hapus Akun Permanen?' : 'Suspend Reseller?'}
          message={modal.action === 'reset_session' ? `Reset sesi login untuk akun ${modal.reseller?.name}? Ini akan memaksa logout mereka.` : modal.action === 'delete' ? `Hapus akun ${modal.reseller?.name} secara permanen beserta saldo dan seluruh riwayat transaksinya? Tindakan ini tidak dapat dibatalkan.` : `${modal.action === 'activate' ? 'Aktifkan' : 'Suspend'} akun ${modal.reseller?.name}?`}
          confirmLabel={modal.action === 'activate' ? 'Aktifkan' : modal.action === 'reset_session' ? 'Reset' : modal.action === 'delete' ? 'Hapus' : 'Suspend'}
          danger={modal.action === 'suspend' || modal.action === 'delete'}
          onConfirm={handleAction}
          onCancel={() => setModal({ open: false, reseller: null, action: '' })}
        />
      )}
    </div>
  )
}
