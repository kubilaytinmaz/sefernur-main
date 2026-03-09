import 'package:get/get.dart';

import '../../data/models/currency/currency_model.dart';
import '../../data/services/currency/currency_service.dart';

/// Döviz kuru controller - UI için binding ve helper metodlar sağlar
/// 
/// NOT: Tüm fiyatlar TL cinsinden girilir ve kaydedilir.
/// formatBoth metodu TL'yi alır ve hem TL hem USD gösterir.
class CurrencyController extends GetxController {
  late final CurrencyService _service;

  /// Mevcut döviz kuru
  ExchangeRateModel get currentRate => _service.currentRate.value;

  /// Yükleniyor mu?
  bool get isLoading => _service.isLoading.value;

  /// Mevcut kur değeri
  double get rate => _service.rate;

  /// Son güncelleme formatı
  String get lastUpdateFormatted => _service.lastUpdateFormatted;

  @override
  void onInit() {
    super.onInit();
    // Servis daha önce init edilmemişse init et
    if (!Get.isRegistered<CurrencyService>()) {
      Get.put(CurrencyService(), permanent: true);
    }
    _service = Get.find<CurrencyService>();
  }

  /// Kuru yenile
  Future<void> refreshRate() async {
    await _service.fetchRate();
    update();
  }

  /// Kuru güncelle (Admin için)
  Future<bool> updateRate(double newRate, {String? adminId}) async {
    final result = await _service.updateRate(newRate, adminId: adminId);
    if (result) update();
    return result;
  }

  // ============ DÖNÜŞÜM METODLARI (TL BAZLI) ============

  /// TL'yi USD'ye çevir
  double toUSD(double try_) => _service.toUSD(try_);

  /// USD'yi TL'ye çevir  
  double toTRY(double usd) => _service.toTRY(usd);

  /// Formatlanmış TL (direkt TL değeri) (ör: "345₺")
  String formatTRYDirect(double try_) => _service.formatTRYDirect(try_);

  /// Formatlanmış USD (TL'den çevrilmiş) (ör: "$10")
  String formatUSDFromTRY(double try_) => _service.formatUSDFromTRY(try_);

  /// Her iki format (TL önce, USD sonra) (ör: "345₺ / $10")
  /// try_: TL cinsinden fiyat
  String formatBoth(double try_) => _service.formatBoth(try_);

  /// Fiyat aralığı için her iki format (TL bazlı)
  String formatPriceRange(double minTry, double maxTry) {
    if (minTry == maxTry) {
      return formatBoth(minTry);
    }
    return '${formatTRYDirect(minTry)} - ${formatTRYDirect(maxTry)} / ${formatUSDFromTRY(minTry)} - ${formatUSDFromTRY(maxTry)}';
  }

  /// Sadece TL formatı ile fiyat aralığı
  String formatTRYRange(double minTry, double maxTry) {
    if (minTry == maxTry) {
      return formatTRYDirect(minTry);
    }
    return '${formatTRYDirect(minTry)} - ${formatTRYDirect(maxTry)}';
  }

  /// Sadece USD formatı ile fiyat aralığı (TL'den çevrilmiş)
  String formatUSDRange(double minTry, double maxTry) {
    if (minTry == maxTry) {
      return formatUSDFromTRY(minTry);
    }
    return '${formatUSDFromTRY(minTry)} - ${formatUSDFromTRY(maxTry)}';
  }
}
