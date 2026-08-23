"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface LanguageToggleProps {
  className?: string;
  showText?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = "",
  showText = true,
}) => {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === "tr" ? "en" : "tr");
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      title={locale === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
      aria-label="Toggle Language"
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all text-xs font-bold shadow-sm backdrop-blur-md active:scale-95 ${className}`}
    >
      <Globe className="h-4 w-4 text-sky-400" />
      {showText && <span>{locale === "tr" ? "TR" : "EN"}</span>}
    </button>
  );
};
