import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/onboarding/onboarding_controller.dart';
import '../../themes/theme.dart';

class OnboardingPage extends GetView<OnboardingController> {
  const OnboardingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // PageView with full-screen images
          PageView.builder(
            controller: controller.pageController,
            onPageChanged: controller.onPageChanged,
            itemCount: controller.onboardingItems.length,
            itemBuilder: (context, index) {
              final item = controller.onboardingItems[index];
              return Stack(
                fit: StackFit.expand,
                children: [
                  // Background image
                  Image.asset(
                    item.imagePath,
                    fit: BoxFit.cover,
                  ),
                  // Gradient overlay for readability
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.05),
                          (item.overlayColor ?? AppColors.primary).withOpacity(0.35),
                          Colors.black.withOpacity(0.65),
                        ],
                      ),
                    ),
                  ),
                  // Content
                  SafeArea(
          bottom: false,
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 24.h),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top bar
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                width: 44.w,
                                height: 44.w,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(14.r),
                                  border: Border.all(color: Colors.white24),
                                ),
                                child: IconButton(
                                  onPressed: () => controller.toggleLanguage(),
                                  icon: Icon(Icons.language, size: 22.sp, color: Colors.white),
                                  padding: EdgeInsets.zero,
                                ),
                              ),
                              TextButton(
                                onPressed: controller.skipOnboarding,
                                child: Text(
                                  'Atla',
                                  style: Get.textTheme.bodyMedium!.copyWith(
                                    color: Colors.white.withOpacity(0.85),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          // Indicators
                          Obx(() => Row(
                                children: List.generate(
                                  controller.onboardingItems.length,
                                  (dotIndex) => AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    margin: EdgeInsets.only(right: 6.w),
                                    height: 6.h,
                                    width: controller.currentPage.value == dotIndex ? 28.w : 8.w,
                                    decoration: BoxDecoration(
                                      color: controller.currentPage.value == dotIndex
                                          ? Colors.white
                                          : Colors.white.withOpacity(0.4),
                                      borderRadius: BorderRadius.circular(4.r),
                                    ),
                                  ),
                                ),
                              )),
                          SizedBox(height: 20.h),
                          // Title
                          Text(
                            item.title,
                            style: Get.textTheme.headlineMedium!.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              height: 1.15,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withOpacity(0.4),
                                  offset: const Offset(0, 2),
                                  blurRadius: 6,
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 14.h),
                          // Description
                          Text(
                            item.description,
                            style: Get.textTheme.bodyLarge!.copyWith(
                              color: Colors.white.withOpacity(0.9),
                              height: 1.4,
                              fontWeight: FontWeight.w400,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withOpacity(0.45),
                                  offset: const Offset(0, 1),
                                  blurRadius: 4,
                                )
                              ],
                            ),
                          ),
                          SizedBox(height: 28.h),
                          // Buttons
                          Row(
                            children: [
                              // Use page index instead of reactive currentPage to avoid stale state issues
                              if (index > 0)
                                Expanded(
                                  child: OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.white,
                                      side: const BorderSide(color: Colors.white70),
                                      padding: EdgeInsets.symmetric(vertical: 14.h),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16.r),
                                      ),
                                      textStyle: Get.textTheme.labelLarge!.copyWith(fontWeight: FontWeight.w600),
                                    ),
                                    onPressed: controller.previousPage,
                                    child: const Text('Geri'),
                                  ),
                                ),
                              if (index > 0) SizedBox(width: 14.w),
                              Expanded(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    padding: EdgeInsets.symmetric(vertical: 14.h),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16.r),
                                    ),
                                    elevation: 0,
                                  ),
                                  onPressed: index == controller.onboardingItems.length - 1
                                      ? controller.completeOnboarding
                                      : controller.nextPage,
                                  child: Text(
                                    index == controller.onboardingItems.length - 1 ? 'Başlayalım' : 'İleri',
                                    style: Get.textTheme.labelLarge!.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
