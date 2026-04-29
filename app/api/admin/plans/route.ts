import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const plans = await prisma.plan.findMany({
      include: {
        _count: { select: { subscriptions: true } }
      },
      orderBy: { priceMonthly: "asc" }
    });

    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Failed to access billing ledger" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { planId, ...data } = await req.json();
    const updated = await prisma.plan.update({
      where: { id: planId },
      data
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to reconfigure plan matrix" }, { status: 500 });
  }
}
