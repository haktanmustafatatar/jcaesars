import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { addCrawlJob } from "@/lib/queue";

// POST /api/knowledge - Create new knowledge source
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatbotId, type, name, url, fileUrl, content } = await req.json();

    if (!chatbotId || !type || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      select: { userId: true }
    });

    if (!chatbot || chatbot.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const source = await prisma.knowledgeSource.create({
      data: {
        chatbotId,
        type,
        name,
        url,
        fileUrl,
        content,
        status: "PENDING"
      }
    });

    // If it's a website or file, queue a job
    if (type === "WEBSITE" && url) {
      await addCrawlJob({
        type: "crawl-website",
        url,
        chatbotId,
        knowledgeSourceId: source.id,
        userId
      });
    } else if (type === "FILE" && fileUrl) {
      await addCrawlJob({
        type: "process-document",
        fileUrl,
        fileType: "application/pdf", // Default for now
        chatbotId,
        knowledgeSourceId: source.id,
        userId
      });
    } else if (type === "TEXT" && content) {
      // For pure text, we can process immediately
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: "COMPLETED" }
      });
    }

    return NextResponse.json(source);
  } catch (error) {
    console.error("[KnowledgeAPI] POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/knowledge - Get all sources for a chatbot
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get("chatbotId");

    if (!chatbotId) return NextResponse.json({ error: "chatbotId required" }, { status: 400 });

    const sources = await prisma.knowledgeSource.findMany({
      where: { chatbotId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(sources);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
