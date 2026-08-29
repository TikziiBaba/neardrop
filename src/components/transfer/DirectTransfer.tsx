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

  const [roomCode, setRoomCode] = useState<string>(roomParam);
  const [customRoomInput, setCustomRoomInput] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

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
        locale === "tr"
          ? `"${meta.filename}" doğrudan cihaza kaydedildi!`
          : `"${meta.filename}" received and downloaded!`
      );
    };

    engine.init();

    return () => {
      engine.destroy();
    };
  }, [roomCode, locale]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPeerForUpload || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      await engineRef.current?.sendFileToPeer(selectedPeerForUpload, file);
    } catch (err: any) {
      toast.error(err.message || "Failed to send file directly");
    } finally {
      e.target.value = "";
    }
  };

  const getPlatformIcon = (platform: string, deviceType: string) => {
    if (deviceType === "mobile") return <Smartphone className="h-5 w-5 text-emerald-400" />;
    if (deviceType === "tablet") return <Tablet className="h-5 w-5 text-purple-400" />;
    if (platform === "macos") return <Laptop className="h-5 w-5 text-sky-400" />;
    return <Monitor className="h-5 w-5 text-blue-400" />;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header Card: Room Controls & Quick QR Code */}
      <div className="rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 shadow-2xl backdrop-blur-2xl ring-1 ring-white/[0.06] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{locale === "tr" ? "Doğrudan P2P Transfer (AirDrop)" : "Direct P2P Transfer (AirDrop)"}</span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              {locale === "tr"
                ? "Aynı oda kodundaki cihazlar arasında sınırsız hızda, doğrudan şifreli dosya transferi. Sunucu kotası harcamaz."
                : "Zero-knowledge direct peer-to-peer file transfer between devices in the same room. No cloud storage quota used."}
            </p>
          </div>

          {/* Room Badge & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500">ROOM:</span>
              <span className="font-bold text-sky-400">{roomCode.toUpperCase()}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="gap-1.5 text-xs"
            >
              <QrCode className="h-3.5 w-3.5 text-sky-400" />
              <span>{locale === "tr" ? "Mobil QR" : "Mobile QR"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={generateRandomRoom}
              className="gap-1.5 text-xs text-zinc-400 hover:text-white"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>{locale === "tr" ? "Yeni Oda" : "New Code"}</span>
            </Button>
          </div>
        </div>

        {/* Room Code Quick Join Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-zinc-800/80">
          <input
            type="text"
            placeholder={locale === "tr" ? "Özel oda kodu girin (örn. 842109)" : "Enter custom room code (e.g. 842109)"}
            value={customRoomInput}
            onChange={(e) => setCustomRoomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoinRoom(customRoomInput)}
            className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleJoinRoom(customRoomInput)}
            disabled={!customRoomInput.trim()}
            className="w-full sm:w-auto text-xs"
          >
            {locale === "tr" ? "Odaya Katıl" : "Join Room"}
          </Button>

          <span className="text-[11px] text-zinc-500 sm:ml-auto">
            {peers.length} {locale === "tr" ? "cihaz odada aktif" : "device(s) discovered"}
          </span>
        </div>
      </div>

      {/* Discovered Peers Grid / Radar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-sky-400" />
            <span>{locale === "tr" ? "Çevredeki Cihazlar" : "Nearby Discovered Devices"}</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {myDevice ? `${myDevice.deviceName} (You)` : ""}
          </span>
        </div>

        {peers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-20" />
              <Laptop className="h-8 w-8 text-sky-400" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-semibold text-white">
                {locale === "tr" ? "Cihazlar Aranıyor..." : "Looking for devices..."}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {locale === "tr"
                  ? `Telefonunuz veya diğer bilgisayarınızla bu odaya ("${roomCode}") katılın veya QR kodu taratın.`
                  : `Join room "${roomCode}" from your phone or another computer, or scan the QR code.`}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="gap-2 text-xs"
            >
              <QrCode className="h-3.5 w-3.5 text-sky-400" />
              <span>{locale === "tr" ? "QR Kodu Göster" : "Show QR Code"}</span>
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
                className="group rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-5 space-y-4 hover:border-sky-500/50 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-sky-500/5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/90 border border-zinc-700/80 group-hover:scale-105 transition-transform">
                    {getPlatformIcon(peer.platform, peer.deviceType)}
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Online
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                    {peer.deviceName}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ID: {peer.deviceId.substring(0, 12)}...
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-sky-400 font-medium">
                  <span>{locale === "tr" ? "Dosya Gönder" : "Send File"}</span>
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
          className="rounded-3xl border border-sky-500/30 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-2xl space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex-shrink-0">
                {activeTransfer.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
                )}
              </div>
              <div className="truncate">
                <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                  {activeTransfer.filename}
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {activeTransfer.direction === "send" ? "Sending to" : "Receiving from"}{" "}
                  <span className="text-sky-400 font-semibold">{activeTransfer.peerName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <span className="text-xs font-bold text-sky-400">%{activeTransfer.progress}</span>
              <span className="text-xs text-zinc-300 font-semibold">{formatSpeed(activeTransfer.speed)}</span>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
              animate={{ width: `${activeTransfer.progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>
              {formatBytes(activeTransfer.transferredBytes)} / {formatBytes(activeTransfer.size)}
            </span>
            <span className="capitalize text-sky-300 font-medium">
              {activeTransfer.status}
            </span>
          </div>
        </motion.div>
      )}

      {/* Incoming File Transfer Request Modal */}
      <AnimatePresence>
        {incomingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {locale === "tr" ? "Gelen Doğrudan Transfer" : "Incoming Direct Transfer"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    <span className="text-sky-400 font-semibold">{incomingRequest.req.senderName}</span>{" "}
                    {locale === "tr" ? "size dosya göndermek istiyor" : "wants to send you a file"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
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
                  onClick={() => {
                    incomingRequest.decline();
                    setIncomingRequest(null);
                  }}
                >
                  {locale === "tr" ? "Reddet" : "Decline"}
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  onClick={() => {
                    incomingRequest.accept();
                    setIncomingRequest(null);
                  }}
                >
                  {locale === "tr" ? "Kabul Et & İndir" : "Accept & Download"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Mobile Quick Connection */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {locale === "tr" ? "Telefonla Bağlan" : "Connect with Phone"}
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
                  {locale === "tr"
                    ? "Telefonunuzun kamerasını okutarak aynı odaya katılın ve anında dosya gönderin."
                    : "Scan with your phone camera to join room and transfer files directly."}
                </p>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-sky-400 flex items-center justify-between gap-2">
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
