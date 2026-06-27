import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendWhatsApp } from '@/lib/notification'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Nomor HP wajib diisi' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { phone } })

    // Selalu return 200 — jangan bocorkan info apakah nomor terdaftar
    if (!user) return NextResponse.json({ message: 'Jika nomor terdaftar, kode reset akan dikirim via WhatsApp.' })

    const resetToken = crypto.randomBytes(6).toString('hex').toUpperCase()
    const resetTokenExp = new Date(Date.now() + 15 * 60 * 1000) // 15 menit

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    })

    await sendWhatsApp(phone,
      `🔐 Kode reset password kamu: *${resetToken}*\nBerlaku 15 menit. Jangan bagikan ke siapapun.`)

    return NextResponse.json({ message: 'Jika nomor terdaftar, kode reset akan dikirim via WhatsApp.' })
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
