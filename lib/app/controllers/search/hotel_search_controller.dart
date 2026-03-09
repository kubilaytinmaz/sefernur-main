import 'package:get/get.dart';

import '../../data/adapters/webbeds_hotel_adapter.dart';
import '../../data/models/hotel/hotel_model.dart';
import '../../data/models/webbeds/webbeds_models.dart';
import '../../data/providers/webbeds/webbeds_config.dart';
import '../../data/repositories/webbeds/webbeds_repository.dart';
import '../../data/services/webbeds/webbeds_service.dart';
import '../address/address_controller.dart';

/// Hotel Search Controller
/// 
/// WebBeds API üzerinden otel arama ve filtreleme.
/// Firebase otel sistemi devre dışı - tüm aramalar API üzerinden.
class HotelSearchController extends GetxController {
  // WebBeds Service
  WebBedsService? _webBedsService;

  // Address controller (SelectLocationPage ile paylaşım için tag)
  final String addressTag = 'hotel_search_address';
  late AddressController addressController;

  // Form state
  final Rx<DateTime?> checkIn = Rx<DateTime?>(null);
  final Rx<DateTime?> checkOut = Rx<DateTime?>(null);
  final RxInt adults = 2.obs;
  final RxInt rooms = 1.obs;
  final RxList<int> childrenAges = <int>[].obs;

  // Result state
  final RxBool isSearching = false.obs;
  final RxList<HotelModel> results = <HotelModel>[].obs;
  final RxString errorMessage = ''.obs;
  final Rx<HotelModel?> selectedHotel = Rx<HotelModel?>(null);

  // WebBeds specific state
  final RxList<WebBedsHotel> webBedsResults = <WebBedsHotel>[].obs;
  final Rx<WebBedsHotel?> selectedWebBedsHotel = Rx<WebBedsHotel?>(null);

  // Filtering & sorting
  final RxList<String> selectedBoardTypes = <String>[].obs; // BB, HB, FB, AI
  final RxBool favoritesOnly = false.obs;
  final RxList<HotelModel> popularHotels = <HotelModel>[].obs;
  final RxString sortOption = 'rating_desc'.obs; // rating_desc | price_asc | price_desc
  final RxList<HotelModel> filteredResults = <HotelModel>[].obs;
  final RxSet<String> favoriteHotelIds = <String>{}.obs;
  
  // City code (Hac/Umre şehirleri için)
  final RxInt selectedCityCode = WebBedsConfig.meccaCityCode.obs;

  @override
  void onInit() {
    super.onInit();
    addressController = Get.isRegistered<AddressController>(tag: addressTag)
        ? Get.find<AddressController>(tag: addressTag)
        : Get.put(AddressController(), tag: addressTag);
    
    // WebBeds service'i başlat
    _initWebBedsService();
    
    // Varsayılan tarihler (yarından itibaren 3 gece)
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    checkIn.value = tomorrow;
    checkOut.value = tomorrow.add(const Duration(days: 3));
  }

  Future<void> _initWebBedsService() async {
    if (!Get.isRegistered<WebBedsService>()) {
      final service = WebBedsService();
      await service.init();
      Get.put(service, permanent: true);
    }
    _webBedsService = Get.find<WebBedsService>();
    
    // Debug: Hesap için geçerli currency kodlarını al ve logla
    _fetchCurrencyInfo();
  }

  /// Debug: Currency bilgilerini API'den al
  Future<void> _fetchCurrencyInfo() async {
    final repo = WebBedsRepository();
    final result = await repo.getCurrencies().run();
    result.fold(
      (failure) => print('[WebBeds] Currency fetch error: ${failure.message}'),
      (xmlResponse) => print('[WebBeds] Currency Response:\n$xmlResponse'),
    );
  }

  void setCheckIn(DateTime date) {
    checkIn.value = date;
    if (checkOut.value != null && !date.isBefore(checkOut.value!)) {
      checkOut.value = null; // çıkış tarihi geçersizleşti
    }
  }

  void setCheckOut(DateTime date) {
    if (checkIn.value == null) {
      checkIn.value = date;
      return;
    }
    if (date.isAfter(checkIn.value!)) {
      checkOut.value = date;
    }
  }

