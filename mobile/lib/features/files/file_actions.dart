import 'dart:io';

import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/thumbnail.dart';
import '../../widgets/ui.dart';
import '../shares/share_create_sheet.dart';
import '../shell/home_shell.dart';
import '../transfer/p2p_engine.dart';
import 'file_preview_screen.dart';

Future<void> downloadWithToast(BuildContext context, CloudFile file) async {
  showToast(context, t('İndirme başladı…', 'Download started…'));
  try {
    final path = await context.read<FilesStore>().downloadFile(file);
    if (!context.mounted) return;
    showToast(context, t('İndirildi · İndirilenler/NearDrop', 'Downloaded · Downloads/NearDrop'), success: true);
    if (path != null) OpenFilex.open(path);
  } on ApiException catch (e) {
    if (context.mounted) showToast(context, e.message, error: true);
  }
}

Future<void> trashWithConfirm(BuildContext context, CloudFile file) async {
  final ok = await confirmDialog(
    context,
    title: t('Çöp kutusuna taşınsın mı?', 'Move to trash?'),
    message: t('"${file.name}" 30 gün boyunca çöp kutusunda kalır. Paylaşım bağlantıları kapatılır.',
        '"${file.name}" stays in the trash for 30 days. Its share links are removed.'),
    confirm: t('Çöpe taşı', 'Move to trash'),
    danger: true,
  );
  if (!ok || !context.mounted) return;
  try {
    await context.read<FilesStore>().moveToTrash(file);
    if (context.mounted) showToast(context, t('Çöp kutusuna taşındı', 'Moved to trash'), success: true);
  } on ApiException catch (e) {
    if (context.mounted) showToast(context, e.message, error: true);
  }
}

Future<void> renameWithPrompt(BuildContext context, CloudFile file) async {
  final name = await promptDialog(context, title: t('Yeniden adlandır', 'Rename'), initial: file.name);
  if (name == null || name.isEmpty || name == file.name || !context.mounted) return;
  if (name.contains('/')) {
    showToast(context, t('Ad "/" içeremez.', 'Name cannot contain "/".'), error: true);
    return;
  }
  try {
    await context.read<FilesStore>().rename(file, name);
    if (context.mounted) showToast(context, t('Ad değiştirildi', 'Renamed'), success: true);
  } on ApiException catch (e) {
    if (context.mounted) showToast(context, e.message, error: true);
  }
}

/// Buluttaki dosyayı geçici klasöre indirip doğrudan aktarım için hazırlar.
Future<void> sendToNearby(BuildContext context, CloudFile file) async {
  showToast(context, t('Dosya hazırlanıyor…', 'Preparing file…'));
  try {
    final res = await Api.post('/api/files/download', {'fileId': file.id});
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/nearby_${DateTime.now().millisecondsSinceEpoch}_${file.name}';
    await Api.raw.download('${res['downloadUrl']}', path);
    if (!context.mounted) return;
    context.read<P2PEngine>().stageFiles([LocalFile(path, file.name, File(path).lengthSync())]);
    ShellController.instance.go(2);
  } catch (e) {
    if (context.mounted) showToast(context, e is ApiException ? e.message : e.toString(), error: true);
  }
}

void showFileActions(BuildContext context, CloudFile file) {
  showSheet(context, builder: (ctx) {
    void run(void Function() action) {
      Navigator.pop(ctx);
      action();
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(8, 0, 8, 12),
          child: Row(children: [
            FileThumb(file: file, size: 50),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(file.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15.5)),
                const SizedBox(height: 2),
                Text('${formatBytes(file.size)} · ${formatRelative(file.createdAt)}', style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
              ]),
            ),
          ]),
        ),
        SheetAction(
          icon: LucideIcons.eye,
          label: t('Önizle', 'Preview'),
          onTap: () => run(() => Navigator.push(context, MaterialPageRoute(builder: (_) => FilePreviewScreen(file: file)))),
        ),
        SheetAction(icon: LucideIcons.download, label: t('İndir', 'Download'), onTap: () => run(() => downloadWithToast(context, file))),
        SheetAction(
          icon: LucideIcons.link2,
          label: t('Paylaşım bağlantısı oluştur', 'Create share link'),
          onTap: () => run(() => showCreateShareSheet(context, file: file)),
        ),
        SheetAction(
          icon: LucideIcons.radar,
          label: t('Yakındaki cihaza gönder', 'Send to nearby device'),
          onTap: () => run(() => sendToNearby(context, file)),
        ),
        SheetAction(icon: LucideIcons.pencil, label: t('Yeniden adlandır', 'Rename'), onTap: () => run(() => renameWithPrompt(context, file))),
        SheetAction(icon: LucideIcons.info, label: t('Ayrıntılar', 'Details'), onTap: () => run(() => showFileDetails(context, file))),
        SheetAction(
          icon: LucideIcons.trash2,
          label: t('Çöp kutusuna taşı', 'Move to trash'),
          color: AppColors.danger,
          onTap: () => run(() => trashWithConfirm(context, file)),
        ),
      ]),
    );
  });
}

void showFileDetails(BuildContext context, CloudFile file) {
  final shares = context.read<FilesStore>().shares.where((s) => s.cloudFileId == file.id).toList();
  showSheet(context, builder: (ctx) {
    Widget row(String k, String v, {bool mono = false}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            SizedBox(width: 110, child: Text(k, style: TextStyle(color: AppColors.subtle))),
            Expanded(
              child: SelectableText(v, style: TextStyle(fontWeight: FontWeight.w600, fontFamily: mono ? 'monospace' : null, fontSize: mono ? 12 : 14)),
            ),
          ]),
        );
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(t('Ayrıntılar', 'Details'), style: AppTheme.display(22)),
        const SizedBox(height: 12),
        row(t('Ad', 'Name'), file.name),
        if (file.folder.isNotEmpty) row(t('Klasör', 'Folder'), file.folder),
        row(t('Boyut', 'Size'), '${formatBytes(file.size, 2)} (${file.size} B)'),
        row(t('Tür', 'Type'), file.mimeType),
        row(t('Kategori', 'Category'), file.category.label),
        row(t('Yüklenme', 'Uploaded'), formatDate(file.createdAt)),
        row(t('Paylaşımlar', 'Shares'), t('${shares.where((s) => s.isLive).length} aktif', '${shares.where((s) => s.isLive).length} active')),
        if (file.checksum != null) row('SHA-256', file.checksum!, mono: true),
      ]),
    );
  });
}
