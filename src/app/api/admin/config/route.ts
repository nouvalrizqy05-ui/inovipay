import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { cekSaldo } from '@/lib/digiflazz'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const [configs, digiflazzBalance] = await Promise.all([
      prisma.systemConfig.findMany(),
      cekSaldo().catch(() => null),
    ])
    return NextResponse.json({ configs, digiflazzBalance })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { key, value } = await req.json()

    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json({ message: 'Konfigurasi disimpan' })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
