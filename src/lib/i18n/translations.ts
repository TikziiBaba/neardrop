export type Locale = "tr" | "en";

export const translations = {
  tr: {
    // ===== NAVBAR =====
    navbar: {
      product: "Ürün",
      howItWorks: "Nasıl Çalışır",
      security: "Güvenlik",
      faq: "SSS",
      login: "Giriş Yap",
      getStarted: "Başla",
      dashboard: "Panel",
      files: "Dosyalar",
      shared: "Paylaşılanlar",
      transfers: "Transferler",
      storage: "Depolama",
      settings: "Ayarlar",
      logout: "Çıkış Yap",
      sharedLinks: "Paylaşılan Linkler",
    },

    // ===== HERO SECTION =====
    hero: {
      badge: "NearDrop 1.0 — Dosya paylaşımı. Basitçe.",
      titleLine1: "Dosya paylaşımı.",
      titleLine2: "Basit & Güvenli.",
      subtitle:
        "Dosyalarınızı yükleyin. Opsiyonel şifre korumalı, süre sınırlı tahmin edilemez bir link oluşturun. Güvenilir ve şifreli depolama yerimiz ile doğrudan yüksek hızlı aktarım, karmaşıklık olmadan.",
      ctaPrimary: "Şimdi Paylaşmaya Başla",
      ctaSecondary: "Nasıl Çalışır?",
      check1: "Dosya boyutu kısıtlaması yok",
      check2: "Sıfır açık depolama riski",
      check3: "Süreli & şifreli linkler",
      dropzoneMockUrl: "aninda-paylasim.neardrop.bekirr.dev",
    },

    // ===== HOW IT WORKS =====
    howItWorks: {
      sectionLabel: "Basitleştirilmiş İş Akışı",
      title: "NearDrop Nasıl Çalışır",
      subtitle:
        "Karmaşık paneller veya şişirilmiş klasör hiyerarşileri yok. Sadece sorunsuz, üç adımlı dosya paylaşımı.",
      step1Num: "01",
      step1Title: "Dosyalarınızı Yükleyin",
      step1Desc:
        "Herhangi bir dosyayı veya klasörü sürükleyip bırakın. Yüksek hızlı doğrudan akış ile güvenli bulut depolama alanımıza aktarılır, bellek taşması olmadan.",
      step1Badge: "Parçalı Akış",
      step2Num: "02",
      step2Title: "Güvenlik & Linki Yapılandır",
      step2Desc:
        "Otomatik link süresi (1 saat - 30 gün), indirme limiti belirleyin ve isteğe bağlı SHA-256 şifre koruması ekleyin.",
      step2Badge: "Sıfır Bilgi Hash",
      step3Num: "03",
      step3Title: "Anında Paylaş",
      step3Desc:
        "Tahmin edilemez güvenli linkinizi kopyalayın veya mobil QR kodu oluşturun. Alıcılar geçici imzalı bağlantılar aracılığıyla doğrudan indirir.",
      step3Badge: "Hızlı Doğrudan İndirme",
    },

    // ===== FEATURES =====
    features: {
      sectionLabel: "Hız & Gizlilik İçin Tasarlandı",
      title: "Paylaşmak İçin İhtiyacınız Olan Her Şey",
      subtitle:
        "Sıkı güvenlik standartları, hafif mimari ve sorunsuz kullanıcı deneyimi ile tasarlandı.",
      blazingFastTitle: "Ultra Hızlı Yüklemeler",
      blazingFastDesc:
        "Doğrudan depolama presigned bağlantıları, ara web sunucularını atlar — maksimum aktarım hızı, sıfır bant genişliği kısıtlaması.",
      cryptoTokenTitle: "Kriptografik Paylaşım Token'ları",
      cryptoTokenDesc:
        "12 karakterli yüksek entropili rastgele token'lar tahmin veya taramayı önler. Her indirme geçici imzalı URL'ler ile korunur.",
      autoExpiryTitle: "Otomatik Link Süresi Dolumu",
      autoExpiryDesc:
        "Linkleri 1 saat, 24 saat veya özel süre sonrasında geçersiz olacak şekilde ayarlayın. Zamanlanmış temizlik, dosyaların sonsuza kadar kalmamasını garanti eder.",
      sha256Title: "SHA-256 Şifre Kilidi",
      sha256Desc:
        "Hassas transferleri isteğe bağlı şifrelerle koruyun. İstemci taraflı SHA-256 hash'leri ile doğrulanır — hiçbir zaman düz metin kullanılmaz.",
      r2StorageTitle: "Güvenilir & Yüksek Hızlı Bulut Depolama",
      r2StorageDesc:
        "Küresel yedekli, sıfır bant kısıtlamalı ve %99.999999999 dayanıklılığa sahip kurumsal düzeyde özel ve güvenli depolama yerimiz.",
      fileManagementTitle: "Eksiksiz Dosya Yönetimi",
      fileManagementDesc:
        "Checksum hash'lerini inceleyin, dosyaları yeniden adlandırın, gerçek zamanlı indirme sayaçlarını görüntüleyin, aktif linkleri tek tıkla iptal edin ve transfer geçmişini takip edin.",
    },

    // ===== SECURITY =====
    security: {
      badge: "Altyapı & Veri Güvenliği",
      title: "Derinlemesine Savunma Üzerine Kuruldu",
      subtitle:
        "NearDrop güvenliği basit, denetlenebilir ve güvenilir tutar — tarayıcıdan güvenilir depolama alanımıza kadar.",
      rlsTitle: "Satır Düzeyinde Güvenlik (RLS)",
      rlsDesc:
        "Veritabanı katmanında ayrıntılı kiracı izolasyonu uygulanır. Hiçbir kullanıcı başka bir kullanıcının dosya kayıtlarını görüntüleyemez, sorgulayamaz veya silemez.",
      signedUrlTitle: "Geçici İmzalı Bağlantılar",
      signedUrlDesc:
        "Özel depolama alanımız tamamen genel internetten izole edilmiştir. Dosya indirmeleri dakikalar içinde süresi dolan güvenli imzalı bağlantılar aracılığıyla sağlanır.",
      highEntropyTitle: "Yüksek Entropili Token URL'leri",
      highEntropyDesc:
        "Paylaşım linkleri 12 karakterlik kriptografik rastgele token'lar kullanır, brute-force tahmini pratikte imkansız kılar.",
      zeroKnowledgeTitle: "Sıfır Bilgi Şifre Hash'leme",
      zeroKnowledgeDesc:
        "Korunan paylaşımlar, istemci tarafından oluşturulan SHA-256 özetleri ile doğrulanır. Ham şifreler hiçbir zaman iletilmez veya veritabanında saklanmaz.",
      lifespanTitle: "Otomatik Yaşam Süresi Temizliği",
      lifespanDesc:
        "Zamanlanmış arka plan temizlik rutinleri, süresi dolmuş token'ları geçersiz kılar ve eski depolama nesnelerini otomatik olarak temizler.",
      egressTitle: "Sıkı Çıkış Kısıtlamaları",
      egressDesc:
        "Doğrudan tarayıcı-depolama akışı, ara sunucu tamponlamasını ortadan kaldırır ve bellek tabanlı veri sızdırma riskini azaltır.",
      archTitle: "Mimari Bir Bakışta",
      arch1Title: "1. Tarayıcı İstemcisi",
      arch1Desc:
        "Güvenli oturum açma ile kimlik doğrulaması yapar. Doğrudan yükleme veya indirme yetkilendirmesi ister.",
      arch2Title: "2. Güvenli Veri & Erişim Katmanı",
      arch2Desc:
        "Kullanıcı kimliğini doğrular, kota limitlerini kontrol eder, token üretir ve meta verileri yönetir.",
      arch3Title: "3. Özel Güvenli Depolama Alanı",
      arch3Desc:
        "İmzalı güvenli anahtarlar aracılığıyla doğrudan şifreli yük alır. Alıcı indirmesi için doğrudan akış sağlar.",
    },

    // ===== PRODUCT PREVIEW =====
    productPreview: {
      sectionLabel: "Ürün Önizleme",
      title: "Basitlik & Odak İçin Tasarlandı",
      subtitle:
        "NearDrop çalışma alanının içine bir göz atın. Temiz düzenler, anında geri bildirim ve sıfır karmaşıklık.",
      tabDashboard: "Panel",
      tabFiles: "Dosya Yöneticisi",
      tabShare: "Paylaşım Oluşturucu",
      tabTransfers: "Canlı Transferler",
      totalFiles: "Toplam Dosyalar",
      storageUsed: "Kullanılan Depolama",
      activeShares: "Aktif Paylaşımlar",
      totalDownloads: "Toplam İndirmeler",
      recentActivity: "Son Dosya Etkinliği",
      newFilesToday: "Bugün 3 yeni dosya",
      myCloudFiles: "Bulut Dosyalarım",
      filesCount: "5 dosya",
      today: "Bugün",
      yesterday: "Dün",
      activeLabel: "aktif",
      noShares: "Paylaşım yok",
      shareLabel: "Paylaş:",
      copied: "Kopyalandı",
      expiresIn24h: "24 saat içinde süresi dolar",
      passwordProtected: "Şifre Korumalı",
      remaining: "kalan",
    },

    // ===== FAQ =====
    faq: {
      sectionLabel: "Sıkça Sorulan Sorular",
      title: "Bilmeniz Gereken Her Şey",
      q1: "Alıcıların paylaşılan dosyaları indirmek için NearDrop hesabına ihtiyacı var mı?",
      a1: "Hayır. Tahmin edilemez linke sahip olan herkes, kayıt olmadan veya giriş yapmadan paylaşılan dosyayı hemen erişip indirebilir (şifre koyduysan şifreyi girmeleri yeterli).",
      q2: "Dosyalar ne kadar büyük olabilir?",
      a2: "NearDrop, güvenli presigned bağlantılar aracılığıyla doğrudan yüksek hızlı bulut depolama yerimize akış yükleme yapar, dosyaları sunucu belleğine yüklemeden. Tahsis edilen depolama kotanıza kadar büyük dosyalar yükleyebilirsiniz.",
      q3: "Paylaşım linkleri ne kadar süre aktif kalır?",
      a3: "Tam kontrol sizdedir. Linklerin 1 saat, 24 saat, 7 gün, 30 gün sonra veya hiçbir zaman sona ermesini ayarlayabilirsiniz. Link süresi dolduğunda, artık kimse erişemez.",
      q4: "Dosyalarım herkese açık veya arama motorları tarafından dizine eklenebilir mi?",
      a4: "Hayır. Bulut depolamanızdaki tüm dosyalar özeldir ve Satır Düzeyinde Güvenlik (RLS) ile korunur. Paylaşım linkleri herkese açık şekilde dizine alınmayan veya listellenmeyen yüksek entropili rastgele token'lar kullanır.",
      q5: "Paylaşılan bir dosyayı istediğim zaman iptal edebilir veya silebilir miyim?",
      a5: "Evet. Panelinizden veya Paylaşılanlar sekmesinden aktif herhangi bir linki anında devre dışı bırakabilir veya temel dosyayı silebilirsiniz; bu, dosyayı güvenli depolama yerimizden temizler ve ilişkili tüm linkleri geçersiz kılar.",
      q6: "Hangi depolama kotası dahildir?",
      a6: "Her yeni hesap varsayılan olarak 10 GB yüksek hızlı bulut depolama alır. Gerçek zamanlı kullanım ve kategori dağılımlarını Depolama sayfanızdan istediğiniz zaman takip edebilirsiniz.",
    },

    // ===== CTA =====
    cta: {
      badge: "Saniyeler İçinde Başlayın",
      title: "Dosyaları karmaşıklık olmadan paylaşmaya hazır mısınız?",
      subtitle:
        "Hesabınızı bugün oluşturun ve 10 GB ücretsiz bulut depolama ile ultra hızlı, güvenli dosya transferlerini deneyimleyin.",
      ctaPrimary: "Ücretsiz Hesap Oluştur",
      ctaSecondary: "Panel Demosunu Keşfet",
      trust: "Kredi kartı gerekmez • Anında aktivasyon • 10 GB ücretsiz kota",
    },

    // ===== FOOTER =====
    footer: {
      description:
        "Hızlı, özel ve güvenli dosya paylaşımı, karmaşıklık olmadan. Kurumsal düzeyde güvenli depolama mimarisi ve satır düzeyinde veri güvenliği ile desteklenmektedir.",
      systemsOperational: "Tüm sistemler çalışıyor",
      productTitle: "Ürün",
      instantDrop: "Anında Paylaşım",
      howItWorks: "Nasıl Çalışır",
      cloudDashboard: "Bulut Paneli",
      storageQuotas: "Depolama Kotaları",
      securityTitle: "Güvenlik",
      signedUrls: "Uçtan Uca İmzalı Bağlantılar",
      rls: "Satır Düzeyinde Güvenlik (RLS)",
      expiringLinks: "Süresi Dolan Linkler",
      passwordEncryption: "Şifre Şifreleme",
      privacyTitle: "Gizlilik & Güven",
      privacyPolicy: "Gizlilik Politikası",
      termsOfService: "Hizmet Şartları",
      zeroDataSelling: "Sıfır Veri Satışı",
      securityDisclosures: "Güvenlik Açıklamaları",
      copyright: "NearDrop Platformu. Tüm hakları saklıdır.",
      builtFor: "Sorunsuz dosya alışverişi için tasarlandı",
    },

    // ===== LOGIN =====
    login: {
      welcomeBack: "Tekrar hoş geldiniz",
      subtitle:
        "Dosyalarınızı, aktif paylaşım linklerinizi ve depolamanızı yönetmek için giriş yapın.",
      emailLabel: "E-posta Adresi",
      emailPlaceholder: "isim@ornek.com",
      passwordLabel: "Şifre",
      forgotPassword: "Şifremi unuttum?",
      loginButton: "Giriş Yap",
      loggingIn: "Giriş yapılıyor...",
      noAccount: "Hesabınız yok mu?",
      createAccount: "Hesap oluştur",
      fillAllFields: "Lütfen tüm alanları doldurun.",
      invalidCredentials: "Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.",
      welcomeToast: "NearDrop'a tekrar hoş geldiniz!",
      unexpectedError: "Beklenmeyen bir hata oluştu.",
    },

    // ===== REGISTER =====
    register: {
      createAccount: "Hesabınızı oluşturun",
      subtitle:
        "10 GB ücretsiz bulut depolama ile güvenli dosya paylaşımına başlayın.",
      displayNameLabel: "Görünen Ad",
      displayNamePlaceholder: "Adınız",
      emailLabel: "E-posta Adresi",
      emailPlaceholder: "isim@ornek.com",
      passwordLabel: "Şifre",
      passwordPlaceholder: "Minimum 6 karakter",
      confirmPasswordLabel: "Şifre Tekrar",
      confirmPasswordPlaceholder: "Şifrenizi tekrar girin",
      createButton: "Hesap Oluştur",
      creatingAccount: "Hesap oluşturuluyor...",
      alreadyHaveAccount: "Zaten hesabınız var mı?",
      loginLink: "Giriş yap",
      fillAllFields: "Lütfen tüm alanları doldurun.",
      passwordsMismatch: "Şifreler eşleşmiyor.",
      passwordTooShort: "Şifre en az 6 karakter olmalıdır.",
      accountCreated: "Hesap başarıyla oluşturuldu! NearDrop'a hoş geldiniz.",
      registrationFailed: "Hesap oluşturulamadı.",
    },

    // ===== DASHBOARD =====
    dashboard: {
      welcomeBack: "Tekrar hoş geldiniz,",
      subtitle:
        "Dosya yükleyin, güvenli bulut paylaşımlarınızı yönetin ve indirmeleri gerçek zamanlı takip edin.",
      viewAllFiles: "Tüm Dosyaları Gör",
      filesStored: "Saklanan Dosyalar",
      cloudStorage: "Bulut Depolama",
      activeShares: "Aktif Paylaşımlar",
      totalDownloads: "Toplam İndirmeler",
      instantCloudUpload: "Anında Bulut Yükleme",
      encryptedR2Storage: "Güvenli & Şifreli Depolama",
      recentFiles: "Son Dosyalar",
      browseAll: "Hepsini gör",
      noFilesTitle: "Henüz dosya yüklenmemiş",
      noFilesDesc:
        "Tahmin edilemez linklerle paylaşmaya başlamak için yukarıdaki alana dosya sürükleyip bırakın.",
      share: "Paylaş",
      activeSharesTitle: "Aktif Paylaşımlar",
      manage: "Yönet",
      noActiveShares: "Aktif paylaşım linki yok",
      noActiveSharesDesc:
        "Bir paylaşım linki oluşturmak için panelinizden herhangi bir dosyayı seçin.",
      sharedFile: "Paylaşılan Dosya",
      locked: "Kilitli",
    },

    // ===== DROPZONE =====
    dropzone: {
      dropHere: "Dosyaları veya klasörleri buraya bırakın",
      dragDropHint: "Dosya veya klasörleri sürükleyip bırakın",
      r2Description: "Dosyalar ve klasörler güvenli depolama yerimizde uçtan uca korunur. Kota dahilinde sınırsız aktarım hızı.",
      chooseFiles: "Dosya Seç",
      uploadFolder: "Klasör Yükle",
      encrypted: "Uçtan uca şifreli",
      directStreaming: "Doğrudan akış",
      unlimitedSpeed: "Sınırsız hız",
      uploading: "Yükleniyor",
      streamingToR2: "Güvenli depolamaya aktarılıyor",
      cancel: "İptal",
    },

    // ===== FILES PAGE =====
    filesPage: {
      title: "Dosyalarım",
      subtitle: "Kayıtlı tüm dosya ve klasörlerinizi inceleyin, arayın, yeniden adlandırın, indirin ve paylaşım linkleri oluşturun.",
      uploadFiles: "Dosya Yükle",
      uploadFolder: "Klasör Yükle",
      searchPlaceholder: "Dosya veya klasör ara...",
      noFilesFound: "Henüz dosya bulunamadı",
      noFilesFoundDesc: "Paylaşmaya başlamak için dosya veya klasör yükleyin.",
      noFilesMatchSearch: "Aramanızla eşleşen dosya veya klasör bulunamadı.",
      dropHere: "Dosya veya klasörleri buraya bırakın",
      dropDesc: "Klasörler ve tüm alt klasörler taranarak doğrudan güvenilir depolama alanımıza yüklenecektir.",
      allFilesRoot: "Kök Dizin",
      folders: "Klasörler",
      files: "Dosyalar",
      goUp: "Üst Dizine Dön",
      emptyFolder: "Bu klasör boş",
      items: "öğe",
      item: "öğe",
      searchingInAllFolders: "Tüm klasörlerde arama yapılıyor",
    },

    // ===== NOT FOUND =====
    notFound: {
      title: "404",
      subtitle: "Sayfa bulunamadı",
      description:
        "Takip ettiğiniz link bozuk olabilir veya sayfa kaldırılmış olabilir.",
      backButton: "NearDrop'a Dön",
    },

    // ===== LANGUAGE TOGGLE =====
    langToggle: {
      label: "Dili Değiştir",
    },

    // ===== PUBLIC SHARE PAGE =====
    publicShare: {
      secureCloudShare: "Güvenli Bulut Paylaşımı",
      fileSharedWithYou: "Sizinle Paylaşılan Dosya",
      folderSharedWithYou: "Sizinle Paylaşılan Klasör",
      encryptedSubtitle: "Güvenilir depolama yerimiz ve geçici imzalı bağlantılar ile şifreli transfer.",
      passwordProtected: "Şifre Korumalı",
      enterPasswordLabel: "Kilidi Açmak İçin Şifreyi Girin",
      enterPasswordPlaceholder: "Şifrenizi girin...",
      downloadInitiated: "İndirme Başlatıldı",
      browserDidNotStart: "Tarayıcınız indirmeyi otomatik başlatmadıysa:",
      clickToRedownload: "Tekrar indirmek için tıklayın",
      downloadFile: "Dosyayı İndir",
      downloadZip: "ZIP Olarak İndir",
      downloadingZip: "ZIP İndiriliyor...",
      verifying: "Doğrulanıyor & çözülüyor...",
      linkUnavailable: "Link Kullanılamıyor",
      goToHome: "NearDrop Ana Sayfasına Git",
      footerTagline: "NearDrop • Güvenli Uçtan Uca Dosya Alışverişi",
    },

    // ===== GLOBAL TRANSFER WIDGET =====
    transferWidget: {
      activeTransfers: "Aktif Transferler",
      uploadingCount: "dosya yükleniyor",
      allUploadsCompleted: "Tüm yüklemeler tamamlandı",
      uploadProgress: "Yükleme İlerlemesi",
      cancelAll: "Hepsini İptal Et",
      clearCompleted: "Temizle",
      minimize: "Küçült",
      expand: "Genişlet",
      cancelUpload: "İptal Et",
      retry: "Tekrar Dene",
      completed: "Tamamlandı",
      failed: "Başarısız",
      cancelled: "İptal Edildi",
      speed: "Hız",
      remaining: "Kalan Süre",
      totalTransferred: "Toplam Aktarılan",
    },
  },

  en: {
    // ===== NAVBAR =====
    navbar: {
      product: "Product",
      howItWorks: "How It Works",
      security: "Security",
      faq: "FAQ",
      login: "Log in",
      getStarted: "Get Started",
      dashboard: "Dashboard",
      files: "Files",
      shared: "Shared",
      transfers: "Transfers",
      storage: "Storage",
      settings: "Settings",
      logout: "Log out",
      sharedLinks: "Shared Links",
    },

    // ===== HERO SECTION =====
    hero: {
      badge: "NearDrop 1.0 — Share files. Simply.",
      titleLine1: "Share files.",
      titleLine2: "Simply & Securely.",
      subtitle:
        "Upload your files. Generate an unguessable expiring link with optional password protection. Direct high-speed streaming through our dedicated secure cloud storage without the clutter.",
      ctaPrimary: "Start Sharing Now",
      ctaSecondary: "See How It Works",
      check1: "No file size bottlenecks",
      check2: "Zero public bucket exposure",
      check3: "Expiring & password links",
      dropzoneMockUrl: "instant-drop.neardrop.bekirr.dev",
    },

    // ===== HOW IT WORKS =====
    howItWorks: {
      sectionLabel: "Streamlined Workflow",
      title: "How NearDrop Works",
      subtitle:
        "No convoluted dashboards or bloated folder hierarchies. Just seamless, three-step file sharing.",
      step1Num: "01",
      step1Title: "Upload Your Files",
      step1Desc:
        "Drag and drop any file or entire folder. High-speed streaming uploads directly to our secure cloud storage without memory bloat.",
      step1Badge: "Chunked Stream",
      step2Num: "02",
      step2Title: "Configure Security & Link",
      step2Desc:
        "Set automatic link expiration (1h to 30d), set download limits, and optionally add SHA-256 password protection.",
      step2Badge: "Zero-Knowledge Hash",
      step3Num: "03",
      step3Title: "Share Instantly",
      step3Desc:
        "Copy your unguessable secure link or generate a mobile QR code. Recipients download directly through temporary signed URLs.",
      step3Badge: "Fast Direct Download",
    },

    // ===== FEATURES =====
    features: {
      sectionLabel: "Engineered for Speed & Privacy",
      title: "Everything You Need to Share",
      subtitle:
        "Engineered with strict security standards, lightweight architecture, and frictionless user experience.",
      blazingFastTitle: "Blazing Fast Uploads",
      blazingFastDesc:
        "Direct-to-storage presigned upload URLs bypass intermediary web servers for maximum throughput and zero bandwidth throttling.",
      cryptoTokenTitle: "Cryptographic Share Tokens",
      cryptoTokenDesc:
        "Random 12-character high-entropy tokens prevent guessing or crawling. Each download is protected by temporary signed URLs.",
      autoExpiryTitle: "Automatic Link Expiration",
      autoExpiryDesc:
        "Set links to vanish after 1 hour, 24 hours, or custom duration. Scheduled cleanup guarantees files do not linger forever.",
      sha256Title: "SHA-256 Password Lock",
      sha256Desc:
        "Protect sensitive transfers with optional passwords. Stored using client-verified SHA-256 hashes—never plaintext.",
      r2StorageTitle: "High-Speed Secure Cloud Storage",
      r2StorageDesc:
        "Built on enterprise-grade isolated cloud storage with global edge replication, zero egress bottlenecks, and 99.999999999% durability.",
      fileManagementTitle: "Complete File Management",
      fileManagementDesc:
        "Inspect checksum hashes, rename files, view real-time download counters, revoke active links in 1-click, and track transfer history.",
    },

    // ===== SECURITY =====
    security: {
      badge: "Infrastructure & Data Safety",
      title: "Built on Defense in Depth",
      subtitle:
        "NearDrop keeps security straightforward, auditable, and reliable from browser to our dedicated cloud storage vault.",
      rlsTitle: "Row Level Security (RLS)",
      rlsDesc:
        "Granular tenant isolation is enforced at the database layer. No user can view, query, or delete another user's file records.",
      signedUrlTitle: "Temporary Signed URLs",
      signedUrlDesc:
        "Our private storage vault is completely isolated from public internet. File downloads are granted through signed URLs that expire within minutes.",
      highEntropyTitle: "High-Entropy Token URLs",
      highEntropyDesc:
        "Share links use 12-character cryptographically random tokens, making brute-force enumeration practically impossible.",
      zeroKnowledgeTitle: "Zero-Knowledge Password Hashing",
      zeroKnowledgeDesc:
        "Protected shares verify access using client-generated SHA-256 digests. Raw passwords are never transmitted or stored in the database.",
      lifespanTitle: "Automated Lifespan Cleanup",
      lifespanDesc:
        "Scheduled backend cleanup routines invalidate expired tokens and purge stale storage objects automatically.",
      egressTitle: "Strict Egress Restrictions",
      egressDesc:
        "Direct browser-to-storage streaming eliminates intermediary server buffering and reduces risk of memory-based data exfiltration.",
      archTitle: "Architecture at a Glance",
      arch1Title: "1. Browser Client",
      arch1Desc:
        "Authenticates securely via encrypted session tokens. Requests presigned upload or download authorization.",
      arch2Title: "2. Access & Security Layer",
      arch2Desc:
        "Validates user identity, verifies quota limits, generates tokens, and manages metadata.",
      arch3Title: "3. Dedicated Storage Vault",
      arch3Desc:
        "Receives encrypted payload directly via temporary signed tokens. Direct streaming for recipient download.",
    },

    // ===== PRODUCT PREVIEW =====
    productPreview: {
      sectionLabel: "Product Preview",
      title: "Designed for Simplicity & Focus",
      subtitle:
        "Take a look inside the NearDrop workspace. Clean layouts, instant feedback, and zero clutter.",
      tabDashboard: "Dashboard",
      tabFiles: "File Manager",
      tabShare: "Share Creator",
      tabTransfers: "Live Transfers",
      totalFiles: "Total Files",
      storageUsed: "Storage Used",
      activeShares: "Active Shares",
      totalDownloads: "Total Downloads",
      recentActivity: "Recent File Activity",
      newFilesToday: "3 new files today",
      myCloudFiles: "My Cloud Files",
      filesCount: "5 files",
      today: "Today",
      yesterday: "Yesterday",
      activeLabel: "active",
      noShares: "No shares",
      shareLabel: "Share:",
      copied: "Copied",
      expiresIn24h: "Expires in 24h",
      passwordProtected: "Password Protected",
      remaining: "remaining",
    },

    // ===== FAQ =====
    faq: {
      sectionLabel: "Frequently Asked Questions",
      title: "Everything You Need to Know",
      q1: "Do recipients need a NearDrop account to download shared files?",
      a1: "No. Anyone with the unguessable link can access and download the shared file immediately without registering or logging in (unless you set a password, in which case they only need to enter the password).",
      q2: "How large can files be?",
      a2: "NearDrop streams uploads directly to our secure cloud storage via presigned URLs without loading entire files into server memory. You can upload large files up to your allocated storage quota limit.",
      q3: "How long do share links remain active?",
      a3: "You have full control. You can set links to expire in 1 hour, 24 hours, 7 days, 30 days, or never. Once a link expires, it can no longer be accessed by anyone.",
      q4: "Are my files public or indexable by search engines?",
      a4: "No. All files in your cloud storage are private and protected by strict Row Level Security (RLS). Share links use high-entropy random tokens that are never publicly indexed or listed.",
      q5: "Can I revoke or delete a shared file at any time?",
      a5: "Yes. From your dashboard or Shared tab, you can disable any active link instantly or delete the underlying file, which purges the file from secure cloud storage and invalidates all associated links.",
      q6: "What storage quota is included?",
      a6: "Every new account receives 10 GB of high-speed cloud storage by default. You can track real-time usage and category breakdowns anytime on your Storage page.",
    },

    // ===== CTA =====
    cta: {
      badge: "Get Started in Seconds",
      title: "Ready to share files without the clutter?",
      subtitle:
        "Create your account today and experience ultra-fast, secure file transfers with 10 GB free cloud storage.",
      ctaPrimary: "Create Free Account",
      ctaSecondary: "Explore Dashboard Demo",
      trust: "No credit card required • Instant activation • 10 GB free quota",
    },

    // ===== FOOTER =====
    footer: {
      description:
        "Fast, private, and secure file sharing without the clutter. Powered by dedicated secure cloud storage architecture and row-level security.",
      systemsOperational: "All systems operational",
      productTitle: "Product",
      instantDrop: "Instant Drop",
      howItWorks: "How it works",
      cloudDashboard: "Cloud Dashboard",
      storageQuotas: "Storage Quotas",
      securityTitle: "Security",
      signedUrls: "End-to-End Signed URLs",
      rls: "Row Level Security (RLS)",
      expiringLinks: "Expiring Links",
      passwordEncryption: "Password Encryption",
      privacyTitle: "Privacy & Trust",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      zeroDataSelling: "Zero Data Selling",
      securityDisclosures: "Security Disclosures",
      copyright: "NearDrop Platform. All rights reserved.",
      builtFor: "Built for seamless file exchange",
    },

    // ===== LOGIN =====
    login: {
      welcomeBack: "Welcome back",
      subtitle:
        "Log in to manage your files, active share links, and storage.",
      emailLabel: "Email Address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      forgotPassword: "Forgot password?",
      loginButton: "Log in",
      loggingIn: "Logging in...",
      noAccount: "Don\u2019t have an account?",
      createAccount: "Create account",
      fillAllFields: "Please fill in all fields.",
      invalidCredentials: "Invalid credentials. Please try again.",
      welcomeToast: "Welcome back to NearDrop!",
      unexpectedError: "An unexpected error occurred.",
    },

    // ===== REGISTER =====
    register: {
      createAccount: "Create your account",
      subtitle:
        "Start sharing files securely with 10 GB free cloud storage.",
      displayNameLabel: "Display Name",
      displayNamePlaceholder: "Your Name",
      emailLabel: "Email Address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Minimum 6 characters",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Repeat your password",
      createButton: "Create Account",
      creatingAccount: "Creating account...",
      alreadyHaveAccount: "Already have an account?",
      loginLink: "Log in",
      fillAllFields: "Please complete all fields.",
      passwordsMismatch: "Passwords do not match.",
      passwordTooShort: "Password must be at least 6 characters.",
      accountCreated: "Account created successfully! Welcome to NearDrop.",
      registrationFailed: "Failed to create account.",
    },

    // ===== DASHBOARD =====
    dashboard: {
      welcomeBack: "Welcome back,",
      subtitle:
        "Upload files, manage your secure cloud shares, and track downloads in real time.",
      viewAllFiles: "View All Files",
      filesStored: "Files Stored",
      cloudStorage: "Cloud Storage",
      activeShares: "Active Shares",
      totalDownloads: "Total Downloads",
      instantCloudUpload: "Instant Cloud Upload",
      encryptedR2Storage: "Encrypted Secure Storage",
      recentFiles: "Recent Files",
      browseAll: "Browse all",
      noFilesTitle: "No files uploaded yet",
      noFilesDesc:
        "Drag and drop files above to start sharing with unguessable links.",
      share: "Share",
      activeSharesTitle: "Active Shares",
      manage: "Manage",
      noActiveShares: "No active share links",
      noActiveSharesDesc:
        "Select any file from your dashboard to create a share link.",
      sharedFile: "Shared File",
      locked: "Locked",
    },

    // ===== DROPZONE =====
    dropzone: {
      dropHere: "Drop files or folders here",
      dragDropHint: "Drag & drop files or folders",
      r2Description: "Files and folders are securely encrypted and stored in our dedicated cloud storage. Up to available quota.",
      chooseFiles: "Choose Files",
      uploadFolder: "Upload Folder",
      encrypted: "End-to-end encrypted",
      directStreaming: "Direct streaming",
      unlimitedSpeed: "Unlimited speed",
      uploading: "Uploading",
      streamingToR2: "Streaming to secure storage",
      cancel: "Cancel",
    },

    // ===== FILES PAGE =====
    filesPage: {
      title: "My Files",
      subtitle: "Browse, search, rename, download, and create share links for all stored files and folders.",
      uploadFiles: "Upload Files",
      uploadFolder: "Upload Folder",
      searchPlaceholder: "Search files or folders by name...",
      noFilesFound: "No files found",
      noFilesFoundDesc: "Upload your first file or entire folder to get started.",
      noFilesMatchSearch: "No files or folders match your search query.",
      dropHere: "Drop files or folders here",
      dropDesc: "Folders and nested subfolders will be scanned and uploaded directly to secure cloud storage.",
      allFilesRoot: "All Files",
      folders: "Folders",
      files: "Files",
      goUp: "Go up",
      emptyFolder: "This folder is empty",
      items: "items",
      item: "item",
      searchingInAllFolders: "Searching across all folders",
    },

    // ===== NOT FOUND =====
    notFound: {
      title: "404",
      subtitle: "Page not found",
      description:
        "The link you followed may be broken or the page may have been removed.",
      backButton: "Back to NearDrop",
    },

    // ===== LANGUAGE TOGGLE =====
    langToggle: {
      label: "Switch Language",
    },

    // ===== PUBLIC SHARE PAGE =====
    publicShare: {
      secureCloudShare: "Secure Cloud Share",
      fileSharedWithYou: "File Shared with You",
      folderSharedWithYou: "Folder Shared with You",
      encryptedSubtitle: "Encrypted transfer powered by dedicated secure cloud storage and temporary signed links.",
      passwordProtected: "Password Protected",
      enterPasswordLabel: "Enter Password to Unlock",
      enterPasswordPlaceholder: "Enter password...",
      downloadInitiated: "Download Initiated",
      browserDidNotStart: "If your browser did not start the download automatically:",
      clickToRedownload: "Click here to re-download",
      downloadFile: "Download File",
      downloadZip: "Download as ZIP",
      downloadingZip: "Downloading ZIP...",
      verifying: "Verifying & decrypting...",
      linkUnavailable: "Link Unavailable",
      goToHome: "Go to NearDrop Home",
      footerTagline: "NearDrop • Secure End-to-End File Exchange",
    },

    // ===== GLOBAL TRANSFER WIDGET =====
    transferWidget: {
      activeTransfers: "Active Transfers",
      uploadingCount: "files uploading",
      allUploadsCompleted: "All uploads completed",
      uploadProgress: "Upload Progress",
      cancelAll: "Cancel All",
      clearCompleted: "Clear",
      minimize: "Minimize",
      expand: "Expand",
      cancelUpload: "Cancel Upload",
      retry: "Retry",
      completed: "Completed",
      failed: "Failed",
      cancelled: "Cancelled",
      speed: "Speed",
      remaining: "Remaining",
      totalTransferred: "Total Transferred",
    },
  },
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

// Type helper for translation keys
export type TranslationKeys = DeepString<typeof translations.tr>;
