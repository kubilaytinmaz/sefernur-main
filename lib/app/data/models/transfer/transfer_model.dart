import 'package:latlong2/latlong.dart';

import '../address/address_model.dart';

/// Araç tipi - Sedan, Van (Minibüs), Bus, VIP, Jeep
enum VehicleType {
  sedan('sedan', 'Sedan', 'Binek'),
  van('van', 'Van', 'Minibüs'),
  bus('bus', 'Bus', 'Otobüs'),
  vip('vip', 'VIP', 'VIP'),
  jeep('jeep', 'Jeep', 'Jeep'),
  coster('coster', 'Coster', 'Coster');

  final String key;
  final String label;
  final String trLabel;
  const VehicleType(this.key, this.label, this.trLabel);

  static VehicleType fromString(String? value) {
    return VehicleType.values.firstWhere(
      (e) => e.key == value,
      orElse: () => VehicleType.sedan,
    );
  }
}

/// Araç özellikleri
enum VehicleAmenity {
  insurance('insurance', 'Tam Sigortalı', 'security'),
  airCondition('air_condition', 'Klimalı', 'ac_unit'),
  wifi('wifi', 'WiFi', 'wifi'),
  comfort('comfort', 'Konforlu', 'airline_seat_recline_extra'),
  usb('usb', 'USB Şarj', 'usb'),
  water('water', 'Su İkramı', 'water_drop'),
  snacks('snacks', 'Atıştırmalık', 'cookie'),
  tv('tv', 'TV/Ekran', 'tv'),
  bluetooth('bluetooth', 'Bluetooth', 'bluetooth'),
  gps('gps', 'GPS Navigasyon', 'gps_fixed');

  final String key;
  final String label;
  final String iconName;
  const VehicleAmenity(this.key, this.label, this.iconName);

  static VehicleAmenity? fromString(String? value) {
    return VehicleAmenity.values.cast<VehicleAmenity?>().firstWhere(
      (e) => e?.key == value,
      orElse: () => null,
    );
  }

  static List<VehicleAmenity> fromStringList(List<dynamic>? list) {
    if (list == null) return [];
    return list
        .map((e) => fromString(e.toString()))
        .whereType<VehicleAmenity>()
        .toList();
  }
}

class TransferModel {
  final String? id;
  final AddressModel fromAddress;
  final AddressModel toAddress;
  final String vehicleType; // sedan, van, bus, vip, jeep, coster
  final String vehicleName; // Araç adı (örn: GMC YUKON, Mercedes Vito)
  final int capacity; // Yolcu kapasitesi
  final int luggageCapacity; // Bagaj kapasitesi (adet)
  final int childSeatCount; // Çocuk koltuğu sayısı
  final List<String> amenities; // Özellikler listesi
  final double basePrice; // base price for route (USD)
  final int durationMinutes; // estimated duration
  final String company; // operator company
  final String? phone;
  final String? email;
  final String? whatsapp;
  final double rating; // aggregate (published reviews only)
  final int reviewCount; // aggregate count (published)
  final List<String> images;
  final Map<String, TransferDailyAvailability> availability; // YYYY-MM-DD -> availability
  final bool isActive;
  final bool isPopular; // admin işareti
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> favoriteUserIds;

