import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/address/address_model.dart';
import '../../models/transfer/transfer_model.dart';

class TransferRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'transfers';

  DateTime _safeDate(dynamic value) {
    if (value is Timestamp) return value.toDate();
    if (value is String) return DateTime.tryParse(value) ?? DateTime(1970);
    return DateTime(1970);
  }

  List<TransferModel> _sortByCreatedDesc(List<TransferModel> list) {
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<List<TransferModel>> getAll() async {
    final plainSnapshot = await _firestore.collection(_collection).get();
    final list = plainSnapshot.docs
        .map((d) {
          final data = d.data();
          final normalized = {
            ...data,
            'id': d.id,
            if (data['createdAt'] != null)
              'createdAt': _safeDate(data['createdAt']).toIso8601String(),
            if (data['updatedAt'] != null)
              'updatedAt': _safeDate(data['updatedAt']).toIso8601String(),
          };
          return TransferModel.fromJson(normalized);
        })
        .toList();
    return _sortByCreatedDesc(list);
  }

  // Realtime stream of all transfers (admin or dynamic UI updates)
  Stream<List<TransferModel>> streamAll(){
    return _firestore.collection(_collection)
      .snapshots()
      .map((q) {
        final list = q.docs
            .map((d) {
              final data = d.data();
              final normalized = {
                ...data,
                'id': d.id,
                if (data['createdAt'] != null)
                  'createdAt': _safeDate(data['createdAt']).toIso8601String(),
                if (data['updatedAt'] != null)
                  'updatedAt': _safeDate(data['updatedAt']).toIso8601String(),
              };
              return TransferModel.fromJson(normalized);
            })
            .toList();
        return _sortByCreatedDesc(list);
      });
  }

  Future<void> add(TransferModel transfer) async {
    await _firestore.collection(_collection).add(transfer.toJson());
  }

  Future<void> update(TransferModel transfer) async {
    if (transfer.id == null) return;
    await _firestore.collection(_collection).doc(transfer.id).update(transfer.toJson());
  }

  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }

  Future<void> updateAvailability(String id, String date, TransferDailyAvailability availability) async {
    await _firestore.collection(_collection).doc(id).update({
      'availability.$date': availability.toJson(),
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> updateAvailabilityBulk(String id, Map<String, TransferDailyAvailability> map) async {
    final data = <String, dynamic>{'updatedAt': DateTime.now().toIso8601String()};
    map.forEach((key, value) { data['availability.$key'] = value.toJson(); });
    await _firestore.collection(_collection).doc(id).update(data);
  }

  Future<List<TransferModel>> searchAvailable({
    required String date,
    required int passengers,
    String? fromQuery,
    String? toQuery,
    String? vehicleType,
  }) async {
    final all = await getAll();
    return all.where((t) => _matches(t, date, passengers, fromQuery, toQuery, vehicleType)).toList();
  }

  bool _matches(TransferModel t, String date, int passengers, String? fromQuery, String? toQuery, String? vehicleType) {
    if (!t.isActive) return false;
    if (passengers > t.capacity) return false;
    if (vehicleType != null && vehicleType.isNotEmpty && t.vehicleType != vehicleType) return false;
    bool containsAddress(AddressModel addr, String q) {
      final lower = q.toLowerCase();
      return addr.address.toLowerCase().contains(lower) ||
          addr.city.toLowerCase().contains(lower) ||
          addr.state.toLowerCase().contains(lower) ||
          addr.country.toLowerCase().contains(lower);
    }
    if (fromQuery != null && fromQuery.isNotEmpty && !containsAddress(t.fromAddress, fromQuery)) return false;
    if (toQuery != null && toQuery.isNotEmpty && !containsAddress(t.toAddress, toQuery)) return false;
    if (t.availability.isNotEmpty) {
      final a = t.availability[date];
      if (a != null && (!a.isAvailable || a.availableSeats < passengers)) {
        return false;
      }
    }
    return true;
  }
}
