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

// Lazy initialization for Firecrawl to avoid build-time crashes
let _firecrawl: FirecrawlApp | null = null;
function getFirecrawl() {
  if (!_firecrawl) {
    _firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY || "fc-dummy-key-for-build",
    });
  }
  return _firecrawl;
}

// --- HELPER WRAPPERS AND UTILITIES ---

/**
 * Detect platform (Shopify, WooCommerce, etc)
 */
async function detectPlatform(baseUrl: string) {
  try {
    const response = await fetch(baseUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
    });
    const html = await response.text();
    const headers = response.headers;

    if (html.includes('cdn.shopify.com') || html.includes('Shopify.shop') || html.includes('myshopify.com')) {
      return "SHOPIFY";
    }
    if (html.includes('wp-content/plugins/woocommerce')) {
      return "WOOCOMMERCE";
    }
    return "CUSTOM";
  } catch (err) {
    console.error(`[Detector] Failed to detect platform for ${baseUrl}:`, err);
    return "CUSTOM";
  }
}

/**
 * Enhanced Sitemap Discovery
 */
export async function discoverSitemaps(baseUrl: string): Promise<string[]> {
  const sitemaps = new Set<string>();
  
  try {
    // 1. Check robots.txt
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    if (robotsRes.ok) {
      const text = await robotsRes.text();
      const matches = text.matchAll(/^Sitemap:\s*(.*)$/gim);
      for (const match of matches) {
        if (match[1]) sitemaps.add(match[1].trim());
      }
    }
    
    // 2. Common paths if robots.txt didn't help
    if (sitemaps.size === 0) {
      const commonPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-products.xml'];
      for (const path of commonPaths) {
        const res = await fetch(`${baseUrl}${path}`, { method: 'HEAD' });
        if (res.ok) sitemaps.add(`${baseUrl}${path}`);
      }
    }
  } catch (err) {
    console.warn(`[SitemapDiscovery] Error discovering sitemaps for ${baseUrl}:`, err);
  }

  return Array.from(sitemaps);
}

/**
 * Shopify Products API Scraper
 */
async function scrapeShopifyProducts(baseUrl: string, limit = 100) {
  try {
    const productsUrl = `${baseUrl}/products.json?limit=${limit}`;
    console.log(`[ShopifyScraper] Fetching products from ${productsUrl}`);
    
    const response = await fetch(productsUrl);
    if (!response.ok) throw new Error(`Shopify API responded with ${response.status}`);
    
    const data = await response.json();
    const products = data.products || [];
    
    return products.map((p: any) => {
      // Create a markdown summary of the product
      let markdown = `# ${p.title}\n\n`;
      if (p.body_html) {
          // Shopify bodies are usually HTML
          markdown += turndownService.turndown(p.body_html);
      }
      
      // Variants & Pricing
      const variants = p.variants || [];
      if (variants.length > 0) {
        markdown += `\n\n### Options & Pricing\n`;
        variants.forEach((v: any) => {
          markdown += `- **${v.title}**: ${v.price} (SKU: ${v.sku || 'N/A'})\n`;
        });
      }

      return {
        markdown,
        html: p.body_html || p.title,
        metadata: {
          title: p.title,
          sourceURL: `${baseUrl}/products/${p.handle}`,
          price: variants[0]?.price,
          sku: variants[0]?.sku,
          handle: p.handle,
          images: p.images?.map((img: any) => img.src) || [],
          platform: "SHOPIFY",
          type: "PRODUCT"
        }
      };
    });
  } catch (err) {
    console.error(`[ShopifyScraper] Failed:`, err);
    return [];
  }
}

/**
 * Extract Structured Data (JSON-LD)
 */
