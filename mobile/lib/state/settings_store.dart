import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Web'de localStorage'da tutulan kullanıcı tercihleri (neardrop_user_settings).
class SettingsStore extends ChangeNotifier {
  late SharedPreferences _prefs;

  int defaultExpirationHours = 24;
  int defaultMaxDownloads = 10;
  bool emailOnDownload = true;
  bool emailOnExpire = true;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    defaultExpirationHours = _prefs.getInt('default_expiry_hours') ?? 24;
    defaultMaxDownloads = _prefs.getInt('default_max_downloads') ?? 10;
    emailOnDownload = _prefs.getBool('email_on_download') ?? true;
    emailOnExpire = _prefs.getBool('email_on_expire') ?? true;
  }

  Future<void> update({
    int? defaultExpirationHours,
    int? defaultMaxDownloads,
    bool? emailOnDownload,
    bool? emailOnExpire,
  }) async {
    if (defaultExpirationHours != null) {
      this.defaultExpirationHours = defaultExpirationHours;
      await _prefs.setInt('default_expiry_hours', defaultExpirationHours);
    }
    if (defaultMaxDownloads != null) {
      this.defaultMaxDownloads = defaultMaxDownloads;
      await _prefs.setInt('default_max_downloads', defaultMaxDownloads);
    }
    if (emailOnDownload != null) {
      this.emailOnDownload = emailOnDownload;
      await _prefs.setBool('email_on_download', emailOnDownload);
    }
    if (emailOnExpire != null) {
      this.emailOnExpire = emailOnExpire;
      await _prefs.setBool('email_on_expire', emailOnExpire);
    }
    notifyListeners();
  }
}
