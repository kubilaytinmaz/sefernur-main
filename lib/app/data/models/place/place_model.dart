import 'package:equatable/equatable.dart';

import '../../enums/place_city.dart';

class PlaceModel extends Equatable {
  final String? id;
  final String title;
  final String shortDescription;
  final String longDescription;
  final PlaceCity city;
  final List<String> images; // urls
  final bool isActive;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? locationUrl; // optional external maps URL

  const PlaceModel({
    this.id,
    required this.title,
    required this.shortDescription,
    required this.longDescription,
    required this.city,
    required this.images,
    required this.isActive,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.locationUrl,
  });

  PlaceModel copyWith({
    String? id,
    String? title,
    String? shortDescription,
    String? longDescription,
    PlaceCity? city,
    List<String>? images,
    bool? isActive,
    String? createdBy,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? locationUrl,
  }) => PlaceModel(
    id: id ?? this.id,
    title: title ?? this.title,
    shortDescription: shortDescription ?? this.shortDescription,
    longDescription: longDescription ?? this.longDescription,
    city: city ?? this.city,
    images: images ?? this.images,
    isActive: isActive ?? this.isActive,
    createdBy: createdBy ?? this.createdBy,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
    locationUrl: locationUrl ?? this.locationUrl,
  );

  Map<String,dynamic> toJson() => {
    'title': title,
    'shortDescription': shortDescription,
    'longDescription': longDescription,
    'city': city.name,
    'images': images,
    'isActive': isActive,
    'createdBy': createdBy,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'locationUrl': locationUrl,
  };

  factory PlaceModel.fromJson(Map<String,dynamic> map) => PlaceModel(
    id: map['id'] as String?,
    title: map['title'] ?? '',
    shortDescription: map['shortDescription'] ?? '',
    longDescription: map['longDescription'] ?? '',
    city: PlaceCity.values.firstWhere((e)=> e.name == map['city'], orElse: ()=> PlaceCity.mekke),
    images: (map['images'] as List?)?.map((e)=> e.toString()).toList() ?? const [],
    isActive: map['isActive'] ?? true,
    createdBy: map['createdBy'] ?? 'unknown',
    createdAt: DateTime.tryParse(map['createdAt'] ?? '') ?? DateTime.now(),
    updatedAt: DateTime.tryParse(map['updatedAt'] ?? '') ?? DateTime.now(),
    locationUrl: map['locationUrl'] as String?,
  );

  @override
  List<Object?> get props => [id, title, shortDescription, longDescription, city, images, isActive, createdBy, createdAt, updatedAt, locationUrl];
}
