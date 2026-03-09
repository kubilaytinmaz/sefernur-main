import 'reservation_model.dart';

/// Kolay ve okunabilir ReservationModel üretimi için builder.
class ReservationBuilder {
  ReservationType type;
  String userId;
  String itemId;
  String title;
  String subtitle;
  String imageUrl;
  DateTime startDate;
  DateTime endDate;
  int quantity; // geceler/günler/koltuk vb.
  int people;   // toplam kişi / pax
  double price; // toplam fiyat
  String currency;
  String? userPhone;
  String? userEmail;
  String? notes;
  final Map<String, dynamic> meta = {};

  ReservationBuilder({
    required this.type,
    required this.userId,
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
    this.userPhone,
    this.userEmail,
    this.notes,
  });

  ReservationBuilder addMeta(Map<String, dynamic> data){ meta.addAll(data); return this; }

  ReservationModel build(){
    if (price < 0) { throw Exception('Fiyat negatif olamaz'); }
    if (people <= 0) { throw Exception('Kişi sayısı 0 olamaz'); }
    if (startDate.isAfter(endDate)) { throw Exception('Başlangıç tarihi bitişten sonra olamaz'); }
    return ReservationModel(
      userId: userId,
      type: type,
      itemId: itemId,
      title: title,
      subtitle: subtitle,
      imageUrl: imageUrl,
      startDate: startDate,
      endDate: endDate,
      quantity: quantity,
      people: people,
      price: price,
      currency: currency,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      meta: Map<String,dynamic>.from(meta),
      userPhone: userPhone,
      userEmail: userEmail,
      notes: notes,
    );
  }
}
