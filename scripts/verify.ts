import { prisma } from "../lib/prisma";
import { addCrawlJob } from "../lib/queue";

async function main() {
  console.log("--- Verification Script Starting ---");

  // 1. Create or get internal test user
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      clerkId: "user_test_verify",
      name: "Test User",
    },
  });
  console.log(`User ready: ${user.id}`);

  // 2. Create a chatbot
  const chatbot = await prisma.chatbot.create({
    data: {
      name: "Verification Bot",
      slug: `verify-${Date.now()}`,
      userId: user.id,
      status: "TRAINING",
      systemPrompt: "You are a test bot.",
      welcomeMessage: "Hello verification!",
      dataSources: {
        create: [
          {
            type: "WEBSITE",
            name: "Vareno Test",
            url: "https://vareno.com.tr",
            status: "PENDING",
          },
        ],
      },
    },
    include: {
      dataSources: true,
    },
  });
  console.log(`Chatbot created: ${chatbot.id}`);

  const dataSourceId = chatbot.dataSources[0].id;

  // 3. Add to queue
  await addCrawlJob({
    type: "crawl-website",
    url: "https://vareno.com.tr",
    chatbotId: chatbot.id,
    dataSourceId: dataSourceId,
    userId: user.id,
    maxDepth: 1, // shallow for fast verification
    limit: 5,    // small limit
  });
  console.log("Crawl job added to queue.");
  
  console.log("--- Script Finished ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
