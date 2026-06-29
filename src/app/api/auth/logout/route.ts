import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear session id in database
    await prisma.user.update({
      where: { id: user.userId },
      data: { currentSessionId: null }
    })

    return NextResponse.json({ message: 'Logout berhasil' }, { status: 200 })
  } catch (error) {
    console.error('[LOGOUT ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
