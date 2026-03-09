import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class DragHandle extends StatelessWidget {
  final EdgeInsetsGeometry margin;
  const DragHandle({super.key, this.margin = const EdgeInsets.only(bottom: 12)});
  @override
  Widget build(BuildContext context) => Center(
        child: Container(
          width: 48.w,
          height: 5.h,
          margin: margin,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(4.r),
          ),
        ),
      );
}
