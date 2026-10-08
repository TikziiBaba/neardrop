"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { SoundManager } from "@/lib/utils/sound-effects";

interface LanguageToggleProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md";
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = "",
  showText = false,
  size = "md",
}) => {
  const { locale, setLocale } = useLanguage();

  const handleSelect = (newLocale: "tr" | "en") => {
    if (newLocale === locale) return;
    try {
      SoundManager.play("click");
    } catch {
      // ignore
    }
    setLocale(newLocale);
  };

  const isSmall = size === "sm";

  return (
    <div
      role="group"
      aria-label={locale === "tr" ? "Dil seçimi" : "Language selector"}
      className={`inline-flex items-center gap-1 rounded-full bg-surface/80 border border-border/80 backdrop-blur-xl p-1 shadow-sm select-none transition-colors hover:border-border-strong/80 ${className}`}
    >
      <div className={`flex items-center text-muted-foreground ${isSmall ? "pl-1 pr-0.5" : "pl-1.5 pr-1"}`}>
        <Globe className={`${isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} text-muted-foreground`} />
        {showText && (
          <span className="text-[11px] font-medium ml-1.5 text-muted-foreground">
            {locale === "tr" ? "Dil" : "Lang"}
          </span>
        )}
      </div>

      <div className="inline-flex rounded-full bg-background/70 p-0.5 border border-border/60">
        <button
          type="button"
          onClick={() => handleSelect("tr")}
          className={`rounded-full font-semibold transition-all duration-200 cursor-pointer ${
            isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
          } ${
            locale === "tr"
              ? "bg-gradient-to-r from-accent to-accent text-white shadow-md shadow-accent/20 font-bold"
              : "text-muted-foreground hover:text-white"
          }`}
          title="Türkçe"
          aria-pressed={locale === "tr"}
        >
          TR
        </button>
        <button
          type="button"
          onClick={() => handleSelect("en")}
          className={`rounded-full font-semibold transition-all duration-200 cursor-pointer ${
            isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
          } ${
            locale === "en"
              ? "bg-gradient-to-r from-accent to-accent text-white shadow-md shadow-accent/20 font-bold"
              : "text-muted-foreground hover:text-white"
          }`}
          title="English"
          aria-pressed={locale === "en"}
        >
          EN
        </button>
      </div>
    </div>
  );
};