  void incrementAdults() => adults.value++;
  void decrementAdults() { if (adults.value > 1) adults.value--; }
  void incrementRooms() => rooms.value++;
  void decrementRooms() { if (rooms.value > 1) rooms.value--; }

  // Çocuk yönetimi
  void addChild(int age) {
    if (childrenAges.length < 4) { // Max 4 çocuk
      childrenAges.add(age);
    }
  }
  
  void removeChild(int index) {
    if (index >= 0 && index < childrenAges.length) {
      childrenAges.removeAt(index);
    }
  }

  void updateChildAge(int index, int age) {
    if (index >= 0 && index < childrenAges.length) {
      childrenAges[index] = age;
    }
  }

  String get shortAddressDisplay {
    final addr = addressController.address.value;
    if (addr.address.isEmpty) return 'Mekke veya Medine';
    final parts = [addr.city, addr.state, addr.country]
        .where((e) => e.toString().isNotEmpty)
        .map((e) => e.toString()).toList();
    if (parts.isEmpty) return addr.address;
    return parts.join(', ');
  }

  bool get canSearch => checkIn.value != null && checkOut.value != null;

  /// Gece sayısı
  int get nights {
    if (checkIn.value == null || checkOut.value == null) return 0;
    return checkOut.value!.difference(checkIn.value!).inDays;
  }

  /// WebBeds API üzerinden otel ara
  Future<void> search() async {
    if (!canSearch) {
      errorMessage.value = 'Lütfen tarih seçin';
      return;
    }

    if (_webBedsService == null) {
      await _initWebBedsService();
    }

    try {
      isSearching.value = true;
      errorMessage.value = '';

      // Şehir kodunu belirle
      final cityCode = _determineCityCode();

      // WebBeds API'den ara
      final hotels = await _webBedsService!.searchHotels(
        checkIn: checkIn.value!,
        checkOut: checkOut.value!,
        cityCode: cityCode,
        adults: adults.value,
        rooms: rooms.value,
        childrenAges: childrenAges.toList(),
      );

      // Sonuçları sakla
      webBedsResults.assignAll(hotels);

      // UI modeline dönüştür
      final hotelModels = WebBedsHotelAdapter.toHotelModelList(hotels);
      results.assignAll(hotelModels);
      
      // Filtreleri uygula
      _applyFilters();

      if (results.isEmpty && _webBedsService!.error.value != null) {
        errorMessage.value = _webBedsService!.error.value!;
      } else if (results.isEmpty) {
        errorMessage.value = 'Arama kriterlerinize uygun otel bulunamadı';
      }
    } catch (e) {
      errorMessage.value = e.toString();
      results.clear();
      filteredResults.clear();
    } finally {
      isSearching.value = false;
    }
  }

  /// Mekke otelleri ara
  Future<void> searchMecca() async {
    selectedCityCode.value = WebBedsConfig.meccaCityCode;
    await search();
  }

  /// Medine otelleri ara
  Future<void> searchMedina() async {
    selectedCityCode.value = WebBedsConfig.medinaCityCode;
    await search();
  }

  /// Adres/şehir seçimine göre API şehir kodu belirle
  int _determineCityCode() {
    final addr = addressController.address.value;
    final cityLower = addr.city.toLowerCase();
    
    // Mekke
    if (cityLower.contains('mecca') || 
        cityLower.contains('mekke') || 
        cityLower.contains('makkah')) {
      return WebBedsConfig.meccaCityCode;
    }
    
    // Medine
    if (cityLower.contains('medina') || 
        cityLower.contains('medine') || 
        cityLower.contains('madinah')) {
      return WebBedsConfig.medinaCityCode;
    }
    
    // Cidde
    if (cityLower.contains('jeddah') || 
        cityLower.contains('cidde')) {
      return WebBedsConfig.jeddahCityCode;
    }
    
    // Varsayılan: Mekke
    return selectedCityCode.value;
  }

