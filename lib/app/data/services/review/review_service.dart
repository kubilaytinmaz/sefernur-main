import 'dart:async';

import 'package:get/get.dart';

import '../../repositories/review/review_repository.dart';
import '../auth/auth_service.dart';

class ReviewService extends GetxService {
  late ReviewRepository _repo;
  late AuthService _auth;
  final isSubmitting = false.obs;
  final error = RxnString();
  final isModerating = false.obs;

  // Admin moderation buffers
  final adminTargetReviews =
      <Map<String, dynamic>>[].obs; // currently loaded target reviews
  final adminStatusFilter = 'pending'.obs; // pending|published|rejected|all

  // All reviews of current user and filtered view
  final all = <Map<String, dynamic>>[].obs;
  final filtered = <Map<String, dynamic>>[].obs;
  final activeFilter = 'all'.obs; // hotel|car|transfer|guide|tour|all
  final availableTypes =
      <String>{}.obs; // dynamic set of types user has published reviews for
  StreamSubscription? _sub;

  Stream<List<Map<String, dynamic>>> reviewsFor(
    String type,
    String targetId, {
    bool onlyPublished = true,
  }) {
    return _repo.streamTargetReviews(
      targetType: type,
      targetId: targetId,
      onlyPublished: onlyPublished,
    );
  }

  // Home page: highest rated among latest published reviews (pick top 7 by rating)
  Stream<List<Map<String, dynamic>>> topHomeReviewsStream() {
    return _repo.streamPublishedReviews(limit: 200).map((list) {
      // Already sorted rating desc then createdAt desc in repo helper, just take 7
      return list.take(7).toList();
    });
  }

  // See-all sheet: latest 50 published reviews (already rating-sorted, but requirement: last 50 based on created order after applying rating filter?)
  // Requirement: "son 50 yorum" after click -> interpret as latest 50 published by createdAt (not rating). We'll re-sort accordingly.
  Stream<List<Map<String, dynamic>>> latestPublishedReviews({int limit = 50}) {
    return _repo.streamPublishedReviews(limit: 300).map((list) {
      list.sort(
        (a, b) => (b['createdAt'] ?? '').toString().compareTo(
          (a['createdAt'] ?? '').toString(),
        ),
      );
      return list.take(limit).toList();
    });
  }

  Future<ReviewService> init() async {
    _repo = ReviewRepository();
    _auth = Get.find<AuthService>();
    _listenUserReviews();
    return this;
  }

  void _listenUserReviews() {
    final uid = _auth.getCurrentUserAuthUid();
    if (uid.isEmpty) return;
    _sub?.cancel();
    _sub = _repo
        .streamUserReviews(uid, onlyPublished: true)
        .listen(
          (list) {
            all.assignAll(list);
            // Rebuild dynamic type set
            availableTypes
              ..clear()
              ..addAll(
                list
                    .map((e) => (e['targetType'] ?? e['type'] ?? '').toString())
                    .where((s) => s.isNotEmpty),
              );
            _applyFilter();
          },
          onError: (e) {
            error.value = e.toString();
          },
        );
  }

  void setFilter(String key) {
    if (activeFilter.value == key) return;
    activeFilter.value = key;
    _applyFilter();
  }

  void _applyFilter() {
    final f = activeFilter.value;
    if (f == 'all') {
      filtered.assignAll(all);
    } else {
      filtered.assignAll(all.where((e) => (e['targetType'] ?? e['type']) == f));
    }
  }

  Future<void> addReview({
    required String type,
    required String targetId,
    required double rating,
    required String comment,
  }) async {
    try {
      final uid = _auth.getCurrentUserAuthUid();
      if (uid.isEmpty) return;
      isSubmitting.value = true;
      await _repo.addReview(
        targetType: type,
        targetId: targetId,
        userId: uid,
        rating: rating,
        comment: comment,
        extra: {'status': 'pending'},
      );
    } catch (e) {
      error.value = e.toString();
    } finally {
      isSubmitting.value = false;
    }
  }

  // ---------------- Admin moderation API ----------------
  Future<void> loadTargetReviews(String type, String targetId) async {
    try {
      final list = await _repo.getTargetReviews(
        targetType: type,
        targetId: targetId,
        status: adminStatusFilter.value,
      );
      adminTargetReviews.assignAll(list);
    } catch (e) {
      error.value = e.toString();
    }
  }

  void setAdminStatusFilter(String status, String type, String targetId) {
    if (adminStatusFilter.value == status) return;
    adminStatusFilter.value = status;
    loadTargetReviews(type, targetId);
  }

  Future<void> moderate({
    required String type,
    required String targetId,
    required String reviewId,
    required String status, // published | rejected
  }) async {
    try {
      isModerating.value = true;
      final moderatorId = _auth.getCurrentUserAuthUid();
      await _repo.moderateReview(
        targetType: type,
        targetId: targetId,
        reviewId: reviewId,
        status: status,
        moderatorId: moderatorId.isEmpty ? null : moderatorId,
      );
      // Recompute aggregates only if status published or changed from published
      await _repo.recomputeAggregates(targetType: type, targetId: targetId);
      await loadTargetReviews(type, targetId);
    } catch (e) {
      error.value = e.toString();
    } finally {
      isModerating.value = false;
    }
  }

  Future<void> deleteReview({
    required String type,
    required String targetId,
    required String reviewId,
  }) async {
    try {
      await _repo.deleteReview(
        targetType: type,
        targetId: targetId,
        reviewId: reviewId,
      );
      await _repo.recomputeAggregates(targetType: type, targetId: targetId);
      await loadTargetReviews(type, targetId);
    } catch (e) {
      error.value = e.toString();
    }
  }

  @override
  void onClose() {
    _sub?.cancel();
    super.onClose();
  }
}
