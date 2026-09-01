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
      toast.success(`"${file.filename}" başarıyla silindi`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Dosya silinirken bir hata oluştu");
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
      title={step === 1 ? "Dosyayı Sil" : "⚠️ 2. Onay: Gerçekten Emin Misiniz?"}
      description={
        step === 1
          ? "Bu dosyayı silmek üzeresiniz. Lütfen işlemi onaylayın."
          : "Bu işlem geri alınamaz! Dosya buluttan ve veritabanından kalıcı olarak silinecektir."
      }
    >
      <div className="space-y-4 pt-2">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="font-semibold text-zinc-400">Güvenlik Onayı</span>
          <span className="font-bold text-sky-400">Adım {step} / 2</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              step === 1 ? "w-1/2 bg-sky-500" : "w-full bg-rose-500 animate-pulse"
            }`}
          />
        </div>

        {step === 1 ? (
          /* STEP 1: Initial Warning */
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300">
              <FileText className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white break-all">{file.filename}</p>
                <p className="text-[11px] text-zinc-400">
                  Boyut: {formatBytes(file.size)} • Tür: {file.mimeType || "Bilinmeyen"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400" />
              <span>Bu dosyaya bağlı olan tüm aktif paylaşım linkleri de geçersiz kalacaktır.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs rounded-xl"
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setStep(2)}
                className="text-xs rounded-xl gap-1.5 bg-rose-600 hover:bg-rose-500"
              >
                <span>Silmek İstiyorum</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: Second Confirmation (Emin misin?) */
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs animate-in fade-in zoom-in-95 duration-200">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5 animate-bounce-slow" />
              <div className="space-y-1.5">
                <p className="font-bold text-white text-sm">
                  Son Kararınız mı? Dosya Kalıcı Olarak Yok Edilecek!
                </p>
                <p className="text-[11px] text-rose-300/90 leading-relaxed">
                  <strong className="text-white font-mono">{file.filename}</strong> dosyası R2 bulut depolama ve veritabanı kayıtlarından tamamen kaldırılacaktır.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isDeleting}
                className="text-xs rounded-xl gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Geri Dön</span>
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs rounded-xl gap-1.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 font-bold shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? "Kalıcı Olarak Siliniyor..." : "Evet, Kesinlikle Sil (Son Onay)"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
