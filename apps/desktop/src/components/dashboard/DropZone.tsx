import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Folder, X, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { useTransferStore } from '../../stores/transferStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';
import { formatBytes } from '../../utils/format';

export const DropZone: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const { selectedFiles, setSelectedFiles, clearSelectedFiles } = useTransferStore();
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).map((f) => ({
        path: (f as any).path || f.name,
        name: f.name,
        size: f.size,
      }));
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map((f) => ({
        path: (f as any).path || f.name,
        name: f.name,
        size: f.size,
      }));
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full space-y-3">
      {/* Hidden native inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        {...({ webkitdirectory: '', directory: '' } as any)}
        className="hidden"
      />

      {/* Main Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragOver
            ? 'border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700/80 hover:border-sky-400 dark:hover:border-sky-500 bg-white/40 dark:bg-slate-900/40'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center mb-4 shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          {t.dashboard.dropTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {t.dashboard.dropSubtitle}
        </p>

        {/* Action Buttons */}
        <div
          className="flex items-center gap-2 mt-5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl shadow-none"
          >
            <FileText className="w-4 h-4 text-sky-500" />
            <span>{t.dashboard.browseFiles}</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => folderInputRef.current?.click()}
            className="rounded-xl shadow-none"
          >
            <Folder className="w-4 h-4 text-amber-500" />
            <span>{t.dashboard.browseFolder}</span>
          </Button>
        </div>
      </div>

      {/* Selected files preview bar */}
      {selectedFiles.length > 0 && (
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm">
              {selectedFiles.length}
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                {selectedFiles.length === 1
                  ? selectedFiles[0].name
                  : `${selectedFiles.length} files selected`}
              </p>
              <p className="text-xs text-sky-700/80 dark:text-sky-400">
                Total size: {formatBytes(totalSelectedSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
              title="Add more files"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={clearSelectedFiles}
              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
