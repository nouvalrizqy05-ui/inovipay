'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [digiflazzBalance, setDigiflazzBalance] = useState<number|null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string|null>(null)
  const [values, setValues] = useState<Record<string,string>>({})

  useEffect(() => {
    api.get('/admin/config').then(r => {
      setConfigs(r.data.configs)
      setDigiflazzBalance(r.data.digiflazzBalance)
      const v: Record<string,string> = {}
      r.data.configs.forEach((c: any) => { v[c.key] = c.value })
      setValues(v)
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave(key: string) {
    setSaving(key)
    try {
      await api.patch('/admin/config', { key, value: values[key] })
      toast.success('Konfigurasi disimpan')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal simpan')
    } finally { setSaving(null) }
  }

  const configLabels: Record<string,string> = {
    'digiflazz_low_balance_threshold': 'Threshold Alert Saldo Rendah (Rp)',
    'platform_name': 'Nama Platform',
    'min_deposit': 'Minimum Deposit (Rp)',
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Konfigurasi Sistem</h1>

      {/* Saldo Digiflazz */}
      <div className={`card border-2 ${digiflazzBalance !== null && digiflazzBalance < 500000 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
        <h2 className="font-semibold text-gray-900 mb-2">Saldo Digiflazz (Real-time)</h2>
        <p className={`text-3xl font-bold ${digiflazzBalance !== null && digiflazzBalance < 500000 ? 'text-red-600' : 'text-green-600'}`}>
          {digiflazzBalance !== null ? formatRupiah(digiflazzBalance) : '— Gagal cek —'}
        </p>
        {digiflazzBalance !== null && digiflazzBalance < 500000 && (
          <p className="text-red-600 text-sm mt-1">⚠️ Saldo menipis! Segera top up di dashboard Digiflazz.</p>
        )}
        <p className="text-xs text-gray-500 mt-2">Top up dilakukan manual melalui dashboard digiflazz.com</p>
      </div>

      {/* Config items */}
      <div className="card space-y-6">
        <h2 className="font-semibold text-gray-900">Pengaturan Platform</h2>
        {configs.map(c => (
          <div key={c.key}>
            <label className="label">{configLabels[c.key] ?? c.key}</label>
            <div className="flex gap-2">
              <input type="text" className="input" value={values[c.key] ?? ''} onChange={e => setValues({...values, [c.key]: e.target.value})} />
              <button onClick={() => handleSave(c.key)} disabled={saving === c.key} className="btn-primary whitespace-nowrap">
                {saving === c.key ? 'Simpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info rekening admin */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Info Rekening (untuk deposit reseller)</h2>
        <p className="text-sm text-gray-500 mb-3">Isi info rekening bank kamu di sini. Ini akan ditampilkan ke reseller saat mereka deposit.</p>
        {[
          { key:'bank_name', label:'Nama Bank' },
          { key:'bank_account_number', label:'Nomor Rekening' },
          { key:'bank_account_name', label:'Atas Nama' },
        ].map(f => (
          <div key={f.key} className="mb-3">
            <label className="label">{f.label}</label>
            <div className="flex gap-2">
              <input type="text" className="input" value={values[f.key] ?? ''} onChange={e => setValues({...values, [f.key]: e.target.value})} placeholder={`Isi ${f.label.toLowerCase()}...`} />
              <button onClick={() => handleSave(f.key)} disabled={saving === f.key} className="btn-primary whitespace-nowrap">
                {saving === f.key ? '...' : 'Simpan'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
