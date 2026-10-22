import 'dart:io';
import 'dart:math';
import 'dart:ui';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Web'deki getClientDeviceInfo() karşılığı. Doğrudan aktarım odasındaki diğer cihazlar bu bilgiyi görür.
class DeviceIdentity {
  static late DeviceIdentity current;

  final String deviceId;
  final String deviceName;
  final String deviceType;
  final String platform;

  DeviceIdentity._(this.deviceId, this.deviceName, this.deviceType, this.platform);

  static Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    var id = prefs.getString('neardrop_device_id');
    if (id == null) {
      final rand = Random.secure();
      final suffix = List.generate(7, (_) => 'abcdefghijklmnopqrstuvwxyz0123456789'[rand.nextInt(36)]).join();
      id = 'dev_${DateTime.now().millisecondsSinceEpoch}_$suffix';
      await prefs.setString('neardrop_device_id', id);
    }

    final view = PlatformDispatcher.instance.views.firstOrNull;
    final shortest = view == null ? 0.0 : (view.physicalSize / view.devicePixelRatio).shortestSide;
    final type = shortest >= 600 ? 'tablet' : 'mobile';

    var name = Platform.isIOS ? 'iPhone' : 'Android';
    try {
      final info = DeviceInfoPlugin();
      if (Platform.isAndroid) {
        final a = await info.androidInfo;
        final brand = a.manufacturer.isEmpty ? '' : '${a.manufacturer[0].toUpperCase()}${a.manufacturer.substring(1)} ';
        name = '$brand${a.model}'.trim();
      } else if (Platform.isIOS) {
        name = (await info.iosInfo).name;
      }
    } catch (_) {}

    current = DeviceIdentity._(id, '$name (NearDrop App)', type, Platform.isIOS ? 'ios' : 'android');
  }

  Map<String, dynamic> toPresence() => {
        'deviceId': deviceId,
        'deviceName': deviceName,
        'deviceType': deviceType,
        'platform': platform,
        'browser': 'NearDrop App',
        'userAgent': 'NearDrop-${platform == 'ios' ? 'iOS' : 'Android'}/1.0',
        // Mobil uygulamalar arası bağlantıda teklifi kimin başlatacağına karar vermek için
        'app': 'neardrop-mobile',
        'joinedAt': DateTime.now().millisecondsSinceEpoch,
      };
}
