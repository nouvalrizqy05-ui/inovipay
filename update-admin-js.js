const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = '$2a$12$aMoF/eYW/daHUg1qL85uE.3HDappXmOK/woAiyI6iT/77Ge78bUUe';
  await prisma.user.updateMany({
    where: { email: 'admin@inovipay.id' },
    data: { passwordHash }
  });
  console.log('Admin PIN successfully updated to 123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
