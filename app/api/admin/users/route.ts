import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        chatbots: { select: { id: true } },
        subscriptions: { include: { plan: true } },
        tokenUsages: { select: { tokensUsed: true, cost: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[AdminUsersAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update user role or organization plan
export async function PATCH(req: Request) {
  try {
    const { userId, role, planId } = await req.json();

    if (role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
    }

    if (planId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true }
      });

      if (user?.organizationId) {
        await prisma.organization.update({
          where: { id: user.organizationId },
          data: { planId }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AdminUsersAPI] PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
