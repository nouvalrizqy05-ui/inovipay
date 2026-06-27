'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import api from '@/lib/api-client'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/reseller/profile').then(r => {
      setUser(r.data.user)
      setForm(f => ({ ...f, name: r.data.user.name }))
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (form.newPassword && form.newPassword !== form.confirmPassword) { toast.error('Password baru tidak cocok'); return }
    if (form.newPassword && form.newPassword.length < 8) { toast.error('Password minimal 8 karakter'); return }
    setSaving(true)
    try {
      const payload: any = { name: form.name }
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword }
      const res = await api.patch('/reseller/profile', payload)
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Profil berhasil diperbarui')
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal simpan')
    } finally { setSaving(false) }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-gray-500 text-sm">{user?.phone}</p>
            <p className="text-xs text-gray-400 mt-1">Bergabung {formatDate(user?.createdAt)}</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <hr />
          <p className="text-sm font-medium text-gray-700">Ganti Password (opsional)</p>
          <div>
            <label className="label">Password Lama</label>
            <input type="password" className="input" placeholder="Kosongkan jika tidak ganti password"
              value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">Password Baru</label>
            <input type="password" className="input" placeholder="Min. 8 karakter"
              value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">Konfirmasi Password Baru</label>
            <input type="password" className="input" placeholder="Ulangi password baru"
              value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  )
}
