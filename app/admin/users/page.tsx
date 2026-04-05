"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  MoreHorizontal,
  Mail,
  Crown,
  User,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const users = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    plan: "Professional",
    status: "active",
    chatbots: 5,
    messages: 12483,
    joined: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    plan: "Enterprise",
    status: "active",
    chatbots: 12,
    messages: 45291,
    joined: "2024-02-01",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@tech.io",
    plan: "Starter",
    status: "active",
    chatbots: 1,
    messages: 892,
    joined: "2024-03-10",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@startup.com",
    plan: "Professional",
    status: "suspended",
    chatbots: 3,
    messages: 5621,
    joined: "2024-01-28",
  },
  {
    id: "5",
    name: "Alex Wilson",
    email: "alex@agency.co",
    plan: "Enterprise",
    status: "active",
    chatbots: 8,
    messages: 28934,
    joined: "2024-02-20",
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan =
      planFilter === "all" || user.plan.toLowerCase() === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Users
          </h1>
          <p className="text-zinc-400">
            Manage user accounts and subscriptions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-white">{users.length} total</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500"
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-white/10 text-white">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-zinc-900 border-white/10 hover:border-white/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20 text-primary text-lg">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{user.name}</h3>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">
                        {user.chatbots}
                      </p>
                      <p className="text-xs text-zinc-500">Chatbots</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">
                        {user.messages.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500">Messages</p>
                    </div>
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.plan === "Enterprise"
                            ? "border-yellow-500 text-yellow-500"
                            : user.plan === "Professional"
                              ? "border-primary text-primary"
                              : "border-zinc-500 text-zinc-500"
                        }`}
                      >
                        {user.plan}
                      </Badge>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(user.joined).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-zinc-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-900 border-white/10"
                    >
                      <DropdownMenuItem className="text-white">
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white">
                        <Crown className="w-4 h-4 mr-2" />
                        Change Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
