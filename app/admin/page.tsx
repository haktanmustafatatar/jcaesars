"use client";

import { motion } from "framer-motion";
import {
  Users,
  Bot,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Chatbots",
    value: "4,231",
    change: "+8%",
    trend: "up",
    icon: Bot,
  },
  {
    title: "Messages (24h)",
    value: "89,432",
    change: "+24%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Revenue (MTD)",
    value: "$48,392",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
  },
];

const systemHealth = [
  { name: "API", status: "operational", uptime: "99.99%" },
  { name: "Database", status: "operational", uptime: "99.98%" },
  { name: "Queue", status: "operational", uptime: "99.95%" },
  { name: "Embedding", status: "degraded", uptime: "98.50%" },
];

const recentActivity = [
  { action: "New user registered", user: "john@example.com", time: "2m ago" },
  { action: "Chatbot created", user: "sarah@company.com", time: "5m ago" },
  { action: "Plan upgraded", user: "mike@tech.io", time: "12m ago" },
  { action: "API key generated", user: "admin@jcaesar.agent", time: "15m ago" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Admin Dashboard
        </h1>
        <p className="text-zinc-400">
          Overview of your SaaS platform performance
        </p>
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
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-zinc-500">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">System Health</CardTitle>
            <Activity className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-950"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        service.status === "operational"
                          ? "bg-green-500"
                          : service.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-white font-medium">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs ${
                        service.status === "operational"
                          ? "text-green-500"
                          : service.status === "degraded"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                    >
                      {service.status}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {service.uptime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Usage */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Token Usage (Today)</CardTitle>
            <Button variant="ghost" size="sm" className="text-zinc-400">
              View Details
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-400">OpenAI GPT-4o</span>
                  <span className="text-sm text-white">2.4M / 5M</span>
                </div>
                <Progress value={48} className="h-2 bg-zinc-950" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-400">Claude 3</span>
                  <span className="text-sm text-white">890K / 2M</span>
                </div>
                <Progress value={44} className="h-2 bg-zinc-950" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-400">Embeddings</span>
                  <span className="text-sm text-white">1.2M / 3M</span>
                </div>
                <Progress value={40} className="h-2 bg-zinc-950" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-zinc-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-950"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {activity.user[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-zinc-500">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-500">
                Embedding Service Degraded
              </p>
              <p className="text-xs text-yellow-500/70 mt-1">
                The embedding service is experiencing higher than normal latency.
                Our team is investigating.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
