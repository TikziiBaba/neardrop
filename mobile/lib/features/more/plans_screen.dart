import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../core/api.dart';
import '../../core/config.dart';
import '../../core/i18n.dart';
import '../../state/auth_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/allay.dart';
import '../../widgets/ui.dart';
import 'web_pages.dart';

/// lib/subscription/plans.ts (getPricingPlans) ile aynı içerik.
class Plan {
  final String id;
  final String name;
  final String tagline;
  final String quota;
  final int monthly;
  final int yearly;
  final List<String> features;
  final String? badge;
  const Plan(this.id, this.name, this.tagline, this.quota, this.monthly, this.yearly, this.features, [this.badge]);
}

List<Plan> plans() => [
      Plan('free', t('Ücretsiz Başlangıç', 'Free Starter'), t('Kişisel kullanım için temel güvenli bulut depolama.', 'Essential secure cloud storage for personal use.'),
          '2 GB', 0, 0, [
        t('2 GB güvenli bulut depolama', '2 GB secure cloud storage'),
        t('2 GB\'a kadar tek dosya', 'Up to 2 GB single file upload'),
        t('1 aktif paylaşım bağlantısı', '1 active share link'),
        t('12 saate kadar bağlantı ömrü', 'Up to 12 hours link lifespan'),
        t('Sınırsız doğrudan aktarım', 'Unlimited direct transfers'),
        t('Fotoğraf ve video önizleme', 'Photo & video preview'),
      ]),
      Plan('pro', 'Pro Bulut', t('Genişletilmiş depolama, parola koruması ve yüksek hızlı aktarım.', 'Expanded storage, password protection, and high-speed delivery.'),
          '100 GB', 99, 990, [
        t('100 GB güvenli bulut depolama', '100 GB secure cloud storage'),
        t('5 GB\'a kadar tek dosya', 'Up to 5 GB single file upload'),
        t('Sınırsız aktif paylaşım bağlantısı', 'Unlimited active share links'),
        t('7 güne kadar bağlantı ömrü', 'Up to 7 days link lifespan'),
        t('Şifre korumalı bağlantılar', 'Password-protected links'),
        t('Özel indirme sınırları', 'Custom download limits'),
        t('Klasör paylaşımı ve toplu ZIP', 'Folder sharing & bulk ZIP'),
        t('Öncelikli destek (< 12 saat)', 'Priority support (< 12 hours)'),
      ], t('En Popüler', 'Most Popular')),
      Plan('ultra', t('Ultra İçerik Üretici', 'Ultra Creator'),
          t('İçerik üreticileri ve profesyoneller için yüksek bant genişliği.', 'Massive bandwidth for creators & professionals.'), '500 GB', 249, 2490, [
        t('500 GB bulut depolama', '500 GB cloud storage'),
        t('25 GB\'a kadar tek dosya', 'Up to 25 GB single file upload'),
        t('30 güne kadar veya kalıcı bağlantılar', 'Up to 30 days or permanent links'),
        t('Ayrıntılı bağlantı analitiği', 'Detailed link analytics'),
        t('Özel indirme sayfası markalama', 'Custom download page branding'),
        t('VIP destek (< 4 saat)', 'VIP support (< 4 hours)'),
      ], t('Üreticiler İçin', 'For Creators')),
      Plan('enterprise', t('Kurumsal Sınırsız', 'Enterprise Infinite'),
          t('Sınırsız ölçek, kalıcı bağlantılar, özel alan adları ve 7/24 SLA.', 'Unlimited scale, permanent links, custom domains and 24/7 SLA.'), '2 TB', 599, 5990, [
        t('2 TB kurumsal kapasite', '2 TB enterprise capacity'),
        t('Kalıcı ve süresiz bağlantılar', 'Permanent share links'),
        t('Özel alan adı', 'Custom domain'),
        t('Takım yönetimi ve rol izinleri', 'Team management & RBAC'),
        t('Güvenlik denetim günlüğü dışa aktarma', 'Security audit log export'),
        t('7/24 özel müşteri temsilcisi', '24/7 dedicated account manager'),
      ], t('Maksimum Güç', 'Maximum Power')),
    ];

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  bool _yearly = false;

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AuthStore>().profile;
    final current = p?.subscriptionTier ?? 'free';
    return Scaffold(
      appBar: AppBar(title: Text(t('Planlar', 'Plans'))),
      body: AuroraBackground(
        intense: true,
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
            children: [
              Text.rich(
                TextSpan(children: [
                  TextSpan(text: t('Sana uygun ', 'Pick the '), style: AppTheme.display(30)),
                  TextSpan(text: t('planı seç', 'right plan'), style: AppTheme.display(30, color: AppColors.accentText, style: FontStyle.italic)),
                ]),
              ),
              const SizedBox(height: 6),
              Text(t('İstediğin zaman yükselt ya da iptal et.', 'Upgrade or cancel anytime.'), style: TextStyle(color: AppColors.muted)),
              const SizedBox(height: 18),
              Center(
                child: SegmentedButton<bool>(
                  showSelectedIcon: false,
                  segments: [
                    ButtonSegment(value: false, label: Text(t('Aylık', 'Monthly'))),
                    ButtonSegment(value: true, label: Text(t('Yıllık · 2 ay hediye', 'Yearly · 2 months free'))),
                  ],
                  selected: {_yearly},
                  onSelectionChanged: (v) => setState(() => _yearly = v.first),
                ),
              ),
              const SizedBox(height: 18),
              ...plans().asMap().entries.map((e) {
                final plan = e.value;
                final isCurrent = plan.id == current;
                final price = _yearly ? plan.yearly : plan.monthly;
                final popular = plan.id == 'pro';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: GlassCard(
                    glow: popular,
                    borderColor: popular ? AppColors.accentText.withValues(alpha: 0.6) : (isCurrent ? AppColors.success.withValues(alpha: 0.5) : null),
                    gradient: popular
                        ? LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [AppColors.accent.withValues(alpha: 0.28), AppColors.surface.withValues(alpha: 0.9)],
                          )
                        : null,
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Expanded(child: Text(plan.name, style: AppTheme.display(21))),
                        if (isCurrent)
                          Pill(t('Mevcut plan', 'Current plan'), color: AppColors.success, icon: LucideIcons.check)
                        else if (plan.badge != null)
                          Pill(plan.badge!, color: popular ? AppColors.accentText : AppColors.warning),
                      ]),
                      const SizedBox(height: 4),
                      Text(plan.tagline, style: TextStyle(color: AppColors.muted, fontSize: 13)),
                      const SizedBox(height: 14),
                      Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                        Text(price == 0 ? t('Ücretsiz', 'Free') : '₺$price', style: AppTheme.display(34)),
                        if (price > 0)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 6, left: 4),
                            child: Text(_yearly ? t('/yıl', '/year') : t('/ay', '/month'), style: TextStyle(color: AppColors.subtle)),
                          ),
                        const Spacer(),
                        Pill(plan.quota, color: AppColors.accentText, icon: LucideIcons.hardDrive),
                      ]),
                      const SizedBox(height: 14),
                      ...plan.features.map((f) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Icon(LucideIcons.check, size: 16, color: AppColors.success),
                              const SizedBox(width: 10),
                              Expanded(child: Text(f, style: const TextStyle(fontSize: 13.5))),
                            ]),
                          )),
                      if (plan.id != 'free' && !isCurrent) ...[
                        const SizedBox(height: 8),
                        popular
                            ? PrimaryButton(
                                label: t('${plan.name} seç', 'Choose ${plan.name}'),
                                icon: LucideIcons.arrowRight,
                                onPressed: () => _checkout(plan),
                              )
                            : SecondaryButton(
                                label: t('${plan.name} seç', 'Choose ${plan.name}'),
                                icon: LucideIcons.arrowRight,
                                onPressed: () => _checkout(plan),
                              ),
                      ],
                    ]),
                  ).animate().fadeIn(delay: (60 * e.key).ms, duration: 400.ms).moveY(begin: 14, end: 0),
                );
              }),
              const SizedBox(height: 6),
              Center(
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(LucideIcons.shieldCheck, size: 15, color: AppColors.subtle),
                  const SizedBox(width: 6),
                  Text(t('Ödemeler PayTR 3D Secure ile alınır', 'Payments are processed by PayTR 3D Secure'),
                      style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                ]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _checkout(Plan plan) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => CheckoutScreen(plan: plan, yearly: _yearly)));
  }
}

