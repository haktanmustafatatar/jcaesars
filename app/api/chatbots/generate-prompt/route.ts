import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateInitialPrompt, UseCase } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, useCase, knowledgeSnippet } = await req.json();

    if (!name || !useCase) {
      return NextResponse.json({ error: "Name and UseCase are required" }, { status: 400 });
    }

    const prompt = await generateInitialPrompt({
      name,
      description,
      useCase: useCase as UseCase,
      knowledgeSnippet,
    });

    return NextResponse.json({ prompt });

  } catch (error: any) {
    console.error("Prompt generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
