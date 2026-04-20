/**
 * Meta Cloud API — Shared channel utilities
 * Handles WhatsApp, Instagram DM, and Facebook Messenger
 */

const META_API_VERSION = "v21.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MetaTextMessage {
  to: string;
  text: string;
  accessToken: string;
  phoneNumberId?: string; // WhatsApp only
  pageId?: string;        // Messenger / Instagram
}

export interface WhatsAppIncomingMessage {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface MessengerIncomingMessage {
  object: string;
  entry: Array<{
    id: string;
    messaging: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: { mid: string; text: string };
    }>;
  }>;
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

export async function sendWhatsAppMessage(
  to: string,
  text: string,
  phoneNumberId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${META_BASE_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body: text },
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function parseWhatsAppMessage(body: WhatsAppIncomingMessage): {
  from: string;
  text: string;
  phoneNumberId: string;
  messageId: string;
} | null {
  try {
    const change = body.entry?.[0]?.changes?.[0]?.value;
    const message = change?.messages?.[0];
    if (!message || message.type !== "text") return null;
    return {
      from: message.from,
      text: message.text?.body ?? "",
      phoneNumberId: change.metadata.phone_number_id,
      messageId: message.id,
    };
  } catch {
    return null;
  }
}

// ─── Facebook Messenger ───────────────────────────────────────────────────────

export async function sendMessengerMessage(
  recipientId: string,
  text: string,
  pageAccessToken: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${META_BASE_URL}/me/messages?access_token=${pageAccessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text },
          messaging_type: "RESPONSE",
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function parseMessengerMessage(body: MessengerIncomingMessage): {
  senderId: string;
  text: string;
  pageId: string;
} | null {
  try {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    if (!messaging?.message?.text) return null;
    return {
      senderId: messaging.sender.id,
      text: messaging.message.text,
      pageId: entry.id,
    };
  } catch {
    return null;
  }
}

// ─── Instagram ────────────────────────────────────────────────────────────────
// Instagram DM uses the same Messenger Send API

export async function sendInstagramMessage(
  recipientId: string,
  text: string,
  pageAccessToken: string
): Promise<boolean> {
  // Instagram messaging uses the same endpoint as Messenger
  return sendMessengerMessage(recipientId, text, pageAccessToken);
}

// ─── Webhook Verification ─────────────────────────────────────────────────────

export function verifyMetaWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null,
  expectedToken: string
): string | null {
  if (mode === "subscribe" && token === expectedToken) {
    return challenge;
  }
  return null;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  // For production: validate X-Hub-Signature-256 header
  // Requires crypto module
  try {
    const crypto = require("crypto");
    const expected = `sha256=${crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest("hex")}`;
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
