import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes || bytes < 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return "0 MB/s";
  return `${formatBytes(bytesPerSec)}/s`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
}

export function formatExpiresIn(dateString: string | Date | null | undefined): string {
  if (!dateString) return "Never expires";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();

  if (diffInMs <= 0) return "Expired";

  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 1) return `Expires in ${diffInDays} days`;
  if (diffInHours >= 1) return `Expires in ${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
  
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  return `Expires in ${Math.max(1, diffInMins)} min${diffInMins > 1 ? "s" : ""}`;
}

export async function computeSHA256(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSecureToken(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

export function getFileCategory(mimeType: string, filename: string): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif', 'ico'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document') || ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'pptx'].includes(ext)) {
    return 'document';
  }
  if (['zip', 'tar', 'gz', '7z', 'rar', 'bz2', 'xz', 'iso'].includes(ext) || mimeType.includes('zip') || mimeType.includes('compressed')) {
    return 'archive';
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'rs', 'go', 'json', 'html', 'css', 'yaml', 'yml', 'toml', 'sh', 'c', 'cpp', 'java'].includes(ext)) {
    return 'code';
  }
  return 'other';
}
