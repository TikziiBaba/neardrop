# NearDrop Mobil (Flutter)

neardrop.bekirr.dev'in Android uygulaması. Web sitesiyle aynı Supabase hesabını ve `/api/*` uçlarını kullanır.
Doğrudan aktarım (P2P) web sürümüyle aynı protokolü konuşur, yani telefon ile tarayıcı aynı odada birbirini görür.

## Derleme

```bash
cp env.example.json env.json   # SUPABASE_URL ve SUPABASE_ANON_KEY değerlerini .env.local'dan doldur
flutter pub get
flutter build apk --release --dart-define-from-file=env.json
```

Çıktı: `build/app/outputs/flutter-apk/app-release.apk`.
Daha küçük, işlemciye özel APK'lar için `--split-per-abi` ekle (çoğu telefon için `app-arm64-v8a-release.apk`).

## İmza anahtarı

Release APK `android/app/neardrop-release.jks` ile imzalanır; şifreler `android/key.properties` içindedir.
İkisi de git dışındadır. **Bu iki dosyayı yedekle.** Kaybolursa, kurulu uygulamanın üzerine güncelleme yüklenemez.
`key.properties` yoksa derleme debug anahtarıyla yapılır.

## Sunucu tarafında yapılacaklar

- **Google / GitHub ile giriş:** Supabase > Authentication > URL Configuration > Redirect URLs listesine
  `dev.bekirr.neardrop://login-callback` eklenmeli. Eklenmezse OAuth dönüşü uygulamaya gelmez.
- **Bağlantıların doğrudan uygulamada açılması:** `public/.well-known/assetlinks.json` siteye deploy edilince
  `neardrop.bekirr.dev/s/...` ve `/transfers?room=...` bağlantıları uygulamada açılır.
- **Çöp kutusu:** Uygulama `/api/files/trash` ucunu kullanır. Bu uç henüz canlı sitede yok; deploy edilene kadar
  çöp kutusu ekranı "sunucuda henüz yok" hatası gösterir.

## Yapı

- `lib/core` – API istemcisi, modeller, biçimlendirme, dil (TR/EN)
- `lib/state` – oturum, dosyalar/paylaşımlar/aktarım kuyruğu, ayarlar
- `lib/features` – ekranlar: giriş, pano, dosyalar, paylaşımlar, doğrudan aktarım, hesap, planlar, destek, yönetim
- `lib/widgets` – "Allay" tasarım sisteminin ortak bileşenleri ve piksel Allay maskotu
