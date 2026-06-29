'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', order: '0' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchBanners() }, [])

  async function fetchBanners() {
    try {
      const res = await api.get('/admin/banners')
      setBanners(res.data.banners)
    } finally { setLoading(false) }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/admin/banners', { ...form, order: Number(form.order) })
      toast.success('Banner ditambahkan')
      setForm({ title: '', imageUrl: '', linkUrl: '', order: '0' })
      setShowForm(false)
      fetchBanners()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal tambah banner')
    } finally { setSaving(false) }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await api.patch(`/admin/banners/${id}`, { isActive: !isActive })
      toast.success(isActive ? 'Banner dinonaktifkan' : 'Banner diaktifkan')
      fetchBanners()
    } catch { toast.error('Gagal update') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus banner ini?')) return
    try {
      await api.delete(`/admin/banners/${id}`)
      toast.success('Banner dihapus')
      fetchBanners()
    } catch { toast.error('Gagal hapus') }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Manajemen Banner</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Banner
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-[#00B4A0]">
          <h2 className="font-bold mb-4">Banner Baru</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="label">Judul Banner</label>
              <input type="text" className="input" placeholder="Promo Ramadan 50%" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">URL Gambar</label>
              <input type="url" className="input" placeholder="https://..." value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })} required />
            </div>
            <div>
              <label className="label">Link Tujuan (opsional)</label>
              <input type="url" className="input" placeholder="https://..." value={form.linkUrl}
                onChange={e => setForm({ ...form, linkUrl: e.target.value })} />
            </div>
            <div>
              <label className="label">Urutan (0 = paling atas)</label>
              <input type="number" className="input" min="0" value={form.order}
                onChange={e => setForm({ ...form, order: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Menyimpan...' : 'Simpan Banner'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? <Empty text="Belum ada banner" /> : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className="card">
              <div className="flex items-start gap-4">
                {b.imageUrl && (
                  <img src={b.imageUrl} alt={b.title}
                    className="w-24 h-16 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{b.title}</p>
                  {b.linkUrl && (
                    <p className="text-xs text-blue-600 truncate mt-0.5">{b.linkUrl}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Urutan: {b.order}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(b.id, b.isActive)}
                    className="p-2 hover:bg-gray-100 rounded-xl">
                    {b.isActive ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-[#00B4A0]" />}
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    className="p-2 hover:bg-red-50 rounded-xl">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
