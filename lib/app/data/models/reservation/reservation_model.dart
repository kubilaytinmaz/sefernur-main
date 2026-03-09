import 'package:cloud_firestore/cloud_firestore.dart';

/// Unified reservation types
enum ReservationType { hotel, car, transfer, guide, tour }

ReservationType reservationTypeFromString(String v) {
  switch (v) {
    case 'hotel': return ReservationType.hotel;
    case 'car': return ReservationType.car;
    case 'transfer': return ReservationType.transfer;
    case 'guide': return ReservationType.guide;
    case 'tour': return ReservationType.tour;
    default: return ReservationType.hotel;
  }
}

String reservationTypeToString(ReservationType t) => t.name;

/// Base unified reservation model stored in single Firestore collection 'reservations'
/// Each document keeps provider specific reference IDs & snapshot copy fields for quick listing.
class ReservationModel {
  final String? id; // firestore doc id
  final String userId;
  final ReservationType type;
  final String itemId; // referenced entity id (hotelId, carId etc.)
  final String title; // snapshot title (hotel name, tour title...)
  final String subtitle; // location, short info
  final String imageUrl; // cover image if any
  final DateTime startDate; // check-in / pickup / first day
  final DateTime endDate; // checkout / dropoff / last day (for single day can equal start)
  final int quantity; // nights, days, seats, rooms count etc.
  final int people; // pax count if applicable
  final double price; // total price locked at booking time
  final String currency; // ISO currency
  final String status; // pending, confirmed, cancelled, completed
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> meta; // provider specific raw data (boardType, roomType, vehicle, etc.)
  // Yeni ortak alanlar (kullanıcı iletişim snapshot & serbest not)
  final String? userPhone;
  final String? userEmail;
  final String? notes; // kullanıcının bıraktığı açıklama

  ReservationModel({
    this.id,
    required this.userId,
    required this.type,
    required this.itemId,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.startDate,
    required this.endDate,
    required this.quantity,
    required this.people,
    required this.price,
    this.currency = 'USD',
    this.status = 'pending',
    required this.createdAt,
    required this.updatedAt,
    this.meta = const {},
  this.userPhone,
  this.userEmail,
  this.notes,
  });

  bool get isPast => endDate.isBefore(DateTime.now());

  factory ReservationModel.fromJson(Map<String, dynamic> json, String id) {
    return ReservationModel(
      id: id,
      userId: json['userId'] ?? '',
      type: reservationTypeFromString(json['type'] ?? 'hotel'),
      itemId: json['itemId'] ?? '',
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      startDate: _parseDate(json['startDate']),
      endDate: _parseDate(json['endDate']),
      quantity: int.tryParse(json['quantity']?.toString() ?? '1') ?? 1,
      people: int.tryParse(json['people']?.toString() ?? '1') ?? 1,
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0,
      currency: json['currency'] ?? 'USD',
      status: json['status'] ?? 'pending',
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
      meta: Map<String, dynamic>.from(json['meta'] ?? const {}),
  userPhone: json['userPhone'],
  userEmail: json['userEmail'],
  notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'type': reservationTypeToString(type),
    'itemId': itemId,
    'title': title,
    'subtitle': subtitle,
    'imageUrl': imageUrl,
    'startDate': startDate.toIso8601String(),
    'endDate': endDate.toIso8601String(),
    'quantity': quantity,
    'people': people,
    'price': price,
    'currency': currency,
    'status': status,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'meta': meta,
  if (userPhone != null) 'userPhone': userPhone,
  if (userEmail != null) 'userEmail': userEmail,
  if (notes != null && notes!.trim().isNotEmpty) 'notes': notes,
  };

  ReservationModel copyWith({
    String? id,
    String? userId,
    ReservationType? type,
    String? itemId,
    String? title,
    String? subtitle,
    String? imageUrl,
    DateTime? startDate,
    DateTime? endDate,
    int? quantity,
    int? people,
    double? price,
    String? currency,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? meta,
  String? userPhone,
  String? userEmail,
  String? notes,
  }) => ReservationModel(
    id: id ?? this.id,
    userId: userId ?? this.userId,
    type: type ?? this.type,
    itemId: itemId ?? this.itemId,
    title: title ?? this.title,
    subtitle: subtitle ?? this.subtitle,
    imageUrl: imageUrl ?? this.imageUrl,
    startDate: startDate ?? this.startDate,
    endDate: endDate ?? this.endDate,
    quantity: quantity ?? this.quantity,
    people: people ?? this.people,
    price: price ?? this.price,
    currency: currency ?? this.currency,
    status: status ?? this.status,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
    meta: meta ?? this.meta,
  userPhone: userPhone ?? this.userPhone,
  userEmail: userEmail ?? this.userEmail,
  notes: notes ?? this.notes,
  );

  static DateTime _parseDate(dynamic v) {
    if (v == null) return DateTime.now();
    if (v is Timestamp) return v.toDate();
    return DateTime.tryParse(v.toString()) ?? DateTime.now();
  }
}
