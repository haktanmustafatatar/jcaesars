import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateText } from "ai";
import { LLM_MODELS } from "@/lib/ai";
import { scrapePage } from "@/lib/crawler";
import { generateSystemPrompt } from "@/lib/neural-recipes";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, useCase = "support" } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. Scrape metadata using Firecrawl (or fallback fetch)
    let metadata;
    try {
      const result = await scrapePage(url);
      metadata = {
        title: result?.metadata?.title || "",
        description: result?.metadata?.description || "",
        logo: result?.metadata?.ogImage || result?.metadata?.favicon || "",
        language: result?.metadata?.language || "en",
      };
    } catch (e) {
      console.warn("Rapid scrape failed, attempting basic fetch:", e);
      // Fallback: simple fetch for meta tags if firecrawl is slow/limiting
      const response = await fetch(url);
      const html = await response.text();
      metadata = {
        title: html.match(/<title>(.*?)<\/title>/)?.[1] || "",
        description: html.match(/<meta name="description" content="(.*?)"/)?.[1] || "",
        logo: html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || "",
        language: "en",
      };
    }

    // 2. Generate Business Context via LLM
    const { text: businessContext } = await generateText({
      model: LLM_MODELS["gpt-4o-mini"].provider,
      prompt: `Based on the following website information, write a professional 2-sentence summary of the business context, its purpose, and its primary products/services. 
      Website: ${url}
      Title: ${metadata.title}
      Description: ${metadata.description}
      
      Summary:`,
    });

    // 3. Assemble the System Prompt using Neural Recipes
    const systemPrompt = generateSystemPrompt(useCase, businessContext.trim());

    // 4. Determine Primary Color (simplified: use a default or look for meta theme-color)
    // In a real production app, we would analyze the favicon or CSS.
    const primaryColor = "#18181b"; // Default sleek dark

    return NextResponse.json({
      name: metadata.title.split("|")[0].trim() || "My AI Agent",
      description: metadata.description.slice(0, 160),
      logo: metadata.logo,
      primaryColor,
      language: metadata.language,
      businessContext: businessContext.trim(),
      systemPrompt,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
