import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { addCrawlJob } from "@/lib/queue";

// GET /api/chatbots - List all chatbots for the current user
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

    const chatbots = await prisma.chatbot.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { conversations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chatbots);
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return NextResponse.json(
      { error: "Failed to fetch chatbots" },
      { status: 500 }
    );
  }
}

// POST /api/chatbots - Create a new chatbot
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in our DB (Synced via Clerk Webhook)
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User profile not synced yet. Please wait a moment or sign in again." }, { status: 404 });
    }

    const userId = user.id;

    const body = await req.json();
    const {
      name,
      description,
      model,
      temperature,
      systemPrompt,
      rules,
      constraints,
      welcomeMessage,
      primaryColor,
      avatar,
      language,
      websiteUrl,
      rawText,
      qnaList,
      suggestedMessages,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate unique slug
    const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        slug,
        description,
        model: model || "gpt-4o",
        temperature: temperature || 0.7,
        systemPrompt: systemPrompt || "You are a helpful assistant.",
        welcomeMessage: welcomeMessage || "Hi! How can I help you today?",
        primaryColor: primaryColor || "#e25b31",
        avatar: avatar || null,
        language: language || "en",
        userId,
        status: "TRAINING",
        // Nested creation of DataSources
        dataSources: {
          create: [
            ...(websiteUrl ? [{
              type: "WEBSITE" as any,
              name: "Website Source",
              url: websiteUrl,
              status: "PENDING" as any,
            }] : []),
            ...(rawText ? [{
              type: "TEXT" as any,
              name: "Text Source",
              status: "COMPLETED" as any,
              documents: {
                create: [{
                  content: rawText,
                  title: "Raw Text Source",
                }]
              }
            }] : []),
            ...(qnaList && qnaList.length > 0 ? [{
              type: "QNA" as any,
              name: "Q&A Source",
              status: "COMPLETED" as any,
              documents: {
                create: qnaList.map((qa: any) => ({
                  content: `Question: ${qa.question}\nAnswer: ${qa.answer}`,
                  title: qa.question.substring(0, 50),
                }))
              }
            }] : []),
          ]
        },
        suggestedQuestions: {
          create: (suggestedMessages || []).filter((m: string) => m.trim() !== "").map((m: string, i: number) => ({
            question: m,
            order: i,
          }))
        }
      },
      include: {
        dataSources: true,
      }
    });

    // Fire up the training engine!
    const createdDataSources = (chatbot as any).dataSources;
    if (websiteUrl && createdDataSources && createdDataSources.length > 0) {
      await addCrawlJob({
        type: "crawl-website",
        url: websiteUrl,
        chatbotId: chatbot.id,
        dataSourceId: createdDataSources[0].id,
        userId: userId,
        maxDepth: 3,
        limit: 100,
      });
    }

    return NextResponse.json(chatbot, { status: 201 });
  } catch (error: any) {
    console.error("Error creating chatbot:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create chatbot" },
      { status: 500 }
    );
  }
}
