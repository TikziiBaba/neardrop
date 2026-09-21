"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  FileCheck,
  Share2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { SoundManager } from "@/lib/utils/sound-effects";
import { toast } from "sonner";

interface PeerDevice {
  id: string;
  name: string;
  type: "mac" | "iphone" | "windows" | "android";
  distance: string;
  status: "idle" | "transferring" | "received";
}

export const AppleHero: React.FC = () => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [activeTransferPeer, setActiveTransferPeer] = useState<string | null>(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedFileName, setDroppedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const peers: PeerDevice[] = [
    { id: "mac", name: "MacBook Pro 16″", type: "mac", distance: "0.8 m", status: "idle" },
    { id: "iphone", name: "iPhone 16 Pro", type: "iphone", distance: "1.2 m", status: "idle" },
    { id: "win", name: "Dell XPS 15", type: "windows", distance: "2.4 m", status: "idle" },
    { id: "pixel", name: "Pixel 9 Pro", type: "android", distance: "3.1 m", status: "idle" },
  ];

  const handleSimulateTransfer = (peerId: string) => {
    SoundManager.play("pop");
    setActiveTransferPeer(peerId);
    setTransferProgress(0);

    const interval = setInterval(() => {
      setTransferProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          SoundManager.play("success");
          toast.success(isTr ? "Transfer tamamlandı! 4K ProRes Video (1.4 GB) doğrudan iletildi." : "Transfer complete! 4K ProRes Video (1.4 GB) sent directly.");
          setTimeout(() => setActiveTransferPeer(null), 1800);
          return 100;
        }
        return prev + 25;
      });
    }, 160);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      SoundManager.play("drop");
      setDroppedFileName(files[0].name);
      handleSimulateTransfer("iphone");
    }
  };

  return (
    <section id="overview" className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#0071e3]/10 via-[#0071e3]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Apple Product Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] text-[12px] font-semibold text-[#1d1d1f]"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#0071e3] animate-pulse" />
            <span>{isTr ? "NearDrop 2.0 · Eşler Arası Dosya Aktarımı" : "NearDrop 2.0 · Peer-to-Peer Transfer"}</span>
          </motion.div>

          {/* Bold Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08]"
          >
            {isTr ? (
              <>
                Her şeyi gönderin. <br />
                <span className="bg-gradient-to-r from-[#0071e3] to-[#43a047] bg-clip-text text-transparent">
                  Herkese. Anında.
                </span>
              </>
            ) : (
              <>
                Drop anything. <br />
                <span className="bg-gradient-to-r from-[#0071e3] to-[#43a047] bg-clip-text text-transparent">
                  To anyone. Instantly.
                </span>
              </>
            )}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-lg sm:text-xl text-[#6e6e73] font-normal leading-relaxed max-w-2xl mx-auto pt-2"
          >
            {isTr
              ? "Cihazınız doğrudan alıcıya bağlanır. Bulut yüklemesi beklemeden, boyut sınırı olmadan, uçtan uca AES-256 şifreli transfer."
              : "Direct peer-to-peer browser connection. No cloud uploads, no file size caps, and zero-knowledge client-side encryption."}
          </motion.p>

          {/* Action Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <a
              href="#studio"
              className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-7 py-3.5 text-[15px] font-medium text-white shadow-md shadow-blue-500/20 hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
              <span>{isTr ? "Şimdi Dosya Bırakın" : "Drop Files Now"}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#airdrop"
              className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full text-[15px] font-medium text-[#0071e3] hover:bg-[#0071e3]/[0.08] transition-all"
            >
              <span>{isTr ? "Nasıl çalıştığını izleyin" : "See how it works"}</span>
              <span className="text-lg leading-none">›</span>
            </a>
          </motion.div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-[#86868b]">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#0071e3]" />
              {isTr ? "1.2 Gbps Yerel Ağ Hızı" : "1.2 Gbps Local Speed"}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {isTr ? "AES-256-GCM Uçtan Uca" : "End-to-End AES-256"}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0071e3]" />
              {isTr ? "Hesap veya Kurulum Yok" : "No Sign-up Required"}
            </span>
          </div>
        </div>

        {/* ── THE APPLE AIRDROP SPATIAL RADAR STAGE ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 max-w-4xl mx-auto"
        >
          {/* Outer Canvas Container */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            className={`relative rounded-[32px] border ${
              isDragOver
                ? "border-[#0071e3] bg-[#0071e3]/[0.04] shadow-2xl scale-[1.01]"
                : "border-black/[0.08] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
            } p-8 sm:p-12 transition-all duration-300 overflow-hidden`}
          >
            {/* Top Bar / Status */}
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-5 mb-8">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-[#1d1d1f] tracking-tight">
                  {isTr ? "Aktif Radar — Çevredeki 4 Cihaz Algılandı" : "Active Radar — 4 Nearby Devices Discovered"}
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#86868b] hidden sm:inline">
                {isTr ? "WebRTC Mesh · Doğrudan Eşleşme" : "WebRTC Mesh · Direct Peer Connection"}
              </span>
            </div>

            {/* Radar Circle System */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center">
              {/* Concentric Waves */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[85%] rounded-full border border-[#0071e3]/10" />
                <div className="w-[62%] h-[62%] rounded-full border border-[#0071e3]/15" />
                <div className="w-[40%] h-[40%] rounded-full border border-[#0071e3]/20" />
                <div className="w-[20%] h-[20%] rounded-full border border-[#0071e3]/25" />
              </div>

              {/* Pulsing Sonar Sweep */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ scale: [0.3, 1.3], opacity: [0.6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }}
                  className="w-[70%] h-[70%] rounded-full bg-gradient-to-r from-[#0071e3]/10 to-transparent"
                />
              </div>

              {/* Central NearDrop Hub / Drop Target */}
              <div className="relative z-20 flex flex-col items-center justify-center text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl cursor-pointer ${
                    isDragOver
                      ? "bg-[#0071e3] text-white shadow-xl shadow-blue-500/40"
                      : "bg-[#0071e3] text-white shadow-lg shadow-blue-500/25"
                  } flex flex-col items-center justify-center p-3 transition-all duration-300 group`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDroppedFileName(e.target.files[0].name);
                        handleSimulateTransfer("mac");
                      }
                    }}
                  />
                  <UploadCloud className="h-8 w-8 sm:h-9 sm:w-9 mb-1 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {isDragOver
                      ? isTr ? "Buraya Bırakın!" : "Drop here!"
                      : isTr ? "Dosya Bırakın" : "Drop File"}
                  </span>
                  <span className="text-[9px] opacity-80 mt-0.5">
                    {isTr ? "veya tıklayın" : "or click"}
                  </span>
                </motion.div>
                <span className="mt-2.5 text-xs font-semibold text-[#1d1d1f]">
                  {isTr ? "Sizin Cihazınız" : "Your Device"}
                </span>
                <span className="text-[10px] text-[#86868b]">
                  {droppedFileName ? droppedFileName : isTr ? "Göndermeye Hazır" : "Ready to beam"}
                </span>
              </div>

              {/* Orbiting Peer Devices */}
              {/* 1. MacBook Pro (Top Left) */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSimulateTransfer("mac")}
                className="absolute top-4 left-6 sm:top-8 sm:left-14 z-20 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/90 border border-black/[0.08] shadow-sm hover:shadow-md hover:border-[#0071e3] transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] group-hover:bg-[#0071e3]/10 group-hover:text-[#0071e3] transition-colors">
                  <Laptop className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-semibold text-[#1d1d1f]">MacBook Pro 16″</div>
                  <div className="text-[9px] text-[#86868b]">0.8 m · {isTr ? "Bağlan" : "Beam"}</div>
                </div>
                {activeTransferPeer === "mac" && (
                  <div className="w-full bg-[#f5f5f7] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#0071e3] h-full transition-all duration-150" style={{ width: `${transferProgress}%` }} />
                  </div>
                )}
              </motion.button>

              {/* 2. iPhone 16 Pro (Top Right) */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSimulateTransfer("iphone")}
                className="absolute top-4 right-6 sm:top-8 sm:right-14 z-20 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/90 border border-black/[0.08] shadow-sm hover:shadow-md hover:border-[#0071e3] transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] group-hover:bg-[#0071e3]/10 group-hover:text-[#0071e3] transition-colors">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-semibold text-[#1d1d1f]">iPhone 16 Pro</div>
                  <div className="text-[9px] text-[#86868b]">1.2 m · {isTr ? "Bağlan" : "Beam"}</div>
                </div>
                {activeTransferPeer === "iphone" && (
                  <div className="w-full bg-[#f5f5f7] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#0071e3] h-full transition-all duration-150" style={{ width: `${transferProgress}%` }} />
                  </div>
                )}
              </motion.button>

              {/* 3. Windows PC (Bottom Left) */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSimulateTransfer("win")}
                className="absolute bottom-4 left-6 sm:bottom-6 sm:left-16 z-20 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/90 border border-black/[0.08] shadow-sm hover:shadow-md hover:border-[#0071e3] transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] group-hover:bg-[#0071e3]/10 group-hover:text-[#0071e3] transition-colors">
                  <Monitor className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-semibold text-[#1d1d1f]">Dell XPS 15 (Windows)</div>
                  <div className="text-[9px] text-[#86868b]">2.4 m · {isTr ? "Bağlan" : "Beam"}</div>
                </div>
                {activeTransferPeer === "win" && (
                  <div className="w-full bg-[#f5f5f7] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#0071e3] h-full transition-all duration-150" style={{ width: `${transferProgress}%` }} />
                  </div>
                )}
              </motion.button>

              {/* 4. Pixel 9 Pro (Bottom Right) */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSimulateTransfer("pixel")}
                className="absolute bottom-4 right-6 sm:bottom-6 sm:right-16 z-20 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/90 border border-black/[0.08] shadow-sm hover:shadow-md hover:border-[#0071e3] transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] group-hover:bg-[#0071e3]/10 group-hover:text-[#0071e3] transition-colors">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-semibold text-[#1d1d1f]">Pixel 9 Pro (Android)</div>
                  <div className="text-[9px] text-[#86868b]">3.1 m · {isTr ? "Bağlan" : "Beam"}</div>
                </div>
                {activeTransferPeer === "pixel" && (
                  <div className="w-full bg-[#f5f5f7] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#0071e3] h-full transition-all duration-150" style={{ width: `${transferProgress}%` }} />
                  </div>
                )}
              </motion.button>
            </div>

            {/* Bottom Interactive Hint */}
            <div className="mt-8 pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6e6e73]">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" />
                {isTr
                  ? "Cihaz ikonlarına tıklayarak P2P aktarımı canlı simüle edebilirsiniz."
                  : "Click any device icon above to simulate a live direct P2P transfer."}
              </span>
              <span className="text-[#0071e3] font-medium">
                {isTr ? "Hafızadan Doğrudan Aktarım (RAM-to-RAM)" : "RAM-to-RAM Direct Streaming"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
