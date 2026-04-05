"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, Zap, ShieldCheck, Cpu } from "lucide-react";

const footerLinks = {
  Intelligence: [
    { label: "Elite Features", href: "#features" },
    { label: "Pricing Models", href: "#pricing" },
    { label: "API Reference", href: "/docs" },
    { label: "Integrations", href: "/integrations" },
  ],
  Architecture: [
    { label: "About Strategy", href: "/about" },
    { label: "Knowledge Base", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Strategy Desk", href: "/contact" },
  ],
  Security: [
    { label: "Privacy Protocol", href: "/privacy" },
    { label: "Terms of Autonomy", href: "/terms" },
    { label: "Safe Haven", href: "/security" },
    { label: "Enterprise SLA", href: "/sla" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-black/[0.03] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-16">
          {/* Brand Identity */}
          <div className="col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-all duration-500 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                 <Zap className="w-6 h-6 text-white relative z-10 fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">J.CAESAR</span>
            </Link>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-xs">
              Pioneering high-fidelity AI agents for the next era of business autonomy. Train, deploy, and scale with absolute precision.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/[0.03] flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigational Architecture */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold text-zinc-600 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Status / Compliance */}
          <div className="space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Status</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-2 group cursor-default">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-xs font-black text-zinc-800 uppercase tracking-tighter">Systems Operational</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.03] space-y-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <p className="text-[10px] font-bold text-zinc-500 leading-tight">ISO/IEC 27001 Certified Security Protocol</p>
                </div>
             </div>
          </div>
        </div>

        {/* Global Compliance & Rights */}
        <div className="mt-24 pt-8 border-t border-black/[0.03] flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
             <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
               © {new Date().getFullYear()} J.CAESAR AUTONOMY.
             </p>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-black/[0.03] text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                <Cpu className="w-3 h-3" />
                Architecture v2.4.0
             </div>
          </div>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/sla"
              className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
            >
              Architecture SLA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
