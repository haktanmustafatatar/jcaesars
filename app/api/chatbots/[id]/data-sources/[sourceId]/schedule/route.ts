
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, sourceId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    const { id: chatbotId, sourceId } = await params;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schedule } = await req.json(); // "daily", "weekly", "monthly", or null

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

    // 1. Update DB
    await prisma.dataSource.update({
      where: { id: sourceId },
      data: { crawlSchedule: schedule }
    });

    // 2. Manage Queue (BullMQ Repeatable Job)
    const jobKey = `retrain-${sourceId}`;
    
    // Remove existing repeatable jobs for this source
    const repeatableJobs = await queues.crawl.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.key.includes(jobKey)) {
        await queues.crawl.removeRepeatableByKey(job.key);
      }
    }

    // Add new repeatable job if schedule is set
    if (schedule && schedule !== "none") {
      let cron = "0 0 * * *"; // Daily at midnight (Default)
      if (schedule === "weekly") cron = "0 0 * * 0"; // Weekly Sunday at midnight
      if (schedule === "monthly") cron = "0 0 1 * *"; // Monthly 1st at midnight

      await queues.crawl.add(
        `crawl-website-scheduled`,
        {
          type: "crawl-website",
          url: dataSource.url,
          chatbotId,
          dataSourceId: sourceId,
          userId: user.id,
          maxDepth: dataSource.crawlDepth,
          limit: 100,
        },
        {
          repeat: { cron, tz: "Europe/Istanbul" }, // Istanbul time
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 }
        }
      );
    }

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("Error in schedule endpoint:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
