"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        toast.success("Mesajınız başarıyla iletildi! En kısa sürede sizinle iletişime geçeceğiz.");
      } else {
        toast.error(data.error || "Mesaj iletilemedi. Lütfen tekrar deneyin.");
      }
    } catch (err: any) {
      toast.error(err.message || "Bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-sky-500/30 selection:text-sky-200">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/20 transition-all backdrop-blur-xl group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-xs font-semibold text-sky-400 backdrop-blur-md">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Müşteri Hizmetleri &amp; İletişim</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Bize Ulaşın
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            NearDrop bulut depolama, abonelikler veya teknik destek ile ilgili tüm sorularınız için ekibimize doğrudan ulaşabilirsiniz.
          </p>
        </div>

        {/* Contact Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Contact Info Cards (7 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-[24px] border border-white/10 bg-zinc-900/60 p-6 space-y-3 shadow-xl backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Açık Adres</h3>
                  <p className="text-[11px] text-zinc-400">Genel Merkez &amp; İletişim Adresi</p>
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-200 pl-1 leading-relaxed">
                Sivas Diriliş Mah. 21. Sok.
                <span className="block text-xs text-zinc-400 mt-0.5">Sivas, Türkiye</span>
              </p>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-[24px] border border-white/10 bg-zinc-900/60 p-6 space-y-3 shadow-xl backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Telefon Numarası</h3>
                  <p className="text-[11px] text-zinc-400">Müşteri Destek Hattı</p>
                </div>
              </div>
              <div className="pl-1">
                <a
                  href="tel:05456458416"
                  className="text-base font-bold text-emerald-400 hover:text-emerald-300 font-mono tracking-wide transition-colors"
                >
                  0545 645 84 16
                </a>
                <span className="block text-[11px] text-zinc-400 mt-0.5">
                  Uluslararası: +90 545 645 84 16
                </span>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-[24px] border border-white/10 bg-zinc-900/60 p-6 space-y-3 shadow-xl backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">E-Posta Adresi</h3>
                  <p className="text-[11px] text-zinc-400">7/24 Destek &amp; Faturalandırma</p>
                </div>
              </div>
              <div className="pl-1">
                <a
                  href="mailto:destek@neardrop.bekirr.dev"
                  className="text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                >
                  destek@neardrop.bekirr.dev
                </a>
              </div>
            </motion.div>

            {/* Working Hours & Security Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-[24px] border border-white/5 bg-zinc-900/30 p-5 space-y-2 text-xs text-zinc-400 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <Clock className="h-4 w-4 text-sky-400" />
                <span>Çalışma Saatleri &amp; Yanıt Süresi</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Online destek ve bilet sistemimiz haftanın 7 günü, 24 saat kesintisiz hizmet vermektedir. Telefon ve e-posta talepleri ortalama 2-4 saat içinde yanıtlanır.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-[30px] border border-white/10 bg-zinc-900/70 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-3xl"
            >
              <div className="border-b border-white/10 pb-4 space-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Hızlı İletişim Formu</span>
                  <Sparkles className="h-4 w-4 text-sky-400" />
                </h2>
                <p className="text-xs text-zinc-400">
                  Bize mesajınızı iletin, en geç birkaç saat içinde geri dönüş sağlayalım.
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Mesajınız Alındı!</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Destek ekibimiz en kısa sürede girdiğiniz iletişim bilgileri üzerinden sizinle iletişime geçecektir.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage("");
                    }}
                    className="text-xs rounded-xl mt-2 border-white/10"
                  >
                    Yeni Bir Mesaj Gönder
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Ad Soyad</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        className="rounded-xl text-xs bg-white/[0.03] border-white/10 focus:border-sky-500 py-3"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Telefon Numarası</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXXX"
                        className="rounded-xl text-xs bg-white/[0.03] border-white/10 focus:border-sky-500 py-3 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">E-Posta Adresi</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@alanadi.com"
                      className="rounded-xl text-xs bg-white/[0.03] border-white/10 focus:border-sky-500 py-3"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Konu</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Sanal POS, Abonelik veya Destek Talebi"
                      className="rounded-xl text-xs bg-white/[0.03] border-white/10 focus:border-sky-500 py-3"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Mesajınız</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Detaylı olarak iletmek istediğiniz mesajınızı buraya yazınız..."
                      className="w-full rounded-xl text-xs bg-white/[0.03] border border-white/10 focus:border-sky-500 p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-xs sm:text-sm rounded-xl py-3.5 font-bold gap-2 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/20"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? "Gönderiliyor..." : "Mesajı Gönder"}</span>
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
