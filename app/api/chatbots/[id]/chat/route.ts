import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createEmbedding, streamRAGResponse, logTokenUsage } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    const { id: chatbotId } = params;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const message = lastMessage.content;

    // 1. Get Chatbot & User
    const user = await prisma.user.findUnique({ where: { clerkId } });
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        dataSources: {
          where: { status: "COMPLETED" },
        },
      },
    });

    if (!chatbot || (chatbot.userId !== user?.id)) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // 2. Generate Embedding for User Message
    const embedding = await createEmbedding(message);
    const vectorString = `[${embedding.join(",")}]`;

    // 3. Similarity Search using pgvector
    // We search across all completed data sources for this chatbot
    const dataSourceIds = chatbot.dataSources.map((ds) => ds.id);
    
    let context = "";
    if (dataSourceIds.length > 0) {
      // Correctly formatted query for pgvector with array of IDs
      const documents: any[] = await prisma.$queryRaw`
        SELECT content, title, url, 1 - (embedding <=> ${vectorString}::vector) as similarity
        FROM "Document"
        WHERE "dataSourceId" = ANY(${dataSourceIds})
        ORDER BY similarity DESC
        LIMIT 5
      `;

      context = documents
        .filter((doc) => doc.similarity > 0.5) // Only relevant ones
        .map((doc) => `Source: ${doc.title || doc.url}\nContent: ${doc.content}`)
        .join("\n\n");
    }

    // 4. Stream Response
    const response = await streamRAGResponse({
      messages: messages, // Send full history including last message
      model: (chatbot.model as any) || "gpt-4o",
      systemPrompt: chatbot.systemPrompt,
      context: context || "No specific context found in my knowledge base.",
    });

    // 5. Log usage (async)
    // Create a temporary conversation ID for preview
    const tempConvId = `preview_${chatbotId}`;
    
    // We can't easily get tokens from streamText in the same call without waiting,
    // so we'll let the AI SDK handle it or log an estimate.
    // For now, returning the stream.

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
