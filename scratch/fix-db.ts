import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixData() {
  console.log("Checking for inconsistent TokenUsage records...");
  const tokenUsages = await prisma.tokenUsage.findMany({
    where: {
      conversationId: { not: null }
    },
    select: { id: true, conversationId: true }
  });

  for (const usage of tokenUsages) {
    if (usage.conversationId) {
      const conv = await prisma.conversation.findUnique({
        where: { id: usage.conversationId }
      });
      if (!conv) {
        console.log(`Fixing TokenUsage ${usage.id}: Conversation ${usage.conversationId} not found. Setting to null.`);
        await prisma.tokenUsage.update({
          where: { id: usage.id },
          data: { conversationId: null }
        });
      }
    }
  }
  console.log("Done.");
}

fixData()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
