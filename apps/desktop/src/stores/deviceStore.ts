import { create } from 'zustand';
import { DeviceIdentity, DiscoveredDevice, NetworkInterfaceInfo } from '../types';
import { TauriService } from '../services/tauri';

interface DeviceState {
  identity: DeviceIdentity | null;
  devices: DiscoveredDevice[];
  interfaces: NetworkInterfaceInfo[];
  selectedDevice: DiscoveredDevice | null;
  isLoading: boolean;
  fetchIdentity: () => Promise<void>;
  fetchDevices: () => Promise<void>;
  fetchInterfaces: () => Promise<void>;
  setDeviceName: (name: string) => Promise<void>;
  setSelectedDevice: (device: DiscoveredDevice | null) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  identity: null,
  devices: [],
  interfaces: [],
  selectedDevice: null,
  isLoading: false,

  fetchIdentity: async () => {
    try {
      const identity = await TauriService.getDeviceIdentity();
      set({ identity });
    } catch (e) {
      console.error('Failed to fetch device identity:', e);
    }
  },

  fetchDevices: async () => {
    try {
      const devices = await TauriService.getDiscoveredDevices();
      set({ devices });
    } catch (e) {
      console.error('Failed to fetch devices:', e);
    }
  },

  fetchInterfaces: async () => {
    try {
      const interfaces = await TauriService.getNetworkInterfaces();
      set({ interfaces });
    } catch (e) {
      console.error('Failed to fetch network interfaces:', e);
    }
  },

  setDeviceName: async (name: string) => {
    await TauriService.setDeviceName(name);
    const identity = await TauriService.getDeviceIdentity();
    set({ identity });
  },

  setSelectedDevice: (device) => set({ selectedDevice: device }),
}));
