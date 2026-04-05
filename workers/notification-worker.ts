import { Worker } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// SendGrid email gönderimi
async function sendEmail({
  to,
  subject,
  body,
  template,
  data,
}: {
  to: string;
  subject?: string;
  body: string;
  template?: string;
  data?: Record<string, any>;
}) {
  // TODO: SendGrid entegrasyonu
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({...});

  console.log(`[Email] To: ${to}, Subject: ${subject}`);
  console.log(`[Email] Body: ${body}`);

  return { success: true };
}

// Webhook gönderimi
async function sendWebhook({
  url,
  payload,
}: {
  url: string;
  payload: Record<string, any>;
}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.statusText}`);
  }

  return { success: true };
}

// Notification Worker
export const notificationWorker = new Worker(
  "notification",
  async (job) => {
    const { type, to, subject, body, template, data } = job.data;

    console.log(`[NotificationWorker] Processing job ${job.id} - ${type}`);

    try {
      switch (type) {
        case "email":
          await sendEmail({ to, subject, body, template, data });
          break;

        case "webhook":
          await sendWebhook({ url: to, payload: data || {} });
          break;

        case "push":
          // TODO: Push notification entegrasyonu (Firebase, OneSignal vb.)
          console.log(`[Push] To: ${to}, Body: ${body}`);
          break;

        default:
          throw new Error(`Unknown notification type: ${type}`);
      }

      console.log(`[NotificationWorker] Job ${job.id} completed`);

      return { success: true };
    } catch (error) {
      console.error(`[NotificationWorker] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Token limit uyarı emaili
export async function sendTokenWarningEmail({
  userEmail,
  userName,
  usedTokens,
  limit,
  percentage,
}: {
  userEmail: string;
  userName: string;
  usedTokens: number;
  limit: number;
  percentage: number;
}) {
  const subject = `Token Limit Warning - ${percentage.toFixed(0)}% Used`;
  const body = `
Hi ${userName},

You're approaching your monthly token limit:

- Used: ${usedTokens.toLocaleString()} tokens
- Limit: ${limit.toLocaleString()} tokens
- Percentage: ${percentage.toFixed(1)}%

To avoid service interruption, consider upgrading your plan or purchasing additional tokens.

Best regards,
J.Caesar Agent Team
  `;

  // Queue'ya ekle
  const { queues } = await import("@/lib/queue");
  await queues.notification.add(
    "token-warning",
    {
      type: "email",
      to: userEmail,
      subject,
      body,
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 60000 },
    }
  );
}

notificationWorker.on("completed", (job) => {
  console.log(`[NotificationWorker] Job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, err.message);
});

console.log("[NotificationWorker] Started");
