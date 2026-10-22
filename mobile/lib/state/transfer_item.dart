import 'package:dio/dio.dart';

enum TransferStatus { pending, running, completed, failed, cancelled }

enum TransferDirection { upload, download }

/// Yükleme/indirme kuyruğundaki tek bir iş (web'deki TransferItem).
class TransferItem {
  final String id;
  final String filename;
  final int size;
  final TransferDirection direction;

  /// Yüklemede kaynak dosya, indirmede kaydedilen yer
  String? path;
  TransferStatus status = TransferStatus.pending;
  int transferred = 0;
  int speed = 0;
  int? eta;
  String? error;
  DateTime startedAt = DateTime.now();
  CancelToken? cancelToken;

  /// İndirmede background_downloader görev kimliği
  String? taskId;

  TransferItem({
    required this.id,
    required this.filename,
    required this.size,
    required this.direction,
    this.path,
  });

  double get progress => size <= 0 ? (status == TransferStatus.completed ? 1 : 0) : (transferred / size).clamp(0, 1);
  bool get isActive => status == TransferStatus.pending || status == TransferStatus.running;
  String get name => filename.split('/').last;
}
