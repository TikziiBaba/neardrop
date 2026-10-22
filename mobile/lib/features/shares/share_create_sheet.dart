import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/api.dart';
import '../../core/config.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../core/tiers.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../state/settings_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../more/plans_screen.dart';

/// Web'deki ShareModal: süre, indirme sınırı, şifre ve "okununca yok ol" seçenekleriyle bağlantı oluşturur.
Future<void> showCreateShareSheet(BuildContext context, {CloudFile? file, String? folderPath}) {
  return showSheet(context, builder: (_) => _CreateShareSheet(file: file, folderPath: folderPath));
}

class _CreateShareSheet extends StatefulWidget {
  final CloudFile? file;
  final String? folderPath;
  const _CreateShareSheet({this.file, this.folderPath});

  @override
  State<_CreateShareSheet> createState() => _CreateShareSheetState();
}

class _CreateShareSheetState extends State<_CreateShareSheet> {
  late int _hours;
  int? _maxDownloads;
  bool _burn = false;
  final _password = TextEditingController();
  final _title = TextEditingController();
  final _description = TextEditingController();
  bool _loading = false;
  ShareLink? _created;

  @override
  void initState() {
    super.initState();
    final rules = TierRules.of(context.read<AuthStore>().profile);
    final preferred = context.read<SettingsStore>().defaultExpirationHours;
    // Tercih edilen süre planın izin verdiği en uzun süreyi aşmasın
    final allowed = expiryOptions.where((o) => rules.atLeast(o.minRank) && o.hours != 0).map((o) => o.hours).toList();
    _hours = allowed.contains(preferred) ? preferred : (allowed.where((h) => h <= preferred).lastOrNull ?? 12);
    _title.text = widget.folderPath?.split('/').last ?? '';
  }

  Future<void> _create() async {
    setState(() => _loading = true);
    try {
      final share = await context.read<FilesStore>().createShare(
            cloudFileId: widget.file?.id,
            folderPath: widget.folderPath,
            title: widget.folderPath != null ? _title.text.trim() : null,
            description: widget.folderPath != null && _description.text.trim().isNotEmpty ? _description.text.trim() : null,
            expiresInHours: _hours,
            maxDownloads: _maxDownloads,
            password: _password.text,
            burnAfterRead: _burn,
          );
      HapticFeedback.mediumImpact();
      setState(() => _created = share);
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _upgrade() {
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (_) => const PlansScreen()));
  }

