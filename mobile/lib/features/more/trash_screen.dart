import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';

/// Web'deki /trash: 30 gün saklanan dosyaları geri yükle ya da kalıcı sil.
class TrashScreen extends StatefulWidget {
  const TrashScreen({super.key});

  @override
  State<TrashScreen> createState() => _TrashScreenState();
}

class _TrashScreenState extends State<TrashScreen> {
  List<TrashFile>? _files;
  int _retention = 30;
  String? _error;
  final _selected = <String>{};
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await Api.get('/api/files/trash');
      _files = ((res['files'] as List?) ?? []).map((e) => TrashFile.fromJson((e as Map).cast<String, dynamic>())).toList();
      _retention = (res['retentionDays'] as num?)?.toInt() ?? 30;
      _error = null;
    } on ApiException catch (e) {
      _error = e.message;
    }
    if (mounted) setState(() {});
  }

  Future<void> _act(String action, {List<String>? ids, bool all = false}) async {
    if (action == 'purge') {
      final ok = await confirmDialog(
        context,
        title: all ? t('Çöp kutusu boşaltılsın mı?', 'Empty trash?') : t('Kalıcı olarak silinsin mi?', 'Delete permanently?'),
        message: t('Bu işlem geri alınamaz.', 'This cannot be undone.'),
        confirm: t('Kalıcı sil', 'Delete forever'),
        danger: true,
      );
      if (!ok) return;
    }
    setState(() => _busy = true);
    try {
      await Api.post('/api/files/trash', {'action': action, 'fileIds': ?ids, if (all) 'all': true});
      if (!mounted) return;
      showToast(context, action == 'restore' ? t('Geri yüklendi', 'Restored') : t('Kalıcı olarak silindi', 'Deleted permanently'), success: true);
      _selected.clear();
      await _load();
      if (action == 'restore' && mounted) context.read<FilesStore>().refresh();
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final files = _files;
    return Scaffold(
      appBar: AppBar(
        title: Text(t('Çöp kutusu', 'Trash')),
        actions: [
          if (files != null && files.isNotEmpty)
            TextButton(
              onPressed: _busy ? null : () => _act('purge', all: true),
              child: Text(t('Boşalt', 'Empty'), style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700)),
            ),
        ],
      ),
      body: AuroraBackground(
        child: SafeArea(
          child: _error != null
              ? ErrorRetry(message: _error!, onRetry: () {
                  setState(() => _error = null);
                  _load();
                })
              : files == null
                  ? const Loader()
                  : files.isEmpty
                      ? EmptyState(
                          title: t('Çöp kutusu boş', 'Trash is empty'),
                          message: t('Silinen dosyalar $_retention gün burada bekler.', 'Deleted files wait here for $_retention days.'),
                        )
                      : Column(children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(20, 4, 20, 10),
                            child: Text(
                              t('Dosyalar $_retention gün sonra kendiliğinden kalıcı olarak silinir.',
                                  'Files are permanently deleted after $_retention days.'),
                              style: TextStyle(color: AppColors.muted, fontSize: 13),
                            ),
                          ),
                          Expanded(
                            child: ListView.separated(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
                              itemCount: files.length,
                              separatorBuilder: (_, _) => const SizedBox(height: 10),
                              itemBuilder: (_, i) {
                                final f = files[i];
                                final sel = _selected.contains(f.id);
                                return GlassCard(
                                  padding: const EdgeInsets.fromLTRB(12, 10, 6, 10),
                                  borderColor: sel ? AppColors.accentText : null,
                                  onTap: () => setState(() => sel ? _selected.remove(f.id) : _selected.add(f.id)),
                                  child: Row(children: [
                                    FileTypeIcon(category: fileCategory(f.mimeType, f.filename), size: 42),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                        Text(f.filename.split('/').last,
                                            maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                                        Text(
                                          '${formatBytes(f.size)} · ${t('${f.daysLeft} gün kaldı', '${f.daysLeft} days left')}',
                                          style: TextStyle(color: f.daysLeft <= 3 ? AppColors.warning : AppColors.subtle, fontSize: 12.5),
                                        ),
                                      ]),
                                    ),
                                    IconButton(
                                      tooltip: t('Geri yükle', 'Restore'),
                                      icon: Icon(LucideIcons.undo2, size: 19, color: AppColors.accentText),
                                      onPressed: _busy ? null : () => _act('restore', ids: [f.id]),
                                    ),
                                    IconButton(
                                      tooltip: t('Kalıcı sil', 'Delete forever'),
                                      icon: Icon(LucideIcons.trash2, size: 19, color: AppColors.danger),
                                      onPressed: _busy ? null : () => _act('purge', ids: [f.id]),
                                    ),
                                  ]),
                                );
                              },
                            ),
                          ),
                        ]),
        ),
      ),
      bottomNavigationBar: _selected.isEmpty
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Row(children: [
                  Expanded(
                    child: SecondaryButton(
                      label: t('${_selected.length} geri yükle', 'Restore ${_selected.length}'),
                      icon: LucideIcons.undo2,
                      loading: _busy,
                      onPressed: () => _act('restore', ids: _selected.toList()),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: PrimaryButton(
                      label: t('Kalıcı sil', 'Delete'),
                      icon: LucideIcons.trash2,
                      danger: true,
                      onPressed: _busy ? null : () => _act('purge', ids: _selected.toList()),
                    ),
                  ),
                ]),
              ),
            ),
    );
  }
}
