"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import {
  Zap,
  Lock,
  Clock,
  Globe,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Flame,
  KeyRound,
  Cpu,
} from "lucide-react";
import { SoundManager } from "@/lib/utils/sound-effects";

export const AppleHighlights: React.FC = () => {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [selectedExpiry, setSelectedExpiry] = useState<"10m" | "1h" | "24h" | "burn">("1h");
  const [speedActive, setSpeedActive] = useState(false);

  return (
    <section id="highlights" className="relative py-20 md:py-32 bg-black select-none">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
            {isTr ? "Öne Çıkanlar" : "Highlights"}
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-white">
            {isTr ? "Hız, gizlilik ve kontrol. Tavizsiz." : "Speed, privacy, and control. Uncompromised."}
          </h2>
        </div>

        {/* Bento Grid — Apple Style (2 large + 2 medium) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: P2P Speed (7 cols) */}
          <div className="md:col-span-7 rounded-[28px] border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden relative group">
            <div className="space-y-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/15 text-[11px] font-semibold text-blue-400">
                <Zap className="h-3 w-3" />
                {isTr ? "WebRTC Mesh Protokolü" : "WebRTC Mesh Protocol"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {isTr ? "Işık hızında doğrudan aktarım." : "Direct transfer at lightspeed."}
              </h3>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                {isTr
                  ? "Bulut sunucularına önce yükleyip sonra indirmek yerine, iki tarayıcı arasında doğrudan şifreli boru hattı kurulur."
                  : "Instead of uploading to the cloud and downloading again, a direct encrypted stream opens between browsers."}
              </p>
            </div>

            {/* Interactive Speed Comparison */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] z-10">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-white mb-1.5">
                    <span className="flex items-center gap-1.5 text-[#0071e3]">
                      <span className="h-2 w-2 rounded-full bg-[#0071e3] animate-ping" />
                      NearDrop P2P
                    </span>
                    <span>1.2 Gbps · {isTr ? "Gecikme: 2ms" : "Latency: 2ms"}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-[#0071e3] to-[#34c759] rounded-full w-[95%] transition-all duration-500" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5">
                    <span>{isTr ? "Geleneksel Bulut (Drive / WeTransfer)" : "Traditional Cloud Storage"}</span>
                    <span>45 Mbps · {isTr ? "Çift Yükleme Süresi" : "Double Wait"}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-zinc-600/50 rounded-full w-[22%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle background ambient graphic */}
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Tile 2: Zero-Knowledge (5 cols) */}
          <div className="md:col-span-5 rounded-[28px] border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden relative">
            <div className="space-y-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                {isTr ? "Sıfır Bilgi Mimarisi" : "Zero-Knowledge Architecture"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {isTr ? "Biz bile göremeyiz." : "Even we can't see it."}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {isTr
                  ? "Şifreleme anahtarları yalnızca tarayıcınızın belleğinde oluşturulur ve URL karma `#` etiketiyle alıcıya iletilir. Sunucuya asla ulaşmaz."
                  : "Keys are generated in local browser memory and passed in the URL hash. They are never sent to our servers."}
              </p>
            </div>

            {/* Key lock visual */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] z-10">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-800/80 border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 shadow-sm flex items-center justify-center text-emerald-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">AES-256-GCM</div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[140px]">
                      hash: 9f8a...4b12
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Tile 3: Self-Destruction Timer (5 cols) */}
          <div className="md:col-span-5 rounded-[28px] border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden relative">
            <div className="space-y-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-[11px] font-semibold text-amber-400">
                <Clock className="h-3 w-3" />
                {isTr ? "Otomatik İmha" : "Auto-Destruct"}
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {isTr ? "İz bırakmadan silinir." : "Gone without a trace."}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {isTr
                  ? "Süre dolduğunda veya tek indirme sonrasında bağlantı anında geçersiz kılınır."
                  : "Links self-destruct once downloaded or when their custom timer expires."}
              </p>
            </div>

            {/* Interactive Expiry Toggle */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] z-10">
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-800 rounded-xl">
                {[
                  { id: "10m", label: "10 dk" },
                  { id: "1h", label: "1 saat" },
                  { id: "24h", label: "24 saat" },
                  { id: "burn", label: "1 İndirme" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      SoundManager.play("click");
                      setSelectedExpiry(item.id as any);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      selectedExpiry === item.id
                        ? "bg-zinc-700 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-center text-zinc-400 mt-2.5">
                {selectedExpiry === "burn"
                  ? isTr ? "Tek seferlik kullanım: Dosya indirildiği an silinir" : "Burn-after-reading: Shredded upon download"
                  : isTr ? `Seçilen süre (${selectedExpiry}) sonunda kalıcı silinir` : `Permanently shredded after ${selectedExpiry}`}
              </div>
            </div>
          </div>

          {/* Tile 4: Zero Friction & Cross-Platform (7 cols) */}
          <div className="md:col-span-7 rounded-[28px] border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden relative">
            <div className="space-y-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-[11px] font-semibold text-purple-400">
                <Globe className="h-3 w-3" />
                {isTr ? "Evrensel Uyum" : "Universal Compatibility"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {isTr ? "Uygulama yok. Hesap yok. Her ekranda." : "No app. No account. Every screen."}
              </h3>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                {isTr
                  ? "Safari, Chrome, Edge veya Firefox. iOS, Android, macOS veya Windows. Yalnızca web tarayıcısı olan herhangi bir cihazla dosya alıp gönderebilirsiniz."
                  : "Safari, Chrome, Edge or Firefox. iOS, Android, macOS or Windows. Any browser can send or receive immediately."}
              </p>
            </div>

            {/* Platform Badges */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] z-10 flex flex-wrap items-center gap-3">
              {["iOS & iPadOS", "macOS", "Android", "Windows 11", "Linux"].map((platform) => (
                <span
                  key={platform}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200 border border-white/[0.06]"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
