import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

/// Universal filter bar with Sort + Filter trigger pills and optional badge.
class ListingFilterBar extends StatelessWidget {
  final VoidCallback onOpenSort;
  final VoidCallback onOpenFilters;
  final int activeFilterCount;
  final int? resultCount;
  final bool showResultCount;
  final Widget? trailing; // e.g. favorites toggle
  final bool inlineResult; // show result at far right in same row

  const ListingFilterBar({
    super.key,
    required this.onOpenSort,
    required this.onOpenFilters,
    required this.activeFilterCount,
    this.resultCount,
    this.showResultCount = true,
    this.trailing,
    this.inlineResult = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final resultTextColor = isDark ? Colors.grey[400] : Colors.grey[700];

    final pillRow = Row(
      children: [
        _pill(
          context,
          icon: Icons.sort_rounded,
          label: 'Sırala',
          onTap: onOpenSort,
        ),
        SizedBox(width: 10.w),
        _pill(
          context,
          icon: Icons.tune_rounded,
          label: activeFilterCount > 0
              ? 'Filtre ($activeFilterCount)'
              : 'Filtrele',
          onTap: onOpenFilters,
          highlight: activeFilterCount > 0,
        ),
        const Spacer(),
        if (trailing != null) trailing!,
        if (inlineResult && showResultCount && resultCount != null) ...[
          if (trailing != null) SizedBox(width: 8.w),
          Text(
            '$resultCount sonuç',
            style: TextStyle(
              fontSize: 12.sp,
              fontWeight: FontWeight.w700,
              color: theme.primaryColor,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ],
    );

    return Material(
      color: theme.scaffoldBackgroundColor,
      elevation: isDark ? 0 : 2,
      shadowColor: Colors.black12,
      child: Container(
        decoration: isDark
            ? BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Colors.grey[800]!, width: 1),
                ),
              )
            : null,
        padding: EdgeInsets.fromLTRB(16.w, 10.h, 16.w, 8.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            pillRow,
            if (!inlineResult && showResultCount && resultCount != null) ...[
              SizedBox(height: 8.h),
              Text(
                '$resultCount sonuç',
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: resultTextColor,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _pill(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool highlight = false,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primary = theme.primaryColor;
    final bg = highlight
        ? primary.withOpacity(.12)
        : (isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[100]);
    final borderColor = highlight
        ? primary
        : (isDark ? Colors.grey[700] : Colors.grey[300]);
    final fg = highlight
        ? primary
        : (isDark ? Colors.grey[300] : Colors.grey[800]);
    return InkWell(
      borderRadius: BorderRadius.circular(100.r),
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(100.r),
          border: Border.all(color: borderColor!),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18.sp, color: fg),
            SizedBox(width: 6.w),
            Text(
              label,
              style: TextStyle(
                fontSize: 13.sp,
                fontWeight: FontWeight.w600,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
