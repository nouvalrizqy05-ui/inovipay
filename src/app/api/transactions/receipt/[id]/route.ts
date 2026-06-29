import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth(req)
    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        product: { select: { name: true, category: true } },
        user: { select: { name: true, phone: true } },
      },
    })
    if (!tx) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    if (tx.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const configs = await prisma.systemConfig.findMany()
    const cfg: Record<string,string> = {}
    configs.forEach(c => { cfg[c.key] = c.value })

    return NextResponse.json({
      receipt: {
        platform: cfg.platform_name ?? 'InoviStore',
        phone: cfg.platform_phone ?? '',
        transaction: {
          id: tx.id.slice(-8).toUpperCase(),
          date: tx.createdAt,
          product: tx.product.name,
          category: tx.product.category,
          targetNumber: tx.targetNumber,
          customerName: tx.customerName,
          amount: Number(tx.sellPrice),
          status: tx.status,
          sn: tx.sn,
          failReason: tx.failReason,
        },
        reseller: { name: tx.user.name, phone: tx.user.phone },
      }
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
