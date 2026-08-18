import React from 'react';
import { ArrowUpDown, CheckCircle } from 'lucide-react';
import { useTransferStore } from '../../stores/transferStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';
import { TransferCard } from './TransferCard';

export const TransferView: React.FC = () => {
  const { activeTransfers } = useTransferStore();
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const transferList = Object.values(activeTransfers);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.transfers.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time streaming file transfers and queues
          </p>
        </div>
      </div>

      {transferList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t.transfers.noActiveTransfers}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Start sending files from the Home tab to see transfer metrics here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {transferList.map((transfer) => (
            <TransferCard key={transfer.transfer_id} progress={transfer} />
          ))}
        </div>
      )}
    </div>
  );
};
