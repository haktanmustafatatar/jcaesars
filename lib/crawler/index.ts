import FirecrawlApp from "@mendable/firecrawl-js";
import { prisma } from "@/lib/prisma";
import { createEmbedding } from "@/lib/ai";

// Firecrawl client
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || "",
});

// Website crawling
// Website crawling
export async function crawlWebsite({
  url,
  maxDepth = 3,
  limit = 100,
  chatbotId,
  dataSourceId,
}: {
  url: string;
  maxDepth?: number;
  limit?: number;
  chatbotId: string;
  dataSourceId: string;
}) {
  try {
    // Firecrawl ile crawl et
    const crawlResponse = await firecrawl.crawlUrl(url, {
      limit,
      scrapeOptions: {
        formats: ["markdown", "html"],
        onlyMainContent: true,
      },
      maxDepth,
    });

    if (!crawlResponse.success) {
      throw new Error(crawlResponse.error || "Crawl initiation failed");
    }

    const jobId = (crawlResponse as any).id;
    let pages: any[] = [];

    if (jobId) {
      console.log(`[Crawler] Job initiated with ID: ${jobId}. Polling for results...`);
      let statusResult: any;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5s intervals)

      while (attempts < maxAttempts) {
        // SDK 1.x uses checkCrawlStatus
        statusResult = await (firecrawl as any).checkCrawlStatus(jobId);
        
        if (statusResult.success && (statusResult.status === "completed" || statusResult.status === "finished")) {
          pages = statusResult.data || [];
          console.log(`[Crawler] Job ${jobId} completed. Pages found: ${pages.length}`);
          break;
        }

        if (statusResult.status === "failed") {
          throw new Error(`Crawl job ${jobId} failed on Firecrawl side: ${statusResult.error || "Unknown error"}`);
        }

        attempts++;
        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      if (attempts >= maxAttempts) {
        throw new Error(`Crawl job ${jobId} timed out.`);
      }
    } else {
      // Fallback if data was returned directly
      pages = (crawlResponse as any).data || [];
    }

    // 2. Process each page
    console.log(`[Crawler] Processing ${pages.length} pages...`);
    
    for (const page of pages) {
      if (!page.markdown && !page.html) continue;
      const content = page.markdown || page.html;

      // Chunk'lara böl (512 token, 50 overlap)
      const chunks = chunkText(content, 512, 50);
      console.log(`[Crawler] Page ${page.metadata?.sourceURL} split into ${chunks.length} chunks`);

      for (const chunk of chunks) {
        // Embedding oluştur
        const embedding = await createEmbedding(chunk);
        const docId = `doc_${Math.random().toString(36).substring(2, 11)}`;
        
        const metadata = {
          description: page.metadata?.description,
          ogImage: page.metadata?.ogImage,
          language: page.metadata?.language,
          sourceURL: page.metadata?.sourceURL || url,
          ...page.metadata
        };

        // Format embedding for pgvector: [val1, val2, ...]
        const vectorStr = `[${embedding.join(",")}]`;

        // pgvector için raw SQL
        await prisma.$executeRaw`
          INSERT INTO "Document" ("id", "dataSourceId", "content", "url", "title", "metadata", "embedding", "createdAt", "updatedAt")
          VALUES (
            ${docId},
            ${dataSourceId},
            ${chunk},
            ${page.metadata?.sourceURL || url},
            ${page.metadata?.title || "Untitled"},
            ${JSON.stringify(metadata)}::jsonb,
            ${vectorStr}::vector,
            NOW(),
            NOW()
          )
        `;
      }
    }

    // Data source'u güncelle
    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        status: "COMPLETED",
        pagesCount: pages.length,
        lastCrawledAt: new Date(),
      },
    });

    return {
      success: true,
      pagesCrawled: pages.length,
      totalChunks: pages.length * 3, // ortalama tahmin
    };
  } catch (error) {
    console.error("Crawl error:", error);

    // Hata durumunu kaydet
    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        status: "ERROR",
        crawlStatus: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

// Tek sayfa scrape
export async function scrapePage(url: string) {
  const scrapeResponse = await firecrawl.scrapeUrl(url, {
    formats: ["markdown", "html"],
    onlyMainContent: true,
  });

  if (!scrapeResponse.success) {
    throw new Error(scrapeResponse.error || "Scrape failed");
  }

  return (scrapeResponse as any).data ?? scrapeResponse;
}

// Sitemap'den URL'leri çek
export async function getSitemapUrls(url: string): Promise<string[]> {
  try {
    const sitemapUrl = url.endsWith("/sitemap.xml")
      ? url
      : `${url.replace(/\/$/, "")}/sitemap.xml`;

    const response = await fetch(sitemapUrl);
    if (!response.ok) return [];

    const xml = await response.text();
    const urls: string[] = [];

    // Basit XML parsing
    const urlMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
    for (const match of urlMatches) {
      urls.push(match[1]);
    }

    return urls;
  } catch {
    return [];
  }
}

// Text chunk'larına böl
function chunkText(text: string, maxTokens: number, overlap: number): string[] {
  // Basit chunking: karakter bazlı (token ~= karakter/4)
  const maxChars = maxTokens * 4;
  const overlapChars = overlap * 4;

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlapChars;

    if (start >= end) break;
  }

  return chunks;
}

