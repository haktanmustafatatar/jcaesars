import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@/lib/prisma";
import { performRAGSearch, generateRAGResponse } from "@/lib/ai";

const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on("error", (err) => {
  console.warn("[Redis/ChannelWorker] Connection error (expected during build):", err.message);
});

// Meta (WhatsApp, Instagram, Facebook) API
async function sendMetaMessage({
  channel,
  recipientId,
  message,
  accessToken,
}: {
  channel: "whatsapp" | "instagram" | "facebook";
  recipientId: string;
  message: string;
  accessToken: string;
}) {
  let url: string;
  let payload: any;

  if (channel === "whatsapp") {
    // WhatsApp Cloud API
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientId,
      type: "text",
      text: { body: message },
    };
  } else if (channel === "instagram") {
    // Instagram Graph API
    url = `https://graph.facebook.com/v18.0/me/messages`;
    payload = {
      recipient: { id: recipientId },
      message: { text: message },
    };
  } else {
    // Facebook Messenger
    url = `https://graph.facebook.com/v18.0/me/messages`;
    payload = {
      recipient: { id: recipientId },
      message: { text: message },
    };
  }

  const response = await fetch(`${url}?access_token=${accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Meta API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Telegram Bot API
async function sendTelegramMessage({
  chatId,
  message,
  botToken,
}: {
  chatId: string;
  message: string;
  botToken: string;
}) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Slack API
async function sendSlackMessage({
  channel,
  message,
  botToken,
}: {
  channel: string;
  message: string;
  botToken: string;
}) {
  const url = "https://slack.com/api/chat.postMessage";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify({
      channel,
      text: message,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
}

// Email (SendGrid)
async function sendEmailMessage({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) {
  // TODO: SendGrid entegrasyonu
  console.log(`[Email] To: ${to}, Subject: ${subject}`);
  console.log(`[Email] Message: ${message}`);
  return { success: true };
}

// Channel Worker
export const channelWorker = new Worker(
  "channel",
  async (job) => {
    const { type, channel, recipientId, message: userMessage, chatbotId, conversationId: existingConversationId, platformMetadata } = job.data;

    console.log(`[ChannelWorker] Processing job ${job.id} - ${channel} (${type})`);

    try {
      if (type === "inbound") {
        // --- INBOUND MESSAGE PROCESSING ---
        const chatbot = await prisma.chatbot.findUnique({
          where: { id: chatbotId },
        });

        if (!chatbot) throw new Error(`Chatbot ${chatbotId} not found`);

        // Get or Create Conversation
        let conversation = await prisma.conversation.findFirst({
          where: {
            chatbotId,
            channel: channel.toUpperCase() as any,
            channelUserId: recipientId, // Inbound job puts senderId in recipientId slot
            status: "ACTIVE"
          },
          orderBy: { createdAt: "desc" }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              chatbotId,
              channel: channel.toUpperCase() as any,
              channelUserId: recipientId,
              aiEnabled: true,
              status: "ACTIVE"
            }
          });
        }

        // If handoff is active (aiEnabled: false), skip AI response
        if (!conversation.aiEnabled) {
          console.log(`[ChannelWorker] Conversation ${conversation.id} has AI disabled. Skipping.`);
          return { skipped: "handoff_active" };
        }

        // Save User Message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "USER",
            content: userMessage,
          }
        });

        // 1. Perform RAG Search
        const { context, sources } = await performRAGSearch({
          chatbotId,
          query: userMessage,
        });

        // 2. Clear Chat History (last 10)
        const history = await prisma.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: "asc" },
          take: 10
        });

        const formattedMessages = history.map(m => ({
          role: m.role.toLowerCase() as "user" | "assistant" | "system",
          content: m.content
        }));

        // 3. Generate AI Response
        const aiResponse = await generateRAGResponse({
          messages: formattedMessages,
          model: (chatbot.model as any) || "gpt-4o",
          systemPrompt: chatbot.systemPrompt,
          context,
          chatbotId,
          conversationId: conversation.id
        });

        // 4. Send Response back to Channel
        // Recursive call to ourselves but with 'outbound' type? 
        // Or call sendMetaMessage directly for speed.
        const channelConfig = await prisma.channel.findFirst({
          where: { chatbotId, type: channel.toUpperCase() as any, status: "CONNECTED" }
        });

        if (!channelConfig) throw new Error("Channel configuration lost");
        const config = channelConfig.config as any;

        let sendResult;
        if (["whatsapp", "instagram", "facebook"].includes(channel)) {
          sendResult = await sendMetaMessage({
            channel: channel as any,
            recipientId,
            message: aiResponse.text,
            accessToken: config.accessToken
          });
        }
        // ... handle other channels (telegram, slack) as needed

        // 5. Save Assistant Message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "ASSISTANT",
            content: aiResponse.text,
            sources: sources as any,
            promptTokens: aiResponse.usage.promptTokens,
            completionTokens: aiResponse.usage.completionTokens
          }
        });

        return { success: true, aiResponse: aiResponse.text };
      }

      // --- OUTBOUND MESSAGE PROCESSING (Existing) ---
      const channelConfig = await prisma.channel.findFirst({
        where: {
          chatbotId,
          type: channel.toUpperCase() as any,
          status: "CONNECTED",
        },
      });

      if (!channelConfig) {
        throw new Error(`Channel ${channel} not configured for chatbot ${chatbotId}`);
      }

      const config = channelConfig.config as any;
      let result;

      switch (channel) {
        case "whatsapp":
        case "instagram":
        case "facebook":
          result = await sendMetaMessage({
            channel,
            recipientId,
            message: userMessage,
            accessToken: config.accessToken,
          });
          break;

        case "telegram":
          result = await sendTelegramMessage({
            chatId: recipientId,
            message: userMessage,
            botToken: config.botToken,
          });
          break;

        case "slack":
          result = await sendSlackMessage({
            channel: recipientId,
            message: userMessage,
            botToken: config.botToken,
          });
          break;

        case "email":
          result = await sendEmailMessage({
            to: recipientId,
            subject: "New Message",
            message: userMessage,
          });
          break;

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      // Mesajı veritabanına kaydet
      await prisma.message.create({
        data: {
          conversationId: existingConversationId,
          role: "ASSISTANT",
          content: userMessage,
        },
      });

      console.log(`[ChannelWorker] Job ${job.id} completed`);

      return result;
    } catch (error) {
      console.error(`[ChannelWorker] Job ${job.id} failed:`, error);

      // Hata durumunda channel'ı error durumuna getir
      await prisma.channel.updateMany({
        where: { chatbotId, type: channel.toUpperCase() as any },
        data: { status: "ERROR" },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

// Rate limit yönetimi için Meta API özel kuyruk
export const metaRateLimiter = {
  // WhatsApp: 80 mesaj/dakika
  whatsapp: {
    limit: 80,
    window: 60000,
    current: 0,
    resetTime: Date.now() + 60000,
  },
  // Instagram: 100 mesaj/dakika
  instagram: {
    limit: 100,
    window: 60000,
    current: 0,
    resetTime: Date.now() + 60000,
  },
  // Facebook: 100 mesaj/dakika
  facebook: {
    limit: 100,
    window: 60000,
    current: 0,
    resetTime: Date.now() + 60000,
  },
};

channelWorker.on("completed", (job) => {
  console.log(`[ChannelWorker] Job ${job.id} completed`);
});

channelWorker.on("failed", (job, err) => {
  console.error(`[ChannelWorker] Job ${job?.id} failed:`, err.message);
});

console.log("[ChannelWorker] Started");
