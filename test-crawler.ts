import { internalScrape } from "./lib/crawler";
import { prisma } from "./lib/prisma";

async function testCrawl() {
  const url = "https://vareno.com.tr";
  console.log(`Starting crawl for ${url}...`);
  
  try {
    const result = await internalScrape(url);
    console.log("Crawl Success!");
    console.log("Title:", result.title);
    console.log("Content Length:", result.content.length);
    console.log("Snippet:", result.content.substring(0, 200));
  } catch (error) {
    console.error("Crawl Failed:", error);
  } finally {
    process.exit();
  }
}

testCrawl();
