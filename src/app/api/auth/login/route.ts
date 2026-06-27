import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Akun kamu disuspend. Hubungi admin.' },
        { status: 403 }
      )
    }

    const token = await signToken({ userId: user.id, role: user.role })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        balance: user.wallet?.balance ?? 0,
      },
    })

  } catch (error) {
    console.error('[LOGIN ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
