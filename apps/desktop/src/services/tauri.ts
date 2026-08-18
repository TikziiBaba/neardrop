import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import {
  DeviceIdentity,
  DiscoveredDevice,
  IncomingTransferRequest,
  NetworkInterfaceInfo,
  QrPairingResult,
  TransferHistoryItem,
  TransferProgress,
  TrustedDeviceItem,
  UserSettings,
} from '../types';

export const TauriService = {
  // Discovery & Identity
  async getDiscoveredDevices(): Promise<DiscoveredDevice[]> {
    return invoke<DiscoveredDevice[]>('get_discovered_devices');
  },

  async getNetworkInterfaces(): Promise<NetworkInterfaceInfo[]> {
    return invoke<NetworkInterfaceInfo[]>('get_network_interfaces');
  },

  async getDeviceIdentity(): Promise<DeviceIdentity> {
    return invoke<DeviceIdentity>('get_device_identity');
  },

  async setDeviceName(newName: string): Promise<void> {
    return invoke('set_device_name', { newName });
  },

  // Transfers
  async sendFilesLan(params: {
    targetIp: string;
    targetPort: number;
    targetDeviceId: string;
    targetDeviceName: string;
    filePaths: string[];
  }): Promise<string> {
    return invoke<string>('send_files_lan', {
      targetIp: params.targetIp,
      targetPort: params.targetPort,
      targetDeviceId: params.targetDeviceId,
      targetDeviceName: params.targetDeviceName,
      filePaths: params.filePaths,
    });
  },

  async respondTransferRequest(transferId: string, accept: boolean): Promise<void> {
    return invoke('respond_transfer_request', { transferId, accept });
  },

  async cancelTransfer(transferId: string): Promise<void> {
    return invoke('cancel_transfer', { transferId });
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    return invoke<UserSettings>('get_settings');
  },

  async updateSettings(newSettings: UserSettings): Promise<void> {
    return invoke('update_settings', { newSettings });
  },

  // History
  async getTransferHistory(): Promise<TransferHistoryItem[]> {
    return invoke<TransferHistoryItem[]>('get_transfer_history');
  },

  async clearTransferHistory(): Promise<void> {
    return invoke('clear_transfer_history');
  },

  async openDownloadFolder(): Promise<void> {
    return invoke('open_download_folder');
  },

  // Security & Pairing
  async getTrustedDevices(): Promise<TrustedDeviceItem[]> {
    return invoke<TrustedDeviceItem[]>('get_trusted_devices');
  },

  async addTrustedDevice(device: TrustedDeviceItem): Promise<void> {
    return invoke('add_trusted_device', { device });
  },

  async removeTrustedDevice(deviceId: string): Promise<void> {
    return invoke('remove_trusted_device', { deviceId });
  },

  async generatePairingQr(): Promise<QrPairingResult> {
    return invoke<QrPairingResult>('generate_pairing_qr');
  },

  // Event Listeners
  async onDevicesChanged(callback: () => void): Promise<UnlistenFn> {
    return listen('neardrop://devices-changed', () => callback());
  },

  async onTransferProgress(callback: (progress: TransferProgress) => void): Promise<UnlistenFn> {
    return listen<TransferProgress>('neardrop://transfer-progress', (event) => callback(event.payload));
  },

  async onIncomingTransferRequest(
    callback: (request: IncomingTransferRequest) => void
  ): Promise<UnlistenFn> {
    return listen<IncomingTransferRequest>('neardrop://incoming-transfer-request', (event) =>
      callback(event.payload)
    );
  },

  async onNavigate(callback: (view: string) => void): Promise<UnlistenFn> {
    return listen<string>('neardrop://navigate', (event) => callback(event.payload));
  },
};
