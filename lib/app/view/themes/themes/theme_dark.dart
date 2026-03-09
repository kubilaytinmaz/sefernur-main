import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../theme.dart';

class AppDarkTheme {

  static ThemeData dark() {
    return theme(darkScheme());
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

  // Dark tema için doğrudan renk değerlerini kullan (getter'lar ThemeService'e bağlı olduğu için)
  static ColorScheme darkScheme() {
    return ColorScheme(
      brightness: Brightness.dark,

      // Primary - yeşil tonlar dark modda da aynı kalır
      primary: AppColors.medinaGreen40,
      onPrimary: AppColors.white,
      primaryContainer: AppColors.medinaGreen30,
      onPrimaryContainer: AppColors.medinaGreen90,

      // Secondary
      secondary: AppColors.medinaGreen40,
      onSecondary: AppColors.white,
      secondaryContainer: AppColors.medinaGreen30,
      onSecondaryContainer: AppColors.medinaGreen90,

      // Tertiary
      tertiary: AppColors.purple80,
      onTertiary: AppColors.purple20,
      tertiaryContainer: AppColors.purple30,
      onTertiaryContainer: AppColors.purple90,

      // Error
      error: AppColors.red80,
      onError: AppColors.red20,
      errorContainer: AppColors.red30,
      onErrorContainer: AppColors.red90,

      // Surface - dark modda siyah/koyu renkler
      surface: AppColors.black,
      onSurface: AppColors.grey90,
      onSurfaceVariant: AppColors.grey90,

      outline: AppColors.grey12,
      outlineVariant: AppColors.grey6,

      shadow: AppColors.black,
      scrim: AppColors.black,

      inverseSurface: AppColors.grey90,
      inversePrimary: AppColors.pink40,
      
      surfaceDim: AppColors.grey6,
      surfaceBright: AppColors.grey24,
      
      surfaceContainerLowest: AppColors.grey6,
      surfaceContainerLow: AppColors.grey10,
      surfaceContainer: AppColors.grey12,
      surfaceContainerHigh: AppColors.grey17,
      surfaceContainerHighest: AppColors.grey24,
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