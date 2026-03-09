import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/visa/visa_controller.dart';
import '../../../themes/theme.dart';

class VisaHelpTab extends GetView<VisaController> {
  const VisaHelpTab({super.key});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return SingleChildScrollView(
      padding: EdgeInsets.all(20.w),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Yardım & Destek', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
        SizedBox(height: 20.h),
        _contact(theme, isDark),
        SizedBox(height: 20.h),
        Text('Sık Sorulan Sorular', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
        SizedBox(height: 16.h),
        Obx(()=> Column(children: controller.faqItems.map((faq)=> Container(
          margin: EdgeInsets.only(bottom: 8.h),
          decoration: BoxDecoration(
            color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white, 
            borderRadius: BorderRadius.circular(12.r), 
            boxShadow: isDark ? null : [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 5, offset: const Offset(0,2))],
          ),
          child: Theme(
            data: theme.copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              title: Text(faq.question, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)), 
              children: [Padding(padding: EdgeInsets.all(16.w), child: Text(faq.answer, style: TextStyle(fontSize: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[700], height: 1.5)))],
            ),
          ),
        )).toList()))
      ]),
    );
  }

  Widget _contact(ThemeData theme, bool isDark){
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: isDark 
          ? [AppColors.medinaGreen40.withOpacity(0.3), theme.colorScheme.surfaceContainerHigh]
          : [AppColors.medinaGreen40.withOpacity(0.1), Colors.white]), 
        borderRadius: BorderRadius.circular(16.r), 
        border: Border.all(color: AppColors.medinaGreen40.withOpacity(0.3)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('İletişim', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: AppColors.medinaGreen40)),
        SizedBox(height: 16.h),
        _contactItem(Icons.phone, 'Telefon', '+90 (212) 555 0123', theme, isDark),
        SizedBox(height: 12.h),
        _contactItem(Icons.email, 'E-posta', 'vize@sefernur.com', theme, isDark),
        SizedBox(height: 12.h),
        _contactItem(Icons.access_time, 'Çalışma Saatleri', '09:00 - 18:00 (Hafta içi)', theme, isDark),
      ]),
    );
  }

  Widget _contactItem(IconData icon, String title, String subtitle, ThemeData theme, bool isDark){
    return Row(children: [
      Icon(icon, color: AppColors.medinaGreen40, size: 20.sp), SizedBox(width: 12.w),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        Text(subtitle, style: TextStyle(fontSize: 13.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
      ])),
    ]);
  }
}
