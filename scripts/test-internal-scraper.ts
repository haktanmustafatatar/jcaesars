import { internalScrape } from "../lib/crawler";

async function main() {
  const url = "https://vareno.com.tr/products/finachi-trench-coat";
  console.log(`--- Testing Internal Scraper with ${url} ---`);
  
  const result = await internalScrape(url);
  
  if (result.success) {
    console.log("SUCCESS!");
    console.log(`Title: ${result.data?.metadata.title}`);
    console.log(`Description: ${result.data?.metadata.description}`);
    console.log("--- Content Preview (First 500 chars) ---");
    console.log(result.data?.markdown.substring(0, 500));
    console.log("-----------------------------------------");
  } else {
    console.error("FAILED!");
    console.error(result.error);
  }
}

main().catch(console.error);
