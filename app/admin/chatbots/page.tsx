"use client";

import { motion } from "framer-motion";
import { 
  Bot, 
  Search, 
  SlidersHorizontal, 
  MoreVertical,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const chatbots = [
  { id: 1, name: "Customer Support", owner: "sarah@company.com", model: "GPT-4o", status: "active", messages: 12847 },
  { id: 2, name: "Marketing Lead", owner: "mike@tech.io", model: "Claude 3", status: "idle", messages: 3452 },
  { id: 3, name: "Technical Support", owner: "john@example.com", model: "GPT-4o", status: "active", messages: 8923 },
];

export default function AdminChatbotsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Chatbots Management</h1>
          <p className="text-zinc-400">Monitor and manage all AI agents across the platform</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search chatbots, owners, or IDs..." 
            className="pl-10 bg-zinc-950 border-white/10"
          />
        </div>
        <Button variant="outline" className="border-white/10">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="bg-zinc-900 border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950 text-zinc-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Chatbot</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Total Messages</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {chatbots.map((bot) => (
                <tr key={bot.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-white">{bot.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{bot.owner}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-zinc-800 text-xs text-white border border-white/10">
                      {bot.model}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${bot.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                      <span className={bot.status === 'active' ? 'text-green-500' : 'text-zinc-500'}>
                        {bot.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <Activity className="w-3 h-3 text-zinc-500" />
                      {bot.messages.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
