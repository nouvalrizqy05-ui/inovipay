'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api-client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error('Password tidak cocok'); return }
    if (form.password.length < 8) { toast.error('Password minimal 8 karakter'); return }
    setLoading(true)
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, phone: form.phone, password: form.password })
      toast.success('Registrasi berhasil! Menunggu aktivasi admin.')
      router.push('/auth/login')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Muhammad Nouval' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
    { key: 'phone', label: 'Nomor HP (WhatsApp)', type: 'tel', placeholder: '08123456789' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 karakter' },
    { key: 'confirmPassword', label: 'Konfirmasi Password', type: 'password', placeholder: 'Ulangi password' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Reseller</h1>
          <p className="text-gray-500 text-sm mt-1">Buat akun reseller baru</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type={f.type} className="input" placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
              </div>
            ))}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              ⚠️ Akun akan aktif setelah disetujui admin. Kami akan menghubungi via WhatsApp.
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
