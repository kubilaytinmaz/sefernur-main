import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/notification/notification_model.dart';

class NotificationRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  CollectionReference<Map<String,dynamic>> get _col => _firestore.collection('notifications');

  /// Stream notifications for a user ordered newest first
  Stream<List<NotificationModel>> streamUserNotifications(String userId, {int limit = 200}) {
    return _col
      .where('userId', isEqualTo: userId)
      .orderBy('createdAt', descending: true)
      .limit(limit)
      .snapshots()
      .map((snap) => snap.docs.map((d) => NotificationModel.fromDoc(d.id, d.data())).toList());
  }

  /// Mark single notification read
  Future<void> markRead(String id) => _col.doc(id).update({'read': true, 'updatedAt': DateTime.now().toIso8601String()});

  /// Mark all unread notifications read for user (batch)
  Future<int> markAllRead(String userId) async {
    final unread = await _col.where('userId', isEqualTo: userId).where('read', isEqualTo: false).limit(400).get();
    if (unread.docs.isEmpty) return 0;
    final batch = _firestore.batch();
    final now = DateTime.now().toIso8601String();
    for (final doc in unread.docs) {
      batch.update(doc.reference, {'read': true, 'updatedAt': now});
    }
    await batch.commit();
    return unread.docs.length;
  }

  /// Count unread (one-shot)
  Future<int> unreadCount(String userId) async {
    final snap = await _col.where('userId', isEqualTo: userId).where('read', isEqualTo: false).count().get();
    return snap.count ?? 0;
  }
}
