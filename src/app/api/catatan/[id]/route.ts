import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth(req)
    const { title, content } = await req.json()
    const c = await prisma.catatan.findUnique({ where: { id: params.id } })
    if (!c || c.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await prisma.catatan.update({ where: { id: params.id }, data: { title, content } })
    return NextResponse.json({ catatan: updated })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth(req)
    const c = await prisma.catatan.findUnique({ where: { id: params.id } })
    if (!c || c.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await prisma.catatan.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
