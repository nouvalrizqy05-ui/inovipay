'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // API backend mengharapkan field "email", jadi kita map "identifier" ke "email"
      const res = await api.post('/auth/login', { 
        email: form.identifier, 
        password: form.password 
      })
      
      // Simpan token ke cookie secara native
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `token=${res.data.token}; expires=${expires}; path=/`
      
      const role = res.data.user.role
      toast.success('Berhasil masuk!')
      
      if (role === 'ADMIN') router.push('/admin/dashboard')
      else router.push('/reseller/dashboard')
      
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal masuk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang Kembali</h2>
          <p className="text-gray-600">Masuk untuk melanjutkan transaksi PPOB Anda</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="label">Email atau Nomor HP</label>
              <input type="text" required className="input" placeholder="0812xxx atau budi@email.com"
                value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })} />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/auth/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 font-medium">Lupa password?</Link>
              </div>
            </div>

            <button type="submit" disabled={loading} 
              className={`w-full py-3 px-4 flex justify-center items-center gap-2 rounded-xl text-white font-bold transition-all
                ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-md hover:shadow-lg'}`}>
              <LogIn className="w-5 h-5" />
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Belum bergabung?{' '}
            <Link href="/auth/register" className="font-bold text-amber-600 hover:text-amber-700">Daftar Mitra Gratis</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
