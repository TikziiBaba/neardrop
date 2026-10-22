import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../core/api.dart';
import '../core/config.dart';
import '../core/device.dart';
import '../core/i18n.dart';
import '../core/models.dart';

enum AuthStatus { loading, signedOut, signedIn }

class AuthResult {
  final bool ok;
  final String? error;
  final bool needsVerification;
  const AuthResult.ok({this.needsVerification = false})
      : ok = true,
        error = null;
  const AuthResult.fail(this.error, {this.needsVerification = false}) : ok = false;
}

/// Web'deki AuthProvider (lib/auth/context.tsx) ile aynı kurallar:
/// e-postası onaylanmamış hesap oturum açamaz, profil `profiles` tablosundan okunur.
class AuthStore extends ChangeNotifier {
  final _client = Supabase.instance.client;
  StreamSubscription<AuthState>? _sub;

  AuthStatus status = AuthStatus.loading;
  UserProfile? profile;

  /// Hesapsız kullanım: doğrudan aktarım ve paylaşım bağlantısı açma
  bool guest = false;

  GoTrueClient get _auth => _client.auth;
  bool get isSignedIn => status == AuthStatus.signedIn && profile != null;

  AuthStore() {
    _init();
  }

  Future<void> _init() async {
    // Kayıtlı oturumun süresi dolduysa profil sorgusundan önce yenile
    final session = _auth.currentSession;
    if (session != null && session.isExpired) {
      try {
        await _auth.refreshSession();
      } catch (_) {}
    }
    final user = _auth.currentUser;
    if (user != null && _isUsable(user)) {
      await _loadProfile(user);
    } else {
      if (user != null) await _auth.signOut();
      status = AuthStatus.signedOut;
      notifyListeners();
    }

    _sub = _auth.onAuthStateChange.listen((state) async {
      final user = state.session?.user;
      switch (state.event) {
        case AuthChangeEvent.signedIn:
        case AuthChangeEvent.tokenRefreshed:
        case AuthChangeEvent.userUpdated:
          if (user == null) return;
          if (!_isUsable(user)) {
            await _auth.signOut();
            return;
          }
          // Token yenilemesinde profil zaten yüklüyse tekrar çekmeye gerek yok
          if (state.event == AuthChangeEvent.tokenRefreshed && profile?.id == user.id) return;
          await _loadProfile(user);
        case AuthChangeEvent.signedOut:
          profile = null;
          status = AuthStatus.signedOut;
          notifyListeners();
        default:
          break;
      }
    });
  }

  bool _isUsable(User user) {
    final confirmed = user.emailConfirmedAt != null;
    final provider = user.appMetadata['provider'];
    final isOAuth = provider != null && provider != 'email';
    return confirmed || isOAuth;
  }

  Future<void> _loadProfile(User user) async {
    final email = user.email ?? '';
    final meta = user.userMetadata ?? {};
    Map<String, dynamic>? row;
    var fetched = false;
    try {
      row = await _client.from('profiles').select().eq('id', user.id).maybeSingle();
      if (row == null && email.isNotEmpty) {
        row = await _client.from('profiles').select().eq('email', email).order('created_at').limit(1).maybeSingle();
      }
      fetched = true;
    } catch (_) {}

    final displayName = (row?['display_name'] ??
            meta['display_name'] ??
            meta['full_name'] ??
            meta['user_name'] ??
            meta['name'] ??
            (email.contains('@') ? email.split('@').first : 'User'))
        .toString();
    final tier = '${row?['subscription_tier'] ?? 'free'}';
    final isPaid = tier == 'pro' || tier == 'ultra' || tier == 'enterprise';
    var quota = (row?['quota_bytes'] as num?)?.toInt() ?? 2147483648;
    if (!isPaid && quota > 2147483648) quota = 2147483648;

    if (row == null && fetched) {
      // Profil satırı yoksa web ile aynı şekilde oluşturulur (sorgu hata verdiyse oluşturma)
      try {
        await _client.from('profiles').insert({
          'id': user.id,
          'email': email,
          'display_name': displayName,
          'avatar_url': meta['avatar_url'] ?? meta['picture'] ?? '',
          'quota_bytes': quota,
          'used_bytes': 0,
          'role': 'member',
          'subscription_tier': 'free',
          'subscription_status': 'active',
        });
      } catch (_) {}
    }

    final avatar = '${row?['avatar_url'] ?? meta['avatar_url'] ?? meta['picture'] ?? ''}';
    profile = UserProfile(
      id: '${row?['id'] ?? user.id}',
      email: '${row?['email'] ?? email}',
      displayName: displayName,
      avatarUrl: avatar.isEmpty ? null : avatar,
      quotaBytes: quota,
      usedBytes: (row?['used_bytes'] as num?)?.toInt() ?? 0,
      role: '${row?['role'] ?? 'member'}',
      subscriptionTier: tier,
      subscriptionStatus: '${row?['subscription_status'] ?? 'active'}',
      subscriptionRenewsAt: DateTime.tryParse('${row?['subscription_renews_at']}'),
      createdAt: DateTime.tryParse('${row?['created_at'] ?? user.createdAt}'),
    );
    status = AuthStatus.signedIn;
    guest = false;
    notifyListeners();
    unawaited(_syncDevice());
  }

  Future<void> refreshProfile() async {
    final user = _auth.currentUser;
    if (user != null) await _loadProfile(user);
  }

