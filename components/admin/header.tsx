"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Activity, 
  Settings, 
  Zap, 
  Globe, 
  Command,
  CloudLightning,
  MonitorCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AdminHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [systemPulse, setSystemPulse] = useState<"HEALTHY" | "DEGRADED" | "CRITICAL">("HEALTHY");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-30 flex h-24 items-center justify-between px-8 transition-all duration-500 border-b border-transparent ${
        scrolled ? "bg-zinc-950/80 backdrop-blur-3xl border-white/5 py-4" : "bg-transparent py-8"
      }`}
    >
      <div className="flex items-center gap-10 flex-1">
        {/* Universal Search */}
        <div className="relative group max-w-md w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            className="w-full bg-white/5 hover:bg-white/10 border-white/5 h-12 rounded-2xl pl-12 pr-12 focus:bg-zinc-900 transition-all font-medium placeholder:text-zinc-600 focus:ring-0 focus:border-primary/20"
            placeholder="Evrensel Admin Araması..." 
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* System Pulse Indicator */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl">
           <div className="relative flex items-center justify-center">
              <div className={`absolute w-3 h-3 rounded-full animate-ping opacity-75 ${systemPulse === "HEALTHY" ? "bg-green-500" : "bg-red-500"}`} />
              <div className={`relative w-2 h-2 rounded-full shadow-glow ${systemPulse === "HEALTHY" ? "bg-green-500 shadow-green-500/50" : "bg-red-500"}`} />
           </div>
           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Platform Nabzı</span>
           <Badge variant="outline" className="h-5 rounded-full text-[9px] font-black uppercase text-green-500 border-green-500/20 bg-green-500/10">14MS</Badge>
        </div>

        <div className="h-8 w-[1px] bg-white/5 mx-2" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-primary rounded-full border-2 border-zinc-950" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
