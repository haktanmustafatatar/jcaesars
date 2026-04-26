import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // Get all chatbots for the user or their organization
    const chatbots = await prisma.chatbot.findMany({
      where: { 
        OR: [
          { userId: user.id },
          { organizationId: user.organizationId }
        ]
      },
      select: { id: true }
    });

    const chatbotIds = chatbots.map(c => c.id);

    // Get all conversations for those chatbots
    const conversations = await prisma.conversation.findMany({
      where: { 
        chatbotId: { in: chatbotIds }
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        user: true,
        chatbot: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
