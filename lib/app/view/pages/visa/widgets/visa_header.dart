import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../themes/theme.dart';

class VisaHeader extends StatelessWidget {
  const VisaHeader({super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.medinaGreen40,
            AppColors.medinaGreen40.withOpacity(0.9),
          ],
        ),
      ),
      child: SafeArea(
          bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Vize İşlemleri', style: TextStyle(color: Colors.white, fontSize: 24.sp, fontWeight: FontWeight.bold)),
              SizedBox(height: 8.h),
              Text('Umre, hac ve ziyaret vizeleriniz için güvenli başvuru', style: TextStyle(color: Colors.white70, fontSize: 16.sp)),
            ],
          ),
        ),
      ),
    );
  }
}
