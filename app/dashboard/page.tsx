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
import Link from "next/link";

const stats = [
  {
    title: "Total Chatbots",
    value: "3",
    change: "+1",
    trend: "up",
    icon: Bot,
  },
  {
    title: "Conversations",
    value: "1,284",
    change: "+12%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Messages",
    value: "8,432",
    change: "+8%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Active Users",
    value: "342",
    change: "-2%",
    trend: "down",
    icon: Users,
  },
];

const recentChatbots = [
  { name: "Support Bot", status: "Active", conversations: 847 },
  { name: "Sales Assistant", status: "Active", conversations: 324 },
  { name: "FAQ Bot", status: "Draft", conversations: 0 },
];

const recentConversations = [
  { user: "user@example.com", message: "How do I reset my password?", time: "2m ago" },
  { user: "john@company.com", message: "What are your pricing plans?", time: "5m ago" },
  { user: "sarah@tech.io", message: "Can I integrate with Slack?", time: "12m ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your chatbots.
          </p>
        </div>
        <Link href="/dashboard/chatbots/new">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Create Chatbot
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Chatbots */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Chatbots</CardTitle>
            <Link href="/dashboard/chatbots">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChatbots.map((chatbot) => (
                <div
                  key={chatbot.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{chatbot.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          chatbot.status === "Active"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {chatbot.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {chatbot.conversations.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      conversations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Conversations</CardTitle>
            <Link href="/dashboard/conversations">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversations.map((conv, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {conv.user[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.user}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
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
