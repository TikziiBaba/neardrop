import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../core/picker.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/thumbnail.dart';
import '../../widgets/ui.dart';
import '../shares/share_create_sheet.dart';
import '../transfer/transfer_screen.dart';
import 'file_actions.dart';
import 'file_preview_screen.dart';

enum _Sort { newest, oldest, name, size }

class FilesScreen extends StatefulWidget {
  const FilesScreen({super.key});

  @override
  State<FilesScreen> createState() => _FilesScreenState();
}

class _FilesScreenState extends State<FilesScreen> {
  String _folder = '';
  String _query = '';
  bool _searching = false;
  bool _grid = false;
  FileCategory? _filter;
  _Sort _sort = _Sort.newest;
  final _selected = <String>{};
  final _search = TextEditingController();

  bool get _selecting => _selected.isNotEmpty;

  Future<void> _pickAndUpload({bool media = false}) async {
    final files = await pickLocalFiles(type: media ? FileType.media : FileType.any);
    if (files.isEmpty || !mounted) return;
    context.read<FilesStore>().upload(files, folder: _folder);
    showToast(context, t('${files.length} dosya yükleniyor', 'Uploading ${files.length} file(s)'), success: true);
  }

  void _showUploadSheet() {
    showSheet(context, builder: (ctx) {
      void run(VoidCallback f) {
        Navigator.pop(ctx);
        f();
      }

      return Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 6),
            child: Text(t('Yükle', 'Upload'), style: AppTheme.display(22)),
          ),
          if (_folder.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 0, 8, 10),
              child: Text(t('Hedef: $_folder', 'Into: $_folder'), style: TextStyle(color: AppColors.subtle)),
            ),
          SheetAction(icon: LucideIcons.files, label: t('Dosya seç', 'Choose files'), onTap: () => run(_pickAndUpload)),
          SheetAction(icon: LucideIcons.images, label: t('Fotoğraf ve video', 'Photos & videos'), onTap: () => run(() => _pickAndUpload(media: true))),
          SheetAction(
            icon: LucideIcons.folderPlus,
            label: t('Yeni klasör', 'New folder'),
            subtitle: t('Klasör, içine dosya yükleyince oluşur', 'The folder appears once you upload into it'),
            onTap: () => run(_newFolder),
          ),
        ]),
      );
    });
  }

  Future<void> _newFolder() async {
    final name = await promptDialog(context, title: t('Yeni klasör', 'New folder'), hint: t('Klasör adı', 'Folder name'), confirm: t('Oluştur', 'Create'));
    if (name == null || name.isEmpty || !mounted) return;
    setState(() => _folder = _folder.isEmpty ? name.replaceAll('/', '-') : '$_folder/${name.replaceAll('/', '-')}');
    _pickAndUpload();
  }

  void _openFolder(String folder) {
    HapticFeedback.selectionClick();
    setState(() {
      _folder = folder;
      _selected.clear();
    });
  }

  void _toggleSelect(CloudFile f) {
    HapticFeedback.selectionClick();
    setState(() => _selected.contains(f.id) ? _selected.remove(f.id) : _selected.add(f.id));
  }

  Future<void> _batchDownload(List<CloudFile> files) async {
    setState(_selected.clear);
    showToast(context, t('${files.length} dosya indiriliyor…', 'Downloading ${files.length} file(s)…'));
    final store = context.read<FilesStore>();
    for (final f in files) {
      try {
        await store.downloadFile(f);
      } catch (_) {}
    }
    if (mounted) showToast(context, t('İndirilenler/NearDrop klasörüne kaydedildi', 'Saved to Downloads/NearDrop'), success: true);
  }

  Future<void> _batchTrash(List<CloudFile> files) async {
    final ok = await confirmDialog(
      context,
      title: t('${files.length} dosya çöpe taşınsın mı?', 'Move ${files.length} file(s) to trash?'),
      message: t('30 gün içinde çöp kutusundan geri yükleyebilirsin.', 'You can restore them from the trash within 30 days.'),
      confirm: t('Çöpe taşı', 'Move to trash'),
      danger: true,
    );
    if (!ok || !mounted) return;
    setState(_selected.clear);
    final store = context.read<FilesStore>();
    var failed = 0;
    for (final f in files) {
      try {
        await store.moveToTrash(f);
      } catch (_) {
        failed++;
      }
    }
    if (mounted) {
      showToast(context,
          failed == 0 ? t('Çöp kutusuna taşındı', 'Moved to trash') : t('$failed dosya taşınamadı', '$failed file(s) failed'),
          success: failed == 0, error: failed > 0);
    }
  }

  void _folderActions(String folder) {
    final store = context.read<FilesStore>();
    final (count, bytes) = store.folderStats(folder);
    showSheet(context, builder: (ctx) {
      void run(VoidCallback f) {
        Navigator.pop(ctx);
        f();
      }

      return Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 12),
            child: Row(children: [
              const FileTypeIcon(category: FileCategory.other, folder: true, size: 50),
              const SizedBox(width: 14),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(folder.split('/').last, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15.5)),
                  Text(t('$count dosya · ${formatBytes(bytes)}', '$count files · ${formatBytes(bytes)}'),
                      style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                ]),
              ),
            ]),
          ),
          SheetAction(icon: LucideIcons.folderOpen, label: t('Aç', 'Open'), onTap: () => run(() => _openFolder(folder))),
          SheetAction(
            icon: LucideIcons.fileArchive,
            label: t('ZIP olarak indir', 'Download as ZIP'),
            onTap: () => run(() async {
              showToast(context, t('ZIP hazırlanıyor…', 'Preparing ZIP…'));
              try {
                await store.downloadFolder(folder);
                if (mounted) showToast(context, t('ZIP İndirilenler/NearDrop klasörüne kaydedildi', 'ZIP saved to Downloads/NearDrop'), success: true);
              } catch (e) {
                if (mounted) showToast(context, e is ApiException ? e.message : e.toString(), error: true);
              }
            }),
          ),
          SheetAction(
            icon: LucideIcons.link2,
            label: t('Klasörü paylaş', 'Share folder'),
            onTap: () => run(() => showCreateShareSheet(context, folderPath: folder)),
          ),
          SheetAction(
            icon: LucideIcons.trash2,
            label: t('Klasörü çöpe taşı', 'Move folder to trash'),
            color: AppColors.danger,
            onTap: () => run(() => _batchTrash(store.files.where((f) => f.filename.startsWith('$folder/')).toList())),
          ),
        ]),
      );
    });
  }

  List<CloudFile> _sorted(List<CloudFile> list) {
    final copy = [...list];
    switch (_sort) {
      case _Sort.newest:
        copy.sort((a, b) => (b.createdAt ?? DateTime(0)).compareTo(a.createdAt ?? DateTime(0)));
      case _Sort.oldest:
        copy.sort((a, b) => (a.createdAt ?? DateTime(0)).compareTo(b.createdAt ?? DateTime(0)));
      case _Sort.name:
        copy.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
      case _Sort.size:
        copy.sort((a, b) => b.size.compareTo(a.size));
    }
    return copy;
  }

  @override
  Widget build(BuildContext context) {
    context.isTr;
    final store = context.watch<FilesStore>();
    final profile = context.watch<AuthStore>().profile;

    List<String> folders;
    List<CloudFile> files;
    if (_query.isNotEmpty || _filter != null) {
      // Arama ve filtre tüm klasörlerde çalışır
      folders = [];
      files = store.files.where((f) {
        final q = _query.isEmpty || f.filename.toLowerCase().contains(_query.toLowerCase());
        final c = _filter == null || f.category == _filter;
        return q && c && (_folder.isEmpty || f.filename.startsWith('$_folder/'));
      }).toList();
    } else {
      (folders, files) = store.listFolder(_folder);
    }
    files = _sorted(files);
    final selectedFiles = store.files.where((f) => _selected.contains(f.id)).toList();

    return PopScope(
      canPop: _folder.isEmpty && !_selecting,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        if (_selecting) {
          setState(_selected.clear);
        } else if (_folder.isNotEmpty) {
          _openFolder(_folder.contains('/') ? _folder.substring(0, _folder.lastIndexOf('/')) : '');
        }
      },
      child: Stack(children: [
        SafeArea(
          bottom: false,
          child: RefreshIndicator(
            onRefresh: store.refresh,
            color: AppColors.accentText,
            backgroundColor: AppColors.surface2,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(child: _header(store, profile?.quotaBytes ?? store.quotaBytes)),
                if (_folder.isNotEmpty) SliverToBoxAdapter(child: _breadcrumbs()),
                SliverToBoxAdapter(child: _filters()),
                if (!store.loadedOnce && store.isLoading)
                  const SliverFillRemaining(hasScrollBody: false, child: Loader())
                else if (store.loadError != null && store.files.isEmpty)
                  SliverFillRemaining(hasScrollBody: false, child: ErrorRetry(message: store.loadError!, onRetry: store.refresh))
                else if (folders.isEmpty && files.isEmpty)
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: EmptyState(
                      title: _query.isNotEmpty || _filter != null
                          ? t('Sonuç yok', 'No results')
                          : (_folder.isEmpty ? t('Henüz dosya yok', 'No files yet') : t('Bu klasör boş', 'This folder is empty')),
                      message: _query.isNotEmpty || _filter != null
                          ? t('Farklı bir arama ya da filtre dene.', 'Try a different search or filter.')
                          : t('İlk dosyanı yükle; Allay onu güvenle saklasın.', 'Upload your first file and Allay will keep it safe.'),
                      action: _query.isEmpty && _filter == null
                          ? PrimaryButton(label: t('Dosya yükle', 'Upload files'), icon: LucideIcons.upload, expand: false, onPressed: _showUploadSheet)
                          : null,
                    ),
                  )
                else if (_grid)
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 0.92,
                      ),
                      delegate: SliverChildListDelegate([
                        ...folders.map((f) => _FolderGridTile(folder: f, onTap: () => _openFolder(f), onMore: () => _folderActions(f))),
                        ...files.map((f) => _FileGridTile(
                              file: f,
                              selected: _selected.contains(f.id),
                              onTap: () => _selecting ? _toggleSelect(f) : _open(f),
                              onLongPress: () => _toggleSelect(f),
                            )),
                      ]),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                    sliver: SliverList.list(children: [
                      ...folders.map((f) => _FolderTile(folder: f, onTap: () => _openFolder(f), onMore: () => _folderActions(f))),
                      ...files.asMap().entries.map((e) => _FileTile(
                            file: e.value,
                            selected: _selected.contains(e.value.id),
                            selecting: _selecting,
                            onTap: () => _selecting ? _toggleSelect(e.value) : _open(e.value),
                            onLongPress: () => _toggleSelect(e.value),
                            onMore: () => showFileActions(context, e.value),
                          ).animate().fadeIn(delay: (20 * e.key.clamp(0, 12)).ms, duration: 260.ms)),
                    ]),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: kNavPadding + 40)),
              ],
            ),
          ),
        ),
        // Yükle butonu / toplu işlem çubuğu
        Positioned(
          right: 18,
          left: _selecting ? 18 : null,
          bottom: MediaQuery.of(context).padding.bottom + 104,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            child: _selecting
                ? FrostedPanel(
                    key: const ValueKey('batch'),
                    padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
                    child: Row(children: [
                      Text(t('${_selected.length} seçili', '${_selected.length} selected'), style: const TextStyle(fontWeight: FontWeight.w700)),
                      const Spacer(),
                      IconButton(
                        tooltip: t('Tümünü seç', 'Select all'),
                        icon: const Icon(LucideIcons.listChecks, size: 20),
                        onPressed: () => setState(() => _selected.addAll(files.map((f) => f.id))),
                      ),
                      IconButton(icon: const Icon(LucideIcons.download, size: 20), onPressed: () => _batchDownload(selectedFiles)),
                      IconButton(icon: Icon(LucideIcons.trash2, size: 20, color: AppColors.danger), onPressed: () => _batchTrash(selectedFiles)),
                      IconButton(icon: const Icon(LucideIcons.x, size: 20), onPressed: () => setState(_selected.clear)),
                    ]),
                  )
                : Pressable(
                    key: const ValueKey('fab'),
                    onTap: _showUploadSheet,
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: AppColors.buttonGradient,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                        boxShadow: [BoxShadow(color: AppColors.accent.withValues(alpha: 0.5), blurRadius: 24, offset: const Offset(0, 8))],
                      ),
                      child: const Icon(LucideIcons.plus, color: Colors.white, size: 28),
                    ),
                  ),
          ),
        ),
      ]),
    );
  }

  void _open(CloudFile f) => Navigator.push(context, MaterialPageRoute(builder: (_) => FilePreviewScreen(file: f)));

  Widget _header(FilesStore store, int quota) {
    return Column(children: [
      PageTitle(
        title: t('Dosyalarım', 'My Files'),
        subtitle: t('${store.files.length} dosya · ${formatBytes(store.usedBytes)} / ${formatBytes(quota)}',
            '${store.files.length} files · ${formatBytes(store.usedBytes)} of ${formatBytes(quota)}'),
        actions: [
          CircleIconButton(
            icon: _searching ? LucideIcons.x : LucideIcons.search,
            onTap: () => setState(() {
              _searching = !_searching;
              if (!_searching) {
                _query = '';
                _search.clear();
              }
            }),
          ),
          PopupMenuButton<Object>(
            tooltip: t('Görünüm', 'View'),
            onSelected: (v) {
              if (v is _Sort) setState(() => _sort = v);
              if (v == 'grid') setState(() => _grid = !_grid);
            },
            itemBuilder: (_) => [
              PopupMenuItem(
                value: 'grid',
                child: Row(children: [
                  Icon(_grid ? LucideIcons.list : LucideIcons.layoutGrid, size: 18),
                  const SizedBox(width: 10),
                  Text(_grid ? t('Liste görünümü', 'List view') : t('Izgara görünümü', 'Grid view')),
                ]),
              ),
              const PopupMenuDivider(),
              for (final (s, label) in [
                (_Sort.newest, t('En yeni', 'Newest')),
                (_Sort.oldest, t('En eski', 'Oldest')),
                (_Sort.name, t('Ada göre', 'By name')),
                (_Sort.size, t('Boyuta göre', 'By size')),
              ])
                PopupMenuItem(
                  value: s,
                  child: Row(children: [
                    Icon(_sort == s ? LucideIcons.check : LucideIcons.arrowUpDown, size: 18, color: _sort == s ? AppColors.accentText : AppColors.subtle),
                    const SizedBox(width: 10),
                    Text(label),
                  ]),
                ),
            ],
            child: const IgnorePointer(child: CircleIconButton(icon: LucideIcons.slidersHorizontal)),
          ),
        ],
      ),
      AnimatedSize(
        duration: const Duration(milliseconds: 250),
        child: _searching
            ? Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                child: TextField(
                  controller: _search,
                  autofocus: true,
                  onChanged: (v) => setState(() => _query = v.trim()),
                  decoration: InputDecoration(hintText: t('Dosyalarda ara…', 'Search files…'), prefixIcon: const Icon(LucideIcons.search, size: 18)),
                ),
              )
            : const SizedBox(width: double.infinity),
      ),
    ]);
  }

  Widget _breadcrumbs() {
    final parts = _folder.split('/');
    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          ActionChip(
            avatar: Icon(LucideIcons.house, size: 15, color: AppColors.accentText),
            label: Text(t('Tümü', 'All')),
            onPressed: () => _openFolder(''),
          ),
          for (var i = 0; i < parts.length; i++) ...[
            Icon(LucideIcons.chevronRight, size: 16, color: AppColors.subtle),
            ActionChip(
              label: Text(parts[i]),
              onPressed: () => _openFolder(parts.sublist(0, i + 1).join('/')),
            ),
          ],
        ],
      ),
    );
  }

  Widget _filters() {
    final cats = [null, ...FileCategory.values];
    return SizedBox(
      height: 50,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
        itemCount: cats.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final c = cats[i];
          return ChoiceChip(
            showCheckmark: false,
            avatar: c == null ? null : Icon(c.icon, size: 15, color: c.color),
            label: Text(c == null ? t('Tümü', 'All') : c.label),
            selected: _filter == c,
            onSelected: (_) => setState(() => _filter = c),
          );
        },
      ),
    );
  }
}

