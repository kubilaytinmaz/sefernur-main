import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../bottom_sheet/bottom_sheet_handle.dart';

class SortOption<T> {
  final T value;
  final String label;
  const SortOption(this.value, this.label);
}

Future<void> showSortSheet<T>({
  required T selected,
  required List<SortOption<T>> options,
  required ValueChanged<T> onSelect,
  String title = 'Sırala',
}) async {
  await Get.bottomSheet(
    Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        final bgColor = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white;
        final textColor = theme.colorScheme.onSurface;
        
        return SafeArea(
          bottom: false,
          child: Container(
            padding: EdgeInsets.fromLTRB(20.w,12.h,20.w,20.h + MediaQuery.of(context).padding.bottom),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(28.r),
                topRight: Radius.circular(28.r),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Center(child: BottomSheetHandle(margin: EdgeInsets.only(bottom: 12))),
                SizedBox(height: 2.h),
                Text(title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w700, color: textColor)),
                SizedBox(height: 8.h),
                ...options.map((o) => RadioListTile<T>(
                  value: o.value,
                  groupValue: selected,
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  onChanged: (v){ if(v!=null){ onSelect(v); Navigator.pop(context); } },
                  title: Text(o.label, style: TextStyle(fontSize: 14.sp, color: textColor)),
                )),
                SizedBox(height: 4.h),
              ],
            ),
          ),
        );
      },
    ),
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
  );
}
