import 'package:equatable/equatable.dart';

import '../../enums/blog_category.dart';

class BlogModel extends Equatable {
  final String? id;
  final String title;
  final String shortDescription; // excerpt
  final String longDescription; // full content
  final List<String> images; // urls
  final List<BlogCategory> categories;
  final bool isActive;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BlogModel({
    this.id,
    required this.title,
    required this.shortDescription,
    required this.longDescription,
    required this.images,
    required this.categories,
    required this.isActive,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
  });

  BlogModel copyWith({
    String? id,
    String? title,
    String? shortDescription,
    String? longDescription,
    List<String>? images,
    List<BlogCategory>? categories,
    bool? isActive,
    String? createdBy,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) => BlogModel(
    id: id ?? this.id,
    title: title ?? this.title,
    shortDescription: shortDescription ?? this.shortDescription,
    longDescription: longDescription ?? this.longDescription,
    images: images ?? this.images,
    categories: categories ?? this.categories,
    isActive: isActive ?? this.isActive,
    createdBy: createdBy ?? this.createdBy,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );

  Map<String,dynamic> toJson() => {
    'title': title,
    'shortDescription': shortDescription,
    'longDescription': longDescription,
    'images': images,
    'categories': categories.map((e)=> e.storageKey).toList(),
    'isActive': isActive,
    'createdBy': createdBy,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  factory BlogModel.fromJson(Map<String,dynamic> map) => BlogModel(
    id: map['id'] as String?,
    title: map['title'] ?? '',
    shortDescription: map['shortDescription'] ?? '',
    longDescription: map['longDescription'] ?? '',
    images: (map['images'] as List?)?.map((e)=> e.toString()).toList() ?? const [],
    categories: (map['categories'] as List?)?.map((e)=> BlogCategoryX.from(e.toString())).toList() ?? const [BlogCategory.hazirlik],
    isActive: map['isActive'] ?? true,
    createdBy: map['createdBy'] ?? 'unknown',
    createdAt: DateTime.tryParse(map['createdAt'] ?? '') ?? DateTime.now(),
    updatedAt: DateTime.tryParse(map['updatedAt'] ?? '') ?? DateTime.now(),
  );

  @override
  List<Object?> get props => [id,title,shortDescription,longDescription,images,categories,isActive,createdBy,createdAt,updatedAt];
}
