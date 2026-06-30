import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined

    const products = await prisma.product.findMany({
      where: category ? { category: category as any } : undefined,
      select: {
        id: true, code: true, name: true, category: true,
        costPrice: true, priceReseller: true,
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
    const { code, name, category, costPrice, priceReseller, skuH2h } = await req.json()

    if (!code || !name || !category || !costPrice || !priceReseller || !skuH2h) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const cost = Number(costPrice)
    const product = await prisma.product.create({
      data: {
        code, name, category, skuH2h,
        costPrice: cost,
        priceReseller: Number(priceReseller),
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

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { id, priceReseller, isActive } = await req.json()
    
    if (!id) return NextResponse.json({ error: 'ID produk tidak ada' }, { status: 400 })

    const updateData: any = {}
    if (priceReseller !== undefined) updateData.priceReseller = Number(priceReseller)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ product })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'deleteInactive') {
      const result = await prisma.product.deleteMany({
        where: { isActive: false }
      })
      return NextResponse.json({ message: `${result.count} produk tercoret berhasil dihapus permanen.` })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
