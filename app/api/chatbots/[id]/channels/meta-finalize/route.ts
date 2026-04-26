import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: chatbotId } = await params;
    const { sessionId, selectedId, type } = await req.json();

    // 1. Verify session
    const sessionChannel = await prisma.channel.findUnique({
      where: { id: sessionId }
    });

    if (!sessionChannel || (sessionChannel.config as any).expiresAt < Date.now()) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 400 });
    }

    const config = sessionChannel.config as any;
    let finalConfig: any = {};
    let phoneNumberId = "";
    let channelName = "";

    if (type === "FACEBOOK" || type === "INSTAGRAM") {
      const selectedPage = config.pages.find((p: any) => p.id === selectedId || (p.instagram_business_account && p.instagram_business_account.id === selectedId));
      if (!selectedPage) return NextResponse.json({ error: "Selected account not found" }, { status: 404 });

      if (type === "INSTAGRAM") {
        finalConfig = {
          accessToken: selectedPage.access_token,
          pageId: selectedPage.id,
          instagramId: selectedPage.instagram_business_account.id,
          username: selectedPage.instagram_business_account.username
        };
        phoneNumberId = selectedPage.instagram_business_account.id;
        channelName = `Instagram: ${selectedPage.instagram_business_account.username}`;
      } else {
        finalConfig = {
          accessToken: selectedPage.access_token,
          pageId: selectedPage.id
        };
        phoneNumberId = selectedPage.id;
        channelName = `Facebook: ${selectedPage.name}`;
      }
    } else if (type === "WHATSAPP") {
      const selectedWa = config.whatsappAccounts.find((w: any) => w.id === selectedId);
      if (!selectedWa) return NextResponse.json({ error: "Selected WhatsApp account not found" }, { status: 404 });

      // For WhatsApp, we also need to get the phone number ID.
      // Usually users pick the WABA, then we list phone numbers, but for simplicity let's assume we take the first phone number or the WABA ID for now.
      // Better: Meta Cloud API usually requires the Phone Number ID for messaging.
      
      finalConfig = {
        accessToken: config.userToken,
        wabaId: selectedWa.id
      };
      phoneNumberId = selectedWa.id;
      channelName = `WhatsApp: ${selectedWa.name}`;
    }

    // 2. Create the real channel
    const channel = await prisma.channel.create({
      data: {
        chatbotId,
        type,
        name: channelName,
        status: "CONNECTED",
        phoneNumberId,
        config: finalConfig
      }
    });

    // 3. Delete the temporary session channel
    await prisma.channel.delete({ where: { id: sessionId } });

    return NextResponse.json(channel);
  } catch (error) {
    console.error("[MetaFinalize] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
