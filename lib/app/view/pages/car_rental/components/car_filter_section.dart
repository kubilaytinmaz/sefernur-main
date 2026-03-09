import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CarFilterSection extends StatelessWidget {
  final VoidCallback? onSortTap;
  final VoidCallback? onFilterTap;
  const CarFilterSection({super.key, this.onSortTap, this.onFilterTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
        child: Row(
          children: [
            Expanded(
              child: InkWell(
                borderRadius: BorderRadius.circular(100.r),
                onTap: onSortTap,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 18.w,
                    vertical: 12.h,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue[900],
                    borderRadius: BorderRadius.circular(100.r),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.sort, color: Colors.white, size: 18.sp),
                      SizedBox(width: 8.w),
                      Text(
                        'Sırala',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: InkWell(
                borderRadius: BorderRadius.circular(100.r),
                onTap: onFilterTap,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 18.w,
                    vertical: 12.h,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue[900],
                    borderRadius: BorderRadius.circular(100.r),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.tune, color: Colors.white, size: 18.sp),
                      SizedBox(width: 8.w),
                      Text(
                        'Filtrele',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
