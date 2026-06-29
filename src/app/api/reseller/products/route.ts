import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined

    // Ambil tier user untuk menentukan harga
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } })
    const tier = user?.tier ?? 'RESELLER'

    const products = await prisma.product.findMany({
      where: { isActive: true, ...(category && { category: category as any }) },
      select: {
        id: true, code: true, name: true, category: true,
        priceReseller: true, priceAgen: true, priceMasterDealer: true,
      },
      orderBy: [{ category: 'asc' }, { priceReseller: 'asc' }],
    })

    // Map harga sesuai tier
    const mapped = products.map(p => ({
      id: p.id, code: p.code, name: p.name, category: p.category,
      sellPrice: tier === 'MASTER_DEALER' ? p.priceMasterDealer
               : tier === 'AGEN' ? p.priceAgen
               : p.priceReseller,
      tier,
    }))

    return NextResponse.json({ products: mapped })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
