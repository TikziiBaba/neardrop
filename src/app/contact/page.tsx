"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ArrowLeft,
  MessageSquare,
  Sparkles,
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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col justify-between">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#d2d2d7]/70 bg-white px-4 py-2 text-xs font-semibold text-[#6e6e73] hover:text-[#0071e3] transition-all shadow-sm group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#d2d2d7]/70 text-xs font-semibold text-[#0071e3] shadow-sm">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Müşteri Hizmetleri &amp; İletişim</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Bize Ulaşın
          </h1>
          <p className="text-[#6e6e73] text-sm sm:text-base leading-relaxed">
            NearDrop bulut depolama, abonelikler veya teknik destek ile ilgili tüm sorularınız için ekibimize doğrudan ulaşabilirsiniz.
          </p>
        </div>

        {/* Contact Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address Card */}
            <div className="rounded-[24px] border border-[#d2d2d7]/70 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#eaf4fe] text-[#0071e3] flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">Açık Adres</h3>
                  <p className="text-[11px] text-[#86868b]">Genel Merkez &amp; İletişim Adresi</p>
                </div>
              </div>
              <p className="text-sm font-medium text-[#1d1d1f] pl-1 leading-relaxed">
                Sivas Diriliş Mah. 21. Sok.
                <span className="block text-xs text-[#6e6e73] mt-0.5">Sivas, Türkiye</span>
              </p>
            </div>

            {/* Phone Card */}
            <div className="rounded-[24px] border border-[#d2d2d7]/70 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#eafbf0] text-[#34c759] flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">Telefon Numarası</h3>
                  <p className="text-[11px] text-[#86868b]">Müşteri Destek Hattı</p>
                </div>
              </div>
              <div className="pl-1">
                <a
                  href="tel:05456458416"
                  className="text-base font-semibold text-[#0071e3] hover:underline font-mono tracking-wide transition-colors"
                >
                  0545 645 84 16
                </a>
                <span className="block text-[11px] text-[#6e6e73] mt-0.5">
                  Uluslararası: +90 545 645 84 16
                </span>
              </div>
            </div>

            {/* Email Card */}
            <div className="rounded-[24px] border border-[#d2d2d7]/70 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#f5eefc] text-[#af52de] flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">E-Posta Adresi</h3>
                  <p className="text-[11px] text-[#86868b]">7/24 Destek &amp; Faturalandırma</p>
                </div>
              </div>
              <div className="pl-1">
                <a
                  href="mailto:destek@neardrop.bekirr.dev"
                  className="text-sm font-semibold text-[#0071e3] hover:underline transition-colors"
                >
                  destek@neardrop.bekirr.dev
                </a>
              </div>
            </div>

            {/* Working Hours & Response Times */}
            <div className="rounded-[24px] border border-[#d2d2d7]/60 bg-[#fbfbfd] p-5 space-y-2 text-xs text-[#6e6e73]">
              <div className="flex items-center gap-2 text-[#1d1d1f] font-semibold">
                <Clock className="h-4 w-4 text-[#0071e3]" />
                <span>Çalışma Saatleri &amp; Yanıt Süresi</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Online destek ve bilet sistemimiz haftanın 7 günü, 24 saat kesintisiz hizmet vermektedir. Telefon ve e-posta talepleri ortalama 2-4 saat içinde yanıtlanır.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[28px] border border-[#d2d2d7]/70 bg-white p-7 sm:p-9 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="border-b border-[#e8e8ed] pb-4 space-y-1">
                <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
                  <span>Hızlı İletişim Formu</span>
                  <Sparkles className="h-4 w-4 text-[#0071e3]" />
                </h2>
                <p className="text-xs text-[#6e6e73]">
                  Bize mesajınızı iletin, en geç birkaç saat içinde geri dönüş sağlayalım.
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-[#eafbf0] text-[#34c759] border border-[#34c759]/25 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">Mesajınız Alındı!</h3>
                    <p className="text-xs text-[#6e6e73] max-w-sm mx-auto">
                      Destek ekibimiz en kısa sürede girdiğiniz iletişim bilgileri üzerinden sizinle iletişime geçecektir.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage("");
                    }}
                    className="text-xs rounded-full mt-2 border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  >
                    Yeni Bir Mesaj Gönder
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1d1d1f]">Ad Soyad</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        className="rounded-xl text-xs bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3] py-2.5"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1d1d1f]">Telefon Numarası</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXXX"
                        className="rounded-xl text-xs bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3] py-2.5 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">E-Posta Adresi</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@alanadi.com"
                      className="rounded-xl text-xs bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3] py-2.5"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">Konu</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Abonelik, Dosya Aktarımı veya Destek Talebi"
                      className="rounded-xl text-xs bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3] py-2.5"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">Mesajınız</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Detaylı olarak iletmek istediğiniz mesajınızı buraya yazınız..."
                      className="w-full rounded-xl text-xs bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3] p-3 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-xs sm:text-sm rounded-full py-3 font-semibold gap-2 text-white bg-[#0071e3] hover:bg-[#0077ed] shadow-sm transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? "Gönderiliyor..." : "Mesajı Gönder"}</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
