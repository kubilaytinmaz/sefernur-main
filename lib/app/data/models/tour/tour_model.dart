import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:latlong2/latlong.dart';

import '../address/address_model.dart';

class TourModel {
  final String? id;
  final String title;
  final String description;
  final String category;
  final List<String> tags;

  /// Turun hizmet verdiği adresler (şehir/ülke vb.). Eski 'regions' yerine geçer.
  final List<AddressModel> serviceAddresses;
  final int durationDays;

  /// Admin tarafından tanımlanan net başlangıç (gidiş) tarihi. Yoksa eski mantıkla availability'den türetilir.
  final DateTime? startDate;

  /// Opsiyonel bitiş tarihi. Girilmemiş ise [durationDays] ve [startDate] ile hesaplanabilir.
  final DateTime? endDate;
  final List<TourDayProgram> program;
  final double basePrice;
  final double? childPrice;
  // İletişim / Operasyon bilgileri
  final String? company; // düzenleyen firma
  final String? phone;
  final String? email;
  final String? whatsapp;
  final double rating;
  final int reviewCount;
  final List<String> images;
  final Map<String, TourDailyAvailability> availability;
  final bool isActive;
  final bool isPopular; // admin seçimi
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> favoriteUserIds;

  /// Tur başlangıç / buluşma noktası adresi (opsiyonel)
  final AddressModel? addressModel;

  // Yeni eklenen alanlar
  final String? serviceType; // 'Servisli', 'Yürüme Mesafesi' vb.
  final int? mekkeNights;
  final int? medineNights;
  final String? flightDepartureFrom;
  final String? flightDepartureTo;
  final String? flightReturnFrom;
  final String? flightReturnTo;
  final String? airline;
  final String? airlineLogo; // Havayolu logo URL'i

