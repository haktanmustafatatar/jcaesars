"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Loader2, 
  Facebook, 
  Instagram, 
  Phone,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface MetaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  chatbotId: string;
  onSuccess: () => void;
}

export function MetaSelector({
  open,
  onOpenChange,
  sessionId,
  chatbotId,
  onSuccess
}: MetaSelectorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (open && sessionId) {
      fetchSessionData();
    }
  }, [open, sessionId]);

  const fetchSessionData = async () => {
    setIsLoading(true);
    try {
      // We'll reuse the channels GET API to find our temp session or create a specific one
      const res = await fetch(`/api/chatbots/${chatbotId}/channels`);
      if (res.ok) {
        const channels = await res.json();
        const session = channels.find((c: any) => c.id === sessionId);
        if (session) {
          setSessionData(session);
        }
      }
    } catch (error) {
      toast.error("Failed to load connection data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/channels/meta-finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          selectedId,
          type: sessionData.type
        }),
      });

      if (res.ok) {
        toast.success("Channel connected successfully!");
        onSuccess();
        onOpenChange(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to finalize connection");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccountsList = () => {
    if (!sessionData) return [];
    if (sessionData.type === "WHATSAPP") return sessionData.config.whatsappAccounts || [];
    if (sessionData.type === "INSTAGRAM") {
       return (sessionData.config.pages || [])
        .filter((p: any) => p.instagram_business_account)
        .map((p: any) => ({
          id: p.instagram_business_account.id,
          name: p.instagram_business_account.name || p.instagram_business_account.username,
          username: p.instagram_business_account.username,
          pageName: p.name
        }));
    }
    return sessionData.config.pages || [];
  };

  const accounts = getAccountsList();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {sessionData?.type === "INSTAGRAM" && <Instagram className="w-6 h-6 text-pink-500" />}
            {sessionData?.type === "FACEBOOK" && <Facebook className="w-6 h-6 text-blue-600" />}
            {sessionData?.type === "WHATSAPP" && <Phone className="w-6 h-6 text-emerald-500" />}
            Select Account
          </DialogTitle>
          <DialogDescription className="font-medium">
            Choose which {sessionData?.type.toLowerCase()} account to connect to this chatbot.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Retrieving Assets...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-amber-900">No matching accounts found</p>
                <p className="text-xs text-amber-700 mt-1">Make sure you have a Professional Instagram account linked to a Facebook Page.</p>
              </div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {accounts.map((acc: any) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedId(acc.id)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all
                    ${selectedId === acc.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-zinc-100 hover:border-zinc-200 bg-zinc-50/50"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center font-bold text-zinc-400">
                      {acc.name?.charAt(0) || "A"}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-zinc-900">{acc.name}</p>
                      {acc.username && <p className="text-[10px] font-medium text-zinc-400">@{acc.username}</p>}
                      {acc.pageName && <p className="text-[10px] font-medium text-zinc-400">via {acc.pageName}</p>}
                    </div>
                  </div>
                  {selectedId === acc.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleFinalize} 
            disabled={!selectedId || isSubmitting}
            className="rounded-xl px-8 font-bold bg-zinc-950 hover:bg-zinc-900 shadow-lg shadow-black/10"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
