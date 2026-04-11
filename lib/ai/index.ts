import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateText, embed } from "ai";
import { prisma } from "@/lib/prisma";

// LLM Model yapılandırması
export const LLM_MODELS = {
  "gpt-4o": {
    provider: openai("gpt-4o"),
    name: "GPT-4o",
    tokenMultiplier: 5,
    maxTokens: 4096,
  },
  "gpt-4o-mini": {
    provider: openai("gpt-4o-mini"),
    name: "GPT-4o Mini",
    tokenMultiplier: 1,
    maxTokens: 4096,
  },
  "claude-sonnet": {
    provider: anthropic("claude-3-5-sonnet-20241022"),
    name: "Claude 3.5 Sonnet",
    tokenMultiplier: 4,
    maxTokens: 4096,
  },
  "claude-haiku": {
    provider: anthropic("claude-3-haiku-20240307"),
    name: "Claude 3 Haiku",
    tokenMultiplier: 1,
    maxTokens: 4096,
  },
} as const;

export type LLMModel = keyof typeof LLM_MODELS;

// Embedding modeli
export const embeddingModel = openai.embedding("text-embedding-3-small");

// Text embedding oluştur
export async function createEmbedding(text: string) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

// Streaming chat yanıtı
export async function streamChatResponse({
  messages,
  model,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 1000,
}: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model: LLMModel;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const selectedModel = LLM_MODELS[model]?.provider || LLM_MODELS["gpt-4o"].provider;

  return streamText({
    model: selectedModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature,
    maxTokens,
  });
}

// RAG ile chat yanıtı (context ile)
export async function streamRAGResponse({
  messages,
  model,
  systemPrompt,
  context,
  temperature = 0.7,
  maxTokens = 1000,
  onFinish,
}: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model: LLMModel;
  systemPrompt: string;
  context: string;
  temperature?: number;
  maxTokens?: number;
  onFinish?: (completion: { text: string; usage: any }) => Promise<void> | void;
}) {
  const selectedModel = LLM_MODELS[model]?.provider || LLM_MODELS["gpt-4o"].provider;

  const enhancedSystemPrompt = `${systemPrompt}

IMPORTANT: Use the following context to answer the user's question accurately. 
Pay special attention to numerical values, prices, dates, and specific product details. 
If the context contains a price for a product the user is asking about, YOU MUST include it.
If the context doesn't contain the requested information, say so honestly, but try to provide a close alternative if possible.

Knowledge Hub Context:
${context}`;

  return streamText({
    model: selectedModel,
    messages: [
      { role: "system", content: enhancedSystemPrompt },
      ...messages,
    ],
    temperature,
    maxTokens,
    onFinish,
  });
}

// Token kullanımını kaydet
export async function logTokenUsage({
  userId,
  chatbotId,
  conversationId,
  model,
  promptTokens,
  completionTokens,
}: {
  userId: string;
  chatbotId: string;
  conversationId: string;
  model: LLMModel;
  promptTokens: number;
  completionTokens: number;
}) {
  const multiplier = LLM_MODELS[model]?.tokenMultiplier || 1;
  const totalTokens = (promptTokens + completionTokens) * multiplier;

  // Token maliyetini hesapla (örnek fiyatlandırma)
  const costPer1K = model.includes("gpt-4o")
    ? model.includes("mini")
      ? 0.15
      : 2.5
    : model.includes("haiku")
      ? 0.25
      : 3.0;

  const cost = (totalTokens / 1000) * costPer1K;

  await prisma.tokenUsage.create({
    data: {
      userId,
      chatbotId,
      conversationId,
      model,
      tokensUsed: totalTokens,
      promptTokens,
      completionTokens,
      cost,
    },
  });

  // Kullanıcının token limitini kontrol et
  await checkTokenLimit(userId);

  return { totalTokens, cost };
}

// Token limit kontrolü
async function checkTokenLimit(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        include: { plan: true },
      },
    },
  });

  if (!user?.organization?.plan) return;

  const plan = user.organization.plan;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await prisma.tokenUsage.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
    _sum: { tokensUsed: true },
  });

  const usedTokens = usage._sum.tokensUsed || 0;
  const limit = plan.tokenLimit;
  const percentage = (usedTokens / limit) * 100;

  // %80 uyarısı
  if (percentage >= 80 && percentage < 100) {
    // TODO: Email notification gönder
    console.log(`Token limit warning: ${user.email} at ${percentage.toFixed(1)}%`);
  }

  // Limit aşımı
  if (usedTokens >= limit) {
    throw new Error("TOKEN_LIMIT_EXCEEDED");
  }
}
