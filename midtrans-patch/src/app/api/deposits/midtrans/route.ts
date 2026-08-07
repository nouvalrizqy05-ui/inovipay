import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createDepositTransaction, PAYMENT_CATEGORY_MAP } from '@/lib/midtrans'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { amount, category } = await req.json()

    if (!amount || Number(amount) < 10000) {
      return NextResponse.json({ error: 'Minimal deposit Rp 10.000' }, { status: 400 })
    }
    if (!category || !PAYMENT_CATEGORY_MAP[category]) {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    // order_id harus unik di Midtrans — pakai prefix + timestamp + userId singkat
    const orderId = `DEP-${Date.now()}-${userId.slice(0, 8)}`

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount: Number(amount),
        method: 'MIDTRANS',
        status: 'PENDING',
        midtransOrderId: orderId,
        note: `Kategori: ${category}`,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    const snapResponse = await createDepositTransaction({
      orderId,
      amount: Number(amount),
      category,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
    })

    return NextResponse.json({
      depositId: deposit.id,
      token: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
    }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[MIDTRANS CREATE ERROR]', error?.ApiResponse ?? error)
    return NextResponse.json({ error: 'Gagal membuat transaksi pembayaran' }, { status: 500 })
  }
}
