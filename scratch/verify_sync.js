
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTrenckot() {
  const chatbotId = 'cmnvyww3k000tr2q05wj1t5jm';
  const docs = await prisma.document.findMany({
    where: {
      dataSource: { chatbotId },
      content: { contains: 'trençkot', mode: 'insensitive' }
    },
    select: { title: true, url: true }
  });
  
  console.log('Trençkot Documents found:', docs.length);
  docs.forEach(d => console.log(`- ${d.title}: ${d.url}`));
  
  const totalDocs = await prisma.document.count({
    where: { dataSource: { chatbotId } }
  });
  console.log('Total Documents for Vareno:', totalDocs);
  
  process.exit(0);
}

checkTrenckot().catch(console.error).finally(() => prisma.$disconnect());
