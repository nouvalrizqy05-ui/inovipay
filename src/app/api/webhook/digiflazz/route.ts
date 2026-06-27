import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

// Digiflazz mengirim callback ke endpoint ini setelah transaksi selesai
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data } = body

    if (!data?.ref_id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Verifikasi signature dari Digiflazz
    // Format: MD5(username + apiKey + ref_id)
    const expectedSign = crypto
      .createHash('md5')
      .update(
        process.env.DIGIFLAZZ_USERNAME! +
        process.env.DIGIFLAZZ_API_KEY_PROD! +
        data.ref_id
      )
      .digest('hex')

    if (data.sign && data.sign !== expectedSign) {
      console.warn('[WEBHOOK] Signature tidak cocok, request diabaikan')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Cari transaksi berdasarkan ref_id
    const transaction = await prisma.transaction.findUnique({
      where: { refIdH2h: data.ref_id },
    })

    if (!transaction) {
      // Bisa jadi duplikat callback — log saja, jangan error
      console.warn('[WEBHOOK] Transaksi tidak ditemukan:', data.ref_id)
      return NextResponse.json({ ok: true })
    }

    // Kalau sudah final, abaikan duplikat callback
    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ ok: true })
    }

    if (data.status === 'Sukses') {
      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: {
            balance: { decrement: transaction.sellPrice },
            balanceHold: { decrement: transaction.sellPrice },
          },
        })
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS', sn: data.sn ?? null },
        })
      })

    } else if (data.status === 'Gagal') {
      await prisma.$transaction(async (tx) => {
        // Lepas hold — saldo kembali ke reseller
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: { balanceHold: { decrement: transaction.sellPrice } },
        })
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED', failReason: data.message ?? 'Gagal' },
        })
      })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('[WEBHOOK ERROR]', error)
    // Selalu return 200 ke Digiflazz agar tidak retry terus
    return NextResponse.json({ ok: true })
  }
}
