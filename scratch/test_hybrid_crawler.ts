
import { crawlWebsite } from "../lib/crawler";
import { prisma } from "../lib/prisma";

async function testCrawler() {
  const url = "https://wessi.com.tr";
  const chatbotId = "cmnvyww3k000tr2q05wj1t5jm"; // Use existing Vareno chatbot ID for testing
  
  console.log("Starting Crawler Test for:", url);
  
  try {
    // We need to create a dummy data source for this test
    const dataSource = await prisma.dataSource.create({
      data: {
        chatbotId,
        type: "WEBSITE",
        name: "Wessi Hybrid Test",
        url,
        status: "PENDING"
      }
    });

    const result = await crawlWebsite({
      url,
      maxDepth: 1,
      limit: 10,
      chatbotId,
      dataSourceId: dataSource.id
    });

    console.log("Crawl Result:", JSON.stringify(result, null, 2));
    
    // Check if documents were created
    const docCount = await prisma.document.count({
      where: { dataSourceId: dataSource.id }
    });
    console.log(`Documents indexed: ${docCount}`);
    
    // Clean up if needed, but maybe leave it for manual inspection
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testCrawler();
