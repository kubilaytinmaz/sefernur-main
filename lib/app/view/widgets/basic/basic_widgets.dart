import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

import '../../themes/theme.dart';

Widget appBarTitleText(String title, BuildContext context) {
  return Text(
    title,
    style: Get.theme.textTheme.titleMedium!.copyWith(
      color: AppColors.surface,
    ),
  );
}

Widget loader() {
  return Center(
    child: LoadingAnimationWidget.threeArchedCircle(
      color: AppColors.primary,
      size: 24.sp,
    ),
  );
}