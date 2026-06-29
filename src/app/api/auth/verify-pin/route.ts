import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const { pin } = await req.json()

    if (!pin) return NextResponse.json({ error: 'PIN wajib diisi' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    if (!user.pinHash) return NextResponse.json({ error: 'PIN belum diatur', code: 'NO_PIN' }, { status: 400 })

    const match = await bcrypt.compare(pin, user.pinHash)
    if (!match) return NextResponse.json({ error: 'PIN salah' }, { status: 401 })

    return NextResponse.json({ valid: true })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
