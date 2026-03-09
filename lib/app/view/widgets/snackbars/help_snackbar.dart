import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:icons_plus/icons_plus.dart';


class HelpSnackbar {
   static void show(String? message){
    Get.snackbar(
      '',
      message!,
      backgroundColor: Colors.blue[50],
      colorText: Colors.blue[800],
      titleText: const SizedBox.shrink(),
      messageText: Text(
        message,
        style: TextStyle(
          color: Colors.blue[800],
          fontSize: 13.sp,
          fontWeight: FontWeight.w500,
        ),
      ),
      icon: Icon(
        Bootstrap.info_circle_fill,
        color: Colors.blue[600],
        size: 20.sp,
      ),
      snackPosition: SnackPosition.TOP,
      duration: const Duration(seconds: 3),
      borderColor: Colors.blue,
      borderWidth: 1.5,
      mainButton: TextButton(
        onPressed: (){
          Get.closeCurrentSnackbar();
        }, 
        child: Text(
          "close".tr,
          style: TextStyle(
            color: Colors.blue[700],
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
