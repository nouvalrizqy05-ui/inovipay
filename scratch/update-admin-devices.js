const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.updateMany({
  where: { role: 'ADMIN' },
  data: { maxDevices: 3 }
}).then(console.log).catch(console.error).finally(() => prisma.$disconnect());
