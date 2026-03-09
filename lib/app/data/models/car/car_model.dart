import 'package:latlong2/latlong.dart';

import '../address/address_model.dart';

class CarModel {
  final String? id;
  final String brand;
  final String model;
  final String type; // economy, suv, premium
  final String transmission; // manual, automatic
  final String fuelType; // petrol, diesel, hybrid, electric
  final int seats; // capacity
  final String company; // rental company name
  // İletişim Bilgileri
  final String phone; // aranacak telefon
  final String email; // email iletişim
  final String? whatsapp; // whatsapp numarası (opsiyonel)
  /// Tekil teslim adresi
  final AddressModel addressModel;
  final double dailyPrice;
  final double? discountedDailyPrice;
  final double rating;
  final int reviewCount;
  final List<String> favoriteUserIds;
  final List<String> images;
  final Map<String, CarDailyAvailability> availability; // YYYY-MM-DD -> availability
  final bool isActive;
  final bool isPopular; // admin işaretli popüler
  final DateTime createdAt;
  final DateTime updatedAt;

  CarModel({
    this.id,
    required this.brand,
    required this.model,
    required this.type,
    required this.transmission,
    required this.fuelType,
    required this.seats,
    required this.company,
  this.phone = '',
  this.email = '',
  this.whatsapp,
  required this.addressModel,
    required this.dailyPrice,
    this.discountedDailyPrice,
  this.rating = 0.0,
  this.reviewCount = 0,
  required this.images,
    required this.availability,
  this.isActive = true,
  this.isPopular = false,
  this.favoriteUserIds = const [],
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory CarModel.fromJson(Map<String, dynamic> json) {
  AddressModel? addrModel;
  final rawAddr = json['addressModel'];
  if (rawAddr is Map<String, dynamic>) { try { addrModel = AddressModel.fromJson(Map<String,dynamic>.from(rawAddr)); } catch (_) {} }
    return CarModel(
      id: json['id'],
      brand: json['brand'] ?? '',
      model: json['model'] ?? '',
      type: json['type'] ?? 'economy',
      transmission: json['transmission'] ?? 'manual',
      fuelType: json['fuelType'] ?? 'petrol',
      seats: int.tryParse(json['seats']?.toString() ?? '4') ?? 4,
      company: json['company'] ?? '',
  phone: json['phone'] ?? (json['contactPhone'] ?? ''),
  email: json['email'] ?? (json['contactEmail'] ?? ''),
  whatsapp: json['whatsapp'] ?? json['contactWhatsapp'],
      addressModel: addrModel ?? AddressModel(
        location: (json['location'] != null) ? LatLng(
          double.tryParse(json['location']?['lat']?.toString() ?? '0') ?? 0,
          double.tryParse(json['location']?['lng']?.toString() ?? '0') ?? 0,
        ) : null,
        address: json['address'] ?? (json['locationName'] ?? ''),
        country: json['country'] ?? '',
        countryCode: json['countryCode'] ?? '',
        city: json['city'] ?? '',
        state: json['state'] ?? '',
      ),
      dailyPrice: double.tryParse(json['dailyPrice']?.toString() ?? '0') ?? 0,
      discountedDailyPrice: json['discountedDailyPrice'] != null
          ? double.tryParse(json['discountedDailyPrice'].toString())
          : null,
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0,
      reviewCount: int.tryParse(json['reviewCount']?.toString() ?? '0') ?? 0,
      images: List<String>.from(json['images'] ?? const []),
      availability: (json['availability'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, CarDailyAvailability.fromJson(v)),
          ) ??
          {},
  isActive: json['isActive'] ?? true,
  isPopular: json['isPopular'] ?? false,
  favoriteUserIds: List<String>.from(json['favoriteUserIds'] ?? const []),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'brand': brand,
      'model': model,
      'type': type,
      'transmission': transmission,
      'fuelType': fuelType,
      'seats': seats,
      'company': company,
  'phone': phone,
  'email': email,
  'whatsapp': whatsapp,
  'addressModel': addressModel.toJson(),
      'dailyPrice': dailyPrice,
      'discountedDailyPrice': discountedDailyPrice,
      'rating': rating,
      'reviewCount': reviewCount,
      'images': images,
      'availability': availability.map((k, v) => MapEntry(k, v.toJson())),
  'isActive': isActive,
  'isPopular': isPopular,
  'favoriteUserIds': favoriteUserIds,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  CarModel copyWith({
    String? id,
    String? brand,
    String? model,
    String? type,
    String? transmission,
    String? fuelType,
    int? seats,
    String? company,
  String? phone,
  String? email,
  String? whatsapp,
  AddressModel? addressModel,
    double? dailyPrice,
    double? discountedDailyPrice,
    double? rating,
    int? reviewCount,
    List<String>? images,
    List<String>? favoriteUserIds,
    Map<String, CarDailyAvailability>? availability,
  bool? isActive,
  bool? isPopular,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CarModel(
      id: id ?? this.id,
      brand: brand ?? this.brand,
      model: model ?? this.model,
      type: type ?? this.type,
      transmission: transmission ?? this.transmission,
      fuelType: fuelType ?? this.fuelType,
      seats: seats ?? this.seats,
      company: company ?? this.company,
  phone: phone ?? this.phone,
  email: email ?? this.email,
  whatsapp: whatsapp ?? this.whatsapp,
  addressModel: addressModel ?? this.addressModel,
      dailyPrice: dailyPrice ?? this.dailyPrice,
      discountedDailyPrice: discountedDailyPrice ?? this.discountedDailyPrice,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      images: images ?? this.images,
      availability: availability ?? this.availability,
  isActive: isActive ?? this.isActive,
  isPopular: isPopular ?? this.isPopular,
      favoriteUserIds: favoriteUserIds ?? this.favoriteUserIds,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  LatLng? get location => addressModel.location;
  String get locationName => addressModel.address; // legacy uyum
  String get effectiveAddress => addressModel.address;
  String get effectiveCity => addressModel.city;
  String get effectiveState => addressModel.state;
  String get effectiveCountry => addressModel.country;
  String get effectiveCountryCode => addressModel.countryCode;
}

class CarDailyAvailability {
  final String date; // YYYY-MM-DD
  final bool isAvailable;
  final int availableCount; // number of cars available for the day
  // Per 30-minute time slot availability (e.g. 10:00, 10:30 ... 23:30)
  final Map<String, bool> timeSlots; // slot -> isAvailable

  CarDailyAvailability({
    required this.date,
    required this.isAvailable,
    required this.availableCount,
    Map<String, bool>? timeSlots,
  }) : timeSlots = timeSlots ?? _defaultTimeSlots();

  factory CarDailyAvailability.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic>? rawSlots = json['timeSlots'];
    Map<String, bool>? parsed;
    if (rawSlots != null) {
      parsed = rawSlots.map((k, v) => MapEntry(k, v == true));
    }
    return CarDailyAvailability(
      date: json['date'] ?? '',
      isAvailable: json['isAvailable'] ?? false,
      availableCount: int.tryParse(json['availableCount']?.toString() ?? '0') ?? 0,
      timeSlots: parsed ?? _defaultTimeSlots(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'isAvailable': isAvailable,
      'availableCount': availableCount,
      'timeSlots': timeSlots,
    };
  }

  CarDailyAvailability copyWith({
    String? date,
    bool? isAvailable,
    int? availableCount,
    Map<String, bool>? timeSlots,
  }) {
    return CarDailyAvailability(
      date: date ?? this.date,
      isAvailable: isAvailable ?? this.isAvailable,
      availableCount: availableCount ?? this.availableCount,
      timeSlots: timeSlots ?? this.timeSlots,
    );
  }

  static List<String> standardSlots() {
    final List<String> slots = [];
    for (int hour = 10; hour <= 23; hour++) {
      for (int m in [0, 30]) {
        if (hour == 23 && m == 30) {
          // include 23:30 as last slot
          slots.add(_fmtSlot(hour, m));
          continue;
        }
        slots.add(_fmtSlot(hour, m));
      }
    }
    return slots;
  }

  static Map<String, bool> _defaultTimeSlots() {
    return {for (final s in standardSlots()) s: true};
  }

  static String _fmtSlot(int h, int m) =>
      '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}';
}
