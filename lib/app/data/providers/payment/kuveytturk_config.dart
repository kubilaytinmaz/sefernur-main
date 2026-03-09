import 'package:firebase_remote_config/firebase_remote_config.dart';

/// KuveytTürk Sanal POS API Konfigürasyonu
/// 
/// Hassas bilgiler Firebase Remote Config'den okunur.
/// Helper method'lar ve sabitler lokal olarak kalır.
class KuveytTurkConfig {
  KuveytTurkConfig._();

  static final _remoteConfig = FirebaseRemoteConfig.instance;

  // ============================================================
  // REMOTE CONFIG KEY'LERİ
  // ============================================================

  static const String _keyMerchantId = 'kuveytturk_merchant_id';
  static const String _keyCustomerId = 'kuveytturk_customer_id';
  static const String _keyUserName = 'kuveytturk_username';
  static const String _keyPassword = 'kuveytturk_password';
  static const String _keyIsProduction = 'kuveytturk_is_production';
  static const String _keyOkUrl = 'kuveytturk_ok_url';
  static const String _keyFailUrl = 'kuveytturk_fail_url';

  // ============================================================
  // VARSAYILAN DEĞERLER (Remote Config ulaşılamazsa)
  // ============================================================

  static const Map<String, dynamic> _defaults = {
    _keyMerchantId: '',
    _keyCustomerId: '',
    _keyUserName: '',
    _keyPassword: '',
    _keyIsProduction: false,
    _keyOkUrl: 'https://sefernur.com/payment/kuveytturk/callback',
    _keyFailUrl: 'https://sefernur.com/payment/kuveytturk/fail',
  };

  // ============================================================
  // TEST ORTAM BİLGİLERİ (RC'de isProduction false ise kullanılır)
  // ============================================================

  static const String _testMerchantId = '57902';
  static const String _testCustomerId = '97228291';
  static const String _testUserName = 'TEPKVT2021';
  static const String _testPassword = 'api123';
  static const String _testOkUrl = 'https://sefernur.com/payment/kuveytturk/callback';
  static const String _testFailUrl = 'https://sefernur.com/payment/kuveytturk/fail';

  /// Remote Config default değerlerini set et (uygulama başlangıcında çağrılmalı)
  static Future<void> init() async {
    await _remoteConfig.setDefaults(_defaults);
    await _remoteConfig.fetchAndActivate();
  }

  // ============================================================
  // REMOTE CONFIG'DEN OKUNAN DEĞERLER (test fallback'li)
  // ============================================================

  /// Canlı ortam aktif mi
  static bool get isProduction => _remoteConfig.getBool(_keyIsProduction);

  /// Mağaza Kodu (MerchantId)
  static String get merchantId {
    if (!isProduction) return _testMerchantId;
    final val = _remoteConfig.getString(_keyMerchantId);
    return val.isNotEmpty ? val : _testMerchantId;
  }

  /// Müşteri Numarası (CustomerId)
  static String get customerId {
    if (!isProduction) return _testCustomerId;
    final val = _remoteConfig.getString(_keyCustomerId);
    return val.isNotEmpty ? val : _testCustomerId;
  }

  /// API Kullanıcı Adı
  static String get userName {
    if (!isProduction) return _testUserName;
    final val = _remoteConfig.getString(_keyUserName);
    return val.isNotEmpty ? val : _testUserName;
  }

  /// API Şifresi
  static String get password {
    if (!isProduction) return _testPassword;
    final val = _remoteConfig.getString(_keyPassword);
    return val.isNotEmpty ? val : _testPassword;
  }

  /// Başarılı ödeme callback URL
  static String get okUrl {
    if (!isProduction) return _testOkUrl;
    final val = _remoteConfig.getString(_keyOkUrl);
    return val.isNotEmpty ? val : _testOkUrl;
  }

  /// Başarısız ödeme callback URL
  static String get failUrl {
    if (!isProduction) return _testFailUrl;
    final val = _remoteConfig.getString(_keyFailUrl);
    return val.isNotEmpty ? val : _testFailUrl;
  }
  
  // ============================================================
  // API URL'LERİ
  // ============================================================

  /// Test ortamı base URL
  static const String testBaseUrl = 'https://boatest.kuveytturk.com.tr/boa.virtualpos.services/Home';

  /// Canlı ortam base URL
  static const String prodBaseUrl = 'https://sanalpos.kuveytturk.com.tr/ServiceGateWay/Home';

  /// Aktif base URL
  static String get baseUrl => isProduction ? prodBaseUrl : testBaseUrl;

  /// 3D Model Pay Gate - İlk adım (kart doğrulama başlat)
  static String get threeDPayGateUrl => '$baseUrl/ThreeDModelPayGate';

  /// 3D Model Provision Gate - Son adım (ödeme onayı)
  static String get threeDProvisionGateUrl => '$baseUrl/ThreeDModelProvisionGate';

