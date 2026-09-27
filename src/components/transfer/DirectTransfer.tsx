"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  QrCode,
  Copy,
  Check,
  Zap,
  RotateCw,
  Sparkles,
  Shield,
  FileText,
  Loader2,
  Share2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatBytes, formatSpeed, formatEta } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { getClientDeviceInfo, ClientDeviceInfo } from "@/lib/utils/device";
import { SoundManager } from "@/lib/utils/sound-effects";
import { PeerRadar } from "@/components/transfer/PeerRadar";
import {
  DirectTransferEngine,
  PeerInfo,
  DirectTransferPayload,
  DirectTransferProgress,
} from "@/lib/transfer/p2p-client";

export const DirectTransfer: React.FC = () => {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room") || "lobby";
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [roomCode, setRoomCode] = useState<string>(roomParam);
  const [customRoomInput, setCustomRoomInput] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"radar" | "grid">("radar");

  const [myDevice, setMyDevice] = useState<ClientDeviceInfo | null>(null);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [activeTransfer, setActiveTransfer] = useState<DirectTransferProgress | null>(null);

  // Incoming transfer request modal state
  const [incomingRequest, setIncomingRequest] = useState<{
    req: DirectTransferPayload;
    accept: () => void;
    decline: () => void;
  } | null>(null);

  const [selectedPeerForUpload, setSelectedPeerForUpload] = useState<PeerInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<DirectTransferEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    const dev = getClientDeviceInfo();
    setMyDevice(dev);

    const engine = new DirectTransferEngine(roomCode);
    engineRef.current = engine;

    engine.onPeersUpdated = (updatedPeers) => {
      setPeers(updatedPeers);
    };

    engine.onIncomingRequest = (req, accept, decline) => {
      setIncomingRequest({ req, accept, decline });
    };

    engine.onProgress = (prog) => {
      setActiveTransfer(prog);
      if (prog.status === "completed") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    };

    engine.onCompleted = (meta) => {
      toast.success(
        isTr
          ? `"${meta.filename}" başarıyla alındı ve indirildi!`
          : `"${meta.filename}" received and downloaded!`
      );
    };

    engine.init();

    return () => {
      engine.destroy();
    };
  }, [roomCode, locale, isTr]);

  const handleJoinRoom = (code: string) => {
    const cleaned = code.trim().toLowerCase() || "lobby";
    setRoomCode(cleaned);
    setCustomRoomInput("");
  };

  const generateRandomRoom = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(randomCode);
  };

  const getShareableUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/transfers?room=${roomCode}`;
    }
    return `https://neardrop.bekirr.dev/transfers?room=${roomCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareableUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePeerSelect = (peer: PeerInfo) => {
    setSelectedPeerForUpload(peer);
    fileInputRef.current?.click();
  };

  const handlePeerDrop = async (peer: PeerInfo, files: FileList) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    try {
      SoundManager.play("swoosh");
      toast.info(
        isTr
          ? `${peer.deviceName} cihazına ${fileArray.length} dosya gönderiliyor...`
          : `Sending ${fileArray.length} file(s) to ${peer.deviceName}...`
      );
      for (const file of fileArray) {
        await engineRef.current?.sendFileToPeer(peer, file);
      }
    } catch (err: any) {
      toast.error(err.message || (isTr ? "Doğrudan dosya gönderimi başarısız oldu" : "Failed to send file directly"));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPeerForUpload || !e.target.files || e.target.files.length === 0) return;
    const fileArray = Array.from(e.target.files);
    try {
      SoundManager.play("swoosh");
      toast.info(
        isTr
          ? `${selectedPeerForUpload.deviceName} cihazına ${fileArray.length} dosya gönderiliyor...`
          : `Sending ${fileArray.length} file(s) to ${selectedPeerForUpload.deviceName}...`
      );
      for (const file of fileArray) {
        await engineRef.current?.sendFileToPeer(selectedPeerForUpload, file);
      }
    } catch (err: any) {
      toast.error(err.message || (isTr ? "Doğrudan dosya gönderimi başarısız oldu" : "Failed to send file directly"));
    } finally {
      e.target.value = "";
    }
  };

  const getPlatformIcon = (platform: string, deviceType: string) => {
    if (deviceType === "mobile") return <Smartphone className="h-5 w-5 text-emerald-400" />;
    if (deviceType === "tablet") return <Tablet className="h-5 w-5 text-purple-400" />;
    if (platform === "macos") return <Laptop className="h-5 w-5 text-[#0071e3]" />;
    return <Monitor className="h-5 w-5 text-blue-400" />;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header Card: Room Controls & Quick QR Code */}
      <div className="rounded-[32px] border border-white/[0.08] bg-[#101014]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isTr ? "Doğrudan P2P Aktarım (AirDrop)" : "Direct P2P Transfer (AirDrop)"}</span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              {isTr
                ? "Aynı odadaki cihazlar arasında sıfır bilgi doğrudan dosya aktarımı. Bulut depolama kotası harcanmaz, dosya boyutu sınırı yoktur."
                : "Zero-knowledge direct peer-to-peer file transfer between devices in the same room. No cloud storage quota used, no file size caps."}
            </p>
          </div>

          {/* Room Badge & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/[0.08] text-xs font-mono">
              <span className="text-zinc-500">{isTr ? "ODA:" : "ROOM:"}</span>
              <span className="font-bold text-[#0071e3]">{roomCode.toUpperCase()}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="gap-1.5 text-xs rounded-xl border-white/[0.08] text-zinc-200 hover:text-white"
            >
              <QrCode className="h-3.5 w-3.5 text-[#0071e3]" />
              <span>{isTr ? "Mobil QR Kod" : "Mobile QR"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={generateRandomRoom}
              className="gap-1.5 text-xs text-zinc-400 hover:text-white rounded-xl"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>{isTr ? "Yeni Oda" : "New Code"}</span>
            </Button>
          </div>
        </div>

        {/* Room Code Quick Join Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-white/[0.06]">
          <input
            type="text"
            placeholder={isTr ? "Özel oda kodu girin (örn. 842109)" : "Enter custom room code (e.g. 842109)"}
            value={customRoomInput}
            onChange={(e) => setCustomRoomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoinRoom(customRoomInput)}
            className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0071e3] font-mono transition-colors"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleJoinRoom(customRoomInput)}
            disabled={!customRoomInput.trim()}
            className="w-full sm:w-auto text-xs rounded-xl"
          >
            {isTr ? "Odaya Katıl" : "Join Room"}
          </Button>

          <span className="text-[11px] text-zinc-400 sm:ml-auto flex items-center gap-1.5 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {peers.length} {isTr ? "cihaz keşfedildi" : "device(s) discovered"}
          </span>
        </div>
      </div>

      {/* Discovered Peers Grid / Radar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#0071e3]" />
            <span>{isTr ? "Çevrede Keşfedilen Cihazlar" : "Nearby Discovered Devices"}</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-[#121216] border border-white/[0.08] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("radar")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "radar"
                    ? "bg-[#0071e3] text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {isTr ? "Radar Görünümü" : "Radar View"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#0071e3] text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {isTr ? "Liste / Izgara" : "Grid View"}
              </button>
            </div>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              {myDevice ? `${myDevice.deviceName} (${isTr ? "Siz" : "You"})` : ""}
            </span>
          </div>
        </div>

        {viewMode === "radar" ? (
          <div className="rounded-[32px] border border-white/[0.08] bg-[#101014]/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center">
            <PeerRadar
              peers={peers}
              myDeviceName={myDevice?.deviceName || (isTr ? "Siz" : "You")}
              onPeerClick={handlePeerSelect}
              onPeerDrop={handlePeerDrop}
              isScanning={true}
            />
          </div>
        ) : peers.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-white/[0.08] bg-[#101014]/40 p-12 text-center space-y-4">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3] border border-blue-500/20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0071e3] opacity-20" />
              <Laptop className="h-8 w-8 text-[#0071e3]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-semibold text-white">
                {isTr ? "Cihazlar taranıyor..." : "Looking for devices..."}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {isTr
                  ? `Telefonunuzdan veya başka bir bilgisayardan "${roomCode}" odasına katılın ya da QR kodu taratın.`
                  : `Join room "${roomCode}" from your phone or another computer, or scan the QR code.`}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="gap-2 text-xs rounded-xl border-white/[0.1] text-zinc-200"
            >
              <QrCode className="h-3.5 w-3.5 text-[#0071e3]" />
              <span>{isTr ? "QR Kodu Göster" : "Show QR Code"}</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {peers.map((peer) => (
              <motion.div
                key={peer.deviceId}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => handlePeerSelect(peer)}
                className="group rounded-[28px] border border-white/[0.08] bg-[#101014]/90 p-5 space-y-4 hover:border-[#0071e3]/50 hover:bg-[#15151a] hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/[0.08] group-hover:scale-105 transition-transform">
                    {getPlatformIcon(peer.platform, peer.deviceType)}
                  </div>
                  <Badge variant="success" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                    {isTr ? "Çevrimiçi" : "Online"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                    {peer.deviceName}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ID: {peer.deviceId.substring(0, 12)}...
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#0071e3] font-medium">
                  <span>{isTr ? "Dosya Gönder" : "Send File"}</span>
                  <Send className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Active Direct Transfer Live Card */}
      {activeTransfer && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-[#0071e3]/40 bg-[#101014]/95 p-5 shadow-2xl backdrop-blur-2xl space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3]/15 text-[#0071e3] border border-blue-500/20 flex-shrink-0">
                {activeTransfer.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-[#0071e3]" />
                )}
              </div>
              <div className="truncate">
                <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                  {activeTransfer.filename}
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {activeTransfer.direction === "send"
                    ? isTr ? "Gönderilen Cihaz:" : "Sending to"
                    : isTr ? "Gönderen Cihaz:" : "Receiving from"}{" "}
                  <span className="text-[#0071e3] font-semibold">{activeTransfer.peerName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <span className="text-xs font-bold text-[#0071e3]">%{activeTransfer.progress}</span>
              <span className="text-xs text-zinc-300 font-semibold">{formatSpeed(activeTransfer.speed)}</span>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 border border-white/[0.04]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0071e3] to-[#34c759] rounded-full shadow-sm shadow-blue-500/30"
              animate={{ width: `${activeTransfer.progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>
              {formatBytes(activeTransfer.transferredBytes)} / {formatBytes(activeTransfer.size)}
            </span>
            <span className="capitalize text-blue-300 font-medium">
              {activeTransfer.status}
            </span>
          </div>
        </motion.div>
      )}

      {/* Incoming File Transfer Request Modal */}
      <AnimatePresence>
        {incomingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[32px] border border-white/[0.1] bg-[#121216] p-7 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071e3]/15 text-[#0071e3] border border-blue-500/20">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isTr ? "Gelen Doğrudan Transfer" : "Incoming Direct Transfer"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    <span className="text-[#0071e3] font-semibold">{incomingRequest.req.senderName}</span>{" "}
                    {isTr ? "size bir dosya göndermek istiyor" : "wants to send you a file"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1">
                <p className="text-sm font-semibold text-white truncate">
                  {incomingRequest.req.filename}
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  {formatBytes(incomingRequest.req.size)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="default"
                  className="rounded-xl border-white/[0.1]"
                  onClick={() => {
                    incomingRequest.decline();
                    setIncomingRequest(null);
                  }}
                >
                  {isTr ? "Reddet" : "Decline"}
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  className="rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/25"
                  onClick={() => {
                    incomingRequest.accept();
                    setIncomingRequest(null);
                  }}
                >
                  {isTr ? "Kabul Et & İndir" : "Accept & Download"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Mobile Quick Connection */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-[32px] border border-white/[0.1] bg-[#121216] p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {isTr ? "Telefon ile Bağlan" : "Connect with Phone"}
                </h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white mx-auto w-fit shadow-xl">
                <QRCodeSVG value={getShareableUrl()} size={200} />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isTr
                    ? "Kameranızla QR kodu okutarak odaya katılın ve anında doğrudan dosya aktarın."
                    : "Scan with your phone camera to join room and transfer files directly."}
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] font-mono text-[#0071e3] flex items-center justify-between gap-2">
                  <span className="truncate">{getShareableUrl()}</span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1 text-zinc-400 hover:text-white"
                    title="Copy link"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
