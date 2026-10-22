import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/i18n.dart';
import '../../state/auth_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/allay.dart';
import '../../widgets/ui.dart';
import '../share/open_link_sheet.dart';
import 'auth_screens.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final _page = PageController();
  int _index = 0;

  @override
  void dispose() {
    _page.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.isTr;
    final slides = [
      (LucideIcons.cloudUpload, t('Şifreli bulut', 'Encrypted cloud'),
          t('Dosyalarını yükle, her yerden eriş. Süreli ve şifreli bağlantılarla paylaş.', 'Upload once, reach it anywhere. Share with expiring, password-protected links.')),
      (LucideIcons.radar, t('Yakındaki cihazlar', 'Nearby devices'),
          t('Aynı odadaki telefon ve bilgisayarlara buluta uğramadan doğrudan gönder.', 'Send straight to phones and computers in the same room — no cloud in between.')),
      (LucideIcons.shieldCheck, t('Gizli ve güvenli', 'Private & secure'),
          t('Zararlı yazılım taraması, okununca yok olan bağlantılar ve indirme sınırları.', 'Malware scanning, burn-after-read links and download limits.')),
    ];

    return Scaffold(
      body: AuroraBackground(
        intense: true,
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 14, 14, 0),
                child: Row(children: [
                  const LogoRow(size: 32),
                  const Spacer(),
                  _LangSwitch(),
                ]),
              ),
              const Spacer(),
              const AllayMascot(size: 170)
                  .animate()
                  .fadeIn(duration: 700.ms)
                  .moveY(begin: 30, end: 0, curve: Curves.easeOutBack, duration: 900.ms),
              const SizedBox(height: 8),
              Text.rich(
                TextSpan(children: [
                  TextSpan(text: t('Dosyaları paylaş.\n', 'Share files.\n'), style: AppTheme.display(38)),
                  TextSpan(
                    text: t('Sadece.', 'Simply.'),
                    style: AppTheme.display(38, color: AppColors.accentText, style: FontStyle.italic),
                  ),
                ]),
                textAlign: TextAlign.center,
              ).animate().fadeIn(delay: 200.ms, duration: 600.ms).moveY(begin: 12, end: 0),
              const SizedBox(height: 18),
              SizedBox(
                height: 118,
                child: PageView.builder(
                  controller: _page,
                  itemCount: slides.length,
                  onPageChanged: (i) => setState(() => _index = i),
                  itemBuilder: (_, i) {
                    final (icon, title, body) = slides[i];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 22),
                      child: GlassCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(15),
                            ),
                            child: Icon(icon, color: AppColors.accentText),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15.5)),
                                const SizedBox(height: 4),
                                Text(body, style: TextStyle(color: AppColors.muted, fontSize: 13, height: 1.35)),
                              ],
                            ),
                          ),
                        ]),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  slides.length,
                  (i) => AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: i == _index ? 22 : 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: i == _index ? AppColors.accentText : AppColors.borderStrong,
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                ),
              ),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 0, 22, 8),
                child: Column(children: [
                  PrimaryButton(
                    label: t('Giriş yap', 'Sign in'),
                    icon: LucideIcons.logIn,
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                  ),
                  const SizedBox(height: 12),
                  SecondaryButton(
                    label: t('Ücretsiz hesap oluştur', 'Create a free account'),
                    icon: LucideIcons.sparkles,
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton.icon(
                        onPressed: () => context.read<AuthStore>().continueAsGuest(),
                        icon: Icon(LucideIcons.zap, size: 16, color: AppColors.accentText),
                        label: Text(t('Hesapsız hızlı aktarım', 'Quick transfer, no account'),
                            style: TextStyle(color: AppColors.accentText, fontWeight: FontWeight.w600)),
                      ),
                      Container(width: 1, height: 16, color: AppColors.border),
                      TextButton.icon(
                        onPressed: () => showOpenLinkSheet(context),
                        icon: Icon(LucideIcons.link, size: 16, color: AppColors.muted),
                        label: Text(t('Bağlantı aç', 'Open a link'), style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ]),
              ).animate().fadeIn(delay: 350.ms, duration: 600.ms).moveY(begin: 20, end: 0),
            ],
          ),
        ),
      ),
    );
  }
}

class _LangSwitch extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LocaleStore>();
    return Pressable(
      onTap: () => locale.setTr(!locale.isTr),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surface2.withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(LucideIcons.languages, size: 15, color: AppColors.muted),
          const SizedBox(width: 6),
          Text(locale.isTr ? 'TR' : 'EN', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
        ]),
      ),
    );
  }
}
