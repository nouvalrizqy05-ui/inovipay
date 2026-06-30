'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import ConfirmModal from '@/components/ui/confirm-modal'
import api from '@/lib/api-client'
import { formatDate, formatRupiah } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  User, Lock, Shield, Star, ChevronRight, LogOut,
  Edit3, Check, X, Eye, EyeOff, Store, MapPin, Smartphone
} from 'lucide-react'

const TIER_INFO = {
  RESELLER: { label: 'Reseller', color: 'bg-blue-100 text-blue-700', next: 'Agen', txNeeded: 100 },
  AGEN: { label: 'Agen', color: 'bg-emerald-100 text-emerald-700', next: 'Master Dealer', txNeeded: 500 },
  MASTER_DEALER: { label: 'Master Dealer', color: 'bg-yellow-100 text-yellow-700', next: null, txNeeded: 0 },
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'main'|'edit'|'pin'>('main')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [form, setForm] = useState({ name: '', storeName: '' })
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' })
  const [requestDevices, setRequestDevices] = useState(2)
  
  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    api.get('/reseller/profile').then(r => {
      setUser(r.data.user)
      setForm({ name: r.data.user.name, storeName: r.data.user.storeName || '' })
    }).finally(() => setLoading(false))
  }, [])

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const res = await api.patch('/reseller/profile', { name: form.name, storeName: form.storeName })
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Profil diperbarui')
      setActiveSection('main')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal memperbarui profil')
    } finally { setSaving(false) }
  }

  async function handleRequestDevice() {
    setSaving(true)
    try {
      await api.post('/reseller/device-request', { requestedDevices: requestDevices })
      setUser({ ...user, deviceRequest: requestDevices })
      toast.success('Permintaan berhasil dikirim ke Admin')
      setActiveSection('main')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal mengirim permintaan')
    } finally { setSaving(false) }
  }

  async function handleSavePin() {
    if (pinForm.newPin !== pinForm.confirmPin) { toast.error('PIN baru tidak cocok'); return }
    if (pinForm.newPin.length !== 6) { toast.error('PIN harus 6 digit angka'); return }
    if (user?.hasPIN && !pinForm.currentPin) { toast.error('Masukkan PIN lama Anda'); return }
    
    setSaving(true)
    try {
      const res = await api.patch('/reseller/profile', { 
        currentPin: pinForm.currentPin, 
        newPin: pinForm.newPin 
      })
      setUser(res.data.user)
      toast.success('PIN berhasil diubah!')
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
      setActiveSection('main')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal mengubah PIN')
    } finally { setSaving(false) }
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await api.delete('/reseller/profile')
      toast.success('Akun berhasil dihapus')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/auth/login')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal menghapus akun')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) return <Loading />

  const tier = TIER_INFO[user?.tier as keyof typeof TIER_INFO] ?? TIER_INFO.RESELLER

  if (activeSection === 'edit') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        <h1 className="text-xl font-black">Edit Profil</h1>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Nama Lengkap</label>
          <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Nama Toko</label>
          <input type="text" className="input" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} />
        </div>
        <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Profil'}</button>
      </div>
    </div>
  )

  if (activeSection === 'device') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        <h1 className="text-xl font-black">Batas Perangkat</h1>
      </div>
      <div className="card space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          <p className="font-semibold">📱 Keamanan Akun</p>
          <p className="mt-0.5 text-xs">Batas perangkat saat ini adalah {user?.maxDevices || 1}. Jika ingin menggunakan lebih banyak HP untuk akun yang sama, Anda bisa memintanya ke Admin.</p>
        </div>
        
        {user?.deviceRequest ? (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-center border border-yellow-200">
            <p className="font-bold">Permintaan Sedang Diproses ⏳</p>
            <p className="text-sm mt-1">Anda sudah meminta untuk {user.deviceRequest} perangkat. Menunggu persetujuan Admin.</p>
          </div>
        ) : (
          <>
            <div>
              <label className="label">Jumlah Perangkat yang Diinginkan</label>
              <input type="number" min={(user?.maxDevices || 1) + 1} className="input" value={requestDevices} onChange={e => setRequestDevices(Number(e.target.value))} />
            </div>
            
            <button onClick={handleRequestDevice} disabled={saving} className="btn-primary w-full bg-blue-600 hover:bg-blue-700">{saving ? 'Mengirim...' : 'Ajukan Permintaan'}</button>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">Atau hubungi via </span>
              <a href="https://wa.me/6281200000000" target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-600 hover:underline">WhatsApp Admin</a>
            </div>
          </>
        )}
      </div>
    </div>
  )

  if (activeSection === 'pin') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        <h1 className="text-xl font-black">{user?.hasPIN ? 'Ganti PIN' : 'Atur PIN'}</h1>
      </div>
      <div className="card space-y-4">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800">
          <p className="font-semibold">🔐 Keamanan Akun & Transaksi</p>
          <p className="mt-0.5 text-xs">PIN ini digunakan untuk login dan menyetujui setiap transaksi.</p>
        </div>
        
        {user?.hasPIN && (
          <div>
            <label className="label">PIN Lama</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} inputMode="numeric" maxLength={6} className="input pr-10 text-center tracking-widest text-lg font-mono" placeholder="● ● ● ● ● ●"
                value={pinForm.currentPin} onChange={e => setPinForm({ ...pinForm, currentPin: e.target.value.replace(/\D/g, '') })} />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5">
                {showPw ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="label">PIN Baru (6 digit)</label>
          <input type="password" inputMode="numeric" maxLength={6} className="input text-center tracking-widest text-lg font-mono" placeholder="● ● ● ● ● ●"
            value={pinForm.newPin} onChange={e => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '') })} />
        </div>
        <div>
          <label className="label">Konfirmasi PIN Baru</label>
          <input type="password" inputMode="numeric" maxLength={6} className="input text-center tracking-widest text-lg font-mono" placeholder="● ● ● ● ● ●"
            value={pinForm.confirmPin} onChange={e => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '') })} />
        </div>
        
        <button onClick={handleSavePin} disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan PIN'}</button>
      </div>
    </div>
  )

  // ── Main profile view ──
  return (
    <div className="space-y-4">
      {/* Avatar + info */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00B4A0] to-[#007A6E] rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-lg truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs font-semibold">{user?.storeName}</p>
            <p className="text-gray-400 text-xs mt-1">{user?.phone} • {user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.color}`}>{tier.label}</span>
              {user?.hasPIN
                ? <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><Shield className="w-3 h-3" /> PIN Aktif</span>
                : <span className="text-[10px] text-red-500 font-semibold">PIN Belum Diatur</span>
              }
            </div>
          </div>
          <button onClick={() => setActiveSection('edit')} className="p-2 hover:bg-gray-100 rounded-xl">
            <Edit3 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tier progress */}
      {tier.next && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-sm text-gray-900">Progress Tier</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.color}`}>{tier.label}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-[#00B4A0] h-2 rounded-full" style={{ width: '35%' }} />
          </div>
          <p className="text-xs text-gray-500">Naik ke <span className="font-bold text-[#00B4A0]">{tier.next}</span> dengan lebih banyak transaksi</p>
        </div>
      )}

      {/* Menu akun (Keamanan) */}
      <div className="card divide-y divide-gray-50">
        <button onClick={() => setActiveSection('pin')}
          className="w-full flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 hover:text-[#00B4A0] transition-colors">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#00B4A0] bg-teal-50">
            <Shield className="w-4 h-4" />
          </div>
          <span className="flex-1 text-sm font-semibold text-left text-gray-800">{user?.hasPIN ? 'Ganti PIN' : 'Atur PIN'}</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
        <button onClick={() => setActiveSection('device')}
          className="w-full flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 hover:text-blue-600 transition-colors">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50">
            <Smartphone className="w-4 h-4" />
          </div>
          <span className="flex-1 text-sm font-semibold text-left text-gray-800">Manajemen Perangkat ({user?.maxDevices || 1})</span>
          {user?.deviceRequest && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Pending</span>}
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Info akun */}
      <div className="card">
        <p className="font-bold text-sm text-gray-900 mb-3">Info Akun & Wilayah</p>
        {[
          ['ID Reseller', user?.id?.slice(-8).toUpperCase()],
          ['Kode Referral', user?.referralCode ?? '-'],
          ['Status', user?.status],
          ['Provinsi', user?.provinsi ?? '-'],
          ['Kabupaten/Kota', user?.kabupaten ?? '-'],
          ['Kecamatan', user?.kecamatan ?? '-'],
          ['Alamat Detail', user?.alamat ?? '-'],
          ['Bergabung', user?.createdAt ? formatDate(user.createdAt) : '-'],
        ].map(([k, v]) => (
          <div key={k as string} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
            <span className="text-gray-500 w-1/3">{k}</span>
            <span className="font-semibold text-gray-900 text-right w-2/3 truncate">{v}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 font-bold text-sm rounded-2xl hover:bg-red-100 transition-colors active:scale-95">
        <LogOut className="w-4 h-4" />
        Keluar dari Akun
      </button>
      {/* Delete Account */}
      <button onClick={() => setShowDeleteConfirm(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-100 text-red-700 font-bold text-sm rounded-2xl hover:bg-red-200 transition-colors active:scale-95 mt-2">
        Hapus Akun Permanen
      </button>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Hapus Akun Permanen?"
        message="Semua data Anda (termasuk saldo, transaksi, dan riwayat) akan dihapus secara permanen dan tidak dapat dikembalikan. Lanjutkan?"
        confirmLabel={deleting ? "Menghapus..." : "Ya, Hapus"}
        danger={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
