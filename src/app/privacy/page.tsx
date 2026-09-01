"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, EyeOff, FileText, ArrowLeft, CheckCircle2, Globe, Server, UserCheck } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-4 mb-12 border-b border-zinc-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy &amp; Security Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            At NearDrop, we prioritize your privacy and data security above all else. This policy outlines how your information is handled and safeguarded when using our services.
          </p>
          <p className="text-xs text-zinc-500">
            Last Updated: August 24, 2026
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <EyeOff className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero Data Selling</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We never sell your personal data or files to third parties or use them for advertising purposes.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">End-to-End Protection</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your files are transmitted via encrypted channels (TLS 1.3 / AES-256) and stored securely.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Server className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Auto Expiration</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Shares that expire or reach download limits are permanently purged from our infrastructure.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-zinc-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">1.</span>
              Information We Collect
            </h2>
            <p className="text-zinc-400 text-sm">
              To deliver our services effectively, we collect only the minimum necessary information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-zinc-300 ml-2">
              <li>
                <strong>Account Information:</strong>{" "}
                Email address, display name, and optional avatar URL (when registering via Google OAuth or Email).
              </li>
              <li>
                <strong>Uploaded File Metadata:</strong>{" "}
                File name, size, MIME type, upload timestamp, and sharing configuration (password protection, lifespan).
              </li>
              <li>
                <strong>Technical Logs:</strong>{" "}
                IP addresses and request headers processed temporarily to maintain system security and prevent abuse.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">2.</span>
              Google User Data Policy
            </h2>
            <p className="text-zinc-400 text-sm">
              When you authenticate via Google Sign-In, NearDrop requests only basic profile details (name, email address, and profile photo) strictly for authentication purposes. We do not access, store, or request access to any other Google account data (such as Drive or Gmail).
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">3.</span>
              Data Storage and Security
            </h2>
            <p className="text-zinc-400 text-sm">
              Uploaded files are securely hosted on isolated, high-performance cloud storage. Database and authentication services are protected with modern encryption and strict Row-Level Security (RLS) policies. Users can only access their authorized files.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">4.</span>
              Cookies and Local Storage
            </h2>
            <p className="text-zinc-400 text-sm">
              Our platform uses essential cookies and localStorage strictly to maintain your authenticated session and preserve your language/theme preferences. No 3rd-party advertising tracking cookies are deployed.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">5.</span>
              Your Rights and Contact
            </h2>
            <p className="text-zinc-400 text-sm">
              In compliance with GDPR and applicable privacy laws, you have the right to delete your account, remove uploaded content, or request data exports at any time. For questions, submit a ticket via our support center.
            </p>
            <div className="pt-2">
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors border border-zinc-700"
              >
                <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Open Support Ticket</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
