import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mime/mime.dart';
import 'package:provider/provider.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/picker.dart';
import '../../core/tiers.dart';
import '../../state/auth_store.dart';
import '../../state/settings_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../support/support_screens.dart';
import 'plans_screen.dart';

/// Web'deki /settings: profil, abonelik, varsayılan paylaşım ayarları, bildirimler ve güvenlik.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final _name = TextEditingController(text: context.read<AuthStore>().profile?.displayName);
  bool _savingName = false;
  bool _uploadingAvatar = false;

  Future<void> _saveName() async {
    final name = _name.text.trim();
    if (name.length < 2) return;
    setState(() => _savingName = true);
    try {
      await context.read<AuthStore>().updateProfile(displayName: name);
      if (mounted) showToast(context, t('Profil güncellendi', 'Profile updated'), success: true);
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _savingName = false);
    }
  }

  Future<void> _pickAvatar() async {
    final auth = context.read<AuthStore>();
    final file = (await pickLocalFiles(type: FileType.image)).firstOrNull;
    if (file == null) return;
    if (file.size > 5 * 1024 * 1024) {
      if (mounted) showToast(context, t('Fotoğraf 5 MB\'tan küçük olmalı', 'Photo must be under 5 MB'), error: true);
      return;
    }
    setState(() => _uploadingAvatar = true);
    try {
      final form = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(file.path, filename: file.name, contentType: DioMediaType.parse(lookupMimeType(file.name) ?? 'image/jpeg')),
        'userId': auth.profile!.id,
      });
      final data = await Api.post('/api/user/avatar', form);
      final url = data['avatarUrl'] as String?;
      if (url != null) await auth.updateProfile(avatarUrl: url);
      if (mounted) showToast(context, t('Profil fotoğrafı güncellendi', 'Profile photo updated'), success: true);
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  Future<void> _changePassword() async {
    final pass = await promptDialog(context, title: t('Yeni şifre', 'New password'), hint: t('En az 8 karakter', 'At least 8 characters'), obscure: true);
    if (pass == null || !mounted) return;
    if (pass.length < 8) {
      showToast(context, t('Şifre en az 8 karakter olmalı.', 'Password must be at least 8 characters.'), error: true);
      return;
    }
    final res = await context.read<AuthStore>().changePassword(pass);
    if (!mounted) return;
    showToast(context, res.ok ? t('Şifren değiştirildi', 'Password changed') : res.error!, success: res.ok, error: !res.ok);
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AuthStore>().profile;
    if (p == null) return const Scaffold();
    final settings = context.watch<SettingsStore>();
    final rules = TierRules.of(p);

    Widget section(String title, IconData icon, List<Widget> children) => Padding(
          padding: const EdgeInsets.only(bottom: 14),
          child: GlassCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(icon, size: 18, color: AppColors.accentText),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ]),
              const SizedBox(height: 14),
              ...children,
            ]),
          ),
        );

    return Scaffold(
      appBar: AppBar(title: Text(t('Ayarlar', 'Settings'))),
      body: AuroraBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
            children: [
              section(t('Profil', 'Profile'), LucideIcons.user, [
                Row(children: [
                  Stack(children: [
                    UserAvatar(url: p.avatarUrl, name: p.displayName, size: 72),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: GestureDetector(
                        onTap: _uploadingAvatar ? null : _pickAvatar,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(color: AppColors.accent, shape: BoxShape.circle, border: Border.all(color: AppColors.surface, width: 2)),
                          child: _uploadingAvatar
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Icon(LucideIcons.camera, size: 14, color: Colors.white),
                        ),
                      ),
                    ),
                  ]),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(p.email, style: TextStyle(color: AppColors.muted)),
                      const SizedBox(height: 4),
                      Text(t('Üyelik: ${formatDate(p.createdAt, withTime: false)}', 'Member since ${formatDate(p.createdAt, withTime: false)}'),
                          style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                    ]),
                  ),
                ]),
                const SizedBox(height: 16),
                TextField(controller: _name, decoration: InputDecoration(labelText: t('Görünen ad', 'Display name'))),
                const SizedBox(height: 12),
                PrimaryButton(label: t('Kaydet', 'Save'), icon: LucideIcons.check, height: 48, loading: _savingName, onPressed: _saveName),
              ]),
              section(t('Abonelik', 'Subscription'), LucideIcons.crown, [
                Row(children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(tierName(p.subscriptionTier), style: AppTheme.display(22)),
                      Text(t('${formatBytes(p.quotaBytes)} depolama', '${formatBytes(p.quotaBytes)} storage'), style: TextStyle(color: AppColors.muted)),
                      if (p.subscriptionRenewsAt != null)
                        Text(t('Yenilenme: ${formatDate(p.subscriptionRenewsAt, withTime: false)}', 'Renews ${formatDate(p.subscriptionRenewsAt, withTime: false)}'),
                            style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                    ]),
                  ),
                  SecondaryButton(
                    label: p.isPaid ? t('Planlar', 'Plans') : t('Yükselt', 'Upgrade'),
                    icon: LucideIcons.arrowUpRight,
                    expand: false,
                    height: 44,
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlansScreen())),
                  ),
                ]),
              ]),
              section(t('Varsayılan paylaşım ayarları', 'Default sharing'), LucideIcons.link2, [
                Text(t('Yeni bağlantıların süresi', 'New links expire after'), style: TextStyle(color: AppColors.muted, fontSize: 13)),
                const SizedBox(height: 8),
                Wrap(spacing: 8, runSpacing: 8, children: [
                  for (final o in expiryOptions.where((o) => o.hours != 0))
                    ChoiceChip(
                      label: Text(o.label),
                      showCheckmark: false,
                      selected: settings.defaultExpirationHours == o.hours,
                      onSelected: rules.atLeast(o.minRank) ? (_) => settings.update(defaultExpirationHours: o.hours) : null,
                    ),
                ]),
                const SizedBox(height: 14),
                Text(t('Varsayılan indirme sınırı', 'Default download limit'), style: TextStyle(color: AppColors.muted, fontSize: 13)),
                const SizedBox(height: 8),
                Wrap(spacing: 8, children: [
                  for (final n in [5, 10, 20, 50])
                    ChoiceChip(
                      label: Text('$n'),
                      showCheckmark: false,
                      selected: settings.defaultMaxDownloads == n,
                      onSelected: (_) => settings.update(defaultMaxDownloads: n),
                    ),
                ]),
              ]),
              section(t('E-posta ve bildirimler', 'Email & alerts'), LucideIcons.bell, [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: settings.emailOnDownload,
                  onChanged: (v) => settings.update(emailOnDownload: v),
                  title: Text(t('Dosyam indirildiğinde', 'When my file is downloaded')),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: settings.emailOnExpire,
                  onChanged: (v) => settings.update(emailOnExpire: v),
                  title: Text(t('Bağlantı süresi dolmadan önce', 'Before a link expires')),
                ),
              ]),
              section(t('Güvenlik ve destek', 'Security & support'), LucideIcons.shieldCheck, [
                SheetAction(icon: LucideIcons.keyRound, label: t('Şifreyi değiştir', 'Change password'), onTap: _changePassword),
                SheetAction(
                  icon: LucideIcons.lifeBuoy,
                  label: t('Destek talebi aç', 'Open a support ticket'),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NewTicketScreen())),
                ),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
