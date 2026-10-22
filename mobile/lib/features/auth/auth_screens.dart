import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart' show OAuthProvider;

import '../../core/i18n.dart';
import '../../state/auth_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/allay.dart';
import '../../widgets/ui.dart';
import '../more/web_pages.dart';

final _emailRe = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

class _AuthScaffold extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<Widget> children;
  const _AuthScaffold({required this.title, required this.subtitle, required this.children});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(leading: const BackButton()),
      extendBodyBehindAppBar: true,
      body: AuroraBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(22, 56, 22, 32),
            children: [
              const Center(child: AllayMascot(size: 92)),
              const SizedBox(height: 10),
              Text(title, textAlign: TextAlign.center, style: AppTheme.display(30)),
              const SizedBox(height: 8),
              Text(subtitle, textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted, height: 1.4)),
              const SizedBox(height: 28),
              ...children,
            ].animate(interval: 40.ms).fadeIn(duration: 380.ms).moveY(begin: 10, end: 0),
          ),
        ),
      ),
    );
  }
}

class _ErrorBox extends StatelessWidget {
  final String message;
  const _ErrorBox(this.message);

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.danger.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.danger.withValues(alpha: 0.35)),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(LucideIcons.circleAlert, size: 18, color: AppColors.danger),
          const SizedBox(width: 10),
          Expanded(child: Text(message, style: TextStyle(color: AppColors.foreground, height: 1.35))),
        ]),
      );
}

class _OAuthRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    Future<void> go(OAuthProvider p) async {
      final res = await context.read<AuthStore>().signInWithOAuth(p);
      if (!res.ok && context.mounted) showToast(context, res.error!, error: true);
    }

    return Column(children: [
      Row(children: [
        Expanded(child: Divider(color: AppColors.border)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(t('veya', 'or'), style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
        ),
        Expanded(child: Divider(color: AppColors.border)),
      ]),
      const SizedBox(height: 16),
      Row(children: [
        Expanded(child: _BrandButton(label: 'Google', svg: _googleSvg, onTap: () => go(OAuthProvider.google))),
        const SizedBox(width: 12),
        Expanded(child: _BrandButton(label: 'GitHub', svg: _githubSvg, onTap: () => go(OAuthProvider.github))),
      ]),
    ]);
  }
}

const _googleSvg = '''<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
</svg>''';

const _githubSvg = '''<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path fill="#f2fbfe" d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>
</svg>''';

class _BrandButton extends StatelessWidget {
  final String label;
  final String svg;
  final VoidCallback onTap;
  const _BrandButton({required this.label, required this.svg, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onTap: onTap,
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          color: AppColors.surface2.withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: AppColors.borderStrong.withValues(alpha: 0.7)),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          SvgPicture.string(svg, width: 19, height: 19),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5)),
        ]),
      ),
    );
  }
}

// ───────────────────────── Giriş ─────────────────────────

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;
  bool _needsVerify = false;

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_emailRe.hasMatch(_email.text.trim()) || _password.text.isEmpty) {
      setState(() => _error = t('Geçerli bir e-posta ve şifre girin.', 'Enter a valid email and password.'));
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await context.read<AuthStore>().login(_email.text, _password.text);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _error = res.error;
      _needsVerify = res.needsVerification;
    });
    if (res.ok) Navigator.of(context).popUntil((r) => r.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return _AuthScaffold(
      title: t('Tekrar hoş geldin', 'Welcome back'),
      subtitle: t('Dosyaların seni bekliyor.', 'Your files are waiting for you.'),
      children: [
        if (_error != null) _ErrorBox(_error!),
        if (_needsVerify)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: SecondaryButton(
              label: t('Doğrulama kodunu gir', 'Enter verification code'),
              icon: LucideIcons.mailCheck,
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => VerifyEmailScreen(email: _email.text.trim(), sendOnOpen: true)),
              ),
            ),
          ),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: t('E-posta', 'Email'), prefixIcon: const Icon(LucideIcons.mail, size: 19)),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _password,
          obscureText: _obscure,
          autofillHints: const [AutofillHints.password],
          onSubmitted: (_) => _submit(),
          decoration: InputDecoration(
            labelText: t('Şifre', 'Password'),
            prefixIcon: const Icon(LucideIcons.lock, size: 19),
            suffixIcon: IconButton(
              icon: Icon(_obscure ? LucideIcons.eye : LucideIcons.eyeOff, size: 19),
              onPressed: () => setState(() => _obscure = !_obscure),
            ),
          ),
        ),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ForgotPasswordScreen(email: _email.text))),
            child: Text(t('Şifremi unuttum', 'Forgot password?'), style: TextStyle(color: AppColors.accentText)),
          ),
        ),
        const SizedBox(height: 6),
        PrimaryButton(label: t('Giriş yap', 'Sign in'), icon: LucideIcons.logIn, loading: _loading, onPressed: _submit),
        const SizedBox(height: 24),
        _OAuthRow(),
        const SizedBox(height: 24),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(t('Hesabın yok mu?', "Don't have an account?"), style: TextStyle(color: AppColors.muted)),
          TextButton(
            onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
            child: Text(t('Kayıt ol', 'Sign up'), style: TextStyle(color: AppColors.accentText, fontWeight: FontWeight.w700)),
          ),
        ]),
      ],
    );
  }
}

