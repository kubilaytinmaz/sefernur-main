import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../utils/utils.dart';
import 'webbeds_config.dart';

/// WebBeds (DOTW) API Provider
/// 
/// XML over HTTPS protokolü ile çalışır.
/// DioApi'den bağımsız, kendi Dio instance'ı kullanır.
class WebBedsApiProvider {
  WebBedsApiProvider._privateConstructor() {
    _dio = Dio(
      BaseOptions(
        baseUrl: WebBedsConfig.baseUrl,
        connectTimeout: Duration(milliseconds: WebBedsConfig.connectionTimeout),
        receiveTimeout: Duration(milliseconds: WebBedsConfig.receiveTimeout),
        responseType: ResponseType.plain, // XML yanıt
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Accept': 'text/xml',
          'Accept-Encoding': 'gzip, deflate', // ZORUNLU
        },
      ),
    );

    // Interceptor for logging (debug mode)
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print('[WebBeds] $obj'),
    ));
  }

  static final WebBedsApiProvider _instance = WebBedsApiProvider._privateConstructor();
  factory WebBedsApiProvider() => _instance;

  late final Dio _dio;

  /// MD5 şifreleme (API gereksinimi)
  String _md5Hash(String input) {
    return md5.convert(utf8.encode(input)).toString();
  }

  /// Şifrelenmiş password
  String get _encryptedPassword => _md5Hash(WebBedsConfig.password);

  /// XML isteği gönder
  TaskEither<ServerFailure, String> postXml({
    required String xmlBody,
    CancelToken? cancelToken,
  }) {
    return TaskEither.tryCatch(
      () async {
        final response = await _dio.post(
          '',
          data: xmlBody,
          cancelToken: cancelToken,
          options: Options(
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              'Accept': 'text/xml',
              'Accept-Encoding': 'gzip, deflate',
            },
          ),
        );

        if (response.statusCode == 200) {
          return response.data as String;
        } else {
          throw DioException(
            requestOptions: response.requestOptions,
            response: response,
            message: 'HTTP ${response.statusCode}',
          );
        }
      },
      (error, stackTrace) {
        if (error is DioException) {
          return ServerFailure(
            message: _parseDioError(error),
            statusCode: error.response?.statusCode ?? 500,
          );
        }
        return ServerFailure(
          message: error.toString(),
          statusCode: 500,
        );
      },
    );
  }

  String _parseDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return 'Bağlantı zaman aşımı';
      case DioExceptionType.receiveTimeout:
        return 'Yanıt zaman aşımı';
      case DioExceptionType.sendTimeout:
        return 'Gönderim zaman aşımı';
      case DioExceptionType.badResponse:
        return 'Sunucu hatası: ${error.response?.statusCode}';
      case DioExceptionType.connectionError:
        return 'Bağlantı hatası';
      default:
        return error.message ?? 'Bilinmeyen hata';
    }
  }

  /// Customer wrapper XML'i oluştur
  String wrapWithCustomer(String requestXml) {
    return '''<?xml version="1.0" encoding="UTF-8"?>
<customer xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <username>${WebBedsConfig.username}</username>
    <password>$_encryptedPassword</password>
    <id>${WebBedsConfig.companyId}</id>
    <source>${WebBedsConfig.source}</source>
    <product>${WebBedsConfig.product}</product>
    <language>${WebBedsConfig.language}</language>
    $requestXml
</customer>''';
  }

  /// Search Hotels API çağrısı
  TaskEither<ServerFailure, String> searchHotels(String requestXml) {
    final fullXml = wrapWithCustomer(requestXml);
    return postXml(xmlBody: fullXml);
  }

  /// Get Rooms API çağrısı
  TaskEither<ServerFailure, String> getRooms(String requestXml) {
    final fullXml = wrapWithCustomer(requestXml);
    return postXml(xmlBody: fullXml);
  }

  /// Confirm Booking API çağrısı
  TaskEither<ServerFailure, String> confirmBooking(String requestXml) {
    final fullXml = wrapWithCustomer(requestXml);
    return postXml(xmlBody: fullXml);
  }

  /// Cancel Booking API çağrısı
  TaskEither<ServerFailure, String> cancelBooking(String requestXml) {
    final fullXml = wrapWithCustomer(requestXml);
    return postXml(xmlBody: fullXml);
  }
}
