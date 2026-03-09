import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../themes/colors/app_colors.dart';

/// Centralized style helpers for Search tabs (Hotels, Car Rental, Transfers, Guides, Tours).
/// Only visual concerns live here (no logic) so that all tabs feel consistent.
class SearchStyles {
  // Layout
  static EdgeInsets get pagePadding => EdgeInsets.all(20.w);
  static double get sectionSpacing => 20.h;
  static double get bigSectionSpacing => 30.h;

  // Colors
  static Color get pageBackground => AppColors.surfaceContainerLow;
  static Color get cardBackground => AppColors.card;
  static Color get borderColor => AppColors.outlineVariant;
  static Color get subtleBorderColor => AppColors.outline;
  static Color get labelColor => AppColors.onSurfaceVariant;
  static Color get valueColor => AppColors.onSurface;

  // Radii
  static BorderRadius get cardRadius => BorderRadius.circular(14.r);
  static BorderRadius get largeRadius => BorderRadius.circular(18.r);
  static BorderRadius get pillRadius => BorderRadius.circular(30.r);

  // Shadows (kept subtle to avoid visual noise)
  static List<BoxShadow> get softShadow => [
        BoxShadow(
          color: AppColors.shadow.withValues(alpha: .04),
          blurRadius: 10,
          offset: const Offset(0, 4),
        ),
      ];

  // Text Styles
  static TextStyle label() => TextStyle(
        fontSize: 12.sp,
        color: labelColor,
        fontWeight: FontWeight.w500,
        letterSpacing: .2,
      );

  static TextStyle value() => TextStyle(
        fontSize: 15.sp,
        fontWeight: FontWeight.w600,
        color: valueColor,
      );

  static TextStyle sectionTitle() => TextStyle(
        fontSize: 13.sp,
        fontWeight: FontWeight.w700,
        color: valueColor,
        letterSpacing: .15,
      );

  static TextStyle bodySmall({Color? color}) => TextStyle(
        fontSize: 12.sp,
        height: 1.4,
        color: color ?? labelColor,
      );

  static TextStyle bodyMedium({Color? color, FontWeight weight = FontWeight.w500}) => TextStyle(
        fontSize: 14.sp,
        height: 1.4,
        fontWeight: weight,
        color: color ?? valueColor,
      );

  static TextStyle promoHeadline(Color color) => TextStyle(
        fontSize: 18.sp,
        fontWeight: FontWeight.w700,
        color: color,
        height: 1.15,
      );

  // Decorations
  static BoxDecoration card({Color? color, BorderRadius? radius, bool withShadow = false, bool isDark = false}) => BoxDecoration(
        color: color ?? (isDark ? AppColors.surfaceContainerHigh : cardBackground),
        borderRadius: radius ?? cardRadius,
        border: Border.all(color: isDark ? AppColors.outline : borderColor),
        boxShadow: withShadow ? softShadow : null,
      );

  static BoxDecoration info(Color base) => BoxDecoration(
    color: base.withValues(alpha: .08),
        borderRadius: largeRadius,
    border: Border.all(color: base.withValues(alpha: .32)),
      );

  static BoxDecoration promoGradient(List<Color> colors) => BoxDecoration(
        borderRadius: largeRadius,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors,
        ),
      );

  // Common gaps
  static SizedBox get gap8 => SizedBox(height: 8.h);
  static SizedBox get gap10 => SizedBox(height: 10.h);
  static SizedBox get gap12 => SizedBox(height: 12.h);
  static SizedBox get gap14 => SizedBox(height: 14.h);
  static SizedBox get gap16 => SizedBox(height: 16.h);
  static SizedBox get gap20 => SizedBox(height: 20.h);
  static SizedBox get gap24 => SizedBox(height: 24.h);
  static SizedBox get gap30 => SizedBox(height: 30.h);
}

/// Wrapper to ensure consistent horizontal page padding & background.
class SearchTabScaffold extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  const SearchTabScaffold({super.key, required this.child, this.padding});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: SearchStyles.pageBackground,
      child: SingleChildScrollView(
        padding: padding ?? SearchStyles.pagePadding,
        child: child,
      ),
    );
  }
}

/// Standardized section title row with optional trailing widget.
class SectionHeader extends StatelessWidget {
  final String title;
  final Widget? trailing;
  const SectionHeader(this.title, {super.key, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Text(title, style: SearchStyles.sectionTitle()),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

/// Common pill chip style for popular / tag items (non-selectable display).
class PillChip extends StatelessWidget {
  final String text;
  final IconData? icon;
  final Color? color;
  final VoidCallback? onTap;
  const PillChip(this.text, {super.key, this.icon, this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    final fg = color ?? Theme.of(context).primaryColor;
    return Material(
      color: fg.withValues(alpha: .08),
      borderRadius: SearchStyles.pillRadius,
      child: InkWell(
        onTap: onTap,
        borderRadius: SearchStyles.pillRadius,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 16.sp, color: fg),
                SizedBox(width: 6.w),
              ],
              Text(text, style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: fg)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Standard section container used for grouped list / info blocks (e.g. Popüler Rotalar).
class SectionBlock extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? trailing;
  final EdgeInsets? padding;
  const SectionBlock({super.key, required this.title, required this.child, this.trailing, this.padding});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding ?? EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 12.h),
      decoration: SearchStyles.card(radius: BorderRadius.circular(16.r)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title, trailing: trailing),
          SizedBox(height: 12.h),
          child,
        ],
      ),
    );
  }
}

/// Reusable card tile style for popular search lists.
class PopularSearchListTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final VoidCallback? onTap;
  const PopularSearchListTile({
    super.key,
    required this.title,
    this.subtitle,
    this.icon = Icons.local_fire_department,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.r),
      child: Container(
        margin: EdgeInsets.only(bottom: 8.h),
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50],
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isDark ? theme.colorScheme.outline : Colors.grey[200]!,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44.w,
              height: 44.w,
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.green.shade900.withValues(alpha: .35)
                    : Theme.of(context).primaryColor.withValues(alpha: .12),
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(
                icon,
                size: 22.sp,
                color: isDark ? Colors.green.shade400 : Theme.of(context).primaryColor,
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  if (subtitle != null && subtitle!.isNotEmpty) ...[
                    SizedBox(height: 2.h),
                    Text(
                      subtitle!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(Icons.chevron_right, size: 20.sp, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
