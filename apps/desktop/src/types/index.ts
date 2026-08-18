export type TransferDirection = 'send' | 'receive';
export type TransferMode = 'lan' | 'cloud';

export type TransferStatus =
  | 'pending'
  | 'waiting_for_acceptance'
  | 'accepted'
  | 'transferring'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'rejected';

export interface DiscoveredDevice {
  device_id: string;
  device_name: string;
  device_type: 'desktop' | 'laptop' | 'mobile' | string;
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | string;
  address: string;
  port: number;
  public_key: string;
  last_seen: number;
  is_trusted: boolean;
}

export interface DeviceIdentity {
  device_id: string;
  device_name: string;
  device_type: string;
  platform: string;
  public_key_base64: string;
  created_at: number;
}

export interface TransferProgress {
  transfer_id: string;
  direction: TransferDirection;
  peer_device_id: string;
  peer_device_name: string;
  current_file_index: number;
  current_file_name: string;
  total_files: number;
  total_bytes: number;
  transferred_bytes: number;
  speed_bytes_per_sec: number;
  eta_seconds: number;
  status: TransferStatus;
  error_message?: string | null;
}

export interface IncomingTransferRequest {
  transfer_id: string;
  sender_device_id: string;
  sender_device_name: string;
  files_count: number;
  total_size: number;
  file_names: string[];
  is_trusted: boolean;
}

export interface TransferHistoryItem {
  id: string;
  direction: TransferDirection;
  mode: TransferMode;
  peer_device_id: string;
  peer_device_name: string;
  total_bytes: number;
  files_count: number;
  file_names: string[];
  status: string;
  started_at: number;
  completed_at?: number | null;
}

export interface TrustedDeviceItem {
  device_id: string;
  device_name: string;
  public_key: string;
  trusted_at: number;
}

export interface UserSettings {
  download_path: string;
  auto_accept_trusted: boolean;
  max_concurrent_transfers: number;
  transfer_port: number;
  theme: 'dark' | 'light' | 'system';
  language: 'en' | 'tr' | 'de';
  preferred_interface?: string | null;
  start_with_system: boolean;
  minimize_to_tray: boolean;
}

export interface NetworkInterfaceInfo {
  name: string;
  ip: string;
  broadcast_ip?: string | null;
  is_loopback: boolean;
}

export interface CloudFileItem {
  id: string;
  user_id: string;
  filename: string;
  r2_object_key: string;
  size: number;
  mime_type: string;
  checksum?: string | null;
  is_deleted: boolean;
  created_at: string;
  expires_at?: string | null;
}

export interface ShareLinkItem {
  id: string;
  user_id: string;
  cloud_file_id: string;
  token: string;
  password_hash?: string | null;
  expires_at?: string | null;
  download_count: number;
  max_downloads?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface QrPairingResult {
  payload: {
    device_id: string;
    device_name: string;
    public_key: string;
    pin: string;
    expires_at: number;
  };
  qr_svg: string;
}
