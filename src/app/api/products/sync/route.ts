import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { getPriceList } from '@/lib/digiflazz'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    // Accept sellerName and marginReseller
    const { category, sellerName, marginReseller = 2000 } = await req.json()

    let priceList: any[] = []
    let digiflazzError = ''
    
    if (category) {
      const prepaidRaw = await getPriceList(category, 'prepaid')
      if (Array.isArray(prepaidRaw)) priceList = priceList.concat(prepaidRaw)
      else if (prepaidRaw?.message) digiflazzError = prepaidRaw.message
    } else {
      const prepaidRaw = await getPriceList(undefined, 'prepaid').catch((e) => e)
      const pascaRaw = await getPriceList(undefined, 'pasca').catch((e) => e)
      
      if (Array.isArray(prepaidRaw)) priceList = priceList.concat(prepaidRaw)
      else if (prepaidRaw?.message) digiflazzError = prepaidRaw.message
      
      if (Array.isArray(pascaRaw)) priceList = priceList.concat(pascaRaw)
      else if (pascaRaw?.message && !digiflazzError) digiflazzError = pascaRaw.message
    }

    if (!priceList || priceList.length === 0) {
      console.error('[SYNC ERROR] Empty priceList response. Digiflazz Error:', digiflazzError)
      return NextResponse.json({ error: digiflazzError || 'Gagal ambil price list dari Digiflazz (kosong atau diblokir IP)' }, { status: 502 })
    }

    let synced = 0, skipped = 0
    const activeSkuList: string[] = []

    for (const item of priceList) {
      if (!item.buyer_sku_code || !item.product_name || !item.price) { skipped++; continue }
      
      activeSkuList.push(item.buyer_sku_code)
      const cost = Number(item.price)
      
      // Hitung harga jual. Jika marginReseller kosong, ambil margin 2000.
      let margin = 2000
      if (marginReseller !== undefined && marginReseller !== null && marginReseller !== '' && !Number.isNaN(Number(marginReseller))) {
        margin = Number(marginReseller)
      }
      const sell = cost + margin

      await prisma.product.upsert({
        where: { code: item.buyer_sku_code },
        update: {
          name: item.product_name,
          costPrice: cost,
          // Harga jual diupdate otomatis sesuai margin. 
          // Jika mau tidak diupdate, bisa pakai update harga manual di admin. Tapi user minta margin bisa diatur saat sync.
          priceReseller: sell, 
          isActive: true,
        },
        create: {
          code: item.buyer_sku_code,
          name: item.product_name,
          category: mapCategory(item.category),
          costPrice: cost,
          priceReseller: sell,
          skuH2h: item.buyer_sku_code,
          isActive: true,
        },
      })
      synced++
    }
      
    // Nonaktifkan produk yang sudah dihapus oleh user di Web Digiflazz
    let deactivatedCount = 0
    if (activeSkuList.length > 0) {
      const res = await prisma.product.updateMany({
        where: { code: { notIn: activeSkuList } },
        data: { isActive: false },
      })
      deactivatedCount = res.count
    }

    return NextResponse.json({ message: `Sync selesai: ${synced} produk sinkron. ${deactivatedCount > 0 ? deactivatedCount + ' produk dinonaktifkan.' : ''}` })
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
