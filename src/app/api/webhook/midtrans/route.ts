import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMidtransSignature } from '@/lib/midtrans'
import { sendNotification } from '@/lib/notification'

// Midtrans mengirim POST ke sini setiap ada perubahan status transaksi
// (pending -> settlement/capture -> deny/cancel/expire).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      payment_type: paymentType,
      va_numbers: vaNumbers,
    } = body

    if (!orderId || !signatureKey) {
      return NextResponse.json({ error: 'Payload tidak lengkap' }, { status: 400 })
    }

    // WAJIB: verifikasi signature sebelum memercayai payload apa pun.
    // Tanpa ini, siapa pun bisa POST palsu ke endpoint ini dan menambah saldo sendiri.
    const isValid = verifyMidtransSignature(orderId, statusCode, grossAmount, signatureKey)
    if (!isValid) {
      console.warn('[MIDTRANS WEBHOOK] Signature tidak cocok, request diabaikan:', orderId)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const deposit = await prisma.deposit.findUnique({ where: { midtransOrderId: orderId } })
    if (!deposit) {
      console.warn('[MIDTRANS WEBHOOK] Deposit tidak ditemukan:', orderId)
      return NextResponse.json({ ok: true })
    }

    // Idempotent — kalau sudah final (bukan PENDING), abaikan callback duplikat
    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ ok: true })
    }

    const vaNumber = Array.isArray(vaNumbers) && vaNumbers[0] ? vaNumbers[0].va_number : null

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (transactionStatus === 'capture' && fraudStatus === 'challenge') {
        // Ditahan sistem fraud detection Midtrans — jangan cairkan dulu, biarkan PENDING
        await prisma.deposit.update({
          where: { id: deposit.id },
          data: { paymentType, vaNumber },
        })
        return NextResponse.json({ ok: true })
      }

      await prisma.$transaction(async (tx) => {
        await tx.deposit.update({
          where: { id: deposit.id },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            paymentType,
            vaNumber,
          },
        })
        await tx.wallet.upsert({
          where: { userId: deposit.userId },
          create: { userId: deposit.userId, balance: Number(deposit.amount) },
          update: { balance: { increment: Number(deposit.amount) } },
        })
        const wallet = await tx.wallet.findUnique({ where: { userId: deposit.userId } })
        if (wallet) {
          await tx.walletLedger.create({
            data: {
              walletId: wallet.id,
              amount: Number(deposit.amount),
              type: 'CREDIT',
              note: `Deposit via Midtrans (${paymentType ?? 'unknown'}) - ${orderId}`,
            },
          })
        }
      })

      await sendNotification(deposit.userId, 'SYSTEM', 'Deposit Berhasil',
        `Deposit Rp ${Number(deposit.amount).toLocaleString('id-ID')} via ${paymentType ?? 'Midtrans'} berhasil, saldo sudah ditambahkan.`)

    } else if (['deny', 'cancel'].includes(transactionStatus)) {
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'REJECTED', adminNote: `Ditolak Midtrans: ${transactionStatus}` },
      })
    } else if (transactionStatus === 'expire') {
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'EXPIRED' },
      })
    }
    // status 'pending' -> tidak ada aksi, tetap menunggu callback berikutnya

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[MIDTRANS WEBHOOK ERROR]', error)
    // Tetap 200 supaya Midtrans tidak retry terus-menerus untuk error di sisi kita
    return NextResponse.json({ ok: true })
  }
}
