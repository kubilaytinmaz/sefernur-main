import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../controllers/visa/visa_controller.dart';
import '../../../themes/theme.dart';

class VisaTravelStep extends GetView<VisaController> {
  const VisaTravelStep({super.key});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Seyahat Bilgileriniz',
          style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface),
        ),
        SizedBox(height: 16.h),
        Obx(
          () => DropdownButtonFormField<String>(
            initialValue: controller.selectedCountry.value.isEmpty
                ? null
                : controller.selectedCountry.value,
            decoration: _dec('Gidilecek Ülke *', theme, isDark),
            dropdownColor: isDark ? theme.colorScheme.surfaceContainerHigh : null,
            items: controller.countries
                .map((c) => DropdownMenuItem(value: c, child: Text(c, style: TextStyle(color: theme.colorScheme.onSurface))))
                .toList(),
            onChanged: (v) {
              if (v != null) controller.updateCountry(v);
            },
          ),
        ),
        SizedBox(height: 16.h),
        Obx(
          () => DropdownButtonFormField<String>(
            initialValue: controller.selectedCity.value.isEmpty
                ? null
                : controller.selectedCity.value,
            decoration: _dec('Gidilecek Şehir *', theme, isDark),
            dropdownColor: isDark ? theme.colorScheme.surfaceContainerHigh : null,
            items: controller
                .getCitiesForCountry(controller.selectedCountry.value)
                .map((c) => DropdownMenuItem(value: c, child: Text(c, style: TextStyle(color: theme.colorScheme.onSurface))))
                .toList(),
            onChanged: controller.selectedCountry.value.isEmpty
                ? null
                : (v) {
                    if (v != null) controller.updateCity(v);
                  },
          ),
        ),
        SizedBox(height: 16.h),
        Obx(
          () => DropdownButtonFormField<String>(
            initialValue: controller.selectedPurpose.value.isEmpty
                ? null
                : controller.selectedPurpose.value,
            decoration: _dec('Seyahat Amacı *', theme, isDark),
            dropdownColor: isDark ? theme.colorScheme.surfaceContainerHigh : null,
            items: controller.purposes
                .map((p) => DropdownMenuItem(value: p, child: Text(p, style: TextStyle(color: theme.colorScheme.onSurface))))
                .toList(),
            onChanged: (v) {
              if (v != null) controller.updatePurpose(v);
            },
          ),
        ),
        SizedBox(height: 16.h),
        Row(
          children: [
            Expanded(
              child: Obx(
                () => _dateBox(
                  'Gidiş Tarihi *',
                  controller.selectedDepartureDate.value,
                  controller.selectDepartureDate,
                  theme,
                  isDark,
                ),
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Obx(
                () => _dateBox(
                  'Dönüş Tarihi *',
                  controller.selectedReturnDate.value,
                  controller.selectReturnDate,
                  theme,
                  isDark,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 16.h),
        Obx(
          () => controller.selectedCountry.value.isNotEmpty
              ? Container(
                  padding: EdgeInsets.all(16.w),
                  decoration: BoxDecoration(
                    color: AppColors.medinaGreen40.withOpacity(isDark ? 0.2 : 0.1),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.monetization_on,
                        color: AppColors.medinaGreen40,
                      ),
                      SizedBox(width: 12.w),
                      Text(
                        'Vize Ücreti: \$${controller.getVisaFee(controller.selectedCountry.value).toStringAsFixed(0)}',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.medinaGreen40,
                        ),
                      ),
                    ],
                  ),
                )
              : const SizedBox.shrink(),
        ),
      ],
    );
  }

  InputDecoration _dec(String label, ThemeData theme, bool isDark) => InputDecoration(
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
  Widget _dateBox(String label, DateTime? dt, VoidCallback onTap, ThemeData theme, bool isDark) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHigh : null,
          border: Border.all(color: isDark ? Colors.grey[600]! : Colors.grey[400]!),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
            ),
            SizedBox(height: 4.h),
            Text(
              dt != null ? DateFormat('dd/MM/yyyy').format(dt) : 'Tarih seçin',
              style: TextStyle(
                fontSize: 16.sp,
                color: dt != null ? theme.colorScheme.onSurface : (isDark ? Colors.grey[500] : Colors.grey[500]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
