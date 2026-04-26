import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateText } from "ai";
import { LLM_MODELS } from "@/lib/ai";
import { scrapePage } from "@/lib/crawler";
import { generateSystemPrompt } from "@/lib/neural-recipes";

export async function POST(req: NextRequest) {
    let url = "";
    let useCase = "support";

    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      let rawUrl = body.url;
      if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
      }
      url = rawUrl;
      useCase = body.useCase || "support";

      if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
      }

    // 1. Scrape content using Firecrawl
    let scrapeResult;
    try {
      scrapeResult = await scrapePage(url);
    } catch (e) {
      console.warn("Rapid scrape failed, attempting basic fetch:", e);
      // Fallback: simple fetch for metadata only
      const response = await fetch(url);
      const html = await response.text();
      scrapeResult = {
        metadata: {
          title: html.match(/<title>(.*?)<\/title>/)?.[1] || "",
          description: html.match(/<meta name="description" content="(.*?)"/)?.[1] || "",
          ogImage: html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || "",
          language: "en",
        },
        markdown: html.slice(0, 5000), // very basic fallback
      };
    }
    
    if (!scrapeResult) {
      return NextResponse.json({ error: "Failed to scrape website content" }, { status: 500 });
    }

    const metadata = {
      title: (scrapeResult.metadata as any)?.title || "",
      description: (scrapeResult.metadata as any)?.description || "",
      logo: (scrapeResult.metadata as any)?.ogImage || (scrapeResult.metadata as any)?.favicon || "",
      language: (scrapeResult.metadata as any)?.language || "en",
    };

    // 2. Generate Rich Business Context via LLM (Chatbase Logic)
    const { text: businessContext } = await generateText({
      model: LLM_MODELS["gpt-4o-mini"].provider, // Use mini for faster initial analysis
      prompt: `Analyze the following website content carefully to create a "Business Context" for an AI agent. 
      Write 3-4 professional and informative sentences following this exact structure:
      1. [Company Name] is a [Industry/Type] that offers [Primary Products/Services].
      2. Mention key value propositions or specific goals (e.g., promotional offers, fast shipping, 24/7 support).
      3. Explain what the AI agent's role is on this specific site (navigating collections, answering queries, etc.).
      
      STRICT RULE: Focus ONLY on factual information found in the text. Do not invent details.
      
      Website URL: ${url}
      Metadata Title: ${metadata.title}
      Metadata Description: ${metadata.description}
      
      Main Content Snippet:
      ${scrapeResult.markdown?.slice(0, 8000)}
      
      Business Context Summary:`,
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
  } catch (error: any) {
    console.error("Detailed Analysis error:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      url,
      useCase
    });
    return NextResponse.json({ error: "Analysis failed", details: error.message, stack: error.stack }, { status: 500 });
  }
}
