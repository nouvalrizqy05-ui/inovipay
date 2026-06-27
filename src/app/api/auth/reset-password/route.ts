import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { phone, token, newPassword } = await req.json()

    if (!phone || !token || !newPassword) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { phone } })

    if (!user || user.resetToken !== token.toUpperCase() || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      return NextResponse.json({ error: 'Kode reset tidak valid atau sudah kadaluarsa' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    })

    return NextResponse.json({ message: 'Password berhasil direset. Silakan login.' })
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
