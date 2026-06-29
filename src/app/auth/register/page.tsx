'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import { Eye, EyeOff, User, Mail, Phone, Lock, Gift, MapPin, Store, Building2, CheckSquare, ArrowLeft } from 'lucide-react'

interface Region {
  id: string
  nama: string
}

export default function RegisterPage() {
  const router = useRouter()
  
  const [form, setForm] = useState({
    name: '', storeName: '', email: '', phone: '', 
    provinsi: '', kabupaten: '', kecamatan: '', alamat: '',
    pin: '', confirmPin: '', referralCode: ''
  })
  
  // State for IDs to fetch next levels
  const [selectedProvId, setSelectedProvId] = useState('')
  const [selectedKabId, setSelectedKabId] = useState('')

  // State for Dropdown Data
  const [provinsis, setProvinsis] = useState<Region[]>([])
  const [kabupatens, setKabupatens] = useState<Region[]>([])
  const [kecamatans, setKecamatans] = useState<Region[]>([])
  
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  // Fetch Provinsis on mount
  useEffect(() => {
    fetch('https://ibnux.github.io/data-indonesia/provinsi.json')
      .then(res => res.json())
      .then(data => setProvinsis(data))
      .catch(() => toast.error('Gagal mengambil data provinsi'))
  }, [])

  // Fetch Kabupaten when Provinsi changes
  useEffect(() => {
    setKabupatens([])
    setKecamatans([])
    setSelectedKabId('')
    setForm(prev => ({ ...prev, kabupaten: '', kecamatan: '' }))
    
    if (selectedProvId) {
      fetch(`https://ibnux.github.io/data-indonesia/kabupaten/${selectedProvId}.json`)
        .then(res => res.json())
        .then(data => setKabupatens(data))
        .catch(() => toast.error('Gagal mengambil data kabupaten'))
    }
  }, [selectedProvId])

  // Fetch Kecamatan when Kabupaten changes
  useEffect(() => {
    setKecamatans([])
    setForm(prev => ({ ...prev, kecamatan: '' }))
    
    if (selectedKabId) {
      fetch(`https://ibnux.github.io/data-indonesia/kecamatan/${selectedKabId}.json`)
        .then(res => res.json())
        .then(data => setKecamatans(data))
        .catch(() => toast.error('Gagal mengambil data kecamatan'))
    }
  }, [selectedKabId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { toast.error('Anda harus menyetujui S&K'); return }
    if (form.pin !== form.confirmPin) { toast.error('PIN tidak cocok'); return }
    if (form.pin.length !== 6) { toast.error('PIN harus persis 6 digit angka'); return }
    
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      toast.success(res.data.message)
      setTimeout(() => {
        router.push(`/auth/login`)
      }, 500)
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Registrasi gagal')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F97316] via-[#F97316] to-[#C2410C] flex items-end lg:items-center justify-center p-0 lg:p-4 relative">
      
      {/* Tombol Kembali ke Landing Page */}
      <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-8 z-50 flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all active:scale-95 shadow-lg shadow-[#F97316]/20">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="w-full lg:max-w-5xl lg:grid lg:grid-cols-12 lg:bg-white lg:rounded-3xl lg:shadow-2xl overflow-hidden relative">
        
        {/* Desktop Left Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#F97316] flex-col items-center justify-center p-12 relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10 w-full text-center">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <img src="/logo-orange.png" alt="InoviStore Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black mb-4">Bergabung Bersama Kami</h1>
            <p className="text-orange-100 text-sm mb-8 leading-relaxed">Jadilah agen InoviStore dan mulai usaha digitalmu sekarang. Transaksi mudah, margin menguntungkan!</p>
            
            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm text-left">
              <div className="flex items-center gap-3 mb-3">
                <CheckSquare className="text-orange-200 w-5 h-5" />
                <span className="font-semibold text-sm">Pendaftaran Gratis 100%</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <CheckSquare className="text-orange-200 w-5 h-5" />
                <span className="font-semibold text-sm">Harga Dasar Termurah</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckSquare className="text-orange-200 w-5 h-5" />
                <span className="font-semibold text-sm">Aktivasi Instan via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="w-full lg:col-span-7 relative z-10 h-full max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Header mobile */}
          <div className="text-center py-8 px-6 lg:hidden">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <img src="/logo-transparent.png" alt="InoviStore Logo" className="w-full h-full object-contain drop-shadow-xl" />
            </div>
            <h1 className="text-2xl font-black text-white">Daftar Agen</h1>
            <p className="text-orange-100 text-sm mt-1">Mulai usaha digital dari rumah</p>
          </div>

          <div className="bg-white rounded-t-3xl lg:rounded-none p-6 lg:p-10">
            <h2 className="text-2xl font-black text-gray-900 mb-6 hidden lg:block">Form Pendaftaran</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Profil Singkat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                    <input type="text" className="input pl-11" placeholder="Sesuai KTP" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="label">Nama Toko</label>
                  <div className="relative group">
                    <Store className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                    <input type="text" className="input pl-11" placeholder="Cth: Budi Cell" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                    <input type="email" className="input pl-11" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="label">Nomor WhatsApp</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                    <input type="tel" className="input pl-11" placeholder="08123456789" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">OTP akan dikirim ke nomor ini.</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Wilayah */}
              <h3 className="font-bold text-gray-900 text-sm">Alamat Lengkap</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Provinsi</label>
                  <select className="input cursor-pointer" required value={selectedProvId} onChange={e => {
                    const id = e.target.value;
                    const nama = provinsis.find(p => p.id === id)?.nama || '';
                    setSelectedProvId(id);
                    setForm({ ...form, provinsi: nama });
                  }}>
                    <option value="">Pilih Provinsi</option>
                    {provinsis.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Kabupaten / Kota</label>
                  <select className="input cursor-pointer" required disabled={!selectedProvId} value={selectedKabId} onChange={e => {
                    const id = e.target.value;
                    const nama = kabupatens.find(k => k.id === id)?.nama || '';
                    setSelectedKabId(id);
                    setForm({ ...form, kabupaten: nama });
                  }}>
                    <option value="">Pilih Kabupaten/Kota</option>
                    {kabupatens.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Kecamatan</label>
                <select className="input cursor-pointer" required disabled={!selectedKabId} value={form.kecamatan} onChange={e => setForm({ ...form, kecamatan: e.target.value })}>
                  <option value="">Pilih Kecamatan</option>
                  {kecamatans.map(k => <option key={k.id} value={k.nama}>{k.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Alamat Detail</label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                  <input type="text" className="input pl-11" placeholder="Nama Jalan, RT/RW, Kelurahan" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} required />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* PIN & Referral */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">PIN</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                    <input type={showPw ? 'text' : 'password'} inputMode="numeric" maxLength={6} className="input pl-11 pr-10 font-mono tracking-wider" placeholder="6 Digit Angka"
                      value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })} required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5">
                      {showPw ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Konfirmasi PIN</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
                    <input type={showConfirmPw ? 'text' : 'password'} inputMode="numeric" maxLength={6} className="input pl-11 pr-10 font-mono tracking-wider" placeholder="Ulangi 6 Digit PIN"
                      value={form.confirmPin} onChange={e => setForm({ ...form, confirmPin: e.target.value.replace(/\D/g, '') })} required />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-3.5">
                      {showConfirmPw ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Kode Referral <span className="text-gray-400 font-normal">(Opsional)</span></label>
                <div className="relative group">
                  <Gift className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                  <input type="text" className="input pl-11 uppercase" placeholder="Masukkan kode referral"
                    value={form.referralCode} onChange={e => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} />
                </div>
              </div>

              {/* Syarat & Ketentuan */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#F97316]/20 checked:border-[#F97316] checked:bg-[#F97316] transition-all cursor-pointer" 
                      checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                    <CheckSquare className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Saya menyetujui <Link href="/terms" className="text-[#F97316] font-semibold hover:underline">Syarat & Ketentuan</Link> serta <Link href="/privacy" className="text-[#F97316] font-semibold hover:underline">Kebijakan Privasi</Link> InoviStore.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base shadow-lg shadow-[#F97316]/20 mt-4">
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6 pb-6 lg:pb-0">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-[#FF6B35] font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
