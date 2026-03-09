import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class BottomSheetHandle extends StatelessWidget {
  final double width;
  final double height;
  final EdgeInsetsGeometry? margin;
  const BottomSheetHandle({super.key, this.width = 46, this.height = 5, this.margin});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width.w,
      height: height.h,
      margin: margin ?? EdgeInsets.only(bottom: 12.h),
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(4.r),
      ),
    );
  }
}
