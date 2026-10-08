"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Database,
  EyeOff,
  FileSearch,
  Fingerprint,
  KeyRound,
  Link2,
  Lock,
  ShieldCheck,
  Sparkles,
  Timer,
  UploadCloud,
  Music,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { DropZone } from "@/components/upload/DropZone";
import { easeApple } from "@/lib/motion";

/* ── Ortak bölüm başlığı ─────────────────────────────── */
function SectionHead({ eyebrow, title, subtitle, center = true }: { eyebrow: string; title: React.ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto mb-16 max-w-3xl text-center" : "mb-14 max-w-2xl"}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-5 text-[clamp(2.25rem,5vw,4rem)] leading-[1.02]">{title}</h2>
      {subtitle && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

const shell = "relative mx-auto max-w-6xl px-4 sm:px-6";

/* ── Nasıl Çalışır ───────────────────────────────────── */
export function HowItWorks() {
  const { t } = useLanguage();
  const h = t.howItWorks;
  const steps = [
    { num: h.step1Num, title: h.step1Title, desc: h.step1Desc, badge: h.step1Badge, icon: UploadCloud },
    { num: h.step2Num, title: h.step2Title, desc: h.step2Desc, badge: h.step2Badge, icon: KeyRound },
    { num: h.step3Num, title: h.step3Title, desc: h.step3Desc, badge: h.step3Badge, icon: Link2 },
  ];

  return (
    <section id="how" className="relative scroll-mt-24 py-28 md:py-36">
      <div className={shell}>
        <SectionHead eyebrow={h.sectionLabel} title={h.title} subtitle={h.subtitle} />
        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Adımları bağlayan ışıltılı yol */}
          <div aria-hidden className="absolute left-[16%] right-[16%] top-[3.25rem] hidden h-px bg-gradient-to-r from-accent/0 via-accent/60 to-halo/0 md:block" />
          {steps.map((s) => (
            <div key={s.num} className="relative rounded-[28px] border border-border/80 bg-surface/50 p-8 backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent-text/10 text-accent-text ring-1 ring-inset ring-accent/40">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-5xl italic text-foreground/15">{s.num}</span>
              </div>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.desc}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-halo/10 px-3 py-1 text-xs font-semibold text-halo">
                <Sparkles className="h-3 w-3" /> {s.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Özellikler (bento) ──────────────────────────────── */
export function Features() {
  const { t } = useLanguage();
  const f = t.features;
  const items: { title: string; desc: string; icon: LucideIcon; className: string; tone: string }[] = [
    { title: f.blazingFastTitle, desc: f.blazingFastDesc, icon: Zap, className: "md:col-span-2", tone: "from-accent/35 to-accent-text/10 text-accent-text" },
    { title: f.cryptoTokenTitle, desc: f.cryptoTokenDesc, icon: Fingerprint, className: "", tone: "from-halo/30 to-halo/5 text-halo" },
    { title: f.autoExpiryTitle, desc: f.autoExpiryDesc, icon: Timer, className: "", tone: "from-halo/30 to-halo/5 text-halo" },
    { title: f.sha256Title, desc: f.sha256Desc, icon: Lock, className: "md:col-span-2", tone: "from-success/30 to-success/5 text-success" },
    { title: f.r2StorageTitle, desc: f.r2StorageDesc, icon: Database, className: "md:col-span-2", tone: "from-accent/30 to-accent/5 text-accent-text" },
    { title: f.fileManagementTitle, desc: f.fileManagementDesc, icon: FileSearch, className: "", tone: "from-file-video/30 to-file-video/5 text-file-video" },
  ];

  return (
    <section id="features" className="relative scroll-mt-24 py-28 md:py-36">
      <div className={shell}>
        <SectionHead eyebrow={f.sectionLabel} title={f.title} subtitle={f.subtitle} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className={`group relative overflow-hidden rounded-[28px] border border-border/80 bg-surface/50 p-8 backdrop-blur-xl transition-colors hover:border-accent/40 ${it.className}`}>
              <div aria-hidden className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br opacity-50 blur-3xl transition-opacity group-hover:opacity-90 ${it.tone}`} />
              <span className={`relative mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${it.tone}`}>
                <it.icon className="h-5 w-5" />
              </span>
              <h3 className="relative text-xl font-semibold">{it.title}</h3>
              <p className="relative mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Canlı stüdyo (gerçek yükleme) ───────────────────── */
export function Studio() {
  const { locale } = useLanguage();
  const isTr = locale === "tr";
  const perks = [
    { icon: Link2, title: isTr ? "Tek Tıkla Bağlantı" : "One-Click Link", desc: isTr ? "Kopyalayın ve doğrudan gönderin" : "Copy and beam instantly" },
    { icon: Clock, title: isTr ? "Otomatik İmha" : "Automated Expiry", desc: isTr ? "Süre dolunca sunucudan silinir" : "Purged when timer expires" },
    { icon: ShieldCheck, title: isTr ? "Şifre Koruması" : "Password Protected", desc: isTr ? "İsteğe bağlı AES şifreleme" : "Optional PIN encryption" },
  ];

  return (
    <section id="studio" className="relative scroll-mt-24 py-28 md:py-36">
      <div className={shell}>
        <SectionHead
          eyebrow={isTr ? "Canlı Stüdyo" : "Live Studio"}
          title={<>{isTr ? "Hemen gönderin." : "Ready to send?"} <span className="text-celestial italic">{isTr ? "Sadece bırakın." : "Just drop."}</span></>}
          subtitle={isTr ? "Herhangi bir dosya veya klasörü sürükleyin. Saniyeler içinde güvenli, süreli ve şifreli bağlantınız hazır." : "Drag and drop any file or folder. Your secure, expiring link is generated in seconds."}
        />
        <div className="relative mx-auto max-w-3xl">
          {/* Kartın arkasındaki hale */}
          <div aria-hidden className="absolute -inset-6 rounded-[48px] bg-gradient-to-br from-accent/30 via-halo/10 to-halo/20 opacity-60 blur-3xl" />
          <div className="relative rounded-[36px] border border-accent/25 bg-surface/70 p-6 shadow-2xl backdrop-blur-2xl sm:p-10" data-no-motion>
            <DropZone />
            <div className="mt-8 grid gap-4 border-t border-border/80 pt-6 sm:grid-cols-3">
              {perks.map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-text">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-foreground">{p.title}</span>
                    <span className="block text-xs text-muted-foreground">{p.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Karşılaştırma ───────────────────────────────────── */
export function Compare() {
  const { locale } = useLanguage();
  const isTr = locale === "tr";
  const rows = [
    [isTr ? "Aktarım Yöntemi" : "Transfer Method", isTr ? "P2P Doğrudan Akış" : "Direct P2P Stream", isTr ? "Bulut Yükle & Bekle" : "Cloud Upload & Wait", isTr ? "Kalıcı Bulut Depolama" : "Persistent Cloud Storage", "Apple Wi-Fi Direct"],
    [isTr ? "Dosya Boyutu Limiti" : "File Size Limit", isTr ? "Sınırsız (P2P)" : "Unlimited (P2P)", "2 GB (Ücretsiz)", isTr ? "15 GB Toplam Kota" : "15 GB Quota Pool", isTr ? "Cihaz Hafızası Kadar" : "Device Storage"],
    [isTr ? "Çapraz Platform Desteği" : "Cross-Platform Support", isTr ? "Tüm Cihazlar & Web" : "All Devices & Web", isTr ? "Web / E-posta" : "Web / Email", isTr ? "Tüm Cihazlar (Hesapla)" : "All (With Account)", isTr ? "Yalnızca Apple Cihazları" : "Apple Devices Only"],
    [isTr ? "Uçtan Uca İstemci Şifreleme" : "End-to-End Client Encryption", "AES-256-GCM (İstemci)", isTr ? "Sunucu Tarafı (TLS)" : "Server-side TLS", isTr ? "Sunucu Tarafı" : "Server-side", "TLS / Wi-Fi WPA3"],
    [isTr ? "Kayıt / Hesap Zorunluluğu" : "Account / Sign-up Required", isTr ? "Gerekmez" : "Not Required", isTr ? "E-posta Doğrulaması" : "Email Verification", isTr ? "Google Hesabı Şart" : "Google Account Required", isTr ? "Apple Kimliği Şart" : "Apple ID Required"],
    [isTr ? "Zaman Ayarlı Kendini İmha" : "Auto-Destruct Lifespan", isTr ? "10 dk - 30 gün / 1 Kez" : "10 min - 30 days / 1x", isTr ? "7 Gün Sabit" : "7 Days Fixed", isTr ? "Manuel Silme" : "Manual Deletion", isTr ? "Yok" : "None"],
  ];
  const cols = ["NearDrop", "WeTransfer", "Google Drive", "AirDrop"];

  return (
    <section id="compare" className="relative scroll-mt-24 py-28 md:py-36">
      <div className={shell}>
        <SectionHead
          eyebrow={isTr ? "Teknik Özellikler" : "Specifications"}
          title={<>{isTr ? "Farkı" : "See the"} <span className="text-celestial italic">{isTr ? "karşılaştırın." : "difference."}</span></>}
        />
        <div className="overflow-x-auto rounded-[28px] border border-border/80 bg-surface/50 backdrop-blur-xl">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/80">
                <th className="p-5 font-medium text-subtle" />
                {cols.map((c, i) => (
                  <th key={c} className={`p-5 text-[13px] font-semibold ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {i === 0 ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-accent-text ring-1 ring-inset ring-accent/40">
                        <Sparkles className="h-3.5 w-3.5 text-halo" /> {c}
                      </span>
                    ) : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([feature, ...vals]) => (
                <tr key={feature} className="border-b border-border/50 last:border-0 transition-colors hover:bg-white/[0.02]">
                  <td className="p-5 font-medium text-foreground">{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`p-5 ${i === 0 ? "bg-accent/[0.06] font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {i === 0 ? (
                        <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-success" />{v}</span>
                      ) : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ── Güvenlik ────────────────────────────────────────── */
export function Security() {
  const { t } = useLanguage();
  const s = t.security;
  const items = [
    { title: s.rlsTitle, desc: s.rlsDesc, icon: ShieldCheck },
    { title: s.signedUrlTitle, desc: s.signedUrlDesc, icon: Link2 },
    { title: s.highEntropyTitle, desc: s.highEntropyDesc, icon: Fingerprint },
    { title: s.zeroKnowledgeTitle, desc: s.zeroKnowledgeDesc, icon: EyeOff },
    { title: s.lifespanTitle, desc: s.lifespanDesc, icon: Timer },
    { title: s.egressTitle, desc: s.egressDesc, icon: Lock },
  ];

  return (
    <section id="security" className="relative scroll-mt-24 py-28 md:py-36">
      <div className={shell}>
        <SectionHead eyebrow={s.badge} title={s.title} subtitle={s.subtitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-[28px] border border-border/80 bg-surface/50 p-7 backdrop-blur-xl">
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-inset ring-success/30">
                <it.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{it.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SSS ─────────────────────────────────────────────── */
export function Faq() {
  const { locale, t } = useLanguage();
  const isTr = locale === "tr";
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    {
      q: isTr ? "NearDrop dosya boyutunu kısıtlar mı?" : "Does NearDrop limit file sizes?",
      a: isTr
        ? "Hayır. Doğrudan P2P (WebRTC) aktarımlarında dosya boyutu sınırı yoktur — 10 GB, 50 GB veya 100 GB dosyalar tarayıcınızdan doğrudan alıcının cihazına akar. Geçici bulut paylaşımında ise ücretsiz hesaplar için 2 GB sınır uygulanır."
        : "No. For direct P2P transfers there are no file size caps — 10 GB or 100 GB files stream directly from browser to browser. For temporary cloud links, free accounts include up to 2 GB per file.",
    },
    {
      q: isTr ? "Dosyalarım sunucularınızda saklanıyor mu?" : "Are my files stored on your servers?",
      a: isTr
        ? "P2P aktarımlarında dosyalarınız sunucumuza hiç uğramaz, yalnızca iki cihaz arasında şifreli tünelde akar. Bağlantı oluşturarak yapılan paylaşımlarda ise dosyalarınız istemci tarafında şifrelenir ve belirlediğiniz süre dolduğunda kalıcı olarak yok edilir."
        : "In P2P transfers, your files never touch our servers — they flow purely peer-to-peer. In link-based shares, files are encrypted on your device and shredded permanently upon expiration.",
    },
    {
      q: isTr ? "Alıcının NearDrop hesabı açması gerekir mi?" : "Does the recipient need a NearDrop account?",
      a: isTr
        ? "Kesinlikle hayır. Alıcı yalnızca paylaştığınız bağlantıyı açar veya yerel radarda onay verir. Hiçbir uygulama yüklemesi veya kayıt gerekmez."
        : "Not at all. The recipient simply clicks your link or accepts the local radar invite. No apps or sign-ups required.",
    },
    {
      q: isTr ? "Şifre koruması nasıl çalışır?" : "How does password protection work?",
      a: isTr
        ? "Dosyanızı şifrelediğinizde, parolanız PBKDF2 ve AES-256-GCM ile türetilir. Parola sunucuya asla gönderilmez; yalnızca doğru parolaya sahip alıcı dosyayı yerel olarak deşifre edebilir."
        : "When you add a PIN, it is derived using PBKDF2 and AES-256-GCM in your browser. The PIN is never transmitted to our servers; only the holder of the correct password can decrypt the file locally.",
    },
  ];

  return (
    <section id="faq" className="relative scroll-mt-24 py-28 md:py-36">
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHead eyebrow={t.navbar.faq} title={isTr ? "Merak edilenler" : "Questions, answered"} />
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`rounded-3xl border bg-surface/50 backdrop-blur-xl transition-colors ${isOpen ? "border-accent/40" : "border-border/80"}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="text-[17px] font-semibold text-foreground">{f.q}</span>
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-180 bg-accent text-white" : "bg-surface-secondary text-muted-foreground"}`}>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: easeApple }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Kapanış çağrısı ─────────────────────────────────── */
export function FinalCta() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const isTr = locale === "tr";

  return (
    <section id="start" className="relative scroll-mt-24 py-28 md:py-36">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[44px] border border-accent/30 bg-gradient-to-br from-accent/30 via-surface/70 to-accent-text/15 px-6 py-20 text-center shadow-[0_40px_120px_-40px_hsl(var(--accent))] backdrop-blur-2xl sm:px-16">
          <div aria-hidden className="absolute -top-24 left-1/2 h-48 w-[28rem] -translate-x-1/2 rounded-[50%] border-[6px] border-halo/40 blur-[2px]" />
          <Music className="mx-auto mb-6 h-10 w-10 text-halo" />
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]">
            {isTr ? "Hemen" : "Get started"} <span className="text-celestial italic">{isTr ? "başlayın." : "today."}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            {isTr ? "Kurulum gerektirmez. İlk dosyanızı saniyeler içinde gönderin." : "No installation needed. Send your first file in seconds."}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#studio" className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-8 text-[15px] font-semibold text-background transition-colors hover:bg-foreground/85">
              {isTr ? "Ücretsiz Dosya Bırakın" : "Drop Files Free"}
            </Link>
            <Link href={user ? "/dashboard" : "/register"} className="group inline-flex h-14 items-center gap-2 rounded-full border border-border-strong bg-background/30 px-7 text-[15px] font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-background/60">
              {user ? (isTr ? "Panele Git" : "Go to Dashboard") : isTr ? "Hesap Oluştur" : "Create Account"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
