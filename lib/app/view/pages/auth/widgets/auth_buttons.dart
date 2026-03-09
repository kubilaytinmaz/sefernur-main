import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:icons_plus/icons_plus.dart';

import '../../../themes/theme.dart';

class SocialLoginButton extends StatelessWidget {
  final VoidCallback onPressed;
  final String text;
  final Widget icon;
  final Color? backgroundColor;
  final Color? textColor;
  final Color? borderColor;
  final bool isLoading;

  const SocialLoginButton({
    super.key,
    required this.onPressed,
    required this.text,
    required this.icon,
    this.backgroundColor,
    this.textColor,
    this.borderColor,
    this.isLoading = false,
  });

  factory SocialLoginButton.google({
    required VoidCallback onPressed,
    bool isLoading = false,
    bool isDark = false,
  }) {
    return SocialLoginButton(
      onPressed: onPressed,
      text: 'Google ile devam et',
      icon: Brand(
        Brands.google,
        size: 20,
      ),
      backgroundColor: isDark ? const Color(0xFF2D2D2D) : Colors.white,
      textColor: isDark ? Colors.white : Colors.black87,
      borderColor: isDark ? Colors.grey.shade700 : Colors.grey[300],
      isLoading: isLoading,
    );
  }

  factory SocialLoginButton.apple({
    required VoidCallback onPressed,
    bool isLoading = false,
    bool isDark = false,
  }) {
    // Karanlık modda beyaz arka plan, aydınlık modda siyah arka plan
    return SocialLoginButton(
      onPressed: onPressed,
      text: 'Apple ile devam et',
      icon: Icon(
        Icons.apple,
        size: 22,
        color: isDark ? Colors.black : Colors.white,
      ),
      backgroundColor: isDark ? Colors.white : Colors.black,
      textColor: isDark ? Colors.black : Colors.white,
      borderColor: isDark ? Colors.white : Colors.black,
      isLoading: isLoading,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      height: 52.h,
      decoration: BoxDecoration(
        color: backgroundColor ?? (isDark ? const Color(0xFF2D2D2D) : Colors.white),
        borderRadius: BorderRadius.circular(12.r),
        border: borderColor != null
            ? Border.all(color: borderColor!, width: 1.5)
            : null,
        boxShadow: isDark ? null : [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, 2),
            blurRadius: 8,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(12.r),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading) ...[
                  SizedBox(
                    width: 20.sp,
                    height: 20.sp,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        textColor ?? Colors.black87,
                      ),
                    ),
                  ),
                ] else ...[
                  icon,
                ],
                SizedBox(width: 12.w),
                Text(
                  text,
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w600,
                    color: textColor ?? Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Guest login button - smaller and more subtle than social login buttons
class GuestLoginButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool isLoading;

  const GuestLoginButton({
    super.key,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final guestColor = isDark ? Colors.grey.shade400 : Colors.grey[600];
    
    return TextButton(
      onPressed: isLoading ? null : onPressed,
      style: TextButton.styleFrom(
        padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 16.w),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.r),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isLoading) ...[
            SizedBox(
              width: 16.sp,
              height: 16.sp,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(
                  guestColor!,
                ),
              ),
            ),
            SizedBox(width: 8.w),
          ] else ...[
            Icon(
              Icons.person_outline,
              size: 18.sp,
              color: guestColor,
            ),
            SizedBox(width: 6.w),
          ],
          Text(
            'Misafir olarak devam et',
            style: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w500,
              color: guestColor,
            ),
          ),
        ],
      ),
    );
  }
}

class AuthActionButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final String text;
  final bool isLoading;
  final bool isEnabled;
  final Color? backgroundColor;
  final Color? textColor;
  final IconData? icon;

  const AuthActionButton({
    super.key,
    this.onPressed,
    required this.text,
    this.isLoading = false,
    this.isEnabled = true,
    this.backgroundColor,
    this.textColor,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final bool canPress = isEnabled && !isLoading && onPressed != null;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      height: 52.h,
      decoration: BoxDecoration(
        gradient: canPress
            ? LinearGradient(
                colors: [
                  backgroundColor ?? AppColors.medinaGreen40,
                  (backgroundColor ?? AppColors.medinaGreen40).withOpacity(0.8),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: canPress ? null : (isDark ? Colors.grey.shade800 : Colors.grey[300]),
        borderRadius: BorderRadius.circular(12.r),
        boxShadow: canPress && !isDark
            ? [
                BoxShadow(
                  color: (backgroundColor ?? AppColors.medinaGreen40).withOpacity(0.3),
                  offset: const Offset(0, 4),
                  blurRadius: 12,
                  spreadRadius: 0,
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: canPress ? onPressed : null,
          borderRadius: BorderRadius.circular(12.r),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading) ...[
                  SizedBox(
                    width: 20.sp,
                    height: 20.sp,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        textColor ?? Colors.white,
                      ),
                    ),
                  ),
                  SizedBox(width: 12.w),
                ],
                if (icon != null && !isLoading) ...[
                  Icon(
                    icon,
                    size: 20.sp,
                    color: textColor ?? Colors.white,
                  ),
                  SizedBox(width: 12.w),
                ],
                Text(
                  text,
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w700,
                    color: canPress
                        ? (textColor ?? Colors.white)
                        : (isDark ? Colors.grey.shade500 : Colors.grey[600]),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
