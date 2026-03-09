import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:icons_plus/icons_plus.dart';

class WarningSnackbar {
   static void show(String? message){
    Get.snackbar(
      '',
      message!,
      backgroundColor: Colors.orange[50],
      colorText: Colors.orange[800],
      titleText: const SizedBox.shrink(),
      messageText: Text(
        message,
        style: TextStyle(
          color: Colors.orange[800],
          fontSize: 13.sp,
          fontWeight: FontWeight.w500,
        ),
      ),
      icon: Icon(
        Bootstrap.exclamation_triangle_fill,
        color: Colors.orange[600],
        size: 20.sp,
      ),
      snackPosition: SnackPosition.TOP,
      duration: const Duration(seconds: 3),
      borderColor: Colors.orange,
      borderWidth: 1.5,
      mainButton: TextButton(
        onPressed: (){
          Get.closeCurrentSnackbar();
        }, 
        child: Text(
          "close".tr,
          style: TextStyle(
            color: Colors.orange[700],
            fontWeight: FontWeight.bold,
            fontSize: 12.sp,
          ),
        )
      ),
      borderRadius: 12.r,
      margin: EdgeInsets.all(16.w),
      padding: EdgeInsets.all(16.w),
    );
  }
}
