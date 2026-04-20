
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, sourceId: string }> }
) {
  try {
    const authData = await auth();
    const clerkId = authData.userId;
    
    // Support both promise and sync params for Next.js 15 cross-compatibility
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: chatbotId, sourceId } = resolvedParams;

    console.log(`[API] URL list request for source ${sourceId} by user ${clerkId}`);

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

    const urls = await (prisma as any).dataSourceUrl.findMany({
      where: { dataSourceId: sourceId },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(urls);
  } catch (error: any) {
    console.error("[URL List API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

