import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/visa/visa_controller.dart';

class VisaPersonalStep extends GetView<VisaController> {
  const VisaPersonalStep({super.key});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Kişisel Bilgileriniz', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
      SizedBox(height: 16.h),
      Row(children: [
        Expanded(child: TextFormField(controller: controller.firstNameController, decoration: _dec('Ad *', theme, isDark))),
        SizedBox(width: 16.w),
        Expanded(child: TextFormField(controller: controller.lastNameController, decoration: _dec('Soyad *', theme, isDark))),
      ]),
      SizedBox(height: 16.h),
      TextFormField(controller: controller.passportNumberController, decoration: _dec('Pasaport Numarası *', theme, isDark)),
      SizedBox(height: 16.h),
      TextFormField(controller: controller.phoneController, keyboardType: TextInputType.phone, decoration: _dec('Telefon Numarası *', theme, isDark)),
      SizedBox(height: 16.h),
      TextFormField(controller: controller.emailController, keyboardType: TextInputType.emailAddress, decoration: _dec('E-posta Adresi *', theme, isDark)),
      SizedBox(height: 16.h),
      Obx(() => DropdownButtonFormField<String>(
        decoration: _dec('Medeni Durum *', theme, isDark),
        initialValue: controller.selectedMaritalStatus.value.isEmpty ? null : controller.selectedMaritalStatus.value,
        dropdownColor: isDark ? theme.colorScheme.surfaceContainerHigh : null,
        items: [
          DropdownMenuItem(value: 'Bekar', child: Text('Bekar', style: TextStyle(color: theme.colorScheme.onSurface))),
          DropdownMenuItem(value: 'Evli', child: Text('Evli', style: TextStyle(color: theme.colorScheme.onSurface))),
          DropdownMenuItem(value: 'Dul', child: Text('Dul', style: TextStyle(color: theme.colorScheme.onSurface))),
          DropdownMenuItem(value: 'Boşanmış', child: Text('Boşanmış', style: TextStyle(color: theme.colorScheme.onSurface))),
        ],
        onChanged: (v){ if(v!=null) controller.selectedMaritalStatus.value = v; },
      )),
      SizedBox(height: 16.h),
      TextFormField(controller: controller.addressController, maxLines: 3, decoration: _dec('Adres', theme, isDark)),
    ]);
  }
  InputDecoration _dec(String label, ThemeData theme, bool isDark)=> InputDecoration(
    labelText: label, 
    labelStyle: TextStyle(color: isDark ? Colors.grey[400] : null),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r)),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: isDark ? Colors.grey[600]! : Colors.grey[400]!),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: theme.colorScheme.primary, width: 2),
    ),
    filled: isDark,
    fillColor: isDark ? theme.colorScheme.surfaceContainerHigh : null,
  );
}
