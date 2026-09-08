"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { translations, type Locale, type TranslationKeys } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const STORAGE_KEY = "neardrop-locale";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLocaleFromPath(pathname: string | null): Locale | null {
  if (!pathname) return null;
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/tr" || pathname.startsWith("/tr/")) return "tr";
  return null;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const fromPath = detectLocaleFromPath(window.location.pathname);
      if (fromPath) return fromPath;
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
        if (saved === "tr" || saved === "en") return saved;
      } catch {}
    }
    return "tr";
  });

  // Keep state in sync whenever pathname changes
  useEffect(() => {
    const fromPath = detectLocaleFromPath(pathname);
    if (fromPath && fromPath !== locale) {
      setLocaleState(fromPath);
      document.documentElement.lang = fromPath;
      try {
        localStorage.setItem(STORAGE_KEY, fromPath);
      } catch {}
    } else if (!fromPath) {
      document.documentElement.lang = locale;
    }
  }, [pathname, locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
      } catch {}
      document.documentElement.lang = newLocale;

      // Update URL if currently on /tr or /en
      if (pathname) {
        if (pathname.startsWith("/tr") || pathname.startsWith("/en")) {
          const cleanPath = pathname.replace(/^\/(tr|en)/, "");
          router.push(`/${newLocale}${cleanPath || ""}`);
        } else if (pathname === "/") {
          router.push(`/${newLocale}`);
        }
      }
    },
    [pathname, router]
  );

  const t = useMemo(() => translations[locale], [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
