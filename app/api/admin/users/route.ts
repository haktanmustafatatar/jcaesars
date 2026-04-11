import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        chatbots: { select: { id: true } },
        subscriptions: { include: { plan: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[AdminUsersAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update user status (Ban/Active) or role
export async function PATCH(req: Request) {
  try {
    const { userId, role, status } = await req.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
        // Assuming we add a 'status' field or similar logic if needed,
        // for now just role and metadata.
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[AdminUsersAPI] PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
