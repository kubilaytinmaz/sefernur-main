import 'package:get/get.dart';

import '../../controllers/controllers.dart';
import '../../data/services/services.dart';

class SplashBinding extends Bindings {
  @override
  void dependencies() {
    // ConnectivityService async olarak initialize edilecek
    Get.putAsync(() => ConnectivityService().init());
    
    // SplashController'ı hemen oluştur
    Get.put<SplashController>(SplashController());
  }
}