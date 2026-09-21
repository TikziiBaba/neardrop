"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import {
  Shield,
  Lock,
  Key,
  Terminal,
  Cpu,
  EyeOff,
  CheckCircle2,
  FileCheck2,
  Sparkles,
} from "lucide-react";

export const AppleSecuritySection: React.FC = () => {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [inputVal, setInputVal] = useState("Proje_Gizli_Mali_Rapor.pdf");

  // Simulated hash derivation
  const fakeHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  };

  const cipherText = `AES-GCM-256:d8a9f${fakeHash(inputVal)}03bc17e84992ca77401f8e129b015e7`;

  return (
    <section
      id="security"
      className="relative py-24 md:py-36 bg-[#000000] text-white overflow-hidden select-none"
    >
      {/* Background Pro Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Apple Pro Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
            {isTr ? "Apple-Grade Güvenlik Standartları" : "Apple-Grade Security Standards"}
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.035em] text-white">
            {isTr ? (
              <>
                Sıfır Bilgi. <br />
                <span className="text-[#86868b]">Sıfır Taviz.</span>
              </>
            ) : (
              <>
                Zero Knowledge. <br />
                <span className="text-[#86868b]">Zero Compromise.</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-[#a1a1a6] leading-relaxed">
            {isTr
              ? "Biz bile dosyalarınızın içeriğini göremeyiz. Şifreleme anahtarları sadece tarayıcınızın donanım hızlandırmalı WebCrypto çekirdeğinde üretilir."
              : "Even we can't open your files. Cryptographic keys are generated solely inside your browser's hardware-accelerated WebCrypto engine."}
          </p>
        </div>

        {/* Live Cryptographic Visualizer */}
        <div className="rounded-[32px] border border-white/[0.12] bg-[#161617]/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1a6]">
              <Terminal className="h-4 w-4 text-[#2997ff]" />
              <span>WebCrypto AES-256-GCM Live Terminal</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Hardware Secure Enclave
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Input */}
            <div>
              <label className="text-[11px] text-[#86868b] block mb-1">
                {isTr ? "1. Girdi Dosyası / Bellek Adresi" : "1. Input Payload / Memory Buffer"}
              </label>
              <div className="flex items-center gap-3 bg-black/50 border border-white/[0.08] rounded-xl px-4 py-2.5">
                <FileCheck2 className="h-4 w-4 text-[#2997ff]" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="bg-transparent text-white w-full outline-none font-mono text-xs"
                />
              </div>
            </div>

            {/* Live Ciphertext */}
            <div>
              <label className="text-[11px] text-[#86868b] block mb-1">
                {isTr ? "2. İstemci Tarafında Şifrelenmiş Çıktı (Sunucuya Giden)" : "2. Client-Encrypted Ciphertext (Outbound Stream)"}
              </label>
              <div className="bg-black/50 border border-white/[0.08] rounded-xl px-4 py-2.5 text-emerald-400 break-all select-all font-mono text-xs">
                {cipherText}
              </div>
            </div>

            {/* Key Safety Notice */}
            <div className="flex items-center gap-2 pt-2 text-[11px] text-[#a1a1a6]">
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {isTr
                  ? "Anahtar URL `#` fragment'inde saklanır — HTTP başlıklarında sunucuya ASLA iletilmez."
                  : "Key lives solely in the URL `#` fragment — NEVER transmitted in HTTP headers."}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Apple-grade Security */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#161617]/50 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#2997ff] flex items-center justify-center">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {isTr ? "Bellek İçi Şifreleme" : "In-Memory Encryption"}
            </h3>
            <p className="text-xs text-[#a1a1a6] leading-relaxed">
              {isTr
                ? "Verileriniz diske veya veritabanına açık biçimde asla yazılmaz. Tarayıcının RAM belleğinde gerçek zamanlı şifrelenir."
                : "No raw bytes ever touch a disk or unencrypted database. Encrypted directly in browser RAM."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#161617]/50 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <EyeOff className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {isTr ? "Sıfır Günlük & İzleme" : "Zero-Log Ephemeral"}
            </h3>
            <p className="text-xs text-[#a1a1a6] leading-relaxed">
              {isTr
                ? "IP adresiniz, dosya adınız veya indirme geçmişiniz kaydedilmez. Transfer bittiğinde tüm oturum sıfırlanır."
                : "Zero IP tracking, zero telemetry, zero access logs. Once the transfer ends, all memory is wiped."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#161617]/50 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {isTr ? "Opsiyonel SHA-256 Şifre" : "Optional PIN Protection"}
            </h3>
            <p className="text-xs text-[#a1a1a6] leading-relaxed">
              {isTr
                ? "Hassas transferlerde tek tıkla ek parola katmanı ekleyin. Parola doğrulanmadan dosya indirilemez."
                : "Add an extra password barrier with one tap. Files cannot be decrypted without the recipient's PIN."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
