import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/guide/guide_model.dart';

class GuideRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'guides';

  DateTime _safeDate(dynamic value) {
    if (value is Timestamp) return value.toDate();
    if (value is String) return DateTime.tryParse(value) ?? DateTime(1970);
    return DateTime(1970);
  }

  Future<List<GuideModel>> getAll() async {
    final snap = await _firestore.collection(_collection).get();
    final list = snap.docs.map((d) {
      final data = d.data();
      final normalized = {
        ...data,
        'id': d.id,
        if (data['createdAt'] != null)
          'createdAt': _safeDate(data['createdAt']).toIso8601String(),
        if (data['updatedAt'] != null)
          'updatedAt': _safeDate(data['updatedAt']).toIso8601String(),
      };
      return GuideModel.fromJson(normalized);
    }).toList();
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<void> add(GuideModel g) async {
    await _firestore.collection(_collection).add(g.toJson());
  }

  Future<void> update(GuideModel g) async {
    if (g.id == null) return; // ignore
    await _firestore.collection(_collection).doc(g.id).update(g.toJson());
  }

  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }

  Future<void> updateAvailability(String id, String date, GuideDailyAvailability a) async {
    await _firestore.collection(_collection).doc(id).update({
      'availability.$date': a.toJson(),
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> updateAvailabilityBulk(String id, Map<String, GuideDailyAvailability> map) async {
    final data = <String, dynamic>{'updatedAt': DateTime.now().toIso8601String()};
    map.forEach((k, v) => data['availability.$k'] = v.toJson());
    await _firestore.collection(_collection).doc(id).update(data);
  }
}
