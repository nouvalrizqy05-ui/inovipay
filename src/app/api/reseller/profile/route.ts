import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true, storeName: true,
        provinsi: true, kabupaten: true, kecamatan: true, alamat: true,
        role: true, status: true, tier: true, points: true,
        referralCode: true, referredBy: true, createdAt: true,
        passwordHash: true, // We use this for PIN now
      },
    })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    return NextResponse.json({
      user: {
        ...user,
        hasPIN: !!user.passwordHash,
        passwordHash: undefined, // jangan expose hash
      }
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { name, storeName, currentPin, newPin } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const updateData: any = {}
    if (name) updateData.name = name
    if (storeName) updateData.storeName = storeName

    if (newPin) {
      if (!currentPin) return NextResponse.json({ error: 'PIN lama wajib diisi' }, { status: 400 })
      const match = await bcrypt.compare(currentPin, user.passwordHash)
      if (!match) return NextResponse.json({ error: 'PIN lama salah' }, { status: 400 })
      if (newPin.length !== 6) return NextResponse.json({ error: 'PIN baru harus 6 digit angka' }, { status: 400 })
      updateData.passwordHash = await bcrypt.hash(newPin, 12)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true, storeName: true,
        provinsi: true, kabupaten: true, kecamatan: true, alamat: true,
        role: true, status: true, tier: true, points: true,
        referralCode: true, createdAt: true, passwordHash: true,
      },
    })

    return NextResponse.json({
      user: { ...updated, hasPIN: !!updated.passwordHash, passwordHash: undefined }
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ message: 'Akun berhasil dihapus' }, { status: 200 })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghapus akun' }, { status: 500 })
  }
}
