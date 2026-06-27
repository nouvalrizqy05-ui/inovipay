import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } })
    return NextResponse.json({ notifications, unreadCount })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// Tandai semua notifikasi sebagai sudah dibaca
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
    return NextResponse.json({ message: 'Semua notifikasi ditandai sudah dibaca' })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
