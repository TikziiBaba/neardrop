import 'dart:io';

import 'package:file_picker/file_picker.dart';

import '../state/files_store.dart';

/// Dosya seçici. Android tarafı seçilen dosyaları önbelleğe kopyalayıp yerel yol verir.
Future<List<LocalFile>> pickLocalFiles({FileType type = FileType.any}) async {
  final picked = await FilePicker.pickFiles(type: type);
  final out = <LocalFile>[];
  for (final f in picked) {
    final path = f.path;
    if (path == null) continue;
    out.add(LocalFile(path, f.name, f.lengthSync() ?? await File(path).length()));
  }
  return out;
}
