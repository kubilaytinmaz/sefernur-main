import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:uuid/uuid.dart';

import '../../models/payment/kuveytturk_models.dart';
import '../../providers/payment/kuveytturk_config.dart';
import '../currency/currency_service.dart';

/// KuveytTürk Sanal POS Servisi
/// 
/// 3D Secure Model entegrasyonu ile ödeme işlemlerini yönetir.
/// 
/// Akış:
/// 1. initiate3DPayment() - Kart bilgileriyle 3D ödeme başlat
/// 2. Banka 3D sayfası açılır (WebView'da)
/// 3. completePayment() - MD değeri ile ödemeyi tamamla
class KuveytTurkService extends GetxService {
  late Dio _dio;
  
  // State
  final isLoading = false.obs;
  final error = RxnString();
  final currentOrderId = RxnString();
  final paymentStatus = Rx<KuveytTurkPaymentStatus>(KuveytTurkPaymentStatus.pending);
  
  // Geçici veriler (3D akışı için)
  String? _pendingMerchantOrderId;
  int? _pendingAmount;
  String? _pendingCurrencyCode;

  Future<KuveytTurkService> init() async {
    _dio = Dio(
      BaseOptions(
        connectTimeout: Duration(seconds: KuveytTurkConfig.timeoutSeconds),
        receiveTimeout: Duration(seconds: KuveytTurkConfig.timeoutSeconds),
        headers: {
          'Content-Type': 'application/xml',
        },
      ),
    );
    
    // Debug interceptor
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print('[KuveytTurk] $obj'),
    ));
    
    return this;
  }

  // ============================================================
  // HASH OLUŞTURMA
  // ============================================================

  /// SHA1 hash oluştur (Base64 encoded)
  String _sha1Base64(String input) {
    final bytes = utf8.encode(input);
    final digest = sha1.convert(bytes);
    return base64Encode(digest.bytes);
  }

  /// Şifreyi hashle
  String get _hashedPassword => _sha1Base64(KuveytTurkConfig.password);

  /// 3D ödeme başlatma için hash oluştur
  /// Hash = Base64(SHA1(MerchantId + MerchantOrderId + Amount + OkUrl + FailUrl + UserName + HashedPassword))
  String _createPaymentHash({
    required String merchantOrderId,
    required int amount,
    required String okUrl,
    required String failUrl,
  }) {
    final hashStr = KuveytTurkConfig.merchantId +
        merchantOrderId +
        amount.toString() +
        okUrl +
        failUrl +
        KuveytTurkConfig.userName +
        _hashedPassword;
    
    return _sha1Base64(hashStr);
  }

  /// Ödeme onay için hash oluştur
  /// Hash = Base64(SHA1(MerchantId + MerchantOrderId + Amount + UserName + HashedPassword))
  String _createApprovalHash({
    required String merchantOrderId,
    required int amount,
  }) {
    final hashStr = KuveytTurkConfig.merchantId +
        merchantOrderId +
        amount.toString() +
        KuveytTurkConfig.userName +
        _hashedPassword;
    
    return _sha1Base64(hashStr);
  }

  // ============================================================
  // SİPARİŞ NO OLUŞTURMA
  // ============================================================

  /// Benzersiz sipariş numarası oluştur
  String generateOrderId() {
    final uuid = const Uuid().v4();
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return 'SEF${timestamp.toString().substring(5)}-${uuid.substring(0, 8)}';
  }

  // ============================================================
  // 3D ÖDEME BAŞLATMA (ADIM 1)
  // ============================================================

  /// 3D ödeme başlat - HTML form döner (WebView'da gösterilecek)
  /// 
  /// [orderId] - Benzersiz sipariş numarası
  /// [amount] - Ödeme tutarı (örn: 1234.56)
  /// [currency] - Para birimi (TRY, EUR, USD)
  /// [cardInfo] - Kart bilgileri
  /// [installmentCount] - Taksit sayısı (0 = peşin)
  /// [email] - Kart sahibi email (3D Secure 2.X için)
  /// [phoneNumber] - Kart sahibi telefon numarası (3D Secure 2.X için)
  Future<String?> initiate3DPayment({
    required String orderId,
    required double amount,
    String currency = 'TRY',
    required KuveytTurkCardInfo cardInfo,
    required String identityTaxNumber,
    int installmentCount = 0,
    String? email,
    String? phoneNumber,
  }) async {
    try {
      isLoading.value = true;
      error.value = null;
      currentOrderId.value = orderId;
      paymentStatus.value = KuveytTurkPaymentStatus.processing;

      // Kart bilgilerini doğrula
      if (!cardInfo.isValid) {
        error.value = 'Geçersiz kart bilgileri';
        paymentStatus.value = KuveytTurkPaymentStatus.failed;
        return null;
      }

      // Tutarı dönüştür
      // Otel fiyatları USD/EUR cinsinden geliyor
      // Bankaya TRY gönderilecekse, kur dönüşümü yapılmalı
      double paymentAmountRaw = amount;
      String finalCurrency = currency;
      
      if (currency.toUpperCase() != 'TRY' && currency.toUpperCase() != 'TL') {
        // Döviz cinsinden fiyat - TRY'ye çevir
        // (Test ortamında zorunlu, prodüksiyonda da TRY gönderilecek)
        try {
          final currencyService = Get.find<CurrencyService>();
          final rate = currencyService.currentRate.value;
          paymentAmountRaw = rate.toTRY(amount);
          finalCurrency = 'TRY';
          print('[KuveytTurk] Kur dönüşümü: $amount $currency -> ${paymentAmountRaw.toStringAsFixed(2)} TRY (kur: ${rate.rate})');
        } catch (e) {
          print('[KuveytTurk] CurrencyService bulunamadı, tutar olduğu gibi gönderiliyor: $e');
        }
      }
      
      final paymentAmount = KuveytTurkConfig.convertAmount(paymentAmountRaw);
      final currencyCode = KuveytTurkConfig.convertCurrency(finalCurrency);

      // Geçici verileri sakla (onay adımı için)
      _pendingMerchantOrderId = orderId;
      _pendingAmount = paymentAmount;
      _pendingCurrencyCode = currencyCode;

      // Hash oluştur
      final hashData = _createPaymentHash(
        merchantOrderId: orderId,
        amount: paymentAmount,
        okUrl: KuveytTurkConfig.okUrl,
        failUrl: KuveytTurkConfig.failUrl,
      );

      // Kart tipini belirle
      final cardType = cardInfo.cardType ?? 
          KuveytTurkConfig.detectCardType(cardInfo.cardNumber);

      // Kullanıcı IP adresini al (3D Secure 2.X zorunlu)
      final clientIp = await getUserIp();

      // Telefon numarasını parçala (varsa)
      String? phoneCountryCode;
      String? phoneSubscriber;
      if (phoneNumber != null && phoneNumber.isNotEmpty) {
        final cleaned = phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');
        if (cleaned.startsWith('90') && cleaned.length > 10) {
          phoneCountryCode = '90';
          phoneSubscriber = cleaned.substring(2);
        } else if (cleaned.startsWith('0') && cleaned.length > 10) {
          phoneCountryCode = '90';
          phoneSubscriber = cleaned.substring(1);
        } else {
          phoneCountryCode = '90';
          phoneSubscriber = cleaned;
        }
      }

      // Request oluştur (3D Secure 2.X - TDV2.0.0)
      final request = KuveytTurkPaymentRequest(
        merchantId: KuveytTurkConfig.merchantId,
        customerId: KuveytTurkConfig.customerId,
        userName: KuveytTurkConfig.userName,
        merchantOrderId: orderId,
        amount: paymentAmount,
        currencyCode: currencyCode,
        okUrl: KuveytTurkConfig.okUrl,
        failUrl: KuveytTurkConfig.failUrl,
        hashData: hashData,
        clientIp: clientIp,
        deviceChannel: '02', // Web Browser (WebView)
        email: email,
        phoneCountryCode: phoneCountryCode,
        phoneSubscriber: phoneSubscriber,
        identityTaxNumber: identityTaxNumber,
        cardInfo: KuveytTurkCardInfo(
          cardHolderName: cardInfo.cardHolderName,
          cardNumber: cardInfo.cardNumber.replaceAll(' ', ''),
          cardExpireMonth: cardInfo.cardExpireMonth,
          cardExpireYear: cardInfo.cardExpireYear,
          cardCvv: cardInfo.cardCvv,
          cardType: cardType,
        ),
        installmentCount: installmentCount,
      );

      print('[KuveytTurk] 3D Payment Request XML:\n${request.toXml()}');

      // API çağrısı
      final response = await _dio.post(
        KuveytTurkConfig.threeDPayGateUrl,
        data: request.toXml(),
        options: Options(
          contentType: 'application/xml',
          responseType: ResponseType.plain,
        ),
      );

      print('[KuveytTurk] 3D Payment Response: ${response.data}');

      if (response.statusCode == 200) {
        final responseStr = response.data.toString();
        
        // API hata döndüyse HTML içinden yakalayıp kullanıcıya göster
        // Hata durumunda form action fail URL'e yönlenir
        if (responseStr.contains(KuveytTurkConfig.failUrl)) {
          // AuthenticationResponse'daki hata mesajını çıkar
          final authResponse = _extractAuthResponseFromHtml(responseStr);
          if (authResponse != null) {
            final parsed = parseAuthResponse(authResponse);
            error.value = parsed.responseMessage.isNotEmpty 
                ? parsed.responseMessage 
                : 'Ödeme başlatılamadı (${parsed.responseCode})';
          } else {
            error.value = 'Banka hata yanıtı döndü';
          }
          paymentStatus.value = KuveytTurkPaymentStatus.failed;
          return null;
        }
        
        // Başarılı - HTML form içerir, WebView'da gösterilecek
        return responseStr;
      } else {
        error.value = 'HTTP Hatası: ${response.statusCode}';
        paymentStatus.value = KuveytTurkPaymentStatus.failed;
        return null;
      }
    } catch (e) {
      print('[KuveytTurk] 3D Payment Error: $e');
      error.value = 'Ödeme başlatılamadı: $e';
      paymentStatus.value = KuveytTurkPaymentStatus.failed;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================================
  // 3D DOĞRULAMA SONRASI (ADIM 2)
  // ============================================================

  /// AuthenticationResponse'u parse et
  KuveytTurkAuthResponse parseAuthResponse(String authResponseXml) {
    try {
      // URL decode (birden fazla encode olabilir)
      var decoded = authResponseXml;
      // '+' karakterini boşluk yap
      decoded = decoded.replaceAll('+', ' ');
      // Çoklu URL decode - encode kaç kez yapılmışsa aç
      int maxIterations = 5;
      while (decoded.contains('%') && maxIterations > 0) {
        final prev = decoded;
        try {
          decoded = Uri.decodeComponent(decoded);
        } catch (_) {
          break;
        }
        if (decoded == prev) break;
        maxIterations--;
      }
      
      // XML olarak başlamıyorsa, içinden XML'i çıkar
      if (!decoded.trimLeft().startsWith('<?xml') && !decoded.trimLeft().startsWith('<VPos')) {
        // HTML içinden AuthenticationResponse value'sini çıkar
        final regex = RegExp(r'value="([^"]+)"');
        final match = regex.firstMatch(decoded);
        if (match != null) {
          decoded = match.group(1) ?? decoded;
          // Tekrar decode et
          decoded = decoded.replaceAll('+', ' ');
          int retries = 5;
          while (decoded.contains('%') && retries > 0) {
            final prev = decoded;
            try {
              decoded = Uri.decodeComponent(decoded);
            } catch (_) {
              break;
            }
            if (decoded == prev) break;
            retries--;
          }
        }
      }

      print('[KuveytTurk] Decoded AuthResponse: $decoded');
      return KuveytTurkAuthResponse.fromXml(decoded);
    } catch (e) {
      print('[KuveytTurk] Auth Response Parse Error: $e');
      return KuveytTurkAuthResponse(
        responseCode: 'PARSE_ERROR',
        responseMessage: 'Yanıt parse edilemedi: $e',
      );
    }
  }

  // ============================================================
  // ÖDEME TAMAMLAMA (ADIM 3)
  // ============================================================

  /// Ödemeyi tamamla (MD değeri ile)
  Future<KuveytTurkPaymentResult> completePayment({
    required String md,
    String? merchantOrderId,
    int? amount,
    String? currencyCode,
  }) async {
    try {
      isLoading.value = true;
      error.value = null;

      // Değerleri al (parametre veya saklanan)
      final orderId = merchantOrderId ?? _pendingMerchantOrderId;
      final paymentAmount = amount ?? _pendingAmount;
      final currency = currencyCode ?? _pendingCurrencyCode ?? KuveytTurkConfig.defaultCurrencyCode;

      if (orderId == null || paymentAmount == null) {
        error.value = 'Eksik ödeme bilgileri';
        paymentStatus.value = KuveytTurkPaymentStatus.failed;
        return KuveytTurkPaymentResult.failed(
          errorMessage: 'Eksik ödeme bilgileri',
        );
      }

      // Hash oluştur
      final hashData = _createApprovalHash(
        merchantOrderId: orderId,
        amount: paymentAmount,
      );

      // Request oluştur
      final request = KuveytTurkApprovalRequest(
        merchantId: KuveytTurkConfig.merchantId,
        customerId: KuveytTurkConfig.customerId,
        userName: KuveytTurkConfig.userName,
        merchantOrderId: orderId,
        amount: paymentAmount,
        currencyCode: currency,
        hashData: hashData,
        md: md,
      );

      print('[KuveytTurk] Approval Request XML:\n${request.toXml()}');

      // API çağrısı
      final response = await _dio.post(
        KuveytTurkConfig.threeDProvisionGateUrl,
        data: request.toXml(),
        options: Options(
          contentType: 'application/xml',
          responseType: ResponseType.plain,
        ),
      );

      print('[KuveytTurk] Approval Response: ${response.data}');

      if (response.statusCode == 200) {
        final paymentResponse = KuveytTurkPaymentResponse.fromXml(
          response.data.toString(),
        );

        if (paymentResponse.isSuccess) {
          paymentStatus.value = KuveytTurkPaymentStatus.success;
          _clearPendingData();
          
          return KuveytTurkPaymentResult.success(
            transactionId: orderId,
            provisionNumber: paymentResponse.provisionNumber,
            orderId: paymentResponse.orderId?.toString(),
            amount: KuveytTurkConfig.parseAmount(paymentAmount),
          );
        } else {
          paymentStatus.value = KuveytTurkPaymentStatus.failed;
          error.value = paymentResponse.responseMessage;
          
          return KuveytTurkPaymentResult.failed(
            errorMessage: paymentResponse.responseMessage,
            errorCode: paymentResponse.responseCode,
          );
        }
      } else {
        paymentStatus.value = KuveytTurkPaymentStatus.failed;
        error.value = 'HTTP Hatası: ${response.statusCode}';
        
        return KuveytTurkPaymentResult.failed(
          errorMessage: 'HTTP Hatası: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('[KuveytTurk] Approval Error: $e');
      paymentStatus.value = KuveytTurkPaymentStatus.failed;
      error.value = 'Ödeme tamamlanamadı: $e';
      
      return KuveytTurkPaymentResult.failed(
        errorMessage: 'Ödeme tamamlanamadı: $e',
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================================
  // DURUM YÖNETİMİ
  // ============================================================

  /// Ödeme durumunu güncelle
  void updatePaymentStatus(KuveytTurkPaymentStatus status) {
    paymentStatus.value = status;
  }

  /// Geçici verileri temizle
  void _clearPendingData() {
    _pendingMerchantOrderId = null;
    _pendingAmount = null;
    _pendingCurrencyCode = null;
  }

  /// Servisi sıfırla
  void reset() {
    currentOrderId.value = null;
    paymentStatus.value = KuveytTurkPaymentStatus.pending;
    error.value = null;
    _clearPendingData();
  }

  // ============================================================
  // YARDIMCI METODLAR
  // ============================================================

  /// HTML form içinden AuthenticationResponse value değerini çıkar
  /// KuveytTürk hata durumunda HTML form döner, içinde AuthenticationResponse
  /// input alanı bulunur. Bu metod o değeri extract eder.
  String? _extractAuthResponseFromHtml(String html) {
    try {
      // <input name="AuthenticationResponse" value="..." /> pattern
      final regex = RegExp(
        r'name\s*=\s*"AuthenticationResponse"\s+value\s*=\s*"([^"]*)"',
        caseSensitive: false,
      );
      final match = regex.firstMatch(html);
      if (match != null && match.group(1) != null) {
        return match.group(1)!;
      }
      
      // Alternatif: value önce gelebilir
      final altRegex = RegExp(
        r'value\s*=\s*"([^"]*)"\s+name\s*=\s*"AuthenticationResponse"',
        caseSensitive: false,
      );
      final altMatch = altRegex.firstMatch(html);
      if (altMatch != null && altMatch.group(1) != null) {
        return altMatch.group(1)!;
      }
      
      return null;
    } catch (e) {
      print('[KuveytTurk] Error extracting AuthResponse from HTML: $e');
      return null;
    }
  }

  /// Test modu aktif mi?
  bool get isTestMode => !KuveytTurkConfig.isProduction;

  /// Kullanıcı IP adresini al
  Future<String> getUserIp() async {
    try {
      final response = await Dio().get('https://api.ipify.org?format=json');
      return response.data['ip'] ?? '127.0.0.1';
    } catch (e) {
      return '127.0.0.1';
    }
  }
}
