"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager } from "@/lib/utils/sound-effects";

export const AppleFaqSection: React.FC = () => {
  const { locale } = useLanguage();
  const isTr = locale === "tr";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const toggleFaq = (idx: number) => {
    SoundManager.play("click");
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 md:py-32 bg-black select-none">
      <div className="mx-auto max-w-[840px] px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
            {isTr ? "Sık Sorulan Sorular" : "Q & A"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-white">
            {isTr ? "Merak ettikleriniz." : "Questions & Answers."}
          </h2>
        </div>

        {/* Separator-based Accordion */}
        <div className="divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-6">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left text-base sm:text-lg font-semibold text-white hover:text-[#0071e3] transition-colors gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-[#0071e3]" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                        {faq.a}
                      </p>
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
};
