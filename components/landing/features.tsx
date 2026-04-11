"use client";

import { motion } from "framer-motion";
import {
  Globe,
  FileText,
  Sparkles,
  Code,
  BarChart3,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function Features() {
  const t = useTranslations("Features");

  const featuresList = [
    {
      icon: Globe,
      title: t("f1Title"),
      description: t("f1Desc"),
      color: "bg-blue-500"
    },
    {
      icon: FileText,
      title: t("f2Title"),
      description: t("f2Desc"),
      color: "bg-emerald-500"
    },
    {
      icon: Sparkles,
      title: t("f3Title"),
      description: t("f3Desc"),
      color: "bg-pink-500"
    },
    {
      icon: Code,
      title: t("f4Title"),
      description: t("f4Desc"),
      color: "bg-amber-500"
    },
    {
      icon: BarChart3,
      title: t("f5Title"),
      description: t("f5Desc"),
      color: "bg-indigo-500"
    },
    {
      icon: Terminal,
      title: t("f6Title"),
      description: t("f6Desc"),
      color: "bg-zinc-900"
    },
  ];

  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest"
          >
            <Cpu className="w-3 h-3" />
            {t("badge")}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.95]"
          >
            {t("title1")} <br />
            <span className="text-primary italic">{t("titleAI")}</span> {t("title2")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 font-medium leading-relaxed"
          >
            {t("description")}
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuresList.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -12, transition: { duration: 0.4 } }}
              className="group relative p-10 rounded-[40px] border border-black/5 bg-white/40 backdrop-blur-sm hover:bg-white hover:border-white hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Zap className="w-5 h-5 text-primary fill-primary/10" />
              </div>
              
              <div className={`w-16 h-16 rounded-3xl ${feature.color} flex items-center justify-center mb-8 shadow-2xl shadow-black/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-black tracking-tight mb-4 text-zinc-900 uppercase tracking-tighter">{feature.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-8 pt-8 border-t border-black/[0.03] opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 group/btn">
                    {t("explore")}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </section>
  );
}
