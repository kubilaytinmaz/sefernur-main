import 'dart:async';

import 'package:get/get.dart';

import '../../data/models/notification/notification_model.dart';
import '../../data/repositories/notification/notification_repository.dart';
import '../../data/services/auth/auth_service.dart';

class NotificationController extends GetxController {
  final NotificationRepository repository;
  final AuthService authService;

  NotificationController({required this.repository, required this.authService});

  final notifications = <NotificationModel>[].obs;
  final unreadCount = 0.obs;
  StreamSubscription? _sub;
  final loading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _bindStream();
  }

  void _bindStream() {
    final userId = authService.getCurrentUserAuthUid();
    if (userId.isEmpty) {
      // No authenticated user -> stop loading so empty UI can show
      _sub?.cancel();
      notifications.clear();
      unreadCount.value = 0;
      loading.value = false;
      return;
    }
    _sub?.cancel();
    loading.value = true;
    // Fallback: if no snapshot arrives (network / rules delay) stop skeleton after 6s
    Future.delayed(const Duration(seconds: 6), () {
      if (loading.value && notifications.isEmpty) {
        loading.value = false;
      }
    });
    _sub = repository.streamUserNotifications(userId).listen((list) {
      notifications.assignAll(list);
      unreadCount.value = list.where((n) => !n.read).length;
      loading.value = false;
    });
  }

  Future<void> refreshNotifications() async { _bindStream(); }

  Future<void> markAllRead() async {
    final userId = authService.getCurrentUserAuthUid();
    if (userId.isEmpty) return;
    await repository.markAllRead(userId);
  }

  Future<void> markRead(String id) async { await repository.markRead(id); }

  @override
  void onClose() {
    _sub?.cancel();
    super.onClose();
  }
}
