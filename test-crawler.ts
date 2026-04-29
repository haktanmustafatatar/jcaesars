import { internalScrape } from "./lib/crawler";
import { prisma } from "./lib/prisma";

async function testCrawl() {
  const url = "https://vareno.com.tr";
  console.log(`Starting crawl for ${url}...`);
  
  try {
    const result = await internalScrape(url);
    if (!result.success || !result.data) {
      console.error("Crawl Failed:", result.success ? "No data returned" : result.error);
      return;
    }
    console.log("Crawl Success!");
    console.log("Title:", result.data.metadata.title);
    console.log("Content Length:", result.data.markdown.length);
    console.log("Snippet:", result.data.markdown.substring(0, 200));
  } catch (error) {
    console.error("Crawl Failed:", error);
  } finally {
    process.exit();
  }
}

testCrawl();
