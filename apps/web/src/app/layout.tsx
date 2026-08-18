import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NearDrop — Share files. Simply.",
  description:
    "Fast, private, and secure file sharing without the clutter. High-speed direct uploads, cryptographic links, password protection, and automated lifespan management.",
  keywords: ["file sharing", "secure file transfer", "cloud storage", "expiring links", "airdrop alternative"],
  authors: [{ name: "NearDrop Team" }],
  openGraph: {
    title: "NearDrop — Share files. Simply.",
    description: "Fast, private, and secure file sharing without the clutter.",
    url: "https://neardrop.dev",
    siteName: "NearDrop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NearDrop — Share files. Simply.",
    description: "Fast, private, and secure file sharing without the clutter.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
