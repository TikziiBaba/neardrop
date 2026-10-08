// Allay'ın siteyi tanıtırken söyledikleri.
// Ana sayfa: bölüm kimliğine göre · Diğer sayfalar: kaydırma ilerledikçe sırayla gösterilen ipuçları.

type Line = { tr: string; en: string };

export const HOME_STOPS: { id: string; line: Line }[] = [
  { id: "overview", line: { tr: "Selam! Ben Allay 💙 NearDrop'ta dosyaları cihazdan cihaza uçururum. Aşağı kaydır, sana etrafı gezdireyim!", en: "Hi! I'm Allay 💙 I fly files from device to device at NearDrop. Scroll down and I'll show you around!" } },
  { id: "how", line: { tr: "Üç adım: dosyayı bırak, linki ayarla, paylaş. Bu kadar basit!", en: "Three steps: drop it, set up the link, share. That simple!" } },
  { id: "features", line: { tr: "Hız ve gizlilik bir arada: süreli linkler, şifre koruması, sınırsız bant genişliği.", en: "Speed meets privacy: expiring links, password protection, unlimited bandwidth." } },
  { id: "studio", line: { tr: "Buraya bir dosya bırakmayı dene! Saniyeler içinde güvenli linkin hazır.", en: "Try dropping a file here! Your secure link is ready in seconds." } },
  { id: "compare", line: { tr: "Diğerleriyle kıyasla: hesap yok, boyut sınırı yok, uçtan uca şifreleme var 😌", en: "Compare: no account, no size limit, end-to-end encryption 😌" } },
  { id: "security", line: { tr: "Dosyaların şifreli kalır. Ben bile göremem! 🔒", en: "Your files stay encrypted. Even I can't peek! 🔒" } },
  { id: "faq", line: { tr: "Aklına takılan bir şey mi var? Cevaplar burada.", en: "Got a question? The answers are right here." } },
  { id: "start", line: { tr: "Hazır mısın? Hadi ilk dosyanı birlikte gönderelim! ✨", en: "Ready? Let's send your first file together! ✨" } },
];

const ROUTE_TIPS: { match: string; lines: Line[] }[] = [
  { match: "/pricing", lines: [
    { tr: "Planlar burada. Ücretsiz başlayıp istediğin zaman yükseltebilirsin.", en: "Plans live here. Start free and upgrade anytime." },
    { tr: "Yıllık ödemede indirim var, bir göz at!", en: "There's a discount for yearly billing, take a look!" },
  ] },
  { match: "/contact", lines: [
    { tr: "Bize buradan ulaşabilirsin, ekip hızlıca döner.", en: "Reach the team here, they reply fast." },
    { tr: "Formu doldurman yeterli, gerisini ben uçururum!", en: "Just fill in the form, I'll fly it over!" },
  ] },
  { match: "/login", lines: [{ tr: "Tekrar hoş geldin! Dosyaların seni bekliyor.", en: "Welcome back! Your files are waiting." }] },
  { match: "/register", lines: [{ tr: "Hesap açmak bir dakika sürer. Hadi başlayalım!", en: "Signing up takes a minute. Let's go!" }] },
  { match: "/forgot-password", lines: [{ tr: "Şifreni mi unuttun? E-postanı yaz, sıfırlama bağlantısını uçurayım.", en: "Forgot your password? Enter your email and I'll fly a reset link over." }] },
  { match: "/verify-email", lines: [{ tr: "E-postana bir kod gönderdim, kutuna bak!", en: "I sent a code to your email, check your inbox!" }] },
  { match: "/dashboard", lines: [
    { tr: "Burası panelin: depolama, son dosyalar ve istatistikler.", en: "This is your dashboard: storage, recent files and stats." },
    { tr: "Aşağıda dosya bırakma alanı var, dene!", en: "There's a drop area below, give it a try!" },
  ] },
  { match: "/files", lines: [
    { tr: "Tüm dosyaların burada. Yeniden adlandır, paylaş, sil.", en: "All your files live here. Rename, share, delete." },
    { tr: "Bir dosyaya tıkla, önizlemesini açayım.", en: "Click a file and I'll open its preview." },
  ] },
  { match: "/shared", lines: [{ tr: "Paylaştığın linkler burada; süresini ve indirmeleri takip et.", en: "Your shared links are here; track expiry and downloads." }] },
  { match: "/transfers", lines: [
    { tr: "Canlı P2P! Aynı ağdaki cihazlar burada belirir.", en: "Live P2P! Devices on your network show up here." },
    { tr: "Dosyayı sürükle, doğrudan karşıya uçsun.", en: "Drag a file and it flies straight across." },
  ] },
  { match: "/storage", lines: [{ tr: "Hangi tür dosyanın ne kadar yer kapladığını burada görürsün.", en: "See how much space each file type takes." }] },
  { match: "/settings", lines: [{ tr: "Profilini, güvenliğini ve tercihlerini buradan ayarla.", en: "Tune your profile, security and preferences here." }] },
  { match: "/support", lines: [{ tr: "Bir sorun mu var? Buradan destek talebi aç, ekip ilgilensin.", en: "Something wrong? Open a ticket and the team will help." }] },
  { match: "/admin", lines: [{ tr: "Yönetici paneli: kullanıcılar, dosyalar ve sistem sağlığı.", en: "Admin panel: users, files and system health." }] },
  { match: "/privacy", lines: [{ tr: "Gizlilik politikamız burada. Verin her zaman senin.", en: "Our privacy policy. Your data is always yours." }] },
  { match: "/terms", lines: [{ tr: "Kullanım koşulları burada, kısa ve net.", en: "Terms of use, short and clear." }] },
  { match: "/s/", lines: [{ tr: "Biri seninle dosya paylaşmış! İndirmek için aşağı bak.", en: "Someone shared a file with you! Look below to download." }] },
  { match: "/checkout", lines: [{ tr: "Neredeyse bitti! Ödemeyi tamamlayınca yeni planın açılır.", en: "Almost there! Your new plan unlocks after checkout." }] },
];

const DEFAULT: Line[] = [{ tr: "Selam! Bir şeye ihtiyacın olursa buradayım.", en: "Hi! I'm here if you need anything." }];

export const FLEE_LINES: Line[] = [
  { tr: "Yakalayamazsın! 😄", en: "Can't catch me! 😄" },
  { tr: "Hop! Buradayım 💨", en: "Whoosh! Over here 💨" },
  { tr: "Gıdıklanıyorum! 🎶", en: "That tickles! 🎶" },
];

export function routeTips(pathname: string): Line[] {
  return ROUTE_TIPS.find((r) => pathname.startsWith(r.match))?.lines ?? DEFAULT;
}

export type { Line };
