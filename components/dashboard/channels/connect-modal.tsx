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
import { useTranslations } from "next-intl";
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
    WHATSAPP: "Link your WhatsApp Business phone number using Meta Cloud API tokens.",
    INSTAGRAM: "Connect your Instagram Business account DMs to your AI agent.",
    FACEBOOK: "Allow your agent to respond to Facebook Page messages.",
    SHOPIFY: "Integrate your Shopify store to allow the AI to search products and check stock.",
    WOOCOMMERCE: "Connect your WooCommerce store to sync product catalog and inventory.",
    GOOGLE_CALENDAR: "Allow the AI to book appointments directly to your primary calendar."
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let payload: any = { type, name: titles[type!] };
      
      if (type === "WHATSAPP") {
        payload.phoneNumberId = formData.phoneNumberId;
        payload.config = { accessToken: formData.accessToken, verifyToken: formData.verifyToken };
      } else if (type === "INSTAGRAM" || type === "FACEBOOK") {
        payload.phoneNumberId = formData.pageId;
        payload.config = { accessToken: formData.accessToken, pageId: formData.pageId, verifyToken: formData.verifyToken };
      } else if (type === "SHOPIFY") {
        payload.config = { shopDomain: formData.pageId, accessToken: formData.accessToken };
      } else if (type === "WOOCOMMERCE") {
        payload.config = { baseUrl: formData.pageId, consumerKey: formData.accessToken, consumerSecret: formData.phoneNumberId };
      } else if (type === "GOOGLE_CALENDAR") {
        // This will normally be an OAuth flow, but for now let's allow manual refresh token entry
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
                  placeholder={type === "SHOPIFY" ? "store-name.myshopify.com" : "..."} 
                />
                <Globe className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {type === "WOOCOMMERCE" || type === "GOOGLE_CALENDAR" ? (
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">
                  {type === "WOOCOMMERCE" ? "Consumer Secret" : "Client Secret"}
                </Label>
                <div className="relative">
                  <Input 
                    value={formData.phoneNumberId}
                    onChange={(e) => setFormData({...formData, phoneNumberId: e.target.value})}
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 pl-12 font-medium focus:bg-white transition-all shadow-none"
                    placeholder="..." 
                  />
                  <ShieldCheck className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : null}

            {(type === "WHATSAPP" || type === "INSTAGRAM" || type === "FACEBOOK") && (
              <div className="p-6 rounded-3xl bg-zinc-950 text-white space-y-3 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verify Token</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Use this token in your Meta App Webhook settings.
                </p>
                <div className="bg-white/10 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                  <span>{formData.verifyToken}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full bg-zinc-950 hover:bg-zinc-900 text-white rounded-2xl h-14 font-black shadow-2xl transition-all hover:scale-[1.02]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("submit")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
