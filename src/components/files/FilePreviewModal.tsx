"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// Extension to rough language mapping for syntax highlighting class names
const EXT_LANG_MAP: Record<string, string> = {
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
  ts: "typescript", tsx: "typescript",
  py: "python", pyw: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  c: "c", cpp: "cpp", h: "c", hpp: "cpp",
  cs: "csharp",
  java: "java", kt: "kotlin", swift: "swift", scala: "scala",
  html: "html", htm: "html",
  css: "css", scss: "scss", sass: "sass", less: "less",
  json: "json",
  xml: "xml",
  yaml: "yaml", yml: "yaml", toml: "toml",
  sql: "sql",
  sh: "bash", bash: "bash", zsh: "bash",
  ps1: "powershell", bat: "batch", cmd: "batch",
  md: "markdown", markdown: "markdown",
  txt: "plaintext",
  csv: "csv",
  dockerfile: "dockerfile",
  makefile: "makefile",
  graphql: "graphql", gql: "graphql",
  r: "r",
  lua: "lua",
  dart: "dart",
  php: "php",
  vue: "vue",
  svelte: "svelte",
  astro: "astro",
  ini: "ini", cfg: "ini", conf: "ini",
  log: "plaintext",
  env: "plaintext",
  gitignore: "plaintext",
  editorconfig: "plaintext",
};

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const baseName = filename.split("/").pop()?.toLowerCase() || "";
  // Check basename matches (Dockerfile, Makefile, etc.)
  if (EXT_LANG_MAP[baseName]) return EXT_LANG_MAP[baseName];
  return EXT_LANG_MAP[ext] || "plaintext";
}

function getLanguageLabel(filename: string): string {
  const lang = getLanguageFromFilename(filename);
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  open,
  onClose,
  onShare,
  onDelete,
}) => {
  const { downloadFile, previewFile } = useStorage();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isTextFile, setIsTextFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image zoom state
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // Code copy
  const [copied, setCopied] = useState(false);

  const resetState = useCallback(() => {
    setPreviewUrl(null);
    setTextContent(null);
    setIsTextFile(false);
    setError(null);
    setImageZoom(1);
    setImageRotation(0);
    setCopied(false);
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

  // Keyboard handler
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !file) return null;

  const category = getFileCategory(file.mimeType, file.filename);
  const displayName = file.filename.split("/").pop() || file.filename;
  const ext = displayName.split(".").pop()?.toLowerCase() || "";

  const handleDownload = async () => {
    try {
      await downloadFile(file.id);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  };

  const handleCopyCode = async () => {
    if (textContent) {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      toast.success("Code copied to clipboard!");
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

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 text-sky-400 animate-spin relative z-10" />
          </div>
          <p className="text-sm text-zinc-400">Loading preview...</p>
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

    // Image Preview
    if (isImage && previewUrl) {
      return (
        <div className="relative flex items-center justify-center h-full w-full overflow-hidden">
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-lg border border-zinc-700/60 rounded-xl px-2 py-1.5 shadow-xl">
            <button
              onClick={() => setImageZoom((z) => Math.max(0.25, z - 0.25))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-zinc-300 font-mono min-w-[3rem] text-center">
              {Math.round(imageZoom * 100)}%
            </span>
            <button
              onClick={() => setImageZoom((z) => Math.min(5, z + 0.25))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-zinc-700/60 mx-0.5" />
            <button
              onClick={() => setImageRotation((r) => r + 90)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Rotate"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setImageZoom(1); setImageRotation(0); }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Reset"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Checkered background for transparent images */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              opacity: 0.3,
            }}
          />

          <img
            src={previewUrl}
            alt={displayName}
            className="max-w-full max-h-full object-contain relative z-10 transition-transform duration-200 select-none"
            style={{
              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
              cursor: imageZoom > 1 ? "grab" : "default",
            }}
            draggable={false}
            onDoubleClick={() => setImageZoom(imageZoom === 1 ? 2 : 1)}
          />
        </div>
      );
    }

    // Video Preview
    if (isVideo && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full w-full p-4">
          <video
            src={previewUrl}
            controls
            autoPlay={false}
            className="max-w-full max-h-full rounded-xl shadow-2xl shadow-black/40"
            style={{ backgroundColor: "#000" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio Preview
    if (isAudio && previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 shadow-xl">
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
            style={{
              filter: "invert(1) hue-rotate(180deg) brightness(0.85)",
            }}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // PDF Preview
    if (isPdf && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full w-full p-4">
          <iframe
            src={previewUrl}
            className="w-full h-full rounded-xl border border-zinc-700/50 bg-white"
            title={displayName}
          />
        </div>
      );
    }

    // Text / Code Preview
    if (isTextFile && textContent !== null) {
      const lines = textContent.split("\n");
      const lang = getLanguageLabel(file.filename);
      const lineDigits = String(lines.length).length;

      return (
        <div className="flex flex-col h-full w-full">
          {/* Code Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-[10px] font-mono">
                {lang}
              </Badge>
              <span className="text-xs text-zinc-400">
                {lines.length} lines • {formatBytes(file.size)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <a
                href={previewUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg transition-colors"
                title="Open raw"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Raw</span>
              </a>
            </div>
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-auto font-mono text-[13px] leading-[1.6] select-text">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr
                    key={i}
                    className="hover:bg-sky-500/5 transition-colors"
                  >
                    <td
                      className="sticky left-0 text-right px-3 py-0 select-none text-zinc-600 bg-zinc-950/80 border-r border-zinc-800/40 align-top"
                      style={{ minWidth: `${lineDigits + 2}ch` }}
                    >
                      {i + 1}
                    </td>
                    <td className="px-4 py-0 whitespace-pre text-zinc-200 overflow-x-auto">
                      {line || "\u00A0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Fallback: unsupported file type
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
          This file type cannot be previewed in the browser. Download it to view locally.
        </p>
        <Button variant="primary" size="default" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          <span>Download File</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
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
                <Badge variant="secondary" className="text-[10px] py-0">
                  {file.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                </Badge>
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
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onClose(); onShare(file); }}
              className="text-zinc-400 hover:text-sky-400 h-8 w-8 p-0"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onClose(); onDelete(file); }}
              className="text-zinc-400 hover:text-rose-400 h-8 w-8 p-0"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-zinc-800 mx-1" />
            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close (Esc)"
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
