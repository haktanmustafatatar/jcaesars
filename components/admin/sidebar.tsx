"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  Key,
  Coins,
  Package,
  Share2,
  Activity,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  Zap,
  Globe,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, category: "Çekirdek" },
  { href: "/admin/users", label: "Kimlik Yönetimi", icon: Users, category: "Çekirdek" },
  { href: "/admin/chatbots", label: "Ajan Denetimi", icon: Cpu, category: "Çekirdek" },
  
  { href: "/admin/plans", label: "Plan & Ödeme", icon: Package, category: "Ticaret" },
  { href: "/admin/tokens", label: "Kullanım Analizi", icon: Coins, category: "Ticaret" },
  
  { href: "/admin/api-keys", label: "Neural Anahtarlar", icon: Key, category: "Sistem" },
  { href: "/admin/system", label: "Altyapı Durumu", icon: Database, category: "Sistem" },
  { href: "/admin/settings", label: "Platform Ayarları", icon: Settings, category: "Sistem" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/system/health")
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: "error" }));
  }, []);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-500 border-r border-white/5 bg-zinc-950 text-white flex flex-col group/sidebar shadow-2xl overflow-hidden",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Glossy Header Effect */}
      <div className="absolute top-0 left-0 w-full h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(226,91,49,0.1),transparent)] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 mb-4 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-base tracking-tight whitespace-nowrap">JCaesar Admin</span>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">Neural Core Konsolu</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto">
             <Shield className="w-5 h-5 text-primary" />
          </div>
        )}

        {/* Collapse Trigger - Hidden on mobile if needed, but here simple lg logic */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide py-4">
        {["Çekirdek", "Ticaret", "Sistem"].map(category => (
           <div key={category} className="space-y-2">
             {!isCollapsed && (
               <p className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">{category}</p>
             )}
             <div className="space-y-1">
               {navItems.filter(item => item.category === category).map((item) => {
                 const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     className={cn(
                       "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative group",
                       isActive
                         ? "text-white bg-white/5 shadow-inner"
                         : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                     )}
                   >
                     {isActive && (
                       <motion.div 
                         layoutId="active-pill" 
                         className="absolute left-0 w-1 h-6 bg-primary rounded-full" 
                         transition={{ type: "spring", stiffness: 300, damping: 30 }}
                       />
                     )}
                     <item.icon className={cn(
                       "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                       isActive ? "text-primary" : "text-zinc-500"
                     )} />
                     {!isCollapsed && <span>{item.label}</span>}
                     {item.label === "Altyapı Durumu" && !isCollapsed && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-glow shadow-green-500/50" />
                     )}
                   </Link>
                 );
               })}
             </div>
           </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className={cn(
        "p-6 border-t border-white/5 space-y-6 bg-zinc-900/10 backdrop-blur-3xl relative z-10",
        isCollapsed && "items-center"
      )}>
        {!isCollapsed && (
           <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Durum</span>
                 <Badge variant="outline" className="rounded-full h-5 text-[9px] font-black uppercase text-green-500 border-green-500/20 bg-green-500/10">STABİL</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="bg-white/5 p-3 rounded-2xl flex flex-col gap-1">
                    <Database className="w-3 h-3 text-blue-400" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">DB SEKRON</span>
                    <span className="text-[10px] font-bold text-white">99.9%</span>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl flex flex-col gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Q-YÜKÜ</span>
                    <span className="text-[10px] font-bold text-white">DÜŞÜK</span>
                 </div>
              </div>
           </div>
        )}

        <div className="flex items-center gap-3">
          <div className="relative group/user">
             <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10 rounded-2xl", } }} />
             <div className="absolute inset-0 bg-primary/20 rounded-2xl blur group-hover/user:opacity-100 opacity-0 transition-opacity" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">Süper Admin</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tam Erişim Yetkisi</p>
            </div>
          )}
          <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
          >
             {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
