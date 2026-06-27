import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { checkTransaction } from '@/lib/digiflazz'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)

    const pendingTransactions = await prisma.transaction.findMany({
      where: { status: 'PENDING' },
    })

    if (pendingTransactions.length === 0) {
      return NextResponse.json({ message: 'Tidak ada transaksi pending' })
    }

    let synced = 0
    for (const trx of pendingTransactions) {
      try {
        const result = await checkTransaction(trx.refIdH2h)

        if (result.status === 'Sukses') {
          await prisma.$transaction(async (tx) => {
            await tx.wallet.update({
              where: { userId: trx.userId },
              data: {
                balance: { decrement: trx.sellPrice },
                balanceHold: { decrement: trx.sellPrice },
              },
            })
            await tx.transaction.update({
              where: { id: trx.id },
              data: { status: 'SUCCESS', sn: result.sn || null },
            })
          })
          synced++
        } else if (result.status === 'Gagal') {
          await prisma.$transaction(async (tx) => {
            await tx.wallet.update({
              where: { userId: trx.userId },
              data: { balanceHold: { decrement: trx.sellPrice } },
            })
            await tx.transaction.update({
              where: { id: trx.id },
              data: { status: 'FAILED', failReason: result.message || 'Gagal dari supplier' },
            })
          })
          synced++
        }
      } catch (err) {
        console.error(`[SYNC ERROR] RefID ${trx.refIdH2h}:`, err)
      }
    }

    return NextResponse.json({ message: `Berhasil sinkronisasi ${synced} transaksi` })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
