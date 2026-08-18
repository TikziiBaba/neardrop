import React from 'react';
import { Send, ArrowUpDown, Cloud, Clock, Settings, Sparkles } from 'lucide-react';
import { useTransferStore } from '../../stores/transferStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';

export type NavTab = 'home' | 'transfers' | 'cloud' | 'history' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { activeTransfers } = useTransferStore();
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const activeTransferCount = Object.values(activeTransfers).filter(
    (t) => t.status === 'transferring' || t.status === 'waiting_for_acceptance'
  ).len;

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Send },
    {
      id: 'transfers',
      label: t.nav.transfers,
      icon: ArrowUpDown,
      badge: activeTransferCount > 0 ? activeTransferCount : undefined,
    },
    { id: 'cloud', label: t.nav.cloud, icon: Cloud },
    { id: 'history', label: t.nav.history, icon: Clock },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col justify-between p-4 z-20">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              NearDrop
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Local & Cloud Sharing
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      isActive
                        ? 'bg-white text-sky-600'
                        : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Version Info */}
      <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <span>v1.0.0</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          P2P Ready
        </span>
      </div>
    </aside>
  );
};
