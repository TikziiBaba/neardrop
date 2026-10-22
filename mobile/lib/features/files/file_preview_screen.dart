import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../shares/share_create_sheet.dart';
import 'file_actions.dart';

/// Web'deki FilePreviewModal: görsel, video/ses, metin (düzenlenebilir) önizleme.
class FilePreviewScreen extends StatefulWidget {
  final CloudFile file;
  const FilePreviewScreen({super.key, required this.file});

  @override
  State<FilePreviewScreen> createState() => _FilePreviewScreenState();
}

class _FilePreviewScreenState extends State<FilePreviewScreen> {
  Map<String, dynamic>? _data;
  String? _error;
  VideoPlayerController? _video;
  final _text = TextEditingController();
  String _original = '';
  bool _saving = false;

  CloudFile get file => widget.file;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _video?.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final data = await context.read<FilesStore>().preview(file);
      final cat = file.category;
      if ((cat == FileCategory.video || cat == FileCategory.audio) && data['previewUrl'] != null) {
        final c = VideoPlayerController.networkUrl(Uri.parse('${data['previewUrl']}'));
        _video = c;
        await c.initialize();
        c.addListener(() {
          if (mounted) setState(() {});
        });
        await c.play();
      }
      if (data['textContent'] is String) {
        _original = data['textContent'] as String;
        _text.text = _original;
      }
      if (mounted) setState(() => _data = data);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await context.read<FilesStore>().saveContent(file, _text.text);
      _original = _text.text;
      if (mounted) showToast(context, t('Kaydedildi', 'Saved'), success: true);
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dirty = _data?['textContent'] is String && _text.text != _original;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(file.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTheme.display(17)),
          Text(formatBytes(file.size), style: TextStyle(color: AppColors.subtle, fontSize: 12)),
        ]),
        actions: [
          if (dirty)
            _saving
                ? const Padding(padding: EdgeInsets.all(14), child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)))
                : IconButton(icon: Icon(LucideIcons.save, color: AppColors.accentText), onPressed: _save),
          IconButton(icon: const Icon(LucideIcons.link2), onPressed: () => showCreateShareSheet(context, file: file)),
          IconButton(icon: const Icon(LucideIcons.download), onPressed: () => downloadWithToast(context, file)),
        ],
      ),
      body: _error != null
          ? ErrorRetry(message: _error!, onRetry: () {
              setState(() => _error = null);
              _load();
            })
          : _data == null
              ? Loader(label: t('Önizleme hazırlanıyor…', 'Preparing preview…'))
              : _body(),
    );
  }

  Widget _body() {
    final url = _data!['previewUrl'] as String?;
    final cat = file.category;

    if (_data!['textContent'] is String) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
        child: Container(
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.border)),
          child: TextField(
            controller: _text,
            maxLines: null,
            expands: true,
            onChanged: (_) => setState(() {}),
            style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.45),
            decoration: const InputDecoration(
              filled: false,
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              contentPadding: EdgeInsets.all(14),
            ),
          ),
        ),
      );
    }

    if (cat == FileCategory.image && url != null) {
      return InteractiveViewer(
        maxScale: 6,
        child: Center(
          child: Hero(
            tag: 'file_${file.id}',
            child: Image.network(
              url,
              fit: BoxFit.contain,
              loadingBuilder: (_, child, p) => p == null ? child : const Loader(),
              errorBuilder: (_, _, _) => _noPreview(),
            ),
          ),
        ),
      );
    }

    final v = _video;
    if (v != null && v.value.isInitialized) {
      final isAudio = cat == FileCategory.audio;
      final pos = v.value.position;
      final dur = v.value.duration;
      String fmt(Duration d) => '${d.inMinutes.remainder(60).toString().padLeft(2, '0')}:${d.inSeconds.remainder(60).toString().padLeft(2, '0')}';
      return Column(children: [
        Expanded(
          child: Center(
            child: isAudio
                ? Column(mainAxisSize: MainAxisSize.min, children: [
                    FileTypeIcon(category: cat, size: 120),
                    const SizedBox(height: 20),
                    Text(file.name, textAlign: TextAlign.center, style: AppTheme.display(20)),
                  ])
                : AspectRatio(aspectRatio: v.value.aspectRatio, child: VideoPlayer(v)),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
          child: GlassCard(
            padding: const EdgeInsets.fromLTRB(8, 4, 16, 4),
            child: Row(children: [
              IconButton(
                icon: Icon(v.value.isPlaying ? LucideIcons.pause : LucideIcons.play, color: AppColors.accentText),
                onPressed: () => v.value.isPlaying ? v.pause() : v.play(),
              ),
              Text(fmt(pos), style: const TextStyle(fontSize: 12)),
              Expanded(
                child: Slider(
                  value: pos.inMilliseconds.clamp(0, dur.inMilliseconds).toDouble(),
                  max: dur.inMilliseconds.toDouble().clamp(1, double.infinity),
                  activeColor: AppColors.accentText,
                  onChanged: (x) => v.seekTo(Duration(milliseconds: x.round())),
                ),
              ),
              Text(fmt(dur), style: const TextStyle(fontSize: 12)),
            ]),
          ),
        ),
      ]);
    }

    return _noPreview();
  }

  Widget _noPreview() => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            FileTypeIcon(category: file.category, size: 96),
            const SizedBox(height: 18),
            Text(t('Bu dosya burada önizlenemiyor', "This file can't be previewed here"), textAlign: TextAlign.center, style: AppTheme.display(19)),
            const SizedBox(height: 8),
            Text(t('İndirip telefonundaki uygun uygulamayla açabilirsin.', 'Download it and open with an app on your phone.'),
                textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
            const SizedBox(height: 20),
            PrimaryButton(
              label: t('İndir ve aç', 'Download & open'),
              icon: LucideIcons.download,
              expand: false,
              onPressed: () => downloadWithToast(context, file),
            ),
          ]),
        ),
      );
}
