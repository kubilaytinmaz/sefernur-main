import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../themes/theme.dart';

basicInputDecoration(BuildContext context, String hintText, IconData? icon) {
  return InputDecoration(
    filled: true,
    fillColor: AppColors.surfaceContainerLow,
    hintText: hintText,
    hintStyle: Get.theme.textTheme.labelMedium!.copyWith(
      color: context.theme.colorScheme.onSurface,
    ),
    contentPadding: EdgeInsets.symmetric(
      horizontal: AppSize.bSize16,
      vertical: AppSize.bSize8,
    ),
    prefixIcon: icon != null ? Icon(
      icon,
      color: context.theme.colorScheme.onSurface,
      size: AppSize.fSize16,
    ) : null,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSize.bSize100),
      borderSide: BorderSide.none,
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSize.bSize100),
      borderSide: BorderSide.none,
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSize.bSize100),
      borderSide: BorderSide.none,
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSize.bSize100),
      borderSide: BorderSide(
        color: context.theme.colorScheme.error,
        width: 0.5
      ),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSize.bSize100),
      borderSide: BorderSide(
        color: context.theme.colorScheme.error,
        width: 0.5
      ),
    ),
  );
}