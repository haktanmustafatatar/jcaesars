"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Globe, 
  FileText, 
  Type, 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  ChevronRight,
  Database,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function KnowledgePage() {
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states
  const [newUrl, setNewUrl] = useState("");
  const [newText, setNewText] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const res = await fetch("/api/chatbots");
      if (res.ok) {
        const data = await res.json();
        setChatbots(data);
        if (data.length > 0) {
          setSelectedBot(data[0]);
          fetchSources(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSources = async (botId: string) => {
    try {
      const res = await fetch(`/api/knowledge?chatbotId=${botId}`);
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  const handleAddSource = async (type: string) => {
    if (!selectedBot) return;
    
    const payload: any = {
      chatbotId: selectedBot.id,
      type,
      name: type === "WEBSITE" ? newUrl : newTitle || "Untitled Source",
    };

    if (type === "WEBSITE") payload.url = newUrl;
    if (type === "TEXT") payload.content = newText;

    try {
      setIsAdding(true);
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Knowledge source added successfully");
        setNewUrl("");
        setNewText("");
        setNewTitle("");
        fetchSources(selectedBot.id);
      } else {
        toast.error("Failed to add knowledge source");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Source removed");
        setSources(sources.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error("Failed to remove source");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-zinc-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
            Neural Knowledge Hub
          </h1>
          <p className="text-zinc-500 font-medium">
            Feed your AI agents with curated data and autonomous intelligence
          </p>
        </div>

        {/* Bot Selector */}
        <div className="flex flex-col gap-2 min-w-[240px]">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Active Intelligence Unit</span>
          <select 
            value={selectedBot?.id} 
            onChange={(e) => {
              const bot = chatbots.find(b => b.id === e.target.value);
              setSelectedBot(bot);
              fetchSources(bot.id);
            }}
            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl h-12 px-4 font-bold text-zinc-900 focus:outline-none focus:border-primary/30 transition-all appearance-none cursor-pointer"
          >
            {chatbots.map(bot => (
              <option key={bot.id} value={bot.id}>{bot.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-[40px] border-2 border-zinc-100 shadow-2xl shadow-black/5 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">Inject Knowledge</CardTitle>
              <CardDescription className="font-medium">Choose a source to expand your agent&apos;s mind</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Tabs defaultValue="website" className="w-full">
                <TabsList className="grid grid-cols-3 gap-2 bg-zinc-50 p-1 rounded-2xl mb-8">
                  <TabsTrigger value="website" className="rounded-xl font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Web
                  </TabsTrigger>
                  <TabsTrigger value="file" className="rounded-xl font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    File
                  </TabsTrigger>
                  <TabsTrigger value="text" className="rounded-xl font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Type className="w-4 h-4 mr-2" />
                    Q&A
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="website" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Website URL</label>
                    <Input 
                      placeholder="https://example.com" 
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="h-12 rounded-2xl border-2 border-zinc-100 focus:border-primary/30 focus:ring-0 transition-all font-medium"
                    />
                  </div>
                  <Button 
                    onClick={() => handleAddSource("WEBSITE")}
                    disabled={isAdding || !newUrl}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white rounded-2xl h-12 font-bold transition-all shadow-lg"
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Crawl & Index
                  </Button>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div className="border-2 border-dashed border-zinc-100 rounded-[30px] p-10 flex flex-col items-center justify-center gap-4 bg-zinc-50/50 hover:bg-zinc-50 transition-all group cursor-pointer">
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-zinc-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-zinc-900">Drop PDF or Document</p>
                      <p className="text-xs text-zinc-400 font-medium">Supports up to 25MB</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-tighter italic">Upload logic pending integration</p>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Context Title</label>
                      <Input 
                        placeholder="Company Overview" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="h-12 rounded-2xl border-2 border-zinc-100 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Direct Knowledge</label>
                      <textarea 
                        rows={6}
                        placeholder="Paste text content here..."
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        className="w-full rounded-[30px] border-2 border-zinc-100 p-6 font-medium focus:outline-none focus:border-primary/30 transition-all resize-none bg-zinc-50/30"
                      />
                    </div>
                    <Button 
                      onClick={() => handleAddSource("TEXT")}
                      disabled={isAdding || !newText}
                      className="w-full bg-zinc-950 hover:bg-zinc-900 text-white rounded-2xl h-12 font-bold shadow-lg"
                    >
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Sync Context
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sources List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-zinc-400" />
              Active Knowledge Base
            </h2>
            <Badge variant="outline" className="rounded-full px-3 py-1 bg-zinc-50 font-bold text-zinc-500 border-zinc-200">
              {sources.length} Sources
            </Badge>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sources.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Search className="w-10 h-10 text-zinc-200" />
                  </div>
                  <div className="max-w-[240px]">
                    <h3 className="font-bold text-zinc-900">Memory Empty</h3>
                    <p className="text-sm text-zinc-400 font-medium">Initialize knowledge injection to train your autonomous unit.</p>
                  </div>
                </motion.div>
              ) : (
                sources.map((source, index) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="rounded-[30px] border-2 border-zinc-50 hover:border-zinc-100 transition-all group overflow-hidden bg-white shadow-sm hover:shadow-md">
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            source.type === "WEBSITE" ? "bg-blue-50 text-blue-500" :
                            source.type === "TEXT" ? "bg-purple-50 text-purple-500" :
                            "bg-amber-50 text-amber-500"
                          }`}>
                            {source.type === "WEBSITE" ? <Globe className="w-6 h-6" /> :
                             source.type === "TEXT" ? <Type className="w-6 h-6" /> :
                             <FileText className="w-6 h-6" />}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-zinc-900 group-hover:text-primary transition-colors flex items-center gap-2">
                              {source.name}
                              {source.url && <ExternalLink className="w-3 h-3 text-zinc-300" />}
                            </h4>
                            <div className="flex items-center gap-3">
                              <Badge className={`rounded-full px-2 py-0 text-[9px] font-black tracking-wider ${
                                source.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" :
                                source.status === "ERROR" ? "bg-red-50 text-red-600 border-red-100" :
                                "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                              }`} variant="outline">
                                {source.status === "COMPLETED" ? (
                                  <span className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> SYNCED</span>
                                ) : source.status === "ERROR" ? (
                                  <span className="flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> FAILED</span>
                                ) : (
                                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> INDEXING</span>
                                )}
                              </Badge>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {new Date(source.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(source.id)}
                          className="rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
