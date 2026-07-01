import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function test() {
  const user = await prisma.user.findFirst()
  if (!user) return console.log("No user")
  console.log("User:", user.id, "Hash:", user.passwordHash)
  
  try {
    const match = await bcrypt.compare('123456', user.passwordHash)
    console.log("Match:", match)
  } catch (err) {
    console.error("Bcrypt Error:", err)
  }
}

test()
