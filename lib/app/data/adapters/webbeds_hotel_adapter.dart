import 'package:latlong2/latlong.dart';

import '../models/address/address_model.dart';
import '../models/hotel/hotel_model.dart';
import '../models/webbeds/webbeds_models.dart';

/// WebBeds Hotel → UI Hotel Model Adapter
/// 
/// WebBeds API'den gelen otel verilerini mevcut UI'da 
/// kullanılan HotelModel yapısına dönüştürür.
class WebBedsHotelAdapter {
  WebBedsHotelAdapter._();

  /// WebBedsHotel → HotelModel
  static HotelModel toHotelModel(
    WebBedsHotel webBedsHotel, {
    double? searchPrice,
  }) {
    print('[WebBedsAdapter] toHotelModel: hotelId=${webBedsHotel.hotelId}, name=${webBedsHotel.name}, searchPrice=$searchPrice, minPrice=${webBedsHotel.minPrice}');
    print('[WebBedsAdapter] images count: ${webBedsHotel.images.length}');
    if (webBedsHotel.images.isNotEmpty) {
      print('[WebBedsAdapter] first image: ${webBedsHotel.images.first}');
    }
    
    final roomTypes = _convertRoomTypes(webBedsHotel, searchPrice);
    print('[WebBedsAdapter] roomTypes created: ${roomTypes.length} rooms, prices: ${roomTypes.map((r) => r.originalPrice).toList()}');
    
    return HotelModel(
      id: 'wb_${webBedsHotel.hotelId}', // WebBeds prefix ile ayırt et
      name: webBedsHotel.name,
      description: webBedsHotel.description.isNotEmpty 
          ? webBedsHotel.description 
          : webBedsHotel.description2,
      images: webBedsHotel.images,
      addressModel: AddressModel(
        address: webBedsHotel.fullAddress.isNotEmpty 
            ? webBedsHotel.fullAddress 
            : webBedsHotel.address,
        city: webBedsHotel.cityName,
        state: webBedsHotel.stateName,
        country: webBedsHotel.countryName,
        countryCode: webBedsHotel.countryCode.toString(),
        location: (webBedsHotel.latitude != null && webBedsHotel.longitude != null)
            ? LatLng(webBedsHotel.latitude!, webBedsHotel.longitude!)
            : null,
      ),
      phone: webBedsHotel.phone,
      email: '', // API'den gelmiyor
      website: '',
      whatsapp: null,
      roomTypes: roomTypes,
      amenities: webBedsHotel.amenities,
      rating: webBedsHotel.starRating, // 5 üzerinden
      reviewCount: 0, // API'den gelmiyor
      category: _determineCategory(webBedsHotel.starRating),
      availability: {}, // API'den dinamik geliyor
      isActive: true,
      isPopular: webBedsHotel.preferred,
      favoriteUserIds: [],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  /// WebBeds room bilgilerinden RoomType listesi oluştur
  static List<RoomType> _convertRoomTypes(WebBedsHotel hotel, double? searchPrice) {
    // Eğer arama sonucunda minPrice varsa, geçici bir oda tipi oluştur
    final priceToUse = searchPrice ?? hotel.minPrice;
    print('[WebBedsAdapter] _convertRoomTypes: hotelId=${hotel.hotelId}, searchPrice=$searchPrice, hotel.minPrice=${hotel.minPrice}, priceToUse=$priceToUse');
    
    if (priceToUse != null && priceToUse > 0) {
      print('[WebBedsAdapter] Creating RoomType with price: $priceToUse, currency: ${hotel.currency}, boardType: ${hotel.boardType}');
      return [
        RoomType(
          id: 'search_price',
          name: hotel.boardType.isNotEmpty ? _boardTypeToName(hotel.boardType) : 'Standart Oda',
          description: '',
          capacity: 2,
          originalPrice: priceToUse,
          discountedPrice: null,
          discountPercentage: null,
          boardType: hotel.boardType.isNotEmpty ? hotel.boardType : 'BB',
          amenities: [],
          images: [],
          currency: hotel.currency,
        ),
      ];
    }

    print('[WebBedsAdapter] priceToUse is null or 0, returning empty or static rooms');
    
    // Statik room bilgilerinden dönüştür
    if (hotel.rooms.isEmpty) {
      return [];
    }

    return hotel.rooms.map((room) => RoomType(
      id: room.name.hashCode.toString(),
      name: room.name,
      description: room.roomInfo,
      capacity: 2,
      originalPrice: 0.0, // Fiyat getRooms ile gelecek
      discountedPrice: null,
      discountPercentage: null,
      boardType: hotel.boardType.isNotEmpty ? hotel.boardType : 'BB',
      amenities: room.roomAmenities.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
      images: [],
      currency: hotel.currency,
    )).toList();
  }

  /// Board type kodunu Türkçe isme çevir
  static String _boardTypeToName(String code) {
    switch (code) {
      case 'RO': return 'Sadece Oda';
      case 'BB': return 'Oda + Kahvaltı';
      case 'HB': return 'Yarım Pansiyon';
      case 'FB': return 'Tam Pansiyon';
      case 'AI': return 'Her Şey Dahil';
      default: return 'Standart Oda';
    }
  }

  /// Yıldız sayısına göre kategori belirle
  static String _determineCategory(double starRating) {
    if (starRating >= 4.5) return 'luxury';
    if (starRating >= 4.0) return 'premium';
    if (starRating >= 3.0) return 'standard';
    return 'budget';
  }

  /// WebBeds otel listesini HotelModel listesine dönüştür
  static List<HotelModel> toHotelModelList(
    List<WebBedsHotel> webBedsHotels,
  ) {
    return webBedsHotels.map((hotel) => toHotelModel(
      hotel,
      searchPrice: hotel.minPrice,
    )).toList();
  }

  /// HotelModel'den WebBeds otel ID'si çıkar
  static int? extractWebBedsId(HotelModel hotel) {
    if (hotel.id == null || !hotel.id!.startsWith('wb_')) {
      return null;
    }
    return int.tryParse(hotel.id!.replaceFirst('wb_', ''));
  }

  /// Model WebBeds'den mi geldi?
  static bool isWebBedsHotel(HotelModel hotel) {
    return hotel.id?.startsWith('wb_') ?? false;
  }
}

/// WebBeds Room Response → UI RoomType listesi
class WebBedsRoomAdapter {
  WebBedsRoomAdapter._();

  /// WebBedsRoomsResponse → RoomType listesi
  static List<RoomTypeWithRates> toRoomTypeList(WebBedsRoomsResponse response) {
    return response.roomTypes.map((rt) => RoomTypeWithRates(
      code: rt.code,
      name: rt.name,
      description: rt.description,
      maxOccupancy: rt.maxOccupancy,
      maxAdults: rt.maxAdults,
      maxChildren: rt.maxChildren,
      leftToSell: rt.leftToSell,
      rates: rt.rates.map((rate) => RoomRateInfo(
        id: rate.id,
        name: rate.rateBasisName,
        rawName: rate.name,
        price: rate.price,
        currency: rate.currency,
        allocationDetails: rate.allocationDetails,
        nonRefundable: rate.nonRefundable,
        minimumSellingPrice: rate.minimumSellingPrice,
        cancellationPolicy: rate.cancellationPolicy,
        specials: rate.specials,
        changedOccupancy: rate.changedOccupancy,
        isBlocked: rate.isBlocked,
      )).toList(),
    )).toList();
  }
}

/// UI için oda tipi (rate bilgileriyle)
class RoomTypeWithRates {
  final String code;
  final String name;
  final String description;
  final int maxOccupancy;
  final int maxAdults;
  final int maxChildren;
  final int leftToSell;
  final List<RoomRateInfo> rates;

  RoomTypeWithRates({
    required this.code,
    required this.name,
    required this.description,
    required this.maxOccupancy,
    required this.maxAdults,
    required this.maxChildren,
    required this.leftToSell,
    required this.rates,
  });

  /// En ucuz fiyat
  double? get cheapestPrice {
    if (rates.isEmpty) return null;
    return rates.map((r) => r.price).reduce((a, b) => a < b ? a : b);
  }

  /// İade edilemez oda var mı?
  bool get hasNonRefundable => rates.any((r) => r.nonRefundable);

  /// Müsait mi?
  bool get isAvailable => leftToSell > 0;
}

/// UI için rate bilgisi
class RoomRateInfo {
  final String id;
  final String name; // Türkçe: "Oda + Kahvaltı"
  final String rawName; // API'den gelen: "BB"
  final double price;
  final String currency;
  final String allocationDetails;
  final bool nonRefundable;
  final double? minimumSellingPrice;
  final CancellationPolicy? cancellationPolicy;
  final List<String> specials;
  final ChangedOccupancy? changedOccupancy;
  final bool isBlocked;

  RoomRateInfo({
    required this.id,
    required this.name,
    required this.rawName,
    required this.price,
    required this.currency,
    required this.allocationDetails,
    required this.nonRefundable,
    this.minimumSellingPrice,
    this.cancellationPolicy,
    required this.specials,
    this.changedOccupancy,
    required this.isBlocked,
  });

  /// Ücretsiz iptal var mı?
  bool get hasFreeCancellation => 
      !nonRefundable && (cancellationPolicy?.hasFreeCancellation ?? false);

  /// Promosyon var mı?
  bool get hasSpecials => specials.isNotEmpty;
}
