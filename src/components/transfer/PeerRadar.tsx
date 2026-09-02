"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Loader2,
} from "lucide-react";
import { PeerInfo } from "@/lib/transfer/p2p-client";

interface PeerRadarProps {
  peers: PeerInfo[];
  myDeviceName?: string;
  onPeerClick: (peer: PeerInfo) => void;
  onPeerDrop: (peer: PeerInfo, files: FileList) => void;
  isScanning?: boolean;
}

const DEVICE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
};

// Distribute peers evenly on concentric rings
function getPeerPositions(count: number) {
  const positions: { x: number; y: number; ring: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2;
    const ring = count <= 3 ? 0.55 : i < 4 ? 0.45 : 0.7;
    positions.push({
      x: 50 + Math.cos(angle) * ring * 42,
      y: 50 + Math.sin(angle) * ring * 42,
      ring: ring > 0.5 ? 2 : 1,
    });
  }
  return positions;
}

export const PeerRadar: React.FC<PeerRadarProps> = ({
  peers,
  myDeviceName = "You",
  onPeerClick,
  onPeerDrop,
  isScanning = true,
}) => {
  const positions = useMemo(() => getPeerPositions(peers.length), [peers.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (peer: PeerInfo, e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onPeerDrop(peer, files);
    }
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-square select-none">
      {/* Radar SVG Background */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Concentric rings */}
        {[18, 32, 45].map((r, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.25"
            className="text-zinc-700/40"
          />
        ))}

        {/* Cross lines */}
        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.15" className="text-zinc-700/30" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.15" className="text-zinc-700/30" />

        {/* Diagonal lines */}
        <line x1="14.6" y1="14.6" x2="85.4" y2="85.4" stroke="currentColor" strokeWidth="0.1" className="text-zinc-700/20" />
        <line x1="85.4" y1="14.6" x2="14.6" y2="85.4" stroke="currentColor" strokeWidth="0.1" className="text-zinc-700/20" />
      </svg>

      {/* Animated scanning pulse rings */}
      {isScanning && (
        <div className="absolute inset-0 motion-safe:block motion-reduce:hidden">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-sky-500/20"
              initial={{ scale: 0.2, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "easeOut",
              }}
              style={{ margin: "auto", width: "90%", height: "90%" }}
            />
          ))}
        </div>
      )}

      {/* Center — my device */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center backdrop-blur-md">
            <Monitor className="h-5 w-5 text-sky-400" />
          </div>
          <span className="text-[10px] font-medium text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {myDeviceName}
          </span>
          {/* Green online halo */}
          <div className="absolute -inset-1 rounded-2xl bg-emerald-500/10 animate-pulse pointer-events-none" />
        </motion.div>
      </div>

      {/* Peer devices on radar */}
      <AnimatePresence>
        {peers.map((peer, i) => {
          const pos = positions[i];
          if (!pos) return null;

          const DeviceIcon = DEVICE_ICONS[peer.deviceType] || Monitor;
          const isConnected = true; // could be extended with peer.status

          return (
            <motion.div
              key={peer.deviceId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 18,
                stiffness: 250,
                delay: i * 0.1,
              }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              onClick={() => onPeerClick(peer)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(peer, e)}
            >
              <div className="flex flex-col items-center gap-1">
                {/* Device icon container */}
                <div
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border
                    ${isConnected
                      ? "bg-zinc-800/80 border-zinc-600/50 group-hover:border-sky-500/50 group-hover:bg-sky-500/10"
                      : "bg-zinc-800/40 border-zinc-700/30"
                    }
                    backdrop-blur-sm group-hover:scale-110 group-active:scale-95
                  `}
                >
                  <DeviceIcon className={`h-4.5 w-4.5 ${isConnected ? "text-zinc-300" : "text-zinc-500"}`} />

                  {/* Connection indicator dot */}
                  <div
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${
                      isConnected ? "bg-emerald-400" : "bg-zinc-500"
                    }`}
                  />
                </div>

                {/* Device name */}
                <span className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors max-w-[70px] truncate text-center bg-zinc-900/60 px-1 py-0.5 rounded-md backdrop-blur-sm">
                  {peer.deviceName || peer.platform}
                </span>

                {/* Drop hint on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block"
                >
                  <span className="text-[8px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap border border-sky-500/20">
                    Drop files to send
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Scanning indicator */}
      {isScanning && peers.length === 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 text-sky-400 animate-spin" />
          <span className="text-xs text-zinc-500">Scanning for nearby devices...</span>
        </div>
      )}
    </div>
  );
};
