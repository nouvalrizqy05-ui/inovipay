'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'

export default function DepositPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ amount: '', proofUrl: '', note: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchDeposits() }, [])

  async function fetchDeposits() {
    try {
      const res = await api.get('/deposits')
      setDeposits(res.data.deposits)
    } finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Number(form.amount) < 10000) { toast.error('Minimal deposit Rp 10.000'); return }
    setSubmitting(true)
    try {
      await api.post('/deposits', { amount: Number(form.amount), proofUrl: form.proofUrl, note: form.note })
      toast.success('Pengajuan deposit berhasil! Menunggu konfirmasi admin.')
      setForm({ amount: '', proofUrl: '', note: '' })
      fetchDeposits()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal ajukan deposit')
    } finally { setSubmitting(false) }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Deposit Saldo</h1>

      {/* Info rekening */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 mb-3">Rekening Tujuan Transfer</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Bank</span><span className="font-medium">BCA / BRI / Mandiri</span></div>
          <div className="flex justify-between"><span className="text-gray-600">No. Rekening</span><span className="font-medium">— Hubungi Admin —</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Atas Nama</span><span className="font-medium">— Hubungi Admin —</span></div>
        </div>
        <p className="text-xs text-blue-700 mt-3">⚠️ Setelah transfer, isi form di bawah dan lampirkan bukti transfer.</p>
      </div>

      {/* Form deposit */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Ajukan Deposit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Jumlah Deposit (Rp)</label>
            <input type="number" className="input" placeholder="Minimal 10.000" min="10000" step="1000"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Link Bukti Transfer</label>
            <input type="url" className="input" placeholder="https://drive.google.com/... atau link foto"
              value={form.proofUrl} onChange={e => setForm({ ...form, proofUrl: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">Upload foto ke Google Drive / Imgur, lalu paste linknya.</p>
          </div>
          <div>
            <label className="label">Catatan (opsional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Transfer via ATM BCA, dll"
              value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Mengajukan...' : 'Ajukan Deposit'}
          </button>
        </form>
      </div>

      {/* Riwayat deposit */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Riwayat Deposit</h2>
        {deposits.length === 0 ? <Empty text="Belum ada riwayat deposit" /> : (
          <div className="space-y-3">
            {deposits.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{formatRupiah(Number(d.amount))}</p>
                  <p className="text-xs text-gray-500">{formatDate(d.createdAt)}</p>
                  {d.adminNote && <p className="text-xs text-red-500 mt-0.5">Catatan: {d.adminNote}</p>}
                </div>
                <span className={getStatusBadge(d.status)}>{getStatusLabel(d.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
