import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/reservation/reservation_model.dart';

class ReservationRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'reservations';

  Future<String> create(ReservationModel reservation) async {
    final data = reservation.toJson();
    data.remove('id');
  // Sunucu tarafında zaman damgaları garanti altına alın (client manipülasyonuna karşı)
  data['createdAt'] = (data['createdAt'] ?? DateTime.now().toIso8601String());
  data['updatedAt'] = DateTime.now().toIso8601String();
    final doc = await _firestore.collection(_collection).add(data);
    return doc.id;
  }

  Future<void> update(String id, ReservationModel reservation) async {
    final data = reservation.toJson();
    data['updatedAt'] = DateTime.now().toIso8601String();
    await _firestore.collection(_collection).doc(id).update(data);
  }

  Future<void> softCancel(String id) async {
    await _firestore.collection(_collection).doc(id).update({
      'status': 'cancelled',
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> updateStatus(String id, String status, {Map<String, dynamic>? extra}) async {
    await _firestore.collection(_collection).doc(id).update({
      'status': status,
      if (extra != null) ...extra,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> updateFields(String id, Map<String, dynamic> fields) async {
    await _firestore.collection(_collection).doc(id).update({
      ...fields,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }

  Future<ReservationModel?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (!doc.exists) return null;
    return ReservationModel.fromJson(doc.data()!, doc.id);
  }

  Future<List<ReservationModel>> getUserReservations(String userId, {ReservationType? type}) async {
    Query query = _firestore.collection(_collection).where('userId', isEqualTo: userId);
    if (type != null) {
      query = query.where('type', isEqualTo: reservationTypeToString(type));
    }
    final snap = await query.orderBy('startDate', descending: true).get();
    return snap.docs.map((d) => ReservationModel.fromJson(d.data() as Map<String, dynamic>, d.id)).toList();
  }

  Stream<List<ReservationModel>> streamUserReservations(String userId) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .orderBy('startDate', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((d) => ReservationModel.fromJson(d.data(), d.id))
            .toList());
  }

  /// Bütün rezervasyonları dinler (Admin için). İleri seviye filtreler client tarafında uygulanır.
  Stream<List<ReservationModel>> streamAll() {
    return _firestore
        .collection(_collection)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => ReservationModel.fromJson(d.data(), d.id))
            .toList());
  }

  Future<List<ReservationModel>> getAll({String? status, ReservationType? type}) async {
    Query q = _firestore.collection(_collection).orderBy('createdAt', descending: true);
    if (status != null) q = q.where('status', isEqualTo: status);
    if (type != null) q = q.where('type', isEqualTo: reservationTypeToString(type));
    final snap = await q.get();
    return snap.docs.map((d) => ReservationModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }

  /// Aktif (pending veya confirmed) aynı item için var mı?
  Future<bool> hasActiveReservation({
    required String userId,
    required ReservationType type,
    required String itemId,
    bool includeConfirmed = true,
  }) async {
    final statuses = includeConfirmed ? ['pending', 'confirmed'] : ['pending'];
    // Firestore 'in' için index gerekebilir.
    final snap = await _firestore.collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('type', isEqualTo: reservationTypeToString(type))
        .where('itemId', isEqualTo: itemId)
        .where('status', whereIn: statuses)
        .limit(1)
        .get();
    return snap.docs.isNotEmpty;
  }
}
