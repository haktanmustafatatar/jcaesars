"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const languages = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "gr", name: "Ελληνικά", flag: "🇬🇷" },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const activeLang = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (code: string) => {
    // Use the next-intl router to smoothly transition while preserving the URL path
    router.replace(pathname, { locale: code });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl hover:bg-zinc-100 flex items-center gap-2 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all">
          <Globe className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-bold uppercase track-widest text-zinc-600 dark:text-zinc-300">
            {activeLang.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-2xl p-2 bg-white dark:bg-zinc-950 border-black/5 dark:border-white/10 shadow-xl">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-colors ${
              activeLang.code === lang.code
                ? "bg-primary/10 text-primary"
                : "hover:bg-zinc-50 dark:hover:bg-white/5"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex flex-col">
              <span className={activeLang.code === lang.code ? "font-bold" : ""}>{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
