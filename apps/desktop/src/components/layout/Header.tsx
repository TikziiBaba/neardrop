import React from 'react';
import { Wifi, QrCode, Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';

interface HeaderProps {
  onOpenPairing: () => void;
  transferMode: 'lan' | 'cloud';
  setTransferMode: (mode: 'lan' | 'cloud') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPairing,
  transferMode,
  setTransferMode,
}) => {
  const { activeLanguage, activeTheme, setTheme } = useSettingsStore();
  const t = translations[activeLanguage];

  const cycleTheme = () => {
    if (activeTheme === 'dark') setTheme('light');
    else if (activeTheme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="h-16 px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span>{t.header.online}</span>
        </div>

        {/* Transfer Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium">
          <button
            onClick={() => setTransferMode('lan')}
            className={`px-3 py-1 rounded-lg transition-all ${
              transferMode === 'lan'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.header.nearbyMode}
          </button>
          <button
            onClick={() => setTransferMode('cloud')}
            className={`px-3 py-1 rounded-lg transition-all ${
              transferMode === 'cloud'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.header.cloudMode}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* QR Pairing Button */}
        <button
          onClick={onOpenPairing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-sky-500" />
          <span>{t.header.pairDevice}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${activeTheme}`}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        >
          {activeTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-amber-400" />
          ) : activeTheme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Monitor className="w-4 h-4 text-sky-500" />
          )}
        </button>
      </div>
    </header>
  );
};
