import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/promotion/promotion_model.dart';

class PromotionRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static const String _collection = 'promotions';

  CollectionReference<Map<String, dynamic>> get _ref => _firestore.collection(_collection);

  /// Tüm promosyonları stream olarak dinle
  Stream<List<PromotionModel>> streamAll() {
    return _ref
        .orderBy('priority', descending: false)
        .snapshots()
        .map((snap) => snap.docs.map((d) {
              final data = d.data();
              data['id'] = d.id;
              return PromotionModel.fromJson(data);
            }).toList());
  }

  /// Sadece aktif promosyonları getir
  Stream<List<PromotionModel>> streamActive() {
    return _ref
        .where('isActive', isEqualTo: true)
        .orderBy('priority', descending: false)
        .snapshots()
        .map((snap) {
          return snap.docs
              .map((d) {
                final data = d.data();
                data['id'] = d.id;
                return PromotionModel.fromJson(data);
              })
              .where((p) => p.isCurrentlyActive)
              .toList();
        });
  }

  /// Belirli bir hedefe (hotel, car, vb.) ait aktif promosyonları getir
  Stream<List<PromotionModel>> streamByTarget(PromotionTargetType target) {
    return _ref
        .where('isActive', isEqualTo: true)
        .where('targetType', isEqualTo: target.name)
        .orderBy('priority', descending: false)
        .snapshots()
        .map((snap) {
          return snap.docs
              .map((d) {
                final data = d.data();
                data['id'] = d.id;
                return PromotionModel.fromJson(data);
              })
              .where((p) => p.isCurrentlyActive)
              .toList();
        });
  }

  /// Tek seferlik getir
  Future<List<PromotionModel>> getByTarget(PromotionTargetType target) async {
    final snap = await _ref
        .where('isActive', isEqualTo: true)
        .where('targetType', isEqualTo: target.name)
        .orderBy('priority', descending: false)
        .get();
    return snap.docs
        .map((d) {
          final data = d.data();
          data['id'] = d.id;
          return PromotionModel.fromJson(data);
        })
        .where((p) => p.isCurrentlyActive)
        .toList();
  }

  /// Tek bir promosyon getir
  Future<PromotionModel?> getById(String id) async {
    final doc = await _ref.doc(id).get();
    if (!doc.exists) return null;
    final data = doc.data()!;
    data['id'] = doc.id;
    return PromotionModel.fromJson(data);
  }

  /// Yeni promosyon oluştur
  Future<String> create(PromotionModel model) async {
    final doc = await _ref.add(model.toJson());
    return doc.id;
  }

  /// Promosyon güncelle
  Future<void> update(String id, PromotionModel model) async {
    await _ref.doc(id).update(model.copyWith(updatedAt: DateTime.now()).toJson());
  }

  /// Promosyon sil
  Future<void> delete(String id) async {
    await _ref.doc(id).delete();
  }

  /// Aktiflik durumunu değiştir
  Future<void> toggleActive(String id, bool isActive) async {
    await _ref.doc(id).update({
      'isActive': isActive,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }
}
