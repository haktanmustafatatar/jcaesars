import FirecrawlApp from "@mendable/firecrawl-js";
import { prisma } from "@/lib/prisma";
import { createEmbedding } from "@/lib/ai";
import { chromium } from "playwright";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";

// Turndown configuration
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

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
    // Dahili Crawler Mantığı (Firecrawl olmadan)
    console.log(`[Crawler] Starting optimized internal crawl for: ${url} (maxDepth: ${maxDepth}, limit: ${limit})`);
    
    const pages: any[] = [];
    const visited = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url, depth: 0 }];
    const baseUrl = new URL(url).origin;

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      });

      while (queue.length > 0 && pages.length < limit) {
        const { url: currentUrl, depth } = queue.shift()!;
        
        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);

        console.log(`[Crawler] [${pages.length + 1}/${limit}] Crawling: ${currentUrl} (depth: ${depth})`);

        try {
          // Sayfayı tara (Oturumu paylaşarak)
          const page = await context.newPage();
          page.setDefaultTimeout(20000); // 20s timeout per page

          await page.goto(currentUrl, { waitUntil: "networkidle" });
          const html = await page.content();
          const pageTitle = await page.title();

          // Readability & Turndown
          const dom = new JSDOM(html, { url: currentUrl });
          const reader = new Readability(dom.window.document);
          const article = reader.parse();

          if (article && article.content) {
            const markdown = turndownService.turndown(article.content);
            pages.push({
              markdown,
              html: article.content,
              metadata: {
                title: article.title || pageTitle,
                description: article.excerpt,
                language: article.lang || "en",
                sourceURL: currentUrl,
              }
            });

            // Link discovery (Eğer derinlik sınırı aşılmadıysa)
            if (depth < maxDepth) {
              const links = await page.evaluate((base) => {
                return Array.from(document.querySelectorAll("a"))
                  .map((a) => a.href)
                  .filter((href) => {
                    try {
                      const u = new URL(href);
                      // Avoid common bad links
                      return (
                        u.origin === base && 
                        !href.includes("#") && 
                        !href.includes("?") &&
                        !href.endsWith(".jpg") &&
                        !href.endsWith(".png") &&
                        !href.endsWith(".pdf")
                      );
                    } catch { return false; }
                  });
              }, baseUrl);

              for (const link of Array.from(new Set(links))) {
                if (!visited.has(link)) {
                  queue.push({ url: link, depth: depth + 1 });
                }
              }
            }
          }
          
          await page.close(); // İş bittiğinde sayfayı kapat ama browser kalsın
        } catch (err) {
          console.error(`[Crawler] Failed to scrape ${currentUrl}:`, err);
        }
      }
    } finally {
      if (browser) await browser.close();
    }

    if (pages.length === 0) {
      // Eğer dahili tarayıcı hiç sonuç bulamadıysa Firecrawl dene (Opsiyonel B Planı)
      console.log(`[Crawler] Internal crawl yielded 0 pages. Trying Firecrawl as fallback...`);
      return crawlWithFirecrawl({ url, maxDepth, limit, chatbotId, dataSourceId });
    }

    // 2. Process each page
    console.log(`[Crawler] Processing ${pages.length} pages...`);
    
    for (const page of pages) {
      if (!page.markdown && !page.html) continue;
      const content = page.markdown || page.html;

      // Metadata hazırlama
      const finalMetadata = {
        description: page.metadata?.description || "",
        ogImage: page.metadata?.ogImage || "",
        language: page.metadata?.language || "tr",
        sourceURL: page.metadata?.sourceURL || url,
        ...page.metadata
      };

      const pageTitle = page.metadata?.title || "Untitled Page";
      const pageUrl = page.metadata?.sourceURL || url;

      // Chunk'lara böl (512 token, 50 overlap)
      const chunks = chunkText(content, 512, 50);
      console.log(`[Crawler] Page ${pageUrl} split into ${chunks.length} chunks`);

      for (const chunk of chunks) {
        // Embedding oluştur
        const embedding = await createEmbedding(chunk);
        const docId = `doc_${Math.random().toString(36).substring(2, 11)}`;
        
        // Format embedding for pgvector: [val1, val2, ...]
        const vectorStr = `[${embedding.join(",")}]`;

        // pgvector için raw SQL (URL ve Title zorunlu)
        await prisma.$executeRaw`
          INSERT INTO "Document" ("id", "dataSourceId", "content", "url", "title", "metadata", "embedding", "createdAt", "updatedAt")
          VALUES (
            ${docId},
            ${dataSourceId},
            ${chunk},
            ${pageUrl},
            ${pageTitle},
            ${JSON.stringify(finalMetadata)}::jsonb,
            ${vectorStr}::vector,
            NOW(),
            NOW()
          )
        `;
      }
    }

    // Calculate total size
    const totalSize = pages.reduce((acc, p) => acc + (p.markdown?.length || 0), 0);

    // Data source'u güncelle
    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        status: "COMPLETED",
        pagesCount: pages.length,
        fileSize: totalSize, // Store actual size in bytes (approx characters)
        lastCrawledAt: new Date(),
      },
    });

    // Check if all sources for this chatbot are completed
    await updateChatbotStatus(chatbotId);

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

/**
 * Perform a high-quality internal scrape using Playwright & Readability
 */
