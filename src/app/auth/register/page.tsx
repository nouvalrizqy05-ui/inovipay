'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: '' })
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showPw, setShowPw] = useState(false)
  
  // Real-time validation
  const validations = {
    name: form.name.length >= 3,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    phone: /^08[0-9]{8,12}$/.test(form.phone),
    password: form.password.length >= 8,
    confirmPassword: form.password === form.confirmPassword && form.password !== '',
  }

  const allValid = Object.values(validations).every(Boolean) && agreed
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleBlur = (field: string) => setTouched({ ...touched, [field]: true })

  const getPasswordStrength = () => {
    let score = 0
    if (form.password.length > 7) score += 1
    if (/[A-Z]/.test(form.password)) score += 1
    if (/[0-9]/.test(form.password)) score += 1
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1
    return score
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allValid) { toast.error('Periksa kembali isian Anda'); return }
    setLoading(true)
    try {
      await api.post('/auth/register', { 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password, 
        referralCode: form.referralCode 
      })
      toast.success('Registrasi berhasil! Menunggu aktivasi admin.')
      router.push('/auth/login')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal daftar')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Daftar Mitra Baru</h2>
          <p className="text-gray-600">Gabung InoviPay dan mulai hasilkan cuan hari ini!</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nama */}
            <div>
              <label className="label">Nama Lengkap Sesuai KTP</label>
              <input type="text" className={`input ${touched.name && !validations.name ? 'border-red-500' : ''}`}
                placeholder="Budi Santoso" value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                onBlur={() => handleBlur('name')} />
              {touched.name && !validations.name && <p className="text-xs text-red-500 mt-1">Nama minimal 3 karakter</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Alamat Email</label>
              <input type="email" className={`input ${touched.email && !validations.email ? 'border-red-500' : ''}`}
                placeholder="budi@example.com" value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })}
                onBlur={() => handleBlur('email')} />
              {touched.email && !validations.email && <p className="text-xs text-red-500 mt-1">Format email tidak valid</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="label">No WhatsApp Aktif</label>
              <input type="tel" className={`input ${touched.phone && !validations.phone ? 'border-red-500' : ''}`}
                placeholder="081234567890" value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })}
                onBlur={() => handleBlur('phone')} />
              {touched.phone && !validations.phone && <p className="text-xs text-red-500 mt-1">Gunakan awalan 08 (10-14 digit)</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password Akun</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} className={`input pr-10 ${touched.password && !validations.password ? 'border-red-500' : ''}`}
                  placeholder="Minimal 8 karakter" value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onBlur={() => handleBlur('password')} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {form.password && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(level => (
                    <div key={level} className={`h-1.5 w-full rounded-full ${getPasswordStrength() >= level ? (getPasswordStrength() > 2 ? 'bg-green-500' : 'bg-amber-500') : 'bg-gray-200'}`} />
                  ))}
                </div>
              )}
              {touched.password && !validations.password && <p className="text-xs text-red-500 mt-1">Minimal 8 karakter</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Konfirmasi Password</label>
              <input type={showPw ? "text" : "password"} className={`input ${touched.confirmPassword && !validations.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Ulangi password" value={form.confirmPassword} 
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                onBlur={() => handleBlur('confirmPassword')} />
              {touched.confirmPassword && !validations.confirmPassword && <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>}
            </div>

            {/* Referral Code */}
            <div>
              <label className="label flex items-center gap-2">
                Kode Referral (Opsional)
              </label>
              <input type="text" className="input uppercase"
                placeholder="Contoh: INOVI123" value={form.referralCode}
                onChange={e => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} />
            </div>

            {/* ToS Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500 cursor-pointer" />
              <span className="text-sm text-gray-600">
                Saya menyetujui <Link href="/terms" className="text-amber-600 font-medium hover:underline">Syarat & Ketentuan</Link> dan <Link href="/privacy" className="text-amber-600 font-medium hover:underline">Kebijakan Privasi</Link> InoviPay.
              </span>
            </label>

            <button type="submit" disabled={loading || !allValid} 
              className={`w-full py-3 px-4 flex justify-center items-center gap-2 rounded-xl text-white font-bold transition-all
                ${loading || !allValid ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-md hover:shadow-lg'}`}>
              <ShieldCheck className="w-5 h-5" />
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="font-bold text-amber-600 hover:text-amber-700">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
