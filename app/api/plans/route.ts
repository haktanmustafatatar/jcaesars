import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { priceMonthly: "asc" }
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("[PlansAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
