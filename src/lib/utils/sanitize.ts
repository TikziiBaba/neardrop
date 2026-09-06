/**
 * Sanitizes a filename to prevent path traversal attacks and
 * remove dangerous characters that could cause issues in storage systems.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "unnamed-file";
  }

  // Normalize backslashes to forward slashes
  const normalized = filename.replace(/\\/g, "/");

  // Clean each path segment to prevent directory traversal
  const segments = normalized
    .split("/")
    .map((segment) => {
      // Remove null bytes
      let clean = segment.replace(/\0/g, "");
      // Remove leading dots (prevent hidden files / dotfile attacks / relative ..)
      clean = clean.replace(/^\.+/, "");
      // Remove leading/trailing whitespace
      clean = clean.trim();
      // Truncate segment to 255 chars
      if (clean.length > 255) {
        const extIdx = clean.lastIndexOf(".");
        if (extIdx > 0) {
          const extension = clean.substring(extIdx);
          const name = clean.substring(0, 255 - extension.length);
          clean = name + extension;
        } else {
          clean = clean.substring(0, 255);
        }
      }
      return clean;
    })
    .filter((segment) => segment.length > 0 && segment !== "." && segment !== "..");

  const sanitized = segments.join("/");

  // Fallback if sanitization removed everything
  if (!sanitized || sanitized.length === 0) {
    return "unnamed-file";
  }

  return sanitized;
}

/**
 * File extensions that are executable or scripts.
 * Note: NearDrop allows uploading ALL file formats (.exe, .bat, .sh, .apk, .zip, etc.).
 * Safety is verified via multi-layer content scanning, magic-byte analysis, and antivirus engines.
 */
export const EXECUTABLE_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "pif",
  "vbs", "vbe", "js", "jse", "ws", "wsf", "wsc", "wsh",
  "ps1", "ps2", "psc1", "psc2", "msh", "msh1", "msh2",
  "inf", "reg", "rgs", "sct", "shb", "shs",
  "cpl", "hta", "lnk", "sh", "bin", "apk", "app",
]);

/**
 * Checks if a file is an executable or script type.
 * Used for informational categorization and deep heuristic scanning.
 */
export function isExecutableExtension(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return EXECUTABLE_EXTENSIONS.has(ext);
}

/**
 * Legacy compatibility check: All file formats are now permitted on NearDrop.
 * Security verification is enforced dynamically by the Malware & Security Scanner.
 */
export function isDangerousExtension(_filename: string): boolean {
  return false;
}

/**
 * Maximum upload file size: 50 GB (matches Enterprise limit)
 */
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024 * 1024; // 50 GB

/**
 * Validates file size against maximum allowed.
 */
export function isFileSizeValid(size: number): boolean {
  return size > 0 && size <= MAX_UPLOAD_SIZE;
}
