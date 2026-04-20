
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVareno() {
  const chatbot = await prisma.chatbot.findUnique({
    where: { id: 'cmnvyww3k000tr2q05wj1t5jm' },
    include: { dataSources: true }
  });
  console.log('Chatbot:', JSON.stringify(chatbot, null, 2));
  process.exit(0);
}

checkVareno().catch(err => {
  console.error(err);
  process.exit(1);
});
