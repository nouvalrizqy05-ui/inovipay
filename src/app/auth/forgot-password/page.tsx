'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [phone, setPhone] = useState('')
  const [form, setForm] = useState({ token: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { phone })
      toast.success('Kode reset dikirim via WhatsApp')
      setStep('reset')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal kirim kode')
    } finally { setLoading(false) }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { toast.error('Password tidak cocok'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { phone, token: form.token, newPassword: form.newPassword })
      toast.success('Password berhasil direset! Silakan login.')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Reset gagal')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'request' ? 'Masukkan nomor HP terdaftar' : 'Masukkan kode dari WhatsApp'}
          </p>
        </div>
        <div className="card">
          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="label">Nomor HP (WhatsApp)</label>
                <input type="tel" className="input" placeholder="08123456789"
                  value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Mengirim...' : 'Kirim Kode Reset'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label">Kode Reset (dari WhatsApp)</label>
                <input type="text" className="input" placeholder="XXXXXX"
                  value={form.token} onChange={e => setForm({ ...form, token: e.target.value })} required />
              </div>
              <div>
                <label className="label">Password Baru</label>
                <input type="password" className="input" placeholder="Min. 8 karakter"
                  value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
              </div>
              <div>
                <label className="label">Konfirmasi Password Baru</label>
                <input type="password" className="input" placeholder="Ulangi password baru"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Mereset...' : 'Reset Password'}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/auth/login" className="text-blue-600 hover:underline">← Kembali ke Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
