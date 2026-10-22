import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:archive/archive_io.dart';
import 'package:background_downloader/background_downloader.dart';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:mime/mime.dart';
import 'package:path_provider/path_provider.dart';

import '../core/api.dart';
import '../core/format.dart';
import '../core/i18n.dart';
import '../core/models.dart';
import 'transfer_item.dart';

/// Sunucu üzerinden yedek yükleme sınırı (Vercel 4.5 MB gövde sınırı). /api/upload ile aynı tutulmalı.
const _proxyUploadLimit = 4 * 1024 * 1024;

/// Bu boyuta kadar dosyanın tamamının SHA-256'sı hesaplanır.
const _fullHashLimit = 50 * 1024 * 1024;

const _concurrency = 3;

/// Android 9 ve öncesinde İndirilenler'e yazmak için depolama izni gerekir (10+ için her zaman verilidir).
Future<void> ensureSharedStoragePermission() async {
  try {
    final permissions = FileDownloader().permissions;
    if (await permissions.status(PermissionType.androidSharedStorage) != PermissionStatus.granted) {
      await permissions.request(PermissionType.androidSharedStorage);
    }
  } catch (_) {}
}

class LocalFile {
  final String path;
  final String name;
  final int size;
  const LocalFile(this.path, this.name, this.size);
}

class CategoryStat {
  final FileCategory category;
  final int bytes;
  final int count;
  const CategoryStat(this.category, this.bytes, this.count);
}

/// Web'deki StorageProvider (lib/storage/store.tsx) karşılığı: dosyalar, paylaşımlar ve aktarım kuyruğu.
class FilesStore extends ChangeNotifier {
  List<CloudFile> files = [];
  List<ShareLink> shares = [];
  final List<TransferItem> transfers = [];
  bool isLoading = false;
  bool loadedOnce = false;
  String? loadError;
  int quotaBytes = 2147483648;

  final _queue = <(TransferItem, LocalFile)>[];
  int _running = 0;
  bool _notificationsConfigured = false;

  void reset() {
    files = [];
    shares = [];
    transfers.clear();
    loadedOnce = false;
    notifyListeners();
  }

  // ---------- Okuma ----------