// ───────────────────────── Kayıt ─────────────────────────

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _agreed = false;
  bool _loading = false;
  String? _error;

  int get _strength {
    final p = _password.text;
    var s = 0;
    if (p.length >= 8) s++;
    if (RegExp(r'[A-Z]').hasMatch(p) && RegExp(r'[a-z]').hasMatch(p)) s++;
    if (RegExp(r'\d').hasMatch(p)) s++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(p)) s++;
    return s;
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    String? err;
    if (_name.text.trim().length < 2) {
      err = t('Adınızı girin.', 'Enter your name.');
    } else if (!_emailRe.hasMatch(_email.text.trim())) {
      err = t('Geçerli bir e-posta girin.', 'Enter a valid email.');
    } else if (_password.text.length < 8) {
      err = t('Şifre en az 8 karakter olmalı.', 'Password must be at least 8 characters.');
    } else if (!_agreed) {
      err = t('Devam etmek için kullanım şartlarını kabul edin.', 'Accept the terms to continue.');
    }
    if (err != null) {
      setState(() => _error = err);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await context.read<AuthStore>().register(_email.text, _password.text, _name.text);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _error = res.error;
    });
    if (res.ok && res.needsVerification) {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => VerifyEmailScreen(email: _email.text.trim())));
    } else if (res.ok) {
      Navigator.of(context).popUntil((r) => r.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    final strength = _strength;
    final strengthColor = [AppColors.danger, AppColors.danger, AppColors.warning, AppColors.accentText, AppColors.success][strength];
    return _AuthScaffold(
      title: t('Hesabını oluştur', 'Create your account'),
      subtitle: t('2 GB ücretsiz şifreli depolama ile başla.', 'Start with 2 GB of free encrypted storage.'),
      children: [
        if (_error != null) _ErrorBox(_error!),
        TextField(
          controller: _name,
          textCapitalization: TextCapitalization.words,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: t('Ad soyad', 'Full name'), prefixIcon: const Icon(LucideIcons.user, size: 19)),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: t('E-posta', 'Email'), prefixIcon: const Icon(LucideIcons.mail, size: 19)),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _password,
          obscureText: _obscure,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            labelText: t('Şifre', 'Password'),
            prefixIcon: const Icon(LucideIcons.lock, size: 19),
            suffixIcon: IconButton(
              icon: Icon(_obscure ? LucideIcons.eye : LucideIcons.eyeOff, size: 19),
              onPressed: () => setState(() => _obscure = !_obscure),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: List.generate(
            4,
            (i) => Expanded(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                height: 5,
                margin: EdgeInsets.only(right: i < 3 ? 6 : 0),
                decoration: BoxDecoration(
                  color: i < strength ? strengthColor : AppColors.surface3,
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
        InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => setState(() => _agreed = !_agreed),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Checkbox(
              value: _agreed,
              onChanged: (v) => setState(() => _agreed = v ?? false),
              activeColor: AppColors.accent,
              side: BorderSide(color: AppColors.borderStrong),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Wrap(children: [
                  Text(t('Okudum, kabul ediyorum: ', 'I agree to the '), style: TextStyle(color: AppColors.muted, fontSize: 13)),
                  GestureDetector(
                    onTap: () => openWebPage(context, '/terms'),
                    child: Text(t('Kullanım Şartları', 'Terms'), style: TextStyle(color: AppColors.accentText, fontSize: 13, fontWeight: FontWeight.w600)),
                  ),
                  Text(t(' ve ', ' and '), style: TextStyle(color: AppColors.muted, fontSize: 13)),
                  GestureDetector(
                    onTap: () => openWebPage(context, '/privacy'),
                    child: Text(t('Gizlilik Politikası', 'Privacy Policy'),
                        style: TextStyle(color: AppColors.accentText, fontSize: 13, fontWeight: FontWeight.w600)),
                  ),
                ]),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 16),
        PrimaryButton(label: t('Hesap oluştur', 'Create account'), icon: LucideIcons.sparkles, loading: _loading, onPressed: _submit),
        const SizedBox(height: 24),
        _OAuthRow(),
        const SizedBox(height: 20),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(t('Zaten hesabın var mı?', 'Already have an account?'), style: TextStyle(color: AppColors.muted)),
          TextButton(
            onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
            child: Text(t('Giriş yap', 'Sign in'), style: TextStyle(color: AppColors.accentText, fontWeight: FontWeight.w700)),
          ),
        ]),
      ],
    );
  }
}

// ───────────────────────── E-posta doğrulama (6 haneli kod) ─────────────────────────

class VerifyEmailScreen extends StatefulWidget {
  final String email;
  final bool sendOnOpen;
  const VerifyEmailScreen({super.key, required this.email, this.sendOnOpen = false});

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  final _code = TextEditingController();
  final _focus = FocusNode();
  bool _loading = false;
  String? _error;
  int _cooldown = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.sendOnOpen) {
      _resend();
    } else {
      _startCooldown();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _focus.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _cooldown = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() => _cooldown--);
      if (_cooldown <= 0) timer.cancel();
    });
  }

  Future<void> _resend() async {
    final res = await context.read<AuthStore>().resendVerification(widget.email);
    if (!mounted) return;
    if (res.ok) {
      showToast(context, t('Yeni kod gönderildi.', 'A new code was sent.'), success: true);
      setState(_startCooldown);
    } else {
      showToast(context, res.error!, error: true);
    }
  }

  Future<void> _verify() async {
    if (_code.text.length != 6) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await context.read<AuthStore>().verifyOtp(widget.email, _code.text);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _error = res.error;
    });
    if (res.ok) {
      showToast(context, t('E-posta doğrulandı, hoş geldin!', 'Email verified, welcome!'), success: true);
      Navigator.of(context).popUntil((r) => r.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _AuthScaffold(
      title: t('E-postanı doğrula', 'Verify your email'),
      subtitle: t('${widget.email} adresine 6 haneli bir kod gönderdik.', 'We sent a 6-digit code to ${widget.email}.'),
      children: [
        if (_error != null) _ErrorBox(_error!),
        GestureDetector(
          onTap: () => _focus.requestFocus(),
          child: Stack(children: [
            Opacity(
              opacity: 0,
              child: TextField(
                controller: _code,
                focusNode: _focus,
                autofocus: true,
                keyboardType: TextInputType.number,
                maxLength: 6,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                onChanged: (v) {
                  setState(() {});
                  if (v.length == 6) _verify();
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(6, (i) {
                final filled = i < _code.text.length;
                final active = i == _code.text.length;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  width: 48,
                  height: 58,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.surface2.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: active ? AppColors.accentHover : (filled ? AppColors.accent.withValues(alpha: 0.6) : AppColors.border),
                      width: active ? 1.6 : 1,
                    ),
                  ),
                  child: Text(filled ? _code.text[i] : '', style: AppTheme.display(24)),
                );
              }),
            ),
          ]),
        ),
        const SizedBox(height: 22),
        PrimaryButton(
          label: t('Doğrula', 'Verify'),
          icon: LucideIcons.badgeCheck,
          loading: _loading,
          onPressed: _code.text.length == 6 ? _verify : null,
        ),
        const SizedBox(height: 14),
        Center(
          child: TextButton(
            onPressed: _cooldown > 0 ? null : _resend,
            child: Text(
              _cooldown > 0 ? t('Kodu tekrar gönder ($_cooldown sn)', 'Resend code (${_cooldown}s)') : t('Kodu tekrar gönder', 'Resend code'),
              style: TextStyle(color: _cooldown > 0 ? AppColors.subtle : AppColors.accentText, fontWeight: FontWeight.w600),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          t('E-postadaki bağlantıya tıklarsan hesabın da onaylanır; sonra buradan giriş yapabilirsin.',
              'Clicking the link in the email also verifies your account; then sign in here.'),
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.subtle, fontSize: 12.5, height: 1.4),
        ),
      ],
    );
  }
}

