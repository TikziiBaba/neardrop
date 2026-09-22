"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { ArrowRight } from "lucide-react";

export const AppleSubNav: React.FC = () => {
  const { locale } = useLanguage();
  const isTr = locale === "tr";
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "highlights", "airdrop", "security", "specs", "studio", "faq"];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "overview", label: isTr ? "Genel Bakış" : "Overview" },
    { id: "highlights", label: isTr ? "Öne Çıkanlar" : "Highlights" },
    { id: "airdrop", label: "AirDrop P2P" },
    { id: "security", label: isTr ? "Sıfır Bilgi" : "Zero-Knowledge" },
    { id: "specs", label: isTr ? "Karşılaştırma" : "Compare" },
    { id: "faq", label: isTr ? "Soru & Cevap" : "Q&A" },
  ];

  return (
    <div className="sticky top-12 z-30 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-xl backdrop-saturate-150 transition-all">
      <div className="mx-auto flex h-11 max-w-[1040px] items-center justify-between px-4 sm:px-6">
        {/* Product Identity */}
        <div className="flex items-center gap-2.5">
          <Link
            href="#overview"
            className="text-[15px] font-semibold text-white tracking-tight hover:opacity-80 transition-opacity"
          >
            NearDrop
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            P2P Ready
          </span>
        </div>

        {/* Anchor Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`text-[12px] font-medium transition-colors ${
                  isActive
                    ? "text-[#0071e3]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Quick Action */}
        <div className="flex items-center gap-3">
          <a
            href="#studio"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-3.5 py-1 text-[12px] font-medium text-white shadow-sm hover:bg-[#0077ed] active:scale-95 transition-all"
          >
            <span>{isTr ? "Dosya Gönder" : "Send File"}</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
