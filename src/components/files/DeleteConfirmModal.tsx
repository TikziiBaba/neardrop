"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudFile } from "@/types";
import { useStorage } from "@/lib/storage/store";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteConfirmModalProps {
  file: CloudFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ file, open, onOpenChange }) => {
  const { deleteFile } = useStorage();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!file) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFile(file.id);
      toast.success(`Deleted ${file.filename}`);
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
      onOpenChange={onOpenChange}
      title="Delete File"
      description="Are you sure you want to permanently delete this file? All active share links will be invalidated immediately."
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
          <p>
            <span className="font-semibold">{file.filename}</span> will be permanently deleted from Cloudflare R2 and database records.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
