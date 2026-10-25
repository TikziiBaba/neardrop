"use client";

import React from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Download, LogIn, ShieldCheck, Smartphone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Footer } from "@/components/layout/Footer";

// APK'lar GitHub Releases'te durur; "latest" bağlantısı her yeni sürümde aynı kalır.
// Yeni sürüm yayınlarken sadece sürüm ve boyutları güncelle, dosya adları değişmesin.
const RELEASES = "https://github.com/TikziiBaba/neardrop/releases/latest/download";
const VERSION = "1.0.0";
const MIN_ANDROID = "7.0";
const APK = { url: `${RELEASES}/NearDrop-arm64.apk`, size: "42 MB" };
const UNIVERSAL_APK = { url: `${RELEASES}/NearDrop-universal.apk`, size: "114 MB" };

export default function DownloadPage() {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const steps = [
    {
      icon: Download,
      title: isTr ? "APK'yı indirin" : "Download the APK",
      desc: isTr
        ? "Telefonunuzdan bu sayfayı açıp indirme düğmesine dokunun ya da bilgisayardaki QR kodu okutun."
        : "Open this page on your phone and tap download, or scan the QR code from your computer.",
    },
    {
      icon: ShieldCheck,
      title: isTr ? "Yüklemeye izin verin" : "Allow the install",
      desc: isTr
        ? "Android, Play Store dışından gelen uygulamalar için izin ister. Uyarıda Ayarlar'a gidip tarayıcınıza izin verin."
        : "Android asks before installing apps from outside the Play Store. Tap Settings in the prompt and allow your browser.",
    },
    {
      icon: LogIn,
      title: isTr ? "Hesabınızla giriş yapın" : "Sign in",
      desc: isTr
        ? "Web sitesindeki hesabınızla giriş yapın. Dosyalarınız, paylaşımlarınız ve planınız aynen gelir."
        : "Use the same account as the website. Your files, shares and plan come with you.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden text-foreground antialiased">
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-24">
        <div>
          <span className="eyebrow">{isTr ? "Android Uygulaması" : "Android App"}</span>
          <h1 className="mt-5 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]">
            {isTr ? "NearDrop artık" : "NearDrop, now"} <span className="text-celestial italic">{isTr ? "cebinizde." : "in your pocket."}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {isTr
              ? "Dosyalarınızı yönetin, süreli bağlantılar paylaşın ve doğrudan aktarımla telefon ile bilgisayar arasında dosya gönderin."
              : "Manage your files, share expiring links and send files between your phone and computer with direct transfer."}
          </p>

          <div className="mt-10 flex flex-col items-start gap-4">
            <a
              href={APK.url}
              className="inline-flex h-14 items-center gap-2.5 rounded-full bg-foreground px-8 text-[15px] font-semibold text-background transition-colors hover:bg-foreground/85"
            >
              <Download className="h-5 w-5" />
              {isTr ? "Android için indir" : "Download for Android"}
            </a>
            <p className="text-[13px] text-subtle">
              {isTr ? "Sürüm" : "Version"} {VERSION} · {APK.size} · Android {MIN_ANDROID}+
            </p>
            <p className="text-[13px] text-muted-foreground">
              {isTr ? "Kurulmadı mı? Eski veya farklı işlemcili cihazlar için " : "Won't install? For older or other devices, try the "}
              <a href={UNIVERSAL_APK.url} className="font-medium text-accent-text hover:underline">
                {isTr ? "evrensel APK'yı" : "universal APK"}
              </a>
              {isTr ? ` (${UNIVERSAL_APK.size}) deneyin.` : ` (${UNIVERSAL_APK.size}).`}
            </p>
          </div>
        </div>

        {/* Bilgisayardan gelenler için: telefonla okut, doğrudan indir */}
        <div className="hidden justify-center md:flex">
          <div className="relative">
            <div aria-hidden className="absolute -inset-6 rounded-[48px] bg-gradient-to-br from-accent/30 via-halo/10 to-halo/20 opacity-60 blur-3xl" />
            <div className="relative flex flex-col items-center gap-5 rounded-[36px] border border-accent/25 bg-surface/70 p-8 shadow-2xl backdrop-blur-2xl">
              <div className="rounded-2xl bg-white p-4">
                <QRCodeSVG value={APK.url} size={184} />
              </div>
              <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                <Smartphone className="h-4 w-4 text-accent-text" />
                {isTr ? "Telefonunuzun kamerasıyla okutun" : "Scan with your phone's camera"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-[28px] border border-border/80 bg-surface/50 p-8 backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent-text/10 text-accent-text ring-1 ring-inset ring-accent/40">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-5xl italic text-foreground/15">0{i + 1}</span>
              </div>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[14px] text-muted-foreground">
          {isTr ? "iPhone kullanıyorsanız iOS uygulaması henüz yok. " : "On iPhone? There's no iOS app yet. "}
          <Link href="/" className="font-medium text-accent-text hover:underline">
            {isTr ? "NearDrop'u Safari'den kullanabilirsiniz." : "You can use NearDrop in Safari."}
          </Link>
        </p>
      </section>

      <Footer />
    </main>
  );
}
