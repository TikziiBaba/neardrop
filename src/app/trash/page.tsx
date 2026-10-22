"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { Trash2, RotateCcw, Loader2, Clock, AlertTriangle, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";

type TrashFile = { id: string; filename: string; size: number; mimeType: string; deletedAt: string; daysLeft: number };

export default function TrashPage() {
  const { authFetch, refreshFiles } = useStorage();
  const { locale } = useLanguage();
  const L = (tr: string, en: string) => (locale === "tr" ? tr : en);

  const [files, setFiles] = useState<TrashFile[]>([]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ ids: string[] | "all" } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/api/files/trash");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFiles(data.files || []);
      setRetentionDays(data.retentionDays || 30);
    } catch {
      toast.error(L("Çöp kutusu yüklenemedi.", "Could not load trash."));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (action: "restore" | "purge", ids: string[] | "all") => {
    setBusy(true);
    try {
      const res = await authFetch("/api/files/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids === "all" ? { action, all: true } : { action, fileIds: ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || L("İşlem başarısız.", "Action failed."));
      if (action === "restore") {
        toast.success(L(`${data.restored} dosya geri yüklendi.`, `${data.restored} file(s) restored.`));
        await refreshFiles();
      } else {
        toast.success(L(`${data.purged} dosya kalıcı olarak silindi.`, `${data.purged} file(s) permanently deleted.`));
      }
      setSelected(new Set());
      await load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = files.length > 0 && selected.size === files.length;
  const selectedIds = Array.from(selected);
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2.5">
              <span>{L("Çöp Kutusu", "Trash")}</span>
              <Badge variant="secondary" className="text-xs">
                {files.length} · {formatBytes(totalSize)}
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {L(
                `Silinen dosyalar ${retentionDays} gün burada kalır, sonra kalıcı olarak silinir. Çöpteki dosyalar kotanızdan düşmez.`,
                `Deleted files stay here for ${retentionDays} days, then they are permanently removed. Files in trash don't count toward your quota.`
              )}
            </p>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.size > 0 && (
                <Button variant="secondary" size="sm" disabled={busy} onClick={() => act("restore", selectedIds)} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {L(`Seçilenleri geri yükle (${selected.size})`, `Restore selected (${selected.size})`)}
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                disabled={busy}
                onClick={() => setConfirm({ ids: selected.size > 0 ? selectedIds : "all" })}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {selected.size > 0 ? L("Seçilenleri kalıcı sil", "Delete selected forever") : L("Çöpü boşalt", "Empty trash")}
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-accent-text" />
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/30 p-12 text-center space-y-3">
            <Trash2 className="h-10 w-10 text-subtle/80 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground/80">{L("Çöp kutusu boş", "Trash is empty")}</h3>
            <p className="text-xs text-subtle max-w-sm mx-auto">
              {L("Sildiğin dosyalar burada görünür ve geri yüklenebilir.", "Files you delete show up here and can be restored.")}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface/60 overflow-hidden divide-y divide-border/60">
            <button
              type="button"
              onClick={() => setSelected(allSelected ? new Set() : new Set(files.map((f) => f.id)))}
              className="flex w-full items-center gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground hover:bg-surface-secondary/30"
            >
              {allSelected ? <CheckSquare className="h-4 w-4 text-accent-text" /> : <Square className="h-4 w-4" />}
              {L("Tümünü seç", "Select all")}
            </button>
            {files.map((f) => {
              const isSelected = selected.has(f.id);
              const urgent = f.daysLeft <= 3;
              return (
                <div key={f.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 transition-colors ${isSelected ? "bg-accent/10" : "hover:bg-surface-secondary/30"}`}>
                  <button type="button" onClick={() => toggle(f.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-pressed={isSelected}>
                    {isSelected ? <CheckSquare className="h-4 w-4 flex-shrink-0 text-accent-text" /> : <Square className="h-4 w-4 flex-shrink-0 text-subtle" />}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{f.filename.split("/").pop()}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {formatBytes(f.size)} · {L("silindi", "deleted")} {formatRelativeTime(f.deletedAt)}
                        {f.filename.includes("/") && ` · ${f.filename.split("/").slice(0, -1).join("/")}`}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-2 pl-7 sm:pl-0">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${urgent ? "bg-warning/15 text-warning" : "bg-surface-secondary text-muted-foreground"}`}>
                      {urgent ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {L(`${f.daysLeft} gün kaldı`, `${f.daysLeft} days left`)}
                    </span>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => act("restore", [f.id])} className="gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5" />
                      {L("Geri yükle", "Restore")}
                    </Button>
                    <Button variant="ghost" size="icon" disabled={busy} onClick={() => setConfirm({ ids: [f.id] })} aria-label={L("Kalıcı sil", "Delete forever")}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={L("Kalıcı olarak silinsin mi?", "Delete permanently?")}
        description={
          confirm?.ids === "all"
            ? L(`Çöp kutusundaki ${files.length} dosyanın tamamı kalıcı olarak silinecek. Bu işlem geri alınamaz.`, `All ${files.length} files in trash will be permanently deleted. This cannot be undone.`)
            : L(`${confirm?.ids.length ?? 0} dosya kalıcı olarak silinecek. Bu işlem geri alınamaz.`, `${confirm?.ids.length ?? 0} file(s) will be permanently deleted. This cannot be undone.`)
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirm(null)} disabled={busy}>
            {L("Vazgeç", "Cancel")}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => confirm && act("purge", confirm.ids)} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {L("Kalıcı sil", "Delete forever")}
          </Button>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
