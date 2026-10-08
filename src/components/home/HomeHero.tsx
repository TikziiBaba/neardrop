"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Radio, ShieldCheck, Zap, UserX, Film, Images, FileArchive, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { easeApple } from "@/lib/motion";

type FloatingFile = { name: [string, string]; size: string; icon: LucideIcon; tone: string; className: string; depth: number; delay: number };

// Hero'nun iki yanında farklı derinliklerde süzülen örnek dosyalar
const FILES: FloatingFile[] = [
  { name: ["4K_ProRes_Sinematik.mov", "4K_ProRes_Cinematic.mov"], size: "1.4 GB", icon: Film, tone: "text-file-video bg-file-video/15", className: "left-[4%] top-[30%] -rotate-6", depth: 36, delay: 0.9 },
  { name: ["Tatil_RAW_Fotoğraflar.zip", "Vacation_RAW_Photos.zip"], size: "420 MB", icon: Images, tone: "text-success bg-success/15", className: "right-[5%] top-[22%] rotate-6", depth: 56, delay: 1.05 },
  { name: ["Proje_Kaynak_Kodları.tar.gz", "Project_Source_Code.tar.gz"], size: "2.1 GB", icon: FileArchive, tone: "text-warning bg-warning/15", className: "right-[10%] bottom-[14%] -rotate-3", depth: 24, delay: 1.2 },
];

function FileCard({ file, mx, my, isTr }: { file: FloatingFile; mx: MotionValue<number>; my: MotionValue<number>; isTr: boolean }) {
  const x = useTransform(mx, (v) => v * file.depth);
  const y = useTransform(my, (v) => v * file.depth);
  const Icon = file.icon;
  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, delay: file.delay, ease: easeApple }}
      className={`pointer-events-none absolute hidden lg:block ${file.className}`}
      aria-hidden
    >
      <div className="animate-float flex items-center gap-3 rounded-2xl border border-white/10 bg-surface/60 p-3 pr-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl" style={{ animationDelay: `${file.delay}s` }}>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${file.tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold text-foreground">{isTr ? file.name[0] : file.name[1]}</span>
          <span className="text-[11px] text-muted-foreground">{file.size} · <span className="text-halo">✦</span> {isTr ? "uçuşta" : "in flight"}</span>
        </span>
      </div>
    </motion.div>
  );
}

export function HomeHero() {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  // Fare konumu (-0.5..0.5): kartlar ve başlık hafifçe derinlik kazanır
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 20 });
  const my = useSpring(myRaw, { stiffness: 60, damping: 20 });
  const titleX = useTransform(mx, (v) => v * -10);
  const titleY = useTransform(my, (v) => v * -8);

  const chips = [
    { icon: Zap, label: isTr ? "1.2 Gbps Yerel Ağ Hızı" : "1.2 Gbps Local Speed" },
    { icon: ShieldCheck, label: isTr ? "AES-256-GCM Uçtan Uca" : "AES-256-GCM End-to-End" },
    { icon: UserX, label: isTr ? "Hesap veya Kurulum Yok" : "No Account or Install" },
  ];

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 30, filter: "blur(12px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1, delay, ease: easeApple },
  });

  return (
    <section
      id="overview"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mxRaw.set((e.clientX - r.left) / r.width - 0.5);
        myRaw.set((e.clientY - r.top) / r.height - 0.5);
      }}
      className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden px-4 pb-20 pt-16"
    >
      {FILES.map((f) => (
        <FileCard key={f.size} file={f} mx={mx} my={my} isTr={isTr} />
      ))}

      <motion.div style={{ x: titleX, y: titleY }} className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div {...rise(0.15)} className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[13px] font-medium text-accent-text backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-halo opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-halo" />
          </span>
          {isTr ? "NearDrop 2.0 · Eşler Arası Dosya Aktarımı" : "NearDrop 2.0 · Peer-to-Peer File Transfer"}
        </motion.div>

        <h1 className="text-[clamp(3rem,8vw,6.75rem)] leading-[0.98]">
          <motion.span {...rise(0.3)} className="block">
            {isTr ? "Her şeyi gönderin." : "Send anything."}
          </motion.span>
          <motion.span {...rise(0.45)} className="text-celestial block pb-2 italic">
            {isTr ? "Herkese. Anında." : "To anyone. Instantly."}
          </motion.span>
        </h1>

        <motion.p {...rise(0.6)} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {isTr
            ? "Cihazınız doğrudan alıcıya bağlanır. Bulut yüklemesi beklemeden, boyut sınırı olmadan, uçtan uca AES-256 şifreli transfer."
            : "Direct peer-to-peer browser connection. No cloud uploads, no file size caps, and zero-knowledge client-side encryption."}
        </motion.p>

        <motion.div {...rise(0.75)} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#studio"
            className="group inline-flex h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 text-[15px] font-semibold text-white shadow-[0_16px_40px_-12px_hsl(var(--accent)/0.9)] ring-1 ring-white/20 transition-all hover:shadow-[0_20px_50px_-10px_hsl(var(--accent))]"
          >
            {isTr ? "Şimdi Dosya Bırakın" : "Drop a File Now"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/transfers"
            className="inline-flex h-14 items-center gap-2.5 rounded-full border border-border-strong bg-surface/40 px-7 text-[15px] font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-surface-secondary"
          >
            <Radio className="h-4 w-4 text-halo" />
            {isTr ? "Canlı P2P Transfer Merkezini Aç" : "Open Live P2P Transfer Center"}
          </Link>
        </motion.div>

        <motion.ul {...rise(0.9)} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] text-muted-foreground">
          {chips.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-accent-text" />
              {label}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
