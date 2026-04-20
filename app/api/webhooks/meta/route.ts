import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import IORedis from "ioredis";
import { Queue } from "bullmq";

const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const channelQueue = new Queue("channel", { connection: redisConnection });

/**
 * GET: Webhook Verification for Meta
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN || "jcaesar_v_token";

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST: Handle Inbound Messages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Determine the source (WhatsApp or Messenger/Instagram)
    const entry = body.entry?.[0];
    if (!entry) return NextResponse.json({ ok: true });

    // --- WHATSAPP LOGIC ---
    if (body.object === "whatsapp_business_account") {
      const change = entry.changes?.[0]?.value;
      const message = change?.messages?.[0];
      const metadata = change?.metadata;

      if (message && message.type === "text" && metadata) {
        const from = message.from; // Sender phone number
        const text = message.text.body;
        const phoneNumberId = metadata.phone_number_id;

        // Find the channel and chatbot
        const channel = await prisma.channel.findFirst({
          where: { 
            type: "WHATSAPP", 
            phoneNumberId: phoneNumberId,
            status: "CONNECTED"
          }
        });

        if (channel) {
          await enqueueInboundMessage({
            chatbotId: channel.chatbotId,
            channel: "whatsapp",
            senderId: from,
            message: text,
            platformMetadata: { message_id: message.id }
          });
        }
      }
    } 
    
    // --- MESSENGER / INSTAGRAM LOGIC ---
    else if (body.object === "page" || body.object === "instagram") {
      const messaging = entry.messaging?.[0];
      if (messaging && messaging.message && !messaging.message.is_echo) {
        const platform = body.object === "instagram" ? "instagram" : "facebook";
        const senderId = messaging.sender.id;
        const receiverId = messaging.recipient.id;
        const text = messaging.message.text;

        // For FB/IG, we match by receiverId (Page ID or IG Business ID)
        // We store this in config or a dedicated field. Let's check config first.
        const channel = await prisma.channel.findFirst({
          where: { 
            type: body.object.toUpperCase() as any,
            status: "CONNECTED",
            // For now matching via a custom logic or known receiver mapping
          }
        });

        if (channel) {
          await enqueueInboundMessage({
            chatbotId: channel.chatbotId,
            channel: platform,
            senderId: senderId,
            message: text,
            platformMetadata: { mid: messaging.message.mid }
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[MetaWebhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Helper to queue message for AI processing
 */
async function enqueueInboundMessage({
  chatbotId,
  channel,
  senderId,
  message,
  platformMetadata
}: {
  chatbotId: string;
  channel: string;
  senderId: string;
  message: string;
  platformMetadata: any;
}) {
  // We add a job to the 'channel' queue with type 'inbound'
  // The channel-worker will pick this up, run RAG, and call the Meta API to reply.
  await channelQueue.add("process-inbound", {
    type: "inbound",
    chatbotId,
    channel,
    recipientId: senderId, // For inbound, recipient of OUR reply is the SENDER of the webhook
    message,
    platformMetadata
  });
}