  // ============================================================
  // DEEP LINK
  // ============================================================
  
  /// Deep link scheme (WebView'dan yakalamak için)
  static const String deepLinkScheme = 'sefernur';
  static const String successDeepLink = 'sefernur://payment/success';
  static const String failDeepLink = 'sefernur://payment/fail';

  // ============================================================
  // DOĞRULAMA
  // ============================================================

  /// Remote Config'den alınan credential'ların geçerli olup olmadığını kontrol et
  static bool get isConfigured =>
      merchantId.isNotEmpty &&
      customerId.isNotEmpty &&
      userName.isNotEmpty &&
      password.isNotEmpty;
  
  // ============================================================
  // VARSAYILAN AYARLAR
  // ============================================================
  
  /// API Versiyonu
  static const String apiVersion = '1.0.0';
  
  /// Para birimi kodu (TRY = 0949)
  static const String currencyCodeTRY = '0949';
  static const String currencyCodeUSD = '0840';
  static const String currencyCodeEUR = '0978';
  
  /// Varsayılan para birimi
  static const String defaultCurrencyCode = currencyCodeTRY;
  
  /// İşlem tipi
  static const String transactionTypeSale = 'Sale';
  static const String transactionTypeRefund = 'SaleReversal'; // İade
  static const String transactionTypeCancel = 'Cancel'; // İptal
  
  /// Kart tipleri
  static const String cardTypeVisa = 'Visa';
  static const String cardTypeMasterCard = 'MasterCard';
  static const String cardTypeTroy = 'Troy';
  
  /// Transaction Security (3D Secure için 3)
  static const int transactionSecurity = 3;
  
  /// Batch ID (varsayılan 0)
  static const int batchId = 0;
  
  /// Timeout (5 dakika)
  static const int timeoutSeconds = 300;
  
  // ============================================================
  // TEST KART BİLGİLERİ
  // ============================================================
  
  /// Test kartı numarası (başarılı işlem)
  static const String testCardNumber = '5188961939192544';
  
  /// Test kartı son kullanma ayı
  static const String testCardExpireMonth = '06';
  
  /// Test kartı son kullanma yılı
  static const String testCardExpireYear = '25';
  
  /// Test kartı CVV
  static const String testCardCvv = '929';
  
  /// Test kartı sahibi adı
  static const String testCardHolderName = 'Test User';

  /// Test kartı 3D doğrulama şifresi (SMS OTP yerine)
  static const String testCardVerificationPassword = '123456';
  
  // ============================================================
  // RESPONSE CODES
  // ============================================================
  
  /// Başarılı işlem kodu
  static const String responseCodeSuccess = '00';
  
  /// Kart doğrulandı mesajı
  static const String responseMessageCardVerified = 'Kart doğrulandı';
  
  // ============================================================
  // HELPER METHODS
  // ============================================================
  
  /// Para birimini KuveytTürk formatına çevir
  static String convertCurrency(String currency) {
    switch (currency.toUpperCase()) {
      case 'TRY':
      case 'TL':
        return currencyCodeTRY;
      case 'USD':
        return currencyCodeUSD;
      case 'EUR':
        return currencyCodeEUR;
      default:
        return currencyCodeTRY;
    }
  }
  
  /// Tutarı KuveytTürk formatına çevir (100 ile çarp)
  /// Örnek: 34.56 -> 3456
  static int convertAmount(double amount) {
    return (amount * 100).round();
  }
  
  /// KuveytTürk tutarını normal tutara çevir
  static double parseAmount(int amount) {
    return amount / 100;
  }
  
  /// Kart numarasından kart tipini belirle
  static String detectCardType(String cardNumber) {
    final cleaned = cardNumber.replaceAll(RegExp(r'\D'), '');
    if (cleaned.isEmpty) return cardTypeMasterCard;
    
    final firstDigit = cleaned[0];
    final firstTwoDigits = cleaned.length >= 2 ? cleaned.substring(0, 2) : '';
    final firstSixDigits = cleaned.length >= 6 ? cleaned.substring(0, 6) : '';
    
    // Troy kartları (9792 ile başlar)
    if (cleaned.startsWith('9792')) return cardTypeTroy;
    
    // Visa kartları (4 ile başlar)
    if (firstDigit == '4') return cardTypeVisa;
    
    // MasterCard kartları (51-55 veya 2221-2720 ile başlar)
    if (firstTwoDigits.isNotEmpty) {
      final twoDigit = int.tryParse(firstTwoDigits) ?? 0;
      if (twoDigit >= 51 && twoDigit <= 55) return cardTypeMasterCard;
      
      if (firstSixDigits.isNotEmpty) {
        final sixDigit = int.tryParse(firstSixDigits.substring(0, 4)) ?? 0;
        if (sixDigit >= 2221 && sixDigit <= 2720) return cardTypeMasterCard;
      }
    }
    
    return cardTypeMasterCard; // Varsayılan
  }
}
