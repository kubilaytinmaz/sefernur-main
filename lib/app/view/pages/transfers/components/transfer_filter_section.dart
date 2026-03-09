import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/transfer_search_controller.dart';

class TransferFilterSection extends StatelessWidget {
  final TransferSearchController controller;
  const TransferFilterSection({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Obx(() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 6.w,
              runSpacing: 6.h,
              children: _vehicleTypes(controller).map((type) {
                final selected = controller.selectedVehicleTypes.contains(type);
                return GestureDetector(
                  onTap: () => controller.toggleVehicleType(type),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: selected ? theme.primaryColor : (isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100]),
                      borderRadius: BorderRadius.circular(16.r),
                      border: Border.all(
                        color: selected ? theme.primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
                      ),
                    ),
                    child: Text(
                      type.toUpperCase(),
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: selected ? Colors.white : (isDark ? Colors.grey[300] : Colors.grey[800]),
                        fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            SizedBox(height: 12.h),
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: controller.clearFilters,
                  icon: Icon(Icons.clear, size: 16.sp),
                  label: Text('Temizle', style: TextStyle(fontSize: 12.sp)),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                    side: BorderSide(color: isDark ? Colors.grey[600]! : Colors.grey[400]!),
                    foregroundColor: isDark ? Colors.grey[300] : Colors.grey[700],
                  ),
                ),
                const Spacer(),
                IconButton(
                  tooltip: 'Favoriler',
                  onPressed: controller.toggleFavoritesOnly,
                  icon: Icon(
                    controller.favoritesOnly.value
                        ? Icons.favorite
                        : Icons.favorite_border,
                    color: controller.favoritesOnly.value ? Colors.red : (isDark ? Colors.grey[400] : Colors.grey[600]),
                  ),
                )
              ],
            )
          ],
        ));
  }

  // Removed local _openSortSheet (unified via showSortSheet)

  List<String> _vehicleTypes(TransferSearchController c) {
    // Derive from results for available chips
    final set = <String>{};
    for (final t in c.results) {
      if (t.vehicleType.isNotEmpty) set.add(t.vehicleType.toLowerCase());
    }
    final list = set.toList()..sort();
    return list;
  }
}