  /// Otel seç
  void selectHotel(HotelModel hotel) {
    selectedHotel.value = hotel;
    
    // WebBeds otelini de bul
    final webBedsId = WebBedsHotelAdapter.extractWebBedsId(hotel);
    if (webBedsId != null) {
      selectedWebBedsHotel.value = webBedsResults
          .firstWhereOrNull((h) => h.hotelId == webBedsId);
    }
  }

  /// Otel seçimini temizle
  void clearSelection() {
    selectedHotel.value = null;
    selectedWebBedsHotel.value = null;
  }

  // Public API for filters
  void toggleBoardType(String board) {
    if (selectedBoardTypes.contains(board)) {
      selectedBoardTypes.remove(board);
    } else {
      selectedBoardTypes.add(board);
    }
    _applyFilters();
  }

  void clearBoardTypes() {
    selectedBoardTypes.clear();
    _applyFilters();
  }

  void setSortOption(String option) {
    sortOption.value = option;
    _applyFilters();
  }

  void toggleFavoritesOnly() {
    favoritesOnly.toggle();
    _applyFilters();
  }

  void toggleFavorite(String hotelId) {
    if (favoriteHotelIds.contains(hotelId)) {
      favoriteHotelIds.remove(hotelId);
    } else {
      favoriteHotelIds.add(hotelId);
    }
    favoriteHotelIds.refresh();
    if (favoritesOnly.value) _applyFilters();
  }

  bool isFavorite(String? hotelId) => hotelId != null && favoriteHotelIds.contains(hotelId);

  void _applyFilters() {
    List<HotelModel> list = List.of(results);

    // Board type filter
    if (selectedBoardTypes.isNotEmpty) {
      list = list.where((h) => h.roomTypes.any((r) => selectedBoardTypes.contains(r.boardType))).toList();
    }

    // Favorites filter
    if (favoritesOnly.value) {
      list = list.where((h) => isFavorite(h.id)).toList();
    }

    // Sorting
    switch (sortOption.value) {
      case 'price_asc':
        list.sort((a,b) => _lowestPrice(a).compareTo(_lowestPrice(b)));
        break;
      case 'price_desc':
        list.sort((a,b) => _lowestPrice(b).compareTo(_lowestPrice(a)));
        break;
      case 'rating_desc':
      default:
        list.sort((a,b) => b.rating.compareTo(a.rating));
    }

    filteredResults.assignAll(list);
  }

  double _lowestPrice(HotelModel h) {
    if (h.roomTypes.isEmpty) return double.infinity;
    return h.roomTypes
        .map((r) => r.discountedPrice ?? r.originalPrice)
        .fold<double>(double.infinity, (prev, p) => p < prev ? p : prev);
  }

  // Unified filter badge count for UI
  int activeFilterCount() {
    int c = 0;
    if (selectedBoardTypes.isNotEmpty) c++;
    if (favoritesOnly.value) c++;
    return c;
  }

  /// Tarih formatla
  String formatDate(DateTime? date) {
    if (date == null) return '';
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
  }

  /// Arama özetini oluştur
  String get searchSummary {
    final parts = <String>[];
    
    if (checkIn.value != null && checkOut.value != null) {
      parts.add('${formatDate(checkIn.value)} - ${formatDate(checkOut.value)}');
    }
    
    parts.add('$nights gece');
    parts.add('${adults.value} yetişkin');
    
    if (childrenAges.isNotEmpty) {
      parts.add('${childrenAges.length} çocuk');
    }
    
    if (rooms.value > 1) {
      parts.add('${rooms.value} oda');
    }
    
    return parts.join(' • ');
  }

  /// Sonuçları temizle
  void clearResults() {
    results.clear();
    filteredResults.clear();
    webBedsResults.clear();
    errorMessage.value = '';
  }

  /// Tüm state'i sıfırla
  void reset() {
    clearResults();
    clearSelection();
    checkIn.value = DateTime.now().add(const Duration(days: 1));
    checkOut.value = DateTime.now().add(const Duration(days: 4));
    adults.value = 2;
    rooms.value = 1;
    childrenAges.clear();
    selectedBoardTypes.clear();
    favoritesOnly.value = false;
    sortOption.value = 'rating_desc';
  }
}
