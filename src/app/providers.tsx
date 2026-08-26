"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth/context";
import { StorageProvider } from "@/lib/storage/store";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "sonner";

import { DeviceTracker } from "@/components/auth/DeviceTracker";
import { GlobalTransferProgress } from "@/components/upload/GlobalTransferProgress";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DeviceTracker />
        <StorageProvider>
          {children}
          <GlobalTransferProgress />
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(24, 24, 27, 0.95)",
                border: "1px solid rgba(39, 39, 42, 0.8)",
                color: "#fafafa",
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
