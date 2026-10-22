import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/api.dart';
import '../../core/config.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../core/tiers.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../shell/home_shell.dart';
import '../transfer/transfer_screen.dart';
import 'share_analytics_screen.dart';
import 'share_create_sheet.dart';

enum _ShareFilter { all, live, expired, off }

class SharesScreen extends StatefulWidget {
  const SharesScreen({super.key});

  @override
  State<SharesScreen> createState() => _SharesScreenState();
}

class _SharesScreenState extends State<SharesScreen> {
  _ShareFilter _filter = _ShareFilter.all;

  @override
  Widget build(BuildContext context) {
    context.isTr;
    final store = context.watch<FilesStore>();
    final rules = TierRules.of(context.watch<AuthStore>().profile);
    final shares = store.shares.where((s) {
      return switch (_filter) {
        _ShareFilter.all => true,
        _ShareFilter.live => s.isLive,
        _ShareFilter.expired => s.isExpired || s.isExhausted,
        _ShareFilter.off => !s.isActive,
      };
    }).toList();

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: store.refresh,
        color: AppColors.accentText,
        backgroundColor: AppColors.surface2,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: PageTitle(
                title: t('Paylaşımlar', 'Shares'),
                subtitle: rules.maxActiveShares < 9999
                    ? t('Ücretsiz planda ${store.activeShares}/1 aktif bağlantı', '${store.activeShares}/1 live link on Free')
                    : t('${store.activeShares} aktif bağlantı', '${store.activeShares} live links'),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 46,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    for (final (f, label) in [
                      (_ShareFilter.all, t('Tümü', 'All')),
                      (_ShareFilter.live, t('Aktif', 'Live')),
                      (_ShareFilter.expired, t('Süresi dolan', 'Expired')),
                      (_ShareFilter.off, t('Kapalı', 'Disabled')),
                    ])
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(label),
                          selected: _filter == f,
                          showCheckmark: false,
                          onSelected: (_) => setState(() => _filter = f),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            if (!store.loadedOnce && store.isLoading)
              const SliverFillRemaining(hasScrollBody: false, child: Loader())
            else if (shares.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: EmptyState(
                  title: t('Paylaşım yok', 'No shares'),
                  message: t('Dosyalar sekmesinde bir dosyanın menüsünden süreli bir bağlantı oluştur.',
                      'Create an expiring link from any file menu in the Files tab.'),
                  action: PrimaryButton(
                    label: t('Dosyalara git', 'Go to files'),
                    icon: LucideIcons.folderOpen,
                    expand: false,
                    onPressed: () => ShellController.instance.go(1),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                sliver: SliverList.separated(
                  itemCount: shares.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (_, i) => _ShareCard(share: shares[i]).animate().fadeIn(delay: (30 * i.clamp(0, 10)).ms, duration: 280.ms),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: kNavPadding)),
          ],
        ),
      ),
    );
  }
}

class _ShareCard extends StatelessWidget {
  final ShareLink share;
  const _ShareCard({required this.share});

  Future<void> _run(BuildContext context, Future<void> Function() action, String done) async {
    try {
      await action();
      if (context.mounted) showToast(context, done, success: true);
    } on ApiException catch (e) {
      if (context.mounted) showToast(context, e.message, error: true);
    }
  }

