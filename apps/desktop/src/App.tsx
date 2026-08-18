import React, { useEffect, useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DropZone } from './components/dashboard/DropZone';
import { NearbyDevices } from './components/dashboard/NearbyDevices';
import { IncomingTransferModal } from './components/dashboard/IncomingTransferModal';
import { TransferView } from './components/transfers/TransferView';
import { CloudStorageView } from './components/cloud/CloudStorageView';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { PairingModal } from './components/pairing/PairingModal';
import { useDeviceStore } from './stores/deviceStore';
import { useTransferStore } from './stores/transferStore';
import { useSettingsStore } from './stores/settingsStore';
import { TauriService } from './services/tauri';
import { translations } from './i18n';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [transferMode, setTransferMode] = useState<'lan' | 'cloud'>('lan');
  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);

  const { fetchIdentity, fetchDevices, fetchInterfaces } = useDeviceStore();
  const { updateProgress, setIncomingRequest } = useTransferStore();
  const { activeLanguage, fetchSettings } = useSettingsStore();
  const t = translations[activeLanguage];

  useEffect(() => {
    // Initial data hydration
    fetchIdentity();
    fetchDevices();
    fetchInterfaces();
    fetchSettings();

    // Periodic poll fallback for devices
    const devicePoll = setInterval(() => {
      fetchDevices();
    }, 4000);

    // Tauri Realtime Event Listeners
    let unlistenDevices: (() => void) | undefined;
    let unlistenProgress: (() => void) | undefined;
    let unlistenIncoming: (() => void) | undefined;
    let unlistenNav: (() => void) | undefined;

    TauriService.onDevicesChanged(() => {
      fetchDevices();
    }).then((unlisten) => {
      unlistenDevices = unlisten;
    });

    TauriService.onTransferProgress((progress) => {
      updateProgress(progress);
    }).then((unlisten) => {
      unlistenProgress = unlisten;
    });

    TauriService.onIncomingTransferRequest((req) => {
      setIncomingRequest(req);
    }).then((unlisten) => {
      unlistenIncoming = unlisten;
    });

    TauriService.onNavigate((tab) => {
      if (['home', 'transfers', 'cloud', 'history', 'settings'].includes(tab)) {
        setActiveTab(tab as NavTab);
      }
    }).then((unlisten) => {
      unlistenNav = unlisten;
    });

    return () => {
      clearInterval(devicePoll);
      if (unlistenDevices) unlistenDevices();
      if (unlistenProgress) unlistenProgress();
      if (unlistenIncoming) unlistenIncoming();
      if (unlistenNav) unlistenNav();
    };
  }, [fetchIdentity, fetchDevices, fetchInterfaces, fetchSettings, updateProgress, setIncomingRequest]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-light dark:bg-surface-dark font-sans select-none">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenPairing={() => setIsPairingOpen(true)}
          transferMode={transferMode}
          setTransferMode={(m) => {
            setTransferMode(m);
            if (m === 'cloud') setActiveTab('cloud');
            else if (activeTab === 'cloud') setActiveTab('home');
          }}
        />

        {/* Tab Viewport */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
              <div className="text-center space-y-1.5 max-w-md mx-auto pt-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {t.dashboard.heroTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.dashboard.heroSubtitle}
                </p>
              </div>

              {/* Drop Zone */}
              <DropZone />

              {/* Nearby Devices Radar */}
              <NearbyDevices />
            </div>
          )}

          {activeTab === 'transfers' && <TransferView />}
          {activeTab === 'cloud' && <CloudStorageView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals */}
      <IncomingTransferModal />
      <PairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
      />
    </div>
  );
};

export default App;
