'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import { Eye, EyeOff, User, Lock, ArrowRight, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ identifier: '', pin: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      toast.success(res.data.message)

      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        router.push('/admin/dashboard')
      } else {
        router.push(`/auth/verify-otp?userId=${res.data.userId}`)
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error ?? 'Login gagal'
      if (errMsg.includes('<a')) {
        toast.error(
          <div dangerouslySetInnerHTML={{ __html: errMsg }} />
        )
      } else {
        toast.error(errMsg)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F97316] via-[#F97316] to-[#C2410C] flex items-end lg:items-center justify-center p-0 lg:p-4 relative">
      
      {/* Tombol Kembali ke Landing Page */}
      <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-8 z-50 flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all active:scale-95">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="w-full lg:max-w-4xl lg:grid lg:grid-cols-12 lg:bg-white lg:rounded-3xl lg:shadow-2xl overflow-hidden relative">
        
        {/* Desktop Left Panel */}
        <div className="hidden lg:flex lg:col-span-7 bg-[#F5F6FA] flex-col items-center justify-center p-12 relative overflow-hidden group">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 w-full max-w-sm">
            <div className="w-20 h-20 flex items-center justify-center mb-8 transform -rotate-6">
              <img src="/logo-orange.png" alt="InoviStore Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">Mulai Bisnis<br/><span className="text-[#F97316]">Digital Anda</span></h1>
            <p className="text-gray-500 mb-8">Platform PPOB & Server Pulsa tercepat, teraman, dan terpercaya di Indonesia.</p>
            
            <div className="space-y-4">
              {[
                { title: 'Transaksi Cepat', desc: 'Otomatis 24/7 tanpa henti' },
                { title: 'Harga Terbaik', desc: 'Margin keuntungan lebih besar' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#F97316]">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="w-full lg:col-span-5 relative z-10">
          {/* Header Mobile */}
          <div className="text-center py-10 px-6 lg:hidden">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <img src="/logo-transparent.png" alt="InoviStore Logo" className="w-full h-full object-contain drop-shadow-xl" />
            </div>
            <h1 className="text-3xl font-black text-white">InoviStore</h1>
            <p className="text-orange-100 text-sm mt-1">Platform PPOB & Server Pulsa</p>
          </div>

          <div className="bg-white rounded-t-3xl lg:rounded-none p-6 lg:p-10 lg:h-full flex flex-col justify-center">
            <h2 className="text-2xl font-black text-gray-900 mb-1 hidden lg:block">Masuk Akun</h2>
            <p className="text-sm text-gray-500 mb-8 hidden lg:block">Selamat datang kembali! Silakan login.</p>
            
            <h2 className="text-xl font-black text-gray-900 mb-5 lg:hidden">Masuk ke Akun</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nomor HP / Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                  </div>
                  <input type="text" className="input pl-11" placeholder="08xxx atau email@example.com"
                    value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">PIN</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                  </div>
                  <input type={showPw ? 'text' : 'password'} inputMode="numeric" maxLength={6} className="input pl-11 pr-10 font-mono tracking-wider" placeholder="••••••"
                    value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 outline-none">
                    {showPw ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Link href="/auth/forgot-password" className="text-sm text-[#FF6B35] font-semibold hover:underline">
                  Lupa PIN?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-[#F97316]/20 mt-2">
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="relative my-6 lg:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-400 font-medium">Belum punya akun?</span>
              </div>
            </div>

            <Link href="/auth/register"
              className="w-full flex items-center justify-center py-3.5 border-2 border-[#F97316] text-[#F97316] font-bold rounded-xl hover:bg-orange-50 transition-colors active:scale-[0.98]">
              Daftar Jadi Agen
            </Link>

            <p className="text-center text-xs text-gray-400 mt-6">
              Dengan masuk, kamu menyetujui{' '}
              <Link href="/terms" className="text-[#F97316] hover:underline font-medium">Syarat & Ketentuan</Link>
              {' '}serta{' '}
              <Link href="/privacy" className="text-[#F97316] hover:underline font-medium">Kebijakan Privasi</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
