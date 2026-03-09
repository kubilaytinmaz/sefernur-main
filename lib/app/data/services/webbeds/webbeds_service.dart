import 'package:get/get.dart';

import '../../models/webbeds/webbeds_models.dart';
import '../../providers/webbeds/webbeds_config.dart';
import '../../providers/webbeds/webbeds_xml_builder.dart';
import '../../repositories/webbeds/webbeds_repository.dart';

/// WebBeds Service
/// 
/// İş mantığı katmanı. Cache, error handling ve reservation sync.
class WebBedsService extends GetxService {
  late WebBedsRepository _repository;

  // State
  final isLoading = false.obs;
  final error = RxnString();
  
  // Search results cache
  final searchResults = <WebBedsHotel>[].obs;
  final selectedHotel = Rxn<WebBedsHotel>();
  final roomsResponse = Rxn<WebBedsRoomsResponse>();
  
  // ============================================================
  // STATIK VERİ CACHE
  // ============================================================
  /// Statik otel verileri cache (hotelId -> WebBedsHotel)
  /// Bu cache otel adı, resim, adres gibi değişmeyen bilgileri saklar
  final Map<int, WebBedsHotel> _staticHotelCache = {};
  
  /// Cache yüklendi mi?
  final isStaticCacheLoaded = false.obs;
  
  // Booking state
  final selectedRoomType = Rxn<WebBedsRoomType>();
  final selectedRate = Rxn<WebBedsRate>();
  final blockingResponse = Rxn<WebBedsRoomsResponse>();
  final bookingResponse = Rxn<WebBedsBookingResponse>();

  // Search parameters (son arama için)
  DateTime? lastCheckIn;
  DateTime? lastCheckOut;
  int lastAdults = 2;
  int lastRooms = 1;
  List<int> lastChildrenAges = [];

  Future<WebBedsService> init() async {
    _repository = WebBedsRepository();
    return this;
  }

  // ============================================================
  // SEARCH
  // ============================================================