function extractStructuredData(html: string) {
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]');
  let result: any = {};

  scripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent || "{}");
      
      // Look for Product info
      const findProduct = (obj: any): any => {
        if (obj?.["@type"] === "Product" || obj?.type === "Product") return obj;
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const res = findProduct(item);
            if (res) return res;
          }
        }
        if (typeof obj === 'object' && obj !== null) {
          if (obj["@graph"] && Array.isArray(obj["@graph"])) return findProduct(obj["@graph"]);
          for (const k in obj) {
            const res = findProduct(obj[k]);
            if (res) return res;
          }
        }
        return null;
      };

      const product = findProduct(data);
      if (product) {
        result = {
          ...result,
          title: product.name || result.title,
          description: product.description || result.description,
          sku: product.sku || product.mpn || result.sku,
          brand: product.brand?.name || product.brand || result.brand,
          price: product.offers?.price || product.offers?.[0]?.price || result.price,
          currency: product.offers?.priceCurrency || product.offers?.[0]?.priceCurrency || result.currency,
          availability: product.offers?.availability || product.offers?.[0]?.availability || result.availability
        };
      }
    } catch {}
  });

  // Fallback: Check for meta tags
  if (!result.price) {
    const ogPrice = dom.window.document.querySelector('meta[property="product:price:amount"]')?.getAttribute('content');
    const ogCurrency = dom.window.document.querySelector('meta[property="product:price:currency"]')?.getAttribute('content');
    if (ogPrice) {
      result.price = ogPrice;
      result.currency = ogCurrency;
    }
  }

  // Fallback 2: Aggressive CSS selection for common price patterns
  if (!result.price) {
    const priceSelectors = [
      '.price', '.product-price', '#price', '[itemprop="price"]', 
      '.current-price', '.amount', '.money', '.Price'
    ];
    for (const selector of priceSelectors) {
      const el = dom.window.document.querySelector(selector);
      if (el && el.textContent) {
        const text = el.textContent.trim();
        // Regex for price: optionally currency, then numbers with . or ,
        const priceMatch = text.match(/([0-9.,]+)/);
        if (priceMatch) {
          result.price = priceMatch[1];
          // Try to guess currency
          if (text.includes('$')) result.currency = 'USD';
          else if (text.includes('€')) result.currency = 'EUR';
          else if (text.includes('₺') || text.includes('TL')) result.currency = 'TRY';
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Lightweight Scraper (No Browser)
 */
async function lightweightScrape(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);

    const html = await response.text();
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
        throw new Error(`Invalid content type: ${contentType}`);
    }

    // 1. Extract Structured Data
    const structuredData = extractStructuredData(html);

    // 2. Extract Main Content via Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || (!article.content && !structuredData.title)) {
      throw new Error("Page seems to be empty or requires JavaScript");
    }

    // 3. Convert to Markdown
    let contentToConvert = article?.content || `<div>${structuredData.description || ''}</div>`;
    let markdown = turndownService.turndown(contentToConvert);

    // 4. Enrich markdown with structured data if it's a product
    if (structuredData.price) {
      markdown = `## Product Details\n- **Price**: ${structuredData.price} ${structuredData.currency || ''}\n- **SKU**: ${structuredData.sku || 'N/A'}\n- **Brand**: ${structuredData.brand || 'N/A'}\n\n${markdown}`;
    }

    return {
      success: true,
      data: {
        markdown,
        html: contentToConvert,
        metadata: {
          title: structuredData.title || article?.title || "Untitled",
          description: structuredData.description || article?.excerpt || "",
          sourceURL: url,
          price: structuredData.price,
          currency: structuredData.currency,
          sku: structuredData.sku,
          isLightweight: true
        }
      }
    };
  } catch (err) {
    console.warn(`[LightweightScrape] Failed for ${url}:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Fetch failed" };
  }
}

// Website crawling
// Website crawling
export async function crawlWebsite({
  url,
  maxDepth = 5,
  limit = 500,
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
    // Normalize URL - handle cases where user might have added extra protocol or spaces
    url = url.trim();
    if (url.startsWith('https://')) {
      // Do nothing
    } else if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    } else {
      url = `https://${url}`;
    }
    
    // Remove potential double slashes after protocol
    url = url.replace(/https:\/\/(https:\/\/|http:\/\/)+/g, 'https://');
    
    // 1. Detect Platform & Sitemaps
    const baseUrl = new URL(url).origin;
    const platform = await detectPlatform(baseUrl);
    console.log(`[Crawler] Platform detected: ${platform}`);

    // Discover Sitemaps
    const sitemaps = await discoverSitemaps(baseUrl);
    console.log(`[Crawler] Found ${sitemaps.length} sitemaps`);

    const pages: any[] = [];
    const visited = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url, depth: 0 }];

    if (sitemaps.length > 0) {
      for (const sitemap of sitemaps) {
        const sitemapUrls = await getSitemapUrls(sitemap);
        console.log(`[Crawler] Extracted ${sitemapUrls.length} URLs from sitemap ${sitemap}`);
        for (const sUrl of sitemapUrls) {
          if (!visited.has(sUrl)) {
            queue.push({ url: sUrl, depth: 1 }); // Sitemaps are depth 0 or 1
          }
        }
      }
    }

    // Shopify Specific: Scrape products via API immediately (much faster)
    if (platform === "SHOPIFY") {
      console.log(`[Crawler] Shopify detected. Utilizing Products API for faster indexing.`);
      const shopifyPages = await scrapeShopifyProducts(baseUrl, limit);
      pages.push(...shopifyPages);
      
      // If we got enough products, we might not need a deep crawl, 
      // but let's continue for other pages (about, contact, etc.)
      for (const p of shopifyPages) {
        visited.add(p.metadata.sourceURL);
        // Also add to DataSourceUrl so it shows in the UI
        await prisma.dataSourceUrl.upsert({
          where: { dataSourceId_url: { dataSourceId, url: p.metadata.sourceURL } },
          update: { status: "COMPLETED", lastCrawledAt: new Date(), charCount: p.markdown.length, title: p.metadata.title },
          create: { dataSourceId, url: p.metadata.sourceURL, status: "COMPLETED", lastCrawledAt: new Date(), charCount: p.markdown.length, title: p.metadata.title }
        });
      }
    }

    let browser: any;
    try {
      // --- BATCH PARALLEL CRAWLING ---
      const CONCURRENCY = 8; // Higher concurrency allowed for lightweight
      
      while (queue.length > 0 && pages.length < limit) {
        // Get next batch of URLs
        const batch = [];
        while (queue.length > 0 && batch.length < CONCURRENCY && (pages.length + batch.length) < limit) {
          const item = queue.shift()!;
          if (!visited.has(item.url)) {
            visited.add(item.url);
            batch.push(item);
          }
        }

        if (batch.length === 0) continue;

        console.log(`[Crawler] Processing batch of ${batch.length} pages. Total indexed so far: ${pages.length}`);

        // Process batch in parallel
        await Promise.all(batch.map(async ({ url: currentUrl, depth }) => {
          try {
            // STEP 1: Try Lightweight Scrape (HTTP Fetch + JSDOM)
            const lightResult = await lightweightScrape(currentUrl);
            
            if (lightResult.success && lightResult.data) {
              pages.push(lightResult.data);
              
              // Mark as COMPLETED with metadata
              const charCount = lightResult.data.markdown.length;
              const title = lightResult.data.metadata.title;

              try {
                await prisma.dataSourceUrl.upsert({
                  where: { dataSourceId_url: { dataSourceId, url: currentUrl } },
                  update: { 
                    status: "COMPLETED", 
                    lastCrawledAt: new Date(),
                    charCount,
                    title
                  },
                  create: { 
                    dataSourceId, 
                    url: currentUrl, 
                    status: "COMPLETED", 
                    lastCrawledAt: new Date(),
                    charCount,
                    title
                  }
                });
              } catch (upsertErr) {
                console.error(`[Crawler] Upsert failed for ${currentUrl}:`, upsertErr);
              }

              // Discover links from lightweight if depth permits
              if (depth < maxDepth) { 
                const dom = new JSDOM(lightResult.data.html, { url: currentUrl });
                const links = Array.from(dom.window.document.querySelectorAll("a"))
                  .map(a => (a as HTMLAnchorElement).href)
                  .filter(href => {
                    try {
                      const u = new URL(href, currentUrl);
                      // Skip assets and external links
                      const isInternal = u.origin === baseUrl;
                      const isNotAsset = !/\.(png|jpg|jpeg|gif|pdf|zip|css|js|svg)$/i.test(u.pathname);
                      return isInternal && isNotAsset && !href.includes("#");
                    } catch { return false; }
                  });

                for (const link of Array.from(new Set(links))) {
                  // Normalize and clean link
                  const cleanLink = link.split('#')[0].split('?')[0].replace(/\/$/, "");
                  if (!visited.has(cleanLink) && queue.length < (limit * 2)) {
                    queue.push({ url: cleanLink, depth: depth + 1 });
                  }
                }
              }
              return;
            }

            // STEP 2: Fallback to Playwright (Browser)
            console.log(`[Crawler] Lightweight failed for ${currentUrl}. Falling back to Playwright...`);
            
            if (!browser) {
              browser = await chromium.launch({ headless: true });
            }
            const context = await browser.newContext({
              userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            });
            const pageInstance = await context.newPage();
            pageInstance.setDefaultTimeout(60000);

            await pageInstance.goto(currentUrl, { waitUntil: "networkidle" });
            const html = await pageInstance.content();
            const pageTitle = await pageInstance.title();

            // Use the same structured data extraction logic
            const structuredData = extractStructuredData(html);
            const dom = new JSDOM(html, { url: currentUrl });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();

            if (article && article.content) {
              let markdown = turndownService.turndown(article.content);
              if (structuredData.price) {
                markdown = `## Product Details\n- **Price**: ${structuredData.price} ${structuredData.currency || ''}\n- **SKU**: ${structuredData.sku || 'N/A'}\n\n${markdown}`;
              }

              pages.push({
                markdown,
                html: article.content,
                metadata: {
                  title: structuredData.title || article.title || pageTitle,
                  description: structuredData.description || article.excerpt,
                  sourceURL: currentUrl,
                  price: structuredData.price,
                  currency: structuredData.currency,
                  sku: structuredData.sku
                }
              });

              await prisma.dataSourceUrl.upsert({
                where: { dataSourceId_url: { dataSourceId, url: currentUrl } },
                update: { 
                  status: "COMPLETED", 
                  lastCrawledAt: new Date(),
                  charCount: markdown.length,
                  title: structuredData.title || article.title || pageTitle
                },
                create: { 
                  dataSourceId, 
                  url: currentUrl, 
                  status: "COMPLETED", 
                  lastCrawledAt: new Date(),
                  charCount: markdown.length,
                  title: structuredData.title || article.title || pageTitle
                },
              });
            }
            await pageInstance.close();
          } catch (err) {
            console.error(`[Crawler] Failed to scrape ${currentUrl}:`, err);
            await prisma.dataSourceUrl.upsert({
              where: { dataSourceId_url: { dataSourceId, url: currentUrl } },
              update: { status: "ERROR", errorMessage: err instanceof Error ? err.message : "Scrape failed" },
              create: { dataSourceId, url: currentUrl, status: "ERROR", errorMessage: err instanceof Error ? err.message : "Scrape failed" }
            });
          }
        }));
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
    page.setDefaultTimeout(60000);

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

export async function scrapePage(url: string) {
  // Sadece dahili tarayıcıyı (Open Source Playwright) kullan
  const internalResult = await internalScrape(url);
  if (internalResult.success) {
    return internalResult.data;
  }

  // Hata durumunda doğrudan fırlat
  console.error(`[Crawler] Internal scrape failed for: ${url}`, internalResult.error);
  throw new Error(internalResult.error || "Scrape failed using internal engine");
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
  
  // Early Activation: If we have at least 10 documents indexed across all sources, consider it ACTIVE
  const documentCount = await prisma.document.count({
    where: { dataSource: { chatbotId } }
  });
  const reachedThreshold = documentCount >= 10;

  let newStatus = chatbot.status;
  if (allCompleted || reachedThreshold) newStatus = "ACTIVE";
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
  const crawlResponse = await getFirecrawl().crawlUrl(url, {
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
      const scrapeResult = await getFirecrawl().scrapeUrl(fileUrl, {
        formats: ["markdown"],
      });
      content = ((scrapeResult as any).data as any)?.markdown || "";
    } else {
      // Diğer dosyalar - Firecrawl dene
      const scrapeResult = await getFirecrawl().scrapeUrl(fileUrl, {
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
