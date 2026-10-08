"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="rounded-3xl border border-border bg-surface/80 p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger border border-danger/20 mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Application Error</h2>
          <p className="text-xs text-muted-foreground">
            {error?.message || "A global runtime error occurred."}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
