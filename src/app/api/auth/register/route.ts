import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3)
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${suffix}`
}

export async function POST(req: NextRequest) {
  try {
    const { 
      name, email, phone, pin, 
      provinsi, kabupaten, kecamatan, alamat, storeName, 
      referralCode: usedReferralCode 
    } = await req.json()

    if (!name || !email || !phone || !pin || !provinsi || !kabupaten || !kecamatan || !alamat || !storeName) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (pin.length !== 6) {
      return NextResponse.json({ error: 'PIN harus persis 6 digit angka' }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } })
    if (existing) {
      // Jika user sudah ada tapi masih pending, mungkin mereka mau daftar ulang atau minta OTP ulang.
      // Tapi untuk simplicity, kita tolak saja. Mereka bisa pakai fitur resend OTP di halaman verifikasi.
      if (existing.status === 'ACTIVE') {
        return NextResponse.json({ error: 'Email atau nomor HP sudah terdaftar dan aktif' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Email atau nomor HP sudah terdaftar. Silakan verifikasi OTP.' }, { status: 409 })
    }

    // Cek referral code
    let referredByUserId: string | null = null
    if (usedReferralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: usedReferralCode } })
      if (!referrer) return NextResponse.json({ error: 'Kode referral tidak valid' }, { status: 400 })
      referredByUserId = referrer.id
    }

    const passwordHash = await bcrypt.hash(pin, 12)
    let referralCode = generateReferralCode(name)

    // Pastikan referral code unik
    while (await prisma.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode(name)
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name, email, phone, passwordHash,
          provinsi, kabupaten, kecamatan, alamat, storeName,
          role: 'RESELLER', status: 'ACTIVE',
          referralCode,
          referredBy: referredByUserId
        },
      })
      await tx.wallet.create({ data: { userId: newUser.id } })
      return newUser
    })

    return NextResponse.json({
      message: 'Registrasi berhasil, akun Anda sudah aktif',
      userId: user.id
    }, { status: 201 })
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
