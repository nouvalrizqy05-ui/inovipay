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
  const [bankInfo, setBankInfo] = useState<{ bank_name?: string; bank_account_number?: string; bank_account_name?: string }>({})
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => { fetchDeposits(); fetchBankInfo() }, [])
  useEffect(() => { fetchDeposits() }, [page])

  async function fetchBankInfo() {
    try {
      const res = await api.get('/admin/config')
      const configs = res.data.configs as { key: string; value: string }[]
      const info: Record<string, string> = {}
      configs.forEach(c => { info[c.key] = c.value })
      setBankInfo(info)
    } catch {
      // Non-critical — will show fallback
    }
  }

  async function fetchDeposits() {
    try {
      const res = await api.get(`/deposits?page=${page}&limit=${limit}`)
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
          <div className="flex justify-between">
            <span className="text-gray-600">Bank</span>
            <span className="font-medium">{bankInfo.bank_name || '— Hubungi Admin —'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">No. Rekening</span>
            <span className="font-medium font-mono">{bankInfo.bank_account_number || '— Hubungi Admin —'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Atas Nama</span>
            <span className="font-medium">{bankInfo.bank_account_name || '— Hubungi Admin —'}</span>
          </div>
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
              <div key={d.id} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Total Transfer: <span className="text-amber-600">{formatRupiah(Number(d.amount) + Number(d.uniqueCode || 0))}</span>
                    </p>
                    <p className="text-xs text-gray-500">Nominal Asli: {formatRupiah(Number(d.amount))} · Kode Unik: {d.uniqueCode || 0}</p>
                  </div>
                  <span className={getStatusBadge(d.status)}>{getStatusLabel(d.status)}</span>
                </div>
                
                {d.status === 'PENDING' && (
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded text-xs text-amber-800 mt-2">
                    ⚠️ Transfer <strong>tepat</strong> sesuai nominal Total Transfer agar terbaca oleh sistem.
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>{formatDate(d.createdAt)}</span>
                  {d.adminNote && <span className="text-red-500 font-medium">Catatan: {d.adminNote}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