class _FolderTile extends StatelessWidget {
  final String folder;
  final VoidCallback onTap;
  final VoidCallback onMore;
  const _FolderTile({required this.folder, required this.onTap, required this.onMore});

  @override
  Widget build(BuildContext context) {
    final (count, bytes) = context.read<FilesStore>().folderStats(folder);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        padding: const EdgeInsets.fromLTRB(12, 10, 4, 10),
        onTap: onTap,
        onLongPress: onMore,
        child: Row(children: [
          const FileTypeIcon(category: FileCategory.other, folder: true),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(folder.split('/').last, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(t('$count dosya · ${formatBytes(bytes)}', '$count files · ${formatBytes(bytes)}'),
                  style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
            ]),
          ),
          IconButton(icon: Icon(LucideIcons.ellipsisVertical, size: 19, color: AppColors.subtle), onPressed: onMore),
        ]),
      ),
    );
  }
}

class _FileTile extends StatelessWidget {
  final CloudFile file;
  final bool selected;
  final bool selecting;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  final VoidCallback onMore;

  const _FileTile({
    required this.file,
    required this.selected,
    required this.selecting,
    required this.onTap,
    required this.onLongPress,
    required this.onMore,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        padding: const EdgeInsets.fromLTRB(12, 10, 4, 10),
        borderColor: selected ? AppColors.accentText : null,
        color: selected ? AppColors.accent.withValues(alpha: 0.14) : null,
        onTap: onTap,
        onLongPress: onLongPress,
        child: Row(children: [
          Stack(clipBehavior: Clip.none, children: [
            Hero(tag: 'file_${file.id}', child: FileThumb(file: file)),
            if (selected)
              Positioned(
                right: -4,
                bottom: -4,
                child: Container(
                  decoration: BoxDecoration(color: AppColors.accent, shape: BoxShape.circle, border: Border.all(color: AppColors.surface, width: 2)),
                  padding: const EdgeInsets.all(2),
                  child: const Icon(LucideIcons.check, size: 12, color: Colors.white),
                ),
              ),
          ]),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(file.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 3),
              Row(children: [
                Flexible(
                  child: Text('${formatBytes(file.size)} · ${formatRelative(file.createdAt)}',
                      maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                ),
                if (file.activeSharesCount > 0) ...[
                  const SizedBox(width: 6),
                  Icon(LucideIcons.link2, size: 13, color: AppColors.accentText),
                ],
              ]),
            ]),
          ),
          if (!selecting) IconButton(icon: Icon(LucideIcons.ellipsisVertical, size: 19, color: AppColors.subtle), onPressed: onMore),
          if (selecting) const SizedBox(width: 12),
        ]),
      ),
    );
  }
}

