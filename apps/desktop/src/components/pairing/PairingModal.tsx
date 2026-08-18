import React, { useEffect, useState } from 'react';
import { QrCode, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TauriService } from '../../services/tauri';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';
import { QrPairingResult } from '../../types';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({ isOpen, onClose }) => {
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const [pairingData, setPairingData] = useState<QrPairingResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadPairing = async () => {
    setIsLoading(true);
    try {
      const data = await TauriService.generatePairingQr();
      setPairingData(data);
      const remaining = Math.max(0, data.payload.expires_at - Math.floor(Date.now() / 1000));
      setTimeLeft(remaining);
    } catch (e) {
      console.error('Failed to generate pairing QR:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPairing();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !pairingData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          loadPairing();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, pairingData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.pairing.title}>
      <div className="flex flex-col items-center text-center space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          {t.pairing.subtitle}
        </p>

        {/* QR Code SVG container */}
        <div className="p-4 rounded-3xl bg-white border-2 border-slate-100 dark:border-slate-800 shadow-md flex items-center justify-center min-w-[200px] min-h-[200px]">
          {isLoading || !pairingData ? (
            <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
          ) : (
            <div
              className="w-48 h-48"
              dangerouslySetInnerHTML={{ __html: pairingData.qr_svg }}
            />
          )}
        </div>

        {/* PIN Code Box */}
        {pairingData && (
          <div className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>{t.pairing.pinCode}</span>
            </div>
            <div className="font-mono text-lg font-bold tracking-widest text-sky-600 dark:text-sky-400">
              {pairingData.payload.pin}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between w-full text-xs text-slate-400">
          <span>{t.pairing.expiresIn.replace('{seconds}', timeLeft.toString())}</span>
          <button
            onClick={loadPairing}
            className="text-sky-500 hover:text-sky-600 flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>

        <Button variant="secondary" size="md" onClick={onClose} className="w-full">
          {t.pairing.close}
        </Button>
      </div>
    </Modal>
  );
};
