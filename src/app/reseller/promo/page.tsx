'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { Tag, ExternalLink } from 'lucide-react'

export default function PromoPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/banners').then(r => setBanners(r.data.banners)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading text="Memuat promo..." />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-[#00B4A0]" />
        <h1 className="text-xl font-black text-gray-900">Promo & Penawaran</h1>
      </div>

      {banners.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎁</p>
          <p className="font-bold text-gray-700">Belum Ada Promo</p>
          <p className="text-sm text-gray-400 mt-1">Promo menarik akan segera hadir!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b.id} className="card overflow-hidden p-0">
              {b.imageUrl && (
                <img src={b.imageUrl} alt={b.title} className="w-full h-44 object-cover" />
              )}
              <div className="p-4">
                <p className="font-bold text-gray-900">{b.title}</p>
                {b.linkUrl && (
                  <a href={b.linkUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-[#00B4A0] font-semibold hover:underline">
                    Lihat Detail <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info promo statis */}
      <div className="space-y-3">
        {[
          { emoji: '🎯', title: 'Cashback Transaksi', desc: 'Dapatkan poin reward setiap transaksi berhasil. Kumpulkan dan tukar dengan hadiah menarik!' },
          { emoji: '👥', title: 'Referral Program', desc: 'Ajak teman bergabung dan dapatkan bonus saldo untuk setiap referral yang berhasil transaksi.' },
          { emoji: '⬆️', title: 'Naik Tier', desc: 'Semakin banyak transaksi, semakin murah harga beli kamu. Naik ke Agen atau Master Dealer sekarang!' },
        ].map(p => (
          <div key={p.title} className="card flex items-start gap-3">
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <p className="font-bold text-gray-900 text-sm">{p.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
