import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined

    // Ambil tier user untuk menentukan harga (walaupun sekarang harga sama)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } })
    const tier = user?.tier ?? 'RESELLER'

    const products = await prisma.product.findMany({
      where: { isActive: true, ...(category && { category: category as any }) },
      select: {
        id: true, code: true, name: true, category: true,
        priceReseller: true,
      },
      orderBy: [{ category: 'asc' }, { priceReseller: 'asc' }],
    })

    // AUTO-CHEAPEST: Group by name and keep only the cheapest one
    const cheapestMap = new Map<string, typeof products[0]>()
    for (const p of products) {
      const existing = cheapestMap.get(p.name)
      if (!existing || Number(p.priceReseller) < Number(existing.priceReseller)) {
        cheapestMap.set(p.name, p)
      }
    }

    const uniqueProducts = Array.from(cheapestMap.values())

    // Map harga
    const mapped = uniqueProducts.map(p => ({
      id: p.id, code: p.code, name: p.name, category: p.category,
      sellPrice: p.priceReseller,
      tier,
    }))

    return NextResponse.json({ products: mapped })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