  void _more(BuildContext context) {
    final store = context.read<FilesStore>();
    final rules = TierRules.of(context.read<AuthStore>().profile);
    showSheet(context, builder: (ctx) {
      void run(VoidCallback f) {
        Navigator.pop(ctx);
        f();
      }

      return Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SheetAction(
            icon: LucideIcons.qrCode,
            label: t('QR ve bağlantı', 'QR & link'),
            onTap: () => run(() => showSheet(context, builder: (_) => ShareResultView(share: share))),
          ),
          SheetAction(
            icon: LucideIcons.chartLine,
            label: t('İndirme analizi', 'Download analytics'),
            onTap: () => run(() => Navigator.push(context, MaterialPageRoute(builder: (_) => ShareAnalyticsScreen(share: share)))),
          ),
          SheetAction(
            icon: share.isActive ? LucideIcons.pause : LucideIcons.play,
            label: share.isActive ? t('Bağlantıyı kapat', 'Disable link') : t('Bağlantıyı aç', 'Enable link'),
            onTap: () => run(() => _run(context, () => store.toggleShare(share),
                share.isActive ? t('Bağlantı kapatıldı', 'Link disabled') : t('Bağlantı açıldı', 'Link enabled'))),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
            child: Text(t('Süreyi yenile', 'Renew expiry'), style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Wrap(spacing: 8, runSpacing: 8, children: [
              for (final o in expiryOptions)
                ActionChip(
                  avatar: rules.atLeast(o.minRank) ? null : Icon(LucideIcons.lock, size: 13, color: AppColors.warning),
                  label: Text(o.label),
                  onPressed: rules.atLeast(o.minRank)
                      ? () => run(() => _run(context, () => store.updateShareExpiry(share, o.hours), t('Süre güncellendi', 'Expiry updated')))
                      : null,
                ),
            ]),
          ),
          const SizedBox(height: 12),
          SheetAction(
            icon: LucideIcons.trash2,
            label: t('Bağlantıyı sil', 'Delete link'),
            color: AppColors.danger,
            onTap: () => run(() async {
              final ok = await confirmDialog(context,
                  title: t('Bağlantı silinsin mi?', 'Delete link?'),
                  message: t('Bu bağlantıyla artık kimse indiremez.', 'Nobody will be able to download with this link anymore.'),
                  confirm: t('Sil', 'Delete'),
                  danger: true);
              if (ok && context.mounted) await _run(context, () => store.deleteShare(share), t('Bağlantı silindi', 'Link deleted'));
            }),
          ),
        ]),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final s = share;
    final url = AppConfig.shareUrl(s.token);
    final (status, color) = !s.isActive
        ? (t('Kapalı', 'Disabled'), AppColors.subtle)
        : s.isExpired
            ? (t('Süresi doldu', 'Expired'), AppColors.danger)
            : s.isExhausted
                ? (t('Sınır doldu', 'Limit reached'), AppColors.warning)
                : (t('Aktif', 'Live'), AppColors.success);

    return GlassCard(
      padding: const EdgeInsets.all(14),
      onTap: () => _more(context),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          FileTypeIcon(category: fileCategory(s.fileMime ?? '', s.displayName), folder: s.isFolder, size: 44),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(s.displayName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(
                s.isFolder ? t('${s.folderFilesCount} dosya · ${formatBytes(s.displaySize)}', '${s.folderFilesCount} files · ${formatBytes(s.displaySize)}') : formatBytes(s.displaySize),
                style: TextStyle(color: AppColors.subtle, fontSize: 12.5),
              ),
            ]),
          ),
          Pill(status, color: color),
        ]),
        const SizedBox(height: 12),
        Wrap(spacing: 14, runSpacing: 6, children: [
          _Meta(LucideIcons.clock, formatExpiresIn(s.expiresAt)),
          _Meta(LucideIcons.download, s.maxDownloads == null ? '${s.downloadCount}' : '${s.downloadCount}/${s.maxDownloads}'),
          if (s.passwordProtected) _Meta(LucideIcons.lock, t('Şifreli', 'Protected')),
          _Meta(LucideIcons.calendar, formatRelative(s.createdAt)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: url));
                showToast(context, t('Bağlantı kopyalandı', 'Link copied'), success: true);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                child: Row(children: [
                  Expanded(
                    child: Text(url.replaceFirst('https://', ''),
                        maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.accentText, fontSize: 13)),
                  ),
                  Icon(LucideIcons.copy, size: 15, color: AppColors.muted),
                ]),
              ),
            ),
          ),
          const SizedBox(width: 8),
          CircleIconButton(
            icon: LucideIcons.share2,
            size: 42,
            onTap: () => SharePlus.instance.share(ShareParams(text: '${s.displayName}\n$url', subject: 'NearDrop')),
          ),
          const SizedBox(width: 8),
          CircleIconButton(icon: LucideIcons.ellipsis, size: 42, onTap: () => _more(context)),
        ]),
      ]),
    );
  }
}

class _Meta extends StatelessWidget {
  final IconData icon;
  final String text;
  const _Meta(this.icon, this.text);

  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 13, color: AppColors.subtle),
        const SizedBox(width: 4),
        Text(text, style: TextStyle(color: AppColors.muted, fontSize: 12.5)),
      ]);
}
