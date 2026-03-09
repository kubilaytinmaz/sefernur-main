import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/guide_search_controller.dart';
import '../../../../data/services/currency/currency_service.dart';

class GuideFilterSheet extends StatelessWidget {
  final GuideSearchController c;
  const GuideFilterSheet({super.key, required this.c});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgColor = isDark
        ? theme.colorScheme.surfaceContainerHigh
        : Colors.white;
    final handleColor = isDark ? Colors.grey[600] : Colors.grey[300];
    final dividerColor = isDark ? Colors.grey[800] : Colors.grey[200];

    final currencyService = Get.find<CurrencyService>();
    
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.4,
      expand: false,
      builder: (context, scrollCtrl) => Container(
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
        ),
        child: Column(
          children: [
            // Header
            Padding(
              padding: EdgeInsets.fromLTRB(16.w, 10.h, 16.w, 8.h),
              child: Column(
                children: [
                  Container(
                    width: 40.w,
                    height: 4.h,
                    decoration: BoxDecoration(
                      color: handleColor,
                      borderRadius: BorderRadius.circular(2.r),
                    ),
                  ),
                  SizedBox(height: 10.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Filtreler',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      TextButton(
                        onPressed: () => c.clearFilters(),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.symmetric(horizontal: 8.w),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text('Sıfırla', style: TextStyle(fontSize: 13.sp)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Divider(height: 1, color: dividerColor),
            // Content
            Expanded(
              child: ListView(
                controller: scrollCtrl,
                padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 8.h),
                children: [
                  _sectionTitle('Diller', context),
                  SizedBox(height: 6.h),
                  _chipWrap(c.allLanguages, c.selectedLanguages, c.toggleLanguage, context),
                  SizedBox(height: 14.h),
                  
                  _sectionTitle('Uzmanlıklar', context),
                  SizedBox(height: 6.h),
                  _chipWrap(c.allSpecialties, c.selectedSpecialties, c.toggleSpecialty, context),
                  SizedBox(height: 14.h),
                  
                  _sectionTitle('Sertifikalar', context),
                  SizedBox(height: 6.h),
                  _chipWrap(c.allCertifications, c.selectedCertifications, c.toggleCertification, context),
                  SizedBox(height: 14.h),
                  
                  // Min Deneyim Slider
                  Obx(() => _sectionTitle('Min Deneyim: ${c.minExperience.value} yıl', context)),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 3,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
                    ),
                    child: Obx(() => Slider(
                      min: 0,
                      max: 30,
                      divisions: 30,
                      value: c.minExperience.value.toDouble(),
                      onChanged: (v) => c.setMinExperience(v.round()),
                    )),
                  ),
                  SizedBox(height: 8.h),
                  
                  // Max Ücret Slider
                  Obx(() => _sectionTitle(
                    'Max Günlük Ücret: ${c.maxPriceFilter.value == double.infinity ? "Sınırsız" : currencyService.currentRate.value.formatBoth(c.maxPriceFilter.value)}',
                    context,
                  )),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 3,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
                    ),
                    child: Obx(() => Slider(
                      min: c.minDailyRate,
                      max: c.maxDailyRate == 0 ? 1000 : c.maxDailyRate,
                      value: c.maxPriceFilter.value == double.infinity
                          ? (c.maxDailyRate == 0 ? 0 : c.maxDailyRate)
                          : c.maxPriceFilter.value,
                      onChanged: (v) => c.setMaxPrice(v),
                    )),
                  ),
                  SizedBox(height: 8.h),
                  
                  // Min Puan Slider
                  Obx(() => _sectionTitle('Min Puan: ${c.minRating.value.toStringAsFixed(1)}', context)),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 3,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
                    ),
                    child: Obx(() => Slider(
                      min: 0,
                      max: 5,
                      divisions: 10,
                      value: c.minRating.value,
                      onChanged: (v) => c.setMinRating(v),
                    )),
                  ),
                  SizedBox(height: 12.h),
                  
                  // Adres Eşleşme Modu
                  _sectionTitle('Adres Eşleşme Modu', context),
                  SizedBox(height: 6.h),
                  Obx(() => Row(
                    children: [
                      _modeChip('Tam', 'full', context),
                      SizedBox(width: 8.w),
                      _modeChip('Şehir', 'city', context),
                      SizedBox(width: 8.w),
                      _modeChip('Ülke', 'country', context),
                    ],
                  )),
                  SizedBox(height: 14.h),
                  
                  // Sıralama
                  _sectionTitle('Sıralama', context),
                  SizedBox(height: 6.h),
                  Obx(() => Wrap(
                    spacing: 8.w,
                    runSpacing: 6.h,
                    children: [
                      _sortChip('Fiyat ↑', 'price_asc', context),
                      _sortChip('Fiyat ↓', 'price_desc', context),
                      _sortChip('Puan ↓', 'rating_desc', context),
                      _sortChip('Deneyim ↓', 'experience_desc', context),
                    ],
                  )),
                  SizedBox(height: 16.h),
                ],
              ),
            ),
            // Footer buttons
            Container(
              padding: EdgeInsets.fromLTRB(16.w, 10.h, 16.w, 10.h + MediaQuery.of(context).padding.bottom),
              decoration: BoxDecoration(
                color: bgColor,
                border: Border(top: BorderSide(color: dividerColor!)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 12.h),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                        side: BorderSide(color: isDark ? Colors.grey[600]! : Colors.grey[400]!),
                      ),
                      child: Text('İptal', style: TextStyle(fontSize: 14.sp)),
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 12.h),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                      ),
                      child: Text('Uygula', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text, BuildContext context) {
    final theme = Theme.of(context);
    return Text(
      text,
      style: TextStyle(
        fontSize: 12.sp,
        fontWeight: FontWeight.w600,
        color: theme.colorScheme.onSurface,
      ),
    );
  }

  Widget _chipWrap(
    Set<String> all,
    RxSet<String> selected,
    Function(String) toggle,
    BuildContext context,
  ) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final emptyTextColor = isDark ? Colors.grey[500] : Colors.grey[500];

    if (all.isEmpty) {
      return Text('Veri yok', style: TextStyle(fontSize: 11.sp, color: emptyTextColor));
    }
    
    final list = all.toList()..sort();
    return Wrap(
      spacing: 6.w,
      runSpacing: 6.h,
      children: list.map((e) {
        final sel = selected.contains(e);
        return GestureDetector(
          onTap: () => toggle(e),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
            decoration: BoxDecoration(
              color: sel ? theme.primaryColor : (isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100]),
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(
                color: sel ? theme.primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
                width: sel ? 1.5 : 1,
              ),
            ),
            child: Text(
              e.toUpperCase(),
              style: TextStyle(
                fontSize: 10.sp,
                color: sel ? Colors.white : (isDark ? Colors.grey[300] : Colors.grey[800]),
                fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _modeChip(String label, String value, BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final sel = c.addressMatchMode.value == value;
    
    return GestureDetector(
      onTap: () => c.setAddressMatchMode(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: sel ? theme.primaryColor : (isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100]),
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(
            color: sel ? theme.primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (sel) ...[
              Icon(Icons.check, size: 14.sp, color: Colors.white),
              SizedBox(width: 4.w),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12.sp,
                color: sel ? Colors.white : (isDark ? Colors.grey[300] : Colors.grey[800]),
                fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sortChip(String label, String value, BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final sel = c.sortOption.value == value;
    
    return GestureDetector(
      onTap: () => c.setSort(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: sel ? theme.primaryColor : (isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100]),
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(
            color: sel ? theme.primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.sp,
            color: sel ? Colors.white : (isDark ? Colors.grey[300] : Colors.grey[800]),
            fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
