import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';

/// Handles CRUD operations for reviews stored in a single top-level collection:
/// reviews (fields: targetType, targetId, userId, rating, comment, status, createdAt, updatedAt, ...)
/// Other collections (hotels, cars, transfers, guides, tours) hold aggregate fields (rating, reviewCount).
/// This design simplifies querying & moderation: all reviews are centralized.
class ReviewRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  CollectionReference<Map<String,dynamic>> get _col => _firestore.collection('reviews');

  Future<String> addReview({
    required String targetType, // hotel|car|transfer|guide|tour
    required String targetId,
    required String userId,
    required double rating,
    required String comment,
    Map<String, dynamic>? extra,
  }) async {
    final now = DateTime.now().toIso8601String();
    if (_mapTypeToCollection(targetType) == null) {
      throw Exception('Unknown targetType: $targetType');
    }
    final ref = await _col.add({
      'targetType': targetType,
  // legacy compatibility (older docs used 'type')
  'type': targetType,
      'targetId': targetId,
      'userId': userId,
      'rating': rating,
      'comment': comment,
      'status': 'pending',
      'createdAt': now,
      'updatedAt': now,
      ...?extra,
    });
    return ref.id;
  }

  Future<void> updateReview({
    required String targetType,
    required String targetId,
    required String reviewId,
    double? rating,
    String? comment,
    String? status,
  }) async {
    if (_mapTypeToCollection(targetType) == null) throw Exception('Unknown targetType: $targetType');
    final Map<String, dynamic> update = {
      'updatedAt': DateTime.now().toIso8601String(),
    };
    if (rating != null) update['rating'] = rating;
    if (comment != null) update['comment'] = comment;
    if (status != null) update['status'] = status;
    await _col.doc(reviewId).update(update);
  }

  Future<void> deleteReview({
    required String targetType,
    required String targetId,
    required String reviewId,
  }) async {
    if (_mapTypeToCollection(targetType) == null) throw Exception('Unknown targetType: $targetType');
    await _col.doc(reviewId).delete();
  }

  /// Change status (pending -> published / rejected) or update rating/comment
  Future<void> moderateReview({
    required String targetType,
    required String targetId,
    required String reviewId,
    required String status, // published | rejected | pending
    String? moderatorId,
  }) async {
    if (_mapTypeToCollection(targetType) == null) throw Exception('Unknown targetType: $targetType');
    final now = DateTime.now().toIso8601String();
    await _col.doc(reviewId).update({
      'status': status,
      'moderatedAt': now,
      if (moderatorId != null) 'moderatorId': moderatorId,
      'updatedAt': now,
    });
  }

  /// List reviews one-shot (optionally filter by status)
  Future<List<Map<String, dynamic>>> getTargetReviews({
    required String targetType,
    required String targetId,
    String? status, // pending | published | rejected
    int? limit,
  }) async {
    if (_mapTypeToCollection(targetType) == null) return [];
    final List<Map<String,dynamic>> collected = [];

    Future<Query> buildQuery(String field) async {
      Query q = _col
          .where(field, isEqualTo: targetType)
          .where('targetId', isEqualTo: targetId)
          .orderBy('createdAt', descending: true);
      if (status != null && status.isNotEmpty && status != 'all') {
        q = q.where('status', isEqualTo: status.toLowerCase());
      }
      if (limit != null) q = q.limit(limit);
      return q;
    }

    Future<List<Map<String,dynamic>>> run(Query q) async {
      final snap = await q.get();
      return snap.docs.map((d){
        final raw = d.data();
        final Map<String,dynamic> data = raw is Map<String,dynamic> ? {...raw} : <String,dynamic>{};
        data['id'] = d.id;
        return data;
      }).toList();
    }

    // Primary query (new schema)
    try {
      final primaryQ = await buildQuery('targetType');
      collected.addAll(await run(primaryQ));
    } on FirebaseException catch(e) {
      // Fallback if missing composite index for (targetType,targetId,createdAt)
      if (e.code == 'failed-precondition') {
        Query q = _col
            .where('targetType', isEqualTo: targetType)
            .where('targetId', isEqualTo: targetId);
        if (status != null && status.isNotEmpty && status != 'all') {
          q = q.where('status', isEqualTo: status.toLowerCase());
        }
        if (limit != null) q = q.limit(limit);
        collected.addAll(await run(q));
      } else {
        rethrow;
      }
    }

    // Legacy fallback (older docs may have 'type' instead of 'targetType')
    if (collected.isEmpty) {
      try {
        final legacyQ = await buildQuery('type');
        final legacy = await run(legacyQ);
        if (legacy.isNotEmpty) {
          // Opportunistic migration: add missing targetType
            for (final m in legacy) {
              if (m['targetType'] == null) {
                _col.doc(m['id']).update({'targetType': targetType});
              }
            }
          collected.addAll(legacy);
        }
      } catch(_) {/* ignore */}
    }

    return collected;
  }

  /// Recompute aggregate (average rating & count) from PUBLISHED reviews only and write to parent document
  Future<void> recomputeAggregates({
    required String targetType,
    required String targetId,
  }) async {
  final collection = _mapTypeToCollection(targetType);
  if (collection == null) return;
  final reviewsSnap = await _col
    .where('targetType', isEqualTo: targetType)
    .where('targetId', isEqualTo: targetId)
    .where('status', isEqualTo: 'published')
    .get();
    if (reviewsSnap.docs.isEmpty) {
      await _firestore.collection(collection).doc(targetId).update({
        'rating': 0.0,
        'reviewCount': 0,
        'updatedAt': DateTime.now().toIso8601String(),
      });
      return;
    }
    double sum = 0;
    int count = 0;
    for (final d in reviewsSnap.docs) {
      final r = d.data()['rating'];
      if (r is num) {
        sum += r.toDouble();
        count++;
      } else if (r != null) {
        final parsed = double.tryParse(r.toString());
        if (parsed != null) {
          sum += parsed;
          count++;
        }
      }
    }
    final avg = count == 0 ? 0.0 : double.parse((sum / count).toStringAsFixed(2));
    await _firestore.collection(collection).doc(targetId).update({
      'rating': avg,
      'reviewCount': count,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  /// Stream reviews for a target (optionally only published)
  Stream<List<Map<String, dynamic>>> streamTargetReviews({
    required String targetType,
    required String targetId,
    bool onlyPublished = true,
  }) {
    if (_mapTypeToCollection(targetType) == null) return const Stream.empty();
    // Remove orderBy to avoid required composite index; we'll sort client-side by createdAt (ISO string) desc.
    Query q = _col
        .where('targetType', isEqualTo: targetType)
        .where('targetId', isEqualTo: targetId);
    if (onlyPublished) q = q.where('status', isEqualTo: 'published');
    return q.snapshots().map((snap) {
      final list = snap.docs.map((d) {
        final raw = d.data();
        final data = raw is Map<String, dynamic> ? {...raw} : <String, dynamic>{};
        data['id'] = d.id;
        return data;
      }).toList();
      list.sort((a, b) => (b['createdAt'] ?? '').toString().compareTo((a['createdAt'] ?? '').toString()));
      return list;
    });
  }

  /// Manual migration helper: copy `type` to `targetType` where missing for a target.
  Future<int> migrateLegacyForTarget({required String targetType, required String targetId}) async {
    final snap = await _col
        .where('type', isEqualTo: targetType)
        .where('targetId', isEqualTo: targetId)
        .get();
    int updated = 0;
    for (final d in snap.docs) {
      final data = d.data();
      if (data['targetType'] == null) {
        await d.reference.update({'targetType': targetType});
        updated++;
      }
    }
    return updated;
  }

  /// Stream recently created published reviews globally (client sorts by rating desc then createdAt desc)
  Stream<List<Map<String,dynamic>>> streamPublishedReviews({int limit = 200}) {
    Query q = _col.where('status', isEqualTo: 'published').orderBy('createdAt', descending: true).limit(limit);
    return q.snapshots().map((snap){
      final list = snap.docs.map((d){
        final raw = d.data();
        final data = raw is Map<String,dynamic> ? {...raw} : <String,dynamic>{};
        data['id'] = d.id;
        return data;
      }).toList();
      // Sort by rating desc then createdAt desc (ISO strings compare lexicographically)
      list.sort((a,b){
        final ar = (a['rating'] is num) ? (a['rating'] as num).toDouble() : double.tryParse(a['rating']?.toString() ?? '') ?? 0;
        final br = (b['rating'] is num) ? (b['rating'] as num).toDouble() : double.tryParse(b['rating']?.toString() ?? '') ?? 0;
        final cmp = br.compareTo(ar);
        if (cmp != 0) return cmp;
        return (b['createdAt'] ?? '').toString().compareTo((a['createdAt'] ?? '').toString());
      });
      return list;
    });
  }

  /// Stream a user's reviews (optionally filter by type and/or only published). Avoids orderBy to reduce index requirements; sorts client-side.
  Stream<List<Map<String, dynamic>>> streamUserReviews(
    String userId, {
    String? targetType,
    bool onlyPublished = false,
  }) {
    Query q = _col.where('userId', isEqualTo: userId);
    if (targetType != null) q = q.where('targetType', isEqualTo: targetType);
    if (onlyPublished) q = q.where('status', isEqualTo: 'published');
    return q.snapshots().map((snap) {
      final list = snap.docs.map((d){
        final raw = d.data();
        final Map<String,dynamic> data = raw is Map<String,dynamic> ? {...raw} : <String,dynamic>{};
        data['id'] = d.id;
        return data;
      }).toList();
      // Sort by createdAt desc if present
      list.sort((a,b)=> (b['createdAt'] ?? '').toString().compareTo((a['createdAt'] ?? '').toString()));
      return list;
    });
  }

  String? _mapTypeToCollection(String type) {
    switch (type) {
      case 'hotel':
        return 'hotels';
      case 'car':
        return 'cars';
      case 'transfer':
        return 'transfers';
      case 'guide':
        return 'guides';
      case 'tour':
        return 'tours';
      default:
        return null;
    }
  }
}
