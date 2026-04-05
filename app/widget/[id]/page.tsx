"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useChat } from "ai/react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function WidgetPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [chatbot, setChatbot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading: isTyping } = useChat({
    api: `/api/widget/${id}/chat`,
    initialMessages: [],
    onError: (err) => {
      console.error("Widget Chat Error:", err);
    }
  });

  useEffect(() => {
    fetchChatbot();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const fetchChatbot = async () => {
    try {
      const res = await fetch(`/api/chatbots/${id}`);
      if (res.ok) {
        const data = await res.json();
        setChatbot(data);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: data.welcomeMessage || "Hello! How can I help you?",
            createdAt: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chatbot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
      </div>
    );
  }

  const primaryColor = chatbot?.primaryColor || "#e25b31";

  return (
    <div className="flex flex-col h-screen bg-white text-zinc-900 border-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between shadow-sm border-b" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src={chatbot?.avatar} className="object-cover" />
            <AvatarFallback className="bg-white/10 text-white">
              <Bot className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">{chatbot?.name || "AI Assistant"}</h1>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/70 uppercase">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-zinc-50/30">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                  message.role === "user" ? "bg-zinc-900" : "bg-white border"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <div className={`max-w-[85%] space-y-1`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user" 
                    ? "bg-zinc-900 text-white rounded-tr-none" 
                    : "bg-white border text-zinc-700 rounded-tl-none shadow-sm"
                  }`}>
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border flex items-center justify-center">
                <Bot className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="bg-white border p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <Input 
            className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white transition-all pr-12"
            placeholder="Write a message..."
            value={input}
            onChange={handleInputChange}
          />
          <Button 
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="absolute right-1 top-1 h-10 w-10 rounded-lg shadow-lg active:scale-95 transition-all text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {chatbot?.showBranding && (
          <p className="text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-3">
            Powered by <span className="text-primary">JCaesar AI</span>
          </p>
        )}
      </div>
    </div>
  );
}