// ───────────────────────── Şifre sıfırlama ─────────────────────────

class ForgotPasswordScreen extends StatefulWidget {
  final String email;
  const ForgotPasswordScreen({super.key, this.email = ''});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  late final _email = TextEditingController(text: widget.email);
  bool _loading = false;
  bool _sent = false;
  String? _error;

  Future<void> _send() async {
    if (!_emailRe.hasMatch(_email.text.trim())) {
      setState(() => _error = t('Geçerli bir e-posta girin.', 'Enter a valid email.'));
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await context.read<AuthStore>().sendPasswordReset(_email.text);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _error = res.error;
      _sent = res.ok;
    });
  }

  @override
  Widget build(BuildContext context) {
    return _AuthScaffold(
      title: t('Şifreni sıfırla', 'Reset your password'),
      subtitle: _sent
          ? t('Sıfırlama bağlantısı gönderildi. E-postadaki bağlantıyı açıp yeni şifreni belirle.',
              'Reset link sent. Open the link in the email to set a new password.')
          : t('Hesabına bağlı e-postayı yaz, sana bir sıfırlama bağlantısı gönderelim.',
              "Enter your account email and we'll send you a reset link."),
      children: [
        if (_error != null) _ErrorBox(_error!),
        if (!_sent) ...[
          TextField(
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            onSubmitted: (_) => _send(),
            decoration: InputDecoration(labelText: t('E-posta', 'Email'), prefixIcon: const Icon(LucideIcons.mail, size: 19)),
          ),
          const SizedBox(height: 18),
          PrimaryButton(label: t('Bağlantı gönder', 'Send link'), icon: LucideIcons.send, loading: _loading, onPressed: _send),
        ] else
          SecondaryButton(
            label: t('Girişe dön', 'Back to sign in'),
            icon: LucideIcons.arrowLeft,
            onPressed: () => Navigator.pop(context),
          ),
      ],
    );
  }
}
