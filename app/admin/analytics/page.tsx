"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Conversations",
    value: "45,231",
    change: "+12.5%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Avg. Response Time",
    value: "1.2s",
    change: "-18%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Retention Rate",
    value: "78%",
    change: "+4.3%",
    trend: "up",
    icon: Users,
  },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Analytics</h1>
        <p className="text-zinc-400">Deep dive into platform performance metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="text-zinc-500">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-zinc-900 border-white/10 h-[400px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto" />
          <p className="text-zinc-500">Charts and detailed graphs will be integrated here</p>
        </div>
      </Card>
    </div>
  );
}
