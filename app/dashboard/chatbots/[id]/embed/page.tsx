"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Bot,
  Code, 
  Copy, 
  Check, 
  ChevronLeft, 
  Globe, 
  Settings, 
  Palette,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EmbedPage() {
  const params = useParams();
  const id = params.id as string;
  const [chatbot, setChatbot] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    fetchChatbot();
    setAppUrl(window.location.origin);
  }, [id]);

  const fetchChatbot = async () => {
    try {
      const res = await fetch(`/api/chatbots/${id}`);
      if (res.ok) {
        const data = await res.json();
        setChatbot(data);
      }
    } catch (error) {
      console.error("Error fetching chatbot:", error);
    }
  };

  const embedCode = `<script
  src="${appUrl}/widget.js"
  data-chatbot-id="${id}"
  defer
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Premium Header */}
      <div className="flex items-center gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
        <Link href={`/dashboard/chatbots/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
            Embed Synchronization
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Deploy your autonomous agent to any web infrastructure
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Embed Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[40px] border-2 border-zinc-100 bg-white/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden">
            <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-zinc-900">Script Integration</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Direct HTML Implementation</p>
                </div>
              </div>
              <Button 
                onClick={copyToClipboard}
                variant="outline" 
                className="rounded-2xl h-11 px-6 border-zinc-200 hover:bg-zinc-50 font-bold transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied" : "Copy Code"}
              </Button>
            </CardHeader>

            <CardContent className="p-10 pt-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[30px] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <pre className="relative p-8 rounded-3xl bg-zinc-950 text-zinc-300 font-mono text-sm overflow-x-auto leading-relaxed border border-zinc-800 shadow-2xl">
                  <code>{embedCode}</code>
                </pre>
              </div>

              <div className="mt-10 flex items-start gap-4 p-6 rounded-3xl bg-blue-50/50 border border-blue-100">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Deployment Instructions</h4>
                  <p className="text-sm text-blue-800/70 font-medium leading-relaxed">
                    Paste this snippet within the <code className="bg-blue-100/50 px-1 rounded">&lt;head&gt;</code> or <code className="bg-blue-100/50 px-1 rounded">&lt;body&gt;</code> tag of your website. The JCaesar widget will automatically initialize and connect to this agent's neural core.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[40px] border-2 border-zinc-100 bg-white p-8 group cursor-pointer hover:border-primary/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-zinc-400 group-hover:text-primary" />
              </div>
              <h4 className="font-bold text-lg text-zinc-900 mb-2">WordPress & CMS</h4>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-4">View dedicated guides for WordPress, Shopify, and Webflow integration.</p>
              <Button variant="link" className="p-0 h-auto font-bold text-zinc-900 text-sm">View Guide →</Button>
            </Card>
            <Card className="rounded-[40px] border-2 border-zinc-100 bg-white p-8 group cursor-pointer hover:border-primary/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-zinc-400 group-hover:text-primary" />
              </div>
              <h4 className="font-bold text-lg text-zinc-900 mb-2">API Integration</h4>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-4">Build your own UI and connect to our RAG engine via REST API.</p>
              <Button variant="link" className="p-0 h-auto font-bold text-zinc-900 text-sm">API Docs →</Button>
            </Card>
          </div>
        </div>

        {/* Customization Sidebar */}
        <div className="space-y-8">
          <Card className="rounded-[40px] border-2 border-zinc-100 bg-white shadow-2xl shadow-black/5 overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Palette className="w-3 h-3" />
                  Appearance Settings
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Primary Brand Color</p>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: chatbot?.primaryColor || "#e25b31" }} />
                      <span className="text-xs font-bold text-zinc-900">{chatbot?.primaryColor || "#e25b31"}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Widget Position</p>
                    <span className="text-xs font-bold text-zinc-900">{chatbot?.position || "Bottom Right"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Sparkles className="w-3 h-3" />
                  Security Protocol
                </h3>
                <div className="p-6 rounded-3xl border-2 border-primary/10 bg-primary/5">
                  <p className="text-xs font-bold text-zinc-700 leading-relaxed">
                    Agent access is restricted to verified domains. Ensure your domain is listed in settings.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-8 rounded-[40px] bg-zinc-100 border-2 border-zinc-200 group cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-6 h-6 text-zinc-400 group-hover:rotate-12 transition-transform" />
              <h4 className="text-lg font-bold text-zinc-900">Agent Details</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-500">Platform ID</span>
                <span className="text-zinc-900 font-bold truncate max-w-[120px]">{id}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-500">Operational Mode</span>
                <span className="text-zinc-900 font-bold">Autonomous</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
