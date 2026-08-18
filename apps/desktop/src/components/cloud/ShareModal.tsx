import React, { useState } from 'react';
import { Share2, Copy, Check, Lock, Clock, DownloadCloud } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CloudFileItem } from '../../types';
import { CloudService } from '../../services/supabase';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: CloudFileItem | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, file }) => {
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [maxDownloads, setMaxDownloads] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!file) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await CloudService.createShareLink({
        cloudFileId: file.id,
        expiresInHours: expiresInHours > 0 ? expiresInHours : undefined,
        maxDownloads: maxDownloads ? parseInt(maxDownloads, 10) : undefined,
        password: password.trim() || undefined,
      });

      const publicUrl = `https://neardrop.app/s/${res.token}`;
      setGeneratedLink(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.shareModal.title}>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {file.filename}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate a secure, temporary Cloudflare R2 download link
          </p>
        </div>

        {!generatedLink ? (
          <div className="space-y-3 pt-2">
            {/* Expiration option */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>{t.shareModal.expiration}</span>
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value={1}>1 Hour</option>
                <option value={24}>24 Hours (1 Day)</option>
                <option value={168}>7 Days (1 Week)</option>
                <option value={0}>Never Expire</option>
              </select>
            </div>

            {/* Max Downloads */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.shareModal.maxDownloads}</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited (default)"
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Optional Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.shareModal.passwordProtection}</span>
              </label>
              <input
                type="password"
                placeholder="Optional password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/40">
                {error}
              </p>
            )}

            <Button
              variant="primary"
              size="md"
              isLoading={isLoading}
              onClick={handleGenerate}
              className="w-full mt-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.shareModal.createButton}</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all border border-slate-200 dark:border-slate-700">
              {generatedLink}
            </div>

            <Button
              variant={isCopied ? 'secondary' : 'primary'}
              size="md"
              onClick={handleCopy}
              className="w-full"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t.shareModal.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.shareModal.copyLink}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
