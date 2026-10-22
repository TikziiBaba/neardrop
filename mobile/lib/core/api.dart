import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config.dart';
import 'i18n.dart';

class ApiException implements Exception {
  final String message;
  final int? status;
  ApiException(this.message, [this.status]);
  @override
  String toString() => message;
}

/// neardrop.bekirr.dev API istemcisi. Oturum varsa her isteğe `Authorization: Bearer` eklenir;
/// sunucu (getAuthUser) önce bu başlığa bakar.
class Api {
  static final Dio dio = Dio(BaseOptions(
    baseUrl: AppConfig.appUrl,
    connectTimeout: const Duration(seconds: 20),
    receiveTimeout: const Duration(seconds: 60),
    headers: {'User-Agent': 'NearDrop-Android/1.0 (Mobile App)'},
  ))
    ..interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      final token = await accessToken();
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }));

  /// Yükleme/indirme için imzalı R2 adreslerine giden, oturum başlığı taşımayan istemci.
  static final Dio raw = Dio(BaseOptions(connectTimeout: const Duration(seconds: 30)));

  static Future<String?> accessToken() async {
    final auth = Supabase.instance.client.auth;
    var session = auth.currentSession;
    if (session == null) return null;
    if (session.isExpired) {
      try {
        session = (await auth.refreshSession()).session;
      } catch (_) {}
    }
    return session?.accessToken;
  }

  static Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? query}) =>
      _wrap(() => dio.get(path, queryParameters: query));

  static Future<Map<String, dynamic>> post(String path, [Object? body]) => _wrap(() => dio.post(path, data: body));

  static Future<Map<String, dynamic>> patch(String path, [Object? body]) => _wrap(() => dio.patch(path, data: body));

  static Future<Map<String, dynamic>> put(String path, [Object? body]) => _wrap(() => dio.put(path, data: body));

  static Future<Map<String, dynamic>> delete(String path, {Object? body, Map<String, dynamic>? query}) =>
      _wrap(() => dio.delete(path, data: body, queryParameters: query));

  static Future<Map<String, dynamic>> _wrap(Future<Response> Function() call) async {
    try {
      final res = await call();
      final data = res.data;
      if (data is Map) {
        final map = data.cast<String, dynamic>();
        // Bazı uçlar hata durumunda 200 + {success:false} döner
        if (map['success'] == false) throw ApiException('${map['error'] ?? t('İşlem başarısız', 'Request failed')}', res.statusCode);
        return map;
      }
      return {'data': data};
    } on DioException catch (e) {
      throw toApiException(e);
    }
  }

  static ApiException toApiException(DioException e) {
    final data = e.response?.data;
    final status = e.response?.statusCode;
    if (data is Map && data['error'] != null) return ApiException('${data['error']}', status);
    if (e.type == DioExceptionType.cancel) return ApiException(t('İptal edildi', 'Cancelled'), status);
    if (e.type == DioExceptionType.connectionError || e.type == DioExceptionType.connectionTimeout) {
      return ApiException(t('Bağlantı kurulamadı. İnternetinizi kontrol edin.', 'Could not connect. Check your internet.'), status);
    }
    if (status == 401) return ApiException(t('Oturumunuzun süresi doldu, tekrar giriş yapın.', 'Session expired, please sign in again.'), status);
    if (status == 404) return ApiException(t('Bu özellik sunucuda henüz yok.', 'This feature is not available on the server yet.'), status);
    if (status == 429) return ApiException(t('Çok fazla istek. Biraz bekleyin.', 'Too many requests. Please wait.'), status);
    return ApiException(t('Sunucu hatası (${status ?? '?'})', 'Server error (${status ?? '?'})'), status);
  }
}
