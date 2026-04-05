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

    // Crawl for links (map only)
    const mapResponse = await firecrawl.mapUrl(url, {
      limit: 1000,
    });

    if (!mapResponse.success) {
      return NextResponse.json({ error: mapResponse.error }, { status: 500 });
    }

    const links = (mapResponse.links || []).map((link: string) => ({
      url: link,
      status: "new",
      selected: true,
      size: "TBD", // Firecrawl map doesn't provide size without scraping
    }));

    return NextResponse.json({ links });

  } catch (error: any) {
    console.error("Fetch-links error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
