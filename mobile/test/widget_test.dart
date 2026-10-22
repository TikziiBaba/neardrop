import 'package:flutter_test/flutter_test.dart';
import 'package:neardrop/core/format.dart';
import 'package:neardrop/core/models.dart';

void main() {
  test('formatBytes web ile aynı birimleri kullanır', () {
    expect(formatBytes(0), '0 B');
    expect(formatBytes(1024), '1 KB');
    expect(formatBytes(1536), '1.5 KB');
    expect(formatBytes(2147483648), '2 GB');
  });

  test('fileCategory uzantı ve MIME türünü tanır', () {
    expect(fileCategory('image/png', 'a.png'), FileCategory.image);
    expect(fileCategory('', 'video.MKV'), FileCategory.video);
    expect(fileCategory('application/pdf', 'doc.pdf'), FileCategory.document);
    expect(fileCategory('', 'arsiv.zip'), FileCategory.archive);
    expect(fileCategory('', 'main.dart'), FileCategory.code);
    expect(fileCategory('', 'bilinmeyen'), FileCategory.other);
  });

  test('CloudFile klasör yolunu dosya adından çıkarır', () {
    final f = CloudFile.fromJson({'id': '1', 'filename': 'Tatil/2026/deniz.jpg', 'size': 10, 'mimeType': 'image/jpeg'});
    expect(f.name, 'deniz.jpg');
    expect(f.folder, 'Tatil/2026');
  });

  test('ShareLink süresi ve indirme sınırı durumunu hesaplar', () {
    final expired = ShareLink.fromJson({
      'id': 's',
      'token': 'abc',
      'isActive': true,
      'expiresAt': DateTime.now().subtract(const Duration(hours: 1)).toUtc().toIso8601String(),
      'downloadCount': 0,
    });
    expect(expired.isExpired, isTrue);
    expect(expired.isLive, isFalse);

    final exhausted = ShareLink.fromJson({'id': 's', 'token': 'abc', 'isActive': true, 'downloadCount': 5, 'maxDownloads': 5});
    expect(exhausted.isExhausted, isTrue);
  });
}
