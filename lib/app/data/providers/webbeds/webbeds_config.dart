/// WebBeds (DOTW) API Configuration
/// 
/// API credentials ve endpoint ayarları.
/// Production'a geçişte baseUrl ve credentials güncellenecek.
class WebBedsConfig {
  WebBedsConfig._();

  // API Endpoints
  static const String baseUrlTest = 'https://xmldev.dotwconnect.com/gatewayV4.dotw';
  static const String baseUrlProd = 'https://xml.dotwconnect.com/gatewayV4.dotw';
  
  // Aktif endpoint (test/prod geçişi için)
  static const bool isProduction = false;
  static String get baseUrl => isProduction ? baseUrlProd : baseUrlTest;

  // API Credentials
  static const String username = 'birlikgrup';
  static const String password = '21011995Kk.'; // Plain text - MD5'e çevrilecek
  static const String companyId = '2285355';
  static const String source = '1';
  static const String product = 'hotel';
  static const String language = 'en';

  // Timeouts
  static const int connectionTimeout = 30000; // 30 saniye
  static const int receiveTimeout = 60000; // 60 saniye (API yavaş olabilir)

  // API Limits
  static const int maxHotelsPerRequest = 50; // Performans için batch size
  static const int blockingTimeoutMinutes = 15; // Bloklama süresi

  // Country & City Codes (Hac/Umre için önemli)
  // DOTW API'den doğrulanmış kodlar (9 Mart 2026)
  static const int saudiArabiaCode = 4; // Suudi Arabistan
  static const int saudiCountryCode = 4; // Alias - Suudi Arabistan
  static const int turkeyCode = 5; // Türkiye
  
  // Mekke ve Medine şehir kodları (DOTW getservingcities API'den doğrulanmış)
  static const int meccaCityCode = 164; // MAKKAH (Mekke)
  static const int medinaCityCode = 174; // MADINAH (Medine)
  static const int jeddahCityCode = 134; // JEDDAH (Cidde)

  // Currency Codes (WebBeds API)
  // WebBeds support tarafından onaylanan hesap currency kodları (9 Ocak 2026)
  // NOT: Bu kodlar hesaba özel olup, diğer hesaplar için farklı olabilir
  static const int currencyEUR = 413; // Euro
  static const int currencyGBP = 416; // UK Pounds Sterling
  static const int currencyUSD = 520; // US Dollars
  
  // Bu hesapta desteklenmeyen currency'ler (referans için)
  // static const int currencyTRY = ???; // Turkish Lira - desteklenmiyor
  // static const int currencySAR = ???; // Saudi Riyal - desteklenmiyor

  // Default Values - USD kullanıyoruz (TL çevirimi için)
  static const int defaultCurrency = currencyUSD;
  static const int defaultNationality = turkeyCode;
  static const int defaultCountryOfResidence = turkeyCode;

  // Rate Basis
  static const int rateBasisAll = -1; // Tüm rate'ler
  static const int rateBasisRoomOnly = 1;
  static const int rateBasisBB = 2; // Bed & Breakfast
  static const int rateBasisHB = 3; // Half Board
  static const int rateBasisFB = 4; // Full Board
  static const int rateBasisAI = 5; // All Inclusive

  // Salutation Codes
  static const int salutationMr = 147;
  static const int salutationMrs = 148;
  static const int salutationMs = 149;
  static const int salutationMiss = 150;

  // Booking Types
  static const int bookingTypeHotel = 1;
}
