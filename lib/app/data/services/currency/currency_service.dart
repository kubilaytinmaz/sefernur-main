import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:xml/xml.dart';

import '../../models/currency/currency_model.dart';

/// Döviz kuru servisi - Firebase'den kur çekme ve cache yönetimi
class CurrencyService extends GetxService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final GetStorage _storage = GetStorage();
  static const String _collectionPath = 'settings';
  static const String _documentId = 'exchange_rates';
  static const String _cacheKey = 'cached_exchange_rate';
  static const String _cacheTimeKey = 'cached_exchange_rate_time';

  /// Varsayılan kur (Firebase'den çekilemezse)
  static const double _defaultRate = 34.50;

  /// Mevcut kur
  final Rx<ExchangeRateModel> currentRate = ExchangeRateModel(
    rate: _defaultRate,
    updatedAt: DateTime.now(),
  ).obs;

  /// Yükleniyor mu?
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadCachedRate();
    fetchRate();
  }

  void _showSnackbarSafe(String title, String message) {
    final overlay = Get.key.currentState?.overlay;
    if (overlay == null || !overlay.mounted || Get.overlayContext == null) return;
    try {
      Get.snackbar(
        title,
        message,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (_) {}
  }

  /// Cache'den kuru yükle
  void _loadCachedRate() {
    try {
      final cachedRate = _storage.read<double>(_cacheKey);
      final cachedTime = _storage.read<String>(_cacheTimeKey);
      
      if (cachedRate != null && cachedTime != null) {
        final time = DateTime.tryParse(cachedTime);
        if (time != null) {
          currentRate.value = ExchangeRateModel(
            rate: cachedRate,
            updatedAt: time,
          );
        }
      }
    } catch (e) {
      // Cache okuma hatası - varsayılan değer kullan
    }
  }

  /// Cache'e kuru kaydet
  Future<void> _cacheRate(ExchangeRateModel rate) async {
    try {
      await _storage.write(_cacheKey, rate.rate);
      await _storage.write(_cacheTimeKey, rate.updatedAt.toIso8601String());
    } catch (e) {
      // Cache yazma hatası
    }
  }

  /// Firebase'den kuru çek
  Future<ExchangeRateModel?> fetchRate() async {
    isLoading.value = true;
    try {
      final doc = await _firestore
          .collection(_collectionPath)
          .doc(_documentId)
          .get();

      if (doc.exists && doc.data() != null) {
        final data = doc.data()!;
        // USD/TRY kurunu al
        final usdTry = data['usd_try'];
        if (usdTry is Map<String, dynamic>) {
          final rate = ExchangeRateModel.fromJson({
            ...usdTry,
            'id': 'usd_try',
          });
          currentRate.value = rate;
          await _cacheRate(rate);
          return rate;
        }
      }
      
      // Döküman yoksa varsayılan kur ile oluştur
      await _createDefaultRate();
      return currentRate.value;
    } catch (e) {
      Get.log('CurrencyService.fetchRate error: $e');
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /// TCMB'den güncel kuru çek
  Future<double?> fetchLiveRateFromTCMB() async {
    try {
      final dio = Dio();
      final response = await dio.get('https://www.tcmb.gov.tr/kurlar/today.xml');
      
      if (response.statusCode == 200) {
        final document = XmlDocument.parse(response.data);
        final currencies = document.findAllElements('Currency');
        
        final usdCurrency = currencies.firstWhere(
          (element) => element.getAttribute('CurrencyCode') == 'USD',
        );
        
        final forexSelling = usdCurrency.findElements('ForexSelling').first.innerText;
        if (forexSelling.isNotEmpty) {
          return double.tryParse(forexSelling);
        }
      }
      return null;
    } catch (e) {
      Get.log('CurrencyService.fetchLiveRateFromTCMB error: $e');
      return null;
    }
  }

  /// TCMB'den çekip güncelle
  Future<bool> updateRateFromTCMB({String? adminId}) async {
    isLoading.value = true;
    try {
      final rate = await fetchLiveRateFromTCMB();
      if (rate != null) {
        return await updateRate(rate, adminId: adminId);
      } else {
        _showSnackbarSafe('Hata', 'TCMB\'den kur çekilemedi');
        return false;
      }
    } catch (e) {
      Get.log('CurrencyService.updateRateFromTCMB error: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /// Varsayılan kur dökümanı oluştur
  Future<void> _createDefaultRate() async {
    try {
      final defaultRate = ExchangeRateModel(
        rate: _defaultRate,
        updatedAt: DateTime.now(),
      );
      
      await _firestore.collection(_collectionPath).doc(_documentId).set({
        'usd_try': defaultRate.toJson(),
      }, SetOptions(merge: true));
      
      currentRate.value = defaultRate;
    } catch (e) {
      Get.log('CurrencyService._createDefaultRate error: $e');
    }
  }

  /// Kuru güncelle (Admin için)
  Future<bool> updateRate(double newRate, {String? adminId}) async {
    isLoading.value = true;
    try {
      final updatedRate = ExchangeRateModel(
        rate: newRate,
        updatedAt: DateTime.now(),
        updatedBy: adminId,
      );

      await _firestore.collection(_collectionPath).doc(_documentId).set({
        'usd_try': updatedRate.toJson(),
      }, SetOptions(merge: true));

      currentRate.value = updatedRate;
      await _cacheRate(updatedRate);
      
      _showSnackbarSafe(
        'Başarılı',
        'Döviz kuru güncellendi: 1 USD = ${newRate.toStringAsFixed(4)} TL',
      );
      
      return true;
    } catch (e) {
      Get.log('CurrencyService.updateRate error: $e');
      _showSnackbarSafe('Hata', 'Döviz kuru güncellenemedi');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /// Kur değişikliklerini dinle (realtime)
  void listenToRateChanges() {
    _firestore
        .collection(_collectionPath)
        .doc(_documentId)
        .snapshots()
        .listen((snapshot) {
      if (snapshot.exists && snapshot.data() != null) {
        final usdTry = snapshot.data()!['usd_try'];
        if (usdTry is Map<String, dynamic>) {
          final rate = ExchangeRateModel.fromJson({
            ...usdTry,
            'id': 'usd_try',
          });
          currentRate.value = rate;
          _cacheRate(rate);
        }
      }
    });
  }

  // ============ HELPER METHODS ============

  /// Mevcut kur değeri
  double get rate => currentRate.value.rate;

  /// TL'yi USD'ye çevir  
  double toUSD(double try_) => currentRate.value.toUSD(try_);

  /// USD'yi TL'ye çevir
  double toTRY(double usd) => currentRate.value.toTRY(usd);

  /// Formatlanmış TL (direkt TL değeri)
  String formatTRYDirect(double try_) => currentRate.value.formatTRYDirect(try_);

  /// Formatlanmış USD (TL'den çevrilmiş)
  String formatUSDFromTRY(double try_) => currentRate.value.formatUSDFromTRY(try_);

  /// Her iki format (TL bazlı giriş - TL önce, USD sonra)
  /// try_: TL cinsinden fiyat
  String formatBoth(double try_) => currentRate.value.formatBoth(try_);

  /// Son güncelleme zamanı formatı
  String get lastUpdateFormatted {
    final date = currentRate.value.updatedAt;
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}
