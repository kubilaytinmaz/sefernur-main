/// WebBeds API Data Models
/// 
/// API yanıtlarından parse edilen modeller.
library;

// ============================================================
// SEARCH RESPONSE
// ============================================================

/// Search hotels yanıt modeli
class WebBedsSearchResponse {
  final bool success;
  final String? errorMessage;
  final List<WebBedsHotel> hotels;

  WebBedsSearchResponse({
    required this.success,
    this.errorMessage,
    required this.hotels,
  });
}

/// Otel modeli (API'den)
class WebBedsHotel {
  final int hotelId;
  final String name;
  final String address;
  final String fullAddress;
  final double rating;
  final String phone;
  final String cityName;
  final int cityCode;
  final String countryName;
  final int countryCode;
  final String stateName;
  final String description;
  final String description2;
  final double? latitude;
  final double? longitude;
  final List<String> images;
  final List<String> amenities;
  final double? minPrice;
  final String currency; // EUR, USD, GBP
  final String boardType; // RO, BB, HB, FB, AI
  final bool preferred;
  final String checkInTime;
  final String checkOutTime;
  final int minAge;
  final String chain;
  final int leftToSell;
  final List<WebBedsRoomInfo> rooms;

  WebBedsHotel({
    required this.hotelId,
    required this.name,
    required this.address,
    required this.fullAddress,
    required this.rating,
    required this.phone,
    required this.cityName,
    required this.cityCode,
    required this.countryName,
    required this.countryCode,
    required this.stateName,
    required this.description,
    required this.description2,
    this.latitude,
    this.longitude,
    required this.images,
    required this.amenities,
    this.minPrice,
    this.currency = 'EUR',
    this.boardType = '',
    required this.preferred,
    required this.checkInTime,
    required this.checkOutTime,
    required this.minAge,
    required this.chain,
    required this.leftToSell,
    required this.rooms,
  });

  /// Yıldız sayısı (rating / 10 = yıldız)
  double get starRating => rating / 10;
  
  /// Ana resim
  String? get mainImage => images.isNotEmpty ? images.first : null;

  /// JSON'a çevir (cache için)
  Map<String, dynamic> toJson() => {
    'hotelId': hotelId,
    'name': name,
    'address': address,
    'fullAddress': fullAddress,
    'rating': rating,
    'phone': phone,
    'cityName': cityName,
    'cityCode': cityCode,
    'countryName': countryName,
    'countryCode': countryCode,
    'stateName': stateName,
    'description': description,
    'description2': description2,
    'latitude': latitude,
    'longitude': longitude,
    'images': images,
    'amenities': amenities,
    'minPrice': minPrice,
    'currency': currency,
    'boardType': boardType,
    'preferred': preferred,
    'checkInTime': checkInTime,
    'checkOutTime': checkOutTime,
    'minAge': minAge,
    'chain': chain,
    'leftToSell': leftToSell,
    'rooms': rooms.map((r) => r.toJson()).toList(),
  };

  /// JSON'dan oluştur
  factory WebBedsHotel.fromJson(Map<String, dynamic> json) => WebBedsHotel(
    hotelId: json['hotelId'] ?? 0,
    name: json['name'] ?? '',
    address: json['address'] ?? '',
    fullAddress: json['fullAddress'] ?? '',
    rating: (json['rating'] ?? 0).toDouble(),
    phone: json['phone'] ?? '',
    cityName: json['cityName'] ?? '',
    cityCode: json['cityCode'] ?? 0,
    countryName: json['countryName'] ?? '',
    countryCode: json['countryCode'] ?? 0,
    stateName: json['stateName'] ?? '',
    description: json['description'] ?? '',
    description2: json['description2'] ?? '',
    latitude: json['latitude']?.toDouble(),
    longitude: json['longitude']?.toDouble(),
    images: List<String>.from(json['images'] ?? []),
    amenities: List<String>.from(json['amenities'] ?? []),
    minPrice: json['minPrice']?.toDouble(),
    currency: json['currency'] ?? 'EUR',
    boardType: json['boardType'] ?? '',
    preferred: json['preferred'] ?? false,
    checkInTime: json['checkInTime'] ?? '',
    checkOutTime: json['checkOutTime'] ?? '',
    minAge: json['minAge'] ?? 0,
    chain: json['chain'] ?? '',
    leftToSell: json['leftToSell'] ?? 0,
    rooms: (json['rooms'] as List?)?.map((r) => WebBedsRoomInfo.fromJson(r)).toList() ?? [],
  );
}

/// Oda bilgisi (statik data)
class WebBedsRoomInfo {
  final String name;
  final String roomInfo;
  final String roomAmenities;
  final bool twin;

  WebBedsRoomInfo({
    required this.name,
    required this.roomInfo,
    required this.roomAmenities,
    required this.twin,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'roomInfo': roomInfo,
    'roomAmenities': roomAmenities,
    'twin': twin,
  };

  factory WebBedsRoomInfo.fromJson(Map<String, dynamic> json) => WebBedsRoomInfo(
    name: json['name'] ?? '',
    roomInfo: json['roomInfo'] ?? '',
    roomAmenities: json['roomAmenities'] ?? '',
    twin: json['twin'] ?? false,
  );
}

// ============================================================
// ROOMS RESPONSE
// ============================================================

/// Get rooms yanıt modeli
class WebBedsRoomsResponse {
  final bool success;
  final String? errorMessage;
  final int? hotelId;
  final String? hotelName;
  final String? tariffNotes;
  final int minStay;
  final List<WebBedsRoomType> roomTypes;

