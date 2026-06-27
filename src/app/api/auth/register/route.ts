import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, referralCode } = await req.json()

    // Validasi input
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      )
    }

    // Cek referral code
    let referredBy = null
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (referrer) referredBy = referrer.id
    }

    // Cek duplikat email/phone
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email atau nomor HP sudah terdaftar' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const newReferralCode = (name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()).replace(/[^A-Z0-9]/g, 'X')

    // Buat user + wallet dalam satu transaksi
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: 'RESELLER',
          status: 'PENDING', // Perlu approval admin
          referralCode: newReferralCode,
          referredBy,
        },
      })

      await tx.wallet.create({
        data: { userId: newUser.id },
      })

      return newUser
    })

    const token = await signToken({ userId: user.id, role: user.role })

    return NextResponse.json({
      message: 'Registrasi berhasil, menunggu aktivasi admin',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
