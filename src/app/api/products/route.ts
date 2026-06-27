import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { getPriceList } from '@/lib/digiflazz'

// GET: daftar produk aktif (reseller)
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as any }),
      },
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        sellPrice: true, // Reseller hanya lihat harga jual, bukan cost
      },
      orderBy: [{ category: 'asc' }, { sellPrice: 'asc' }],
    })

    return NextResponse.json({ products })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST: tambah produk manual (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { code, name, category, costPrice, sellPrice, skuH2h } = await req.json()

    if (!code || !name || !category || !costPrice || !sellPrice || !skuH2h) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (Number(sellPrice) <= Number(costPrice)) {
      return NextResponse.json({ error: 'Harga jual harus lebih besar dari harga beli' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: { code, name, category, costPrice, sellPrice, skuH2h },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (error.code === 'P2002') return NextResponse.json({ error: 'Kode produk sudah ada' }, { status: 409 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
