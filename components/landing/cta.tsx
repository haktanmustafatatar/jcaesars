"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden bg-zinc-950 text-white rounded-[64px] mx-4 sm:mx-8 mb-8">
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/20" />
          Ready to scale?
        </motion.div>

        <motion.h2
          className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Transform your <br />
          <span className="text-primary italic">Intelligence</span> today.
        </motion.h2>

        <motion.p
          className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Join 10,000+ businesses using J.Caesar Agent to deliver 
          instant, high-fidelity AI support across all channels.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-white text-zinc-950 hover:bg-zinc-200 px-10 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 group shadow-2xl shadow-white/5"
            >
              Start Building Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 rounded-[24px] font-black text-sm uppercase tracking-widest border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 translate-y-0.5"
            >
              Talk to Strategy
            </Button>
          </Link>
        </motion.div>

        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.3 }}
           className="flex items-center justify-center gap-8 pt-8 border-t border-white/5"
        >
           <div className="flex items-center gap-2 group cursor-pointer">
              <Zap className="w-5 h-5 text-primary fill-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Instant Deployment</span>
           </div>
           <div className="flex items-center gap-2 group cursor-pointer">
              <Zap className="w-5 h-5 text-primary fill-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Enterprise Security</span>
           </div>
        </motion.div>
      </div>
    </section>
  );
}
