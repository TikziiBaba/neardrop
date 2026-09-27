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
  Radio,
  Wifi,
  Film,
  Image as ImageIcon,
  FolderArchive,
  Check,
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
  ip: string;
  // Normalized percentage position in radar canvas (0-100)
  x: number;
  y: number;
}

interface SampleFile {
  id: string;
  name: string;
  size: string;
  icon: React.FC<{ className?: string }>;
}

export const AppleHero: React.FC = () => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [activeTransferPeer, setActiveTransferPeer] = useState<string | null>(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState("142 MB/s");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFilePreset, setSelectedFilePreset] = useState<string>("video");
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleFiles: SampleFile[] = [
    {
      id: "video",
      name: isTr ? "4K_ProRes_Sinematik.mov" : "4K_ProRes_Cinematic.mov",
      size: "1.4 GB",
      icon: Film,
    },
    {
      id: "photos",
      name: isTr ? "Tatil_RAW_Fotoğraflar.zip" : "Vacation_RAW_Photos.zip",
      size: "420 MB",
      icon: ImageIcon,
    },
    {
      id: "archive",
      name: isTr ? "Proje_Kaynak_Kodları.tar.gz" : "Project_Source_Code.tar.gz",
      size: "2.1 GB",
      icon: FolderArchive,
    },
  ];

  const currentFile = customFileName
    ? { name: customFileName, size: isTr ? "Özel Dosya" : "Custom File" }
    : sampleFiles.find((f) => f.id === selectedFilePreset) || sampleFiles[0];

  const peers: PeerDevice[] = [
    {
      id: "mac",
      name: "MacBook Pro 16″",
      type: "mac",
      distance: "0.8 m",
      ip: "192.168.1.42",
      x: 18,
      y: 20,
    },
    {
      id: "iphone",
      name: "iPhone 16 Pro",
      type: "iphone",
      distance: "1.2 m",
      ip: "192.168.1.18",
      x: 82,
      y: 20,
    },
    {
      id: "win",
      name: "Dell XPS 15",
      type: "windows",
      distance: "2.4 m",
      ip: "192.168.1.89",
      x: 18,
      y: 80,
    },
    {
      id: "pixel",
      name: "Pixel 9 Pro",
      type: "android",
      distance: "3.1 m",
      ip: "192.168.1.104",
      x: 82,
      y: 80,
    },
  ];

  const activePeer = peers.find((p) => p.id === activeTransferPeer);

  const handleSimulateTransfer = (peerId: string) => {
    SoundManager.play("swoosh");
    setActiveTransferPeer(peerId);
    setTransferProgress(0);
    setTransferSpeed("128 MB/s");

    const interval = setInterval(() => {
      setTransferProgress((prev) => {
        const next = prev + 15;
        // Jitter speed slightly for realism
        const speeds = ["138 MB/s", "148 MB/s", "154 MB/s", "162 MB/s"];
        setTransferSpeed(speeds[Math.floor(Math.random() * speeds.length)]);

        if (next >= 100) {
          clearInterval(interval);
          SoundManager.play("success");
          toast.success(
            isTr
              ? `"${currentFile.name}" (${currentFile.size}) başarıyla iletildi!`
              : `"${currentFile.name}" (${currentFile.size}) successfully sent!`
          );
          setTimeout(() => {
            setActiveTransferPeer(null);
            setTransferProgress(0);
          }, 2400);
          return 100;
        }
        return next;
      });
    }, 160);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      SoundManager.play("drop");
      setCustomFileName(files[0].name);
      handleSimulateTransfer("iphone");
    }
  };

  return (
    <section id="overview" className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden select-none">
      {/* Anchor alias */}
      <span id="product" className="absolute top-0 pointer-events-none" />

      {/* Ambient Apple Specular Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#0071e3]/12 via-[#0071e3]/5 to-transparent blur-[140px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Apple Product Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[12px] font-semibold text-white shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#0071e3] animate-pulse" />
            <span>{isTr ? "NearDrop 2.0 · Eşler Arası Dosya Aktarımı" : "NearDrop 2.0 · Peer-to-Peer Transfer"}</span>
          </motion.div>

          {/* Bold Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.035em] text-white leading-[1.08]"
          >
            {isTr ? (
              <>
                Her şeyi gönderin. <br />
                <span className="bg-gradient-to-r from-[#0071e3] via-[#43a047] to-[#0071e3] bg-clip-text text-transparent">
                  Herkese. Anında.
                </span>
              </>
            ) : (
              <>
                Drop anything. <br />
                <span className="bg-gradient-to-r from-[#0071e3] via-[#43a047] to-[#0071e3] bg-clip-text text-transparent">
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
            className="text-lg sm:text-xl text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto pt-2"
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
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
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
          {/* Preset Selector Pill Bar */}
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              {isTr ? "Örnek Dosya Seç:" : "Sample Payload:"}
            </span>
            {sampleFiles.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedFilePreset === preset.id && !customFileName;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    SoundManager.play("click");
                    setSelectedFilePreset(preset.id);
                    setCustomFileName(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/25 border border-[#0071e3]"
                      : "bg-[#16161a] text-zinc-400 hover:text-white border border-white/[0.08]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{preset.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({preset.size})</span>
                </button>
              );
            })}
          </div>

          {/* Outer Canvas Container */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            className={`relative rounded-[36px] border ${
              isDragOver
                ? "border-[#0071e3] bg-[#0071e3]/[0.1] shadow-2xl scale-[1.01]"
                : "border-white/[0.1] bg-[#0d0d10]/90 backdrop-blur-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)]"
            } p-6 sm:p-10 transition-all duration-300 overflow-hidden`}
          >
            {/* Top Bar / Status */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
                    <span>{isTr ? "Aktif AirDrop Radarı" : "Active AirDrop Radar"}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      {isTr ? "4 Cihaz Çevrimiçi" : "4 Peers Online"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                <Radio className="h-3.5 w-3.5 text-[#0071e3] animate-pulse" />
                <span>WebRTC Mesh · P2P LAN</span>
              </div>
            </div>

            {/* Radar Stage Container */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
              {/* Perfect Concentric Circular Radar Rings (SVG based, no oval stretching) */}
              <svg
                viewBox="0 0 1000 650"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <defs>
                  <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0071e3" stopOpacity="0.12" />
                    <stop offset="60%" stopColor="#0071e3" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0071e3" />
                    <stop offset="50%" stopColor="#34c759" />
                    <stop offset="100%" stopColor="#0071e3" />
                  </linearGradient>
                </defs>

                {/* Central Radar Glow */}
                <circle cx="500" cy="325" r="280" fill="url(#radarGlow)" />

                {/* Concentric Circles */}
                <circle cx="500" cy="325" r="80" fill="none" stroke="rgba(0, 113, 227, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="500" cy="325" r="160" fill="none" stroke="rgba(0, 113, 227, 0.2)" strokeWidth="1" />
                <circle cx="500" cy="325" r="240" fill="none" stroke="rgba(0, 113, 227, 0.15)" strokeWidth="1" />
                <circle cx="500" cy="325" r="320" fill="none" stroke="rgba(0, 113, 227, 0.1)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Crosshairs */}
                <line x1="160" y1="325" x2="840" y2="325" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <line x1="500" y1="60" x2="500" y2="590" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                {/* Active Laser Connection Line to Target Peer */}
                {activePeer && (
                  <line
                    x1="500"
                    y1="325"
                    x2={activePeer.x * 10}
                    y2={activePeer.y * 6.5}
                    stroke="url(#beamGradient)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Pulsing Sonar Sweep Animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ scale: [0.35, 1.4], opacity: [0.65, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }}
                  className="w-[520px] h-[520px] rounded-full bg-gradient-to-r from-[#0071e3]/15 to-transparent blur-md"
                />
              </div>

              {/* ── CENTRAL HUB (SENDER / DROP ZONE) ── */}
              <div className="relative z-30 flex flex-col items-center justify-center text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl cursor-pointer ${
                    isDragOver
                      ? "bg-[#0071e3] text-white shadow-2xl shadow-blue-500/50 ring-4 ring-blue-400"
                      : "bg-[#0071e3] text-white shadow-xl shadow-blue-500/30"
                  } flex flex-col items-center justify-center p-3.5 transition-all duration-300 group border border-white/20`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCustomFileName(e.target.files[0].name);
                        handleSimulateTransfer("mac");
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-1 group-hover:-translate-y-1 transition-transform">
                    <UploadCloud className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-center leading-tight">
                    {isDragOver
                      ? isTr ? "Buraya Bırakın!" : "Drop Here!"
                      : isTr ? "Dosya Bırakın" : "Drop File"}
                  </span>
                  <span className="text-[10px] text-blue-100 font-mono mt-0.5 truncate max-w-[110px]">
                    {currentFile.name}
                  </span>
                </motion.div>

                {/* Sender device label under hub */}
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/[0.08] backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    {isTr ? "Sizin Cihazınız" : "Your Device"}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ({currentFile.size})
                  </span>
                </div>
              </div>

              {/* ── ORBITING PEER DEVICE CARDS ── */}

              {/* 1. MacBook Pro 16″ (Top-Left) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSimulateTransfer("mac")}
                className={`absolute top-4 left-4 sm:top-8 sm:left-8 z-30 flex items-center gap-3 p-3.5 rounded-2xl ${
                  activeTransferPeer === "mac"
                    ? "bg-[#0071e3]/25 border-[#0071e3] shadow-xl shadow-blue-500/20"
                    : "bg-[#141418]/90 border-white/[0.1] hover:border-[#0071e3]/60 hover:bg-[#1a1a22]"
                } border shadow-lg transition-all duration-200 group backdrop-blur-xl text-left cursor-pointer min-w-[170px] sm:min-w-[190px]`}
              >
                {/* Device Icon with AirDrop Circular Progress Ring */}
                <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  {activeTransferPeer === "mac" && (
                    <svg className="absolute -inset-1 w-14 h-14 -rotate-90 pointer-events-none">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="rgba(0, 113, 227, 0.2)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="3"
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * transferProgress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-150"
                      />
                    </svg>
                  )}
                  <Laptop className={`h-6 w-6 ${activeTransferPeer === "mac" ? "text-[#0071e3]" : "text-white group-hover:text-[#0071e3]"} transition-colors`} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">MacBook Pro 16″</div>
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>0.8 m</span>
                    <span>•</span>
                    <span className="text-[#0071e3] font-medium group-hover:underline">
                      {activeTransferPeer === "mac" ? `${transferProgress}%` : isTr ? "Aktar" : "Send"}
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* 2. iPhone 16 Pro (Top-Right) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSimulateTransfer("iphone")}
                className={`absolute top-4 right-4 sm:top-8 sm:right-8 z-30 flex items-center gap-3 p-3.5 rounded-2xl ${
                  activeTransferPeer === "iphone"
                    ? "bg-[#0071e3]/25 border-[#0071e3] shadow-xl shadow-blue-500/20"
                    : "bg-[#141418]/90 border-white/[0.1] hover:border-[#0071e3]/60 hover:bg-[#1a1a22]"
                } border shadow-lg transition-all duration-200 group backdrop-blur-xl text-left cursor-pointer min-w-[170px] sm:min-w-[190px]`}
              >
                <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  {activeTransferPeer === "iphone" && (
                    <svg className="absolute -inset-1 w-14 h-14 -rotate-90 pointer-events-none">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="rgba(0, 113, 227, 0.2)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="3"
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * transferProgress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-150"
                      />
                    </svg>
                  )}
                  <Smartphone className={`h-6 w-6 ${activeTransferPeer === "iphone" ? "text-[#0071e3]" : "text-white group-hover:text-[#0071e3]"} transition-colors`} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">iPhone 16 Pro</div>
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>1.2 m</span>
                    <span>•</span>
                    <span className="text-[#0071e3] font-medium group-hover:underline">
                      {activeTransferPeer === "iphone" ? `${transferProgress}%` : isTr ? "Aktar" : "Send"}
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* 3. Dell XPS 15 (Bottom-Left) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSimulateTransfer("win")}
                className={`absolute bottom-4 left-4 sm:bottom-8 sm:left-8 z-30 flex items-center gap-3 p-3.5 rounded-2xl ${
                  activeTransferPeer === "win"
                    ? "bg-[#0071e3]/25 border-[#0071e3] shadow-xl shadow-blue-500/20"
                    : "bg-[#141418]/90 border-white/[0.1] hover:border-[#0071e3]/60 hover:bg-[#1a1a22]"
                } border shadow-lg transition-all duration-200 group backdrop-blur-xl text-left cursor-pointer min-w-[170px] sm:min-w-[190px]`}
              >
                <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  {activeTransferPeer === "win" && (
                    <svg className="absolute -inset-1 w-14 h-14 -rotate-90 pointer-events-none">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="rgba(0, 113, 227, 0.2)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="3"
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * transferProgress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-150"
                      />
                    </svg>
                  )}
                  <Monitor className={`h-6 w-6 ${activeTransferPeer === "win" ? "text-[#0071e3]" : "text-white group-hover:text-[#0071e3]"} transition-colors`} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">Dell XPS 15 (Win)</div>
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>2.4 m</span>
                    <span>•</span>
                    <span className="text-[#0071e3] font-medium group-hover:underline">
                      {activeTransferPeer === "win" ? `${transferProgress}%` : isTr ? "Aktar" : "Send"}
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* 4. Pixel 9 Pro (Bottom-Right) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSimulateTransfer("pixel")}
                className={`absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-30 flex items-center gap-3 p-3.5 rounded-2xl ${
                  activeTransferPeer === "pixel"
                    ? "bg-[#0071e3]/25 border-[#0071e3] shadow-xl shadow-blue-500/20"
                    : "bg-[#141418]/90 border-white/[0.1] hover:border-[#0071e3]/60 hover:bg-[#1a1a22]"
                } border shadow-lg transition-all duration-200 group backdrop-blur-xl text-left cursor-pointer min-w-[170px] sm:min-w-[190px]`}
              >
                <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  {activeTransferPeer === "pixel" && (
                    <svg className="absolute -inset-1 w-14 h-14 -rotate-90 pointer-events-none">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="rgba(0, 113, 227, 0.2)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="3"
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * transferProgress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-150"
                      />
                    </svg>
                  )}
                  <Smartphone className={`h-6 w-6 ${activeTransferPeer === "pixel" ? "text-[#0071e3]" : "text-white group-hover:text-[#0071e3]"} transition-colors`} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">Pixel 9 Pro (Android)</div>
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>3.1 m</span>
                    <span>•</span>
                    <span className="text-[#0071e3] font-medium group-hover:underline">
                      {activeTransferPeer === "pixel" ? `${transferProgress}%` : isTr ? "Aktar" : "Send"}
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* ── LIVE TRANSFER MONITOR CARD (When transferring) ── */}
            <AnimatePresence>
              {activePeer && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="mt-6 rounded-2xl border border-[#0071e3]/30 bg-black/70 p-4 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-[#0071e3]/15 border border-blue-500/25 flex items-center justify-center text-[#0071e3] flex-shrink-0">
                      {transferProgress >= 100 ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Zap className="h-5 w-5 text-[#0071e3] animate-pulse" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {currentFile.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {isTr ? "Hedef:" : "Target:"} <span className="text-white font-semibold">{activePeer.name}</span> • {currentFile.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-white">%{transferProgress}</span>
                      <span className="text-[10px] text-emerald-400 block font-semibold">{transferSpeed}</span>
                    </div>

                    <div className="w-32 sm:w-40 h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#0071e3] to-[#34c759] rounded-full shadow-sm"
                        style={{ width: `${transferProgress}%` }}
                        transition={{ duration: 0.15 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Interactive Hint & Deep Link */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" />
                {isTr
                  ? "Cihaz ikonlarına tıklayarak doğrudan P2P aktarım simülasyonunu başlatabilirsiniz."
                  : "Click any device card above to simulate an immediate direct P2P transfer."}
              </span>
              <Link
                href="/transfers"
                className="text-[#0071e3] hover:text-[#0077ed] hover:underline font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <span>{isTr ? "Canlı P2P Transfer Merkezini Aç" : "Launch Live P2P Transfer Center"}</span>
                <span>›</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
