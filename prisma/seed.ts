import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin pertama
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@inovipay.id'
  const adminPassword = process.env.ADMIN_PASSWORD ?? '123456'
  const adminPhone = process.env.ADMIN_PHONE ?? '081200000000'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        phone: adminPhone,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        referralCode: 'ADMIN001',
      },
    })
    await prisma.wallet.create({ data: { userId: admin.id } })
    console.log(`✅ Admin: ${adminEmail} / ${adminPassword}`)
  } else {
    console.log('⚠️  Admin sudah ada')
  }

  // Konfigurasi sistem default
  const configs = [
    { key: 'digiflazz_low_balance_threshold', value: '500000' },
    { key: 'platform_name', value: 'InoviPay' },
    { key: 'platform_phone', value: '081200000000' },
    { key: 'platform_address', value: 'Indonesia' },
    { key: 'min_deposit', value: '10000' },
    { key: 'bank_name', value: 'BCA' },
    { key: 'bank_account_number', value: '1234567890' },
    { key: 'bank_account_name', value: 'PT InoviPay Indonesia' },
    { key: 'point_per_transaction', value: '1' }, // 1 poin per Rp 1.000 margin
  ]

  for (const c of configs) {
    await prisma.systemConfig.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    })
  }
  console.log('✅ Konfigurasi sistem')

  // Banner contoh
  const bannerCount = await prisma.banner.count()
  if (bannerCount === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: 'Promo Cashback Pulsa 10%',
          imageUrl: 'https://placehold.co/800x300/00B4A0/white?text=Promo+Cashback+10%25',
          order: 1,
          isActive: true,
        },
        {
          title: 'Bonus Poin Transaksi',
          imageUrl: 'https://placehold.co/800x300/FF6B35/white?text=Bonus+Poin+2x',
          order: 2,
          isActive: true,
        },
      ]
    })
    console.log('✅ Banner contoh')
  }

  console.log('\n🎉 Seeding selesai!')
  console.log(`\n📋 Login admin:\n   Email: ${adminEmail}\n   Password: ${adminPassword}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
