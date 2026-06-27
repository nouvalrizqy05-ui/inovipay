import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
    })
    return NextResponse.json({ user })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { name, currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const updateData: any = {}
    if (name) updateData.name = name

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Password lama wajib diisi' }, { status: 400 })
      const match = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!match) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })
      if (newPassword.length < 8) return NextResponse.json({ error: 'Password baru minimal 8 karakter' }, { status: 400 })
      updateData.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, status: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
