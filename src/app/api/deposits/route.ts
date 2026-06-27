import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendNotification } from '@/lib/notification'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { amount, proofUrl, note } = await req.json()

    if (!amount || Number(amount) < 10000) {
      return NextResponse.json({ error: 'Minimal deposit Rp 10.000' }, { status: 400 })
    }

    const uniqueCode = Math.floor(Math.random() * 900) + 100; // 100-999

    const deposit = await prisma.deposit.create({
      data: { userId, amount, uniqueCode, proofUrl, note, status: 'PENDING' },
      include: { user: { select: { name: true } } },
    })

    await sendNotification(userId, 'SYSTEM', 'Deposit Diterima', 
      `Pengajuan deposit Rp ${Number(amount).toLocaleString('id-ID')} sedang diproses admin.`)

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', status: 'ACTIVE' } })
    for (const admin of admins) {
      await sendNotification(admin.id, 'SYSTEM', 'Deposit Baru Masuk',
        `${deposit.user.name} mengajukan deposit Rp ${Number(amount).toLocaleString('id-ID')}.`)
    }

    return NextResponse.json({ deposit }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deposit.count({ where: { userId } }),
    ])

    return NextResponse.json({ deposits, total, page, limit })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
