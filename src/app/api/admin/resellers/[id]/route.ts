import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { sendNotification, sendWhatsApp } from '@/lib/notification'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const { status } = await req.json() // 'ACTIVE' | 'SUSPENDED'

    const reseller = await prisma.user.findUnique({ where: { id: params.id } })
    if (!reseller) return NextResponse.json({ error: 'Reseller tidak ditemukan' }, { status: 404 })

    await prisma.user.update({ where: { id: params.id }, data: { status } })

    if (status === 'ACTIVE') {
      await sendNotification(params.id, 'SYSTEM', 'Akun Diaktifkan ✅',
        'Akun reseller kamu telah diaktifkan. Silakan login dan mulai transaksi!')
      await sendWhatsApp(reseller.phone,
        '✅ Akun reseller kamu sudah aktif! Silakan login dan mulai jualan.')
    } else if (status === 'SUSPENDED') {
      await sendNotification(params.id, 'SYSTEM', 'Akun Disuspend',
        'Akun kamu sementara disuspend. Hubungi admin untuk informasi lebih lanjut.')
    }

    return NextResponse.json({ message: `Reseller berhasil di-${status === 'ACTIVE' ? 'aktifkan' : 'suspend'}` })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
