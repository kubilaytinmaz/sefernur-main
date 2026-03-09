import 'package:cloud_firestore/cloud_firestore.dart';

/// Arama sekmelerinde gösterilecek indirim/promosyon banner modeli
enum PromotionTargetType { hotel, car, transfer, tour, guide }

extension PromotionTargetTypeX on PromotionTargetType {
  String get label {
    switch (this) {
      case PromotionTargetType.hotel:
        return 'Oteller';
      case PromotionTargetType.car:
        return 'Taxi';
      case PromotionTargetType.transfer:
        return 'Transfer';
      case PromotionTargetType.tour:
        return 'Turlar';
      case PromotionTargetType.guide:
        return 'Rehberler';
    }
  }

  String get icon {
    switch (this) {
      case PromotionTargetType.hotel:
        return 'hotel';
      case PromotionTargetType.car:
        return 'car';
      case PromotionTargetType.transfer:
        return 'transfer';
      case PromotionTargetType.tour:
        return 'tour';
      case PromotionTargetType.guide:
        return 'guide';
    }
  }

  static PromotionTargetType? fromString(String? value) {
    if (value == null) return null;
    return PromotionTargetType.values.firstWhere(
      (e) => e.name.toLowerCase() == value.toLowerCase(),
      orElse: () => PromotionTargetType.hotel,
    );
  }
}

class PromotionModel {
  final String? id;
  final String title;
  final String subtitle;
  final String? description;
  final PromotionTargetType targetType;
  final int discountPercent; // 0-100
  final String? discountCode;
  final String gradientStartColor; // hex color
  final String gradientEndColor; // hex color
  final String? badgeText; // örn: "%20 İNDİRİM"
  final String? badgeColor; // hex color
  final bool isActive;
  final DateTime? startDate;
  final DateTime? endDate;
  final int priority; // sıralama için (düşük = önce)
  final DateTime createdAt;
  final DateTime updatedAt;

  PromotionModel({
    this.id,
    required this.title,
    required this.subtitle,
    this.description,
    required this.targetType,
    this.discountPercent = 0,
    this.discountCode,
    this.gradientStartColor = '#4A90E2',
    this.gradientEndColor = '#7B68EE',
    this.badgeText,
    this.badgeColor,
    this.isActive = true,
    this.startDate,
    this.endDate,
    this.priority = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PromotionModel.fromJson(Map<String, dynamic> json) {
    return PromotionModel(
      id: json['id'],
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? '',
      description: json['description'],
      targetType: PromotionTargetTypeX.fromString(json['targetType']) ?? PromotionTargetType.hotel,
      discountPercent: json['discountPercent'] ?? 0,
      discountCode: json['discountCode'],
      gradientStartColor: json['gradientStartColor'] ?? '#4A90E2',
      gradientEndColor: json['gradientEndColor'] ?? '#7B68EE',
      badgeText: json['badgeText'],
      badgeColor: json['badgeColor'],
      isActive: json['isActive'] ?? true,
      startDate: _parseDate(json['startDate']),
      endDate: _parseDate(json['endDate']),
      priority: json['priority'] ?? 0,
      createdAt: _parseDate(json['createdAt']) ?? DateTime.now(),
      updatedAt: _parseDate(json['updatedAt']) ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'title': title,
      'subtitle': subtitle,
      'description': description,
      'targetType': targetType.name,
      'discountPercent': discountPercent,
      'discountCode': discountCode,
      'gradientStartColor': gradientStartColor,
      'gradientEndColor': gradientEndColor,
      'badgeText': badgeText,
      'badgeColor': badgeColor,
      'isActive': isActive,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'priority': priority,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  PromotionModel copyWith({
    String? id,
    String? title,
    String? subtitle,
    String? description,
    PromotionTargetType? targetType,
    int? discountPercent,
    String? discountCode,
    String? gradientStartColor,
    String? gradientEndColor,
    String? badgeText,
    String? badgeColor,
    bool? isActive,
    DateTime? startDate,
    DateTime? endDate,
    int? priority,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PromotionModel(
      id: id ?? this.id,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      description: description ?? this.description,
      targetType: targetType ?? this.targetType,
      discountPercent: discountPercent ?? this.discountPercent,
      discountCode: discountCode ?? this.discountCode,
      gradientStartColor: gradientStartColor ?? this.gradientStartColor,
      gradientEndColor: gradientEndColor ?? this.gradientEndColor,
      badgeText: badgeText ?? this.badgeText,
      badgeColor: badgeColor ?? this.badgeColor,
      isActive: isActive ?? this.isActive,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      priority: priority ?? this.priority,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  /// Promosyonun şu an aktif olup olmadığını kontrol eder
  bool get isCurrentlyActive {
    if (!isActive) return false;
    final now = DateTime.now();
    if (startDate != null && now.isBefore(startDate!)) return false;
    if (endDate != null && now.isAfter(endDate!)) return false;
    return true;
  }

  static DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    if (v is Timestamp) return v.toDate();
    if (v is DateTime) return v;
    if (v is String) return DateTime.tryParse(v);
    return null;
  }
}
