import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { getPriceList } from '@/lib/digiflazz'

const MARGIN_DEFAULT = 2000 // Rp 2.000 margin default per produk

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { category, marginAmount } = await req.json()
    const margin = marginAmount ?? MARGIN_DEFAULT

    const priceList = await getPriceList(category)
    if (!priceList || !Array.isArray(priceList)) {
      return NextResponse.json({ error: 'Gagal ambil price list dari Digiflazz' }, { status: 502 })
    }

    let synced = 0
    let skipped = 0

    for (const item of priceList) {
      if (!item.buyer_sku_code || !item.product_name || !item.price) {
        skipped++
        continue
      }

      await prisma.product.upsert({
        where: { code: item.buyer_sku_code },
        update: {
          name: item.product_name,
          costPrice: item.price,
          sellPrice: item.price + margin,
          skuH2h: item.buyer_sku_code,
        },
        create: {
          code: item.buyer_sku_code,
          name: item.product_name,
          category: mapCategory(item.category),
          costPrice: item.price,
          sellPrice: item.price + margin,
          skuH2h: item.buyer_sku_code,
          isActive: true,
        },
      })
      synced++
    }

    return NextResponse.json({ message: `Sync selesai: ${synced} produk, ${skipped} dilewati` })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

function mapCategory(cat: string): any {
  const map: Record<string, string> = {
    'Pulsa': 'PULSA',
    'Data': 'DATA',
    'PLN': 'TOKEN_PLN',
    'PDAM': 'PDAM',
    'Games': 'GAME',
  }
  return map[cat] ?? 'LAINNYA'
}
