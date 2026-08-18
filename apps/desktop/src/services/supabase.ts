import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CloudFileItem, ShareLinkItem } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key-placeholder';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const CloudService = {
  // --- Auth ---
  async signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getSession() {
    return supabase.auth.getSession();
  },

  // --- Cloud Files & R2 Integration ---
  async requestUploadUrl(params: {
    filename: string;
    size: number;
    mimeType?: string;
    checksum?: string;
    expiresInHours?: number;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Authentication required for cloud uploads');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/cloud-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Upload request failed' }));
      throw new Error(err.error || 'Failed to request upload URL');
    }

    return response.json() as Promise<{
      uploadUrl: string;
      cloudFile: CloudFileItem;
      r2ObjectKey: string;
    }>;
  },

  async uploadFileToR2(uploadUrl: string, file: File, onProgress?: (percent: number) => void) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during R2 upload'));
      xhr.send(file);
    });
  },

  async requestDownloadUrl(params: { fileId?: string; token?: string; password?: string }) {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/cloud-download`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Download request failed' }));
      throw new Error(err.error || 'Failed to generate download URL');
    }

    return response.json() as Promise<{
      downloadUrl: string;
      filename: string;
      size: number;
    }>;
  },

  async createShareLink(params: {
    cloudFileId: string;
    expiresInHours?: number;
    maxDownloads?: number;
    password?: string;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Authentication required');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/cloud-share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Share link creation failed' }));
      throw new Error(err.error || 'Failed to create share link');
    }

    return response.json() as Promise<{
      shareLink: ShareLinkItem;
      token: string;
      hasPassword: boolean;
    }>;
  },

  async getUserCloudFiles(): Promise<CloudFileItem[]> {
    const { data, error } = await supabase
      .from('cloud_files')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteCloudFile(fileId: string): Promise<void> {
    const { error } = await supabase
      .from('cloud_files')
      .update({ is_deleted: true })
      .eq('id', fileId);

    if (error) throw error;
  },

  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return data;
  },
};
