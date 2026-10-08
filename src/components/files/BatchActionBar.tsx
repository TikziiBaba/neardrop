"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Trash2,
  Share2,
  X,
  Archive,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { SoundManager } from "@/lib/utils/sound-effects";

interface BatchActionBarProps {
  selectedCount: number;
  totalBytes: number;
  onDownloadZip: () => void;
  onDelete: () => void;
  onShare: () => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  totalBytes,
  onDownloadZip,
  onDelete,
  onShare,
  onClearSelection,
  isProcessing = false,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 350 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="liquid-glass-elevated rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl min-w-[420px]">
            {/* Selection info */}
            <div className="flex items-center gap-2.5 pr-4 border-r border-white/[0.08]">
              <div className="flex items-center justify-center w-8 h-8 rounded-2xl bg-accent/15">
                <CheckSquare className="h-4 w-4 text-accent-text" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedCount} file{selectedCount !== 1 ? "s" : ""}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatBytes(totalBytes)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  SoundManager.play("pop");
                  onDownloadZip();
                }}
                disabled={isProcessing}
                className="gap-1.5 text-xs text-foreground/80 hover:text-white hover:bg-white/[0.08]"
              >
                <Archive className="h-3.5 w-3.5 text-success" />
                ZIP & Download
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  SoundManager.play("pop");
                  onShare();
                }}
                disabled={isProcessing}
                className="gap-1.5 text-xs text-foreground/80 hover:text-white hover:bg-white/[0.08]"
              >
                <Share2 className="h-3.5 w-3.5 text-accent-text" />
                Share
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  SoundManager.play("error");
                  onDelete();
                }}
                disabled={isProcessing}
                className="gap-1.5 text-xs text-foreground/80 hover:text-danger hover:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>

            {/* Clear selection */}
            <button
              onClick={() => {
                SoundManager.play("click");
                onClearSelection();
              }}
              className="ml-auto flex items-center justify-center w-7 h-7 rounded-2xl hover:bg-white/[0.08] transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
