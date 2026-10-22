import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:open_filex/open_filex.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../state/files_store.dart';
import '../../state/transfer_item.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';

/// Web'deki GlobalTransferProgress: yükleme ve indirme kuyruğu.
void showTransfersSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      maxChildSize: 0.92,
      builder: (ctx, scroll) => _TransfersList(scroll: scroll),
    ),
  );
}

class TransfersScreen extends StatelessWidget {
  const TransfersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(t('Aktarımlar', 'Transfers'))),
      body: AuroraBackground(child: SafeArea(child: _TransfersList(scroll: ScrollController(), showTitle: false))),
    );
  }
}

class _TransfersList extends StatelessWidget {
  final ScrollController scroll;
  final bool showTitle;
  const _TransfersList({required this.scroll, this.showTitle = true});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<FilesStore>();
    final items = store.transfers;
    final active = items.where((t) => t.isActive).length;
    final failed = items.where((t) => t.status == TransferStatus.failed && t.direction == TransferDirection.upload).toList();

    return ListView(
      controller: scroll,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
      children: [
        Row(children: [
          if (showTitle) Expanded(child: Text(t('Aktarımlar', 'Transfers'), style: AppTheme.display(22))) else const Spacer(),
          if (failed.isNotEmpty)
            TextButton.icon(
              onPressed: () {
                for (final f in failed) {
                  store.retry(f);
                }
              },
              icon: Icon(LucideIcons.rotateCw, size: 15, color: AppColors.warning),
              label: Text(t('Hepsini dene', 'Retry all'), style: TextStyle(color: AppColors.warning)),
            ),
          if (items.length > active)
            TextButton(
              onPressed: store.clearFinished,
              child: Text(t('Temizle', 'Clear'), style: TextStyle(color: AppColors.accentText)),
            ),
        ]),
        const SizedBox(height: 8),
        if (items.isEmpty)
          EmptyState(
            title: t('Aktarım yok', 'No transfers'),
            message: t('Yüklediğin ve indirdiğin dosyalar burada görünür.', 'Files you upload and download show up here.'),
          ),
        ...items.map((item) => Padding(padding: const EdgeInsets.only(bottom: 10), child: _TransferRow(item: item))),
      ],
    );
  }
}

class _TransferRow extends StatelessWidget {
  final TransferItem item;
  const _TransferRow({required this.item});

  @override
  Widget build(BuildContext context) {
    final store = context.read<FilesStore>();
    final up = item.direction == TransferDirection.upload;
    final (label, color) = switch (item.status) {
      TransferStatus.pending => (t('Sırada', 'Queued'), AppColors.subtle),
      TransferStatus.running => (
          item.size > 0 ? '${formatSpeed(item.speed)} · ${formatEta(item.eta)}' : t('İndiriliyor…', 'Downloading…'),
          AppColors.accentText
        ),
      TransferStatus.completed => (up ? t('Yüklendi', 'Uploaded') : t('İndirildi · İndirilenler/NearDrop', 'Saved · Downloads/NearDrop'), AppColors.success),
      TransferStatus.failed => (item.error ?? t('Başarısız', 'Failed'), AppColors.danger),
      TransferStatus.cancelled => (t('İptal edildi', 'Cancelled'), AppColors.subtle),
    };

    return GlassCard(
      padding: const EdgeInsets.fromLTRB(14, 12, 6, 12),
      onTap: !up && item.status == TransferStatus.completed && item.path != null ? () => OpenFilex.open(item.path!) : null,
      child: Column(children: [
        Row(children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
            child: Icon(up ? LucideIcons.cloudUpload : LucideIcons.cloudDownload, color: color, size: 19),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(label, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: color, fontSize: 12)),
            ]),
          ),
          if (item.isActive)
            IconButton(icon: Icon(LucideIcons.x, size: 18, color: AppColors.subtle), onPressed: () => store.cancelTransfer(item))
          else if (up && (item.status == TransferStatus.failed || item.status == TransferStatus.cancelled))
            IconButton(icon: Icon(LucideIcons.rotateCw, size: 18, color: AppColors.warning), onPressed: () => store.retry(item))
          else if (item.status == TransferStatus.completed)
            Padding(padding: const EdgeInsets.all(10), child: Icon(LucideIcons.circleCheck, size: 20, color: AppColors.success)),
        ]),
        if (item.isActive) ...[
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Row(children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: item.status == TransferStatus.pending ? null : item.progress,
                    minHeight: 6,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text('${formatBytes(item.transferred)} / ${formatBytes(item.size)}', style: TextStyle(color: AppColors.subtle, fontSize: 11.5)),
            ]),
          ),
        ],
      ]),
    );
  }
}
