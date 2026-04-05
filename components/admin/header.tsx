"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./sidebar";

const breadcrumbMap: Record<string, string> = {
  admin: "Dashboard",
  users: "Users",
  "api-keys": "API Keys",
  tokens: "Token Usage",
  plans: "Plans",
  channels: "Channels",
  system: "System",
  settings: "Settings",
};

export function AdminHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentSection = segments[1] || "admin";

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-zinc-950">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white font-medium">
              {breadcrumbMap[currentSection]}
            </span>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-zinc-500" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
