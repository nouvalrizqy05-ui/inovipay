import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendNotification, sendWhatsApp } from '@/lib/notification'

// POST: reseller ajukan deposit
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { amount, proofUrl, note } = await req.json()

    if (!amount || Number(amount) < 10000) {
      return NextResponse.json({ error: 'Minimal deposit Rp 10.000' }, { status: 400 })
    }

    const deposit = await prisma.deposit.create({
      data: { userId, amount, proofUrl, note, status: 'PENDING' },
      include: { user: { select: { name: true } } },
    })

    // Notifikasi in-app ke reseller
    await sendNotification(userId, 'SYSTEM', 'Deposit Diterima', 
      `Pengajuan deposit Rp ${Number(amount).toLocaleString('id-ID')} sedang diproses admin.`)

    // Alert ke semua admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', status: 'ACTIVE' } })
    for (const admin of admins) {
      await sendNotification(admin.id, 'SYSTEM', 'Deposit Baru Masuk',
        `${deposit.user.name} mengajukan deposit Rp ${Number(amount).toLocaleString('id-ID')}. Segera cek dan konfirmasi.`)
    }

    return NextResponse.json({ deposit }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// GET: riwayat deposit reseller
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
