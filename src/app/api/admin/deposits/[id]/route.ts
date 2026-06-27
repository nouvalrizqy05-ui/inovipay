import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { sendNotification, sendWhatsApp } from '@/lib/notification'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req)
    const { action, adminNote } = await req.json() // action: 'approve' | 'reject'

    const deposit = await prisma.deposit.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!deposit) return NextResponse.json({ error: 'Deposit tidak ditemukan' }, { status: 404 })
    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ error: 'Deposit sudah diproses' }, { status: 409 })
    }

    if (action === 'approve') {
      await prisma.$transaction(async (tx) => {
        // Update status deposit
        await tx.deposit.update({
          where: { id: params.id },
          data: { status: 'APPROVED', adminNote, approvedBy: admin.userId, approvedAt: new Date() },
        })

        // Tambah saldo reseller
        await tx.wallet.update({
          where: { userId: deposit.userId },
          data: { balance: { increment: deposit.amount } },
        })

        // Catat di ledger
        const wallet = await tx.wallet.findUnique({ where: { userId: deposit.userId } })
        if (wallet) {
          await tx.walletLedger.create({
            data: {
              walletId: wallet.id,
              amount: deposit.amount,
              type: 'CREDIT',
              note: `Deposit disetujui oleh admin`,
            },
          })
        }
      })

      // Notifikasi ke reseller
      await sendNotification(deposit.userId, 'DEPOSIT_APPROVED', 'Deposit Disetujui ✅',
        `Deposit Rp ${Number(deposit.amount).toLocaleString('id-ID')} telah disetujui. Saldo kamu sudah bertambah.`)

      await sendWhatsApp(deposit.user.phone,
        `✅ Deposit kamu sebesar Rp ${Number(deposit.amount).toLocaleString('id-ID')} telah disetujui. Saldo sudah bertambah, silakan cek dashboard.`)

      return NextResponse.json({ message: 'Deposit disetujui' })

    } else if (action === 'reject') {
      await prisma.deposit.update({
        where: { id: params.id },
        data: { status: 'REJECTED', adminNote, approvedBy: admin.userId, approvedAt: new Date() },
      })

      await sendNotification(deposit.userId, 'DEPOSIT_REJECTED', 'Deposit Ditolak ❌',
        `Deposit Rp ${Number(deposit.amount).toLocaleString('id-ID')} ditolak. ${adminNote ? 'Alasan: ' + adminNote : ''}`)

      await sendWhatsApp(deposit.user.phone,
        `❌ Deposit Rp ${Number(deposit.amount).toLocaleString('id-ID')} ditolak. ${adminNote ?? ''}`)

      return NextResponse.json({ message: 'Deposit ditolak' })
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
