"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth/context";
import { StorageProvider } from "@/lib/storage/store";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "sonner";

import { DeviceTracker } from "@/components/auth/DeviceTracker";
import { GlobalTransferProgress } from "@/components/upload/GlobalTransferProgress";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { AllayGuide } from "@/components/mascot/AllayGuide";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DeviceTracker />
        <StorageProvider>
          {children}
          <MotionLayer />
          <AllayGuide />
          <CommandPalette />
          <GlobalTransferProgress />
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "hsl(var(--surface-secondary) / 0.95)",
                border: "1px solid hsl(var(--border-strong) / 0.8)",
                color: "hsl(var(--foreground))",
                backdropFilter: "blur(12px)",
                borderRadius: "1rem",
                fontSize: "0.8125rem",
              },
            }}
          />
        </StorageProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};
