import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { pin, currentPassword } = await req.json()

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN harus 6 digit angka' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    // Verifikasi password sebelum set PIN
    if (!currentPassword) return NextResponse.json({ error: 'Password wajib diisi untuk set PIN' }, { status: 400 })
    const match = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!match) return NextResponse.json({ error: 'Password salah' }, { status: 401 })

    const pinHash = await bcrypt.hash(pin, 10)
    await prisma.user.update({ where: { id: userId }, data: { pinHash } })

    return NextResponse.json({ message: 'PIN berhasil diatur' })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
