import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { sendNotification, sendWhatsApp } from '@/lib/notification'

// GET: semua deposit pending (admin)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'PENDING'
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where: { status: status as any },
        include: { user: { select: { id: true, name: true, phone: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deposit.count({ where: { status: status as any } }),
    ])

    return NextResponse.json({ deposits, total })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
