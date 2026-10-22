import 'dart:ui';

import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Web sürümü gibi Türkçe / İngilizce. Metinler çağrıldığı yerde iki dilde yazılır: `t('Dosyalar', 'Files')`.
class LocaleStore extends ChangeNotifier {
  static const _key = 'neardrop_locale';
  static LocaleStore? _instance;
  static LocaleStore get instance => _instance!;

  bool _isTr = true;
  bool get isTr => _isTr;
  String get code => _isTr ? 'tr' : 'en';

  LocaleStore._();

  static Future<LocaleStore> load() async {
    final store = LocaleStore._();
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);
    store._isTr = saved != null ? saved == 'tr' : PlatformDispatcher.instance.locale.languageCode == 'tr';
    _instance = store;
    return store;
  }

  Future<void> setTr(bool value) async {
    if (_isTr == value) return;
    _isTr = value;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, code);
  }
}

/// Dil seçimine göre metni döndürür. Widget içinde kullanıldığında `context.watch<LocaleStore>()`
/// üst seviyede dinlendiği için dil değişince tüm ağaç yeniden çizilir.
String t(String tr, String en) => LocaleStore.instance.isTr ? tr : en;

extension LocaleContext on BuildContext {
  bool get isTr => watch<LocaleStore>().isTr;
}
