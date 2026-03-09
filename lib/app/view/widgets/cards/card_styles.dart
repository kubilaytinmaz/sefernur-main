import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

/// Shared visual language for listing cards (hotel, tour, car, guide, transfer)
/// to keep a consistent, modern aesthetic.
/// Non-breaking: purely stylistic helpers – existing public card APIs stay unchanged.
class AppCardStyles {
  AppCardStyles._();

  static BorderRadius get radius => BorderRadius.circular(20.r);

  static List<BoxShadow> get softShadows => [
    BoxShadow(
      color: Colors.black.withOpacity(.1),
      blurRadius: 14,
      spreadRadius: 0,
      offset: const Offset(0, 6),
    ),
    BoxShadow(
      color: Colors.black.withOpacity(.1),
      blurRadius: 4,
      offset: const Offset(0, 1),
    ),
  ];

  static BoxDecoration container({
    Color? color,
    bool border = false,
    bool emphasize = false,
    BuildContext? context,
  }) {
    final isDark =
        context != null && Theme.of(context).brightness == Brightness.dark;
    final baseColor =
        color ??
        (isDark
            ? Theme.of(context).colorScheme.surfaceContainerHigh
            : Colors.white);
    final borderColor = isDark
        ? (emphasize
              ? Colors.blueGrey.withOpacity(.4)
              : (border
                    ? Colors.grey[700] ?? Colors.grey[700]!
                    : Colors.grey[700]!.withOpacity(1)))
        : (emphasize
              ? Colors.blueGrey.withOpacity(.25)
              : (border
                    ? Colors.grey[200] ?? Colors.grey[200]!
                    : Colors.grey[200]!.withOpacity(1)));

    return BoxDecoration(
      color: baseColor,
      borderRadius: radius,
      border: Border.all(color: borderColor, width: emphasize ? 1.2 : 1),
      boxShadow: isDark
          ? []
          : [
              ...softShadows,
              if (emphasize)
                BoxShadow(
                  color: Colors.blueGrey.withOpacity(.06),
                  blurRadius: 22,
                  spreadRadius: 1,
                  offset: const Offset(0, 8),
                ),
            ],
    );
  }

  static Widget gradientOverlay({
    double beginOpacity = .05,
    double endOpacity = .65,
  }) => Positioned.fill(
    child: DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withOpacity(beginOpacity),
            Colors.black.withOpacity(endOpacity),
          ],
        ),
      ),
    ),
  );

  static Widget favoriteButton({
    required bool isFav,
    required VoidCallback? onTap,
    double size = 36,
    Color? activeColor,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(size.r),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: InkWell(
          onTap: onTap,
          child: Container(
            height: size.r,
            width: size.r,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(.55),
              borderRadius: BorderRadius.circular(size.r),
              border: Border.all(color: Colors.white.withOpacity(.8), width: 1),
            ),
            child: Icon(
              isFav ? Icons.favorite : Icons.favorite_border,
              size: (size * .55).sp,
              color: isFav
                  ? (activeColor ?? Colors.redAccent)
                  : Colors.grey[700],
            ),
          ),
        ),
      ),
    );
  }

  static Widget badge({
    required Widget child,
    Color? color,
    EdgeInsets? padding,
    BorderRadius? radius,
  }) {
    return Container(
      padding: padding ?? EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: color ?? Colors.black.withOpacity(.55),
        borderRadius: radius ?? BorderRadius.circular(12.r),
        border: Border.all(color: Colors.white.withOpacity(.15), width: 1),
      ),
      child: child,
    );
  }

  static Widget ratingBadge(
    double rating, {
    Color? color,
    bool showIcon = true,
  }) {
    return badge(
      color: (color ?? Colors.black.withOpacity(.55)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(Icons.star_rounded, size: 14.sp, color: Colors.amber),
            SizedBox(width: 3.w),
          ],
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: 12.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  static Widget chip(String text, {IconData? icon, Color? color}) {
    final fg = color ?? Colors.grey[800];
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.h),
      decoration: BoxDecoration(
        color: (color ?? Colors.grey[100])!.withOpacity(.9),
        borderRadius: BorderRadius.circular(18.r),
        border: Border.all(color: (color ?? Colors.grey[300]!).withOpacity(.7)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12.sp, color: fg),
            SizedBox(width: 4.w),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: 10.sp,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}
