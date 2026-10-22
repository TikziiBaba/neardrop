/// Ortam değerleri derleme sırasında `--dart-define-from-file=env.json` ile gelir.
class AppConfig {
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const appUrl = String.fromEnvironment('APP_URL', defaultValue: 'https://neardrop.bekirr.dev');

  /// OAuth (Google/GitHub) dönüşü için uygulamaya geri açılan adres.
  /// Supabase > Authentication > URL Configuration > Redirect URLs listesine eklenmeli.
  static const oauthRedirect = 'dev.bekirr.neardrop://login-callback';

  static bool get isConfigured => supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  static String shareUrl(String token) => '$appUrl/s/$token';
  static String roomUrl(String room) => '$appUrl/transfers?room=${Uri.encodeComponent(room)}';
}
