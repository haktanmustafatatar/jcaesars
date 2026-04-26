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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MessageSquare, 
  Instagram, 
  Facebook, 
  Key, 
  Phone, 
  ShieldCheck,
  Loader2,
  Globe
} from "lucide-react";

import { toast } from "sonner";

interface ConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "SHOPIFY" | "WOOCOMMERCE" | "GOOGLE_CALENDAR" | null;
  chatbotId: string;
  onSuccess: () => void;
}

export function ConnectModal({
  open,
  onOpenChange,
  type,
  chatbotId,
  onSuccess
}: ConnectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accessToken: "",
    phoneNumberId: "",
    pageId: "",
    verifyToken: "jcaesar_" + Math.random().toString(36).substring(7),
  });

  const titles = {
    WHATSAPP: "Connect WhatsApp Business",
    INSTAGRAM: "Connect Instagram DM",
    FACEBOOK: "Connect Facebook Messenger",
    SHOPIFY: "Connect Shopify Store",
    WOOCOMMERCE: "Connect WooCommerce",
    GOOGLE_CALENDAR: "Google Calendar Booking"
  };

  const descriptions = {
    WHATSAPP: "Link your WhatsApp Business account using the secure Meta OAuth flow.",
    INSTAGRAM: "Connect your Instagram Professional DM account to your AI agent.",
    FACEBOOK: "Allow your agent to respond to Facebook Page messages automatically.",
    SHOPIFY: "Integrate your Shopify store to allow the AI to search products and check stock.",
    WOOCOMMERCE: "Connect your WooCommerce store to sync product catalog and inventory.",
    GOOGLE_CALENDAR: "Allow the AI to book appointments directly to your primary calendar."
  };

  const isMetaType = type === "WHATSAPP" || type === "INSTAGRAM" || type === "FACEBOOK";

  const handleSubmit = async () => {
    if (isMetaType) {
      window.location.href = `/api/auth/meta/login?chatbotId=${chatbotId}&type=${type}`;
      return;
    }

    setIsLoading(true);
    try {
      let payload: any = { type, name: titles[type!] };
      
      if (type === "SHOPIFY") {
        payload.config = { shopDomain: formData.pageId, accessToken: formData.accessToken };
      } else if (type === "WOOCOMMERCE") {
        payload.config = { baseUrl: formData.pageId, consumerKey: formData.accessToken, consumerSecret: formData.phoneNumberId };
      } else if (type === "GOOGLE_CALENDAR") {
        payload.config = { clientId: formData.pageId, clientSecret: formData.phoneNumberId, refreshToken: formData.accessToken };
      }

      const res = await fetch(`/api/chatbots/${chatbotId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`${type} connected successfully!`);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(`Failed to connect ${type}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="p-10 space-y-8">
          <DialogHeader className="space-y-4">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-xl ${
              type === "WHATSAPP" ? "bg-emerald-500" : 
              type === "INSTAGRAM" ? "bg-pink-500" : 
              type === "FACEBOOK" ? "bg-blue-600" :
              type === "SHOPIFY" ? "bg-zinc-950" :
              type === "WOOCOMMERCE" ? "bg-purple-600" :
              "bg-red-500"
            }`}>
              {type === "WHATSAPP" ? <MessageSquare className="w-8 h-8 text-white" /> : 
               type === "INSTAGRAM" ? <Instagram className="w-8 h-8 text-white" /> : 
               type === "FACEBOOK" ? <Facebook className="w-8 h-8 text-white" /> :
               type === "SHOPIFY" ? <Globe className="w-8 h-8 text-white" /> :
               <ShieldCheck className="w-8 h-8 text-white" />
              }
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900">{type ? titles[type] : ""}</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium">{type ? descriptions[type] : ""}</DialogDescription>
            </div>
          </DialogHeader>

          {isMetaType ? (
            <div className="space-y-6">
              <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Secure OAuth Connection</p>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">
                    Meta will allow you to select which pages or business accounts to connect. No login credentials will be stored on our servers.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSubmit}
                className="w-full h-16 rounded-3xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Facebook className="w-6 h-6 fill-white" />
                Login with Facebook
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">
                  {type === "SHOPIFY" ? "Admin API Access Token" : 
                   type === "WOOCOMMERCE" ? "Consumer Key" : 
                   type === "GOOGLE_CALENDAR" ? "Refresh Token" : "Access Token"}
                </Label>
                <div className="relative">
                  <Input 
                    value={formData.accessToken}
                    onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 pl-12 font-mono text-xs focus:bg-white transition-all shadow-none"
                    placeholder={type === "SHOPIFY" ? "shpat_..." : "..."} 
                  />
                  <Key className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">
                  {type === "SHOPIFY" ? "Store URL (myshopify.com)" : 
                   type === "WOOCOMMERCE" ? "Site URL" : 
                   type === "GOOGLE_CALENDAR" ? "Client ID" : "Page/Account ID"}
                </Label>
                <div className="relative">
                  <Input 
                    value={formData.pageId}
                    onChange={(e) => setFormData({...formData, pageId: e.target.value})}
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 pl-12 font-medium focus:bg-white transition-all shadow-none"
                    placeholder={type === "SHOPIFY" ? "mystore.myshopify.com" : "..."} 
                  />
                  <Globe className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="w-full h-16 rounded-3xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-lg shadow-2xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connect Integration"}
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
              Secured by JCaesar Intelligence Shield
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
