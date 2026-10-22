# NearDrop — Logo Kılavuzu

## 1. Logo
- **Fikir:** Allay'ın piksel yüzünü taşıyan damla; dosyayı sana getiren küçük yardımcı.
- **Yapı:** 16 × 16 piksel ızgara (256'lık tuvalde 16 birimlik hücreler). Gövde 12 hücre geniş, 14 hücre yüksek. İki göz ve sol omuzda üç piksellik parıltı var.
- **Sürümler:** yatay (birincil) · dikey · yalnızca sembol · yalnızca yazı · uygulama ikonu.
- **Dosyalar:**
  - `neardrop-*.svg`: master dosyalar; yazı yollara çevrilmiş, font gerektirmez.
  - `png/`: yüksek çözünürlüklü PNG'ler.
  - `web/`: favicon ve PWA ikonları.
  - `presentation.html` / `slides/`: sunum panosu.
- **Yeniden üretme:** `python build_logo.py --fonts <Fraunces klasörü>` (fontTools gerekir).

| Dosya | Ne zaman |
|---|---|
| `*-dark-bg.svg` | Koyu zemin: site, uygulama, gece mavisi yüzeyler (varsayılan) |
| `*-light-bg.svg` | Beyaz ve açık zemin: belgeler, e-posta, baskı |
| `neardrop-symbol-white.svg` / `-black.svg` | Tek renk: fotoğraf üstü, gravür, damga, tek renkli baskı |
| `neardrop-app-icon.svg` | Yuvarlak köşeli uygulama ikonu karosu |
| `neardrop-icon-full-bleed.svg` | Kenarlara taşan kare karo (iOS ve Android maskable ikon) |

## 2. Boşluk
Logonun her yanında en az **2 hücre** (damlanın ucu kadar genişlik) boş alan bırakın. Bu alan logoyla birlikte ölçeklenir.

## 3. Boyut
| Sürüm | Ekran | Baskı |
|---|---|---|
| Sembol | en az 16 px | en az 6 mm |
| Yatay | en az 120 px genişlik | en az 30 mm |

**Piksel keskinliği:** Sembolü mümkünse **16'nın katlarında** gösterin (16, 32, 48, 64 px…). Bu boylarda her hücre tam piksele oturur. Ara boylarda SVG `shape-rendering="crispEdges"` ile çizilir, yine de en temiz sonuç katlarda alınır.

## 4. Renk
| Ad | Rol | HEX | RGB | CMYK* |
|---|---|---|---|---|
| Allay camgöbeği | Koyu zeminde gövde (imza renk) | `#62DCF5` | 98 220 245 | 60 10 0 4 |
| Okyanus | Açık zeminde gövde, "Drop" yazısı | `#0D93CD` | 13 147 205 | 94 28 0 20 |
| Gece mavisi | Gözler, uygulama karosu | `#0B2D5C` | 11 45 92 | 88 51 0 64 |
| Gece | Zemin, açık zeminde "Near" yazısı | `#061026` | 6 16 38 | 84 58 0 85 |
| Parıltı | Parıltı pikselleri | `#D4FBFF` | 212 251 255 | 17 2 0 0 |
| Köpük | Koyu zeminde "Near" yazısı | `#F2FBFE` | 242 251 254 | 5 1 0 0 |

\*CMYK değerleri RGB'den hesaplanmış yaklaşık değerlerdir. Baskıdan önce matbaayla prova yapın ve gerekiyorsa Pantone eşleşmesi seçin.

**Onaylı zemin eşleşmeleri:**
- Koyu sürüm: gece (`#061026`) veya gece mavisi (`#0B2D5C`) zeminde
- Açık sürüm: beyaz veya açık gri zeminde
- Beyaz tek renk: fotoğraf ya da okyanus mavisi üzerinde
- Siyah tek renk: beyaz zeminde

Allay camgöbeği gövdeyi beyaz zeminde kullanmayın; kontrastı yetersiz kalır.

## 5. Tipografi
- **Logo yazısı:** Fraunces SemiBold. "Near" düz, "Drop" italik. Eksenler: `wght 600`, `opsz 48`, `SOFT 0`, `WONK 0`. Master dosyalarda yollara çevrilidir.
- **Site ve uygulama:** Başlıklarda Fraunces, metinde Plus Jakarta Sans.
- **Lisans:** İki font da SIL Open Font License 1.1 ile lisanslı. Logoda ve ticari kullanımda serbest.

## 6. Yapılmayacaklar
- Esnetmeyin, sıkıştırmayın, döndürmeyin.
- Pikselleri yumuşatmayın, köşelerini yuvarlamayın; damlayı vektör olarak yeniden çizmeyin.
- Gözlerin rengini veya yerini değiştirmeyin; ağız, kaş gibi yüz öğeleri eklemeyin.
- Gölge, dış çizgi, degrade veya parlama efekti eklemeyin.
- Yatay yerleşimde sembolle yazının oranını ve arasındaki boşluğu değiştirmeyin.
- Yazıyı fontla yeniden yazmayın; master dosyayı kullanın.
- Hareketli ve karışık zeminlerde karo içindeki sürümü kullanın.

## 7. Notlar
- **Ticari marka:** Ticari marka taraması yapılmadı. Yayından önce profesyonel bir tarama yaptırın.
- **Allay adı:** Allay Mojang'ın (Minecraft) karakteridir. Sembol özgün bir çizimdir; yine de pazarlamada "Allay" adını kullanmayın.