  TransferModel({
    this.id,
    required this.fromAddress,
    required this.toAddress,
    required this.vehicleType,
    this.vehicleName = '',
    required this.capacity,
    this.luggageCapacity = 0,
    this.childSeatCount = 0,
    this.amenities = const [],
    required this.basePrice,
    required this.durationMinutes,
    required this.company,
    this.phone,
    this.email,
    this.whatsapp,
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

  /// Araç tipi enum değerini döndürür
  VehicleType get vehicleTypeEnum => VehicleType.fromString(vehicleType);

  /// Araç özelliklerini enum listesi olarak döndürür
  List<VehicleAmenity> get amenityList => VehicleAmenity.fromStringList(amenities);

  /// Araç başlığını oluşturur (örn: "Sedan • Binek" veya "Jeep • GMC YUKON")
  String get vehicleTitle {
    final type = vehicleTypeEnum;
    if (vehicleName.isNotEmpty) {
      return '${type.label} • $vehicleName';
    }
    return '${type.label} • ${type.trLabel}';
  }

  factory TransferModel.fromJson(Map<String, dynamic> json) {
    // Backward compatibility: if fromAddress/toAddress not present, build from legacy fields
    AddressModel parseAddress(Map<String, dynamic>? obj, String legacyNameKey, Map<String, dynamic>? legacyLoc) {
      if (obj != null) {
        return AddressModel.fromJson(obj);
      }
      final name = json[legacyNameKey] ?? '';
      LatLng? loc;
      if (legacyLoc != null) {
        loc = LatLng(
          double.tryParse(legacyLoc['lat']?.toString() ?? '0') ?? 0,
          double.tryParse(legacyLoc['lng']?.toString() ?? '0') ?? 0,
        );
      }
      return AddressModel(
        address: name,
        city: '',
        state: '',
        country: '',
        countryCode: '',
        location: loc,
      );
    }
    final fromAddr = parseAddress(json['fromAddress'] as Map<String, dynamic>?, 'fromName', json['fromLocation']);
    final toAddr = parseAddress(json['toAddress'] as Map<String, dynamic>?, 'toName', json['toLocation']);
    return TransferModel(
      id: json['id'],
      fromAddress: fromAddr,
      toAddress: toAddr,
      vehicleType: json['vehicleType'] ?? 'sedan',
      vehicleName: json['vehicleName'] ?? '',
      capacity: int.tryParse(json['capacity']?.toString() ?? '0') ?? 0,
      luggageCapacity: int.tryParse(json['luggageCapacity']?.toString() ?? '0') ?? 0,
      childSeatCount: int.tryParse(json['childSeatCount']?.toString() ?? '0') ?? 0,
      amenities: List<String>.from(json['amenities'] ?? const []),
      basePrice: double.tryParse(json['basePrice']?.toString() ?? '0') ?? 0,
      durationMinutes: int.tryParse(json['durationMinutes']?.toString() ?? '0') ?? 0,
      company: json['company'] ?? '',
      phone: json['phone'] ?? json['contactPhone'],
      email: json['email'] ?? json['contactEmail'],
      whatsapp: json['whatsapp'] ?? json['contactWhatsapp'],
      images: List<String>.from(json['images'] ?? const []),
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0.0,
      reviewCount: int.tryParse(json['reviewCount']?.toString() ?? '0') ?? 0,
      availability: (json['availability'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, TransferDailyAvailability.fromJson(v)),
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
      // New structured address fields
      'fromAddress': fromAddress.toJson(),
      'toAddress': toAddress.toJson(),
      // Include legacy fields for backward compatibility (can be removed after migration)
      'fromName': fromAddress.address,
      'fromLocation': fromAddress.location != null ? {
        'lat': fromAddress.location!.latitude,
        'lng': fromAddress.location!.longitude,
      } : null,
      'toName': toAddress.address,
      'toLocation': toAddress.location != null ? {
        'lat': toAddress.location!.latitude,
        'lng': toAddress.location!.longitude,
      } : null,
      'vehicleType': vehicleType,
      'vehicleName': vehicleName,
      'capacity': capacity,
      'luggageCapacity': luggageCapacity,
      'childSeatCount': childSeatCount,
      'amenities': amenities,
      'basePrice': basePrice,
      'durationMinutes': durationMinutes,
      'company': company,
      'phone': phone,
      'email': email,
      'whatsapp': whatsapp,
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

  String get fromShort => fromAddress.short();
  String get toShort => toAddress.short();
}

class TransferDailyAvailability {
  final String date;
  final bool isAvailable;
  final int availableSeats; // seats left for the date
  final double? specialPrice; // optional special price override

  TransferDailyAvailability({
    required this.date,
    required this.isAvailable,
    required this.availableSeats,
    this.specialPrice,
  });

  factory TransferDailyAvailability.fromJson(Map<String, dynamic> json) {
    return TransferDailyAvailability(
      date: json['date'] ?? '',
      isAvailable: json['isAvailable'] ?? true,
      availableSeats: int.tryParse(json['availableSeats']?.toString() ?? '0') ?? 0,
      specialPrice: json['specialPrice'] != null ? double.tryParse(json['specialPrice'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'isAvailable': isAvailable,
      'availableSeats': availableSeats,
      'specialPrice': specialPrice,
    };
  }
}
