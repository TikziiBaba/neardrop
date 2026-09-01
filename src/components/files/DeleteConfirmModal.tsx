"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudFile } from "@/types";
import { useStorage } from "@/lib/storage/store";
import { formatBytes } from "@/lib/utils";
import { AlertTriangle, Trash2, ArrowRight, ArrowLeft, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteConfirmModalProps {
  file: CloudFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ file, open, onOpenChange }) => {
  const { deleteFile } = useStorage();
  const [step, setStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset to Step 1 whenever modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setIsDeleting(false);
    }
  }, [open]);

  if (!file) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFile(file.id);
      toast.success(`"${file.filename}" was permanently deleted`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isDeleting) {
          onOpenChange(val);
          if (!val) setStep(1);
        }
      }}
      title={step === 1 ? "Delete File" : "Are You Absolutely Sure?"}
      description={
        step === 1
          ? "You are about to delete this file. Please verify before proceeding."
          : "This action is permanent and cannot be undone."
      }
    >
      <div className="space-y-4 pt-2">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="font-semibold text-zinc-400">Security Verification</span>
          <span className="font-bold text-sky-400">Step {step} of 2</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              step === 1 ? "w-1/2 bg-sky-500" : "w-full bg-red-500"
            }`}
          />
        </div>

        {step === 1 ? (
          /* STEP 1: Initial Warning */
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300">
              <FileText className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <p className="font-bold text-white break-all">{file.filename}</p>
                <p className="text-[11px] text-zinc-400">
                  Size: {formatBytes(file.size)} • Type: {file.mimeType || "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400" />
              <span>All active share links pointing to this file will also be invalidated.</span>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs rounded-xl px-4 py-2 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setStep(2)}
                className="text-xs rounded-xl px-4 py-2 gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold shadow-sm border border-red-500/40"
              >
                <span>Continue to Delete</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: Final Confirmation (Emin misin?) */
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs animate-in fade-in zoom-in-95 duration-200">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-1.5 min-w-0">
                <p className="font-bold text-white text-sm">
                  Permanent Data Removal
                </p>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  <strong className="text-white font-mono">{file.filename}</strong> will be immediately and irreversibly deleted from object storage and database records.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isDeleting}
                className="text-xs rounded-xl gap-1 px-3.5 py-2 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs rounded-xl px-4 py-2 gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold tracking-wide shadow-md shadow-red-900/40 border border-red-500/50"
              >
                <Trash2 className="h-4 w-4 text-white" />
                <span className="text-white">
                  {isDeleting ? "Deleting Permanently..." : "Yes, Delete Permanently"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
