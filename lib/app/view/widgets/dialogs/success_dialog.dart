import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:icons_plus/icons_plus.dart';

class SuccessDialog {
  static void show(String? message) {
    // Close any existing dialogs first to ensure only one message is shown
    if (Get.isDialogOpen ?? false) {
      Get.back();
    }
    
    Get.dialog(
      AlertDialog(
        backgroundColor: Colors.green[50],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.r),
          side: const BorderSide(
            color: Colors.green,
            width: 1.5,
          ),
        ),
        contentPadding: EdgeInsets.all(20.w),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Bootstrap.check_circle_fill,
              color: Colors.green[600],
              size: 40.sp,
            ),
            SizedBox(height: 16.h),
            Text(
              message ?? '',
              style: TextStyle(
                color: Colors.green[800],
                fontSize: 14.sp,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20.h),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Get.back();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green[600],
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 12.h),
                ),
                child: Text(
                  "understand".tr,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13.sp,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      barrierDismissible: false,
    );
  }
}