  @override
  Widget build(BuildContext context) {
    if (_created != null) return ShareResultView(share: _created!);
    final rules = TierRules.of(context.watch<AuthStore>().profile);
    final name = widget.file?.name ?? widget.folderPath?.split('/').last ?? '';
    final isFolder = widget.folderPath != null;
    final folderLocked = isFolder && !rules.folderSharing;

    Widget locked(String text) => GestureDetector(
          onTap: _upgrade,
          child: Pill(text, color: AppColors.warning, icon: LucideIcons.crown),
        );

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(t('Paylaşım bağlantısı', 'Share link'), style: AppTheme.display(22)),
        const SizedBox(height: 10),
        Row(children: [
          FileTypeIcon(category: widget.file?.category ?? FileCategory.other, folder: isFolder, size: 40),
          const SizedBox(width: 12),
          Expanded(child: Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600))),
        ]),
        if (folderLocked) ...[
          const SizedBox(height: 16),
          GlassCard(
            color: AppColors.warning.withValues(alpha: 0.1),
            borderColor: AppColors.warning.withValues(alpha: 0.4),
            padding: const EdgeInsets.all(14),
            onTap: _upgrade,
            child: Row(children: [
              Icon(LucideIcons.crown, color: AppColors.warning),
              const SizedBox(width: 12),
              Expanded(
                child: Text(t('Klasör paylaşımı Pro ve üzeri planlarda.', 'Folder sharing is available on Pro and above.'),
                    style: const TextStyle(fontWeight: FontWeight.w600)),
              ),
              Icon(LucideIcons.chevronRight, size: 18, color: AppColors.warning),
            ]),
          ),
        ],
        if (isFolder && !folderLocked) ...[
          const SizedBox(height: 16),
          TextField(controller: _title, decoration: InputDecoration(labelText: t('Başlık', 'Title'))),
          const SizedBox(height: 10),
          TextField(controller: _description, decoration: InputDecoration(labelText: t('Açıklama (isteğe bağlı)', 'Description (optional)'))),
        ],
        const SizedBox(height: 20),
        Text(t('Geçerlilik süresi', 'Expires after'), style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (final o in expiryOptions)
            ChoiceChip(
              label: Row(mainAxisSize: MainAxisSize.min, children: [
                Text(o.label),
                if (!rules.atLeast(o.minRank)) ...[const SizedBox(width: 4), Icon(LucideIcons.lock, size: 12, color: AppColors.warning)],
              ]),
              selected: _hours == o.hours,
              showCheckmark: false,
              onSelected: rules.atLeast(o.minRank) ? (_) => setState(() => _hours = o.hours) : (_) => _upgrade(),
            ),
        ]),
        const SizedBox(height: 18),
        Row(children: [
          Text(t('İndirme sınırı', 'Download limit'), style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
          const Spacer(),
          if (!rules.customDownloadLimit) locked('Pro'),
        ]),
        const SizedBox(height: 10),
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (final limit in <int?>[null, 1, 5, 20, 50])
            ChoiceChip(
              label: Text(limit == null ? t('Sınırsız', 'Unlimited') : '$limit'),
              selected: _maxDownloads == limit,
              showCheckmark: false,
              onSelected: rules.customDownloadLimit || limit == null ? (_) => setState(() => _maxDownloads = limit) : (_) => _upgrade(),
            ),
        ]),
        const SizedBox(height: 18),
        Row(children: [
          Text(t('Şifre koruması', 'Password protection'), style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
          const Spacer(),
          if (!rules.passwords) locked('Pro'),
        ]),
        const SizedBox(height: 10),
        TextField(
          controller: _password,
          enabled: rules.passwords,
          obscureText: true,
          decoration: InputDecoration(
            hintText: rules.passwords ? t('Boş bırakılırsa şifresiz', 'Leave empty for no password') : t('Pro planla açılır', 'Unlocked with Pro'),
            prefixIcon: const Icon(LucideIcons.keyRound, size: 18),
          ),
        ),
        const SizedBox(height: 8),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          value: _burn,
          onChanged: (v) => setState(() => _burn = v),
          title: Text(t('Okununca yok olsun', 'Burn after read'), style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text(t('İlk indirmeden sonra bağlantı kapanır', 'Link closes after the first download'),
              style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
        ),
        const SizedBox(height: 12),
        PrimaryButton(
          label: t('Bağlantı oluştur', 'Create link'),
          icon: LucideIcons.link2,
          loading: _loading,
          onPressed: folderLocked ? null : _create,
        ),
      ]),
    );
  }
}

/// Oluşturulan bağlantı: QR, kopyala, paylaş.
class ShareResultView extends StatelessWidget {
  final ShareLink share;
  const ShareResultView({super.key, required this.share});

  @override
  Widget build(BuildContext context) {
    final url = AppConfig.shareUrl(share.token);
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
      child: Column(children: [
        Icon(LucideIcons.circleCheck, color: AppColors.success, size: 40).animate().scale(curve: Curves.easeOutBack, duration: 500.ms),
        const SizedBox(height: 8),
        Text(t('Bağlantı hazır', 'Link ready'), style: AppTheme.display(22)),
        const SizedBox(height: 4),
        Text(formatExpiresIn(share.expiresAt), style: TextStyle(color: AppColors.muted)),
        const SizedBox(height: 18),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)),
          child: QrImageView(
            data: url,
            size: 190,
            eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.circle, color: AppColors.deepBlue),
            dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.circle, color: AppColors.deepBlue),
          ),
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () {
            Clipboard.setData(ClipboardData(text: url));
            showToast(context, t('Bağlantı kopyalandı', 'Link copied'), success: true);
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
            child: Row(children: [
              Expanded(child: Text(url, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.accentText))),
              const SizedBox(width: 8),
              Icon(LucideIcons.copy, size: 16, color: AppColors.muted),
            ]),
          ),
        ),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
            child: SecondaryButton(
              label: t('Kopyala', 'Copy'),
              icon: LucideIcons.copy,
              onPressed: () {
                Clipboard.setData(ClipboardData(text: url));
                showToast(context, t('Bağlantı kopyalandı', 'Link copied'), success: true);
              },
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: PrimaryButton(
              label: t('Paylaş', 'Share'),
              icon: LucideIcons.share2,
              onPressed: () => SharePlus.instance.share(ShareParams(text: '${share.displayName}\n$url', subject: 'NearDrop')),
            ),
          ),
        ]),
      ]),
    );
  }
}
