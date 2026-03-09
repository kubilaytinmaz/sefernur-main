import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:icons_plus/icons_plus.dart';

class FailureSnackBar {
  static void show(String? message){
    if (message == null || message.trim().isEmpty) return;

    _showWhenOverlayReady(() {
      try {
        Get.snackbar(
          '',
          message,
          backgroundColor: Colors.red[50],
          colorText: Colors.red[800],
          titleText: const SizedBox.shrink(),
          messageText: Text(
            message,
            style: TextStyle(
              color: Colors.red[800],
              fontSize: 13.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
          icon: Icon(
            Bootstrap.exclamation_circle_fill,
            color: Colors.red[600],
            size: 20.sp,
          ),
          snackPosition: SnackPosition.TOP,
          duration: const Duration(seconds: 3),
          borderColor: Colors.red,
          borderWidth: 1.5,
          mainButton: TextButton(
            onPressed: (){
              Get.closeCurrentSnackbar();
            },
            child: Text(
              "close".tr,
              style: TextStyle(
                color: Colors.red[700],
                fontWeight: FontWeight.bold,
                fontSize: 12.sp,
              ),
            )
          ),
          borderRadius: 12.r,
          margin: EdgeInsets.all(16.w),
          padding: EdgeInsets.all(16.w),
        );
      } catch (_) {
        // Snackbar atılamıyorsa sessizce yut (startup sırasında overlay hazır olmayabilir)
      }
    });
  }

  static void _showWhenOverlayReady(VoidCallback show, {int attempt = 0}) {
    final overlay = Get.key.currentState?.overlay;
    if (overlay != null && overlay.mounted && Get.overlayContext != null) {
      show();
      return;
    }

    if (attempt >= 10) return;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _showWhenOverlayReady(show, attempt: attempt + 1);
      });
    });
  }
}
