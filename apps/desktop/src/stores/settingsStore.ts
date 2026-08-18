import { create } from 'zustand';
import { UserSettings } from '../types';
import { TauriService } from '../services/tauri';
import { Language } from '../i18n';

interface SettingsState {
  settings: UserSettings;
  activeLanguage: Language;
  activeTheme: 'dark' | 'light' | 'system';

  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    download_path: '',
    auto_accept_trusted: false,
    max_concurrent_transfers: 3,
    transfer_port: 45454,
    theme: 'system',
    language: 'en',
    preferred_interface: null,
    start_with_system: false,
    minimize_to_tray: true,
  },
  activeLanguage: 'en',
  activeTheme: 'system',

  fetchSettings: async () => {
    try {
      const settings = await TauriService.getSettings();
      set({
        settings,
        activeLanguage: (settings.language as Language) || 'en',
        activeTheme: settings.theme || 'system',
      });
      get().setTheme(settings.theme || 'system');
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    }
  },

  updateSettings: async (updated) => {
    const current = get().settings;
    const merged: UserSettings = { ...current, ...updated };
    await TauriService.updateSettings(merged);
    set({
      settings: merged,
      activeLanguage: (merged.language as Language) || 'en',
      activeTheme: merged.theme || 'system',
    });
    get().setTheme(merged.theme || 'system');
  },

  setLanguage: (lang) => {
    get().updateSettings({ language: lang });
  },

  setTheme: (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  },
}));
