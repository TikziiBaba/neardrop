import React from 'react';
import { Download, File, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useTransferStore } from '../../stores/transferStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';
import { formatBytes } from '../../utils/format';

export const IncomingTransferModal: React.FC = () => {
  const { pendingIncomingRequest, respondIncomingRequest } = useTransferStore();
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  if (!pendingIncomingRequest) return null;

  const handleAccept = () => {
    respondIncomingRequest(pendingIncomingRequest.transfer_id, true);
  };

  const handleReject = () => {
    respondIncomingRequest(pendingIncomingRequest.transfer_id, false);
  };

  return (
    <Modal
      isOpen={!!pendingIncomingRequest}
      onClose={handleReject}
      title={t.incoming.title}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {t.incoming.wantsToSend
                .replace('{name}', pendingIncomingRequest.sender_device_name)
                .replace('{count}', pendingIncomingRequest.files_count.toString())}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.incoming.totalSize.replace(
                '{size}',
                formatBytes(pendingIncomingRequest.total_size)
              )}
            </p>
          </div>
        </div>

        {/* Device trust badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {pendingIncomingRequest.is_trusted ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t.incoming.trustedBadge}</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{t.incoming.unknownBadge}</span>
            </>
          )}
        </div>

        {/* Files preview list */}
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {pendingIncomingRequest.file_names.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
            >
              <File className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="danger" size="md" onClick={handleReject} className="w-full">
            <X className="w-4 h-4" />
            <span>{t.incoming.reject}</span>
          </Button>

          <Button variant="primary" size="md" onClick={handleAccept} className="w-full">
            <Check className="w-4 h-4" />
            <span>{t.incoming.accept}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
