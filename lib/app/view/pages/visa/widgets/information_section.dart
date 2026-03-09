import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../themes/theme.dart';

class VisaInformationSection extends StatelessWidget {
  const VisaInformationSection({super.key});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark 
            ? [AppColors.medinaGreen40.withOpacity(0.3), AppColors.medinaGreen40.withOpacity(0.15)]
            : [AppColors.medinaGreen40.withOpacity(0.1), AppColors.medinaGreen40.withOpacity(0.05)],
        ),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.medinaGreen40.withOpacity(0.3), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.info_outline, color: AppColors.medinaGreen40, size: 24.sp),
            SizedBox(width: 8.w),
            Text('Vize Başvuru Rehberi', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: AppColors.medinaGreen40)),
          ]),
          SizedBox(height: 12.h),
          Text(
            'Umre, hac veya manevi ziyaretler için vize başvuru sürecini kolaylaştırıyoruz. Başvurunuz için gerekli tüm belgeleri hazırlayın ve adım adım rehberimizi takip edin.',
            style: TextStyle(fontSize: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[700], height: 1.5),
          ),
          SizedBox(height: 16.h),
          Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white, borderRadius: BorderRadius.circular(8.r)),
            child: Column(children: [
              _InfoItem(icon: Icons.schedule, title: 'İşlem Süresi', subtitle: '5-15 iş günü'),
              Divider(height: 16, color: isDark ? Colors.grey[700] : null),
              _InfoItem(icon: Icons.document_scanner, title: 'Gerekli Belgeler', subtitle: 'Pasaport, Fotoğraf, Kimlik'),
              Divider(height: 16, color: isDark ? Colors.grey[700] : null),
              _InfoItem(icon: Icons.support_agent, title: 'Destek', subtitle: '7/24 müşteri hizmeti'),
            ]),
          ),
        ],
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final IconData icon; final String title; final String subtitle;
  const _InfoItem({required this.icon, required this.title, required this.subtitle});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Row(children: [
      Icon(icon, color: AppColors.medinaGreen40, size: 20.sp),
      SizedBox(width: 12.w),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        Text(subtitle, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
      ])),
    ]);
  }
}
