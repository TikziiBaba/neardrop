import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:open_filex/open_filex.dart';
import 'package:provider/provider.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/allay.dart';
import '../../widgets/ui.dart';

/// Web'deki /s/[token] sayfası: paylaşılan dosya veya klasörü görüntüle ve indir.
class PublicShareScreen extends StatefulWidget {
  final String token;
  const PublicShareScreen({super.key, required this.token});

  @override
  State<PublicShareScreen> createState() => _PublicShareScreenState();
}

class _PublicShareScreenState extends State<PublicShareScreen> {
  PublicShare? _share;
  String? _error;
  bool _loading = true;
  final _password = TextEditingController();
  String _folder = '';
  String _query = '';
  final _busy = <String>{};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await Api.get('/api/download', query: {'token': widget.token});
      _share = PublicShare.fromJson(widget.token, res);
    } on ApiException catch (e) {
      _error = e.message;
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _downloadSingle({CloudFile? file}) async {
    final key = file?.id ?? 'single';
    if (_share!.passwordProtected && _password.text.isEmpty) {
      showToast(context, t('Önce şifreyi gir.', 'Enter the password first.'), error: true);
      return;
    }
    setState(() => _busy.add(key));
    try {
      final res = await Api.post('/api/download', {
        'token': widget.token,
        if (_password.text.isNotEmpty) 'password': _password.text,
        'fileId': ?file?.id,
      });
      if (!mounted) return;
      final store = context.read<FilesStore>();
      final path = await store.downloadUrl('${res['downloadUrl']}', '${res['filename']}', size: (res['size'] as num?)?.toInt() ?? 0);
      if (!mounted) return;
      showToast(context, t('İndirildi · İndirilenler/NearDrop', 'Downloaded · Downloads/NearDrop'), success: true);
      if (path != null) OpenFilex.open(path);
      if (res['burnAfterRead'] == true) _load();
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy.remove(key));
    }
  }

  Future<void> _downloadZip() async {
    setState(() => _busy.add('zip'));
    try {
      final res = await Api.post('/api/download', {
        'token': widget.token,
        if (_password.text.isNotEmpty) 'password': _password.text,
        'batch': true,
      });
      if (!mounted) return;
      final items = ((res['items'] as List?) ?? []).cast<Map>();
      await context.read<FilesStore>().saveItemsAsZip('${res['folderName'] ?? 'NearDrop'}', items);
      if (mounted) showToast(context, t('ZIP İndirilenler/NearDrop klasörüne kaydedildi.', 'ZIP saved to Downloads/NearDrop.'), success: true);
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _busy.remove('zip'));
    }
  }

  @override
  Widget build(BuildContext context) {
    context.isTr;
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(title: const LogoRow(size: 32)),
      body: AuroraBackground(
        child: SafeArea(
          child: _loading
              ? const Loader()
              : _error != null
                  ? _ErrorView(message: _error!, onRetry: _load)
                  : _content(),
        ),
      ),
    );
  }

  Widget _content() {
    final s = _share!;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
      children: [
        GlassCard(
          glow: true,
          padding: const EdgeInsets.all(20),
          child: Column(children: [
            FileTypeIcon(category: s.file?.category ?? FileCategory.other, folder: s.isFolder, size: 68),
            const SizedBox(height: 14),
            Text(s.displayName, textAlign: TextAlign.center, style: AppTheme.display(22)),
            if (s.description != null && s.description!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(s.description!, textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
            ],
            const SizedBox(height: 12),
            Wrap(alignment: WrapAlignment.center, spacing: 8, runSpacing: 8, children: [
              Pill(formatBytes(s.totalSize), color: AppColors.accentText, icon: LucideIcons.hardDrive),
              if (s.isFolder) Pill(t('${s.files.length} dosya', '${s.files.length} files'), color: AppColors.accentText, icon: LucideIcons.files),
              Pill(formatExpiresIn(s.expiresAt), color: AppColors.warning, icon: LucideIcons.clock),
              if (s.maxDownloads != null)
                Pill('${s.downloadCount}/${s.maxDownloads} ${t('indirme', 'downloads')}', color: AppColors.muted, icon: LucideIcons.download),
              if (s.passwordProtected) Pill(t('Şifreli', 'Protected'), color: AppColors.fileVideo, icon: LucideIcons.lock),
            ]),
          ]),
        ).animate().fadeIn(duration: 400.ms).moveY(begin: 12, end: 0),
        const SizedBox(height: 16),
        if (s.passwordProtected) ...[
          TextField(
            controller: _password,
            obscureText: true,
            decoration: InputDecoration(
              labelText: t('Erişim şifresi', 'Access password'),
              prefixIcon: const Icon(LucideIcons.keyRound, size: 18),
            ),
          ),
          const SizedBox(height: 14),
        ],
        if (!s.isFolder)
          PrimaryButton(
            label: t('Dosyayı indir', 'Download file'),
            icon: LucideIcons.download,
            loading: _busy.contains('single'),
            onPressed: () => _downloadSingle(),
          )
        else ...[
          PrimaryButton(
            label: t('Tümünü ZIP olarak indir', 'Download all as ZIP'),
            icon: LucideIcons.fileArchive,
            loading: _busy.contains('zip'),
            onPressed: _downloadZip,
          ),
          const SizedBox(height: 18),
          _folderBrowser(s),
        ],
        const SizedBox(height: 18),
        Center(
          child: Text(
            t('NearDrop ile güvenle paylaşıldı', 'Shared securely with NearDrop'),
            style: TextStyle(color: AppColors.subtle, fontSize: 12.5),
          ),
        ),
      ],
    );
  }

  Widget _folderBrowser(PublicShare s) {
    // Dosya adları sahibin tam yoluyla gelir; paylaşılan klasöre göre göreli yol çıkarılır
    final root = s.files.isEmpty ? '' : _commonRoot(s);
    final rel = s.files.map((f) => (f, f.filename.startsWith('$root/') ? f.filename.substring(root.length + 1) : f.name)).toList();
    final prefix = _folder.isEmpty ? '' : '$_folder/';
    final folders = <String>{};
    final files = <(CloudFile, String)>[];
    for (final (f, path) in rel) {
      if (_query.isNotEmpty) {
        if (path.toLowerCase().contains(_query.toLowerCase())) files.add((f, path));
        continue;
      }
      if (!path.startsWith(prefix)) continue;
      final rest = path.substring(prefix.length);
      final slash = rest.indexOf('/');
      if (slash < 0) {
        files.add((f, path));
      } else {
        folders.add('$prefix${rest.substring(0, slash)}');
      }
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      TextField(
        onChanged: (v) => setState(() => _query = v),
        decoration: InputDecoration(hintText: t('Klasörde ara…', 'Search in folder…'), prefixIcon: const Icon(LucideIcons.search, size: 18)),
      ),
      const SizedBox(height: 12),
      if (_folder.isNotEmpty && _query.isEmpty)
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(LucideIcons.cornerLeftUp),
          title: Text(t('Üst klasör', 'Parent folder')),
          subtitle: Text(_folder, style: TextStyle(color: AppColors.subtle)),
          onTap: () => setState(() => _folder = _folder.contains('/') ? _folder.substring(0, _folder.lastIndexOf('/')) : ''),
        ),
      ...folders.map((folder) {
        final count = rel.where((e) => e.$2.startsWith('$folder/')).length;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: GlassCard(
            padding: const EdgeInsets.all(12),
            onTap: () => setState(() => _folder = folder),
            child: Row(children: [
              const FileTypeIcon(category: FileCategory.other, folder: true, size: 42),
              const SizedBox(width: 12),
              Expanded(child: Text(folder.split('/').last, style: const TextStyle(fontWeight: FontWeight.w600))),
              Text(t('$count dosya', '$count files'), style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
              Icon(LucideIcons.chevronRight, size: 18, color: AppColors.subtle),
            ]),
          ),
        );
      }),
      ...files.map((e) {
        final (f, path) = e;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: GlassCard(
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              FileTypeIcon(category: f.category, size: 42),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(path.split('/').last, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text(formatBytes(f.size), style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                ]),
              ),
              _busy.contains(f.id)
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2.4))
                  : CircleIconButton(icon: LucideIcons.download, size: 40, onTap: () => _downloadSingle(file: f)),
            ]),
          ),
        );
      }),
      if (folders.isEmpty && files.isEmpty)
        Padding(
          padding: const EdgeInsets.all(24),
          child: Center(child: Text(t('Bu klasör boş', 'This folder is empty'), style: TextStyle(color: AppColors.muted))),
        ),
    ]);
  }

  String _commonRoot(PublicShare s) {
    final title = s.title ?? '';
    // Klasör yolu "Ana/Alt" ise dosyalar "Ana/Alt/..." ile başlar; başlık son parçadır
    final first = s.files.first.filename;
    final idx = first.indexOf('$title/');
    if (title.isNotEmpty && idx >= 0) return first.substring(0, idx + title.length);
    return '';
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const AllayMascot(size: 110),
          const SizedBox(height: 14),
          Text(t('Bağlantı açılamadı', "Couldn't open link"), style: AppTheme.display(22)),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
          const SizedBox(height: 20),
          SecondaryButton(label: t('Tekrar dene', 'Retry'), icon: LucideIcons.refreshCw, expand: false, onPressed: onRetry),
        ]),
      ),
    );
  }
}
