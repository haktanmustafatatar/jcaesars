"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  User,
  Bot,
  MoreHorizontal,
  Send,
  Paperclip,
  Smile,
  Check,
  X,
  Tag,
  Phone,
  Instagram,
  Facebook,
  Mail,
  Globe,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  Zap,
  StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

// Elite Mock Data
const conversations = [
  {
    id: "1",
    user: { name: "Ahmet Yılmaz", email: "ahmet@jcaesar.ai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet" },
    channel: "widget",
    lastMessage: "Ürününüzün fiyatı nedir?",
    lastMessageTime: "2dk",
    unread: 2,
    status: "active",
    tags: ["satış", "VIP"],
    online: true,
  },
  {
    id: "2",
    user: { name: "Zeynep Kaya", email: "zeynep@company.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep" },
    channel: "whatsapp",
    lastMessage: "Siparişim ne zaman gelir? Bekliyorum.",
    lastMessageTime: "15dk",
    unread: 0,
    status: "active",
    tags: ["destek"],
    online: false,
  },
  {
    id: "3",
    user: { name: "Sarah Connor", email: "sarah@resistance.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    channel: "instagram",
    lastMessage: "Harika bir kampanya bu!",
    lastMessageTime: "1s",
    unread: 1,
    status: "active",
    tags: ["fans"],
    online: true,
  },
  {
    id: "4",
    user: { name: "Ayşe Şahin", email: "ayse@startup.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse" },
    channel: "email",
    lastMessage: "Teşekkürler, her şey mükemmel çalışıyor.",
    lastMessageTime: "3s",
    unread: 0,
    status: "closed",
    tags: ["çözüldü"],
    online: false,
  },
];

const channelConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  widget: { icon: Globe, color: "text-blue-500", bg: "bg-blue-50", label: "Website" },
  whatsapp: { icon: Phone, color: "text-emerald-500", bg: "bg-emerald-50", label: "WhatsApp" },
  instagram: { icon: Instagram, color: "text-pink-500", bg: "bg-pink-50", label: "Instagram" },
  facebook: { icon: Facebook, color: "text-blue-600", bg: "bg-blue-50", label: "Facebook" },
  email: { icon: Mail, color: "text-zinc-500", bg: "bg-zinc-50", label: "Email" },
};

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string>("1");
  const [isAiActive, setIsAiActive] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const selectedConv = conversations.find(c => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-8.5rem)] flex gap-6 overflow-hidden">
      {/* 1. List Column: Conversations */}
      <div className="w-[320px] xl:w-[380px] hidden md:flex flex-col bg-white/60 backdrop-blur-xl rounded-[32px] border border-black/5 shadow-2xl shadow-black/[0.02]">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Inbox</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">4 Active Sessions</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl bg-muted/50 hover:bg-white transition-all">
                    <Filter className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Filter Chats</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary/20 focus-visible:bg-white transition-all font-medium text-sm" 
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-2">
            {conversations.map((conv) => {
              const cfg = channelConfig[conv.channel];
              const isSelected = selectedId === conv.id;
              const Icon = cfg.icon;
              
              return (
                <motion.button
                  key={conv.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedId(conv.id)}
                  className={`
                    w-full group relative p-4 rounded-[24px] text-left transition-all duration-300 overflow-hidden
                    ${isSelected 
                      ? "bg-white shadow-xl shadow-black/5 border border-black/5 ring-1 ring-primary/5" 
                      : "hover:bg-white/40 border border-transparent"}
                  `}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="active-nav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full" 
                    />
                  )}
                  
                  <div className="flex gap-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm">
                        <AvatarImage src={conv.user.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">{conv.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold truncate ${isSelected ? "text-zinc-900" : "text-zinc-700"}`}>
                          {conv.user.name}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">{conv.lastMessageTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{cfg.label}</span>
                      </div>
                      
                      <p className={`text-xs truncate font-medium ${isSelected ? "text-zinc-600" : "text-muted-foreground/80"}`}>
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <div className="self-start mt-1">
                         <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full animate-bounce-slow">
                           {conv.unread}
                         </span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* 2. Chat Column: Command Center */}
      <div className="flex-1 flex flex-col bg-white rounded-[40px] border border-black/5 shadow-2xl shadow-black/[0.03] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
        
        {/* Chat Header */}
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-12 h-12 rounded-2xl border border-black/5">
                <AvatarImage src={selectedConv?.user.avatar} />
                <AvatarFallback>{selectedConv?.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm border border-black/5">
                {selectedConv && (() => {
                  const Icon = channelConfig[selectedConv.channel].icon;
                  return (
                    <div className={channelConfig[selectedConv.channel].color}>
                      <Icon className="w-3 h-3" />
                    </div>
                  );
                })()}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-lg">
                {selectedConv?.user.name}
                <Badge variant="outline" className="text-[10px] h-5 rounded-md border-primary/20 text-primary bg-primary/5 uppercase tracking-tighter px-1.5">Active Session</Badge>
              </h3>
              <p className="text-xs font-medium text-muted-foreground">{selectedConv?.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col items-end mr-4">
               <div className="flex items-center gap-2 mb-1">
                 <Zap className={`w-3.5 h-3.5 ${isAiActive ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Autopilot</span>
               </div>
               <Switch 
                 checked={isAiActive} 
                 onCheckedChange={setIsAiActive}
                 className="data-[state=checked]:bg-emerald-500"
               />
            </div>
            
            <div className="h-10 w-px bg-muted" />

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                   <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold border-emerald-500/20 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all">
                        <Check className="w-4 h-4 mr-2" /> Resolve
                      </Button>
                   </TooltipTrigger>
                   <TooltipContent>Close Conversation</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/30">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                   <DropdownMenuSeparator className="opacity-50" />
                   <DropdownMenuItem className="rounded-xl py-2.5 font-medium"><Tag className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Tags</DropdownMenuItem>
                   <DropdownMenuItem className="rounded-xl py-2.5 font-medium"><StickyNote className="w-4 h-4 mr-2 text-muted-foreground" /> Add Internal Note</DropdownMenuItem>
                   <DropdownMenuItem className="rounded-xl py-2.5 font-medium"><User className="w-4 h-4 mr-2 text-muted-foreground" /> Assign to Agent</DropdownMenuItem>
                   <DropdownMenuSeparator className="opacity-50" />
                   <DropdownMenuItem className="rounded-xl py-2.5 font-medium text-destructive focus:bg-destructive/5"><X className="w-4 h-4 mr-2" /> Block User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-8 bg-zinc-50/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.03),transparent)]" />
          
          <div className="space-y-10 relative z-10 max-w-4xl mx-auto">
            {/* Date Separator */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-muted/60" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Today, May 12</span>
              <div className="flex-1 h-px bg-muted/60" />
            </div>

            {/* AI Welcome */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 mb-3 overflow-hidden">
                 <Bot className="w-6 h-6" />
              </div>
              <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">AI Takeover Started · 14:30</p>
            </div>

            {/* Message Flow */}
            <div className="space-y-8">
              {[
                { id: "1", role: "user", text: "Merhaba, ürününüzün fiyatı nedir?", time: "14:30", type: "text" },
                { 
                  id: "2", 
                  role: "assistant", 
                  text: "Merhaba! J.Caesar planları ihtiyacınıza göre şekillenir. Professional planımız $29/ay ile başlar. Detayları dökümandan buldum:", 
                  time: "14:31", 
                  source: "Pricing Policy" 
                },
                { id: "3", role: "user", text: "Peki ücretsiz deneme süreniz var mı?", time: "14:32" },
                { 
                  id: "4", 
                  role: "assistant", 
                  text: "Evet! 14 günlük tam kapsamlı deneme süremiz bulunmaktadır. Kredi kartı eklemenize gerek yok.", 
                  time: "14:33",
                  highlight: true 
                },
              ].map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="pt-2">
                    <Avatar className={`w-9 h-9 rounded-xl border border-black/5 shadow-sm ${msg.role === "assistant" ? "bg-zinc-950" : "bg-white"}`}>
                      {msg.role === "assistant" ? <AvatarImage src="/bot-avatar.png" className="p-1.5" /> : <AvatarImage src={selectedConv?.user.avatar} />}
                      <AvatarFallback className={msg.role === "assistant" ? "bg-zinc-950 text-white" : "bg-primary/5 text-primary"}>
                        {msg.role === "assistant" ? "AI" : "H"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className={`flex flex-col gap-2 max-w-[80%] xl:max-w-[70%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div 
                      className={`
                        relative p-5 rounded-[28px] text-sm leading-relaxed shadow-sm
                        ${msg.role === "user" 
                          ? "bg-zinc-950 text-white rounded-br-sm shadow-zinc-950/10" 
                          : "bg-white text-zinc-800 rounded-bl-sm ring-1 ring-black/[0.03]"}
                        ${msg.highlight ? "ring-2 ring-primary/20 bg-primary/[0.02]" : ""}
                      `}
                    >
                      {msg.text}
                      
                      {msg.source && (
                        <div className="mt-4 pt-3 border-t border-muted/50 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary">
                             <ShieldCheck className="w-3.5 h-3.5" /> Verified Source
                          </div>
                          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
                             <div className="flex items-center gap-2">
                               <Globe className="w-3.5 h-3.5 text-primary" />
                               <span className="text-[11px] font-bold truncate max-w-[150px]">{msg.source}</span>
                             </div>
                             <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground px-2 flex items-center gap-2 italic">
                       {msg.time}
                       {msg.role === "assistant" && <Check className="w-3 h-3 text-emerald-500" />}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4">
                   <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white ring-1 ring-white/10 animate-pulse">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                   </div>
                   <div className="bg-white p-4 rounded-3xl rounded-tl-sm border border-black/5 flex items-center gap-1.5 h-10 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                   </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Chat Input Interface */}
        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-black/5 relative z-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex flex-col bg-muted/40 rounded-[28px] focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-primary/5 transition-all duration-500 border border-transparent focus-within:border-primary/20 overflow-hidden">
               {/* Context Info Overlay (Slide-up potential) */}
               <div className="px-5 py-2 flex items-center justify-between bg-black/[0.02] border-b border-black/[0.03]">
                  <div className="flex items-center gap-3">
                     <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isAiActive ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                        {isAiActive ? "AI Mode Active" : "Human Mode"}
                     </span>
                  </div>
                  <div className="flex gap-4">
                     <button className="text-[10px] font-bold text-primary hover:underline">Templates / Quick Reply</button>
                  </div>
               </div>

               <div className="flex items-end p-2 gap-2">
                 <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-white rounded-2xl">
                    <Paperclip className="w-5 h-5" />
                 </Button>
                 
                 <Textarea 
                   placeholder="Type a message or use '/' for shortcuts..."
                   className="flex-1 min-h-[48px] max-h-32 border-none bg-transparent focus-visible:ring-0 resize-none font-medium text-sm py-4 px-4 placeholder:text-muted-foreground/50"
                   onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        // Handle send
                      }
                   }}
                 />

                 <div className="flex gap-1">
                   <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-white rounded-2xl">
                      <Smile className="w-5 h-5" />
                   </Button>
                   <Button className="h-11 w-11 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20">
                      <Send className="w-4 h-4 ml-0.5" />
                   </Button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Column: CRM / Metadata */}
      <div className="w-[280px] xl:w-[320px] hidden xl:flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        {/* User Profile Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-black/5 p-6 space-y-6">
           <div className="flex items-center justify-between mb-4">
             <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">User Profile</h4>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-muted/50"><ChevronRight className="w-4 h-4" /></Button>
           </div>
           
           <div className="flex flex-col items-center text-center gap-3">
             <div className="w-24 h-24 rounded-[32px] overflow-hidden p-1.5 bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl shadow-primary/5">
                <img src={selectedConv?.user.avatar} className="w-full h-full object-cover rounded-[24px]" />
             </div>
             <div>
               <h3 className="font-bold text-lg">{selectedConv?.user.name}</h3>
               <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1"><Mail className="w-3 h-3" /> {selectedConv?.user.email}</p>
             </div>
             <div className="flex gap-2 w-full pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-9 text-[11px] font-bold">Follow up</Button>
                <Button variant="outline" size="icon" className="rounded-xl h-9 w-9"><Phone className="w-4 h-4" /></Button>
             </div>
           </div>

           <div className="space-y-4 pt-4">
              <div className="space-y-1">
                 <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Metadata</span>
                 <div className="p-3 bg-muted/30 rounded-2xl border border-black/[0.02] space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-medium opacity-60">Language</span>
                       <span className="text-xs font-bold uppercase">Turkish (TR)</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-medium opacity-60">Timezone</span>
                       <span className="text-xs font-bold">GMT+3 (Istanbul)</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Labels / Tags</span>
                 <div className="flex flex-wrap gap-1.5">
                    {selectedConv?.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 border-none capitalize">{tag}</Badge>
                    ))}
                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg border border-dashed border-muted-foreground/30"><Plus className="w-3 h-3" /></Button>
                 </div>
              </div>
           </div>
        </div>

        {/* Bot Strategy Card */}
        <div className="bg-zinc-950 text-white rounded-[32px] p-6 space-y-5 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ring-1 ring-white/10">
                    <Bot className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm">Bot Intelligence</h4>
                    <p className="text-[10px] text-zinc-400 font-medium">Sales Assistant v2.4</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-xs font-medium text-zinc-300">Confidence</span>
                    <span className="text-xs font-bold text-emerald-400">92%</span>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-xs font-medium text-zinc-300">RAG Token Usage</span>
                    <span className="text-xs font-bold text-blue-400">1.2k</span>
                 </div>
              </div>

              <Button className="w-full mt-4 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-bold py-5">
                 Optimize AI Strategy
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
