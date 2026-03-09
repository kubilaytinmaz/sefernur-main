import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../controllers/splash/splash_controller.dart';
import '../../../utils/utils.dart';
import '../../themes/theme.dart';
import '../../widgets/widget.dart';

class SplashPage extends GetView<SplashController> {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark ? const Color(0xFF121212) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black;
    final subtitleColor = isDark ? Colors.grey.shade400 : AppColors.onSurfaceVariant;
    
    return PageRegion(
      child: Scaffold(
        body: Container(
          height: Get.height,
          width: Get.width,
          color: backgroundColor,
          child: Stack(
            children: [
              // Animated background elements
              Positioned(
                top: -100.h,
                right: -100.w,
                child: Container(
                  height: 200.h,
                  width: 200.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.medinaGreen40.withOpacity(isDark ? 0.15 : 0.08),
                  ),
                ),
              ),
              Positioned(
                bottom: 200.h,
                left: -80.w,
                child: Container(
                  height: 150.h,
                  width: 150.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.medinaGreen40.withOpacity(isDark ? 0.1 : 0.05),
                  ),
                ),
              ),
              // Main content - SafeArea eklendi
              SafeArea(
          bottom: false,
                child: SizedBox(
                  width: Get.width,
                  child: Column(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    // Üst boşluk
                    const Spacer(),
                    // Orta content
                    Expanded(
                      flex: 3,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Gradient brand container with centered text (icon removed)
                          Container(
                            width: 90.h,
                            height: 90.h,
                            decoration: const BoxDecoration(
                              image: DecorationImage(
                                image: AssetImage("assets/images/app_icon.png"),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          SizedBox(height: 8.h),
                          Text(
                            "Sefernur",
                            textAlign: TextAlign.center,
                            style: Get.textTheme.headlineMedium!.copyWith(
                              fontSize: 28.sp,
                              color: textColor,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Alt boşluk
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Padding(
                            padding: EdgeInsets.only(bottom: AppSize.height16),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  "powered by",
                                  style: Get.textTheme.labelMedium!.copyWith(
                                    color: subtitleColor,
                                    fontFamily: "Prelia",
                                  ),
                                ),
                                AppSize.vSpace8,
                                SvgPicture.asset(
                                  AssetPaths.eyexappLogo,
                                  height: AppSize.bSize16,
                                  colorFilter: ColorFilter.mode(
                                    AppColors.medinaGreen40,
                                    BlendMode.srcIn,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                )
              ),
            ],
          ),
        ),
      ),
    );
  }
}