export async function internalScrape(url: string) {
  let browser;
  try {
    console.log(`[InternalScraper] Launching browser for: ${url}`);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();
    
    // Set timeout to 30s
    page.setDefaultTimeout(30000);

    console.log(`[InternalScraper] Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle" });

    // Get the rendered HTML
    const html = await page.content();
    const pageTitle = (await page.title()) || "Untitled Page";

    // Use Readability to extract main content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    let contentToConvert = "";
    let extractedTitle = pageTitle;
    let extractedDescription = "";

    if (article && article.content && article.content.length > 100) {
      contentToConvert = article.content;
      extractedTitle = article.title || pageTitle;
      extractedDescription = article.excerpt || "";
    } else {
      // FALLBACK: Readability başarısız olursa veya çok kısa içerik verirse
      console.log(`[InternalScraper] Readability failed or returned short content for ${url}. Using fallback innerText.`);
      const bodyText = await page.innerText("body");
      contentToConvert = `<div>${bodyText.split("\n").map(line => `<p>${line}</p>`).join("")}</div>`;
    }

    // Convert to Markdown
    const markdown = turndownService.turndown(contentToConvert);

    if (markdown.length < 50) {
      throw new Error("Extracted content is too short to be useful.");
    }

    console.log(`[InternalScraper] Successfully scraped: ${extractedTitle} (${markdown.length} chars)`);

    return {
      success: true,
      data: {
        markdown,
        html: contentToConvert,
        metadata: {
          title: extractedTitle,
          description: extractedDescription,
          language: "tr",
          sourceURL: url,
        }
      }
    };
  } catch (error) {
    console.error(`[InternalScraper] Error scraping ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown scraping error",
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Tek sayfa scrape
export async function scrapePage(url: string) {
  // Önce dahili tarayıcıyı dene
  const internalResult = await internalScrape(url);
  if (internalResult.success) {
    return internalResult.data;
  }

  // Hata durumunda Firecrawl'a dön (B Planı)
  console.log(`[Crawler] Internal scrape failed, falling back to Firecrawl for: ${url}`);
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

// Text chunk'larına böl (Recursive Character Splitting)
function chunkText(text: string, maxTokens: number, overlap: number): string[] {
  const maxChars = maxTokens * 4;
  const overlapChars = overlap * 4;
  
  const chunks: string[] = [];
  const separators = ["\n\n", "\n", ". ", " ", ""];
  
  function split(content: string, depth: number): string[] {
    if (content.length <= maxChars) return [content];
    
    const separator = separators[depth] ?? "";
    const parts = content.split(separator);
    const result: string[] = [];
    let currentChunk = "";
    
    for (const part of parts) {
      if ((currentChunk + separator + part).length <= maxChars) {
        currentChunk += (currentChunk ? separator : "") + part;
      } else {
        if (currentChunk) result.push(currentChunk);
        
        if (part.length > maxChars) {
          // If a single part is too long, go deeper or hard split
          if (depth < separators.length - 1) {
            result.push(...split(part, depth + 1));
          } else {
            result.push(part.slice(0, maxChars));
          }
        } else {
          currentChunk = part;
        }
      }
    }
    
    if (currentChunk) result.push(currentChunk);
    
    // Process overlaps
    const overlappedResults: string[] = [];
    for (let i = 0; i < result.length; i++) {
        let chunk = result[i];
        if (i > 0 && overlapChars > 0) {
            const prev = result[i-1];
            const overlapPart = prev.slice(-overlapChars);
            chunk = overlapPart + chunk;
        }
        overlappedResults.push(chunk);
    }
    
    return overlappedResults;
  }

  return split(text, 0);
}

/**
 * Update Chatbot status based on its data sources
 */
export async function updateChatbotStatus(chatbotId: string) {
  const chatbot = await prisma.chatbot.findUnique({
    where: { id: chatbotId },
    include: { dataSources: true }
  });

  if (!chatbot) return;

  const allCompleted = chatbot.dataSources.every(ds => ds.status === "COMPLETED");
  const anyError = chatbot.dataSources.some(ds => ds.status === "ERROR");

  let newStatus = chatbot.status;
  if (allCompleted) newStatus = "ACTIVE";
  else if (anyError) newStatus = "ERROR";
  else if (chatbot.dataSources.length > 0) newStatus = "TRAINING";

  if (newStatus !== chatbot.status) {
    await prisma.chatbot.update({
      where: { id: chatbotId },
      data: { status: newStatus }
    });
  }
}

/**
 * Link discovery helper using Playwright
 */
async function discoverLinks(url: string, baseUrl: string): Promise<string[]> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });

    const links = await page.evaluate((base) => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter((href) => {
          try {
            const u = new URL(href);
            return u.origin === base && !href.includes("#") && !href.includes("?");
          } catch {
            return false;
          }
        });
    }, baseUrl);

    return Array.from(new Set(links));
  } catch (error) {
    console.error(`[LinkDiscovery] Error on ${url}:`, error);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Fallback to original Firecrawl logic
 */
async function crawlWithFirecrawl({
  url,
  maxDepth,
  limit,
  chatbotId,
  dataSourceId,
}: {
  url: string;
  maxDepth: number;
  limit: number;
  chatbotId: string;
  dataSourceId: string;
}) {
  const crawlResponse = await firecrawl.crawlUrl(url, {
    limit,
    scrapeOptions: {
      formats: ["markdown", "html"],
      onlyMainContent: true,
    },
    maxDepth,
  });

  if (!crawlResponse.success) {
    throw new Error(crawlResponse.error || "Firecrawl fallback failed");
  }

  const pages = (crawlResponse as any).data || [];
  // Rest of processing logic is handled by calling this from main crawl function
  // Actually we need to return pages to be processed
  return pages; 
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
        fileSize: content.length,
        lastCrawledAt: new Date(),
      },
    });

    await updateChatbotStatus(chatbotId);

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