class _FolderGridTile extends StatelessWidget {
  final String folder;
  final VoidCallback onTap;
  final VoidCallback onMore;
  const _FolderGridTile({required this.folder, required this.onTap, required this.onMore});

  @override
  Widget build(BuildContext context) {
    final (count, bytes) = context.read<FilesStore>().folderStats(folder);
    return GlassCard(
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      onLongPress: onMore,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Expanded(child: Center(child: FileTypeIcon(category: FileCategory.other, folder: true, size: 64))),
        Text(folder.split('/').last, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
        Text(t('$count dosya · ${formatBytes(bytes)}', '$count files · ${formatBytes(bytes)}'), style: TextStyle(color: AppColors.subtle, fontSize: 12)),
      ]),
    );
  }
}

class _FileGridTile extends StatelessWidget {
  final CloudFile file;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  const _FileGridTile({required this.file, required this.selected, required this.onTap, required this.onLongPress});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(10),
      borderColor: selected ? AppColors.accentText : null,
      color: selected ? AppColors.accent.withValues(alpha: 0.14) : null,
      onTap: onTap,
      onLongPress: onLongPress,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(
          child: LayoutBuilder(
            builder: (_, c) => Center(
              child: Hero(tag: 'file_${file.id}', child: FileThumb(file: file, size: c.maxWidth, radius: 16)),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(file.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        Text(formatBytes(file.size), style: TextStyle(color: AppColors.subtle, fontSize: 12)),
      ]),
    );
  }
}
