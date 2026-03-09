import 'package:cloud_firestore/cloud_firestore.dart';

import '../address/address_model.dart';

class GuideModel {
  final String? id;
  final String name;
  final String bio;
  final List<String> languages; // spoken languages codes or names
  final List<String> specialties; // e.g. Hac, Umre, VIP, Historical
  /// Rehberin hizmet verdiği adreslerin tam listesi (şehir/ilçe/ülke + koordinat)
  final List<AddressModel> serviceAddresses;
  final List<String> certifications; // certificate names
  final int yearsExperience;
  final double dailyRate; // base daily rate
  final String? company; // rehber bağlı olduğu şirket (opsiyonel)
  final String? phone; // telefon
  final String? email; // email
  final String? whatsapp; // whatsapp
  final double rating;
  final int reviewCount;
  final List<String> images;
  final Map<String, GuideDailyAvailability> availability; // YYYY-MM-DD -> availability data
  final bool isActive;
  final bool isPopular; // admin işaretli popüler rehber
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> favoriteUserIds;
  /// Rehber konumu (opsiyonel – bazı rehberler sabit lokasyon tutmayabilir)
  final AddressModel? addressModel;

  GuideModel({
    this.id,
    required this.name,
    required this.bio,
    required this.languages,
    required this.specialties,
  this.serviceAddresses = const [],
    required this.certifications,
    required this.yearsExperience,
    required this.dailyRate,
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
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory GuideModel.fromJson(Map<String, dynamic> json) {
    AddressModel? addrModel;
    final raw = json['addressModel'];
    if (raw is Map<String, dynamic>) {
      try { addrModel = AddressModel.fromJson(raw); } catch (_) {}
    }
    return GuideModel(
      id: json['id'],
      name: json['name'] ?? '',
      bio: json['bio'] ?? '',
      languages: List<String>.from(json['languages'] ?? const []),
      specialties: List<String>.from(json['specialties'] ?? const []),
      serviceAddresses: (() {
        // Öncelik: yeni serviceAddresses listesi
        final rawList = json['serviceAddresses'];
        if (rawList is List) {
          final list = rawList.whereType<Map>().map((m) => AddressModel.fromJson(Map<String, dynamic>.from(m))).toList();
          if (list.isNotEmpty) return list;
        }
        // Geriye dönük: regions string listesi varsa AddressModel'e dönüştür
        final legacy = json['regions'];
        if (legacy is List) {
          return legacy.whereType<String>().map((r) => AddressModel(address: r, state: r)).toList();
        }
        return <AddressModel>[];
      })(),
      certifications: List<String>.from(json['certifications'] ?? const []),
      yearsExperience: int.tryParse(json['yearsExperience']?.toString() ?? '0') ?? 0,
      dailyRate: double.tryParse(json['dailyRate']?.toString() ?? '0') ?? 0,
  company: json['company'],
  phone: json['phone'] ?? json['contactPhone'],
  email: json['email'] ?? json['contactEmail'],
  whatsapp: json['whatsapp'] ?? json['contactWhatsapp'],
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0,
      reviewCount: int.tryParse(json['reviewCount']?.toString() ?? '0') ?? 0,
      images: List<String>.from(json['images'] ?? const []),
      availability: (json['availability'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, GuideDailyAvailability.fromJson(v)),
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
      'name': name,
      'bio': bio,
      'languages': languages,
      'specialties': specialties,
  'serviceAddresses': serviceAddresses.map((a)=> a.toJson()).toList(),
      'certifications': certifications,
      'yearsExperience': yearsExperience,
      'dailyRate': dailyRate,
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
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  GuideModel copyWith({
    String? id,
    String? name,
    String? bio,
    List<String>? languages,
    List<String>? specialties,
  List<AddressModel>? serviceAddresses,
    List<String>? certifications,
    int? yearsExperience,
    double? dailyRate,
  String? company,
  String? phone,
  String? email,
  String? whatsapp,
    double? rating,
    int? reviewCount,
    List<String>? images,
    Map<String, GuideDailyAvailability>? availability,
  bool? isActive,
  bool? isPopular,
    DateTime? createdAt,
    DateTime? updatedAt,
    AddressModel? addressModel,
  }) {
    return GuideModel(
      id: id ?? this.id,
      name: name ?? this.name,
      bio: bio ?? this.bio,
      languages: languages ?? this.languages,
      specialties: specialties ?? this.specialties,
  serviceAddresses: serviceAddresses ?? this.serviceAddresses,
      certifications: certifications ?? this.certifications,
      yearsExperience: yearsExperience ?? this.yearsExperience,
      dailyRate: dailyRate ?? this.dailyRate,
  company: company ?? this.company,
  phone: phone ?? this.phone,
  email: email ?? this.email,
  whatsapp: whatsapp ?? this.whatsapp,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      images: images ?? this.images,
      availability: availability ?? this.availability,
  isActive: isActive ?? this.isActive,
  isPopular: isPopular ?? this.isPopular,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      addressModel: addressModel ?? this.addressModel,
    );
  }
}

class GuideDailyAvailability {
  final String date; // YYYY-MM-DD
  final bool isAvailable;
  final double? specialRate; // optional override for that date

  GuideDailyAvailability({
    required this.date,
    required this.isAvailable,
    this.specialRate,
  });

  factory GuideDailyAvailability.fromJson(Map<String, dynamic> json) {
    return GuideDailyAvailability(
      date: json['date'] ?? '',
      isAvailable: json['isAvailable'] ?? true,
      specialRate: json['specialRate'] != null ? double.tryParse(json['specialRate'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'date': date,
        'isAvailable': isAvailable,
        'specialRate': specialRate,
      };
}
