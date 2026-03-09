import 'package:get/get.dart';

import '../../controllers/referrals/referrals_controller.dart';
import '../../data/services/referral/referral_service.dart';

class ReferralsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => ReferralService().init());
    Get.lazyPut(() => ReferralsController());
  }
}
