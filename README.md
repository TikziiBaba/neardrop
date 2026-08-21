# NearDrop — AirDrop-like Local & Cloud File Sharing Platform

<p align="center">
  <strong>Fast • Private • Secure • Local-First • Cloud-Enabled</strong>
</p>

---

## 🌟 Overview

**NearDrop** is a modern, cross-platform local and cloud file sharing platform built with **Tauri (Rust)**, **React**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **Cloudflare R2**.

It features two distinct transfer modes:
1. **LAN Direct Transfer:** 100% offline, zero cloud dependency, automatic UDP beacon device discovery, direct streaming TCP chunk transfer, continuous SHA-256 cryptographic verification, and strict path-traversal sandboxing.
2. **Cloud Transfer:** Seamless internet file sharing powered by Supabase Auth (email/password, OAuth), PostgreSQL Row Level Security (RLS), and Cloudflare R2 object storage via presigned URLs issued by serverless Edge Functions.

---

## 🏗️ System Architecture

```text
                           NearDrop Desktop App
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
              LAN MODE                            CLOUD MODE
                  │                                   │
                  ▼                                   ▼
        UDP Discovery Beacon                       Supabase
      (Multicast/Broadcast 45455)                     │
                  │                              Auth & DB (RLS)
                  ▼                              Edge Functions
         Direct TCP Streaming                         │
        (Port 45454, AES-256-GCM)                     ▼
                  │                             Cloudflare R2
                  ▼                            (Object Storage)
          Local Recipient
```

---

## 🚀 Key Features

* **Instant LAN Device Discovery:** Automatically discovers other NearDrop devices across Wi-Fi and Ethernet subnets using UDP broadcast beacons.
* **True Streaming I/O:** Handles 10GB+ files without memory bloat by streaming in bounded 64KB chunks directly to and from disk.
* **Cryptographic File Integrity:** Computes rolling SHA-256 digests on both sender and receiver to verify file authenticity and reject corrupted payloads.
* **Strict Security Jail:** Rejects path traversal attacks (`..`, absolute paths, symlinks, reserved Windows names) to ensure all incoming files remain strictly inside the user's selected download folder.
* **QR & PIN Pairing:** Ephemeral QR code and 6-digit confirmation codes for pairing and trusting known devices with optional auto-acceptance.
* **Real-time Transfer Metrics:** Displays live rolling-average transfer speed (MB/s), estimated time remaining (ETA), and individual file progress.
* **Cloud Sharing Links:** Generates expiring share links with customizable expiration (1h, 24h, 7d, never), maximum download quotas, and optional password protection.
* **System Tray & Desktop Notifications:** Native OS notifications for incoming transfers and completions, plus background system tray access.
* **Multilingual:** Full internationalization support for English, Turkish, and German.
* **Curated Themes:** Dark, Light, and System themes with glassmorphism accents.

---

## 📁 Repository Structure

```text
NearDrop/
├── src/                              # Next.js Fullstack Web Application
│   ├── app/                          # App Router (Pages, Layouts, API Routes)
│   ├── components/                   # UI & Feature Components (Tailwind, Lucide, Framer Motion)
│   ├── lib/                          # Utilities, Supabase Auth & R2 Clients
│   └── types/                        # TypeScript Interfaces
├── supabase/
│   ├── migrations/                   # PostgreSQL Schema & Row Level Security (RLS)
│   └── functions/                    # Edge Functions (cloud-upload, cloud-download, cloud-share)
├── package.json                      # Next.js Project Config & Dependencies
└── README.md
```

---

## 🛠️ Development & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Web App (Dev Mode)
```bash
npm run dev
```

### 3. Build Production Web App
```bash
npm run build
```

---

## 🔒 Security Architecture

1. **Device Identity:** Each installation generates an Ed25519 public/private keypair and persistent device ID on first launch.
2. **Zero Cloud Key Exposure:** Cloudflare R2 access keys (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) exist exclusively on server-side Supabase Edge Functions and are never embedded into client binaries.
3. **Pre-signed Ephemeral URLs:** Uploads and downloads communicate directly with Cloudflare R2 using short-lived (15–30 min) S3 presigned URLs.
4. **Path Traversal Sandboxing:** All incoming filenames and relative directory trees are sanitized by `PathSanitizer` before disk writes.

---

## 📄 License

MIT License. Designed and engineered for high-performance cross-platform file sharing.
