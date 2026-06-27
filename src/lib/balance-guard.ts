import { cekSaldo } from './digiflazz'
import { alertAdmins } from './notification'
import { prisma } from './prisma'

const LOW_BALANCE_KEY = 'digiflazz_low_balance_threshold'
const DEFAULT_THRESHOLD = 500000 // Rp 500.000

// Ambil threshold dari database (admin bisa ubah lewat panel)
async function getThreshold(): Promise<number> {
  const config = await prisma.systemConfig.findUnique({
    where: { key: LOW_BALANCE_KEY },
  })
  return config ? parseInt(config.value) : DEFAULT_THRESHOLD
}

// Cek saldo Digiflazz — kalau rendah, alert admin
// Dipanggil sebelum setiap transaksi
export async function checkDigiflazzBalance(requiredAmount: number): Promise<{
  ok: boolean
  balance: number
  reason?: string
}> {
  try {
    const balance = await cekSaldo()
    const threshold = await getThreshold()

    // Saldo tidak cukup untuk transaksi ini
    if (balance < requiredAmount) {
      await alertAdmins(
        'LOW_BALANCE_ALERT',
        '⚠️ Saldo Digiflazz Tidak Mencukupi',
        `Saldo Digiflazz saat ini Rp ${balance.toLocaleString('id-ID')}. ` +
        `Dibutuhkan Rp ${requiredAmount.toLocaleString('id-ID')} untuk memproses transaksi.`
      )
      return { ok: false, balance, reason: 'Saldo supplier tidak mencukupi, hubungi admin' }
    }

    // Saldo cukup tapi mendekati threshold — kirim peringatan dini ke admin
    if (balance <= threshold) {
      // Cek apakah alert sudah dikirim dalam 1 jam terakhir (hindari spam)
      const recentAlert = await prisma.notification.findFirst({
        where: {
          type: 'LOW_BALANCE_ALERT',
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      })

      if (!recentAlert) {
        await alertAdmins(
          'LOW_BALANCE_ALERT',
          '⚠️ Saldo Digiflazz Menipis',
          `Saldo Digiflazz saat ini Rp ${balance.toLocaleString('id-ID')}. ` +
          `Segera top up untuk menghindari transaksi gagal.`
        )
      }
    }

    return { ok: true, balance }
  } catch (error) {
    console.error('[BALANCE GUARD ERROR]', error)
    // Kalau tidak bisa cek saldo (koneksi error), tetap lanjutkan transaksi
    // tapi log error-nya
    return { ok: true, balance: 0 }
  }
}
