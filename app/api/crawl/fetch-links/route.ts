import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const { getSitemapUrls, discoverSitemaps } = await import("@/lib/crawler");
    
    const sitemaps = await discoverSitemaps(url);
    
    let discoveredLinks: string[] = [];
    if (sitemaps.length > 0) {
      // Use the first discovered sitemap
      discoveredLinks = await getSitemapUrls(sitemaps[0]);
    } else {
      // Try guessing the sitemap directly
      discoveredLinks = await getSitemapUrls(url);
    }
    
    if (discoveredLinks.length === 0) {
      discoveredLinks = [url]; // Fallback to just the main url
    }

    // Limit to 1000 to match previous logic
    discoveredLinks = discoveredLinks.slice(0, 1000);

    const links = discoveredLinks.map((link: string) => ({
      url: link,
      status: "new",
      selected: true,
      size: "TBD", // Cannot determine size without scraping
    }));

    return NextResponse.json({ links });

  } catch (error: any) {
    console.error("Fetch-links error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
