import 'package:get/get.dart';

import '../../controllers/auth/auth_controller.dart';

class AuthBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AuthController>(
      () => AuthController(),
      // Removed fenix flag to prevent recreation issues with state restoration
    );
  }
}
