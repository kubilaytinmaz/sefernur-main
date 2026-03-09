/// PayTR API Konfigürasyonu
/// 
/// Mağaza panelinden alınan API bilgileri buraya girilmeli.
/// NOT: Bu bilgileri .env dosyasında saklamanız önerilir.
class PayTrConfig {
  // ============================================================
  // API BİLGİLERİ
  // ============================================================
  
  /// Mağaza ID (Mağaza Paneli > Destek & Kurulum > Entegrasyon Bilgileri)
  static const String merchantId = 'XXXXXX'; // TODO: Gerçek değeri girin
  
  /// Mağaza Key (API Key)
  static const String merchantKey = 'YYYYYYYYYYYYYY'; // TODO: Gerçek değeri girin
  
  /// Mağaza Salt (API Salt)
  static const String merchantSalt = 'ZZZZZZZZZZZZZZ'; // TODO: Gerçek değeri girin
  
  // ============================================================
  // API URL'LERİ
  // ============================================================
  
  /// Token alma endpoint'i
  static const String tokenUrl = 'https://www.paytr.com/odeme/api/get-token';
  
  /// iFrame ödeme URL'i (token ile birleştirilecek)
  static const String iframeBaseUrl = 'https://www.paytr.com/odeme/guvenli/';
  
  /// Durum sorgulama endpoint'i
  static const String statusUrl = 'https://www.paytr.com/odeme/api/payment-status';
  
  /// İade API endpoint'i
  static const String refundUrl = 'https://www.paytr.com/odeme/iade';
  
  // ============================================================
  // CALLBACK URL'LERİ
  // ============================================================
  
  /// Başarılı ödeme sonrası yönlendirme (Deep link)
  static const String okUrl = 'sefernur://payment/success';
  
  /// Başarısız ödeme sonrası yönlendirme (Deep link)
  static const String failUrl = 'sefernur://payment/fail';
  
  /// Bildirim URL (Backend webhook - Firebase Function olacak)
  /// NOT: Bu URL'i Mağaza Paneli > Destek & Kurulum > Ayarlar'da tanımlayın
  static const String notificationUrl = 'https://us-central1-YOUR_PROJECT.cloudfunctions.net/paytrWebhook';
  
  // ============================================================
  // VARSAYILAN AYARLAR
  // ============================================================
  
  /// Test modu (canlıya geçerken 0 yapın)
  static const int testMode = 1;
  
  /// Debug modu (hata mesajları gösterilsin mi)
  static const int debugOn = 1;
  
  /// Ödeme zaman aşımı (dakika)
  static const int timeoutLimit = 30;
  
  /// Varsayılan dil
  static const String defaultLang = 'tr';
  
  /// Varsayılan para birimi
  static const String defaultCurrency = 'TRY';
  
  /// Taksit devre dışı mı? (Otel rezervasyonları için genelde 0)
  static const int noInstallment = 0;
  
  /// Maksimum taksit sayısı (0 = sınırsız)
  static const int maxInstallment = 12;
  
  // ============================================================
  // HELPER METHODS
  // ============================================================
  
  /// Para birimini PayTR formatına çevir
  static String convertCurrency(String currency) {
    switch (currency.toUpperCase()) {
      case 'TL':
      case 'TRY':
        return 'TL';
      case 'EUR':
        return 'EUR';
      case 'USD':
        return 'USD';
      case 'GBP':
        return 'GBP';
      default:
        return 'TL';
    }
  }
  
  /// Tutarı PayTR formatına çevir (100 ile çarp)
  /// Örnek: 34.56 -> 3456
  static int convertAmount(double amount) {
    return (amount * 100).round();
  }
}
