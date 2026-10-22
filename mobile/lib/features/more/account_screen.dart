import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/tiers.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../admin/admin_screen.dart';
import '../support/support_screens.dart';
import '../transfer/transfer_screen.dart';
import '../uploads/transfers_sheet.dart';
import 'plans_screen.dart';
import 'settings_screen.dart';
import 'storage_screen.dart';
import 'trash_screen.dart';
import 'web_pages.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  void _push(BuildContext context, Widget page) => Navigator.push(context, MaterialPageRoute(builder: (_) => page));

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LocaleStore>();
    final auth = context.watch<AuthStore>();
    final store = context.watch<FilesStore>();
    final p = auth.profile;
    if (p == null) return const SizedBox.shrink();

    Widget group(List<Widget> children) => Padding(
          padding: const EdgeInsets.only(bottom: 14),
          child: GlassCard(padding: const EdgeInsets.symmetric(vertical: 6), child: Column(children: children)),
        );

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, kNavPadding),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 0, 4, 16),
            child: Text(t('Hesap', 'Account'), style: AppTheme.display(30)),
          ),
          GlassCard(
            glow: true,
            onTap: () => _push(context, const SettingsScreen()),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.surface2.withValues(alpha: 0.95), AppColors.deepBlue.withValues(alpha: 0.7)],
            ),
            child: Column(children: [
              Row(children: [
                UserAvatar(url: p.avatarUrl, name: p.displayName, size: 62),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(p.displayName, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTheme.display(21)),
                    const SizedBox(height: 2),
                    Text(p.email, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.muted, fontSize: 13)),
                    const SizedBox(height: 8),
                    Wrap(spacing: 6, children: [
                      Pill(tierName(p.subscriptionTier),
                          color: p.isPaid ? AppColors.warning : AppColors.accentText, icon: p.isPaid ? LucideIcons.crown : LucideIcons.sparkles),
                      if (p.isAdmin) Pill(p.role == 'admin' ? 'Admin' : t('Moderatör', 'Moderator'), color: AppColors.danger, icon: LucideIcons.shield),
                    ]),
                  ]),
                ),
                Icon(LucideIcons.chevronRight, color: AppColors.subtle),
              ]),
              const SizedBox(height: 16),
              QuotaBar(used: store.usedBytes, quota: p.quotaBytes),
              const SizedBox(height: 8),
              Row(children: [
                Text('${formatBytes(store.usedBytes)} / ${formatBytes(p.quotaBytes)}', style: TextStyle(color: AppColors.muted, fontSize: 12.5)),
                const Spacer(),
                Text(t('${store.files.length} dosya', '${store.files.length} files'), style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
              ]),
            ]),
          ).animate().fadeIn(duration: 400.ms).moveY(begin: 10, end: 0),
          const SizedBox(height: 18),
          group([
            _Item(icon: LucideIcons.hardDrive, label: t('Depolama', 'Storage'), onTap: () => _push(context, const StorageScreen())),
            _Item(icon: LucideIcons.trash2, label: t('Çöp kutusu', 'Trash'), onTap: () => _push(context, const TrashScreen())),
            _Item(
              icon: LucideIcons.arrowDownUp,
              label: t('Yüklemeler ve indirmeler', 'Uploads & downloads'),
              trailing: store.transfers.where((t) => t.isActive).isEmpty ? null : Pill('${store.transfers.where((t) => t.isActive).length}', color: AppColors.accentText),
              onTap: () => _push(context, const TransfersScreen()),
            ),
          ]),
          group([
            _Item(icon: LucideIcons.crown, label: t('Planlar ve abonelik', 'Plans & subscription'), color: AppColors.warning, onTap: () => _push(context, const PlansScreen())),
            _Item(icon: LucideIcons.settings, label: t('Ayarlar', 'Settings'), onTap: () => _push(context, const SettingsScreen())),
            _Item(
              icon: LucideIcons.languages,
              label: t('Dil', 'Language'),
              trailing: SegmentedButton<bool>(
                showSelectedIcon: false,
                style: ButtonStyle(visualDensity: VisualDensity.compact, padding: WidgetStateProperty.all(const EdgeInsets.symmetric(horizontal: 8))),
                segments: const [ButtonSegment(value: true, label: Text('TR')), ButtonSegment(value: false, label: Text('EN'))],
                selected: {locale.isTr},
                onSelectionChanged: (v) => locale.setTr(v.first),
              ),
            ),
          ]),
          group([
            _Item(icon: LucideIcons.lifeBuoy, label: t('Destek talepleri', 'Support tickets'), onTap: () => _push(context, const TicketsScreen())),
            _Item(icon: LucideIcons.mail, label: t('İletişim', 'Contact'), onTap: () => _push(context, const ContactScreen())),
            if (p.isAdmin)
              _Item(icon: LucideIcons.shieldCheck, label: t('Yönetim paneli', 'Admin panel'), color: AppColors.danger, onTap: () => _push(context, const AdminScreen())),
          ]),
          group([
            _Item(icon: LucideIcons.globe, label: t('Web sitesini aç', 'Open website'), onTap: () => launchUrl(Uri.parse(AppConfig.appUrl), mode: LaunchMode.externalApplication)),
            _Item(icon: LucideIcons.shieldCheck, label: t('Gizlilik politikası', 'Privacy policy'), onTap: () => openWebPage(context, '/privacy')),
            _Item(icon: LucideIcons.scrollText, label: t('Kullanım şartları', 'Terms of service'), onTap: () => openWebPage(context, '/terms')),
          ]),
          group([
            _Item(
              icon: LucideIcons.logOut,
              label: t('Çıkış yap', 'Sign out'),
              color: AppColors.danger,
              onTap: () async {
                final ok = await confirmDialog(context,
                    title: t('Çıkış yapılsın mı?', 'Sign out?'),
                    message: t('Bu cihazdaki oturumun kapanır.', 'You will be signed out on this device.'),
                    confirm: t('Çıkış yap', 'Sign out'),
                    danger: true);
                if (ok && context.mounted) await context.read<AuthStore>().logout();
              },
            ),
          ]),
          const SizedBox(height: 4),
          Center(
            child: Column(children: [
              const LogoMark(size: 32),
              const SizedBox(height: 8),
              Text('NearDrop for Android · v1.0.0', style: TextStyle(color: AppColors.subtle, fontSize: 12)),
            ]),
          ),
        ],
      ),
    );
  }
}

class _Item extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Widget? trailing;
  final Color? color;
  const _Item({required this.icon, required this.label, this.onTap, this.trailing, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.foreground;
    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: (color ?? AppColors.accentText).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(11)),
        child: Icon(icon, size: 18, color: color ?? AppColors.accentText),
      ),
      title: Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: c)),
      trailing: trailing ?? (onTap != null ? Icon(LucideIcons.chevronRight, size: 18, color: AppColors.subtle) : null),
    );
  }
}
