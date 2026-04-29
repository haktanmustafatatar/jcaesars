import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const chatbots = await prisma.chatbot.findMany({
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { conversations: true, dataSources: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(chatbots);
  } catch (error) {
    console.error("[AdminChatbotsAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { chatbotId } = await req.json();
    await prisma.chatbot.delete({ where: { id: chatbotId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to purge neural node" }, { status: 500 });
  }
}
