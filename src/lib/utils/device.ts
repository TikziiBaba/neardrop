export interface ClientDeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: "desktop" | "laptop" | "mobile" | "tablet";
  platform: "windows" | "macos" | "linux" | "android" | "ios" | "web";
  browser: string;
  userAgent: string;
}

export function getClientDeviceInfo(): ClientDeviceInfo {
  if (typeof window === "undefined") {
    return {
      deviceId: "srv_fallback",
      deviceName: "Server Session",
      deviceType: "desktop",
      platform: "web",
      browser: "Node/SSR",
      userAgent: "",
    };
  }

  // 1. Persistent Device ID in localStorage
  let deviceId = localStorage.getItem("neardrop_device_id");
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    try {
      localStorage.setItem("neardrop_device_id", deviceId);
    } catch (e) {
      // localStorage may be disabled
    }
  }

  const ua = navigator.userAgent || "";
  let platform: "windows" | "macos" | "linux" | "android" | "ios" | "web" = "windows";
  let deviceType: "desktop" | "laptop" | "mobile" | "tablet" = "desktop";
  let osName = "Windows PC";
  let browser = "Web Browser";

  // Detect OS / Platform
  if (/iPad/i.test(ua)) {
    platform = "ios";
    deviceType = "tablet";
    osName = "Apple iPad";
  } else if (/iPhone/i.test(ua) || /iPod/i.test(ua)) {
    platform = "ios";
    deviceType = "mobile";
    osName = "Apple iPhone";
  } else if (/Android/i.test(ua)) {
    platform = "android";
    deviceType = /Mobile/i.test(ua) ? "mobile" : "tablet";
    osName = "Android Device";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    platform = "macos";
    deviceType = "laptop";
    osName = "Apple Mac";
  } else if (/Linux/i.test(ua)) {
    platform = "linux";
    deviceType = "desktop";
    osName = "Linux Desktop";
  } else if (/Windows NT 10.0/i.test(ua)) {
    platform = "windows";
    deviceType = "desktop";
    osName = "Windows 10/11 PC";
  } else if (/Windows/i.test(ua)) {
    platform = "windows";
    deviceType = "desktop";
    osName = "Windows PC";
  }

  // Detect Browser
  if (/Edg\//i.test(ua)) {
    browser = "Microsoft Edge";
  } else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) {
    browser = "Google Chrome";
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = "Apple Safari";
  } else if (/Firefox\//i.test(ua)) {
    browser = "Mozilla Firefox";
  } else if (/Opera|OPR\//i.test(ua)) {
    browser = "Opera";
  }

  const deviceName = `${osName} (${browser})`;

  return {
    deviceId,
    deviceName,
    deviceType,
    platform,
    browser,
    userAgent: ua,
  };
}
