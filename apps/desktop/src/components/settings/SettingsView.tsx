import React, { useEffect, useState } from 'react';
import {
  Settings,
  Laptop,
  Folder,
  Shield,
  Palette,
  Globe,
  Radio,
  Trash2,
  Copy,
  Check,
  Save,
} from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useDeviceStore } from '../../stores/deviceStore';
import { translations, Language } from '../../i18n';
import { Button } from '../common/Button';
import { TrustedDeviceItem } from '../../types';
import { TauriService } from '../../services/tauri';

export const SettingsView: React.FC = () => {
  const { settings, activeLanguage, activeTheme, updateSettings, setLanguage, setTheme } =
    useSettingsStore();
  const { identity, interfaces, setDeviceName } = useDeviceStore();
  const t = translations[activeLanguage];

  const [nameInput, setNameInput] = useState('');
  const [downloadPathInput, setDownloadPathInput] = useState('');
  const [autoAcceptInput, setAutoAcceptInput] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDeviceItem[]>([]);
  const [isCopiedId, setIsCopiedId] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (identity) setNameInput(identity.device_name);
    setDownloadPathInput(settings.download_path);
    setAutoAcceptInput(settings.auto_accept_trusted);
    loadTrusted();
  }, [identity, settings]);

  const loadTrusted = async () => {
    try {
      const list = await TauriService.getTrustedDevices();
      setTrustedDevices(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevoke = async (deviceId: string) => {
    try {
      await TauriService.removeTrustedDevice(deviceId);
      await loadTrusted();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyId = () => {
    if (identity?.device_id) {
      navigator.clipboard.writeText(identity.device_id);
      setIsCopiedId(true);
      setTimeout(() => setIsCopiedId(false), 2000);
    }
  };

  const handleSave = async () => {
    if (nameInput.trim() && nameInput !== identity?.device_name) {
      await setDeviceName(nameInput.trim());
    }

    await updateSettings({
      download_path: downloadPathInput,
      auto_accept_trusted: autoAcceptInput,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.settings.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure device identity, transfer rules, and appearance
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} className="rounded-xl">
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t.settings.save}</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General & Identity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Laptop className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t.settings.general}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.deviceName}
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.deviceId}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={identity?.device_id || ''}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 select-all"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyId}
                className="p-2 rounded-xl"
              >
                {isCopiedId ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Transfers & Storage */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Folder className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Transfers
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.downloadPath}
            </label>
            <input
              type="text"
              value={downloadPathInput}
              onChange={(e) => setDownloadPathInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAcceptInput}
                onChange={(e) => setAutoAcceptInput(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.settings.autoAccept}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                  {t.settings.autoAcceptDesc}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Appearance & Language */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t.settings.appearance}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.settings.theme}
              </label>
              <select
                value={activeTheme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="system">{t.settings.themeSystem}</option>
                <option value="dark">{t.settings.themeDark}</option>
                <option value="light">{t.settings.themeLight}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.settings.language}
              </label>
              <select
                value={activeLanguage}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="en">English (US)</option>
                <option value="tr">Türkçe</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Trusted Devices */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t.settings.security}
            </h3>
          </div>

          <div className="space-y-2">
            {trustedDevices.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                {t.settings.noTrusted}
              </p>
            ) : (
              trustedDevices.map((dev) => (
                <div
                  key={dev.device_id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dev.device_name}
                  </span>
                  <button
                    onClick={() => handleRevoke(dev.device_id)}
                    className="text-rose-500 hover:text-rose-600 p-1"
                    title="Revoke Trust"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
