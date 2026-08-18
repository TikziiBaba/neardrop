import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Lock, HardDrive, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">NearDrop</span>
            </Link>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Fast, private, and secure file sharing without the clutter. Powered by Cloudflare R2 storage architecture and PostgreSQL row-level security.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#features" className="hover:text-zinc-200 transition-colors">
                  Instant Drop
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-zinc-200 transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-zinc-200 transition-colors">
                  Cloud Dashboard
                </Link>
              </li>
              <li>
                <Link href="/storage" className="hover:text-zinc-200 transition-colors">
                  Storage Quotas
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Tech */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Security</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  End-to-End Signed URLs
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  Row Level Security (RLS)
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  Expiring Links
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  Password Encryption
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Privacy & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">
                  Zero Data Selling
                </span>
              </li>
              <li>
                <span className="hover:text-zinc-200 transition-colors cursor-pointer">
                  Security Disclosures
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} NearDrop Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built for seamless file exchange
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
