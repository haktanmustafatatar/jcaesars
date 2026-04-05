import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createEmbedding, streamRAGResponse, logTokenUsage } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: chatbotId } = params;
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const message = lastMessage.content;

    // 1. Get Chatbot
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        dataSources: {
          where: { status: "COMPLETED" },
        },
      },
    });

    if (!chatbot || chatbot.status !== "ACTIVE") {
      return NextResponse.json({ error: "Chatbot not active or not found" }, { status: 404 });
    }

    // 2. Generate Embedding for User Message
    const embedding = await createEmbedding(message);
    const vectorString = `[${embedding.join(",")}]`;

    // 3. Similarity Search using pgvector
    const dataSourceIds = chatbot.dataSources.map((ds) => ds.id);
    
    let context = "";
    if (dataSourceIds.length > 0) {
      const documents: any[] = await prisma.$queryRaw`
        SELECT content, title, url, 1 - (embedding <=> ${vectorString}::vector) as similarity
        FROM "Document"
        WHERE "dataSourceId" = ANY(${dataSourceIds})
        ORDER BY similarity DESC
        LIMIT 5
      `;

      context = documents
        .filter((doc) => doc.similarity > 0.5)
        .map((doc) => `Source: ${doc.title || doc.url}\nContent: ${doc.content}`)
        .join("\n\n");
    }

    // 4. Stream Response
    const response = await streamRAGResponse({
      messages: messages,
      model: (chatbot.model as any) || "gpt-4o",
      systemPrompt: chatbot.systemPrompt,
      context: context || "No specific context found.",
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("Widget Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
