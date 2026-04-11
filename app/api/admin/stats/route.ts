import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const [
      totalUsers,
      totalChatbots,
      totalMessages,
      activeSubscriptions
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.chatbot.count().catch(() => 0),
      prisma.message.count().catch(() => 0),
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true }
      }).catch(() => [])
    ]);

    const revenueMTD = activeSubscriptions.reduce((acc: any, sub: any) => acc + (sub.plan?.priceMonthly || 0), 0);
    const last7Days = subDays(new Date(), 7);
    const recentSignups = await prisma.user.count({
      where: { createdAt: { gte: last7Days } }
    }).catch(() => 0);

    const recentBots = await prisma.chatbot.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } }
    }).catch(() => []);

    return NextResponse.json({
      totalUsers,
      totalChatbots,
      totalMessages,
      revenueMTD,
      growth: {
        signupsLast7Days: recentSignups,
        percentage: totalUsers > 0 ? (recentSignups / totalUsers) * 100 : 0
      },
      recentActivity: recentBots.map((bot: any) => ({
        type: "CHATBOT_CREATED",
        title: "New Agent Deployed",
        detail: `${bot.name} by ${bot.user?.email || 'System'}`,
        time: bot.createdAt
      }))
    });
  } catch (error) {
    console.error("[AdminStatsAPI] Crashing Error:", error);
    return NextResponse.json({ 
      totalUsers: 0, 
      totalChatbots: 0, 
      totalMessages: 0, 
      revenueMTD: 0,
      recentActivity: [],
      error: "Data mesh partially offline" 
    });
  }
}
