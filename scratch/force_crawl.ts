
import { crawlWebsite } from "../lib/crawler";
import { prisma } from "../lib/prisma";

async function forceCrawl() {
  const chatbotId = 'cmnvyww3k000tr2q05wj1t5jm';
  const dataSourceId = 'cmnvyww3k000ur2q0tctcac96';
  const url = 'https://vareno.com.tr/';

  console.log(`[ForceCrawl] Starting crawl for ${url}...`);
  
  try {
    const result = await crawlWebsite({
      url,
      chatbotId,
      dataSourceId,
      maxDepth: 3,
      limit: 100
    });
    
    console.log('[ForceCrawl] Success:', JSON.stringify(result, null, 2));
    
    // Set chatbot to ACTIVE manually
    await prisma.chatbot.update({
      where: { id: chatbotId },
      data: { status: 'ACTIVE' }
    });
    
    console.log('[ForceCrawl] Chatbot set to ACTIVE.');
  } catch (error) {
    console.error('[ForceCrawl] Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceCrawl();
