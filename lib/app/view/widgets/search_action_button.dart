import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SearchActionButton extends StatelessWidget {
  final String label;
  final bool enabled;
  final bool loading;
  final VoidCallback? onPressed;
  const SearchActionButton({
    super.key,
    required this.label,
    required this.enabled,
    required this.loading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return SizedBox(
      width: double.infinity,
      height: 52.h,
      child: ElevatedButton(
        onPressed: enabled && !loading ? onPressed : null,
        style: ButtonStyle(
          shape: WidgetStateProperty.all(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(25.r)),
          ),
          padding: WidgetStateProperty.all(EdgeInsets.symmetric(horizontal: 22.w)),
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return isDark ? Colors.grey[800] : Colors.grey[300];
            }
            return theme.primaryColor;
          }),
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return isDark ? Colors.grey[500] : Colors.grey[600];
            }
            return Colors.white;
          }),
          elevation: WidgetStateProperty.all(0),
          overlayColor: WidgetStateProperty.all(Colors.white.withOpacity(.08)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (loading) ...[
              SizedBox(
                width: 20.w,
                height: 20.w,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(enabled ? Colors.white : Colors.grey[600]!),
                ),
              ),
              SizedBox(width: 10.w),
            ],
            Flexible(
              child: Text(
                label,
                style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w600, letterSpacing: .3),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            SizedBox(width: 8.w),
            Icon(Icons.arrow_forward, size: 20.sp),
          ],
        ),
      ),
    );
  }
}
