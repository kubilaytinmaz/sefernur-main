import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:uuid/uuid.dart';

import '../../models/payment/paytr_models.dart';
import '../../providers/payment/paytr_config.dart';
import '../auth/auth_service.dart';

/// PayTR Ödeme Servisi
/// 
/// iFrame API entegrasyonu ile ödeme işlemlerini yönetir.
/// 
/// Akış:
/// 1. createPaymentToken() ile token al
/// 2. Token ile WebView'da iFrame aç
/// 3. Ödeme sonucu Firebase Function webhook'a gelir
/// 4. Firestore'dan ödeme durumunu dinle
class PayTrService extends GetxService {
  late Dio _dio;
  
  // State
  final isLoading = false.obs;
  final error = RxnString();
  final currentPaymentId = RxnString();
  final paymentStatus = Rx<PayTrPaymentStatus>(PayTrPaymentStatus.pending);

  Future<PayTrService> init() async {
    _dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      ),
    );
    
    // Debug interceptor
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print('[PayTR] $obj'),
    ));
    
    return this;
  }

  // ============================================================
  // TOKEN OLUŞTURMA
  // ============================================================

  /// Ödeme için iFrame token oluştur
  /// 
  /// [orderId] - Benzersiz sipariş numarası
  /// [amount] - Ödeme tutarı (örn: 1234.56)
  /// [currency] - Para birimi (TRY, EUR, USD)
  /// [basketItems] - Sepet içeriği
  /// [userIp] - Müşteri IP adresi
  Future<PayTrTokenResponse?> createPaymentToken({
    required String orderId,
    required double amount,
    String currency = 'TRY',
    required List<PayTrBasketItem> basketItems,
    String? userIp,
  }) async {
    try {
      isLoading.value = true;
      error.value = null;
      currentPaymentId.value = orderId;
      paymentStatus.value = PayTrPaymentStatus.pending;

      // Kullanıcı bilgilerini al
      final authService = Get.find<AuthService>();
      final user = authService.user.value;
      
      if (user.id == null || user.id!.isEmpty) {
        error.value = 'Kullanıcı girişi gerekli';
        return null;
      }

      // User basket oluştur
      final basketJson = basketItems.map((item) => item.toList()).toList();
      final userBasket = base64Encode(utf8.encode(jsonEncode(basketJson)));

      // PayTR tutarı (100 ile çarp)
      final paymentAmount = PayTrConfig.convertAmount(amount);
      
      // PayTR para birimi
      final paytrCurrency = PayTrConfig.convertCurrency(currency);

      // Hash string oluştur
      final hashStr = PayTrConfig.merchantId +
          (userIp ?? '127.0.0.1') +
          orderId +
          (user.email ?? 'customer@example.com') +
          paymentAmount.toString() +
          userBasket +
          PayTrConfig.noInstallment.toString() +
          PayTrConfig.maxInstallment.toString() +
          paytrCurrency +
          PayTrConfig.testMode.toString();

      // HMAC-SHA256 hash
      final paytrToken = _generateToken(hashStr);

      // Request oluştur
      final request = PayTrTokenRequest(
        merchantId: PayTrConfig.merchantId,
        userIp: userIp ?? '127.0.0.1',
        merchantOid: orderId,
        email: user.email ?? 'customer@example.com',
        paymentAmount: paymentAmount,
        userBasket: userBasket,
        noInstallment: PayTrConfig.noInstallment,
        maxInstallment: PayTrConfig.maxInstallment,
        currency: paytrCurrency,
        testMode: PayTrConfig.testMode,
        userName: user.fullName ?? 'Misafir',
        userAddress: 'Türkiye', // UserModel'de adres alanı yok
        userPhone: user.phoneNumber ?? '5551234567',
        merchantOkUrl: PayTrConfig.okUrl,
        merchantFailUrl: PayTrConfig.failUrl,
        timeoutLimit: PayTrConfig.timeoutLimit,
        debugOn: PayTrConfig.debugOn,
        paytrToken: paytrToken,
        lang: PayTrConfig.defaultLang,
      );

      print('[PayTR] Token request: ${request.toMap()}');

      // API çağrısı
      final response = await _dio.post(
        PayTrConfig.tokenUrl,
        data: request.toMap(),
        options: Options(
          contentType: Headers.formUrlEncodedContentType,
        ),
      );

      print('[PayTR] Token response: ${response.data}');

      if (response.statusCode == 200) {
        final tokenResponse = PayTrTokenResponse.fromJson(
          response.data is String 
              ? jsonDecode(response.data) 
              : response.data,
        );
        
        if (!tokenResponse.success) {
          error.value = tokenResponse.reason ?? 'Token alınamadı';
          return null;
        }
        
        return tokenResponse;
      } else {
        error.value = 'HTTP Hatası: ${response.statusCode}';
        return null;
      }
    } catch (e) {
      print('[PayTR] Token error: $e');
      error.value = 'Ödeme başlatılamadı: $e';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================================
  // HASH OLUŞTURMA
  // ============================================================

  /// PayTR token hash'i oluştur
  String _generateToken(String hashStr) {
    final key = utf8.encode(PayTrConfig.merchantKey);
    final data = utf8.encode(hashStr + PayTrConfig.merchantSalt);
    
    final hmac = Hmac(sha256, key);
    final digest = hmac.convert(data);
    
    return base64Encode(digest.bytes);
  }

  /// Bildirim hash'i doğrula (webhook için)
  bool verifyNotificationHash(PayTrNotification notification) {
    final hashStr = notification.merchantOid +
        PayTrConfig.merchantSalt +
        notification.status +
        notification.totalAmount.toString();
    
    final key = utf8.encode(PayTrConfig.merchantKey);
    final data = utf8.encode(hashStr);
    
    final hmac = Hmac(sha256, key);
    final digest = hmac.convert(data);
    final calculatedHash = base64Encode(digest.bytes);
    
    return calculatedHash == notification.hash;
  }

  // ============================================================
  // SİPARİŞ NO OLUŞTURMA
  // ============================================================

  /// Benzersiz sipariş numarası oluştur
  String generateOrderId() {
    final uuid = const Uuid().v4();
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    // PayTR max 64 karakter
    return 'SFN${timestamp}_${uuid.substring(0, 8)}'.toUpperCase();
  }

  // ============================================================
  // ÖDEME DURUMU
  // ============================================================

  /// Ödeme durumunu güncelle (webhook'tan çağrılır)
  void updatePaymentStatus(PayTrPaymentStatus status) {
    paymentStatus.value = status;
    print('[PayTR] Payment status updated: $status');
  }

  /// Aktif ödemeyi iptal et
  void cancelPayment() {
    paymentStatus.value = PayTrPaymentStatus.cancelled;
    currentPaymentId.value = null;
    error.value = null;
  }

  /// Servisi sıfırla
  void reset() {
    isLoading.value = false;
    error.value = null;
    currentPaymentId.value = null;
    paymentStatus.value = PayTrPaymentStatus.pending;
  }
}
