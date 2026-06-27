import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [wallet, txToday, txSuccessToday, marginToday, notifications] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.transaction.count({ where: { userId, createdAt: { gte: today } } }),
      prisma.transaction.count({ where: { userId, status: 'SUCCESS', createdAt: { gte: today } } }),
      prisma.transaction.aggregate({
        where: { userId, status: 'SUCCESS', createdAt: { gte: today } },
        _sum: { margin: true },
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    // Grafik 7 hari terakhir
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
        const [count, margin] = await Promise.all([
          prisma.transaction.count({ where: { userId, status: 'SUCCESS', createdAt: { gte: date, lt: nextDay } } }),
          prisma.transaction.aggregate({
            where: { userId, status: 'SUCCESS', createdAt: { gte: date, lt: nextDay } },
            _sum: { margin: true },
          }),
        ])
        return {
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          transaksi: count,
          keuntungan: Number(margin._sum.margin ?? 0),
        }
      })
    )

    return NextResponse.json({
      wallet: {
        balance: Number(wallet?.balance ?? 0),
        balanceHold: Number(wallet?.balanceHold ?? 0),
        available: Number(wallet?.balance ?? 0) - Number(wallet?.balanceHold ?? 0),
      },
      stats: {
        txToday,
        txSuccessToday,
        marginToday: Number(marginToday._sum.margin ?? 0),
      },
      txChart,
      notifications,
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
