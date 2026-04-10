import { Worker } from "bullmq";
import IORedis from "ioredis";
import { crawlWebsite, scrapePage, processDocument } from "@/lib/crawler";
import { prisma } from "@/lib/prisma";

const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Crawl Worker
export const crawlWorker = new Worker(
  "crawl",
  async (job) => {
    const { type, chatbotId, dataSourceId, userId } = job.data;

    console.log(`[CrawlWorker] Processing job ${job.id} - ${type}`);

    try {
      // Data source'u processing durumuna getir
      await prisma.dataSource.update({
        where: { id: dataSourceId },
        data: { status: "CRAWLING", crawlStatus: "In progress..." },
      });

      let result;

      switch (type) {
        case "crawl-website":
          result = await crawlWebsite({
            url: job.data.url,
            maxDepth: job.data.maxDepth || 3,
            limit: job.data.limit || 100,
            chatbotId,
            dataSourceId,
          });
          break;

        case "crawl-page":
          const pageData = await scrapePage(job.data.url);
          // Tek sayfa için document oluştur
          result = { success: true, page: pageData };
          break;

        case "process-document":
          result = await processDocument({
            fileUrl: job.data.fileUrl,
            fileType: job.data.fileType,
            chatbotId,
            dataSourceId,
          });
          break;

        default:
          throw new Error(`Unknown crawl type: ${type}`);
      }

      // Chatbot'u active durumuna getir
      await prisma.chatbot.update({
        where: { id: chatbotId },
        data: { status: "ACTIVE" },
      });

      console.log(`[CrawlWorker] Job ${job.id} completed successfully`);

      return result;
    } catch (error) {
      console.error(`[CrawlWorker] Job ${job.id} failed:`, error);

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
  },
  {
    connection: redisConnection,
    concurrency: 1, // Aynı anda 1 crawl işlemi (stabilite için)
    lockDuration: 300000, // 5 dakika (Playwright için yeterli süre)
  }
);

// Event listeners
crawlWorker.on("completed", (job) => {
  console.log(`[CrawlWorker] Job ${job.id} completed`);
});

crawlWorker.on("failed", (job, err) => {
  console.error(`[CrawlWorker] Job ${job?.id} failed:`, err.message);
});

crawlWorker.on("progress", (job, progress) => {
  console.log(`[CrawlWorker] Job ${job.id} progress: ${progress}%`);
});

console.log("[CrawlWorker] Started");
