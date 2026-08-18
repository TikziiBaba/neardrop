import { create } from 'zustand';
import { CloudFileItem } from '../types';
import { CloudService, supabase } from '../services/supabase';

interface CloudState {
  isAuthenticated: boolean;
  userEmail: string | null;
  quotaBytes: number;
  usedBytes: number;
  files: CloudFileItem[];
  isLoading: boolean;
  uploadProgress: number | null; // 0 to 100

  checkAuth: () => Promise<void>;
  fetchCloudFiles: () => Promise<void>;
  uploadFile: (file: File, expiresInHours?: number) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
}

export const useCloudStore = create<CloudState>((set, get) => ({
  isAuthenticated: false,
  userEmail: null,
  quotaBytes: 10737418240, // 10 GB default
  usedBytes: 0,
  files: [],
  isLoading: false,
  uploadProgress: null,

  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await CloudService.getUserProfile();
        set({
          isAuthenticated: true,
          userEmail: session.user.email || null,
          quotaBytes: profile?.quota_bytes || 10737418240,
          usedBytes: profile?.used_bytes || 0,
        });
        await get().fetchCloudFiles();
      } else {
        set({ isAuthenticated: false, userEmail: null });
      }
    } catch {
      set({ isAuthenticated: false });
    }
  },

  fetchCloudFiles: async () => {
    set({ isLoading: true });
    try {
      const files = await CloudService.getUserCloudFiles();
      set({ files, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  uploadFile: async (file, expiresInHours) => {
    set({ uploadProgress: 0 });
    try {
      const { uploadUrl } = await CloudService.requestUploadUrl({
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        expiresInHours,
      });

      await CloudService.uploadFileToR2(uploadUrl, file, (percent) => {
        set({ uploadProgress: percent });
      });

      set({ uploadProgress: null });
      await get().fetchCloudFiles();
      await get().checkAuth();
    } catch (e) {
      set({ uploadProgress: null });
      throw e;
    }
  },

  deleteFile: async (fileId) => {
    await CloudService.deleteCloudFile(fileId);
    await get().fetchCloudFiles();
    await get().checkAuth();
  },
}));
