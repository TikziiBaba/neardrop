import React, { useRef, useState, useEffect } from 'react';
import {
  Cloud,
  UploadCloud,
  Share2,
  Trash2,
  Lock,
  HardDrive,
  File,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { useCloudStore } from '../../stores/cloudStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';
import { formatBytes } from '../../utils/format';
import { Button } from '../common/Button';
import { ShareModal } from './ShareModal';
import { CloudFileItem } from '../../types';
import { CloudService } from '../../services/supabase';

export const CloudStorageView: React.FC = () => {
  const {
    isAuthenticated,
    userEmail,
    quotaBytes,
    usedBytes,
    files,
    isLoading,
    uploadProgress,
    checkAuth,
    uploadFile,
    deleteFile,
  } = useCloudStore();

  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [sharingFile, setSharingFile] = useState<CloudFileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await CloudService.signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await CloudService.signUp(email, password);
        if (error) throw error;
      }
      await checkAuth();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await CloudService.signOut();
    await checkAuth();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        await uploadFile(file, 24); // 24 hours default expiry
      } catch (err: any) {
        alert(`Upload failed: ${err.message}`);
      }
    }
  };

  const quotaPercent = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
            <Cloud className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.cloud.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.cloud.signInPrompt}
          </p>
        </div>

        <form
          onSubmit={handleAuthSubmit}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.cloud.login}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.cloud.register}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.cloud.emailLabel}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.cloud.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {authError && (
            <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/40">
              {authError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isAuthLoading}
            className="w-full"
          >
            {authMode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t.cloud.login}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t.cloud.register}</span>
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Header with Account and Quota Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.cloud.title}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium">
              Cloudflare R2
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Account: <span className="font-semibold">{userEmail}</span>
          </p>
        </div>

        {/* Quota bar */}
        <div className="min-w-[200px] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-sky-500" />
              <span>Storage</span>
            </span>
            <span>
              {formatBytes(usedBytes)} / {formatBytes(quotaBytes)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploadProgress !== null}
            className="rounded-xl"
          >
            <UploadCloud className="w-4 h-4" />
            <span>
              {uploadProgress !== null
                ? `Uploading ${uploadProgress}%`
                : t.cloud.uploadButton}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            title="Sign out"
            className="p-2 rounded-xl"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Cloud Files Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Stored Objects ({files.length})
          </h3>
        </div>

        {files.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            {t.cloud.noFiles}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(file.size)} • Uploaded{' '}
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSharingFile(file)}
                    className="rounded-xl"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t.cloud.createShareLink}</span>
                  </Button>

                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete object"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!sharingFile}
        onClose={() => setSharingFile(null)}
        file={sharingFile}
      />
    </div>
  );
};
