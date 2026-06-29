'use client'
import { useState } from 'react'
import { Calculator, Plus, Trash2, Printer, Share2 } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface KasirItem {
  id: string
  name: string
  price: number
  qty: number
}

export default function KasirPage() {
  const [items, setItems] = useState<KasirItem[]>([])
  const [form, setForm] = useState({ name: '', price: '', qty: '1' })
  const [note, setNote] = useState('')
  const [showRecap, setShowRecap] = useState(false)

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  function addItem() {
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return }
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      name: form.name,
      price: Number(form.price),
      qty: Number(form.qty) || 1,
    }])
    setForm({ name: '', price: '', qty: '1' })
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function shareWA() {
    if (items.length === 0) { toast.error('Tambahkan item dulu'); return }
    const now = new Date()
    let text = `*STRUK KASIR*\n${formatDate(now)}\n\n`
    items.forEach(i => { text += `${i.name} x${i.qty} = ${formatRupiah(i.price * i.qty)}\n` })
    text += `\n*TOTAL: ${formatRupiah(total)}*`
    if (note) text += `\nCatatan: ${note}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-[#00B4A0]" />
        <h1 className="text-xl font-black text-gray-900">Kasir Digital</h1>
      </div>

      {/* Form tambah item */}
      <div className="card space-y-3">
        <h2 className="font-bold text-sm text-gray-700">Tambah Item</h2>
        <input type="text" className="input" placeholder="Nama produk/layanan"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <div className="flex gap-2">
          <input type="number" className="input flex-1" placeholder="Harga (Rp)"
            value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input type="number" className="input w-20" placeholder="Qty" min="1"
            value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
        </div>
        <button onClick={addItem} className="btn-primary w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Item
        </button>
      </div>

      {/* Daftar item */}
      {items.length > 0 && (
        <div className="card space-y-2">
          <h2 className="font-bold text-sm text-gray-700">Item ({items.length})</h2>
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400">{formatRupiah(item.price)} × {item.qty}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-[#00B4A0] text-sm">{formatRupiah(item.price * item.qty)}</p>
                <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}

          <div className="border-t border-dashed border-gray-200 pt-3">
            <input type="text" className="input text-sm" placeholder="Catatan (opsional)"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {/* Total */}
          <div className="bg-[#E6F7F5] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Pembayaran</p>
              <p className="text-2xl font-black text-[#00B4A0]">{formatRupiah(total)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => setItems([])} className="btn-secondary flex-1 text-sm">Bersihkan</button>
            <button onClick={shareWA} className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5">
              <Share2 className="w-4 h-4" /> Share Struk
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-4xl mb-2">🧾</p>
          <p className="font-bold text-gray-700">Kasir Kosong</p>
          <p className="text-sm text-gray-400 mt-1">Tambahkan item transaksi di atas</p>
        </div>
      )}
    </div>
  )
}
