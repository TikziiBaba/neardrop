import { create } from 'zustand';
import { IncomingTransferRequest, TransferHistoryItem, TransferProgress } from '../types';
import { TauriService } from '../services/tauri';

interface TransferState {
  activeTransfers: Record<string, TransferProgress>;
  pendingIncomingRequest: IncomingTransferRequest | null;
  history: TransferHistoryItem[];
  selectedFiles: { path: string; name: string; size: number }[];

  updateProgress: (progress: TransferProgress) => void;
  setIncomingRequest: (request: IncomingTransferRequest | null) => void;
  respondIncomingRequest: (transferId: string, accept: boolean) => Promise<void>;
  cancelTransfer: (transferId: string) => Promise<void>;
  setSelectedFiles: (files: { path: string; name: string; size: number }[]) => void;
  clearSelectedFiles: () => void;
  fetchHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  activeTransfers: {},
  pendingIncomingRequest: null,
  history: [],
  selectedFiles: [],

  updateProgress: (progress) => {
    set((state) => ({
      activeTransfers: {
        ...state.activeTransfers,
        [progress.transfer_id]: progress,
      },
    }));

    // If completed or failed, refresh history
    if (progress.status === 'completed' || progress.status === 'failed') {
      get().fetchHistory();
    }
  },

  setIncomingRequest: (request) => set({ pendingIncomingRequest: request }),

  respondIncomingRequest: async (transferId, accept) => {
    try {
      await TauriService.respondTransferRequest(transferId, accept);
      set({ pendingIncomingRequest: null });
    } catch (e) {
      console.error('Error responding to transfer request:', e);
    }
  },

  cancelTransfer: async (transferId) => {
    try {
      await TauriService.cancelTransfer(transferId);
    } catch (e) {
      console.error('Error cancelling transfer:', e);
    }
  },

  setSelectedFiles: (files) => set({ selectedFiles: files }),
  clearSelectedFiles: () => set({ selectedFiles: [] }),

  fetchHistory: async () => {
    try {
      const history = await TauriService.getTransferHistory();
      set({ history });
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  },

  clearHistory: async () => {
    try {
      await TauriService.clearTransferHistory();
      set({ history: [] });
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  },
}));
