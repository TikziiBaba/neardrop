import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config.dart';
import '../../core/i18n.dart';
import '../../widgets/ui.dart';

/// Gizlilik, şartlar gibi metin sayfalarını uygulama içi tarayıcıda açar.
Future<void> openWebPage(BuildContext context, String path) async {
  final uri = Uri.parse(path.startsWith('http') ? path : '${AppConfig.appUrl}$path');
  final ok = await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
  if (!ok && context.mounted) showToast(context, t('Sayfa açılamadı.', 'Could not open the page.'), error: true);
}
