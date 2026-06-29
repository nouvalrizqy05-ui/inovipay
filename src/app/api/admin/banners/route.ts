import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const banners = await prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
    return NextResponse.json({ banners })
  } catch { return NextResponse.json({ banners: [] }) }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { title, imageUrl, linkUrl, order } = await req.json()
    if (!title || !imageUrl) return NextResponse.json({ error: 'Title dan imageUrl wajib' }, { status: 400 })
    const banner = await prisma.banner.create({ data: { title, imageUrl, linkUrl, order: order ?? 0 } })
    return NextResponse.json({ banner }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
