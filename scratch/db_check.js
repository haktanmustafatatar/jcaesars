
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const chatbot = await prisma.chatbot.findUnique({
    where: { id: 'cmnvyww3k000tr2q05wj1t5jm' },
    include: {
      dataSources: {
        include: {
          _count: {
            select: { documents: true }
          }
        }
      }
    }
  });
  
  console.log('Chatbot Data:', JSON.stringify(chatbot, null, 2));
  
  const documents = await prisma.document.findMany({
    where: {
      dataSource: {
        chatbotId: 'cmnvyww3k000tr2q05wj1t5jm'
      }
    },
    take: 5,
    select: {
      title: true,
      url: true,
      content: true
    }
  });
  
  console.log('Sample Documents:', JSON.stringify(documents, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
