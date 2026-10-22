import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/config.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/picker.dart';
import '../../core/tiers.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/thumbnail.dart';
import '../../widgets/ui.dart';
import '../files/file_actions.dart';
import '../files/file_preview_screen.dart';
import '../more/plans_screen.dart';
import '../more/storage_screen.dart';
import '../share/open_link_sheet.dart';
import '../shell/home_shell.dart';
import '../transfer/transfer_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 6) return t('İyi geceler', 'Good night');
    if (h < 12) return t('Günaydın', 'Good morning');
    if (h < 18) return t('İyi günler', 'Good afternoon');
    return t('İyi akşamlar', 'Good evening');
  }

  Future<void> _quickUpload(BuildContext context) async {
    final files = await pickLocalFiles();
    if (files.isEmpty || !context.mounted) return;
    context.read<FilesStore>().upload(files);
    showToast(context, t('${files.length} dosya yükleniyor', 'Uploading ${files.length} file(s)'), success: true);
  }

  @override
  Widget build(BuildContext context) {
    context.isTr;
    final auth = context.watch<AuthStore>();
    final store = context.watch<FilesStore>();
    final p = auth.profile;
    // Çıkış animasyonu sırasında profil boş olabilir
    if (p == null) return const SizedBox.shrink();
    final firstName = p.displayName.split(' ').first;
    final images = store.files.where((f) => f.category == FileCategory.image).take(8).toList();
    final recent = store.files.take(5).toList();
    final liveShares = store.shares.where((s) => s.isLive).take(4).toList();

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([store.refresh(), auth.refreshProfile()]);
        },
        color: AppColors.accentText,
        backgroundColor: AppColors.surface2,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, kNavPadding),
          children: [
            Row(children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(_greeting(), style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text.rich(TextSpan(children: [
                    TextSpan(text: '$firstName ', style: AppTheme.display(30)),
                    TextSpan(text: '✦', style: AppTheme.display(24, color: AppColors.accentText)),
                  ])),
                ]),
              ),
              CircleIconButton(icon: LucideIcons.link, tooltip: t('Bağlantı aç', 'Open link'), onTap: () => showOpenLinkSheet(context)),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => ShellController.instance.go(4),
                child: UserAvatar(url: p.avatarUrl, name: p.displayName, size: 46),
              ),
            ]).animate().fadeIn(duration: 400.ms),
            const SizedBox(height: 20),
            _StorageCard(used: store.usedBytes, quota: p.quotaBytes, tier: p.subscriptionTier, categories: store.categories)
                .animate()
                .fadeIn(delay: 80.ms, duration: 450.ms)
                .moveY(begin: 14, end: 0),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(
                child: _QuickAction(
                  icon: LucideIcons.cloudUpload,
                  label: t('Yükle', 'Upload'),
                  color: AppColors.accentText,
                  onTap: () => _quickUpload(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickAction(
                  icon: LucideIcons.radar,
                  label: t('Yakına gönder', 'Nearby'),
                  color: AppColors.success,
                  onTap: () => ShellController.instance.go(2),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickAction(
                  icon: LucideIcons.link2,
                  label: t('Paylaşımlar', 'Shares'),
                  color: AppColors.fileVideo,
                  onTap: () => ShellController.instance.go(3),
                ),
              ),
            ]).animate().fadeIn(delay: 140.ms, duration: 450.ms).moveY(begin: 14, end: 0),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: _Stat(icon: LucideIcons.files, value: '${store.files.length}', label: t('Dosya', 'Files'))),
              const SizedBox(width: 10),
              Expanded(child: _Stat(icon: LucideIcons.link2, value: '${store.activeShares}', label: t('Aktif bağlantı', 'Live links'))),
              const SizedBox(width: 10),
              Expanded(child: _Stat(icon: LucideIcons.download, value: '${store.totalShareDownloads}', label: t('İndirme', 'Downloads'))),
            ]).animate().fadeIn(delay: 200.ms, duration: 450.ms),
            if (images.isNotEmpty) ...[
              const SizedBox(height: 10),
              SectionHeader(title: t('Son görseller', 'Recent photos'), action: t('Tümü', 'All'), onAction: () => ShellController.instance.go(1)),
              SizedBox(
                height: 104,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: images.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 10),
                  itemBuilder: (_, i) => Pressable(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => FilePreviewScreen(file: images[i]))),
                    child: Hero(tag: 'file_${images[i].id}', child: FileThumb(file: images[i], size: 104, radius: 20)),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 10),
            SectionHeader(title: t('Son dosyalar', 'Recent files'), action: t('Tümü', 'All'), onAction: () => ShellController.instance.go(1)),
            if (!store.loadedOnce && store.isLoading)
              const Padding(padding: EdgeInsets.all(24), child: Loader())
            else if (recent.isEmpty)
              GlassCard(
                onTap: () => _quickUpload(context),
                child: Row(children: [
                  Icon(LucideIcons.cloudUpload, color: AppColors.accentText),
                  const SizedBox(width: 12),
                  Expanded(child: Text(t('İlk dosyanı yükle', 'Upload your first file'), style: const TextStyle(fontWeight: FontWeight.w600))),
                  Icon(LucideIcons.chevronRight, size: 18, color: AppColors.subtle),
                ]),
              )
            else
              GlassCard(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Column(
                  children: recent
                      .map((f) => ListTile(
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => FilePreviewScreen(file: f))),
                            onLongPress: () => showFileActions(context, f),
                            leading: FileThumb(file: f, size: 42),
                            title: Text(f.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('${formatBytes(f.size)} · ${formatRelative(f.createdAt)}',
                                style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                            trailing: IconButton(
                              icon: Icon(LucideIcons.ellipsisVertical, size: 18, color: AppColors.subtle),
                              onPressed: () => showFileActions(context, f),
                            ),
                          ))
                      .toList(),
                ),
              ),
            const SizedBox(height: 10),
            SectionHeader(title: t('Aktif paylaşımlar', 'Active shares'), action: t('Tümü', 'All'), onAction: () => ShellController.instance.go(3)),
            if (liveShares.isEmpty)
              GlassCard(
                child: Text(
                  t('Henüz aktif bağlantın yok. Bir dosyanın menüsünden bağlantı oluşturabilirsin.',
                      'No live links yet. Create one from any file menu.'),
                  style: TextStyle(color: AppColors.muted),
                ),
              )
            else
              ...liveShares.map((s) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GlassCard(
                      padding: const EdgeInsets.fromLTRB(14, 12, 6, 12),
                      child: Row(children: [
                        FileTypeIcon(category: fileCategory(s.fileMime ?? '', s.displayName), folder: s.isFolder, size: 40),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(s.displayName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                            Text('${formatExpiresIn(s.expiresAt)} · ${s.downloadCount} ${t('indirme', 'downloads')}',
                                style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                          ]),
                        ),
                        IconButton(
                          icon: Icon(LucideIcons.copy, size: 18, color: AppColors.accentText),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: AppConfig.shareUrl(s.token)));
                            showToast(context, t('Bağlantı kopyalandı', 'Link copied'), success: true);
                          },
                        ),
                      ]),
                    ),
                  )),
            if (!p.isPaid) ...[
              const SizedBox(height: 10),
              GlassCard(
                gradient: LinearGradient(
                  colors: [AppColors.accent.withValues(alpha: 0.35), AppColors.deepBlue.withValues(alpha: 0.6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderColor: AppColors.accentText.withValues(alpha: 0.4),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlansScreen())),
                child: Row(children: [
                  Icon(LucideIcons.crown, color: AppColors.warning, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(t('Pro\'ya geç', 'Go Pro'), style: AppTheme.display(18)),
                      const SizedBox(height: 2),
                      Text(t('100 GB, şifreli bağlantılar, klasör paylaşımı', '100 GB, password links, folder sharing'),
                          style: TextStyle(color: AppColors.muted, fontSize: 13)),
                    ]),
                  ),
                  const Icon(LucideIcons.arrowRight, size: 20),
                ]),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StorageCard extends StatelessWidget {
  final int used;
  final int quota;
  final String tier;
  final List<CategoryStat> categories;
  const _StorageCard({required this.used, required this.quota, required this.tier, required this.categories});

  @override
  Widget build(BuildContext context) {
    final pct = quota <= 0 ? 0 : (used / quota * 100);
    return GlassCard(
      glow: true,
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StorageScreen())),
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.surface2.withValues(alpha: 0.95), AppColors.deepBlue.withValues(alpha: 0.7)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(LucideIcons.hardDrive, size: 18, color: AppColors.accentText),
          const SizedBox(width: 8),
          Text(t('Depolama', 'Storage'), style: const TextStyle(fontWeight: FontWeight.w700)),
          const Spacer(),
          Pill(tierName(tier), color: tier == 'free' ? AppColors.muted : AppColors.warning, icon: tier == 'free' ? null : LucideIcons.crown),
        ]),
        const SizedBox(height: 14),
        Text.rich(TextSpan(children: [
          TextSpan(text: formatBytes(used), style: AppTheme.display(30)),
          TextSpan(text: '  / ${formatBytes(quota)}', style: TextStyle(color: AppColors.muted, fontSize: 14)),
        ])),
        const SizedBox(height: 12),
        // Kategori dağılımı
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            height: 10,
            child: Row(children: [
              ...categories.map((c) => Expanded(
                    flex: (c.bytes / (quota <= 0 ? 1 : quota) * 1000).round().clamp(1, 1000),
                    child: Container(color: c.category.color),
                  )),
              Expanded(
                flex: ((quota - used) / (quota <= 0 ? 1 : quota) * 1000).round().clamp(1, 1000),
                child: Container(color: AppColors.surface3),
              ),
            ]),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(spacing: 12, runSpacing: 6, children: [
          ...categories.take(4).map((c) => Row(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: c.category.color, shape: BoxShape.circle)),
                const SizedBox(width: 5),
                Text('${c.category.label} ${formatBytes(c.bytes)}', style: TextStyle(color: AppColors.muted, fontSize: 12)),
              ])),
          Text(t('%${pct.toStringAsFixed(1)} dolu', '${pct.toStringAsFixed(1)}% used'), style: TextStyle(color: AppColors.subtle, fontSize: 12)),
        ]),
      ]),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickAction({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      child: Column(children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.14),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(height: 8),
        Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
      ]),
    );
  }
}

class _Stat extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  const _Stat({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 17, color: AppColors.subtle),
        const SizedBox(height: 8),
        Text(value, style: AppTheme.display(24)),
        Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.subtle, fontSize: 12)),
      ]),
    );
  }
}
