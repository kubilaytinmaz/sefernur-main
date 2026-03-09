import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../theme.dart';

class AppLightTheme {
  static ThemeData light() {
    return theme(lightScheme());
  }

  static ThemeData theme(ColorScheme colorScheme) => ThemeData(
    useMaterial3: true,
    fontFamily: "Roboto",
    brightness: colorScheme.brightness,
    colorScheme: colorScheme,
    textTheme: textTheme.apply(
      bodyColor: colorScheme.onSurface,
      displayColor: colorScheme.onSurface,
    ),
    scaffoldBackgroundColor: colorScheme.surface,
    canvasColor: colorScheme.surface,
  );

  // Light tema için doğrudan renk değerlerini kullan
  static ColorScheme lightScheme() {
    return ColorScheme(
      brightness: Brightness.light,

      // Primary - yeşil tonlar
      primary: AppColors.medinaGreen40,
      onPrimary: AppColors.white,
      primaryContainer: AppColors.medinaGreen90,
      onPrimaryContainer: AppColors.medinaGreen10,

      // Secondary
      secondary: AppColors.medinaGreen40,
      onSecondary: AppColors.white,
      secondaryContainer: AppColors.medinaGreen90,
      onSecondaryContainer: AppColors.medinaGreen10,

      // Tertiary
      tertiary: AppColors.purple40,
      onTertiary: AppColors.white,
      tertiaryContainer: AppColors.purple90,
      onTertiaryContainer: AppColors.purple10,

      // Error
      error: AppColors.red40,
      onError: AppColors.white,
      errorContainer: AppColors.red90,
      onErrorContainer: AppColors.red10,

      // Surface - light modda beyaz/açık renkler
      surface: AppColors.white,
      onSurface: AppColors.grey10,
      onSurfaceVariant: AppColors.grey30,

      outline: AppColors.grey94,
      outlineVariant: AppColors.grey98,

      shadow: AppColors.black,
      scrim: AppColors.black,

      inverseSurface: AppColors.grey20,
      inversePrimary: AppColors.pink80,
      
      surfaceDim: AppColors.grey87,
      surfaceBright: AppColors.white,
      surfaceContainerLowest: AppColors.grey98,
      surfaceContainerLow: AppColors.grey96,
      surfaceContainer: AppColors.grey94,
      surfaceContainerHigh: AppColors.grey92,
      surfaceContainerHighest: AppColors.grey90,
    );
  }

  static final TextTheme textTheme = TextTheme(
    displayLarge: TextStyle(
      fontSize: 57.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: -0.25,
      color: AppColors.onSurface
    ),
    displayMedium: TextStyle(
      fontSize: 45.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0,
      color: AppColors.onSurface
    ),
    displaySmall: TextStyle(
      fontSize: 36.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0,
      color: AppColors.onSurface
    ),
    headlineLarge: TextStyle(
      fontSize: 32.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0,
      color: AppColors.onSurface
    ),
    headlineMedium: TextStyle(
      fontSize: 28.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0,
      color: AppColors.onSurface
    ),
    headlineSmall: TextStyle(
      fontSize: 24.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0,
      color: AppColors.onSurface
    ),
    titleLarge: TextStyle(
      fontSize: 22.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0,
      color: AppColors.onSurface
    ),
    titleMedium: TextStyle(
      fontSize: 16.sp,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.15,
      color: AppColors.onSurface
    ),
    titleSmall: TextStyle(
      fontSize: 14.sp,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.1,
      color: AppColors.onSurface
    ),
    bodyLarge: TextStyle(
      fontSize: 16.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.5,
      color: AppColors.onSurface
    ),
    bodyMedium: TextStyle(
      fontSize: 14.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.25,
      color: AppColors.onSurface
    ),
    bodySmall: TextStyle(
      fontSize: 12.sp,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.4,
      color: AppColors.onSurface
    ),
    labelLarge: TextStyle(
      fontSize: 14.sp,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.1,
      color: AppColors.onSurface
    ),
    labelMedium: TextStyle(
      fontSize: 12.sp,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
      color: AppColors.onSurface
    ),
    labelSmall: TextStyle(
      fontSize: 11.sp,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
      color: AppColors.onSurface
    ),
  );
}
