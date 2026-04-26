import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createEmbedding, streamRAGResponse, logTokenUsage } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatbotId } = await params;
    const { userId: clerkId } = await auth();

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
      // Use a more robust raw query format for PostgreSQL
      const documents: any[] = await prisma.$queryRawUnsafe(`
        SELECT content, title, url, 1 - (embedding <=> $1::vector) as similarity
        FROM "Document"
        WHERE "dataSourceId" IN (${dataSourceIds.map((_, i) => `$${i + 2}`).join(',')})
        ORDER BY similarity DESC
        LIMIT 5
      `, vectorString, ...dataSourceIds);

      context = documents
        .filter((doc) => doc.similarity > 0.4) // Lowered threshold slightly for better recall
        .map((doc) => `Source: ${doc.title || doc.url}\nContent: ${doc.content}`)
        .join("\n\n");
    }

    // 4. Stream Response & Log Usage
    const response = await streamRAGResponse({
      messages: messages,
      model: (chatbot.model as LLMModel) || "gpt-4o",
      systemPrompt: chatbot.systemPrompt,
      context: context || "No specific context found.",
      onFinish: async ({ text, usage }) => {
        // Log Token Usage for Billing/Analytics
        await logTokenUsage({
          userId: chatbot.userId,
          chatbotId: chatbot.id,
          conversationId: `preview_${chatbot.id}`,
          model: (chatbot.model as LLMModel) || "gpt-4o",
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
        });
      }
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
