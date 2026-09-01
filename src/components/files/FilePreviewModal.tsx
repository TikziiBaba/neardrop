"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { CloudFile } from "@/types";
import { formatBytes, getFileCategory } from "@/lib/utils";
import { useStorage } from "@/lib/storage/store";
import {
  parseXlsxBlob,
  parseDocxBlob,
  spreadsheetToCsv,
  SpreadsheetData,
  WordDocumentData,
} from "@/lib/utils/office-parser";
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
  Plus,
  Eye,
  Type,
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
  docx: "Word Document", doc: "Word Document",
  xlsx: "Excel Spreadsheet", xls: "Excel Spreadsheet",
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

function getColumnLetter(colIndex: number): string {
  let letter = "";
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
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

  // Office & Document State
  const [parsedDocx, setParsedDocx] = useState<WordDocumentData | null>(null);
  const [parsedXlsx, setParsedXlsx] = useState<SpreadsheetData | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  // Image zoom & pan state
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Code & text editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Spreadsheet cell editor state
  const [spreadsheetGrid, setSpreadsheetGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

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
    setParsedDocx(null);
    setParsedXlsx(null);
    setActiveSheetIndex(0);
    setSpreadsheetGrid([]);
    setSelectedCell(null);
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
    setShowLivePreview(false);
    setShowSearch(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (!open || !file) {
      resetState();
      return;
    }

    const category = getFileCategory(file.mimeType, file.filename);
    if (category !== "image" && category !== "video") {
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

          const ext = file.filename.split(".").pop()?.toLowerCase() || "";

          // If it's a Word document (.docx), fetch blob and parse in-browser
          if (ext === "docx" && data.previewUrl) {
            try {
              const res = await fetch(data.previewUrl);
              const blob = await res.blob();
              const docData = await parseDocxBlob(blob);
              if (!cancelled) {
                setParsedDocx(docData);
                setTextContent(docData.rawText);
                setOriginalContent(docData.rawText);
                setEditContent(docData.rawText);
              }
            } catch (docErr) {
              console.error("Failed to parse docx:", docErr);
            }
          }

          // If it's an Excel document (.xlsx), fetch blob and parse in-browser
          if (ext === "xlsx" && data.previewUrl) {
            try {
              const res = await fetch(data.previewUrl);
              const blob = await res.blob();
              const xlsxData = await parseXlsxBlob(blob);
              if (!cancelled) {
                setParsedXlsx(xlsxData);
                const activeRows = xlsxData.sheets[0]?.rows || [[""]];
                setSpreadsheetGrid(activeRows);
                const csvStr = spreadsheetToCsv(activeRows);
                setTextContent(csvStr);
                setOriginalContent(csvStr);
                setEditContent(csvStr);
              }
            } catch (xlsxErr) {
              console.error("Failed to parse xlsx:", xlsxErr);
            }
          }

          // If it's a CSV or TSV file, initialize spreadsheet grid
          if ((ext === "csv" || ext === "tsv") && data.textContent !== null) {
            const sep = ext === "tsv" ? "\t" : ",";
            const lines = data.textContent.split("\n").filter((l) => l.trim().length > 0);
            const grid = lines.map((l) => l.split(sep).map((c) => c.replace(/^"(.*)"$/, "$1")));
            setSpreadsheetGrid(grid.length > 0 ? grid : [[""]]);
          }

          if (data.textContent !== null) {
            setOriginalContent(data.textContent);
            setEditContent(data.textContent);
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
    setShowLivePreview(false);
    setEditContent(textContent || "");
    setTimeout(() => editorRef.current?.focus(), 50);
  }, [textContent]);

  const handleDiscardChanges = useCallback(() => {
    setEditContent(originalContent);
    setIsEditing(false);
    setHasChanges(false);
  }, [originalContent]);

  // Update cell in spreadsheet grid and sync to edit content
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const updatedGrid = spreadsheetGrid.map((row, r) =>
      r === rIdx
        ? row.map((cell, c) => (c === cIdx ? val : cell))
        : [...row]
    );
    setSpreadsheetGrid(updatedGrid);
    const ext = file?.filename.split(".").pop()?.toLowerCase() || "";
    const sep = ext === "tsv" ? "\t" : ",";
    const newCsv = spreadsheetToCsv(updatedGrid, sep);
    setEditContent(newCsv);
    setHasChanges(true);
  };

  const handleAddSpreadsheetRow = () => {
    const colCount = spreadsheetGrid[0]?.length || 5;
    const newGrid = [...spreadsheetGrid, new Array(colCount).fill("")];
    setSpreadsheetGrid(newGrid);
    const ext = file?.filename.split(".").pop()?.toLowerCase() || "";
    setEditContent(spreadsheetToCsv(newGrid, ext === "tsv" ? "\t" : ","));
    setHasChanges(true);
  };

  const handleAddSpreadsheetCol = () => {
    const newGrid = spreadsheetGrid.map((row) => [...row, ""]);
    setSpreadsheetGrid(newGrid);
    const ext = file?.filename.split(".").pop()?.toLowerCase() || "";
    setEditContent(spreadsheetToCsv(newGrid, ext === "tsv" ? "\t" : ","));
    setHasChanges(true);
  };

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
          if (!confirm("You have unsaved changes. Are you sure you want to close?")) {
            return;
          }
        }
        onClose();
      }
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isEditing || hasChanges) {
          handleSave();
        } else if (isTextFile || parsedDocx || parsedXlsx) {
          handleStartEditing();
        }
      }
      // Ctrl+F to search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, isEditing, hasChanges, isTextFile, parsedDocx, parsedXlsx, showSearch, handleSave, handleStartEditing]);

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

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setImageZoom((z) => Math.min(10, Math.max(0.1, parseFloat((z + delta).toFixed(2)))));
  }, []);

  if (!open || !file) return null;

  const category = getFileCategory(file.mimeType, file.filename);
  if (category !== "image" && category !== "video") return null;

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

  const isImage = category === "image";
  const isVideo = category === "video";
  const isSpreadsheet = false;
  const isWordDoc = false;
  const isHtml = false;
  const isMarkdown = false;
  const isAudio = false;
  const isPdf = false;

  const renderCategoryIcon = () => {
    if (isVideo) {
      return <FileVideo className="h-4 w-4 text-purple-400" />;
    }
    return <FileImage className="h-4 w-4 text-emerald-400" />;
  };

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 text-sky-400 animate-spin relative z-10" />
          </div>
          <p className="text-sm text-zinc-400 font-medium">Dosya açılıyor...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <X className="h-8 w-8 text-rose-400" />
          </div>
          <p className="text-sm text-rose-300 font-medium">Failed to load preview</p>
          <p className="text-xs text-zinc-500 max-w-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={handleDownload} className="mt-2 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Dosyayı İndir</span>
          </Button>
        </div>
      );
    }

    // ─── 1. Image Preview (Dotted Grid & Drag-to-Pan) ───
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
          {/* Zoom Controls Toolbar */}
          <div
            className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/60 rounded-2xl p-1.5 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImageZoom((z) => Math.max(0.1, parseFloat((z - 0.25).toFixed(2))))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="Uzaklaştır (Tekerlek aşağı)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setImageZoom(1); setImagePan({ x: 0, y: 0 }); }}
              className="px-2 py-1 text-xs text-zinc-300 font-mono hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="%100 Görünüme Sıfırla"
            >
              {Math.round(imageZoom * 100)}%
            </button>
            <button
              onClick={() => setImageZoom((z) => Math.min(10, parseFloat((z + 0.25).toFixed(2))))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="Yakınlaştır (Tekerlek yukarı)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-zinc-700/60 mx-1" />
            <button
              onClick={() => setImageRotation((r) => (r + 90) % 360)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="90° Döndür"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setImageZoom(1); setImageRotation(0); setImagePan({ x: 0, y: 0 }); }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="Konumu ve Yakınlaştırmayı Sıfırla"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Canvas Navigation Hint */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
            <span>🖐️ Sürükle (Pan)</span>
            <span>•</span>
            <span>🔍 Tekerlek (Zoom)</span>
            <span>•</span>
            <span>⚡ Çift tık (2x)</span>
          </div>

          {/* Dotted Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "center center",
            }}
          />

          {/* Image */}
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

    // ─── 2. Excel & CSV/TSV Native Spreadsheet Viewer / Editor ───
    if (isSpreadsheet && spreadsheetGrid.length > 0 && !isEditing) {
      const colCount = spreadsheetGrid[0]?.length || 5;

      return (
        <div className="flex flex-col h-full w-full bg-zinc-950">
          {/* Spreadsheet Header Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                <FileSpreadsheet className="h-3 w-3 mr-1 inline" />
                {ext.toUpperCase()} TABLOSU
              </Badge>
              <span className="text-xs text-zinc-400">
                {spreadsheetGrid.length} satır • {colCount} sütun
              </span>
              {hasChanges && (
                <Badge variant="warning" className="text-[10px]">
                  Kaydedilmemiş Değişiklikler
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSpreadsheetRow}
                className="text-xs h-7 gap-1 border-zinc-700 hover:bg-zinc-800"
              >
                <Plus className="h-3 w-3" />
                <span>Satır Ekle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSpreadsheetCol}
                className="text-xs h-7 gap-1 border-zinc-700 hover:bg-zinc-800"
              >
                <Plus className="h-3 w-3" />
                <span>Sütun Ekle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEditing}
                className="text-xs h-7 gap-1 border-zinc-700 hover:bg-zinc-800"
                title="Düz Metin / Kod Olarak Düzenle"
              >
                <CodeIcon className="h-3.5 w-3.5" />
                <span>Metin Editörü</span>
              </Button>
              {hasChanges && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-xs h-7 gap-1 bg-emerald-600 hover:bg-emerald-500"
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  <span>Kaydet</span>
                </Button>
              )}
            </div>
          </div>

          {/* Cell Formula / Info Bar */}
          <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900/60 border-b border-zinc-800/80 text-xs">
            <div className="font-mono font-semibold text-sky-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60 min-w-[3rem] text-center">
              {selectedCell ? `${getColumnLetter(selectedCell.c)}${selectedCell.r + 1}` : "A1"}
            </div>
            <div className="text-zinc-400 font-mono text-[11px] truncate flex-1">
              Değer: <span className="text-zinc-200">{selectedCell ? spreadsheetGrid[selectedCell.r]?.[selectedCell.c] || "" : spreadsheetGrid[0]?.[0] || ""}</span>
            </div>
          </div>

          {/* Interactive Spreadsheet Grid */}
          <div className="flex-1 overflow-auto bg-zinc-950 p-2">
            <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-zinc-900/40 inline-block min-w-full">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 select-none">
                    <th className="px-2 py-2 text-[10px] text-zinc-500 bg-zinc-900/90 border-r border-zinc-800 text-center w-12 sticky left-0 z-20">
                      #
                    </th>
                    {Array.from({ length: colCount }).map((_, cIdx) => (
                      <th
                        key={cIdx}
                        className="px-3 py-2 text-center text-[11px] font-semibold text-zinc-400 border-r border-zinc-800/80 bg-zinc-900 min-w-[120px]"
                      >
                        {getColumnLetter(cIdx)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spreadsheetGrid.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-b border-zinc-800/50 hover:bg-sky-500/5 transition-colors"
                    >
                      {/* Row Index Header */}
                      <td className="px-2 py-1 text-[10px] text-zinc-500 bg-zinc-900/90 border-r border-zinc-800 select-none text-center font-mono sticky left-0 z-10">
                        {rIdx + 1}
                      </td>
                      {/* Editable Cells */}
                      {Array.from({ length: colCount }).map((_, cIdx) => {
                        const cellVal = row[cIdx] || "";
                        const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                        return (
                          <td
                            key={cIdx}
                            onClick={() => setSelectedCell({ r: rIdx, c: cIdx })}
                            className={`p-0 border-r border-zinc-800/40 relative ${
                              isSelected ? "ring-2 ring-sky-500 z-10" : ""
                            }`}
                          >
                            <input
                              type="text"
                              value={cellVal}
                              onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                              onFocus={() => setSelectedCell({ r: rIdx, c: cIdx })}
                              className="w-full bg-transparent px-2.5 py-1.5 text-xs text-zinc-100 outline-none font-sans hover:bg-zinc-800/40 focus:bg-zinc-900 transition-colors"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // ─── 3. Word Document (.docx / .doc) Native Document Sheet ───
    if (isWordDoc && parsedDocx && !isEditing) {
      return (
        <div className="flex flex-col h-full w-full bg-zinc-950">
          {/* Word Header Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-[10px] font-mono text-sky-400 border-sky-500/30">
                <Type className="h-3 w-3 mr-1 inline" />
                WORD BELGESİ
              </Badge>
              <span className="text-xs text-zinc-400">
                {parsedDocx.paragraphs.length} paragraf / bölüm
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartEditing}
                className="text-xs h-7 gap-1 bg-sky-600 hover:bg-sky-500"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Belgeyi Düzenle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-xs h-7 gap-1 border-zinc-700"
              >
                <Download className="h-3.5 w-3.5" />
                <span>İndir</span>
              </Button>
            </div>
          </div>

          {/* Paper Document Layout */}
          <div className="flex-1 overflow-auto bg-zinc-950 p-6 flex justify-center">
            <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-4 text-zinc-100 font-sans leading-relaxed select-text min-h-full">
              {parsedDocx.paragraphs.map((p, idx) => {
                if (p.isTable && p.tableRows) {
                  return (
                    <div key={idx} className="my-4 overflow-x-auto border border-zinc-800 rounded-xl">
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          {p.tableRows.map((tr, rIdx) => (
                            <tr key={rIdx} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                              {tr.map((td, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 border-r border-zinc-800">
                                  {td}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (p.isHeading) {
                  return (
                    <h2
                      key={idx}
                      className="text-xl font-bold text-white tracking-tight pt-3 border-b border-zinc-800 pb-1"
                    >
                      {p.text}
                    </h2>
                  );
                }

                if (p.isBullet) {
                  return (
                    <li key={idx} className="ml-4 text-sm text-zinc-300 list-disc">
                      {p.text}
                    </li>
                  );
                }

                return (
                  <p
                    key={idx}
                    className={`text-sm ${p.isBold ? "font-semibold text-white" : "text-zinc-300"}`}
                  >
                    {p.text}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // ─── 4. HTML / Markdown Live Preview Mode ───
    if (showLivePreview && (isHtml || isMarkdown) && !isEditing) {
      return (
        <div className="flex flex-col h-full w-full bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-zinc-300 font-semibold">CANLI ÖNİZLEME ({ext.toUpperCase()})</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLivePreview(false)}
                className="text-xs h-7 gap-1 border-zinc-700"
              >
                <CodeIcon className="h-3.5 w-3.5" />
                <span>Kodu Göster</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartEditing}
                className="text-xs h-7 gap-1 bg-sky-600 hover:bg-sky-500"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Düzenle</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-white p-4 overflow-auto">
            {isHtml ? (
              <iframe
                srcDoc={textContent || editContent}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
                title="Live HTML Preview"
              />
            ) : (
              <div className="prose max-w-3xl mx-auto text-zinc-900 p-6 whitespace-pre-wrap font-sans">
                {textContent || editContent}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ─── 5. Text / Code / HTML / CSS / JS / Python / SQL Editor ───
    if (isTextFile || isWordDoc || isSpreadsheet) {
      const displayContent = isEditing ? editContent : textContent || "";
      const lines = displayContent.split("\n");
      const lang = getLanguageLabel(file.filename);
      const lineDigits = String(lines.length).length;
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
              {/* HTML / Markdown Live Preview Switcher */}
              {(isHtml || isMarkdown) && !isEditing && (
                <button
                  onClick={() => setShowLivePreview(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl transition-colors"
                  title="Canlı Render Önizlemesi"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Canlı Önizleme</span>
                </button>
              )}

              {/* Spreadsheet Table View Switcher */}
              {isSpreadsheet && !isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors"
                  title="Tablo Görünümüne Dön"
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  <span>Tablo Görünümü</span>
                </button>
              )}

              {/* Word Wrap Toggle */}
              <button
                onClick={() => setWordWrap((w) => !w)}
                className={`p-1.5 text-xs rounded-xl border transition-colors ${
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
                className={`p-1.5 text-xs rounded-xl border transition-colors ${
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

          {/* Content Area */}
          {isEditing ? (
            /* ── Live Editor with Line Numbers ── */
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
            /* ── View Mode: Table with Line Numbers ── */
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

    // ─── 6. Video Preview ───
    if (isVideo && previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-8 bg-zinc-950/80 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-zinc-950/40 to-zinc-950" />
          <div className="relative z-10 max-w-5xl w-full max-h-[82vh] flex items-center justify-center rounded-2xl overflow-hidden border border-zinc-800/80 bg-black/90 shadow-2xl shadow-purple-500/5">
            <video
              src={previewUrl}
              controls
              autoPlay={false}
              playsInline
              className="max-w-full max-h-[78vh] w-auto h-auto rounded-xl outline-none"
            >
              Tarayıcınız video etiketini desteklemiyor.
            </video>
          </div>
        </div>
      );
    }

    // ─── 7. Audio Preview ───
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
            Tarayıcınız ses etiketini desteklemiyor.
          </audio>
        </div>
      );
    }

    // ─── 8. PDF Preview (Native browser iframe) ───
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

    // ─── 9. Fallback: unsupported binary file ───
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
          This binary file type cannot be previewed directly. You can download and open it on your device.
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
            toast.warning("You have unsaved changes. Save or discard before leaving.");
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
                  {file.mimeType.split("/")[1]?.toUpperCase() || ext.toUpperCase() || "DOSYA"}
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
                  toast.warning("You have unsaved changes. Save or discard them first.");
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
