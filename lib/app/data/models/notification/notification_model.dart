/// Lightweight manual model (Freezed removed here to simplify migration)
class NotificationModel {
  final String? id;
  final String? userId;
  final String? title;
  final String? message;
  final String? type;
  final String? relatedCollection;
  final String? relatedId;
  final Map<String, dynamic>? data;
  final bool read;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const NotificationModel({
    this.id,
    this.userId,
    this.title,
    this.message,
    this.type,
    this.relatedCollection,
    this.relatedId,
    this.data,
    this.read = false,
    this.createdAt,
    this.updatedAt,
  });

  NotificationModel copyWith({
    String? id,
    String? userId,
    String? title,
    String? message,
    String? type,
    String? relatedCollection,
    String? relatedId,
    Map<String, dynamic>? data,
    bool? read,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) => NotificationModel(
    id: id ?? this.id,
    userId: userId ?? this.userId,
    title: title ?? this.title,
    message: message ?? this.message,
    type: type ?? this.type,
    relatedCollection: relatedCollection ?? this.relatedCollection,
    relatedId: relatedId ?? this.relatedId,
    data: data ?? this.data,
    read: read ?? this.read,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );

  factory NotificationModel.fromDoc(String id, Map<String, dynamic> json) => NotificationModel(
    id: id,
    userId: json['userId'] as String?,
    title: json['title'] as String?,
    message: json['message'] as String?,
    type: json['type'] as String?,
    relatedCollection: json['relatedCollection'] as String?,
    relatedId: json['relatedId'] as String?,
    data: (json['data'] as Map?)?.map((k, v) => MapEntry(k.toString(), v)),
    read: (json['read'] as bool?) ?? false,
    createdAt: _parseDate(json['createdAt']),
    updatedAt: _parseDate(json['updatedAt']),
  );

  static DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    if (v is String) {
      try { return DateTime.parse(v); } catch (_) { return null; }
    }
    return null;
  }

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'title': title,
    'message': message,
    'type': type,
    'relatedCollection': relatedCollection,
    'relatedId': relatedId,
    'data': data,
    'read': read,
    if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
  };
}