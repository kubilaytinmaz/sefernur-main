import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/search/popular_search_model.dart';

class PopularSearchRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'popular_searches';

  Stream<List<PopularSearchModel>> streamAll() {
    return _firestore
        .collection(_collection)
        .orderBy('sortOrder')
        .snapshots()
        .map(
          (q) => q.docs
              .map(
                (d) => PopularSearchModel.fromJson({...d.data(), 'id': d.id}),
              )
              .toList(),
        );
  }

  Stream<List<PopularSearchModel>> streamActive() {
    return _firestore
        .collection(_collection)
        .where('isActive', isEqualTo: true)
        .orderBy('sortOrder')
        .snapshots()
        .map(
          (q) => q.docs
              .map(
                (d) => PopularSearchModel.fromJson({...d.data(), 'id': d.id}),
              )
              .toList(),
        );
  }

  Future<void> save(PopularSearchModel model) async {
    final now = DateTime.now();
    if (model.id == null || model.id!.isEmpty) {
      await _firestore.collection(_collection).add(
            model
                .copyWith(
                  createdAt: now,
                  updatedAt: now,
                )
                .toJson(),
          );
      return;
    }

    await _firestore
        .collection(_collection)
        .doc(model.id)
        .update(model.copyWith(updatedAt: now).toJson());
  }

  Future<void> delete(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }
}
