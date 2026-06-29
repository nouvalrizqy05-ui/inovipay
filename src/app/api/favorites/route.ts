import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const favs = await prisma.favoriteNumber.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ favorites: favs })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { label, number, category } = await req.json()
    if (!label || !number) return NextResponse.json({ error: 'Label dan nomor wajib' }, { status: 400 })
    
    const count = await prisma.favoriteNumber.count({ where: { userId } })
    if (count >= 20) return NextResponse.json({ error: 'Maksimal 20 nomor favorit' }, { status: 400 })
    
    const fav = await prisma.favoriteNumber.create({ data: { userId, label, number, category } })
    return NextResponse.json({ favorite: fav }, { status: 201 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
