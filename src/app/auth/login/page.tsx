'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api-client'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Login berhasil!')
      if (res.data.user.role === 'ADMIN') router.push('/admin/dashboard')
      else router.push('/reseller/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">I</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">InoviPay</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk ke akun Anda</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="email@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">Lupa password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
