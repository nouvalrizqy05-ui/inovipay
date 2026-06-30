import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import crypto from 'crypto'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { identifier, pin } = await req.json()

    if (!identifier || !pin) {
      return NextResponse.json(
        { error: 'Email/Nomor HP dan PIN wajib diisi' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }]
      },
      include: { wallet: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email/Nomor HP atau PIN salah' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(pin, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email/Nomor HP atau PIN salah' },
        { status: 401 }
      )
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Akun kamu disuspend. Hubungi admin.' },
        { status: 403 }
      )
    }
    
    if (user.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Akun kamu belum diverifikasi. Silakan cek OTP di WhatsApp.' },
        { status: 403 } // Or 401/409 depending on frontend handling
      )
    }

    // Remove currentSessionId check since we use UserDevice limit now

    if (user.role === 'ADMIN') {
      const sessionId = crypto.randomUUID()
      await prisma.user.update({
        where: { id: user.id },
        data: { currentSessionId: sessionId }
      })

      const token = await signToken({ userId: user.id, role: user.role, sessionId })
      return NextResponse.json({
        message: 'Login berhasil!',
        token,
        user: {
          id: user.id, name: user.name, storeName: user.storeName, email: user.email, phone: user.phone,
          role: user.role, status: 'ACTIVE', balance: user.wallet?.balance ?? 0
        },
      })
    }

    const otpCode = generateOTP()
    const otpExp = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExp }
    })

    // Kirim WA via Fonnte
    const fonnteToken = process.env.FONNTE_TOKEN || 'XfmpYnwopcW7L3vped5Z'
    const waMessage = `InoviStore: Kode OTP Login Anda adalah: *${otpCode}*. Jangan berikan kode ini kepada siapapun.`
    
    console.log(`\n============================\n[OTP TEST] OTP Login untuk ${user.phone} adalah: ${otpCode}\n============================\n`);
    
    try {
      const formData = new FormData()
      formData.append('target', user.phone)
      formData.append('message', waMessage)
      formData.append('countryCode', '62')

      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': fonnteToken },
        body: formData
      })
    } catch (e) {
      console.error('Gagal kirim WhatsApp OTP', e)
    }

    return NextResponse.json({
      message: 'OTP berhasil dikirim ke WhatsApp Anda',
      userId: user.id
    })

  } catch (error) {
    console.error('[LOGIN ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
