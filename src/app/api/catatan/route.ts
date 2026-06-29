import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const catatan = await prisma.catatan.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } })
    return NextResponse.json({ catatan })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { title, content } = await req.json()
    if (!title) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })
    const c = await prisma.catatan.create({ data: { userId, title, content: content ?? '' } })
    return NextResponse.json({ catatan: c }, { status: 201 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
