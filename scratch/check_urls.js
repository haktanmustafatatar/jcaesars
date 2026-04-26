const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.dataSourceUrl.count();
  const latest = await prisma.dataSourceUrl.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' }
  });
  console.log('Count:', count);
  console.log('Latest:', JSON.stringify(latest, null, 2));
}

main().finally(() => prisma.$disconnect());
