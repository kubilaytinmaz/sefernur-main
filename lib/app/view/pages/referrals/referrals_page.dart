import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../controllers/referrals/referrals_controller.dart';
import 'referrals_content.dart';

class ReferralsPage extends GetView<ReferralsController> {
  const ReferralsPage({super.key});
  @override
  Widget build(BuildContext context) => const ReferralsContent();
}
