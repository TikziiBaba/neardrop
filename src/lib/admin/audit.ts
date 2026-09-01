import { NextRequest } from "next/server";
import { AdminAuditLog } from "@/types";
import { logAdminAction } from "./service";

/**
 * Extracts comprehensive client IP, User-Agent, Operating System and Browser details
 */
export function extractClientInfo(req: NextRequest) {
  // Extract Real Client IP
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  const ipAddress = cfConnectingIp || (forwarded ? forwarded.split(",")[0].trim() : realIp) || "127.0.0.1";

  // Extract User Agent
  const userAgent = req.headers.get("user-agent") || "Unknown Device / Web";

  // Detect Operating System / Platform
  let platform = "web";
  if (userAgent.includes("Windows NT 10.0") || userAgent.includes("Windows")) platform = "Windows 11/10";
  else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X")) platform = "macOS";
  else if (userAgent.includes("Android")) platform = "Android";
  else if (userAgent.includes("iPhone")) platform = "iOS (iPhone)";
  else if (userAgent.includes("iPad")) platform = "iPadOS";
  else if (userAgent.includes("Linux")) platform = "Linux";

  // Detect Browser
  let browser = "Browser";
  if (userAgent.includes("Edg/")) browser = "Microsoft Edge";
  else if (userAgent.includes("Chrome") && !userAgent.includes("Edg/")) browser = "Google Chrome";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Apple Safari";
  else if (userAgent.includes("Firefox")) browser = "Mozilla Firefox";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR/")) browser = "Opera";

  const deviceInfo = `${platform} • ${browser}`;

  return {
    ipAddress,
    userAgent,
    platform,
    browser,
    deviceInfo,
  };
}

/**
 * Helper to quickly record detailed audit logs from API routes
 */
export function recordAuditLog(log: Omit<AdminAuditLog, "id" | "timestamp">) {
  return logAdminAction(log);
}
