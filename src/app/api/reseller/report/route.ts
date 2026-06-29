import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? 'today' // today | week | month | last_month

    const now = new Date()
    let startDate: Date
    let endDate = new Date()

    switch (period) {
      case 'week':
        startDate = new Date(now); startDate.setDate(now.getDate() - 7); startDate.setHours(0,0,0,0); break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); break
      default: // today
        startDate = new Date(now); startDate.setHours(0,0,0,0); break
    }

    const where = { userId, createdAt: { gte: startDate, lte: endDate } }

    const [total, success, failed, pending, totalAmount, totalMargin, byCategory] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, status: 'SUCCESS' } }),
      prisma.transaction.count({ where: { ...where, status: 'FAILED' } }),
      prisma.transaction.count({ where: { ...where, status: 'PENDING' } }),
      prisma.transaction.aggregate({ where: { ...where, status: 'SUCCESS' }, _sum: { sellPrice: true } }),
      prisma.transaction.aggregate({ where: { ...where, status: 'SUCCESS' }, _sum: { margin: true } }),
      prisma.transaction.groupBy({
        by: ['productId'],
        where: { ...where, status: 'SUCCESS' },
        _count: { id: true },
        _sum: { margin: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ])

    return NextResponse.json({
      period,
      summary: {
        total, success, failed, pending,
        totalAmount: Number(totalAmount._sum.sellPrice ?? 0),
        totalMargin: Number(totalMargin._sum.margin ?? 0),
        successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      },
      topProducts: byCategory,
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