  Future<void> refresh() async {
    isLoading = true;
    loadError = null;
    notifyListeners();
    try {
      final results = await Future.wait([Api.get('/api/files'), Api.get('/api/shares')]);
      files = ((results[0]['files'] as List?) ?? [])
          .map((e) => CloudFile.fromJson((e as Map).cast<String, dynamic>()))
          .toList();
      shares = ((results[1]['shares'] as List?) ?? [])
          .map((e) => ShareLink.fromJson((e as Map).cast<String, dynamic>()))
          .toList();
      loadedOnce = true;
    } catch (e) {
      loadError = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _refreshFilesOnly() async {
    try {
      final res = await Api.get('/api/files');
      files = ((res['files'] as List?) ?? []).map((e) => CloudFile.fromJson((e as Map).cast<String, dynamic>())).toList();
      notifyListeners();
    } catch (_) {}
  }

  int get usedBytes => files.fold(0, (a, f) => a + f.size);
  int get activeShares => shares.where((s) => s.isLive).length;
  int get totalShareDownloads => shares.fold(0, (a, s) => a + s.downloadCount);

  List<CategoryStat> get categories {
    final map = <FileCategory, (int, int)>{};
    for (final f in files) {
      final c = f.category;
      final cur = map[c] ?? (0, 0);
      map[c] = (cur.$1 + f.size, cur.$2 + 1);
    }
    final list = map.entries.map((e) => CategoryStat(e.key, e.value.$1, e.value.$2)).toList()
      ..sort((a, b) => b.bytes.compareTo(a.bytes));
    return list;
  }

  /// Bir klasörün doğrudan içindeki alt klasörler ve dosyalar
  (List<String> folders, List<CloudFile> files) listFolder(String folder) {
    final prefix = folder.isEmpty ? '' : '$folder/';
    final subfolders = <String>{};
    final direct = <CloudFile>[];
    for (final f in files) {
      if (!f.filename.startsWith(prefix)) continue;
      final rest = f.filename.substring(prefix.length);
      final slash = rest.indexOf('/');
      if (slash < 0) {
        direct.add(f);
      } else {
        subfolders.add('$prefix${rest.substring(0, slash)}');
      }
    }
    return (subfolders.toList()..sort(), direct);
  }

  (int count, int bytes) folderStats(String folder) {
    final prefix = '$folder/';
    var count = 0, bytes = 0;
    for (final f in files) {
      if (f.filename.startsWith(prefix)) {
        count++;
        bytes += f.size;
      }
    }
    return (count, bytes);
  }

  // ---------- Yükleme ----------

  /// Dosyaları kuyruğa ekler. [folder] verilirse dosya o klasörün içine yüklenir.
  void upload(List<LocalFile> locals, {String folder = ''}) {
    for (final local in locals) {
      final name = folder.isEmpty ? local.name : '$folder/${local.name}';
      final item = TransferItem(
        id: 'tr_${DateTime.now().microsecondsSinceEpoch}_${transfers.length}',
        filename: name,
        size: local.size,
        direction: TransferDirection.upload,
        path: local.path,
      );
      transfers.insert(0, item);
      _queue.add((item, local));
    }
    notifyListeners();
    _pump();
  }

  void _pump() {
    while (_running < _concurrency && _queue.isNotEmpty) {
      final (item, local) = _queue.removeAt(0);
      if (item.status == TransferStatus.cancelled) continue;
      _running++;
      _uploadOne(item, local).whenComplete(() {
        _running--;
        if (_running == 0 && _queue.isEmpty) _refreshFilesOnly();
        _pump();
      });
    }
  }

  bool _isTerminal(String msg) =>
      msg.contains('quota') || msg.contains('plan') || msg.contains('Zararlı') || msg.contains('Malware') || msg.contains('kota');

  Future<void> _uploadOne(TransferItem item, LocalFile local) async {
    item
      ..status = TransferStatus.running
      ..startedAt = DateTime.now()
      ..error = null
      ..transferred = 0
      ..cancelToken = CancelToken();
    notifyListeners();

    final file = File(local.path);
    final mime = lookupMimeType(local.name) ?? 'application/octet-stream';
    String? fileId;
    var succeeded = false;
    Object? lastError;

    void onProgress(int sent, int total) {
      final elapsed = DateTime.now().difference(item.startedAt).inMilliseconds / 1000;
      item.transferred = sent.clamp(0, item.size);
      item.speed = elapsed > 0 ? (sent / elapsed).round() : 0;
      item.eta = item.speed > 0 ? ((item.size - sent) / item.speed).round() : null;
      notifyListeners();
    }

    try {
      // Örnek başlık ve (küçük dosyalarda) tam SHA-256 — sunucudaki zararlı yazılım taraması için
      var sha = '';
      var headerSample = '';
      if (local.size > 0) {
        final raf = await file.open();
        headerSample = base64Encode(await raf.read(65536));
        await raf.close();
        if (local.size <= _fullHashLimit) sha = (await sha256.bind(file.openRead()).first).toString();
      } else {
        sha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      }

      // 1. İmzalı yükleme adresi
      String? uploadUrl;
      for (var attempt = 1; attempt <= 3 && uploadUrl == null; attempt++) {
        if (item.status == TransferStatus.cancelled) throw ApiException(t('İptal edildi', 'Cancelled'));
        try {
          final res = await Api.post('/api/upload', {
            'filename': item.filename,
            'size': local.size,
            'mimeType': mime,
            'sha256': sha,
            'headerSample': headerSample,
          });
          uploadUrl = res['uploadUrl'] as String?;
          fileId = res['fileId'] as String?;
        } on ApiException catch (e) {
          lastError = e;
          if (_isTerminal(e.message) || attempt == 3) rethrow;
          await Future.delayed(Duration(milliseconds: e.status == 429 ? 2000 * attempt : 1000 * attempt));
        }
      }

      // 2. Depolamaya doğrudan PUT
      if (uploadUrl != null) {
        for (var attempt = 1; attempt <= 3 && !succeeded; attempt++) {
          try {
            await Api.raw.put(
              uploadUrl,
              data: file.openRead(),
              options: Options(headers: {
                Headers.contentLengthHeader: local.size,
                Headers.contentTypeHeader: mime,
              }),
              cancelToken: item.cancelToken,
              onSendProgress: onProgress,
            );
            succeeded = true;
          } on DioException catch (e) {
            lastError = e;
            if (CancelToken.isCancel(e)) break;
            if (attempt < 3) await Future.delayed(Duration(seconds: attempt));
          }
        }
      }

      // 3. Doğrudan yükleme olmadıysa küçük dosyalar sunucu üzerinden gönderilir
      if (!succeeded && item.status != TransferStatus.cancelled && local.size <= _proxyUploadLimit) {
        if (fileId != null) {
          final stale = fileId;
          fileId = null;
          unawaited(Api.delete('/api/upload', query: {'fileId': stale}).catchError((_) => <String, dynamic>{}));
        }
        final form = FormData.fromMap({
          'file': await MultipartFile.fromFile(local.path, filename: local.name, contentType: DioMediaType.parse(mime)),
          'filename': item.filename,
        });
        try {
          await Api.dio.post('/api/upload', data: form, cancelToken: item.cancelToken, onSendProgress: onProgress);
          succeeded = true;
        } on DioException catch (e) {
          throw Api.toApiException(e);
        }
      }

      if (!succeeded) {
        if (lastError is DioException && CancelToken.isCancel(lastError)) throw ApiException(t('İptal edildi', 'Cancelled'));
        throw ApiException(t('Depolamaya yükleme başarısız oldu. Bağlantınızı kontrol edip tekrar deneyin.',
            'Upload to storage failed. Check your connection and retry.'));
      }

      item
        ..status = TransferStatus.completed
        ..transferred = item.size
        ..speed = 0
        ..eta = 0;
    } catch (e) {
      final cancelled = item.status == TransferStatus.cancelled || (e is DioException && CancelToken.isCancel(e));
      item
        ..status = cancelled ? TransferStatus.cancelled : TransferStatus.failed
        ..speed = 0
        ..eta = null
        ..error = e is DioException ? Api.toApiException(e).message : e.toString();
      // Yarım kalan kaydı temizle
      if (fileId != null) {
        unawaited(Api.delete('/api/upload', query: {'fileId': fileId}).catchError((_) => <String, dynamic>{}));
      }
    }
    notifyListeners();
  }

  void cancelTransfer(TransferItem item) {
    if (item.direction == TransferDirection.download && item.taskId != null) {
      FileDownloader().cancelTaskWithId(item.taskId!);
    }
    item.status = TransferStatus.cancelled;
    item.cancelToken?.cancel();
    notifyListeners();
  }

  void retry(TransferItem item) {
    if (item.direction != TransferDirection.upload || item.path == null) return;
    item
      ..status = TransferStatus.pending
      ..transferred = 0
      ..error = null;
    _queue.add((item, LocalFile(item.path!, item.name, item.size)));
    notifyListeners();
    _pump();
  }

  void clearFinished() {
    transfers.removeWhere((t) => !t.isActive);
    notifyListeners();
  }

  // ---------- İndirme ----------

  Future<void> _ensureNotifications() async {
    if (_notificationsConfigured) return;
    _notificationsConfigured = true;
    final downloader = FileDownloader();
    downloader.configureNotification(
      running: TaskNotification('{filename}', t('NearDrop indiriyor…', 'NearDrop is downloading…')),
      complete: TaskNotification('{filename}', t('İndirildi · İndirilenler/NearDrop', 'Downloaded · Downloads/NearDrop')),
      error: TaskNotification('{filename}', t('İndirme başarısız', 'Download failed')),
      progressBar: true,
    );
    try {
      final status = await downloader.permissions.status(PermissionType.notifications);
      if (status != PermissionStatus.granted) await downloader.permissions.request(PermissionType.notifications);
    } catch (_) {}
  }

  /// İmzalı bir adresi İndirilenler/NearDrop klasörüne indirir. Kaydedilen yolu döndürür.
  Future<String?> downloadUrl(String url, String filename, {int size = 0}) async {
    await _ensureNotifications();
    final safe = filename.split('/').last.replaceAll(RegExp(r'[\\:*?"<>|]'), '_');
    final item = TransferItem(
      id: 'dl_${DateTime.now().microsecondsSinceEpoch}',
      filename: safe,
      size: size,
      direction: TransferDirection.download,
    )..status = TransferStatus.running;
    transfers.insert(0, item);
    notifyListeners();

    final task = DownloadTask(
      url: url,
      filename: safe,
      baseDirectory: BaseDirectory.temporary,
      directory: 'nd_downloads',
      updates: Updates.statusAndProgress,
      retries: 2,
    );
    item.taskId = task.taskId;

    final result = await FileDownloader().download(task, onProgress: (p) {
      if (p < 0) return;
      final total = item.size > 0 ? item.size : 1;
      item.transferred = (p * total).round();
      final elapsed = DateTime.now().difference(item.startedAt).inMilliseconds / 1000;
      item.speed = elapsed > 0 && item.size > 0 ? (item.transferred / elapsed).round() : 0;
      item.eta = item.speed > 0 ? ((item.size - item.transferred) / item.speed).round() : null;
      notifyListeners();
    });

    if (result.status == TaskStatus.complete) {
      await ensureSharedStoragePermission();
      final saved = await FileDownloader().moveToSharedStorage(task, SharedStorage.downloads, directory: 'NearDrop');
      item
        ..status = TransferStatus.completed
        ..transferred = item.size
        ..path = saved ?? await task.filePath();
      notifyListeners();
      return item.path;
    }
    item
      ..status = result.status == TaskStatus.canceled ? TransferStatus.cancelled : TransferStatus.failed
      ..error = result.exception?.description ?? t('İndirme başarısız', 'Download failed');
    notifyListeners();
    if (item.status == TransferStatus.failed) throw ApiException(item.error!);
    return null;
  }

  Future<String?> downloadFile(CloudFile file) async {
    final res = await Api.post('/api/files/download', {'fileId': file.id});
    return downloadUrl('${res['downloadUrl']}', '${res['filename'] ?? file.name}', size: file.size);
  }

  /// Klasördeki tüm dosyaları indirip tek bir ZIP olarak İndirilenler/NearDrop'a kaydeder.
  Future<String?> downloadFolder(String folderPath, {void Function(int done, int total)? onProgress}) async {
    final res = await Api.post('/api/files/folder-download', {'folderPath': folderPath});
    final items = ((res['items'] as List?) ?? []).cast<Map>();
    return saveItemsAsZip('${res['folderName'] ?? folderPath.split('/').last}', items, onProgress: onProgress);
  }

  /// `{relativePath, downloadUrl}` listesini indirip tek ZIP olarak kaydeder (klasör ve paylaşılan klasör indirme).
  Future<String?> saveItemsAsZip(String folderName, List<Map> items, {void Function(int done, int total)? onProgress}) async {
    final tmp = await getTemporaryDirectory();
    final work = Directory('${tmp.path}/zip_${DateTime.now().millisecondsSinceEpoch}')..createSync(recursive: true);
    final zipPath = '${work.path}/$folderName.zip';
    final encoder = ZipFileEncoder()..create(zipPath);
    var done = 0;
    try {
      for (final it in items) {
        final rel = '${it['relativePath'] ?? it['filename']}';
        final target = '${work.path}/f_$done';
        await Api.raw.download('${it['downloadUrl']}', target);
        await encoder.addFile(File(target), rel);
        File(target).deleteSync();
        done++;
        onProgress?.call(done, items.length);
      }
    } finally {
      await encoder.close();
    }
    await ensureSharedStoragePermission();
    final zipSize = File(zipPath).lengthSync();
    final saved = await FileDownloader().moveFileToSharedStorage(zipPath, SharedStorage.downloads, directory: 'NearDrop');
    final item = TransferItem(
      id: 'dl_${DateTime.now().microsecondsSinceEpoch}',
      filename: '$folderName.zip',
      size: zipSize,
      direction: TransferDirection.download,
      path: saved,
    )
      ..status = TransferStatus.completed
      ..transferred = 1;
    transfers.insert(0, item);
    notifyListeners();
    return saved;
  }

  // ---------- Dosya işlemleri ----------

  Future<Map<String, dynamic>> preview(CloudFile file) => Api.post('/api/files/preview', {'fileId': file.id});

  final _previewUrls = <String, (String, DateTime)>{};

  /// Küçük resimler için imzalı önizleme adresi (sunucu 15 dk geçerli üretir; 10 dk önbellekte tutulur).
  Future<String?> previewUrl(CloudFile file) async {
    final cached = _previewUrls[file.id];
    if (cached != null && DateTime.now().difference(cached.$2).inMinutes < 10) return cached.$1;
    try {
      final res = await preview(file);
      final url = res['previewUrl'] as String?;
      if (url != null) _previewUrls[file.id] = (url, DateTime.now());
      return url;
    } catch (_) {
      return null;
    }
  }

  Future<void> saveContent(CloudFile file, String content) async {
    final res = await Api.put('/api/files/save', {'fileId': file.id, 'content': content});
    final size = (res['size'] as num?)?.toInt();
    files = files.map((f) => f.id == file.id ? f.copyWith(size: size) : f).toList();
    notifyListeners();
  }

  Future<void> moveToTrash(CloudFile file) async {
    await Api.delete('/api/files', body: {'fileId': file.id});
    files = files.where((f) => f.id != file.id).toList();
    shares = shares.where((s) => s.cloudFileId != file.id).toList();
    notifyListeners();
  }

  Future<void> rename(CloudFile file, String newName) async {
    final folder = file.folder;
    final full = folder.isEmpty ? newName : '$folder/$newName';
    await Api.patch('/api/files', {'fileId': file.id, 'filename': full});
    files = files.map((f) => f.id == file.id ? f.copyWith(filename: full) : f).toList();
    notifyListeners();
  }

  // ---------- Paylaşımlar ----------

  Future<ShareLink> createShare({
    String? cloudFileId,
    String? folderPath,
    String? title,
    String? description,
    int? expiresInHours,
    int? maxDownloads,
    String? password,
    bool burnAfterRead = false,
  }) async {
    final res = await Api.post('/api/shares', {
      'cloudFileId': ?cloudFileId,
      'folderPath': ?folderPath,
      'title': ?title,
      'description': ?description,
      'expiresInHours': ?expiresInHours,
      'maxDownloads': ?maxDownloads,
      if (password != null && password.isNotEmpty) 'password': password,
      'burnAfterRead': burnAfterRead,
    });
    final share = ShareLink.fromJson(res);
    unawaited(refresh());
    return share;
  }

  Future<void> toggleShare(ShareLink share) async {
    await Api.patch('/api/shares', {'shareId': share.id, 'isActive': !share.isActive});
    shares = shares.map((s) => s.id == share.id ? s.copyWith(isActive: !share.isActive) : s).toList();
    notifyListeners();
  }

  Future<void> updateShareExpiry(ShareLink share, int hours) async {
    await Api.patch('/api/shares', {'shareId': share.id, 'expiresInHours': hours});
    shares = shares
        .map((s) => s.id == share.id
            ? s.copyWith(
                expiresAt: hours > 0 ? DateTime.now().add(Duration(hours: hours)) : null,
                clearExpiry: hours <= 0,
              )
            : s)
        .toList();
    notifyListeners();
  }

  Future<void> deleteShare(ShareLink share) async {
    await Api.delete('/api/shares', body: {'shareId': share.id});
    shares = shares.where((s) => s.id != share.id).toList();
    notifyListeners();
  }
}
