/**
 * Sanitizes a filename to prevent path traversal attacks and
 * remove dangerous characters that could cause issues in storage systems.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "unnamed-file";
  }

  // Remove path separators (prevent traversal)
  let sanitized = filename.replace(/[/\\]/g, "");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove leading dots (prevent hidden files / dotfile attacks)
  sanitized = sanitized.replace(/^\.+/, "");

  // Remove leading/trailing whitespace
  sanitized = sanitized.trim();

  // Limit length to 255 characters (filesystem limit)
  if (sanitized.length > 255) {
    const ext = sanitized.lastIndexOf(".");
    if (ext > 0) {
      const extension = sanitized.substring(ext);
      const name = sanitized.substring(0, 255 - extension.length);
      sanitized = name + extension;
    } else {
      sanitized = sanitized.substring(0, 255);
    }
  }

  // Fallback if sanitization removed everything
  if (!sanitized || sanitized.length === 0) {
    return "unnamed-file";
  }

  return sanitized;
}

/**
 * List of dangerous file extensions that should be blocked
 * from being uploaded to prevent execution of malicious files.
 */
const BLOCKED_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "pif",
  "vbs", "vbe", "js", "jse", "ws", "wsf", "wsc", "wsh",
  "ps1", "ps2", "psc1", "psc2", "msh", "msh1", "msh2",
  "inf", "reg", "rgs", "sct", "shb", "shs",
  "cpl", "hta", "lnk",
]);

/**
 * Checks if a file extension is in the blocked list.
 * Returns true if the extension is dangerous.
 */
export function isDangerousExtension(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return BLOCKED_EXTENSIONS.has(ext);
}

/**
 * Maximum upload file size: 5 GB
 */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

/**
 * Validates file size against maximum allowed.
 */
export function isFileSizeValid(size: number): boolean {
  return size > 0 && size <= MAX_UPLOAD_SIZE;
}