  TourModel({
    this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.tags,
    required this.serviceAddresses,
    required this.durationDays,
    required this.program,
    this.startDate,
    this.endDate,
    required this.basePrice,
    this.childPrice,
    this.company,
    this.phone,
    this.email,
    this.whatsapp,
    this.rating = 0,
    this.reviewCount = 0,
    required this.images,
    required this.availability,
    this.isActive = true,
    this.isPopular = false,
    this.favoriteUserIds = const [],
    this.addressModel,
    this.serviceType,
    this.mekkeNights,
    this.medineNights,
    this.flightDepartureFrom,
    this.flightDepartureTo,
    this.flightReturnFrom,
    this.flightReturnTo,
    this.airline,
    this.airlineLogo,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) : createdAt = createdAt ?? DateTime.now(),
       updatedAt = updatedAt ?? DateTime.now();

  factory TourModel.fromJson(Map<String, dynamic> json) {
    AddressModel? addrModel;
    final raw = json['addressModel'];
    if (raw is Map<String, dynamic>) {
      try {
        addrModel = AddressModel.fromJson(raw);
      } catch (_) {}
    }
    return TourModel(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      tags: List<String>.from(json['tags'] ?? const []),
      serviceAddresses: (json['serviceAddresses'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map((m) {
            try {
              return AddressModel.fromJson(m);
            } catch (_) {
              return AddressModel(address: m['address']?.toString() ?? '');
            }
          })
          .toList(),
      durationDays: int.tryParse(json['durationDays']?.toString() ?? '1') ?? 1,
      startDate: _parseNullableDate(json['startDate']),
      endDate: _parseNullableDate(json['endDate']),
      serviceType: json['serviceType'],
      mekkeNights: int.tryParse(json['mekkeNights']?.toString() ?? ''),
      medineNights: int.tryParse(json['medineNights']?.toString() ?? ''),
      flightDepartureFrom: json['flightDepartureFrom'],
      flightDepartureTo: json['flightDepartureTo'],
      flightReturnFrom: json['flightReturnFrom'],
      flightReturnTo: json['flightReturnTo'],
      airline: json['airline'],
      airlineLogo: json['airlineLogo'],
      program: (json['program'] as List<dynamic>? ?? const [])
          .map((e) => TourDayProgram.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      basePrice: double.tryParse(json['basePrice']?.toString() ?? '0') ?? 0,
      childPrice: json['childPrice'] != null
          ? double.tryParse(json['childPrice'].toString())
          : null,
      company: json['company'],
      phone: json['phone'] ?? json['contactPhone'],
      email: json['email'] ?? json['contactEmail'],
      whatsapp: json['whatsapp'] ?? json['contactWhatsapp'],
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0,
      reviewCount: int.tryParse(json['reviewCount']?.toString() ?? '0') ?? 0,
      images: List<String>.from(json['images'] ?? const []),
      availability:
          (json['availability'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, TourDailyAvailability.fromJson(v)),
          ) ??
          {},
      isActive: json['isActive'] ?? true,
      isPopular: json['isPopular'] ?? false,
      favoriteUserIds: List<String>.from(json['favoriteUserIds'] ?? const []),
      addressModel: addrModel,
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
    );
  }

  static DateTime _parseDate(dynamic v) {
    if (v == null) return DateTime.now();
    if (v is Timestamp) return v.toDate();
    return DateTime.tryParse(v.toString()) ?? DateTime.now();
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'tags': tags,
      'serviceAddresses': serviceAddresses.map((a) => a.toJson()).toList(),
      'durationDays': durationDays,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'program': program.map((e) => e.toJson()).toList(),
      'basePrice': basePrice,
      'childPrice': childPrice,
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
      'addressModel': addressModel?.toJson(),
      'serviceType': serviceType,
      'mekkeNights': mekkeNights,
      'medineNights': medineNights,
      'flightDepartureFrom': flightDepartureFrom,
      'flightDepartureTo': flightDepartureTo,
      'flightReturnFrom': flightReturnFrom,
      'flightReturnTo': flightReturnTo,
      'airline': airline,
      'airlineLogo': airlineLogo,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  static DateTime? _parseNullableDate(dynamic v) {
    if (v == null) return null;
    if (v is Timestamp) return v.toDate();
    return DateTime.tryParse(v.toString());
  }
}

class TourDayProgram {
  final int day;
  final String title;
  final String details;

  /// Gün özel konum adres modeli (opsiyonel). Artık tek kaynak.
  final AddressModel? addressModel;

  /// Opsiyonel gün başlığı (örn: "2–5. Gün"). Boş ise varsayılan olarak "Gün {day}" kullanılabilir.
  final String? dayLabel;

  TourDayProgram({
    required this.day,
    required this.title,
    required this.details,
    this.addressModel,
    this.dayLabel,
  });

  factory TourDayProgram.fromJson(Map<String, dynamic> json) {
    AddressModel? addr;
    final raw = json['addressModel'];
    if (raw is Map<String, dynamic>) {
      try {
        addr = AddressModel.fromJson(Map<String, dynamic>.from(raw));
      } catch (_) {}
    }
    // Legacy alanlardan (locationName, latitude, longitude) üret
    if (addr == null &&
        (json['locationName'] != null ||
            (json['latitude'] != null && json['longitude'] != null))) {
      final double? lat = json['latitude'] != null
          ? double.tryParse(json['latitude'].toString())
          : null;
      final double? lng = json['longitude'] != null
          ? double.tryParse(json['longitude'].toString())
          : null;
      addr = AddressModel(
        address: json['locationName'] ?? '',
        location: (lat != null && lng != null) ? LatLng(lat, lng) : null,
      );
    }
    return TourDayProgram(
      day: int.tryParse(json['day']?.toString() ?? '1') ?? 1,
      title: json['title'] ?? '',
      details: json['details'] ?? '',
      addressModel: addr,
      dayLabel: (json['dayLabel']?.toString().trim().isEmpty ?? true)
          ? null
          : json['dayLabel'].toString().trim(),
    );
  }

  Map<String, dynamic> toJson() => {
    'day': day,
    'title': title,
    'details': details,
    'addressModel': addressModel?.toJson(),
    'dayLabel': dayLabel,
  };

  TourDayProgram copyWith({
    int? day,
    String? title,
    String? details,
    AddressModel? addressModel,
    String? dayLabel,
  }) => TourDayProgram(
    day: day ?? this.day,
    title: title ?? this.title,
    details: details ?? this.details,
    addressModel: addressModel ?? this.addressModel,
    dayLabel: dayLabel ?? this.dayLabel,
  );

  // Geriye dönük geçiş için read-only getter'lar
  String? get locationName => addressModel?.address;
  double? get latitude => addressModel?.location?.latitude;
  double? get longitude => addressModel?.location?.longitude;

  /// Görüntüleme amaçlı: boşsa "Gün {day}" döndürür
  String get displayDayLabel =>
      (dayLabel == null || dayLabel!.isEmpty) ? 'Gün $day' : dayLabel!;
}

class TourDailyAvailability {
  final String date;
  final bool isAvailable;
  final int capacity;
  final int? sold;
  final double? specialPrice;

  TourDailyAvailability({
    required this.date,
    required this.isAvailable,
    required this.capacity,
    this.sold,
    this.specialPrice,
  });

  factory TourDailyAvailability.fromJson(Map<String, dynamic> json) =>
      TourDailyAvailability(
        date: json['date'] ?? '',
        isAvailable: json['isAvailable'] ?? true,
        capacity: int.tryParse(json['capacity']?.toString() ?? '0') ?? 0,
        sold: json['sold'] != null
            ? int.tryParse(json['sold'].toString())
            : null,
        specialPrice: json['specialPrice'] != null
            ? double.tryParse(json['specialPrice'].toString())
            : null,
      );

  Map<String, dynamic> toJson() => {
    'date': date,
    'isAvailable': isAvailable,
    'capacity': capacity,
    'sold': sold,
    'specialPrice': specialPrice,
  };
}
