import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Scene3D } from "@/components/motion/Scene3D";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

// Başlıklar: yumuşak, masalsı serif · Metin: sıcak, yuvarlak sans
const display = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap", axes: ["SOFT", "opsz"] });
const sans = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "NearDrop — Share files. Simply.",
  description:
    "Fast, private, and secure file sharing without the clutter. High-speed direct uploads, cryptographic links, password protection, and automated lifespan management.",
  keywords: ["file sharing", "secure file transfer", "cloud storage", "expiring links", "airdrop alternative"],
  authors: [{ name: "NearDrop Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NearDrop",
  },
  openGraph: {
    title: "NearDrop — Share files. Simply.",
    description: "Fast, private, and secure file sharing without the clutter.",
    url: "https://neardrop.bekirr.dev",
    siteName: "NearDrop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NearDrop — Share files. Simply.",
    description: "Fast, private, and secure file sharing without the clutter.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0918",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`dark scroll-smooth ${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Scene3D />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (process.env.NODE_ENV === 'production') {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                  });
                } else {
                  navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                      registration.unregister();
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
