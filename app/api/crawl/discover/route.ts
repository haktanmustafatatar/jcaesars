import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Firecrawl Scrape for metadata & brand assets
    const scrapeResponse = await firecrawl.scrapeUrl(url, {
      formats: ["markdown", "html"],
      onlyMainContent: true,
    }) as any;

    if (!scrapeResponse.success) {
      return NextResponse.json({ error: scrapeResponse.error }, { status: 500 });
    }

    const metadata = scrapeResponse.data.metadata || {};
    
    // Attempt to extract logo if not in metadata
    let logo = metadata.ogImage || metadata.twitterImage || "";
    
    // Very basic color extraction logic (mocked for now, can be improved with image analysis)
    const primaryColor = "#e25b31"; // Default JCaesar color

    return NextResponse.json({
      name: metadata.title || "",
      description: metadata.description || "",
      logo,
      primaryColor,
      language: metadata.language || "en",
    });

  } catch (error: any) {
    console.error("Discovery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
