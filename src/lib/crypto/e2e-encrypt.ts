/**
 * NearDrop Zero-Knowledge End-to-End Encryption
 * 
 * Uses Web Crypto API (AES-GCM 256-bit) for client-side encryption.
 * The encryption key never leaves the browser — it's embedded in the URL fragment (#key=...).
 * Even if R2 or Supabase are compromised, file contents remain unreadable.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM

/**
 * Generate a new AES-GCM 256-bit key
 */
export async function generateEncryptionKey(): Promise<{
  cryptoKey: CryptoKey;
  exportedKey: string; // base64url-encoded raw key
}> {
  const cryptoKey = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  const rawKey = await crypto.subtle.exportKey("raw", cryptoKey);
  const exportedKey = arrayBufferToBase64Url(rawKey);

  return { cryptoKey, exportedKey };
}

/**
 * Import a key from base64url string
 */
export async function importKey(base64UrlKey: string): Promise<CryptoKey> {
  const rawKey = base64UrlToArrayBuffer(base64UrlKey);
  return crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a file (ArrayBuffer) with AES-GCM
 * Returns encrypted data + IV
 */
export async function encryptFile(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  return {
    encrypted,
    iv: arrayBufferToBase64Url(iv.buffer),
  };
}

/**
 * Decrypt a file (ArrayBuffer) with AES-GCM
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  ivBase64Url: string
): Promise<ArrayBuffer> {
  const iv = base64UrlToArrayBuffer(ivBase64Url);

  return crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encryptedData
  );
}

/**
 * Encrypt a File object and return as a Blob ready for upload
 */
export async function encryptFileObject(
  file: File,
  key: CryptoKey
): Promise<{ encryptedBlob: Blob; iv: string; originalSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const { encrypted, iv } = await encryptFile(arrayBuffer, key);

  return {
    encryptedBlob: new Blob([encrypted], { type: "application/octet-stream" }),
    iv,
    originalSize: arrayBuffer.byteLength,
  };
}

/**
 * Decrypt a downloaded Blob back to the original file
 */
export async function decryptBlob(
  encryptedBlob: Blob,
  keyBase64Url: string,
  ivBase64Url: string,
  originalMimeType: string = "application/octet-stream"
): Promise<Blob> {
  const key = await importKey(keyBase64Url);
  const encryptedBuffer = await encryptedBlob.arrayBuffer();
  const decrypted = await decryptFile(encryptedBuffer, key, ivBase64Url);

  return new Blob([decrypted], { type: originalMimeType });
}

/**
 * Build a share URL with the encryption key in the fragment
 * The fragment (#) is NEVER sent to the server
 */
export function buildEncryptedShareUrl(
  baseUrl: string,
  token: string,
  encryptionKey: string
): string {
  return `${baseUrl}/s/${token}#key=${encryptionKey}`;
}

/**
 * Extract the encryption key from the URL fragment
 */
export function extractKeyFromFragment(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash) return null;

  const match = hash.match(/key=([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// === Helpers ===

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
