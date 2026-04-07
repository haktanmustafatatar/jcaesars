import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    const chatbot = await prisma.chatbot.findUnique({
      where: { id },
      include: {
        dataSources: {
          select: {
            id: true,
            type: true,
            status: true,
            pagesCount: true,
            crawlStatus: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Count indexed documents
    const documentCount = await prisma.document.count({
      where: {
        dataSource: {
          chatbotId: id,
        },
      },
    });

    return NextResponse.json({
      status: chatbot.status,
      dataSources: chatbot.dataSources,
      documentCount,
      updatedAt: chatbot.updatedAt,
    });
  } catch (error) {
    console.error("[ChatbotStatus API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
