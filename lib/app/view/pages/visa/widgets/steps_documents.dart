import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/visa/visa_controller.dart';
import '../../../themes/theme.dart';

class VisaDocumentsStep extends GetView<VisaController> {
  const VisaDocumentsStep({super.key});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Gerekli Belgeler', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
      SizedBox(height: 16.h),
      _doc('Pasaport *','Pasaport sayfalarının tamamı (PDF veya JPG)', controller.passportFile, controller.pickPassportFile, theme, isDark),
      SizedBox(height: 16.h),
      _doc('Fotoğraf *','Beyaz zemin üzerine 5x6 cm fotoğraf', controller.photoFile, controller.pickPhotoFile, theme, isDark),
      SizedBox(height: 16.h),
      _doc('Kimlik Belgesi *','Nüfus cüzdanı veya kimlik kartı', controller.idFile, controller.pickIdFile, theme, isDark),
      SizedBox(height: 16.h),
      _additional(theme, isDark),
    ]);
  }

  Widget _doc(String title, String desc, Rx<File?> file, VoidCallback onTap, ThemeData theme, bool isDark){
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surfaceContainerHigh : null,
        border: Border.all(color: isDark ? Colors.grey[600]! : Colors.grey[300]!), 
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        SizedBox(height: 4.h),
        Text(desc, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
        SizedBox(height: 12.h),
        Obx(()=> file.value != null ? Container(
          padding: EdgeInsets.all(12.w),
          decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(8.r)),
          child: Row(children: [
            Icon(Icons.check_circle, color: Colors.green, size: 20.sp), SizedBox(width: 8.w),
            Expanded(child: Text(file.value!.path.split('/').last, style: TextStyle(fontSize: 14.sp, color: Colors.green[700]))),
            TextButton(onPressed: onTap, child: const Text('Değiştir')),
          ]),
        ) : ElevatedButton.icon(onPressed: onTap, icon: const Icon(Icons.upload_file), label: const Text('Dosya Seç'), style: ElevatedButton.styleFrom(backgroundColor: AppColors.medinaGreen40, foregroundColor: Colors.white))),
      ]),
    );
  }

  Widget _additional(ThemeData theme, bool isDark){
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surfaceContainerHigh : null,
        border: Border.all(color: isDark ? Colors.grey[600]! : Colors.grey[300]!), 
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [Icon(Icons.add_circle_outline, color: AppColors.medinaGreen40), SizedBox(width: 8.w), Text('Ek Belgeler (İsteğe bağlı)', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface))]),
        SizedBox(height: 8.h),
        Text('Davet mektubu, rezervasyon belgesi vb.', style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
        SizedBox(height: 12.h),
        Obx(()=> Column(children: controller.additionalFiles.asMap().entries.map((e){
          final index = e.key; final file = e.value;
          return Container(
            margin: EdgeInsets.only(bottom: 8.h),
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50], borderRadius: BorderRadius.circular(8.r)),
            child: Row(children: [
              Icon(Icons.description, color: isDark ? Colors.grey[400] : Colors.grey[600], size: 20.sp), SizedBox(width: 8.w),
              Expanded(child: Text(file.path.split('/').last, style: TextStyle(fontSize: 14.sp, color: theme.colorScheme.onSurface))),
              IconButton(onPressed: ()=> controller.removeAdditionalFile(index), icon: const Icon(Icons.close, color: Colors.red), iconSize: 20.sp),
            ]),
          );
        }).toList())),
        ElevatedButton.icon(onPressed: controller.pickAdditionalFiles, icon: const Icon(Icons.upload_file), label: const Text('Dosya Ekle'), style: ElevatedButton.styleFrom(backgroundColor: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100], foregroundColor: isDark ? Colors.grey[300] : Colors.grey[700], elevation: 0)),
      ]),
    );
  }
}
