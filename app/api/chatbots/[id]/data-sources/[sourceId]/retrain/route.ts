
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { addCrawlJob } from "@/lib/queue";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, sourceId: string }> }
) {
  try {
    const authData = await auth();
    const clerkId = authData.userId;
    
    // Support both promise and sync params for Next.js 15 cross-compatibility
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: chatbotId, sourceId } = resolvedParams;

    console.log(`[API] Retrain request for source ${sourceId} by user ${clerkId}`);

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dataSource = await prisma.dataSource.findUnique({
      where: { id: sourceId },
      include: { chatbot: true }
    });

    if (!dataSource || dataSource.chatbotId !== chatbotId || dataSource.chatbot.userId !== user.id) {
      return NextResponse.json({ error: "Data source not found or access denied" }, { status: 404 });
    }

    // 1. Purge existing data (Clean slate)
    await prisma.$transaction([
      prisma.document.deleteMany({ where: { dataSourceId: sourceId } }),
      prisma.dataSourceUrl.deleteMany({ where: { dataSourceId: sourceId } }),
      prisma.dataSource.update({
        where: { id: sourceId },
        data: { 
          status: "PENDING", 
          crawlStatus: "Restarting...",
          pagesCount: 0,
          fileSize: 0 
        }
      })
    ]);

    // 2. Trigger new crawl job
    if (dataSource.type === "WEBSITE" && dataSource.url) {
      // Normalize URL
      let crawlUrl = dataSource.url;
      if (!crawlUrl.startsWith('http://') && !crawlUrl.startsWith('https://')) {
        crawlUrl = `https://${crawlUrl}`;
      }
      await addCrawlJob({
        type: "crawl-website",
        url: crawlUrl,
        chatbotId,
        dataSourceId: sourceId,
        userId: user.id,
        maxDepth: dataSource.crawlDepth,
        limit: 100, // Varsayılan limit
      });
    } else if (dataSource.type === "FILE" && dataSource.fileUrl) {
      await addCrawlJob({
        type: "process-document",
        fileUrl: dataSource.fileUrl,
        fileType: dataSource.fileType || "application/pdf",
        chatbotId,
        dataSourceId: sourceId,
        userId: user.id,
      });
    }

    return NextResponse.json({ success: true, message: "Retraining started" });
  } catch (error: any) {
    console.error("[Retrain API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

