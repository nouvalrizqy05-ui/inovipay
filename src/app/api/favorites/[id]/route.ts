import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth(req)
    const fav = await prisma.favoriteNumber.findUnique({ where: { id: params.id } })
    if (!fav || fav.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await prisma.favoriteNumber.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
