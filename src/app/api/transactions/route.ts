import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createTransaction } from '@/lib/digiflazz'
import { checkDigiflazzBalance } from '@/lib/balance-guard'
import { sendNotification, sendWhatsApp } from '@/lib/notification'
import bcrypt from 'bcryptjs'

// Hitung poin: 1 poin per Rp 1.000 margin
function calcPoints(margin: number): number {
  return Math.floor(margin / 1000)
}

// Harga sesuai dengan tabel produk (priceReseller)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { productId, productCode, targetNumber, pin } = await req.json()

    if ((!productId && !productCode) || !targetNumber) {
      return NextResponse.json({ error: 'Produk dan nomor tujuan wajib diisi' }, { status: 400 })
    }

    // Verify PIN
    const userForPin = await prisma.user.findUnique({ where: { id: userId } })
    if (!userForPin) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    
    if (!pin) {
      return NextResponse.json({ error: 'PIN wajib diisi untuk konfirmasi transaksi' }, { status: 400 })
    }
    const pinMatch = await bcrypt.compare(pin, userForPin.passwordHash)
    if (!pinMatch) {
      return NextResponse.json({ error: 'PIN salah. Transaksi dibatalkan.' }, { status: 401 })
    }

    // Resolve productId from productCode if needed
    let resolvedProductId = productId
    if (!resolvedProductId && productCode) {
      const productByCode = await prisma.product.findUnique({ where: { code: productCode } })
      if (!productByCode) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
      resolvedProductId = productByCode.id
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    if (user.status !== 'ACTIVE') return NextResponse.json({ error: 'Akun belum aktif. Hubungi admin.' }, { status: 403 })

    const product = await prisma.product.findUnique({ where: { id: resolvedProductId } })
    if (!product || !product.isActive) return NextResponse.json({ error: 'Produk tidak tersedia' }, { status: 404 })

    const wallet = user.wallet
    if (!wallet) return NextResponse.json({ error: 'Wallet tidak ditemukan' }, { status: 404 })

    // Harga sesuai dengan tabel produk
    const sellPrice = Number(product.priceReseller)
    const available = Number(wallet.balance) - Number(wallet.balanceHold)
    if (available < sellPrice) return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 402 })

    // Cek saldo Digiflazz
    const balanceCheck = await checkDigiflazzBalance(Number(product.costPrice))
    if (!balanceCheck.ok) return NextResponse.json({ error: balanceCheck.reason }, { status: 503 })

    const margin = sellPrice - Number(product.costPrice)
    const pointsEarned = calcPoints(margin)
    const refId = `TRX-${userId.slice(0, 8)}-${Date.now()}`

    // Hold saldo + buat transaksi pending
    const transaction = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: { balanceHold: { increment: sellPrice } },
      })
      return tx.transaction.create({
        data: {
          userId, productId: resolvedProductId, targetNumber,
          costPrice: product.costPrice,
          sellPrice, margin, pointsEarned,
          refIdH2h: refId, status: 'PENDING',
        },
      })
    })

    // Kirim ke Digiflazz
    try {
      const result = await createTransaction({ skuCode: product.skuH2h, customerNo: targetNumber, refId })

      if (result.status === 'Sukses') {
        await prisma.$transaction(async (tx) => {
          // Potong saldo
          await tx.wallet.update({
            where: { userId },
            data: {
              balance: { decrement: sellPrice },
              balanceHold: { decrement: sellPrice },
            },
          })
          // Catat ledger
          const w = await tx.wallet.findUnique({ where: { userId } })
          if (w) {
            await tx.walletLedger.create({
              data: { walletId: w.id, amount: sellPrice, type: 'DEBIT', note: `Transaksi ${product.name} → ${targetNumber}` }
            })
          }
          // Update transaksi
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS', sn: result.sn ?? null },
          })
          // Tambah poin reward
          if (pointsEarned > 0) {
            await tx.user.update({ where: { id: userId }, data: { points: { increment: pointsEarned } } })
            await tx.pointLedger.create({
              data: { userId, points: pointsEarned, type: 'EARN', note: `Transaksi ${product.name}` }
            })
          }
        })

        await sendNotification(userId, 'TRANSACTION_SUCCESS', '✅ Transaksi Berhasil',
          `${product.name} ke ${targetNumber} berhasil. ${result.sn ? 'SN: ' + result.sn : ''} ${pointsEarned > 0 ? `+${pointsEarned} poin reward!` : ''}`)
        await sendWhatsApp(user.phone,
          `✅ *TRANSAKSI BERHASIL*\nProduk: ${product.name}\nNomor: ${targetNumber}\n${result.sn ? 'SN: ' + result.sn + '\n' : ''}Total: Rp ${sellPrice.toLocaleString('id-ID')}\n${pointsEarned > 0 ? `+${pointsEarned} poin reward` : ''}`)

        return NextResponse.json({
          message: 'Transaksi berhasil',
          status: 'SUCCESS',
          sn: result.sn,
          transactionId: transaction.id,
          pointsEarned,
        })
      }

      if (result.status === 'Gagal') {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({ where: { userId }, data: { balanceHold: { decrement: sellPrice } } })
          await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'FAILED', failReason: result.message } })
        })
        await sendNotification(userId, 'TRANSACTION_FAILED', '❌ Transaksi Gagal', `${product.name} ke ${targetNumber} gagal. ${result.message}`)
        return NextResponse.json({ error: 'Transaksi gagal', reason: result.message }, { status: 422 })
      }

      // Pending — tunggu webhook
      return NextResponse.json({ message: 'Transaksi sedang diproses', status: 'PENDING', transactionId: transaction.id })

    } catch (digiError) {
      await prisma.wallet.update({ where: { userId }, data: { balanceHold: { decrement: sellPrice } } })
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
    const search = searchParams.get('search') ?? undefined

    const where: any = role === 'ADMIN' ? {} : { userId }
    if (status) where.status = status
    if (search) where.targetNumber = { contains: search }

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
