import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import '../../../data/services/services.dart';
import '../../themes/theme.dart';

class PageRegion extends StatelessWidget {
  const PageRegion({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) {
    var themeService = Get.find<ThemeService>();
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        systemNavigationBarDividerColor: Colors.transparent,
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: themeService.isDarkMode.value
          ? Platform.isAndroid
            ? Brightness.light
            : Brightness.dark
          : Platform.isAndroid
            ? Brightness.dark
            : Brightness.light,
        statusBarBrightness: themeService.isDarkMode.value
          ? Platform.isAndroid
           ? Brightness.light
            : Brightness.dark
          : Platform.isAndroid
            ? Brightness.dark
            : Brightness.light,
        systemNavigationBarColor: AppColors.surface,
        systemNavigationBarIconBrightness: themeService.isDarkMode.value
          ? Platform.isAndroid
            ? Brightness.light
            : Brightness.dark
          : Platform.isAndroid
            ? Brightness.dark
            : Brightness.light,
      ),
      child: child
    );
  }
}
