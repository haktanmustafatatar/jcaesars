import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/embed/:chatbotId/config - Get chatbot configuration for embed
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const { chatbotId } = await params;
    const chatbot = await prisma.chatbot.findUnique({
      where: { slug: chatbotId },
      select: {
        id: true,
        name: true,
        welcomeMessage: true,
        primaryColor: true,
        position: true,
        showBranding: true,
        status: true,
        isPublic: true,
      },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found" },
        { status: 404 }
      );
    }

    if (!chatbot.isPublic || chatbot.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Chatbot is not available" },
        { status: 403 }
      );
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error("Error fetching chatbot config:", error);
    return NextResponse.json(
      { error: "Failed to fetch chatbot config" },
      { status: 500 }
    );
  }
}

// POST /api/embed/:chatbotId/chat - Send a message to the chatbot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const { chatbotId } = await params;
    const { message, conversationId } = await req.json();

    const chatbot = await prisma.chatbot.findUnique({
      where: { slug: chatbotId },
    });

    if (!chatbot || !chatbot.isPublic || chatbot.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Chatbot not available" },
        { status: 403 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId: chatbot.id,
          channel: "widget",
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: message,
      },
    });

    // TODO: Call AI service to generate response
    // For now, return a mock response
    const response =
      "Thanks for your message! This is a demo response. In production, this would be powered by your trained AI model.";

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: response,
        model: chatbot.model,
      },
    });

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
