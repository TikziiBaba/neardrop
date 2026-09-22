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
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";

export default function ContactPage() {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

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
        toast.success(isTr ? "Mesajınız başarıyla iletildi! En kısa sürede sizinle iletişime geçeceğiz." : "Your message has been sent successfully!");
      } else {
        toast.error(data.error || (isTr ? "Mesaj iletilemedi. Lütfen tekrar deneyin." : "Failed to send message."));
      }
    } catch (err: any) {
      toast.error(err.message || (isTr ? "Bağlantı hatası oluştu." : "Connection error."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-all shadow-sm group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>{isTr ? "Ana Sayfaya Dön" : "Back to Home"}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-[#0071e3] shadow-sm">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{isTr ? "Müşteri Hizmetleri & İletişim" : "Customer Support & Contact"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
            {isTr ? "Bize Ulaşın" : "Contact Us"}
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            {isTr
              ? "NearDrop bulut depolama, abonelikler veya teknik destek ile ilgili tüm sorularınız için ekibimize doğrudan ulaşabilirsiniz."
              : "Get in touch with our team for questions about storage plans, subscriptions, or technical support."}
          </p>
        </div>

        {/* Contact Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address Card */}
            <div className="rounded-[24px] border border-zinc-800 bg-zinc-900/80 p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-[#0071e3] flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{isTr ? "Açık Adres" : "Office Address"}</h3>
                  <p className="text-[11px] text-zinc-400">{isTr ? "Genel Merkez & İletişim Adresi" : "Headquarters & Office"}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-white pl-1 leading-relaxed">
                Sivas Diriliş Mah. 21. Sok.
                <span className="block text-xs text-zinc-400 mt-0.5">Sivas, Türkiye</span>
              </p>
            </div>

            {/* Phone Card */}
            <div className="rounded-[24px] border border-zinc-800 bg-zinc-900/80 p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{isTr ? "Telefon Numarası" : "Phone Number"}</h3>
                  <p className="text-[11px] text-zinc-400">{isTr ? "Müşteri Destek Hattı" : "Customer Support Line"}</p>
                </div>
              </div>
              <div className="pl-1">
                <a
                  href="tel:05456458416"
                  className="text-base font-semibold text-[#0071e3] hover:underline font-mono tracking-wide transition-colors"
                >
                  0545 645 84 16
                </a>
                <span className="block text-[11px] text-zinc-400 mt-0.5">
                  {isTr ? "Uluslararası: " : "International: "}+90 545 645 84 16
                </span>
              </div>
            </div>

            {/* Email Card */}
            <div className="rounded-[24px] border border-zinc-800 bg-zinc-900/80 p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{isTr ? "E-Posta Adresi" : "Email Address"}</h3>
                  <p className="text-[11px] text-zinc-400">{isTr ? "7/24 Destek & Faturalandırma" : "24/7 Support & Billing"}</p>
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
            <div className="rounded-[24px] border border-zinc-800/80 bg-zinc-900/50 p-5 space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Clock className="h-4 w-4 text-[#0071e3]" />
                <span>{isTr ? "Çalışma Saatleri & Yanıt Süresi" : "Working Hours & Response Time"}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {isTr
                  ? "Online destek ve bilet sistemimiz haftanın 7 günü, 24 saat kesintisiz hizmet vermektedir. Telefon ve e-posta talepleri ortalama 2-4 saat içinde yanıtlanır."
                  : "Our online ticketing and support operates 24/7. Inquiries are typically responded to within 2-4 hours."}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-7 sm:p-9 space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="border-b border-zinc-800 pb-4 space-y-1">
                <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>{isTr ? "Hızlı İletişim Formu" : "Quick Contact Form"}</span>
                  <Sparkles className="h-4 w-4 text-[#0071e3]" />
                </h2>
                <p className="text-xs text-zinc-400">
                  {isTr
                    ? "Bize mesajınızı iletin, en geç birkaç saat içinde geri dönüş sağlayalım."
                    : "Send us your message and we will respond shortly."}
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{isTr ? "Mesajınız Alındı!" : "Message Received!"}</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      {isTr
                        ? "Destek ekibimiz en kısa sürede girdiğiniz iletişim bilgileri üzerinden sizinle iletişime geçecektir."
                        : "Our support team will get in touch with you as soon as possible."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage("");
                    }}
                    className="text-xs rounded-full mt-2 border-zinc-700 text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                  >
                    {isTr ? "Yeni Bir Mesaj Gönder" : "Send Another Message"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">{isTr ? "Ad Soyad" : "Full Name"}</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isTr ? "Adınız Soyadınız" : "Your Name"}
                        className="rounded-xl text-xs bg-zinc-950/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3] py-2.5"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">{isTr ? "Telefon Numarası" : "Phone Number"}</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXXX"
                        className="rounded-xl text-xs bg-zinc-950/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3] py-2.5 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">{isTr ? "E-Posta Adresi" : "Email Address"}</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="rounded-xl text-xs bg-zinc-950/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3] py-2.5"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">{isTr ? "Konu" : "Subject"}</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={isTr ? "Abonelik, Dosya Aktarımı veya Destek Talebi" : "Subscription, File Transfer, or Support"}
                      className="rounded-xl text-xs bg-zinc-950/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3] py-2.5"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">{isTr ? "Mesajınız" : "Message"}</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder={isTr ? "Detaylı olarak iletmek istediğiniz mesajınızı buraya yazınız..." : "Write your message here..."}
                      className="w-full rounded-xl text-xs bg-zinc-950/70 border border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3] p-3 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-xs sm:text-sm rounded-full py-3 font-semibold gap-2 text-white bg-[#0071e3] hover:bg-[#0077ed] shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? (isTr ? "Gönderiliyor..." : "Sending...") : (isTr ? "Mesajı Gönder" : "Send Message")}</span>
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
