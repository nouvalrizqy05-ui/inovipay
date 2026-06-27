import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Buat admin pertama
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ppob.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123456'
  const adminPhone = process.env.ADMIN_PHONE ?? '08100000000'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        phone: adminPhone,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })
    await prisma.wallet.create({ data: { userId: admin.id } })
    console.log(`✅ Admin dibuat: ${adminEmail} / ${adminPassword}`)
  } else {
    console.log('⚠️  Admin sudah ada, skip.')
  }

  // Konfigurasi default sistem
  await prisma.systemConfig.upsert({
    where: { key: 'digiflazz_low_balance_threshold' },
    update: {},
    create: { key: 'digiflazz_low_balance_threshold', value: '500000' },
  })

  await prisma.systemConfig.upsert({
    where: { key: 'platform_name' },
    update: {},
    create: { key: 'platform_name', value: 'PPOB Platform' },
  })

  await prisma.systemConfig.upsert({
    where: { key: 'min_deposit' },
    update: {},
    create: { key: 'min_deposit', value: '10000' },
  })

  console.log('✅ Konfigurasi sistem dibuat')
  console.log('🎉 Seeding selesai!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
