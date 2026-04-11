"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Search, 
  SlidersHorizontal, 
  MoreVertical,
  Activity,
  User,
  ExternalLink,
  Trash2,
  Database,
  Cpu,
  RefreshCw,
  Zap,
  Globe,
  Settings,
  ChevronRight,
  MessageSquare,
  Network
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminChatbotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/chatbots");
      if (res.ok) {
        const data = await res.json();
        setBots(data);
      }
    } catch (error) {
      toast.error("Neural mesh synchronization failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleDelete = async (botId: string) => {
    if (!confirm("Are you sure you want to purge this neural agent? This action is irreversible.")) return;

    try {
      const res = await fetch("/api/admin/chatbots", {
        method: "DELETE",
        body: JSON.stringify({ chatbotId: botId }),
      });
      if (res.ok) {
        toast.success("Agent purged from global mesh");
        fetchBots();
      }
    } catch (error) {
      toast.error("Failed to deprovision agent");
    }
  };

  const filteredBots = bots.filter((bot) => 
    bot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Network className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Küresel Ajan Ağı Taranıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Badge variant="outline" className="mb-3 rounded-full bg-blue-500/10 text-blue-500 border-blue-500/20 font-black text-[9px] px-3 tracking-widest uppercase">Küresel Ajan Denetimi</Badge>
           <h1 className="text-4xl font-black tracking-tight text-white mb-2">Neural Düğümler</h1>
           <p className="text-zinc-500 font-medium">Platform genelinde dağıtılan tüm otonom AI ajanlarını izleyin ve yönetin.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-zinc-900 border border-white/5 rounded-2xl flex p-1">
             <Button variant="ghost" size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase text-zinc-500 hover:text-white">Aktİf</Button>
             <Button variant="ghost" size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase text-zinc-500 hover:text-white">Eğİtİm</Button>
             <Button variant="ghost" size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase text-zinc-500 hover:text-white">Arşİv</Button>
           </div>
           <Button onClick={fetchBots} variant="outline" className="h-11 w-11 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 transition-all">
              <RefreshCw className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Ajan adı, ID veya sahip e-postası ile ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 bg-white/5 border-white/5 text-white rounded-[20px] focus:ring-primary/20 transition-all font-medium"
          />
        </div>
        <Button className="h-14 px-8 rounded-[20px] bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 transition-all">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Evrensel Fİltreleme
        </Button>
      </div>

      {/* Agents Mesh Grid/Table */}
      <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 overflow-hidden shadow-2xl">
         <Table>
            <TableHeader className="bg-zinc-950/50">
               <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[300px] text-[10px] font-black text-zinc-500 uppercase tracking-widest h-16 pl-10">Neural Kİmlİk</TableHead>
                  <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest h-16">Platform Sahİbİ</TableHead>
                  <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest h-16">Mİmarİ</TableHead>
                  <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest h-16 text-center">Kaynaklar</TableHead>
                  <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest h-16">Verİ Akışı</TableHead>
                  <TableHead className="text-right h-16 pr-10"></TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredBots.map((bot) => (
                  <TableRow key={bot.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                     <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                              <Bot className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="font-bold text-white text-sm truncate">{bot.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className={`w-1.5 h-1.5 rounded-full ${bot.status === 'ACTIVE' ? 'bg-green-500 shadow-glow shadow-green-500/50' : 'bg-amber-500'}`} />
                                 <span className="text-[10px] font-black text-zinc-500 uppercase">{bot.status}</span>
                              </div>
                           </div>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <User className="w-3 h-3 text-zinc-500" />
                           <span className="text-xs font-bold text-zinc-300">{bot.user?.email || 'System'}</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <Badge variant="outline" className="rounded-xl px-2 py-0.5 text-[10px] font-black uppercase text-zinc-400 border-white/10 bg-white/5">
                           {bot.model}
                        </Badge>
                     </TableCell>
                     <TableCell className="text-center">
                        <div className="flex justify-center gap-4">
                           <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-white">{bot._count?.dataSources || 0}</span>
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sürücü</span>
                           </div>
                           <div className="flex flex-col items-center text-zinc-700">|</div>
                           <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-white">{bot._count?.conversations || 0}</span>
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Oturum</span>
                           </div>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2 text-primary font-black text-sm">
                           <Activity className="w-3 h-3 text-zinc-500" />
                           {(bot._count?.conversations * 12).toLocaleString()}
                           <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">MSJ</span>
                        </div>
                     </TableCell>
                     <TableCell className="text-right pr-10">
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/5 text-zinc-500">
                                 <MoreVertical className="w-5 h-5" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-56 rounded-3xl bg-zinc-950 border-white/10 p-2 shadow-3xl">
                              <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Operasyonlar</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuItem className="rounded-2xl px-4 py-3 text-sm font-bold text-white hover:bg-white/5 cursor-pointer">
                                 <ExternalLink className="w-4 h-4 mr-3 text-primary" /> Canlı Dağıtımı Görüntüle
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-2xl px-4 py-3 text-sm font-bold text-white hover:bg-white/5 cursor-pointer">
                                 <Settings className="w-4 h-4 mr-3 text-zinc-400" /> Matrisi Geçersiz Kıl
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuItem 
                                 onClick={() => handleDelete(bot.id)}
                                 className="rounded-2xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                 <Trash2 className="w-4 h-4 mr-3" /> Varlığı Temizle (Purge)
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
         
         {filteredBots.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center gap-4">
               <Bot className="w-16 h-16 text-zinc-800" />
               <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">Arama kriterlerinde hiçbir sinirsel düğüm tespit edilemedi.</p>
            </div>
         )}
      </Card>
    </div>
  );
}
