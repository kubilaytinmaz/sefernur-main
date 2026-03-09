import 'package:get/get.dart';

import '../../controllers/notification/notification_controller.dart';
import '../../data/repositories/notification/notification_repository.dart';
import '../../data/services/auth/auth_service.dart';

class NotificationBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<NotificationRepository>()) {
      Get.lazyPut<NotificationRepository>(() => NotificationRepository(), fenix: true);
    }
    if (!Get.isRegistered<NotificationController>()) {
      Get.lazyPut<NotificationController>(() => NotificationController(
        repository: Get.find<NotificationRepository>(),
        authService: Get.find<AuthService>(),
      ), fenix: true);
    }
  }
}
