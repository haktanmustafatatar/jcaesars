import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseMessengerMessage, sendInstagramMessage, verifyMetaWebhook } from "@/lib/channels/meta";
import { createEmbedding, generateRAGResponse, logTokenUsage, LLMModel } from "@/lib/ai";

// Meta Webhook Verification (Handshake)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN || "jcaesar_verify_token";
  const result = verifyMetaWebhook(mode, token, challenge, verifyToken);

  if (result) {
    return new NextResponse(result, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Meta Webhook Message Handling (Instagram DM)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Parse incoming message (Instagram DMs share Messenger structure)
    const parsed = parseMessengerMessage(body);
    if (!parsed) {
      return NextResponse.json({ ok: true });
    }

    const { senderId, text, pageId } = parsed;

    // 2. Find associated Channel & Chatbot
    const channel = await prisma.channel.findFirst({
      where: {
        type: "INSTAGRAM",
        status: "CONNECTED",
        OR: [
          { phoneNumberId: pageId },
          { config: { path: ["pageId"], equals: pageId } }
        ]
      },
      include: {
        chatbot: {
          include: {
            dataSources: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
    });

    if (!channel || !channel.chatbot) {
      console.error(`No connected Instagram channel found for Page ID: ${pageId}`);
      return NextResponse.json({ ok: true });
    }

    const chatbot = channel.chatbot;
    const chatbotId = chatbot.id;

    // 3. Find or Create Conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        chatbotId,
        channel: "instagram",
        channelUserId: senderId,
        status: "ACTIVE",
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId,
          channel: "instagram",
          channelUserId: senderId,
          status: "ACTIVE",
        },
      });
    }

    // 4. Save User Message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: text,
      },
    });

    // 5. RAG: Generate AI Response
    const embedding = await createEmbedding(text);
    const vectorString = `[${embedding.join(",")}]`;

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

    // Get message history (last 5)
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const formattedHistory = history
      .reverse()
      .map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant" | "system",
        content: m.content,
      }));

    const aiResponse = await generateRAGResponse({
      messages: formattedHistory,
      model: (chatbot.model as LLMModel) || "gpt-4o",
      systemPrompt: chatbot.systemPrompt,
      context: context || "No specific context found.",
      chatbotId: chatbotId, // Pass ID to enable tools
    });

    const replyText = aiResponse.text;

    // 6. Send Reply via Instagram API
    const config = channel.config as any;
    const accessToken = config.accessToken;

    if (accessToken) {
      await sendInstagramMessage(senderId, replyText, accessToken);
    }

    // 7. Save Assistant Message & Log Usage
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: replyText,
        tokensUsed: aiResponse.usage.totalTokens,
        promptTokens: aiResponse.usage.promptTokens,
        completionTokens: aiResponse.usage.completionTokens,
        model: chatbot.model,
      },
    });

    if (chatbot.userId) {
      await logTokenUsage({
        userId: chatbot.userId,
        chatbotId,
        conversationId: conversation.id,
        model: (chatbot.model as LLMModel) || "gpt-4o",
        promptTokens: aiResponse.usage.promptTokens,
        completionTokens: aiResponse.usage.completionTokens,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Instagram Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
