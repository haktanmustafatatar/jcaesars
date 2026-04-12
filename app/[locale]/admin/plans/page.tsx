"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
  RefreshCw,
  Coins,
  ShieldCheck,
  Zap,
  Bot,
  MoreVertical,
  Settings2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      toast.error("Billing mesh synchronization failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Ödeme Defterİne Erİşİlİyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Badge variant="outline" className="mb-3 rounded-full bg-orange-500/10 text-orange-500 border-orange-500/20 font-black text-[9px] px-3 tracking-widest uppercase">Gelİr Yönetİmİ</Badge>
           <h1 className="text-4xl font-black tracking-tight text-white mb-2">Üyelik ve Plan Matrisi</h1>
           <p className="text-zinc-500 font-medium">Fiyatlandırma mimarisini yeniden yapılandırın ve küresel abonelik gelirini izleyin.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 transition-all">
             <Plus className="w-4 h-4 mr-2" />
             Yeni Kademe Oluştur
           </Button>
           <Button onClick={fetchPlans} variant="outline" className="h-12 w-12 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 transition-all">
              <RefreshCw className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {plans.map((plan, i) => (
            <motion.div
               key={plan.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
            >
               <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 hover:border-primary/20 transition-all duration-500 group relative flex flex-col h-full">
                  <div className="absolute top-0 right-0 p-8">
                     <div className={`p-4 rounded-3xl ${plan.priceMonthly > 50 ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                        <Package className={`w-6 h-6 ${plan.priceMonthly > 50 ? 'text-amber-500' : 'text-blue-500'}`} />
                     </div>
                  </div>
                  
                  <CardHeader className="p-8 pb-0">
                     <CardTitle className="text-2xl font-black text-white">{plan.name}</CardTitle>
                     <p className="text-4xl font-black text-white mt-4 flex items-baseline gap-1">
                        ${plan.priceMonthly}
                        <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">/AY</span>
                     </p>
                  </CardHeader>

                  <CardContent className="p-8 flex-1 flex flex-col justify-between pt-10">
                     <div className="space-y-6 mb-8">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Küresel Katılım</span>
                           <span className="text-sm font-black text-white">{plan._count?.subscriptions || 0} Varlık</span>
                        </div>
                        <Progress value={Math.min((plan._count?.subscriptions / 100) * 100, 100)} className="h-1 bg-zinc-950" />
                        
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold text-zinc-300">{plan.messageLimit?.toLocaleString() || 'Sınırsız'} Mesaj/ay</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Bot className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-bold text-zinc-300">{plan.chatbotLimit} Aktif Neural Düğüm</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 pt-4">
                        <Button className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold transition-all">
                           Yapılandır
                        </Button>
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-white/5 text-zinc-500">
                                 <MoreVertical className="w-5 h-5" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent className="rounded-3xl bg-zinc-950 border-white/10 p-2">
                              <DropdownMenuItem className="rounded-2xl px-4 py-3 text-sm font-bold text-white hover:bg-white/5 cursor-pointer">
                                 <Settings2 className="w-4 h-4 mr-3" /> Gelişmiş Geçersiz Kılma
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </CardContent>
               </Card>
            </motion.div>
         ))}

         {/* Add New Plan Placeholder */}
         <button className="rounded-[40px] border-2 border-dashed border-white/5 bg-zinc-900/10 hover:bg-white/5 hover:border-primary/20 transition-all flex flex-col items-center justify-center p-12 group">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all">
               <Plus className="w-8 h-8 text-zinc-500 group-hover:text-primary" />
            </div>
            <p className="mt-4 text-sm font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">Yeni Kademe Dağıt</p>
         </button>
      </div>
    </div>
  );
}
