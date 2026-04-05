import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export type UseCase = "sales" | "support" | "gen_ai" | "creative";

export async function generateInitialPrompt({
  name,
  description,
  useCase,
  knowledgeSnippet,
}: {
  name: string;
  description?: string;
  useCase: UseCase;
  knowledgeSnippet?: string;
}) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are an expert AI prompt engineer. Your goal is to write a high-performance, professional, and elite system prompt for a chatbot based on user input and extracted website data.",
    prompt: `
Create a comprehensive system prompt for a chatbot with the following details:

- Name: ${name}
- Initial Description: ${description || "N/A"}
- Use Case: ${useCase}
- Knowledge Base Snippet (Extracted from site): ${knowledgeSnippet || "N/A"}

The prompt should include:
1. Identity & Tone: Professional, helpful, and aligned with the use case.
2. Mission: What is the primary goal? (e.g., closing sales, solving tickets).
3. Guidelines: How to handle questions not in the knowledge base (e.g., politely ask for email).
4. Formatting: How to present information (clean, structured, using markdown).
5. Language: ${knowledgeSnippet?.includes("ğ") || name.includes("Bot") ? "Turkish" : "English"} (Detect based on input, default to English).

Write ONLY the prompt text, no headers or explanations.
`,
  });

  return text;
}

export const USE_CASE_PRESETS: Record<UseCase, { label: string; description: string }> = {
  sales: {
    label: "Sales Agent",
    description: "Focuses on conversion, lead generation, and product benefits.",
  },
  support: {
    label: "Customer Support",
    description: "Focuses on accuracy, problem-solving, and helpfulness.",
  },
  gen_ai: {
    label: "General AI Agent",
    description: "Versatile assistant for any type of question.",
  },
  creative: {
    label: "Creative Assistant",
    description: "Engaging, casual, and focuses on brainstorming.",
  },
};
