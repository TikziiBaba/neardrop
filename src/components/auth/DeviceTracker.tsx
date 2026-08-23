"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/context";
import { getClientDeviceInfo } from "@/lib/utils/device";

export const DeviceTracker: React.FC = () => {
  const { user } = useAuth();
  const lastSyncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !user.id) return;
    if (lastSyncedUserRef.current === user.id) return;

    lastSyncedUserRef.current = user.id;
    const deviceInfo = getClientDeviceInfo();

    const sync = async () => {
      try {
        await fetch("/api/auth/device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            ...deviceInfo,
          }),
        });
      } catch (err) {
        console.warn("Device tracking background sync warning:", err);
      }
    };

    sync();
  }, [user]);

  return null;
};
