import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'bottom_sheet_handle.dart';

class FilterSheetHeader extends StatelessWidget {
  final String title;
  final VoidCallback? onReset;
  final EdgeInsetsGeometry? padding;
  final double spacingAfter;
  const FilterSheetHeader({
    super.key,
    required this.title,
    this.onReset,
    this.padding,
    this.spacingAfter = 12,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Center(child: BottomSheetHandle()),
        SizedBox(height: 4.h),
        Row(
          children: [
            Text(title, style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w600)),
            const Spacer(),
            if (onReset != null)
              TextButton.icon(
                onPressed: onReset,
                icon: const Icon(Icons.refresh),
                label: const Text('Sıfırla'),
              ),
          ],
        ),
        SizedBox(height: spacingAfter.h),
      ],
    );
  }
}
