"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import {
  Smartphone,
  Monitor,
  Laptop,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileVideo,
  Play,
  RotateCcw,
} from "lucide-react";
import { SoundManager } from "@/lib/utils/sound-effects";

export const AppleAirDropSection: React.FC = () => {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [transferState, setTransferState] = useState<"idle" | "streaming" | "complete">("idle");
  const [streamProgress, setStreamProgress] = useState(0);

  const startDemo = () => {
    SoundManager.play("pop");
    setTransferState("streaming");
    setStreamProgress(0);

    const interval = setInterval(() => {
      setStreamProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTransferState("complete");
          SoundManager.play("success");
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  const resetDemo = () => {
    SoundManager.play("click");
    setTransferState("idle");
    setStreamProgress(0);
  };

  return (
    <section id="airdrop" className="relative py-20 md:py-32 bg-white overflow-hidden select-none">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
            {isTr ? "Evrensel AirDrop Deneyimi" : "Universal AirDrop Experience"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#1d1d1f]">
            {isTr ? "AirDrop. Duvarlar olmadan." : "AirDrop. Without the walls."}
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] leading-relaxed">
            {isTr
              ? "Apple ekosisteminin büyülü kolaylığı. Artık Android, Windows ve Linux dahil her cihazla sorunsuz çalışır."
              : "The magical simplicity of AirDrop. Now working smoothly across Android, Windows, and Linux."}
          </p>
        </div>

        {/* The Live Cross-Platform Simulator Stage */}
        <div className="rounded-[36px] bg-[#f5f5f7] border border-black/[0.06] p-6 sm:p-12 max-w-4xl mx-auto shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
            {/* Left Device: Sender (iPhone 16 Pro) */}
            <div className="md:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-black/[0.06] flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] flex items-center justify-center text-[#1d1d1f]">
                <Smartphone className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                  {isTr ? "Gönderen Cihaz" : "Sender Device"}
                </span>
                <h4 className="text-base font-bold text-[#1d1d1f]">iPhone 16 Pro (iOS)</h4>
              </div>

              {/* Sample File Card */}
              <div className="w-full p-3 rounded-2xl bg-[#f5f5f7] flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <FileVideo className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#1d1d1f] truncate">Cinematic_4K_ProRes.mov</div>
                  <div className="text-[10px] text-[#86868b]">1.8 GB · 4K 60fps Dolby Vision</div>
                </div>
              </div>

              <div className="w-full text-[11px] font-medium text-[#0071e3] bg-blue-50 py-1.5 rounded-xl">
                {isTr ? "Yerel P2P Hazır" : "Local P2P Ready"}
              </div>
            </div>

            {/* Middle: Stream Connection Streamline */}
            <div className="md:col-span-3 flex flex-col items-center justify-center gap-3 py-4 md:py-0">
              {transferState === "idle" && (
                <button
                  onClick={startDemo}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#0077ed] active:scale-95 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isTr ? "Transferi Başlat" : "Start Transfer"}</span>
                </button>
              )}

              {transferState === "streaming" && (
                <div className="w-full text-center space-y-2">
                  <div className="text-xs font-bold text-[#0071e3] animate-pulse">
                    {isTr ? "Aktarılıyor... (1.2 Gbps)" : "Streaming... (1.2 Gbps)"}
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden p-0.5 border border-black/[0.06]">
                    <div
                      className="h-full bg-[#0071e3] rounded-full transition-all duration-150"
                      style={{ width: `${streamProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#86868b]">{streamProgress}%</div>
                </div>
              )}

              {transferState === "complete" && (
                <div className="flex flex-col items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100/70 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isTr ? "1.4 Saniyede Tamamlandı" : "Completed in 1.4s"}
                  </span>
                  <button
                    onClick={resetDemo}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{isTr ? "Yeniden Dene" : "Replay Demo"}</span>
                  </button>
                </div>
              )}

              <div className="text-[10px] text-center text-[#86868b]">
                {isTr ? "0 Bayt Bulut Kullanımı" : "0 Bytes Cloud Used"}
              </div>
            </div>

            {/* Right Device: Receiver (Dell XPS Windows 11) */}
            <div className="md:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-black/[0.06] flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] flex items-center justify-center text-[#1d1d1f]">
                <Laptop className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                  {isTr ? "Alıcı Cihaz" : "Receiver Device"}
                </span>
                <h4 className="text-base font-bold text-[#1d1d1f]">Dell XPS 15 (Windows)</h4>
              </div>

              {/* Received Notification Mock */}
              <div
                className={`w-full p-3 rounded-2xl border transition-all duration-300 ${
                  transferState === "complete"
                    ? "bg-emerald-50 border-emerald-500/20 text-emerald-950"
                    : "bg-[#f5f5f7] border-transparent text-[#6e6e73]"
                } flex items-center gap-3 text-left`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    transferState === "complete"
                      ? "bg-emerald-500 text-white"
                      : "bg-black/[0.06] text-[#86868b]"
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">
                    {transferState === "complete"
                      ? isTr ? "Dosya İndirilenler'e Kaydedildi" : "File Saved to Downloads"
                      : isTr ? "Bağlantı Bekleniyor..." : "Waiting for Stream..."}
                  </div>
                  <div className="text-[10px] opacity-70">
                    {transferState === "complete"
                      ? isTr ? "Kayıpsız Orijinal Kalite" : "Bit-for-bit lossless"
                      : isTr ? "Gelen aktarım sinyali hazır" : "Ready for incoming payload"}
                  </div>
                </div>
              </div>

              <div className="w-full text-[11px] font-medium text-[#1d1d1f] bg-[#f5f5f7] py-1.5 rounded-xl">
                Chrome 128 · {isTr ? "Kurulum Gerektirmez" : "Zero Extensions"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
