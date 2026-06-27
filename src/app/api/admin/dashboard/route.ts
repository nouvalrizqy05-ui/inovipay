import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { cekSaldo } from '@/lib/digiflazz'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalReseller,
      resellerPending,
      depositPending,
      txToday,
      txSuccessToday,
      totalMarginToday,
      digiflazzBalance,
      notifications,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'RESELLER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'RESELLER', status: 'PENDING' } }),
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.count({ where: { status: 'SUCCESS', createdAt: { gte: today } } }),
      prisma.transaction.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: today } },
        _sum: { margin: true },
      }),
      cekSaldo().catch(() => null), // Jangan crash kalau Digiflazz error
      prisma.notification.findMany({
        where: { userId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id ?? '' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    // Grafik transaksi 7 hari terakhir
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })

    const txChart = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)
        const count = await prisma.transaction.count({
          where: { status: 'SUCCESS', createdAt: { gte: date, lt: nextDay } },
        })
        return {
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          transaksi: count,
        }
      })
    )

    return NextResponse.json({
      stats: {
        totalReseller,
        resellerPending,
        depositPending,
        txToday,
        txSuccessToday,
        marginToday: Number(totalMarginToday._sum.margin ?? 0),
        digiflazzBalance,
      },
      txChart,
      notifications,
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
