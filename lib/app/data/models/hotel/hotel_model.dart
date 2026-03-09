import 'package:latlong2/latlong.dart';

import '../address/address_model.dart';

class HotelModel {
  final String? id;
  final String name;
  final String description;
  final List<String> images;
  /// Tüm adres ve konum bilgileri için tek kaynak
  final AddressModel addressModel;
  final String phone;
  final String email;
  final String website;
  final String? whatsapp; // whatsapp iletişim hattı
  final List<RoomType> roomTypes;
  final List<String> amenities;
  final double rating;
  final int reviewCount;
  final List<String> favoriteUserIds; // users who favorited
  final String category; // 'budget', 'luxury', 'boutique', etc.
  final Map<String, DailyAvailability> availability; // tarih string'i key olarak
  final bool isActive;
  final bool isPopular; // admin tarafından vurgulanan popüler içerik
  final DateTime createdAt;
  final DateTime updatedAt;

  HotelModel({
    this.id,
    required this.name,
    required this.description,
  required this.images,
  required this.addressModel,
    required this.phone,
    required this.email,
    this.website = '',
  this.whatsapp,
    required this.roomTypes,
    required this.amenities,
    this.rating = 0.0,
    this.reviewCount = 0,
  required this.category,
    required this.availability,
  this.isActive = true,
  this.isPopular = false,
  this.favoriteUserIds = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory HotelModel.fromJson(Map<String, dynamic> json) {
    // Yeni yapı sadece addressModel kullanır. Eski kayıtlar için fallback alanlardan üret.
    AddressModel? addrModel;
    final rawAddrModel = json['addressModel'] ?? json['addressData'];
    if (rawAddrModel is Map<String, dynamic>) {
      try { addrModel = AddressModel.fromJson(Map<String,dynamic>.from(rawAddrModel)); } catch (_) {}
    }

    return HotelModel(
      id: json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      addressModel: addrModel ?? AddressModel(
        location: (json['location'] != null) ? LatLng(
          double.tryParse(json['location']['latitude']?.toString() ?? '0') ?? 0,
          double.tryParse(json['location']['longitude']?.toString() ?? '0') ?? 0,
        ) : null,
        address: json['address'] ?? '',
        country: json['country'] ?? '',
        countryCode: json['countryCode'] ?? '',
        city: json['city'] ?? '',
        state: json['state'] ?? '',
      ),
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      website: json['website'] ?? '',
  whatsapp: json['whatsapp'] ?? json['contactWhatsapp'],
      roomTypes: (json['roomTypes'] as List?)
          ?.map((e) => RoomType.fromJson(e))
          .toList() ?? [],
      amenities: List<String>.from(json['amenities'] ?? []),
      rating: double.parse(json['rating']?.toString() ?? '0.0'),
      reviewCount: int.parse(json['reviewCount']?.toString() ?? '0'),
      category: json['category'] ?? 'budget',
      availability: (json['availability'] as Map<String, dynamic>?)?.map(
        (key, value) => MapEntry(key, DailyAvailability.fromJson(value)),
      ) ?? {},
  isActive: json['isActive'] ?? true,
  isPopular: json['isPopular'] ?? false,
  favoriteUserIds: List<String>.from(json['favoriteUserIds'] ?? const []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'images': images,
  'addressModel': addressModel.toJson(),
      'phone': phone,
      'email': email,
      'website': website,
  'whatsapp': whatsapp,
      'roomTypes': roomTypes.map((e) => e.toJson()).toList(),
      'amenities': amenities,
      'rating': rating,
      'reviewCount': reviewCount,
      'category': category,
    'availability': availability.map((key, value) => MapEntry(key, value.toJson())),
  'isActive': isActive,
  'isPopular': isPopular,
  'favoriteUserIds': favoriteUserIds,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  HotelModel copyWith({
    String? id,
    String? name,
    String? description,
    List<String>? images,
  AddressModel? addressModel,
    String? phone,
    String? email,
    String? website,
  String? whatsapp,
    List<RoomType>? roomTypes,
    List<String>? amenities,
    double? rating,
    int? reviewCount,
    String? category,
    Map<String, DailyAvailability>? availability,
  bool? isActive,
  bool? isPopular,
  List<String>? favoriteUserIds,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return HotelModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      images: images ?? this.images,
  addressModel: addressModel ?? this.addressModel,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      website: website ?? this.website,
  whatsapp: whatsapp ?? this.whatsapp,
      roomTypes: roomTypes ?? this.roomTypes,
      amenities: amenities ?? this.amenities,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      category: category ?? this.category,
  availability: availability ?? this.availability,
  isActive: isActive ?? this.isActive,
  isPopular: isPopular ?? this.isPopular,
  favoriteUserIds: favoriteUserIds ?? this.favoriteUserIds,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Kolay erişim getter'ları
  LatLng? get location => addressModel.location;
  String get address => addressModel.address;
  String get country => addressModel.country;
  String get countryCode => addressModel.countryCode;
  String get city => addressModel.city;
  String get state => addressModel.state;
}

class RoomType {
  final String id;
  final String name;
  final String description;
  final int capacity;
  final double originalPrice;
  final double? discountedPrice;
  final int? discountPercentage;
  final String boardType; // 'BB', 'HB', 'FB', 'AI' (Bed&Breakfast, Half Board, Full Board, All Inclusive)
  final List<String> amenities;
  final List<String> images;
  final String currency; // EUR, USD, GBP, TRY

  RoomType({
    required this.id,
    required this.name,
    required this.description,
    required this.capacity,
    required this.originalPrice,
    this.discountedPrice,
    this.discountPercentage,
    required this.boardType,
    required this.amenities,
    required this.images,
    this.currency = 'EUR',
  });

  factory RoomType.fromJson(Map<String, dynamic> json) {
    return RoomType(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      capacity: int.parse(json['capacity']?.toString() ?? '2'),
      originalPrice: double.parse(json['originalPrice']?.toString() ?? '0.0'),
      discountedPrice: json['discountedPrice'] != null 
          ? double.parse(json['discountedPrice'].toString()) 
          : null,
      discountPercentage: json['discountPercentage'] != null
          ? int.parse(json['discountPercentage'].toString())
          : null,
      boardType: json['boardType'] ?? 'BB',
      amenities: List<String>.from(json['amenities'] ?? []),
      images: List<String>.from(json['images'] ?? []),
      currency: json['currency'] ?? 'EUR',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'capacity': capacity,
      'originalPrice': originalPrice,
      'discountedPrice': discountedPrice,
      'discountPercentage': discountPercentage,
      'boardType': boardType,
      'amenities': amenities,
      'images': images,
      'currency': currency,
    };
  }

  RoomType copyWith({
    String? id,
    String? name,
    String? description,
    int? capacity,
    double? originalPrice,
    double? discountedPrice,
    int? discountPercentage,
    String? boardType,
    List<String>? amenities,
    List<String>? images,
    String? currency,
  }) {
    return RoomType(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      capacity: capacity ?? this.capacity,
      originalPrice: originalPrice ?? this.originalPrice,
      discountedPrice: discountedPrice ?? this.discountedPrice,
      discountPercentage: discountPercentage ?? this.discountPercentage,
      boardType: boardType ?? this.boardType,
      amenities: amenities ?? this.amenities,
      images: images ?? this.images,
      currency: currency ?? this.currency,
    );
  }
}

class DailyAvailability {
  final String date; // YYYY-MM-DD format
  final int totalRooms;
  final int availableRooms;
  final bool isAvailable;
  final double? specialPrice; // O güne özel fiyat varsa

  DailyAvailability({
    required this.date,
    required this.totalRooms,
    required this.availableRooms,
    required this.isAvailable,
    this.specialPrice,
  });

  factory DailyAvailability.fromJson(Map<String, dynamic> json) {
    return DailyAvailability(
      date: json['date'] ?? '',
      totalRooms: int.parse(json['totalRooms']?.toString() ?? '0'),
      availableRooms: int.parse(json['availableRooms']?.toString() ?? '0'),
      isAvailable: json['isAvailable'] ?? true,
      specialPrice: json['specialPrice'] != null 
          ? double.parse(json['specialPrice'].toString()) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'totalRooms': totalRooms,
      'availableRooms': availableRooms,
      'isAvailable': isAvailable,
      'specialPrice': specialPrice,
    };
  }

  double get occupancyRate {
    if (totalRooms == 0) return 0.0;
    return ((totalRooms - availableRooms) / totalRooms) * 100;
  }

  DailyAvailability copyWith({
    String? date,
    int? totalRooms,
    int? availableRooms,
    bool? isAvailable,
    double? specialPrice,
  }) {
    return DailyAvailability(
      date: date ?? this.date,
      totalRooms: totalRooms ?? this.totalRooms,
      availableRooms: availableRooms ?? this.availableRooms,
      isAvailable: isAvailable ?? this.isAvailable,
      specialPrice: specialPrice ?? this.specialPrice,
    );
  }
}