/// Web'deki /checkout: fatura bilgileri → PayTR token → 3D Secure ödeme sayfası.
class CheckoutScreen extends StatefulWidget {
  final Plan plan;
  final bool yearly;
  const CheckoutScreen({super.key, required this.plan, required this.yearly});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late final _name = TextEditingController(text: context.read<AuthStore>().profile?.displayName);
  final _phone = TextEditingController();
  final _city = TextEditingController(text: 'İstanbul');
  bool _agreed = false;
  bool _loading = false;

  Future<void> _start() async {
    final digits = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10) {
      showToast(context, t('3D Secure SMS onayı için geçerli bir cep telefonu girin.', 'Enter a valid mobile number for 3D Secure SMS.'), error: true);
      return;
    }
    if (!_agreed) {
      showToast(context, t('Mesafeli satış ve ön bilgilendirme şartlarını onaylayın.', 'Please accept the distance sales terms.'), error: true);
      return;
    }
    final p = context.read<AuthStore>().profile!;
    setState(() => _loading = true);
    try {
      final res = await Api.post('/api/payment/paytr/token', {
        'userId': p.id,
        'userEmail': p.email,
        'userName': _name.text.trim().isEmpty ? p.email.split('@').first : _name.text.trim(),
        'userPhone': digits,
        'userAddress': '${_city.text.trim()}, Türkiye',
        'planId': widget.plan.id,
        'billingCycle': widget.yearly ? 'yearly' : 'monthly',
      });
      final token = res['token'] as String?;
      if (token == null || !mounted) return;
      final result = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => _PaytrScreen(token: token)));
      if (!mounted || result == null) return;
      if (result) {
        await context.read<AuthStore>().refreshProfile();
        if (!mounted) return;
        await showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            content: Column(mainAxisSize: MainAxisSize.min, children: [
              const AllayMascot(size: 100, excited: true),
              const SizedBox(height: 10),
              Text(t('Ödeme alındı!', 'Payment received!'), style: AppTheme.display(22)),
              const SizedBox(height: 8),
              Text(
                t('${widget.plan.name} planın birkaç saniye içinde etkinleşir.', 'Your ${widget.plan.name} plan activates in a few seconds.'),
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.muted),
              ),
            ]),
            actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            actions: [PrimaryButton(label: t('Harika', 'Great'), height: 46, onPressed: () => Navigator.pop(ctx))],
          ),
        );
        if (mounted) Navigator.pop(context);
      } else {
        showToast(context, t('Ödeme tamamlanamadı. Tekrar deneyebilirsin.', 'Payment failed. You can try again.'), error: true);
      }
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final price = widget.yearly ? widget.plan.yearly : widget.plan.monthly;
    return Scaffold(
      appBar: AppBar(title: Text(t('Ödeme', 'Checkout'))),
      body: AuroraBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
            children: [
              GlassCard(
                glow: true,
                child: Row(children: [
                  Icon(LucideIcons.crown, color: AppColors.warning, size: 30),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(widget.plan.name, style: AppTheme.display(20)),
                      Text('${widget.plan.quota} · ${widget.yearly ? t('Yıllık', 'Yearly') : t('Aylık', 'Monthly')}',
                          style: TextStyle(color: AppColors.muted)),
                    ]),
                  ),
                  Text('₺$price', style: AppTheme.display(26, color: AppColors.accentText)),
                ]),
              ),
              const SizedBox(height: 18),
              TextField(controller: _name, decoration: InputDecoration(labelText: t('Ad soyad', 'Full name'), prefixIcon: const Icon(LucideIcons.user, size: 18))),
              const SizedBox(height: 12),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9 +]'))],
                decoration: InputDecoration(labelText: t('Cep telefonu', 'Mobile phone'), hintText: '05xx xxx xx xx', prefixIcon: const Icon(LucideIcons.phone, size: 18)),
              ),
              const SizedBox(height: 12),
              TextField(controller: _city, decoration: InputDecoration(labelText: t('Şehir', 'City'), prefixIcon: const Icon(LucideIcons.mapPin, size: 18))),
              const SizedBox(height: 12),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
                value: _agreed,
                activeColor: AppColors.accent,
                onChanged: (v) => setState(() => _agreed = v ?? false),
                title: Text(t('Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu\'nu okudum, onaylıyorum.',
                    'I have read and accept the Distance Sales Agreement and Preliminary Information Form.'), style: const TextStyle(fontSize: 13)),
              ),
              Row(children: [
                TextButton(onPressed: () => openWebPage(context, '/terms'), child: Text(t('Şartlar', 'Terms'))),
                TextButton(onPressed: () => openWebPage(context, '/privacy'), child: Text(t('Gizlilik', 'Privacy'))),
              ]),
              const SizedBox(height: 8),
              PrimaryButton(label: t('Güvenli ödemeye geç', 'Continue to secure payment'), icon: LucideIcons.lock, loading: _loading, onPressed: _start),
            ],
          ),
        ),
      ),
    );
  }
}

class _PaytrScreen extends StatefulWidget {
  final String token;
  const _PaytrScreen({required this.token});

  @override
  State<_PaytrScreen> createState() => _PaytrScreenState();
}

class _PaytrScreenState extends State<_PaytrScreen> {
  late final WebViewController _controller;
  int _progress = 0;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(NavigationDelegate(
        onProgress: (p) => setState(() => _progress = p),
        onNavigationRequest: (req) {
          // PayTR başarı/başarısızlıkta sitenin /checkout?status= adresine yönlendirir
          final uri = Uri.parse(req.url);
          if (req.url.startsWith(AppConfig.appUrl) && uri.path.startsWith('/checkout')) {
            Navigator.pop(context, uri.queryParameters['status'] == 'success');
            return NavigationDecision.prevent;
          }
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse('https://www.paytr.com/odeme/guvenli/${widget.token}'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(t('Güvenli ödeme', 'Secure payment')),
        bottom: _progress < 100
            ? PreferredSize(preferredSize: const Size.fromHeight(2), child: LinearProgressIndicator(value: _progress / 100, minHeight: 2))
            : null,
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
