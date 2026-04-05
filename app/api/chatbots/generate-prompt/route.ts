import { NextRequest, NextResponse } from "next/server";
import { generateInitialPrompt, UseCase } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
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
