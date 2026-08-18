import React, { useState } from 'react';
import {
  Laptop,
  Monitor,
  Smartphone,
  ShieldCheck,
  Send,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useDeviceStore } from '../../stores/deviceStore';
import { useTransferStore } from '../../stores/transferStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { translations } from '../../i18n';
import { DiscoveredDevice } from '../../types';
import { TauriService } from '../../services/tauri';
import { Button } from '../common/Button';

export const NearbyDevices: React.FC = () => {
  const { devices } = useDeviceStore();
  const { selectedFiles, clearSelectedFiles } = useTransferStore();
  const { activeLanguage } = useSettingsStore();
  const t = translations[activeLanguage];

  const [isSendingTo, setIsSendingTo] = useState<string | null>(null);

  const getDeviceIcon = (device: DiscoveredDevice) => {
    if (device.device_type === 'mobile') return <Smartphone className="w-5 h-5" />;
    if (device.device_type === 'laptop') return <Laptop className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const handleSendToDevice = async (device: DiscoveredDevice) => {
    if (selectedFiles.length === 0) {
      alert('Please select or drop files first.');
      return;
    }

    setIsSendingTo(device.device_id);
    try {
      const paths = selectedFiles.map((f) => f.path);
      await TauriService.sendFilesLan({
        targetIp: device.address,
        targetPort: device.port,
        targetDeviceId: device.device_id,
        targetDeviceName: device.device_name,
        filePaths: paths,
      });
      clearSelectedFiles();
    } catch (err: any) {
      alert(`Transfer failed to start: ${err}`);
    } finally {
      setIsSendingTo(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-sky-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.dashboard.nearbyDevices} ({devices.length})
          </h2>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
            <div className="relative w-10 h-10 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t.dashboard.noDevicesFound}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {t.dashboard.searchingHint}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {devices.map((device) => {
            const hasFiles = selectedFiles.length > 0;
            const isSending = isSendingTo === device.device_id;

            return (
              <div
                key={device.device_id}
                className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-sky-500/10 group-hover:text-sky-500 transition-colors">
                    {getDeviceIcon(device)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {device.device_name}
                      </span>
                      {device.is_trusted && (
                        <span title="Trusted Device">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {device.platform} • {device.address}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={hasFiles ? 'primary' : 'outline'}
                  isLoading={isSending}
                  disabled={!hasFiles || isSending}
                  onClick={() => handleSendToDevice(device)}
                  className="rounded-xl"
                >
                  {hasFiles ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.dashboard.send}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nearby</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
