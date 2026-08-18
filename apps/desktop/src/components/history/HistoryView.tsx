import React, { useEffect, useState } from 'react';
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  FolderOpen,
  Trash2,
  Search,
  Cloud,
  Radio,
  File,
} from 'lucide-react';
import { useTransferStore } from '../../stores/transferStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';
import { formatBytes, formatTimestamp } from '../../utils/format';
import { Button } from '../common/Button';
import { TauriService } from '../../services/tauri';

export const HistoryView: React.FC = () => {
  const { history, fetchHistory, clearHistory } = useTransferStore();
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'send' | 'receive'>('all');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter((item) => {
    const matchesDirection =
      filterDirection === 'all' || item.direction === filterDirection;
    const matchesSearch =
      item.peer_device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.file_names.some((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesDirection && matchesSearch;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.history.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log of completed LAN and Cloud transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => TauriService.openDownloadFolder()}
            className="rounded-xl"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span>{t.history.openFolder}</span>
          </Button>

          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="rounded-xl text-rose-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.history.clearAll}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file or device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium self-start">
          <button
            onClick={() => setFilterDirection('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterDirection === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilterDirection('send')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterDirection === 'send'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.history.sent}
          </button>
          <button
            onClick={() => setFilterDirection('receive')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterDirection === 'receive'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.history.received}
          </button>
        </div>
      </div>

      {/* History Items List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            {t.history.empty}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredHistory.map((item) => {
              const isSend = item.direction === 'send';
              const isCloud = item.mode === 'cloud';

              return (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSend
                          ? 'bg-sky-500/10 text-sky-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      {isSend ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.file_names.length === 1
                            ? item.file_names[0]
                            : `${item.file_names[0]} (+${item.file_names.length - 1} more)`}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                          {isCloud ? (
                            <>
                              <Cloud className="w-3 h-3 text-sky-500" />
                              <span>Cloud</span>
                            </>
                          ) : (
                            <>
                              <Radio className="w-3 h-3 text-emerald-500" />
                              <span>LAN</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isSend ? 'To' : 'From'} {item.peer_device_name} •{' '}
                        {formatBytes(item.total_bytes)} •{' '}
                        {formatTimestamp(item.started_at)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
