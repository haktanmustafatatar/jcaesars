"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  User, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Download,
  Trash2,
  Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const conversations = [
  {
    id: "1",
    user: "Customer #1284",
    bot: "Sales Assistant",
    lastMessage: "How can I integrate this with my Shopify store?",
    timestamp: "2 mins ago",
    status: "active",
    messages: 12,
  },
  {
    id: "2",
    user: "Customer #1283",
    bot: "Support Bot",
    lastMessage: "Thank you for the help!",
    timestamp: "15 mins ago",
    status: "closed",
    messages: 4,
  },
  {
    id: "3",
    user: "Customer #1282",
    bot: "Sales Assistant",
    lastMessage: "I'm interested in the Pro plan.",
    timestamp: "1 hour ago",
    status: "active",
    messages: 8,
  },
  {
    id: "4",
    user: "Customer #1281",
    bot: "Marketing Bot",
    lastMessage: "Where can I find the documentation?",
    timestamp: "3 hours ago",
    status: "closed",
    messages: 5,
  },
];

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">Manage and monitor all AI interactions in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations, customers, or bots..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {conversations.map((convo, index) => (
          <motion.div
            key={convo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{convo.user}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {convo.bot}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {convo.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {convo.timestamp}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {convo.messages} messages
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={convo.status === "active" ? "bg-green-500/10 text-green-500 hover:bg-green-500/10" : "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/10"}
                      >
                        {convo.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Chat</DropdownMenuItem>
                          <DropdownMenuItem>Download Transcript</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
