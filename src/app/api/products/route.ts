import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined

    const products = await prisma.product.findMany({
      where: { isActive: true, ...(category && { category: category as any }) },
      select: {
        id: true, code: true, name: true, category: true,
        costPrice: true, priceReseller: true, priceAgen: true, priceMasterDealer: true,
        skuH2h: true, isActive: true,
      },
      orderBy: [{ category: 'asc' }, { priceReseller: 'asc' }],
    })

    return NextResponse.json({ products })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { code, name, category, costPrice, priceReseller, priceAgen, priceMasterDealer, skuH2h } = await req.json()

    if (!code || !name || !category || !costPrice || !priceReseller || !skuH2h) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const cost = Number(costPrice)
    const product = await prisma.product.create({
      data: {
        code, name, category, skuH2h,
        costPrice: cost,
        priceReseller: Number(priceReseller),
        priceAgen: Number(priceAgen ?? priceReseller),
        priceMasterDealer: Number(priceMasterDealer ?? priceReseller),
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if ((error as any).code === 'P2002') return NextResponse.json({ error: 'Kode produk sudah ada' }, { status: 409 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