  Future<void> _syncDevice() async {
    final p = profile;
    if (p == null) return;
    final d = DeviceIdentity.current;
    try {
      await Api.post('/api/auth/device', {
        'userId': p.id,
        'email': p.email,
        'deviceId': d.deviceId,
        'deviceName': d.deviceName,
        'deviceType': d.deviceType,
        'platform': d.platform,
        'browser': 'NearDrop App',
        'userAgent': 'NearDrop-Android/1.0',
      });
    } catch (_) {}
  }

  String _friendly(AuthException e) {
    final m = e.message.toLowerCase();
    if (m.contains('invalid login')) return t('E-posta veya şifre hatalı.', 'Invalid email or password.');
    if (m.contains('already registered')) return t('Bu e-posta ile zaten bir hesap var.', 'An account with this email already exists.');
    if (m.contains('password should be')) return t('Şifre en az 6 karakter olmalı.', 'Password must be at least 6 characters.');
    if (m.contains('expired') || m.contains('invalid')) return t('Kod geçersiz ya da süresi dolmuş.', 'The code is invalid or expired.');
    if (m.contains('rate limit') || m.contains('security purposes')) {
      return t('Çok sık denediniz, biraz bekleyip tekrar deneyin.', 'Too many attempts, please wait a moment.');
    }
    return e.message;
  }

  Future<AuthResult> login(String email, String password) async {
    try {
      final res = await _auth.signInWithPassword(email: email.trim(), password: password);
      final user = res.user;
      if (user == null) return AuthResult.fail(t('Giriş başarısız.', 'Sign in failed.'));
      if (!_isUsable(user)) {
        await _auth.signOut();
        return AuthResult.fail(
          t('E-posta adresiniz henüz onaylanmamış.', 'Your email address is not verified yet.'),
          needsVerification: true,
        );
      }
      await _loadProfile(user);
      return const AuthResult.ok();
    } on AuthException catch (e) {
      if (e.message.toLowerCase().contains('email not confirmed')) {
        return AuthResult.fail(t('E-posta adresiniz henüz onaylanmamış.', 'Your email address is not verified yet.'),
            needsVerification: true);
      }
      return AuthResult.fail(_friendly(e));
    } catch (e) {
      return AuthResult.fail(e.toString());
    }
  }

  Future<AuthResult> register(String email, String password, String displayName) async {
    try {
      final res = await _auth.signUp(
        email: email.trim(),
        password: password,
        data: {'display_name': displayName.trim(), 'subscription_tier': 'free'},
        emailRedirectTo: '${AppConfig.appUrl}/auth/confirm',
      );
      final user = res.user;
      if (user == null) return AuthResult.fail(t('Kayıt başarısız.', 'Registration failed.'));
      final needs = res.session == null || user.emailConfirmedAt == null;
      if (!needs) await _loadProfile(user);
      return AuthResult.ok(needsVerification: needs);
    } on AuthException catch (e) {
      return AuthResult.fail(_friendly(e));
    } catch (e) {
      return AuthResult.fail(e.toString());
    }
  }

  Future<AuthResult> verifyOtp(String email, String code) async {
    final cleanEmail = email.trim().toLowerCase();
    final token = code.replaceAll(RegExp(r'\s+'), '');
    try {
      AuthResponse res;
      try {
        res = await _auth.verifyOTP(email: cleanEmail, token: token, type: OtpType.signup);
      } on AuthException {
        // Supabase bazı şablonlarda "email" türünü kullanıyor
        res = await _auth.verifyOTP(email: cleanEmail, token: token, type: OtpType.email);
      }
      final user = res.session?.user ?? res.user;
      if (user != null) await _loadProfile(user);
      return const AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.fail(_friendly(e));
    } catch (e) {
      return AuthResult.fail(e.toString());
    }
  }

  Future<AuthResult> resendVerification(String email) async {
    try {
      await _auth.resend(type: OtpType.signup, email: email.trim(), emailRedirectTo: '${AppConfig.appUrl}/auth/confirm');
      return const AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.fail(_friendly(e));
    }
  }

  Future<AuthResult> sendPasswordReset(String email) async {
    try {
      await _auth.resetPasswordForEmail(email.trim(), redirectTo: '${AppConfig.appUrl}/reset-password');
      return const AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.fail(_friendly(e));
    }
  }

  Future<AuthResult> changePassword(String newPassword) async {
    try {
      await _auth.updateUser(UserAttributes(password: newPassword));
      return const AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.fail(_friendly(e));
    }
  }

  Future<AuthResult> signInWithOAuth(OAuthProvider provider) async {
    try {
      await _auth.signInWithOAuth(
        provider,
        redirectTo: AppConfig.oauthRedirect,
        authScreenLaunchMode: LaunchMode.externalApplication,
      );
      return const AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.fail(_friendly(e));
    }
  }

  Future<void> updateProfile({String? displayName, String? avatarUrl}) async {
    final p = profile;
    if (p == null) return;
    profile = p.copyWith(displayName: displayName, avatarUrl: avatarUrl);
    notifyListeners();
    final update = <String, dynamic>{'updated_at': DateTime.now().toUtc().toIso8601String()};
    if (displayName != null) update['display_name'] = displayName;
    if (avatarUrl != null) update['avatar_url'] = avatarUrl;
    await _client.from('profiles').update(update).eq('id', p.id);
  }

  void continueAsGuest() {
    guest = true;
    notifyListeners();
  }

  void leaveGuest() {
    guest = false;
    notifyListeners();
  }

  Future<void> logout() async {
    await _auth.signOut();
    profile = null;
    guest = false;
    status = AuthStatus.signedOut;
    notifyListeners();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
