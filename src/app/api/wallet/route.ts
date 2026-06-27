import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) return NextResponse.json({ error: 'Wallet tidak ditemukan' }, { status: 404 })

    const [ledger, total] = await Promise.all([
      prisma.walletLedger.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletLedger.count({ where: { walletId: wallet.id } }),
    ])

    return NextResponse.json({
      balance: Number(wallet.balance),
      balanceHold: Number(wallet.balanceHold),
      available: Number(wallet.balance) - Number(wallet.balanceHold),
      ledger,
      total,
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
