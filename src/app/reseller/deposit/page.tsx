'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatRupiah, formatDate, getStatusBadge, getStatusLabel } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'

const DEPOSIT_METHODS = [
  {
    category: 'BANK',
    label: 'Bank Transfer',
    desc: 'Deposit menggunakan Bank Transfer',
    methods: ['BCA', 'BRI', 'BNI', 'Mandiri', 'Danamon', 'Cimb Niaga'],
    fee: 'Gratis',
    feeColor: 'text-emerald-600',
    icon: '🏦',
    suffix: '',
  },
  {
    category: 'VA',
    label: 'Virtual Account',
    desc: 'Transfer ke nomor VA yang digenerate otomatis',
    methods: ['VA BCA', 'VA BRI', 'VA Mandiri', 'VA BNI'],
    fee: 'Gratis',
    feeColor: 'text-emerald-600',
    icon: '💳',
    suffix: '',
  },
  {
    category: 'INDOMARET',
    label: 'Indomaret',
    desc: 'Deposit melalui gerai Indomaret terdekat',
    methods: [],
    fee: '+Rp 8.000 (admin)',
    feeColor: 'text-red-500',
    icon: '🏪',
    suffix: '(+Rp 8.000 admin)',
  },
  {
    category: 'QRIS',
    label: 'QRIS',
    desc: 'Deposit dengan Scan QRIS di semua aplikasi',
    methods: [],
    fee: '+0,7%',
    feeColor: 'text-orange-500',
    icon: '📱',
    suffix: '(+0.7%)',
  },
  {
    category: 'SHOPEEPAY',
    label: 'ShopeePay',
    desc: 'Menggunakan Aplikasi Shopee',
    methods: [],
    fee: '+2,5%',
    feeColor: 'text-orange-500',
    icon: '🛍️',
    suffix: '(+2.5%)',
  },
  {
    category: 'OVO',
    label: 'OVO',
    desc: 'Menggunakan Aplikasi OVO',
    methods: [],
    fee: '+2,5%',
    feeColor: 'text-purple-500',
    icon: '💜',
    suffix: '(+2.5%)',
  },
]

export default function DepositPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bankInfo, setBankInfo] = useState<Record<string,string>>({})
  const [selMethod, setSelMethod] = useState<string|null>(null)
  const [form, setForm] = useState({ amount: '', proofUrl: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [copied, setCopied] = useState(false)
  const limit = 10

  useEffect(() => { fetchDeposits(); fetchBankInfo() }, [])
  useEffect(() => { fetchDeposits() }, [page])

  async function fetchBankInfo() {
    try {
      const res = await api.get('/admin/config')
      const cfg: Record<string,string> = {}
      res.data.configs.forEach((c: any) => { cfg[c.key] = c.value })
      setBankInfo(cfg)
    } catch {}
  }

  async function fetchDeposits() {
    try {
      const res = await api.get(`/deposits?page=${page}&limit=${limit}`)
      setDeposits(res.data.deposits); setTotal(res.data.total)
    } finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Number(form.amount) < 10000) { toast.error('Minimal deposit Rp 10.000'); return }
    if (!selMethod) { toast.error('Pilih metode deposit dulu'); return }
    setSubmitting(true)
    try {
      await api.post('/deposits', { amount: Number(form.amount), proofUrl: form.proofUrl, note: form.note, method: selMethod })
      toast.success('Pengajuan deposit berhasil!')
      setForm({ amount: '', proofUrl: '', note: '' })
      setSelMethod(null)
      fetchDeposits()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal ajukan deposit')
    } finally { setSubmitting(false) }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const totalPages = Math.ceil(total / limit)
  if (loading) return <Loading />

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-gray-900">Deposit Saldo</h1>

      {/* Pilih Metode Pembayaran */}
      <div className="card">
        <p className="font-bold text-sm text-gray-900 mb-3">Pilih Metode Pembayaran</p>
        <div className="space-y-2">
          {DEPOSIT_METHODS.map(m => (
            <button key={m.category} onClick={() => setSelMethod(m.category)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                selMethod === m.category
                  ? 'border-[#00B4A0] bg-teal-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}>
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-400 truncate">{m.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs font-bold ${m.feeColor}`}>{m.fee}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info rekening (jika Bank Transfer dipilih) */}
      {selMethod === 'BANK' && (
        <div className="card border-2 border-[#00B4A0]">
          <p className="font-bold text-sm text-[#00B4A0] mb-3">Info Rekening Tujuan</p>
          <div className="space-y-2">
            {[
              { label: 'Bank', value: bankInfo.bank_name || '— Hubungi Admin —' },
              { label: 'No. Rekening', value: bankInfo.bank_account_number || '— Hubungi Admin —', copyable: true },
              { label: 'Atas Nama', value: bankInfo.bank_account_name || '— Hubungi Admin —' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2.5 rounded-xl">
                <span className="text-gray-500">{r.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{r.value}</span>
                  {r.copyable && r.value !== '— Hubungi Admin —' && (
                    <button onClick={() => copyToClipboard(r.value)} className="p-1">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-teal-700 mt-3 bg-teal-50 p-2 rounded-lg">
            💡 Transfer sesuai jumlah deposit, lalu isi form di bawah dan lampirkan bukti transfer.
          </p>
        </div>
      )}

      {/* Form deposit */}
      {selMethod && (
        <div className="card">
          <p className="font-bold text-sm text-gray-900 mb-3">Detail Deposit</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Jumlah Deposit (Rp)</label>
              <input type="number" className="input text-lg font-bold" placeholder="Minimal Rp 10.000"
                min="10000" step="10000" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} required />
              {/* Quick amount buttons */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {[50000, 100000, 200000, 500000].map(v => (
                  <button key={v} type="button" onClick={() => setForm({ ...form, amount: v.toString() })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      form.amount === v.toString() ? 'bg-[#00B4A0] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {formatRupiah(v)}
                  </button>
                ))}
              </div>
            </div>
            {selMethod === 'BANK' && (
              <div>
                <label className="label">Link Bukti Transfer</label>
                <input type="url" className="input" placeholder="https://drive.google.com/... (upload foto dulu)"
                  value={form.proofUrl} onChange={e => setForm({ ...form, proofUrl: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">Upload foto ke Google Drive / Imgur, paste linknya di sini.</p>
              </div>
            )}
            <div>
              <label className="label">Catatan (opsional)</label>
              <input type="text" className="input" placeholder="Transfer via ATM BCA, dll"
                value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Mengajukan...' : `Ajukan Deposit ${form.amount ? formatRupiah(Number(form.amount)) : ''}`}
            </button>
          </form>
        </div>
      )}

      {/* Riwayat deposit */}
      <div className="card">
        <p className="font-bold text-sm text-gray-900 mb-3">Riwayat Deposit</p>
        {deposits.length === 0 ? <Empty text="Belum ada deposit" /> : (
          <div className="space-y-2">
            {deposits.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-black text-gray-900">{formatRupiah(Number(d.amount))}</p>
                  <p className="text-xs text-gray-400">{formatDate(d.createdAt)}</p>
                  {d.method && <p className="text-[10px] text-gray-300 mt-0.5">{d.method}</p>}
                  {d.adminNote && <p className="text-xs text-red-500 mt-0.5">{d.adminNote}</p>}
                </div>
                <span className={getStatusBadge(d.status)}>{getStatusLabel(d.status)}</span>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-2 bg-gray-50 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs text-gray-500">Hal {page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-2 bg-gray-50 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