  /// Şehir koduna göre otel ara
  /// Dinamik fiyat verilerini statik cache ile birleştirir
  Future<List<WebBedsHotel>> searchHotels({
    required DateTime checkIn,
    required DateTime checkOut,
    required int cityCode,
    required int adults,
    int rooms = 1,
    List<int> childrenAges = const [],
  }) async {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Parametreleri sakla
      lastCheckIn = checkIn;
      lastCheckOut = checkOut;
      lastAdults = adults;
      lastRooms = rooms;
      lastChildrenAges = childrenAges;

      // Önce statik veri cache'i yükle (eğer yüklenmemişse)
      if (!isStaticCacheLoaded.value) {
        await loadStaticHotels(cityCode: cityCode);
      }

      final result = await _repository.searchHotelsByCity(
        checkIn: checkIn,
        checkOut: checkOut,
        cityCode: cityCode,
        adults: adults,
        rooms: rooms,
        childrenAges: childrenAges,
      ).run();

      return result.fold(
        (failure) {
          error.value = failure.message;
          searchResults.clear();
          return [];
        },
        (response) {
          if (!response.success) {
            error.value = response.errorMessage ?? 'Arama başarısız';
            searchResults.clear();
            return [];
          }
          
          // Dinamik sonuçları statik veri ile birleştir
          final enrichedHotels = _enrichWithStaticData(response.hotels);
          searchResults.assignAll(enrichedHotels);
          return enrichedHotels;
        },
      );
    } finally {
      isLoading.value = false;
    }
  }
  
  /// Dinamik arama sonuçlarını statik cache verileriyle zenginleştir
  List<WebBedsHotel> _enrichWithStaticData(List<WebBedsHotel> dynamicHotels) {
    return dynamicHotels.map((dynamic) {
      final staticData = _staticHotelCache[dynamic.hotelId];
      if (staticData != null) {
        // Statik veriden otel adı, resim, adres al; dinamik veriden fiyat al
        return WebBedsHotel(
          hotelId: dynamic.hotelId,
          name: staticData.name.isNotEmpty ? staticData.name : 'Otel #${dynamic.hotelId}',
          address: staticData.address,
          fullAddress: staticData.fullAddress,
          rating: staticData.rating,
          phone: staticData.phone,
          cityName: staticData.cityName,
          cityCode: staticData.cityCode,
          countryName: staticData.countryName,
          countryCode: staticData.countryCode,
          stateName: staticData.stateName,
          description: staticData.description,
          description2: staticData.description2,
          latitude: staticData.latitude,
          longitude: staticData.longitude,
          images: staticData.images,
          amenities: staticData.amenities,
          // Dinamik veriden fiyat bilgileri
          minPrice: dynamic.minPrice,
          currency: dynamic.currency,
          boardType: dynamic.boardType,
          preferred: staticData.preferred,
          checkInTime: staticData.checkInTime,
          checkOutTime: staticData.checkOutTime,
          minAge: staticData.minAge,
          chain: staticData.chain,
          leftToSell: staticData.leftToSell,
          rooms: staticData.rooms,
        );
      }
      // Statik veri yoksa dinamik veriyi olduğu gibi döndür
      return dynamic;
    }).toList();
  }

  /// Statik otel verilerini yükle ve cache'e kaydet
  Future<void> loadStaticHotels({int? cityCode}) async {
    try {
      print('[WebBedsService] Statik veriler yükleniyor... cityCode: $cityCode');
      
      final result = await _repository.getStaticHotels(
        countryCode: WebBedsConfig.saudiCountryCode,
        cityCode: cityCode,
      ).run();

      result.fold(
        (failure) {
          print('[WebBedsService] Statik veri yükleme hatası: ${failure.message}');
        },
        (response) {
          if (response.success) {
            for (final hotel in response.hotels) {
              _staticHotelCache[hotel.hotelId] = hotel;
            }
            isStaticCacheLoaded.value = true;
            print('[WebBedsService] Statik cache yüklendi: ${response.hotels.length} otel');
          }
        },
      );
    } catch (e) {
      print('[WebBedsService] Statik veri yükleme exception: $e');
    }
  }

  /// Cache'den otel bilgisi al
  WebBedsHotel? getHotelFromCache(int hotelId) {
    return _staticHotelCache[hotelId];
  }

  /// Mekke otelleri ara
  Future<List<WebBedsHotel>> searchMeccaHotels({
    required DateTime checkIn,
    required DateTime checkOut,
    required int adults,
    int rooms = 1,
    List<int> childrenAges = const [],
  }) {
    return searchHotels(
      checkIn: checkIn,
      checkOut: checkOut,
      cityCode: WebBedsConfig.meccaCityCode,
      adults: adults,
      rooms: rooms,
      childrenAges: childrenAges,
    );
  }

  /// Medine otelleri ara
  Future<List<WebBedsHotel>> searchMedinaHotels({
    required DateTime checkIn,
    required DateTime checkOut,
    required int adults,
    int rooms = 1,
    List<int> childrenAges = const [],
  }) {
    return searchHotels(
      checkIn: checkIn,
      checkOut: checkOut,
      cityCode: WebBedsConfig.medinaCityCode,
      adults: adults,
      rooms: rooms,
      childrenAges: childrenAges,
    );
  }

  // ============================================================
  // ROOM DETAILS
  // ============================================================

  /// Otel oda detaylarını getir
  Future<WebBedsRoomsResponse?> getHotelRooms(WebBedsHotel hotel) async {
    print('[WebBedsService] getHotelRooms başladı - hotelId: ${hotel.hotelId}');
    print('[WebBedsService] checkIn: $lastCheckIn, checkOut: $lastCheckOut');
    print('[WebBedsService] adults: $lastAdults, rooms: $lastRooms');
    
    if (lastCheckIn == null || lastCheckOut == null) {
      error.value = 'Tarih bilgisi bulunamadı';
      print('[WebBedsService] ERROR: Tarih bilgisi yok!');
      return null;
    }

    try {
      isLoading.value = true;
      error.value = null;
      selectedHotel.value = hotel;

      final result = await _repository.getRooms(
        hotelId: hotel.hotelId,
        checkIn: lastCheckIn!,
        checkOut: lastCheckOut!,
        adults: lastAdults,
        rooms: lastRooms,
        childrenAges: lastChildrenAges,
      ).run();

      return result.fold(
        (failure) {
          print('[WebBedsService] API Error: ${failure.message}');
          error.value = failure.message;
          roomsResponse.value = null;
          return null;
        },
        (response) {
          print('[WebBedsService] Response success: ${response.success}');
          print('[WebBedsService] RoomTypes count: ${response.roomTypes.length}');
          
          if (!response.success) {
            error.value = response.errorMessage ?? 'Oda bilgisi alınamadı';
            roomsResponse.value = null;
            return null;
          }
          roomsResponse.value = response;
          return response;
        },
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================================
  // BLOCKING (Pre-Booking)
  // ============================================================

  /// Seçilen odayı blokla
  Future<bool> blockSelectedRoom({
    required WebBedsRoomType roomType,
    required WebBedsRate rate,
  }) async {
    if (selectedHotel.value == null || lastCheckIn == null || lastCheckOut == null) {
      error.value = 'Eksik bilgi';
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;
      selectedRoomType.value = roomType;
      selectedRate.value = rate;

      // Room selection oluştur
      final roomSelections = List.generate(
        lastRooms,
        (index) => RoomSelectionRequest(
          adults: index == 0 ? lastAdults : 2,
          childrenAges: index == 0 ? lastChildrenAges : [],
          roomTypeCode: roomType.code,
          selectedRateBasis: rate.id,
          allocationDetails: rate.allocationDetails,
        ),
      );

      final result = await _repository.blockRoom(
        hotelId: selectedHotel.value!.hotelId,
        checkIn: lastCheckIn!,
        checkOut: lastCheckOut!,
        roomSelections: roomSelections,
      ).run();

      return result.fold(
        (failure) {
          error.value = failure.message;
          blockingResponse.value = null;
          return false;
        },
        (response) {
          if (!response.success) {
            error.value = response.errorMessage ?? 'Bloklama başarısız';
            blockingResponse.value = null;
            return false;
          }
          
          // Bloklama durumunu kontrol et
          blockingResponse.value = response;
          
          // En az bir rate blocked olmalı
          final blockedRate = response.roomTypes
              .expand((rt) => rt.rates)
              .where((r) => r.isBlocked)
              .firstOrNull;
          
          if (blockedRate == null) {
            error.value = 'Oda bloklanamadı. Lütfen tekrar deneyin.';
            return false;
          }
          
          // Changed occupancy varsa güncelle
          if (blockedRate.changedOccupancy != null) {
            // Bu bilgi booking'de kullanılacak
          }
          
          return true;
        },
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================================
  // BOOKING
  // ============================================================

  /// Rezervasyon onayı
  Future<WebBedsBookingResponse?> confirmBooking({
    required List<PassengerInfo> passengers,
    required String customerReference,
    List<String> specialRequests = const [],
  }) async {
    if (selectedHotel.value == null || 
        selectedRoomType.value == null || 
        selectedRate.value == null ||
        lastCheckIn == null || 
        lastCheckOut == null) {
      error.value = 'Eksik bilgi';
      return null;
    }

    final rate = selectedRate.value!;
    final roomType = selectedRoomType.value!;
    
    // Changed occupancy kontrolü
    final changedOcc = rate.changedOccupancy;
    final adultsCode = changedOcc?.adultsCode ?? lastAdults;
    final actualAdults = changedOcc?.actualAdults ?? lastAdults;
    final extraBed = changedOcc?.extraBed ?? 0;

    try {
      isLoading.value = true;
      error.value = null;

      // Booking room request oluştur
      final bookingRooms = <BookingRoomRequest>[];
      
      int passengerIndex = 0;
      for (int i = 0; i < lastRooms; i++) {
        // Her oda için yolcu sayısı
        final roomAdults = i == 0 ? actualAdults : 2;
        final roomPassengers = <PassengerInfo>[];
        
        for (int j = 0; j < roomAdults && passengerIndex < passengers.length; j++) {
          roomPassengers.add(passengers[passengerIndex]);
          passengerIndex++;
        }
        
        // İlk odada leading passenger olmalı
        if (roomPassengers.isNotEmpty) {
          roomPassengers[0] = PassengerInfo(
            isLeading: i == 0, // Sadece ilk odanın ilk yolcusu leading
            salutation: roomPassengers[0].salutation,
            firstName: roomPassengers[0].firstName,
            lastName: roomPassengers[0].lastName,
          );
        }

        bookingRooms.add(BookingRoomRequest(
          roomTypeCode: roomType.code,
          selectedRateBasis: rate.id,
          allocationDetails: rate.allocationDetails,
          adultsCode: i == 0 ? adultsCode : 2,
          actualAdults: i == 0 ? actualAdults : 2,
          childrenAges: i == 0 ? lastChildrenAges : [],
          actualChildrenAges: i == 0 ? lastChildrenAges : [],
          extraBed: i == 0 ? extraBed : 0,
          passengers: roomPassengers,
          specialRequests: i == 0 ? specialRequests : [],
        ));
      }

      final result = await _repository.confirmBooking(
        hotelId: selectedHotel.value!.hotelId,
        checkIn: lastCheckIn!,
        checkOut: lastCheckOut!,
        bookingRooms: bookingRooms,
        customerReference: customerReference,
      ).run();

      return result.fold(
        (failure) {
          error.value = failure.message;
          bookingResponse.value = null;
          return null;
        },
        (response) {
          if (!response.success) {
            error.value = response.errorMessage ?? 'Rezervasyon başarısız';
            bookingResponse.value = null;
            return null;
          }
          bookingResponse.value = response;
          return response;
        },
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================================
  // CANCELLATION
  // ============================================================

  /// İptal cezası sorgula
  Future<WebBedsCancelResponse?> checkCancellationPenalty(String bookingCode) async {
    try {
      isLoading.value = true;
      error.value = null;

      final result = await _repository.checkCancellation(
        bookingCode: bookingCode,
      ).run();

      return result.fold(
        (failure) {
          error.value = failure.message;
          return null;
        },
        (response) {
          if (!response.success) {
            error.value = response.errorMessage ?? 'İptal sorgusu başarısız';
            return null;
          }
          return response;
        },
      );
    } finally {
      isLoading.value = false;
    }
  }

  /// Rezervasyonu iptal et
  Future<WebBedsCancelResponse?> cancelBooking({
    required String bookingCode,
    required double penaltyAmount,
  }) async {
    try {
      isLoading.value = true;
      error.value = null;

      final result = await _repository.confirmCancellation(
        bookingCode: bookingCode,
        penaltyAmount: penaltyAmount,
      ).run();

      return result.fold(
        (failure) {
          error.value = failure.message;
          return null;
        },
        (response) {
          if (!response.success) {
            error.value = response.errorMessage ?? 'İptal başarısız';
            return null;
          }
          return response;
        },
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  /// State'i temizle
  void clearSelection() {
    selectedHotel.value = null;
    roomsResponse.value = null;
    selectedRoomType.value = null;
    selectedRate.value = null;
    blockingResponse.value = null;
    bookingResponse.value = null;
    error.value = null;
  }

  /// Arama sonuçlarını temizle
  void clearSearch() {
    searchResults.clear();
    clearSelection();
  }

  /// Gece sayısını hesapla
  int get nights {
    if (lastCheckIn == null || lastCheckOut == null) return 0;
    return lastCheckOut!.difference(lastCheckIn!).inDays;
  }

  /// Toplam fiyat hesapla
  double get totalPrice {
    if (selectedRate.value == null) return 0.0;
    return selectedRate.value!.price;
  }

  /// Kişi başı fiyat hesapla
  double get pricePerPerson {
    if (totalPrice == 0 || lastAdults == 0) return 0.0;
    return totalPrice / lastAdults;
  }

  /// Gecelik fiyat hesapla
  double get pricePerNight {
    if (totalPrice == 0 || nights == 0) return 0.0;
    return totalPrice / nights;
  }
}
