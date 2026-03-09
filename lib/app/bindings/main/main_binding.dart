import 'package:get/get.dart';

import '../../controllers/controllers.dart';
import '../../controllers/notification/notification_controller.dart';
import '../../controllers/profile/profile_controller.dart';
import '../../controllers/referrals/referrals_controller.dart';
import '../../controllers/travels/travels_controller.dart';
import '../../controllers/visa/visa_controller.dart';
import '../../data/repositories/notification/notification_repository.dart';
import '../../data/services/auth/auth_service.dart';

class MainBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<MainController>(MainController(), permanent: true);
    Get.put<HomeController>(HomeController(), permanent: true);
    Get.put<SearchController>(SearchController(), permanent: true);
    Get.put<ReferralsController>(ReferralsController(), permanent: true);
    Get.put<TravelsController>(TravelsController(), permanent: true);
    Get.put<VisaController>(VisaController(), permanent: true);
    Get.put<ProfileController>(ProfileController(), permanent: true);
    // Global notification stream (badge always up to date)
    if (!Get.isRegistered<NotificationRepository>()) {
      Get.lazyPut<NotificationRepository>(
        () => NotificationRepository(),
        fenix: true,
      );
    }
    if (!Get.isRegistered<NotificationController>()) {
      Get.lazyPut<NotificationController>(
        () => NotificationController(
          repository: Get.find<NotificationRepository>(),
          authService: Get.find<AuthService>(),
        ),
        fenix: true,
      );
    }
  }
}