  WebBedsRoomsResponse({
    required this.success,
    this.errorMessage,
    this.hotelId,
    this.hotelName,
    this.tariffNotes,
    this.minStay = 0,
    required this.roomTypes,
  });
}

/// Oda tipi modeli
class WebBedsRoomType {
  final String code;
  final String name;
  final String description;
  final int maxOccupancy;
  final int maxAdults;
  final int maxChildren;
  final int leftToSell;
  final List<WebBedsRate> rates;

  WebBedsRoomType({
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

  /// İade edilemez rate var mı?
  bool get hasNonRefundable => rates.any((r) => r.nonRefundable);
}

/// Fiyat/Rate modeli
class WebBedsRate {
  final String id;
  final String name; // BB, HB, FB, AI vs.
  final double price;
  final String currency;
  final String allocationDetails;
  final bool nonRefundable;
  final double? minimumSellingPrice;
  final CancellationPolicy? cancellationPolicy;
  final List<String> specials; // Promosyonlar
  final ChangedOccupancy? changedOccupancy;
  final String status; // Bloklama durumu

  WebBedsRate({
    required this.id,
    required this.name,
    required this.price,
    required this.currency,
    required this.allocationDetails,
    required this.nonRefundable,
    this.minimumSellingPrice,
    this.cancellationPolicy,
    required this.specials,
    this.changedOccupancy,
    required this.status,
  });

  /// Bloklama başarılı mı?
  bool get isBlocked => status.toLowerCase() == 'checked';

  /// Rate tipi açıklaması
  String get rateBasisName {
    switch (name.toUpperCase()) {
      case 'RO':
      case 'ROOM ONLY':
        return 'Sadece Oda';
      case 'BB':
      case 'BED AND BREAKFAST':
        return 'Oda + Kahvaltı';
      case 'HB':
      case 'HALF BOARD':
        return 'Yarım Pansiyon';
      case 'FB':
      case 'FULL BOARD':
        return 'Tam Pansiyon';
      case 'AI':
      case 'ALL INCLUSIVE':
        return 'Her Şey Dahil';
      default:
        return name;
    }
  }
}

/// İptal politikası
class CancellationPolicy {
  final List<CancellationDeadline> deadlines;

  CancellationPolicy({required this.deadlines});

  /// Şu anki ceza tutarı
  double getCurrentPenalty(DateTime checkInDate) {
    final now = DateTime.now();
    for (final deadline in deadlines) {
      final from = DateTime.tryParse(deadline.fromDate);
      final to = DateTime.tryParse(deadline.toDate);
      if (from != null && to != null && now.isAfter(from) && now.isBefore(to)) {
        return deadline.charge;
      }
    }
    return 0.0;
  }

  /// Ücretsiz iptal var mı?
  bool get hasFreeCancellation => deadlines.any((d) => d.charge == 0);
}

/// İptal deadline'ı
class CancellationDeadline {
  final String fromDate;
  final String toDate;
  final double charge;
  final String chargeType; // 'percent' veya 'amount'

  CancellationDeadline({
    required this.fromDate,
    required this.toDate,
    required this.charge,
    required this.chargeType,
  });
}

/// Changed Occupancy (API doluluk değişikliği)
class ChangedOccupancy {
  final int adultsCode;
  final int actualAdults;
  final int extraBed;
  final bool childrenAsAdults;

  ChangedOccupancy({
    required this.adultsCode,
    required this.actualAdults,
    required this.extraBed,
    required this.childrenAsAdults,
  });
}

// ============================================================
// BOOKING RESPONSE
// ============================================================

/// Confirm booking yanıt modeli
class WebBedsBookingResponse {
  final bool success;
  final String? errorMessage;
  final String? bookingCode;
  final String? paymentGuaranteedBy;
  final double totalPrice;
  final String currency;
  final String bookingStatus;

  WebBedsBookingResponse({
    required this.success,
    this.errorMessage,
    this.bookingCode,
    this.paymentGuaranteedBy,
    this.totalPrice = 0.0,
    this.currency = 'USD',
    this.bookingStatus = '',
  });
}

// ============================================================
// CANCEL RESPONSE
// ============================================================

/// Cancel booking yanıt modeli
class WebBedsCancelResponse {
  final bool success;
  final String? errorMessage;
  final double charge;
  final String chargeType;
  final bool cancelled;
  final String cancellationNumber;

  WebBedsCancelResponse({
    required this.success,
    this.errorMessage,
    this.charge = 0.0,
    this.chargeType = '',
    this.cancelled = false,
    this.cancellationNumber = '',
  });
}

// ============================================================
// SEARCH REQUEST
// ============================================================

/// Otel arama isteği modeli (UI'dan gelen)
class WebBedsSearchRequest {
  final DateTime checkIn;
  final DateTime checkOut;
  final int cityCode;
  final int adults;
  final int rooms;
  final List<int> childrenAges;
  final int currency;
  final int nationality;

  WebBedsSearchRequest({
    required this.checkIn,
    required this.checkOut,
    required this.cityCode,
    required this.adults,
    this.rooms = 1,
    this.childrenAges = const [],
    this.currency = 769, // USD
    this.nationality = 5, // TR
  });

  /// Gece sayısı
  int get nights => checkOut.difference(checkIn).inDays;
}
