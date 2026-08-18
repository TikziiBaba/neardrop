"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudFile } from "@/types";
import { useStorage } from "@/lib/storage/store";
import { toast } from "sonner";

interface RenameModalProps {
  file: CloudFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({ file, open, onOpenChange }) => {
  const { renameFile } = useStorage();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (file) setName(file.filename);
  }, [file]);

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === file.filename) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await renameFile(file.id, name.trim());
      toast.success("File renamed successfully!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to rename file");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rename File"
      description="Enter a new name for this file."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Filename.ext"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Renaming..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
