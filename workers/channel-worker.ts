import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@/lib/prisma";

const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
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
    const { type, channel, recipientId, message, chatbotId, conversationId } = job.data;

    console.log(`[ChannelWorker] Processing job ${job.id} - ${channel}`);

    try {
      // Chatbot'un channel config'ini al
      const channelConfig = await prisma.channel.findFirst({
        where: {
          chatbotId,
          type: channel.toUpperCase(),
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
            message,
            accessToken: config.accessToken,
          });
          break;

        case "telegram":
          result = await sendTelegramMessage({
            chatId: recipientId,
            message,
            botToken: config.botToken,
          });
          break;

        case "slack":
          result = await sendSlackMessage({
            channel: recipientId,
            message,
            botToken: config.botToken,
          });
          break;

        case "email":
          result = await sendEmailMessage({
            to: recipientId,
            subject: "New Message",
            message,
          });
          break;

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      // Mesajı veritabanına kaydet
      await prisma.message.create({
        data: {
          conversationId,
          role: "ASSISTANT",
          content: message,
        },
      });

      console.log(`[ChannelWorker] Job ${job.id} completed`);

      return result;
    } catch (error) {
      console.error(`[ChannelWorker] Job ${job.id} failed:`, error);

      // Hata durumunda channel'ı error durumuna getir
      await prisma.channel.updateMany({
        where: { chatbotId, type: channel.toUpperCase() },
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
