import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const authData = await requireAuth(req)
    if (authData.role !== 'RESELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { requestedDevices } = await req.json()
    const currentUser = await prisma.user.findUnique({ where: { id: authData.userId } })
    if (!currentUser) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    if (!requestedDevices || requestedDevices <= currentUser.maxDevices) {
      return NextResponse.json({ error: 'Jumlah perangkat tidak valid' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: authData.userId },
      data: { deviceRequest: Number(requestedDevices) }
    })

    return NextResponse.json({ message: 'Permintaan berhasil dikirim' })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
