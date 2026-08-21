"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || "Invalid credentials. Please try again.");
      } else {
        toast.success("Welcome back to NearDrop!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NearDrop</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-xs text-zinc-400">
            Log in to manage your files, active share links, and storage.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full gap-2 py-2.5 shadow-lg shadow-sky-500/25"
            >
              <span>{isLoading ? "Logging in..." : "Log in"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
