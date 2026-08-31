"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { CloudFile } from "@/types";
import { formatBytes, getFileCategory } from "@/lib/utils";
import { useStorage } from "@/lib/storage/store";
import { toast } from "sonner";
import {
  X,
  Download,
  Share2,
  Trash2,
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Save,
  Undo2,
  Table as TableIcon,
  Code as CodeIcon,
  WrapText,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilePreviewModalProps {
  file: CloudFile | null;
  open: boolean;
  onClose: () => void;
  onShare: (file: CloudFile) => void;
  onDelete: (file: CloudFile) => void;
}

const EXT_LANG_MAP: Record<string, string> = {
  js: "JavaScript", jsx: "JavaScript (React)", mjs: "JavaScript", cjs: "JavaScript",
  ts: "TypeScript", tsx: "TypeScript (React)",
  py: "Python", pyw: "Python",
  rb: "Ruby",
  go: "Go",
  rs: "Rust",
  c: "C", cpp: "C++", h: "C Header", hpp: "C++ Header",
  cs: "C#",
  java: "Java", kt: "Kotlin", swift: "Swift", scala: "Scala",
  html: "HTML", htm: "HTML", xhtml: "XHTML",
  css: "CSS", scss: "SCSS", sass: "SASS", less: "LESS",
  json: "JSON",
  xml: "XML", svg: "SVG",
  yaml: "YAML", yml: "YAML", toml: "TOML",
  sql: "SQL",
  sh: "Bash", bash: "Bash", zsh: "Zsh",
  ps1: "PowerShell", bat: "Batch", cmd: "Batch",
  md: "Markdown", markdown: "Markdown",
  txt: "Text", text: "Text", log: "Log",
  csv: "CSV", tsv: "TSV",
  dockerfile: "Dockerfile",
  makefile: "Makefile",
  graphql: "GraphQL", gql: "GraphQL",
  r: "R",
  lua: "Lua",
  dart: "Dart",
  php: "PHP",
  vue: "Vue",
  svelte: "Svelte",
  astro: "Astro",
  ini: "INI", cfg: "Config", conf: "Config", env: "Environment",
  gitignore: "Gitignore", editorconfig: "EditorConfig", lock: "Lockfile",
  rtf: "Rich Text", tex: "LaTeX",
};

function getLanguageLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const baseName = filename.split("/").pop()?.toLowerCase() || "";
  return EXT_LANG_MAP[baseName] || EXT_LANG_MAP[ext] || "Plaintext";
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  open,
  onClose,
  onShare,
  onDelete,
}) => {
  const { downloadFile, previewFile, saveFileContent } = useStorage();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isTextFile, setIsTextFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image zoom & pan state
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Code editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [csvTableView, setCsvTableView] = useState(false);

  // Search in editor
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Code copy
  const [copied, setCopied] = useState(false);

  const resetState = useCallback(() => {
    setPreviewUrl(null);
    setTextContent(null);
    setIsTextFile(false);
    setError(null);
    setImageZoom(1);
    setImageRotation(0);
    setImagePan({ x: 0, y: 0 });
    setIsDragging(false);
    setCopied(false);
    setIsEditing(false);
    setEditContent("");
    setOriginalContent("");
    setIsSaving(false);
    setHasChanges(false);
    setWordWrap(false);
    setCsvTableView(false);
    setShowSearch(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (!open || !file) {
      resetState();
      return;
    }

    let cancelled = false;
    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await previewFile(file.id);
        if (cancelled) return;
        if (data) {
          setPreviewUrl(data.previewUrl);
          setTextContent(data.textContent);
          setIsTextFile(data.isTextFile);
          if (data.textContent !== null) {
            setOriginalContent(data.textContent);
            setEditContent(data.textContent);
            const ext = file.filename.split(".").pop()?.toLowerCase() || "";
            if (ext === "csv" || ext === "tsv") {
              setCsvTableView(true);
            }
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load preview");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPreview();
    return () => { cancelled = true; };
  }, [open, file, previewFile, resetState]);

  // Track edit changes
  useEffect(() => {
    setHasChanges(editContent !== originalContent);
  }, [editContent, originalContent]);

  const handleSave = useCallback(async () => {
    if (!file || isSaving || !hasChanges) return;
    setIsSaving(true);
    try {
      await saveFileContent(file.id, editContent);
      setTextContent(editContent);
      setOriginalContent(editContent);
      setHasChanges(false);
      toast.success("Dosya başarıyla kaydedildi!");
    } catch (err: any) {
      toast.error(err.message || "Kaydetme başarısız");
    } finally {
      setIsSaving(false);
    }
  }, [file, isSaving, hasChanges, saveFileContent, editContent]);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    setCsvTableView(false);
    setEditContent(textContent || "");
    setTimeout(() => editorRef.current?.focus(), 50);
  }, [textContent]);

  const handleDiscardChanges = useCallback(() => {
    setEditContent(originalContent);
    setIsEditing(false);
    setHasChanges(false);
  }, [originalContent]);

  // Sync editor scroll with line numbers gutter
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSearch) {
          setShowSearch(false);
          return;
        }
        if (isEditing && hasChanges) {
          if (!confirm("Kaydedilmemiş değişiklikleriniz var. Kapatmak istediğinize emin misiniz?")) {
            return;
          }
        }
        onClose();
      }
      // Ctrl+S to save when editing
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isEditing) {
          handleSave();
        } else if (isTextFile) {
          handleStartEditing();
        }
      }
      // Ctrl+F to search
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && isTextFile) {
        e.preventDefault();
        setShowSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, isEditing, hasChanges, isTextFile, showSearch, handleSave, handleStartEditing]);

  // Image drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...imagePan };
  }, [imagePan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setImagePan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag for mobile/tablets
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...imagePan };
    }
  }, [imagePan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setImagePan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  }, [isDragging]);

  // Image scroll zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setImageZoom((z) => Math.min(10, Math.max(0.1, parseFloat((z + delta).toFixed(2)))));
  }, []);

  if (!open || !file) return null;

  const category = getFileCategory(file.mimeType, file.filename);
  const displayName = file.filename.split("/").pop() || file.filename;
  const ext = displayName.split(".").pop()?.toLowerCase() || "";

  const handleDownload = async () => {
    try {
      await downloadFile(file.id);
      toast.success("İndirme başladı!");
    } catch (err: any) {
      toast.error(err.message || "İndirme başarısız");
    }
  };

  const handleCopyCode = async () => {
    const content = isEditing ? editContent : textContent;
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("İçerik panoya kopyalandı!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const renderCategoryIcon = () => {
    const cls = "h-4 w-4";
    switch (category) {
      case "archive": return <FileArchive className={`${cls} text-amber-400`} />;
      case "image": return <FileImage className={`${cls} text-emerald-400`} />;
      case "video": return <FileVideo className={`${cls} text-purple-400`} />;
      case "audio": return <FileAudio className={`${cls} text-pink-400`} />;
      case "code": return <FileCode className={`${cls} text-cyan-400`} />;
      default: return <FileText className={`${cls} text-sky-400`} />;
    }
  };

  // Determine preview type
  const isImage = category === "image";
  const isVideo = category === "video";
  const isAudio = category === "audio";
  const isPdf = ext === "pdf" || file.mimeType === "application/pdf";
  const isOfficeDoc = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp"].includes(ext);
  const isCsvOrTsv = ext === "csv" || ext === "tsv";

  // Parse CSV/TSV table
  const parseCsvToRows = (content: string, separator: string = ",") => {
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      const row: string[] = [];
      let inQuotes = false;
      let cell = "";
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === separator && !inQuotes) {
          row.push(cell.trim());
          cell = "";
        } else {
          cell += char;
        }
      }
      row.push(cell.trim());
      return row;
    });
  };

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 text-sky-400 animate-spin relative z-10" />
          </div>
          <p className="text-sm text-zinc-400 font-medium">Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <X className="h-8 w-8 text-rose-400" />
          </div>
          <p className="text-sm text-rose-300 font-medium">Preview failed</p>
          <p className="text-xs text-zinc-500 max-w-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={handleDownload} className="mt-2 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Download Instead</span>
          </Button>
        </div>
      );
    }

    // ─── Image Preview (with Dotted Grid & Drag-to-Pan) ───
    if (isImage && previewUrl) {
      return (
        <div
          className="relative flex items-center justify-center h-full w-full overflow-hidden select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Zoom Controls & Pan Reset Toolbar */}
          <div
            className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/60 rounded-2xl p-1.5 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImageZoom((z) => Math.max(0.1, parseFloat((z - 0.25).toFixed(2))))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="Zoom out (Mouse wheel down)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setImageZoom(1); setImagePan({ x: 0, y: 0 }); }}
              className="px-2 py-1 text-xs text-zinc-300 font-mono hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Click to reset to 100%"
            >
              {Math.round(imageZoom * 100)}%
            </button>
            <button
              onClick={() => setImageZoom((z) => Math.min(10, parseFloat((z + 0.25).toFixed(2))))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Zoom in (Mouse wheel up)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-zinc-700/60 mx-1" />
            <button
              onClick={() => setImageRotation((r) => (r + 90) % 360)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="Rotate 90°"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setImageZoom(1); setImageRotation(0); setImagePan({ x: 0, y: 0 }); }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="Reset View"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Canvas Navigation Hint */}
          <div
            className="absolute bottom-4 left-4 z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2"
          >
            <span>🖐️ Sürükle (Pan)</span>
            <span>•</span>
            <span>🔍 Tekerlek (Zoom)</span>
            <span>•</span>
            <span>⚡ Çift tık (2x)</span>
          </div>

          {/* Crisp Dotted Grid Background (. . .) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "center center",
            }}
          />

          {/* The Image (draggable & zoomable) */}
          <img
            src={previewUrl}
            alt={displayName}
            className="max-w-full max-h-full object-contain relative z-10 select-none shadow-2xl rounded-sm"
            style={{
              transform: `translate3d(${imagePan.x}px, ${imagePan.y}px, 0) scale(${imageZoom}) rotate(${imageRotation}deg)`,
              transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform",
            }}
            draggable={false}
            onDoubleClick={() => {
              if (imageZoom === 1) {
                setImageZoom(2);
              } else {
                setImageZoom(1);
                setImagePan({ x: 0, y: 0 });
              }
            }}
          />
        </div>
      );
    }

    // ─── Video Preview ───
    if (isVideo && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full w-full p-4">
          <video
            src={previewUrl}
            controls
            autoPlay={false}
            className="max-w-full max-h-full rounded-2xl shadow-2xl shadow-black/60 border border-zinc-800"
            style={{ backgroundColor: "#000" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // ─── Audio Preview ───
    if (isAudio && previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 shadow-2xl">
              <FileAudio className="h-16 w-16 text-pink-400" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h4 className="font-semibold text-white text-lg">{displayName}</h4>
            <p className="text-xs text-zinc-400">{formatBytes(file.size)}</p>
          </div>
          <audio
            src={previewUrl}
            controls
            className="w-full max-w-md"
            style={{ filter: "invert(1) hue-rotate(180deg) brightness(0.85)" }}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // ─── PDF Preview ───
    if (isPdf && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full w-full p-4">
          <iframe
            src={previewUrl}
            className="w-full h-full rounded-2xl border border-zinc-800 bg-white shadow-2xl"
            title={displayName}
          />
        </div>
      );
    }

    // ─── Office Documents (.docx, .xlsx, .pptx) ───
    if (isOfficeDoc && previewUrl) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`;
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;

      return (
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/60 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-300 font-medium">{displayName}</span>
              <Badge variant="secondary" className="text-[10px]">{ext.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleDownload} className="gap-1.5 text-xs h-7">
                <Download className="h-3.5 w-3.5" />
                <span>İndir</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-zinc-950 p-2">
            <iframe
              src={googleDocsUrl}
              className="w-full h-full rounded-xl border border-zinc-800 bg-white"
              title={displayName}
            />
          </div>
        </div>
      );
    }

    // ─── Text / Code / HTML / CSS / JS / CSV / TSV Preview & Editor ───
    if (isTextFile && textContent !== null) {
      const displayContent = isEditing ? editContent : textContent;
      const lines = displayContent.split("\n");
      const lang = getLanguageLabel(file.filename);
      const lineDigits = String(lines.length).length;

      // Filtered lines for search
      const matchesSearch = searchQuery.trim().length > 0;

      return (
        <div className="flex flex-col h-full w-full bg-zinc-950">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 border-b border-zinc-800/80 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="text-[10px] font-mono font-semibold">
                {lang}
              </Badge>
              <span className="text-xs text-zinc-400">
                {lines.length} satır • {formatBytes(isEditing ? new Blob([editContent]).size : file.size)}
              </span>
              {isEditing && (
                <Badge
                  variant={hasChanges ? "warning" : "success"}
                  className="text-[10px]"
                >
                  {hasChanges ? "Kaydedilmemiş Değişiklikler" : "Değişiklik Yok"}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* CSV/TSV Table View Toggle */}
              {isCsvOrTsv && !isEditing && (
                <button
                  onClick={() => setCsvTableView((t) => !t)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                    csvTableView
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      : "text-zinc-400 hover:text-white bg-zinc-800/80 border-zinc-700/50"
                  }`}
                  title={csvTableView ? "Kod Olarak Göster" : "Tablo Olarak Göster"}
                >
                  {csvTableView ? <CodeIcon className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
                  <span>{csvTableView ? "Kod Görünümü" : "Tablo Görünümü"}</span>
                </button>
              )}

              {/* Word Wrap Toggle */}
              <button
                onClick={() => setWordWrap((w) => !w)}
                className={`p-1.5 text-xs rounded-lg border transition-colors ${
                  wordWrap
                    ? "text-sky-400 bg-sky-500/10 border-sky-500/30"
                    : "text-zinc-400 hover:text-white bg-zinc-800/80 border-zinc-700/50"
                }`}
                title="Satır Kaydırma (Word Wrap)"
              >
                <WrapText className="h-3.5 w-3.5" />
              </button>

              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch((s) => !s)}
                className={`p-1.5 text-xs rounded-lg border transition-colors ${
                  showSearch
                    ? "text-sky-400 bg-sky-500/10 border-sky-500/30"
                    : "text-zinc-400 hover:text-white bg-zinc-800/80 border-zinc-700/50"
                }`}
                title="Ara (Ctrl+F)"
              >
                <Search className="h-3.5 w-3.5" />
              </button>

              {isEditing ? (
                <>
                  {/* Save */}
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-semibold border transition-all ${
                      hasChanges && !isSaving
                        ? "text-white bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20"
                        : "text-zinc-500 bg-zinc-800/80 border-zinc-700/50 cursor-not-allowed"
                    }`}
                    title="Kaydet (Ctrl+S)"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>{isSaving ? "Kaydediliyor..." : "Kaydet"}</span>
                  </button>
                  {/* Cancel */}
                  <button
                    onClick={handleDiscardChanges}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl transition-colors"
                    title="Değişiklikleri İptal Et"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>İptal</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Edit Button */}
                  <button
                    onClick={handleStartEditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 border border-sky-500/40 rounded-xl shadow-lg shadow-sky-500/20 transition-all"
                    title="Dosyayı Düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Düzenle</span>
                  </button>
                  {/* Copy */}
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl transition-colors"
                    title="Kopyala"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Kopyalandı!" : "Kopyala"}</span>
                  </button>
                  {/* Raw URL */}
                  <a
                    href={previewUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl transition-colors"
                    title="Ham Dosyayı Aç"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Raw</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Search Sub-bar */}
          {showSearch && (
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex-shrink-0 animate-in slide-in-from-top-2 duration-150">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Dosya içinde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-zinc-800/80 border border-zinc-700/60 rounded-lg px-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-zinc-400 hover:text-white p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setShowSearch(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                Kapat
              </button>
            </div>
          )}

          {/* Main Content Area */}
          {csvTableView && !isEditing ? (
            /* ── CSV / TSV Table Mode ── */
            <div className="flex-1 overflow-auto p-4 select-text">
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    {parseCsvToRows(displayContent, ext === "tsv" ? "\t" : ",").map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={
                          rIdx === 0
                            ? "bg-zinc-800/80 font-semibold text-white border-b border-zinc-700/80"
                            : "border-b border-zinc-800/40 hover:bg-sky-500/5 text-zinc-300 transition-colors"
                        }
                      >
                        <td className="px-3 py-2 text-[10px] text-zinc-500 bg-zinc-900/80 border-r border-zinc-800 select-none w-10 text-right">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 border-r border-zinc-800/40 truncate max-w-xs">
                            {cell || <span className="text-zinc-600 italic">empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : isEditing ? (
            /* ── Edit Mode: Live Editor with Synced Line Numbers ── */
            <div className="flex-1 flex overflow-hidden relative">
              {/* Line numbers gutter */}
              <div
                ref={gutterRef}
                className="flex-shrink-0 bg-zinc-950 border-r border-zinc-800/60 overflow-hidden select-none pointer-events-none py-3"
              >
                <div className="font-mono text-[13px] leading-[1.6] text-zinc-600 text-right">
                  {editContent.split("\n").map((_, i) => (
                    <div key={i} className="px-3" style={{ minWidth: `${lineDigits + 2}ch` }}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={editorRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onScroll={handleEditorScroll}
                className={`flex-1 bg-zinc-950 text-zinc-100 font-mono text-[13px] leading-[1.6] px-4 py-3 resize-none outline-none border-none ${
                  wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
                }`}
                spellCheck={false}
                style={{
                  tabSize: 2,
                  caretColor: "#38bdf8",
                }}
                onKeyDown={(e) => {
                  // Tab support: insert 2 spaces
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const ta = e.currentTarget;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const newVal = editContent.substring(0, start) + "  " + editContent.substring(end);
                    setEditContent(newVal);
                    requestAnimationFrame(() => {
                      ta.selectionStart = ta.selectionEnd = start + 2;
                    });
                  }
                  // Auto-indent on Enter
                  if (e.key === "Enter") {
                    const ta = e.currentTarget;
                    const start = ta.selectionStart;
                    const currentLine = editContent.substring(0, start).split("\n").pop() || "";
                    const indentMatch = currentLine.match(/^(\s+)/);
                    if (indentMatch) {
                      e.preventDefault();
                      const indent = indentMatch[1];
                      const newVal = editContent.substring(0, start) + "\n" + indent + editContent.substring(ta.selectionEnd);
                      setEditContent(newVal);
                      requestAnimationFrame(() => {
                        ta.selectionStart = ta.selectionEnd = start + 1 + indent.length;
                      });
                    }
                  }
                }}
              />
            </div>
          ) : (
            /* ── View Mode: Table with Line Numbers & Search Highlight ── */
            <div className="flex-1 overflow-auto font-mono text-[13px] leading-[1.6] select-text py-2">
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, i) => {
                    const isMatch = matchesSearch && line.toLowerCase().includes(searchQuery.toLowerCase());
                    return (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          isMatch ? "bg-amber-500/20 font-medium" : "hover:bg-sky-500/5"
                        }`}
                      >
                        <td
                          className="sticky left-0 text-right px-3 py-0 select-none text-zinc-600 bg-zinc-950 border-r border-zinc-800/40 align-top"
                          style={{ minWidth: `${lineDigits + 2}ch` }}
                        >
                          {i + 1}
                        </td>
                        <td
                          className={`px-4 py-0 text-zinc-200 ${
                            wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
                          }`}
                        >
                          {line || "\u00A0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    // ─── Fallback: unsupported file type ───
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 blur-3xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-800/80 border border-zinc-700/60 shadow-xl">
            {renderCategoryIcon()}
          </div>
        </div>
        <div className="space-y-1.5">
          <h4 className="font-semibold text-white text-lg">{displayName}</h4>
          <p className="text-xs text-zinc-400">
            {formatBytes(file.size)} • {file.mimeType}
          </p>
        </div>
        <p className="text-xs text-zinc-500 max-w-sm">
          Bu dosya türü tarayıcıda doğrudan düzenlenemez. İndirip cihazınızda açabilirsiniz.
        </p>
        <Button variant="primary" size="default" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          <span>Dosyayı İndir</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (isEditing && hasChanges) {
            toast.warning("Kaydedilmemiş değişiklikleriniz var. Çıkmadan önce kaydedin veya iptal edin.");
            return;
          }
          onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative z-[61] flex flex-col h-full w-full animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-950/90 border-b border-zinc-800/60 backdrop-blur-xl flex-shrink-0">
          {/* Left: File Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex-shrink-0">
              {renderCategoryIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-white truncate">{displayName}</h3>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <Badge variant="secondary" className="text-[10px] py-0 font-mono">
                  {file.mimeType.split("/")[1]?.toUpperCase() || ext.toUpperCase() || "FILE"}
                </Badge>
                {isEditing && (
                  <>
                    <span>•</span>
                    <Badge variant="sky" className="text-[10px] py-0">DÜZENLEME MODU</Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-zinc-400 hover:text-white h-8 w-8 p-0"
              title="İndir"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onClose(); onShare(file); }}
              className="text-zinc-400 hover:text-sky-400 h-8 w-8 p-0"
              title="Paylaş"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onClose(); onDelete(file); }}
              className="text-zinc-400 hover:text-rose-400 h-8 w-8 p-0"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-zinc-800 mx-1" />
            <button
              onClick={() => {
                if (isEditing && hasChanges) {
                  toast.warning("Kaydedilmemiş değişiklikler var. Kaydedin veya iptal edin.");
                  return;
                }
                onClose();
              }}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Kapat (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden bg-zinc-950">
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
};
