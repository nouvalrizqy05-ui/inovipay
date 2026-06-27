import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createTransaction } from '@/lib/digiflazz'
import { checkDigiflazzBalance } from '@/lib/balance-guard'
import { sendNotification, sendWhatsApp } from '@/lib/notification'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { productId, targetNumber } = await req.json()

    if (!productId || !targetNumber) {
      return NextResponse.json({ error: 'productId dan targetNumber wajib diisi' }, { status: 400 })
    }

    // Cek status reseller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    })

    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Akun belum aktif. Hubungi admin.' }, { status: 403 })
    }

    // Cek produk
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Produk tidak tersedia' }, { status: 404 })
    }

    // Cek saldo reseller
    const wallet = user.wallet
    if (!wallet) return NextResponse.json({ error: 'Wallet tidak ditemukan' }, { status: 404 })

    const available = Number(wallet.balance) - Number(wallet.balanceHold)
    if (available < Number(product.sellPrice)) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 402 })
    }

    // Cek saldo Digiflazz otomatis (admin akan dapat alert kalau menipis)
    const balanceCheck = await checkDigiflazzBalance(Number(product.costPrice))
    if (!balanceCheck.ok) {
      return NextResponse.json({ error: balanceCheck.reason }, { status: 503 })
    }

    const margin = Number(product.sellPrice) - Number(product.costPrice)
    const refId = `TRX-${userId.slice(0, 8)}-${Date.now()}`

    // Hold saldo + buat transaksi pending
    const transaction = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: { balanceHold: { increment: product.sellPrice } },
      })
      return tx.transaction.create({
        data: { userId, productId, targetNumber, costPrice: product.costPrice, sellPrice: product.sellPrice, margin, refIdH2h: refId, status: 'PENDING' },
      })
    })

    // Kirim ke Digiflazz
    try {
      const result = await createTransaction({ refId, skuCode: product.skuH2h, customerNo: targetNumber })
      console.log('[DIGIFLAZZ RESPONSE]', JSON.stringify(result, null, 2))

      if (result.status === 'Sukses') {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: product.sellPrice }, balanceHold: { decrement: product.sellPrice } },
          })
          const w = await tx.wallet.findUnique({ where: { userId } })
          if (w) await tx.walletLedger.create({ data: { walletId: w.id, amount: product.sellPrice, type: 'DEBIT', note: `Transaksi ${product.name} ke ${targetNumber}` } })
          await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'SUCCESS', sn: result.sn } })
        })

        await sendNotification(userId, 'TRANSACTION_SUCCESS', 'Transaksi Berhasil ✅',
          `${product.name} ke ${targetNumber} berhasil. SN: ${result.sn}`)
        await sendWhatsApp(user.phone, `✅ Transaksi berhasil!\nProduk: ${product.name}\nTujuan: ${targetNumber}\nSN: ${result.sn}`)

        return NextResponse.json({ message: 'Transaksi berhasil', status: 'SUCCESS', sn: result.sn, transactionId: transaction.id })
      }

      if (result.status === 'Gagal') {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({ where: { userId }, data: { balanceHold: { decrement: product.sellPrice } } })
          await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'FAILED', failReason: result.message } })
        })
        await sendNotification(userId, 'TRANSACTION_FAILED', 'Transaksi Gagal ❌', `${product.name} ke ${targetNumber} gagal. ${result.message}`)
        return NextResponse.json({ error: result.message || 'Transaksi gagal dari supplier' }, { status: 422 })
      }

      // Pending — tunggu webhook
      return NextResponse.json({ message: 'Transaksi sedang diproses', status: 'PENDING', transactionId: transaction.id })

    } catch (digiError) {
      await prisma.wallet.update({ where: { userId }, data: { balanceHold: { decrement: product.sellPrice } } })
      await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'FAILED', failReason: 'Gagal terhubung ke supplier' } })
      throw digiError
    }

  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[TRANSACTION ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status') ?? undefined
    const category = searchParams.get('category') ?? undefined

    const where: any = role === 'ADMIN' ? {} : { userId }
    if (status) where.status = status

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          product: { select: { name: true, category: true } },
          user: role === 'ADMIN' ? { select: { name: true, phone: true } } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({ transactions, total, page, limit })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
