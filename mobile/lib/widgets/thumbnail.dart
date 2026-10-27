import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/format.dart';
import '../core/models.dart';
import '../state/files_store.dart';
import '../theme/app_theme.dart';
import 'ui.dart';

/// Görsel dosyalar için önizleme, diğerleri için tür simgesi.
class FileThumb extends StatefulWidget {
  final CloudFile file;
  final double size;
  final double radius;
  const FileThumb({super.key, required this.file, this.size = 46, this.radius = 14});

  @override
  State<FileThumb> createState() => _FileThumbState();
}

class _FileThumbState extends State<FileThumb> {
  Future<String?>? _url;

  @override
  void initState() {
    super.initState();
    _load();
  }

  // Liste değişince Flutter bu durumu başka bir dosya için yeniden kullanabilir
  @override
  void didUpdateWidget(FileThumb old) {
    super.didUpdateWidget(old);
    if (old.file.id != widget.file.id) _load();
  }

  void _load() {
    _url = widget.file.category == FileCategory.image && fileExtension(widget.file.filename) != 'svg'
        ? context.read<FilesStore>().previewUrl(widget.file)
        : null;
  }

  @override
  Widget build(BuildContext context) {
    final icon = FileTypeIcon(category: widget.file.category, size: widget.size);
    if (_url == null) return icon;
    return FutureBuilder<String?>(
      future: _url,
      builder: (_, snap) {
        if (snap.data == null) return icon;
        return ClipRRect(
          borderRadius: BorderRadius.circular(widget.radius),
          child: Image.network(
            snap.data!,
            width: widget.size,
            height: widget.size,
            fit: BoxFit.cover,
            cacheWidth: (widget.size * 3).round(),
            errorBuilder: (_, _, _) => icon,
            frameBuilder: (_, child, frame, sync) => AnimatedOpacity(
              opacity: frame == null && !sync ? 0 : 1,
              duration: const Duration(milliseconds: 300),
              child: Container(color: AppColors.surface2, child: child),
            ),
          ),
        );
      },
    );
  }
}
