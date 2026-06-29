import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { getPriceList } from '@/lib/digiflazz'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { category, marginReseller, marginAgen, marginMD } = await req.json()
    const mReseller = marginReseller ?? 2000
    const mAgen     = marginAgen     ?? 1500
    const mMD       = marginMD       ?? 1000

    const priceList = await getPriceList(category)
    if (!priceList || !Array.isArray(priceList)) {
      return NextResponse.json({ error: 'Gagal ambil price list dari Digiflazz' }, { status: 502 })
    }

    let synced = 0, skipped = 0

    for (const item of priceList) {
      if (!item.buyer_sku_code || !item.product_name || !item.price) { skipped++; continue }

      const cost = Number(item.price)
      await prisma.product.upsert({
        where: { code: item.buyer_sku_code },
        update: {
          name: item.product_name,
          costPrice: cost,
          priceReseller: cost + mReseller,
          priceAgen: cost + mAgen,
          priceMasterDealer: cost + mMD,
          skuH2h: item.buyer_sku_code,
        },
        create: {
          code: item.buyer_sku_code,
          name: item.product_name,
          category: mapCategory(item.category),
          costPrice: cost,
          priceReseller: cost + mReseller,
          priceAgen: cost + mAgen,
          priceMasterDealer: cost + mMD,
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
    // Prabayar
    'Pulsa': 'PULSA',
    'Data': 'DATA',
    'Games': 'GAMES',
    'Voucher': 'VOUCHER',
    'E-Money': 'EMONEY',
    'PLN': 'TOKEN_PLN',
    'Paket SMS & Telpon': 'PAKET_SMS_TELPON',
    'Aktifasi Voucher': 'AKTIVASI_VOUCHER',
    'Aktivasi Voucher': 'AKTIVASI_VOUCHER',
    'TV': 'TV_PRABAYAR',
    'Masa Aktif': 'MASA_AKTIF',
    'Aktifasi Perdana': 'AKTIVASI_PERDANA',
    'Aktivasi Perdana': 'AKTIVASI_PERDANA',
    'Media Sosial': 'MEDIA_SOSIAL',
    'eSIM': 'ESIM',
    'Gas': 'GAS',
    'Hayaka TOPUP': 'HAYAKA_TOPUP',
    'China TOPUP': 'CHINA_TOPUP',
    'Vietnam Topup': 'VIETNAM_TOPUP',
    'Thailand TOPUP': 'THAILAND_TOPUP',
    'Philippines TOPUP': 'PHILIPPINES_TOPUP',
    'Srianka TOPUP': 'SRILANKA_TOPUP',
    'Srilanka TOPUP': 'SRILANKA_TOPUP',
    'Bundling': 'BUNDLING',
    // Pascabayar
    'PLN Pascabayar': 'PLN_PASCABAYAR',
    'PDAM': 'PDAM',
    'HP Pascabayar': 'HP_PASCABAYAR',
    'Internet Pascabayar': 'INTERNET_PASCABAYAR',
    'BPJS Kesehatan': 'BPJS_KESEHATAN',
    'Multifinance': 'MULTIFINANCE',
    'PBB': 'PBB',
    'Gas Negara': 'GAS_NEGARA',
    'TV Pascabayar': 'TV_PASCABAYAR',
    'BPJS Ketenagakerjaan': 'BPJS_KETENAGAKERJAAN',
    'PLN Non Taglis': 'PLN_NONTAGLIS',
    'PLN Nontaglis': 'PLN_NONTAGLIS',
    'E-Money Pascabayar': 'EMONEY_PASCABAYAR',
    'Telkom': 'TELKOM_INDIHOME',
    'Telkom Indihome': 'TELKOM_INDIHOME',
    'Indosat Ooredoo': 'INDOSAT_PASCABAYAR',
    'Tri': 'TRI_PASCABAYAR',
    'XL': 'LAINNYA',
  }
  return map[cat] ?? 'LAINNYA'
}

