import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

// Kirim notifikasi in-app ke user
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string
) {
  return prisma.notification.create({
    data: { userId, type, title, message },
  })
}

// Kirim alert ke semua admin (misal: saldo Digiflazz rendah)
export async function alertAdmins(type: NotificationType, title: string, message: string) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', status: 'ACTIVE' },
    select: { id: true },
  })

  if (admins.length === 0) return

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type,
      title,
      message,
    })),
  })
}

// Kirim notifikasi WhatsApp via Fonnte (opsional)
// Aktifkan dengan mengisi FONNTE_TOKEN di .env
export async function sendWhatsApp(phone: string, message: string) {
  const token = process.env.FONNTE_TOKEN
  if (!token) return // Skip kalau tidak dikonfigurasi

  try {
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams({ target: phone, message }),
    })
  } catch (err) {
    console.error('[WHATSAPP ERROR]', err)
    // Jangan throw — notifikasi WA bukan critical path
  }
}
