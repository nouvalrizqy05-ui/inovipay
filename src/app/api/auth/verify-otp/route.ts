import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { userId, otp, deviceId } = await req.json()

    if (!userId || !otp) {
      return NextResponse.json({ error: 'Kode OTP wajib diisi' }, { status: 400 })
    }
    
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID tidak ditemukan, silakan refresh browser' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { devices: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    if (user.otpCode !== otp) {
      return NextResponse.json({ error: 'Kode OTP salah' }, { status: 400 })
    }

    if (user.otpExp && new Date() > user.otpExp) {
      return NextResponse.json({ error: 'Kode OTP sudah kedaluwarsa, silakan login ulang' }, { status: 400 })
    }
    
    // Check device limit for all users (Admin now defaults to 3 devices, Resellers default to 1)
    const existingDevice = user.devices.find(d => d.deviceId === deviceId)
    if (!existingDevice) {
      if (user.devices.length >= user.maxDevices) {
        return NextResponse.json({ 
          error: `Login ditolak: Batas maksimal ${user.maxDevices} perangkat tercapai. Silakan hubungi Admin.`
        }, { status: 403 })
      }
      // Register new device
      await prisma.userDevice.create({
        data: {
          userId: user.id,
          deviceId: deviceId,
          deviceInfo: req.headers.get('user-agent') || 'Unknown Browser'
        }
      })
    } else {
      // Update last login
      await prisma.userDevice.update({
        where: { id: existingDevice.id },
        data: { lastLogin: new Date() }
      })
    }

    const sessionId = crypto.randomUUID()

    // Aktifkan akun (jika PENDING) dan hapus OTP, serta simpan sesi login
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        otpCode: null,
        otpExp: null,
        currentSessionId: sessionId
      }
    })

    const token = await signToken({ userId: user.id, role: user.role, sessionId })

    return NextResponse.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        storeName: user.storeName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: 'ACTIVE',
        balance: 0 // Ideally fetched, but we can default 0 here
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[VERIFY OTP ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
