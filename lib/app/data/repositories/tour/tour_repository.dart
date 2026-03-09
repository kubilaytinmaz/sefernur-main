import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/tour/tour_model.dart';

class TourRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'tours';

  Future<List<TourModel>> getAll() async {
    final snap = await _firestore.collection(_collection).orderBy('createdAt', descending: true).get();
    return snap.docs.map((d) => TourModel.fromJson({...d.data(), 'id': d.id})).toList();
  }

  Stream<List<TourModel>> activeStream(){
    return _firestore.collection(_collection)
      .where('isActive', isEqualTo: true)
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((q)=> q.docs.map((d)=> TourModel.fromJson({...d.data(), 'id': d.id})).toList());
  }

  // Admin paneli için tüm turların canlı takibi
  Stream<List<TourModel>> streamAll(){
    return _firestore.collection(_collection)
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((q)=> q.docs.map((d)=> TourModel.fromJson({...d.data(), 'id': d.id})).toList());
  }

  Future<void> add(TourModel t) async {
    await _firestore.collection(_collection).add(t.toJson());
  }

  Future<void> update(TourModel t) async {
    if (t.id == null) return;
    await _firestore.collection(_collection).doc(t.id).update(t.toJson());
  }

  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }

  Future<void> updateAvailability(String id, String date, TourDailyAvailability a) async {
    await _firestore.collection(_collection).doc(id).update({
      'availability.$date': a.toJson(),
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> updateAvailabilityBulk(String id, Map<String, TourDailyAvailability> map) async {
    final data = <String, dynamic>{'updatedAt': DateTime.now().toIso8601String()};
    map.forEach((k, v) => data['availability.$k'] = v.toJson());
    await _firestore.collection(_collection).doc(id).update(data);
  }
}
