'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2, Edit3, X, Save } from 'lucide-react'

export default function CatatanPage() {
  const [catatan, setCatatan] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCatatan() }, [])

  async function fetchCatatan() {
    try {
      const res = await api.get('/catatan')
      setCatatan(res.data.catatan)
    } finally { setLoading(false) }
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.patch(`/catatan/${editing.id}`, form)
        toast.success('Catatan diperbarui')
      } else {
        await api.post('/catatan', form)
        toast.success('Catatan disimpan')
      }
      setForm({ title: '', content: '' })
      setShowForm(false); setEditing(null)
      fetchCatatan()
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal simpan')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus catatan ini?')) return
    try {
      await api.delete(`/catatan/${id}`)
      toast.success('Catatan dihapus')
      fetchCatatan()
    } catch { toast.error('Gagal hapus') }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">Catatan</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', content: '' }) }}
          className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" /> Baru
        </button>
      </div>

      {/* Form */}
      {(showForm || editing) && (
        <div className="card border-2 border-[#00B4A0]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm">{editing ? 'Edit Catatan' : 'Catatan Baru'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null) }}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <input type="text" className="input mb-3" placeholder="Judul catatan..."
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="input resize-none" rows={4} placeholder="Isi catatan..."
            value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {catatan.length === 0 ? <Empty text="Belum ada catatan" /> : (
        <div className="space-y-3">
          {catatan.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                  {c.content && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{c.content}</p>}
                  <p className="text-[10px] text-gray-300 mt-2">{formatDate(c.updatedAt)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditing(c); setForm({ title: c.title, content: c.content }); setShowForm(false) }}
                    className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-50 rounded-lg">
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
