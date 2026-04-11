"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "WEBSITE" | "TEXT" | null;
  chatbotId: string;
  onSuccess: () => void;
}

export function SourceDialog({ 
  open, 
  onOpenChange, 
  type, 
  chatbotId,
  onSuccess 
}: SourceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = type === "WEBSITE" 
        ? { type, name: name || "Website Source", url }
        : { type, name: name || "Manual Text", content };

      const res = await fetch(`/api/chatbots/${chatbotId}/data-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`${type === "WEBSITE" ? "Website" : "Text"} source added successfully`);
        onSuccess();
        onOpenChange(false);
        // Reset
        setUrl("");
        setContent("");
        setName("");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add source");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[40px] border-muted/40 p-8 max-w-lg shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${type === "WEBSITE" ? "bg-blue-500" : "bg-purple-500"}`}>
              {type === "WEBSITE" ? <Globe className="w-5 h-5 text-white" /> : <MessageSquare className="w-5 h-5 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Add {type === "WEBSITE" ? "Website" : "Text"} Source
              </DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium">
                {type === "WEBSITE" 
                  ? "Enter the URL of the site you want to crawl." 
                  : "Paste the content you want the AI to learn."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Internal Name (Optional)</Label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium"
              placeholder={type === "WEBSITE" ? "Vareno Store" : "Company Bio"}
            />
          </div>

          {type === "WEBSITE" ? (
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Website URL</Label>
              <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                type="url"
                className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium"
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Text Content</Label>
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[200px] rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium resize-none p-6"
                placeholder="Paste your content here..."
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="rounded-2xl h-12 px-8 font-bold border-zinc-200 hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-2xl h-12 px-8 font-bold shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Initialize Synchronization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
