import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateAdmin() {
  const passwordHash = await bcrypt.hash('123456', 12)
  await prisma.user.updateMany({
    where: { email: 'admin@inovipay.id' },
    data: { passwordHash }
  })
  console.log('Admin PIN updated to 123456')
}

updateAdmin().catch(console.error).finally(() => prisma.$disconnect())
