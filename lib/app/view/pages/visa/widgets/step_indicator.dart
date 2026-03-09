import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/visa/visa_controller.dart';
import '../../../themes/theme.dart';

class VisaStepIndicator extends GetView<VisaController> {
  const VisaStepIndicator({super.key});
  String _title(int i) {
    switch (i) {
      case 0:
        return 'Kişisel\nBilgiler';
      case 1:
        return 'Seyahat\nBilgileri';
      case 2:
        return 'Belgeler';
      case 3:
        return 'Ödeme';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    const green = AppColors.medinaGreen40;
    return Obx(() {
      final current = controller.currentStep.value;
      final circleSize = 34.w;
      final connectorH = 4.h;
      return Stack(
        children: [
          // Connector line, aligned to circle centers
          Positioned(
            top: circleSize / 2 - connectorH / 2,
            left: 0,
            right: 0,
            child: Row(
              children: List.generate(3, (i) => Expanded(
                child: Container(
                  height: connectorH,
                  margin: EdgeInsets.symmetric(horizontal: 6.w),
                  decoration: BoxDecoration(
                    color: i < current ? green.withOpacity(.85) : (isDark ? Colors.grey[700] : Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(4.r),
                  ),
                ),
              )),
            ),
          ),
          // Circles + labels in a single layout so they stay centered together
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: List.generate(4, (index) {
              final isActive = index <= current;
              final isCurrent = index == current;
              return Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Circle
                    Container(
                      width: circleSize,
                      height: circleSize,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive ? green : (isDark ? Colors.grey[700] : Colors.grey.shade300),
                        boxShadow: isCurrent
                            ? [BoxShadow(color: green.withOpacity(.35), blurRadius: 10, spreadRadius: 1)]
                            : null,
                        border: Border.all(
                          color: isCurrent ? green : Colors.transparent,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            color: isActive ? Colors.white : (isDark ? Colors.grey[400] : Colors.grey.shade700),
                            fontWeight: FontWeight.w800,
                            fontSize: 14.sp,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: 8.h),
                    // Label (stays centered under circle)
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      child: Text(
                        _title(index),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11.sp,
                          height: 1.2,
                          fontWeight: FontWeight.w800,
                          color: isActive ? green : (isDark ? Colors.grey[500] : Colors.grey.shade600),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
        ],
      );
    });
  }
}
