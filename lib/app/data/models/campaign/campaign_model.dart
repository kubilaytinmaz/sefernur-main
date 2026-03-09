import 'package:cloud_firestore/cloud_firestore.dart';

import '../../enums/campaign_type.dart';

class CampaignModel {
  final String? id;
  final String title;
  final String shortDescription;
  final String longDescription;
  final String imageUrl;
  final CampaignType type;
  final bool isActive;
  final String createdBy; // user id
  final List<String> savedByUserIds; // users who saved/bookmarked
  final DateTime createdAt;
  final DateTime updatedAt;

  CampaignModel({
    this.id,
    required this.title,
    required this.shortDescription,
    required this.longDescription,
    required this.imageUrl,
    required this.type,
    this.isActive = true,
    required this.createdBy,
    this.savedByUserIds = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory CampaignModel.fromJson(Map<String, dynamic> json) {
    return CampaignModel(
      id: json['id'],
      title: json['title'] ?? '',
      shortDescription: json['shortDescription'] ?? json['description'] ?? '',
      longDescription: json['longDescription'] ?? json['details'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      type: CampaignTypeX.fromString(json['type']) ?? CampaignType.hotel,
      isActive: json['isActive'] ?? true,
      createdBy: json['createdBy'] ?? '',
      savedByUserIds: List<String>.from(json['savedByUserIds'] ?? const []),
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'shortDescription': shortDescription,
      'longDescription': longDescription,
      'imageUrl': imageUrl,
      'type': type.name,
      'isActive': isActive,
      'createdBy': createdBy,
      'savedByUserIds': savedByUserIds,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  CampaignModel copyWith({
    String? id,
    String? title,
    String? shortDescription,
    String? longDescription,
    String? imageUrl,
    CampaignType? type,
    bool? isActive,
    String? createdBy,
    List<String>? savedByUserIds,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CampaignModel(
      id: id ?? this.id,
      title: title ?? this.title,
      shortDescription: shortDescription ?? this.shortDescription,
      longDescription: longDescription ?? this.longDescription,
      imageUrl: imageUrl ?? this.imageUrl,
      type: type ?? this.type,
      isActive: isActive ?? this.isActive,
      createdBy: createdBy ?? this.createdBy,
      savedByUserIds: savedByUserIds ?? this.savedByUserIds,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  static DateTime _parseDate(dynamic raw) {
    if (raw == null) return DateTime.now();
    if (raw is Timestamp) return raw.toDate();
    if (raw is String) return DateTime.tryParse(raw) ?? DateTime.now();
    return DateTime.now();
  }
}
