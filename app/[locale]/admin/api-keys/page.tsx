"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const apiKeys = [
  {
    id: "1",
    name: "OpenAI Production",
    provider: "openai",
    key: "sk-...x8m2",
    status: "active",
    lastUsed: "2m ago",
  },
  {
    id: "2",
    name: "Anthropic Claude",
    provider: "anthropic",
    key: "sk-ant-...9k3p",
    status: "active",
    lastUsed: "15m ago",
  },
  {
    id: "3",
    name: "Meta WhatsApp",
    provider: "meta",
    key: "EAA...xyz",
    status: "active",
    lastUsed: "1h ago",
  },
  {
    id: "4",
    name: "Slack Bot",
    provider: "slack",
    key: "xoxb-...abc",
    status: "inactive",
    lastUsed: "Never",
  },
];

const providers = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "meta", label: "Meta" },
  { value: "slack", label: "Slack" },
  { value: "telegram", label: "Telegram" },
  { value: "sendgrid", label: "SendGrid" },
];

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            API Keys
          </h1>
          <p className="text-zinc-400">
            Manage API keys for LLM providers and integrations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new API key for a service provider
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-950 border-white/10">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., OpenAI Production"
                  className="bg-zinc-950 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your API key"
                  className="bg-zinc-950 border-white/10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Add Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Alert */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-500">
                Secure Key Storage
              </p>
              <p className="text-xs text-blue-500/70 mt-1">
                API keys are encrypted at rest and only decrypted when needed.
                Keys are never exposed in logs or responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.map((key, index) => (
          <motion.div
            key={key.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Key className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{key.name}</h3>
                        <Badge
                          variant={
                            key.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500 capitalize">
                        {key.provider}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-zinc-950 rounded-lg px-3 py-2">
                      <span className="text-sm font-mono text-zinc-400">
                        {showKey[key.id] ? key.key : "••••••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400"
                        onClick={() => toggleShowKey(key.id)}
                      >
                        {showKey[key.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400"
                        onClick={() => copyKey(key.id, key.key)}
                      >
                        {copied === key.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Last used</p>
                      <p className="text-sm text-zinc-400">{key.lastUsed}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
