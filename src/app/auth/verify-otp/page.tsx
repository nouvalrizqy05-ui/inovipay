'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import Link from 'next/link'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) {
      toast.error('User ID tidak valid')
      return
    }
    
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp })
      toast.success(res.data.message)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      
      if (res.data.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/reseller/dashboard')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal memverifikasi OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F97316] via-[#F97316] to-[#C2410C] flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="w-full lg:max-w-4xl lg:grid lg:grid-cols-12 lg:bg-white lg:rounded-3xl lg:shadow-2xl overflow-hidden">
        
        {/* Desktop Left Panel */}
        <div className="hidden lg:flex lg:col-span-7 bg-gray-50 flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F97316]/5 backdrop-blur-3xl z-0" />
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-[#F97316] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#F97316]/30 text-white font-black text-3xl">
              IP
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Verifikasi OTP</h1>
            <p className="text-gray-500 max-w-md mx-auto">Satu langkah lagi untuk memulai bisnis digital Anda. Masukkan kode yang dikirim ke WhatsApp Anda.</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="w-full lg:col-span-5 relative z-10">
          {/* Header Mobile */}
          <div className="text-center py-8 px-6 lg:hidden">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-black text-2xl">IP</span>
            </div>
            <h1 className="text-2xl font-black text-white">Verifikasi Akun</h1>
            <p className="text-orange-100 text-sm mt-1">Cek kode OTP di WhatsApp Anda</p>
          </div>

          <div className="bg-white rounded-t-3xl lg:rounded-none p-6 lg:p-10 lg:h-full flex flex-col justify-center">
            <h2 className="text-xl font-black text-gray-900 mb-2 hidden lg:block">Masukkan OTP</h2>
            <p className="text-sm text-gray-500 mb-6 hidden lg:block">Kode OTP telah dikirim via WhatsApp.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Kode OTP</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className="input text-center text-2xl tracking-widest font-bold" 
                  placeholder="------"
                  maxLength={6}
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                  required 
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                ⚠️ Pastikan nomor WhatsApp Anda aktif untuk menerima pesan dari InoviStore.
              </div>

              <button type="submit" disabled={loading || otp.length < 4} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-[#F97316]/20">
                {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Ingin mendaftar dengan nomor lain?{' '}
                <Link href="/auth/register" className="text-[#FF6B35] font-bold hover:underline">
                  Kembali
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Memuat...</div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}

