"use client";

import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Dashboard.overview");

  const stats = [
    {
      title: t("stats.totalChatbots"),
      value: "3",
      change: "+1",
      trend: "up",
      icon: Bot,
    },
    {
      title: t("stats.conversations"),
      value: "1,284",
      change: "+12%",
      trend: "up",
      icon: MessageSquare,
    },
    {
      title: t("stats.messages"),
      value: "8,432",
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: t("stats.activeUsers"),
      value: "342",
      change: "-2%",
      trend: "down",
      icon: Users,
    },
  ];

  const recentChatbots = [
    { name: "Support Bot", status: t("recentChatbots.status.active"), conversations: 847 },
    { name: "Sales Assistant", status: t("recentChatbots.status.active"), conversations: 324 },
    { name: "FAQ Bot", status: t("recentChatbots.status.draft"), conversations: 0 },
  ];

  const recentConversations = [
    { user: "user@example.com", message: "How do I reset my password?", time: "2m ago" },
    { user: "john@company.com", message: "What are your pricing plans?", time: "5m ago" },
    { user: "sarah@tech.io", message: "Can I integrate with Slack?", time: "12m ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{t("title")}</h1>
          <p className="text-zinc-500 font-medium">
            {t("welcome")}
          </p>
        </div>
        <Link href="/dashboard/chatbots/new">
          <Button className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl h-11 px-6 font-bold shadow-xl shadow-black/5 transition-all">
            {t("createChatbot")}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-black/5 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-zinc-50/50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-zinc-300" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-black text-zinc-950 tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={cn(
                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    stat.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">{t("stats.fromLastMonth")}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Chatbots */}
        <Card className="border-black/5 shadow-sm rounded-[32px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-black/5 py-6 px-8 bg-zinc-50/20">
            <CardTitle className="text-xl font-bold text-zinc-950">{t("recentChatbots.title")}</CardTitle>
            <Link href="/dashboard/chatbots">
              <Button variant="ghost" size="sm" className="text-zinc-500 font-bold hover:text-zinc-950 rounded-xl">
                {t("recentChatbots.viewAll")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {recentChatbots.map((chatbot) => (
                <div
                  key={chatbot.name}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 border border-transparent hover:border-black/5 transition-all"
                >
                  <div>
                    <p className="font-bold text-zinc-950">{chatbot.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          chatbot.status === t("recentChatbots.status.active")
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        }`}
                      />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        {chatbot.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-zinc-950 tracking-tight">
                      {chatbot.conversations.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {t("recentChatbots.conversationsLabel")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="border-black/5 shadow-sm rounded-[32px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-black/5 py-6 px-8 bg-zinc-50/20">
            <CardTitle className="text-xl font-bold text-zinc-950">{t("recentConversations.title")}</CardTitle>
            <Link href="/dashboard/conversations">
              <Button variant="ghost" size="sm" className="text-zinc-500 font-bold hover:text-zinc-950 rounded-xl">
                {t("recentConversations.viewAll")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {recentConversations.map((conv, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-transparent hover:border-black/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center flex-shrink-0 text-white font-black">
                    {conv.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-950 truncate">{conv.user}</p>
                    <p className="text-sm text-zinc-500 font-medium truncate mt-0.5">
                      {conv.message}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex-shrink-0 pt-1">
                    {conv.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