// Doküman yükleme (PDF, DOCX, TXT)
export async function processDocument({
  fileUrl,
  fileType,
  chatbotId,
  dataSourceId,
}: {
  fileUrl: string;
  fileType: string;
  chatbotId: string;
  dataSourceId: string;
}) {
  try {
    let content = "";

    if (fileType === "text/plain" || fileType === "text/markdown") {
      // Text dosyası
      const response = await fetch(fileUrl);
      content = await response.text();
    } else if (fileType === "application/pdf") {
      // PDF - Firecrawl ile scrape
      const scrapeResult = await firecrawl.scrapeUrl(fileUrl, {
        formats: ["markdown"],
      });
      content = ((scrapeResult as any).data as any)?.markdown || "";
    } else {
      // Diğer dosyalar - Firecrawl dene
      const scrapeResult = await firecrawl.scrapeUrl(fileUrl, {
        formats: ["markdown"],
      });
      content = ((scrapeResult as any).data as any)?.markdown || "";
    }

    if (!content.trim()) {
      throw new Error("Could not extract content from file");
    }

    // Chunk'lara böl
    const chunks = chunkText(content, 512, 50);

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);
      const docId = `doc_${Math.random().toString(36).substring(2, 11)}`;
      const vectorStr = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "Document" ("id", "dataSourceId", "content", "title", "metadata", "embedding", "createdAt", "updatedAt")
        VALUES (
          ${docId},
          ${dataSourceId},
          ${chunk},
          "Document Upload",
          ${JSON.stringify({ fileType, fileUrl })}::jsonb,
          ${vectorStr}::vector,
          NOW(),
          NOW()
        )
      `;
    }

    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        status: "COMPLETED",
        pagesCount: 1,
        lastCrawledAt: new Date(),
      },
    });

    return { success: true, chunks: chunks.length };
  } catch (error) {
    console.error("Document processing error:", error);

    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        status: "ERROR",
        crawlStatus: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

// Semantic search (RAG)
export async function searchDocuments({
  query,
  chatbotId,
  limit = 5,
}: {
  query: string;
  chatbotId: string;
  limit?: number;
}) {
  // Query embedding oluştur
  const queryEmbedding = await createEmbedding(query);

  // pgvector ile cosine similarity search
  const documents = await prisma.$queryRaw`
    SELECT 
      d.id,
      d.content,
      d.url,
      d.title,
      d.metadata,
      1 - (d.embedding <=> ${queryEmbedding}::vector) as similarity
    FROM "Document" d
    JOIN "DataSource" ds ON d."dataSourceId" = ds.id
    WHERE ds."chatbotId" = ${chatbotId}
      AND d.embedding IS NOT NULL
    ORDER BY d.embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `;

  return documents as Array<{
    id: string;
    content: string;
    url: string | null;
    title: string | null;
    metadata: any;
    similarity: number;
  }>;
}
