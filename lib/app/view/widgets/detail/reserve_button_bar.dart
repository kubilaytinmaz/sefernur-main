import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

class ReserveButtonBar extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;
  const ReserveButtonBar({
    super.key,
    this.onPressed,
    this.label = 'Rezerve Et',
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgColor = isDark
        ? theme.colorScheme.surfaceContainerHigh
        : Colors.white;
    final borderColor = isDark ? Colors.grey[700]! : Colors.grey.shade200;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(20.w, 14.h, 20.w, Get.mediaQuery.viewPadding.bottom),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.06),
                  blurRadius: 32,
                  spreadRadius: -4,
                  offset: const Offset(0, -6),
                ),
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 8,
                  offset: const Offset(0, -1),
                ),
              ],
        border: Border(top: BorderSide(color: borderColor, width: 1)),
      ),
      child: SafeArea(
        bottom: false,
        top: false,
        minimum: EdgeInsets.only(bottom: 8.h),
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.primaryColor,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.r),
              ),
              padding: EdgeInsets.symmetric(vertical: 18.h),
              textStyle: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w700,
                letterSpacing: .3,
              ),
            ),
            child: Text(label),
          ),
        ),
      ),
    );
  }
}
