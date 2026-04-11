import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
  console.log("Creating test user and chatbot...");
  
  // Create mock user
  const user = await prisma.user.create({
    data: {
      clerkId: "test_embed_clerk_id_" + Date.now(),
      email: "test_embed_" + Date.now() + "@test.com",
      role: "USER"
    }
  });

  // Create mock chatbot
  const slug = "test-bot-" + Date.now();
  const chatbot = await prisma.chatbot.create({
    data: {
      name: "Test Embed Bot",
      description: "Test",
      slug: slug,
      userId: user.id,
      isPublic: true,
      status: "ACTIVE",
      model: "gpt-4o-mini", // Use mini for faster tests
      systemPrompt: "You are a test assistant.",
    }
  });

  console.log(`Created Chatbot Slug: ${slug}`);

  // Create some data source and document
  const ds = await prisma.dataSource.create({
    data: {
      chatbotId: chatbot.id,
      type: "TEXT",
      name: "Test Doc",
      status: "COMPLETED",
    }
  });

  await prisma.$executeRaw`
    INSERT INTO "Document" ("id", "dataSourceId", "content", "title", "createdAt", "updatedAt")
    VALUES (
      ${'test_doc_' + Date.now()},
      ${ds.id},
      'Our secret price is 999 try. The color is purple.',
      'Secrets',
      NOW(),
      NOW()
    )
  `;

  console.log("Sending POST to absolute local URL...");
  
  const res = await fetch(`http://localhost:3000/api/embed/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "What is the secret price?",
    })
  });

  if (!res.ok) {
    console.error("Endpoint failed:", await res.text());
    process.exit(1);
  }

  // To read stream
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += decoder.decode(value, { stream: true });
    }
  }

  const conversationId = res.headers.get("X-Conversation-Id");
  console.log("Conversation ID:", conversationId);
  console.log("Stream output preview:", fullResponse.substring(0, 100).replace(/\n/g, "") + "...");
  
  // Let the DB transactions finish (onFinish hook runs asynchronously after stream starts ending)
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("\nValidating DB records...");

  const countUserMsg = await prisma.message.count({
    where: { conversationId: conversationId as string, role: "USER" }
  });

  const assistantMsg = await prisma.message.findFirst({
    where: { conversationId: conversationId as string, role: "ASSISTANT" }
  });

  console.log("User Messages Found:", countUserMsg);
  console.log("Assistant Message Found:", !!assistantMsg);
  if (assistantMsg) {
    console.log("- Role:", assistantMsg.role);
    console.log("- Prompt tokens:", assistantMsg.promptTokens);
    console.log("- Completion tokens:", assistantMsg.completionTokens);
    console.log("- Parsed Sources exist:", assistantMsg.sources ? true : false);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch(console.error);
