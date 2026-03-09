import 'package:cloud_firestore/cloud_firestore.dart';

enum PopularSearchModule { hotel, tour, transfer }

enum PopularSearchSegment { general, transfer, visit }

class PopularSearchModel {
  final String? id;
  final PopularSearchModule module;
  final PopularSearchSegment segment;
  final String title;
  final String subtitle;
  final bool isActive;
  final int sortOrder;
  final String city;
  final String fromCity;
  final String toCity;
  final List<String> tags;
  final List<String> keywords;
  final DateTime createdAt;
  final DateTime updatedAt;

  const PopularSearchModel({
    this.id,
    required this.module,
    this.segment = PopularSearchSegment.general,
    required this.title,
    this.subtitle = '',
    this.isActive = true,
    this.sortOrder = 0,
    this.city = '',
    this.fromCity = '',
    this.toCity = '',
    this.tags = const [],
    this.keywords = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory PopularSearchModel.fromJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic value) {
      if (value == null) return DateTime.now();
      if (value is Timestamp) return value.toDate();
      return DateTime.tryParse(value.toString()) ?? DateTime.now();
    }

    PopularSearchModule parseModule(String? value) {
      switch ((value ?? '').toLowerCase()) {
        case 'tour':
          return PopularSearchModule.tour;
        case 'transfer':
          return PopularSearchModule.transfer;
        case 'hotel':
        default:
          return PopularSearchModule.hotel;
      }
    }

    PopularSearchSegment parseSegment(String? value) {
      switch ((value ?? '').toLowerCase()) {
        case 'transfer':
          return PopularSearchSegment.transfer;
        case 'visit':
          return PopularSearchSegment.visit;
        default:
          return PopularSearchSegment.general;
      }
    }

    return PopularSearchModel(
      id: json['id']?.toString(),
      module: parseModule(json['module']?.toString()),
      segment: parseSegment(json['segment']?.toString()),
      title: json['title']?.toString() ?? '',
      subtitle: json['subtitle']?.toString() ?? '',
      isActive: json['isActive'] == true,
      sortOrder: int.tryParse(json['sortOrder']?.toString() ?? '0') ?? 0,
      city: json['city']?.toString() ?? '',
      fromCity: json['fromCity']?.toString() ?? '',
      toCity: json['toCity']?.toString() ?? '',
      tags: List<String>.from(json['tags'] ?? const []),
      keywords: List<String>.from(json['keywords'] ?? const []),
      createdAt: parseDate(json['createdAt']),
      updatedAt: parseDate(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'module': module.name,
      'segment': segment.name,
      'title': title,
      'subtitle': subtitle,
      'isActive': isActive,
      'sortOrder': sortOrder,
      'city': city,
      'fromCity': fromCity,
      'toCity': toCity,
      'tags': tags,
      'keywords': keywords,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  PopularSearchModel copyWith({
    String? id,
    PopularSearchModule? module,
    PopularSearchSegment? segment,
    String? title,
    String? subtitle,
    bool? isActive,
    int? sortOrder,
    String? city,
    String? fromCity,
    String? toCity,
    List<String>? tags,
    List<String>? keywords,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PopularSearchModel(
      id: id ?? this.id,
      module: module ?? this.module,
      segment: segment ?? this.segment,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      isActive: isActive ?? this.isActive,
      sortOrder: sortOrder ?? this.sortOrder,
      city: city ?? this.city,
      fromCity: fromCity ?? this.fromCity,
      toCity: toCity ?? this.toCity,
      tags: tags ?? this.tags,
      keywords: keywords ?? this.keywords,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
