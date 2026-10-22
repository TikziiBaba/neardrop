import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../theme/app_theme.dart';
import 'i18n.dart';

String formatBytes(num bytes, [int decimals = 1]) {
  if (bytes <= 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  final i = (math.log(bytes) / math.log(1024)).floor().clamp(0, sizes.length - 1);
  final value = bytes / math.pow(1024, i);
  final text = value.toStringAsFixed(i == 0 ? 0 : decimals);
  return '${text.endsWith('.0') ? text.substring(0, text.length - 2) : text} ${sizes[i]}';
}

String formatSpeed(num bytesPerSec) => bytesPerSec <= 0 ? '0 MB/s' : '${formatBytes(bytesPerSec)}/s';

String formatEta(int? seconds) {
  if (seconds == null || seconds < 0) return t('Hesaplanıyor…', 'Calculating…');
  if (seconds == 0) return t('Tamamlanıyor…', 'Completing…');
  if (seconds < 60) return t('~$seconds sn kaldı', '~${seconds}s left');
  final mins = seconds ~/ 60;
  if (mins < 60) return t('~$mins dk kaldı', '~${mins}m left');
  return t('~${mins ~/ 60} sa ${mins % 60} dk kaldı', '~${mins ~/ 60}h ${mins % 60}m left');
}

DateTime? parseDate(dynamic v) => v is String ? DateTime.tryParse(v)?.toLocal() : null;

String formatDate(DateTime? date, {bool withTime = true}) {
  if (date == null) return t('Hiçbir zaman', 'Never');
  final pattern = withTime ? 'd MMM y, HH:mm' : 'd MMM y';
  return DateFormat(pattern, LocaleStore.instance.code).format(date);
}

String formatRelative(DateTime? date) {
  if (date == null) return t('Hiçbir zaman', 'Never');
  final diff = DateTime.now().difference(date);
  if (diff.inSeconds < 60) return t('Az önce', 'Just now');
  if (diff.inMinutes < 60) return t('${diff.inMinutes} dk önce', '${diff.inMinutes} min ago');
  if (diff.inHours < 24) return t('${diff.inHours} sa önce', '${diff.inHours} h ago');
  if (diff.inDays < 7) return t('${diff.inDays} gün önce', '${diff.inDays} days ago');
  return formatDate(date, withTime: false);
}

String formatExpiresIn(DateTime? date) {
  if (date == null) return t('Süresiz', 'Never expires');
  final diff = date.difference(DateTime.now());
  if (diff.isNegative) return t('Süresi doldu', 'Expired');
  if (diff.inDays > 1) return t('${diff.inDays} gün kaldı', 'Expires in ${diff.inDays} days');
  if (diff.inHours >= 1) return t('${diff.inHours} saat kaldı', 'Expires in ${diff.inHours} h');
  return t('${math.max(1, diff.inMinutes)} dk kaldı', 'Expires in ${math.max(1, diff.inMinutes)} min');
}

enum FileCategory { image, video, audio, document, archive, code, other }

const _imageExt = {'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif', 'ico', 'heic', 'bmp'};
const _videoExt = {'mp4', 'mkv', 'avi', 'mov', 'webm', '3gp'};
const _audioExt = {'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus'};
const _docExt = {'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'xls', 'pptx', 'ppt', 'md'};
const _archiveExt = {'zip', 'tar', 'gz', '7z', 'rar', 'bz2', 'xz', 'iso', 'apk'};
const _codeExt = {
  'js', 'ts', 'jsx', 'tsx', 'py', 'rs', 'go', 'json', 'html', 'css', 'yaml', 'yml', 'toml', 'sh', 'c', 'cpp', 'java', 'kt', 'dart', 'xml', 'sql'
};

String fileExtension(String name) {
  final dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.substring(dot + 1).toLowerCase();
}

FileCategory fileCategory(String mime, String filename) {
  final ext = fileExtension(filename);
  if (mime.startsWith('image/') || _imageExt.contains(ext)) return FileCategory.image;
  if (mime.startsWith('video/') || _videoExt.contains(ext)) return FileCategory.video;
  if (mime.startsWith('audio/') || _audioExt.contains(ext)) return FileCategory.audio;
  if (mime.contains('pdf') || mime.contains('word') || mime.contains('document') || _docExt.contains(ext)) {
    return FileCategory.document;
  }
  if (_archiveExt.contains(ext) || mime.contains('zip') || mime.contains('compressed')) return FileCategory.archive;
  if (_codeExt.contains(ext)) return FileCategory.code;
  return FileCategory.other;
}

extension FileCategoryX on FileCategory {
  Color get color => switch (this) {
        FileCategory.archive => const Color(0xFFF59E0B),
        FileCategory.document => const Color(0xFF3B82F6),
        FileCategory.video => AppColors.fileVideo,
        FileCategory.image => const Color(0xFF10B981),
        FileCategory.audio => AppColors.fileAudio,
        FileCategory.code => const Color(0xFF06B6D4),
        FileCategory.other => const Color(0xFF6B7280),
      };

  IconData get icon => switch (this) {
        FileCategory.archive => LucideIcons.fileArchive,
        FileCategory.document => LucideIcons.fileText,
        FileCategory.video => LucideIcons.fileVideo,
        FileCategory.image => LucideIcons.fileImage,
        FileCategory.audio => LucideIcons.fileAudio,
        FileCategory.code => LucideIcons.fileCode,
        FileCategory.other => LucideIcons.file,
      };

  String get label => switch (this) {
        FileCategory.archive => t('Arşivler', 'Archives'),
        FileCategory.document => t('Belgeler', 'Documents'),
        FileCategory.video => t('Videolar', 'Videos'),
        FileCategory.image => t('Görseller', 'Images'),
        FileCategory.audio => t('Sesler', 'Audio'),
        FileCategory.code => t('Kodlar', 'Code'),
        FileCategory.other => t('Diğer', 'Other'),
      };
}
