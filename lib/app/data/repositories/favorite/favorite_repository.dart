import 'package:cloud_firestore/cloud_firestore.dart';

/// Central favorites collection similar to reviews architecture.
/// Collection: favorites
/// Fields: userId, targetType (hotel|car|transfer|guide|tour|campaign), targetId, createdAt, meta{ title, image, subtitle, rating }
/// Doc ID pattern: <userId>_<targetType>_<targetId> (ensures uniqueness & O(1) lookup)
class FavoriteRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  CollectionReference<Map<String,dynamic>> get _col => _firestore.collection('favorites');

  String docId(String userId, String targetType, String targetId) => '${userId}_${targetType}_$targetId';

  Future<void> addFavorite({
    required String userId,
    required String targetType,
    required String targetId,
    Map<String,dynamic>? meta,
  }) async {
    final id = docId(userId, targetType, targetId);
    final now = DateTime.now().toIso8601String();
    await _col.doc(id).set({
      'userId': userId,
      'targetType': targetType,
      'targetId': targetId,
      'createdAt': now,
      'meta': meta ?? {},
    }, SetOptions(merge: true));
  }

  Future<void> updateMeta({
    required String userId,
    required String targetType,
    required String targetId,
    required Map<String,dynamic> meta,
  }) async {
    final id = docId(userId, targetType, targetId);
    await _col.doc(id).set({'meta': meta, 'updatedAt': DateTime.now().toIso8601String()}, SetOptions(merge: true));
  }

  Future<void> removeFavorite({
    required String userId,
    required String targetType,
    required String targetId,
  }) async {
    final id = docId(userId, targetType, targetId);
    await _col.doc(id).delete();
  }

  Future<bool> isFavorited({
    required String userId,
    required String targetType,
    required String targetId,
  }) async {
    final id = docId(userId, targetType, targetId);
    final doc = await _col.doc(id).get();
    return doc.exists;
  }

  Stream<List<Map<String,dynamic>>> streamUserFavorites(String userId) {
    return _col.where('userId', isEqualTo: userId).snapshots().map((snap)=> snap.docs.map((d){
      final data = d.data();
      return {...data, 'docId': d.id};
    }).toList());
  }
}
