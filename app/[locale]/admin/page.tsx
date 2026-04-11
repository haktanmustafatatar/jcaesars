"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Bot,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  Zap,
  Globe,
  Database,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Sample chart data (In production, this would be fetched from /api/admin/analytics)
const chartData = [
  { name: "00:00", messages: 240, tokens: 1200 },
  { name: "04:00", messages: 130, tokens: 800 },
  { name: "08:00", messages: 980, tokens: 4500 },
  { name: "12:00", messages: 3908, tokens: 18000 },
  { name: "16:00", messages: 4800, tokens: 22000 },
  { name: "20:00", messages: 3800, tokens: 15000 },
  { name: "23:59", messages: 4300, tokens: 19000 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/system/health")
        ]);
        
        const statsData = await statsRes.json();
        const healthData = await healthRes.json();
        
        setStats(statsData);
        setHealth(healthData);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <ShieldCheck className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs">Küresel Çekirdek Senkronize Ediliyor...</p>
      </div>
    );
  }

  const kpis = [
    { title: "Toplam Varlık", value: stats?.totalUsers || 0, sub: "Kayıtlı Kimlikler", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Aktif Ajanlar", value: stats?.totalChatbots || 0, sub: "Neural Düğümler", icon: Bot, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Mesaj Akışı", value: (stats?.totalMessages || 0).toLocaleString(), sub: "Son 24s Aktivite", icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Tahmini MRR", value: `$${(stats?.revenueMTD || 0).toLocaleString()}`, sub: "Canlı Gelir Akışı", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black text-[9px] px-3 py-1 tracking-widest uppercase">Platform Komuta Merkezi</Badge>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
            Evrensel Zeka Genel Bakışı
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
              <RefreshCw className="w-6 h-6 text-zinc-800" />
            </motion.div>
          </h1>
          <p className="text-zinc-500 font-medium">Küresel JCaesar ağındaki gerçek zamanlı sinirsel aktivite izleniyor.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold transition-all">
             <Clock className="w-4 h-4 mr-2" />
             Son 24 Saat
           </Button>
           <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
             Sistem Raporu Oluştur
           </Button>
        </div>
      </div>

      {/* KPI Cloud */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-[32px] bg-zinc-900/40 border-white/5 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
               <CardHeader className="pb-2 relative z-10">
                 <div className="flex items-center justify-between">
                   <div className={`p-2 rounded-xl ${kpi.bg}`}>
                     <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                   </div>
                   <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-primary transition-colors" />
                 </div>
               </CardHeader>
               <CardContent className="relative z-10">
                 <div className="text-3xl font-black text-white mb-1">{kpi.value}</div>
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{kpi.title}</h3>
                 <p className="text-[10px] font-bold text-zinc-600 mt-2">{kpi.sub}</p>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Pulse Analytics */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[40px] bg-zinc-900/40 border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <CardHeader className="px-0 pt-0 mb-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-white">Sİnİrsel Aktivite Akışı</CardTitle>
              <CardDescription className="text-zinc-500 font-bold">Zaman döngüsü başına küresel mesaj ve token hacmi</CardDescription>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase">Mesajlar</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase">Tokenlar</span>
               </div>
            </div>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e25b31" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e25b31" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#ffffff15" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderRadius: "16px", border: "1px solid #ffffff10", fontSize: "12px", color: "#fff" }}
                  cursor={{ stroke: '#e25b31', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#e25b31" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMessages)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-8">
           {/* Infrastructure Health */}
           <Card className="rounded-[40px] bg-zinc-900/40 border-white/5 p-8">
              <CardTitle className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Sistem Tanılama
              </CardTitle>
              <div className="space-y-6">
                 {health?.services && Object.entries(health.services).map(([name, svc]: any) => (
                    <div key={name} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${svc.status === 'operational' || svc.status === 'active' ? 'bg-green-500 shadow-glow shadow-green-500/50' : 'bg-red-500'}`} />
                          <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{name === 'database' ? 'Verİtabanı' : name === 'redis' ? 'Bellek Hİzmetİ' : name}</span>
                       </div>
                       <span className="text-[10px] font-black text-white">{svc.latency || 'AKTİF'}</span>
                    </div>
                 ))}
                 
                 {!health?.services && (
                    <p className="text-xs text-zinc-500 text-center py-8">Çekirdek Tanılama ile iletişim kuruluyor...</p>
                 )}
              </div>
           </Card>

           {/* Global Events Cloud */}
           <Card className="rounded-[40px] bg-zinc-950 border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Globe className="w-12 h-12 text-primary" />
              </div>
              <CardHeader className="px-0 pt-0 mb-6">
                 <CardTitle className="text-lg font-black text-white">Sİnİrsel Olaylar</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                 {stats?.recentActivity?.map((act: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-3xl bg-zinc-900/50 hover:bg-zinc-900 group/item cursor-default transition-all">
                       <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                          <Bot className="w-4 h-4 text-primary" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white mb-1">{act.title === 'New Agent Deployed' ? 'Yeni Ajan Dağıtıldı' : act.title}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{act.detail}</p>
                       </div>
                    </div>
                 ))}
                 
                 {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                    <div className="text-center py-10">
                       <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest italic">Yakın zamanda sinirsel dalgalanma tespit edilmedi.</p>
                    </div>
                 )}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
