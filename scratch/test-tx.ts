import { PrismaClient } from '@prisma/client'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const secret = new TextEncoder().encode("7f8b9e2a4c1d3f6b8a9c2d5e7f1a3b6c9d2e8f4a1b3c5d7e9f2a4b6c8d1e3f5")

async function test() {
  const phone = '0899999999' + Math.floor(Math.random() * 1000)
  const passwordHash = await bcrypt.hash('123456', 10)
  
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      phone,
      email: phone + '@test.com',
      passwordHash,
      status: 'ACTIVE',
      wallet: {
        create: { balance: 5000000, balanceHold: 0 }
      }
    }
  })
  
  const token = await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(secret)

  const product = await prisma.product.findFirst({ where: { category: 'PULSA' } })
  console.log("Testing transaction for product:", product?.code)
  
  const res = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productCode: product?.code,
      targetNumber: '081234567890',
      pin: '123456'
    })
  })
  
  const data = await res.json()
  console.log("Status:", res.status)
  console.log("Response:", data)
}

test().catch(console.error).finally(() => prisma.$disconnect())
