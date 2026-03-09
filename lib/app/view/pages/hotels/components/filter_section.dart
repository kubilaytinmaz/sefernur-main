import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/hotel_search_controller.dart';

class FilterSection extends StatelessWidget {
  const FilterSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final controller = Get.isRegistered<HotelSearchController>() ? Get.find<HotelSearchController>() : null;
    if (controller == null) {
      return const SizedBox.shrink();
    }
    return Obx(() => Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
      color: theme.scaffoldBackgroundColor,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _chip(
              icon: controller.favoritesOnly.value ? Icons.favorite : Icons.favorite_border,
              label: 'Favoriler',
              selected: controller.favoritesOnly.value,
              onTap: controller.toggleFavoritesOnly,
              context: context,
            ),
            SizedBox(width: 8.w),
            _sortMenu(controller, context),
            SizedBox(width: 8.w),
            _boardTypeFilter(controller, context),
          ],
        ),
      ),
    ));
  }

  Widget _chip({required IconData icon, required String label, required bool selected, required VoidCallback onTap, required BuildContext context}) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgUnselected = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[100];
    final borderUnselected = isDark ? Colors.grey[700]! : Colors.grey[300]!;
    final fgUnselected = isDark ? Colors.grey[300] : Colors.grey[600];
    final textUnselected = isDark ? Colors.grey[300] : Colors.grey[800];
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: selected ? Colors.blue[50] : bgUnselected,
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(color: selected ? Colors.blue : borderUnselected),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16.sp, color: selected ? Colors.blue : fgUnselected),
            SizedBox(width: 6.w),
            Text(
              label,
              style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: selected ? Colors.blue[700] : textUnselected),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sortMenu(HotelSearchController c, BuildContext context) {
    return PopupMenuButton<String>(
      tooltip: 'Sırala',
      onSelected: c.setSortOption,
      itemBuilder: (ctx) => [
        _sortItem('rating_desc', 'Puan (yüksek > düşük)'),
        _sortItem('price_asc', 'Fiyat (artan)'),
        _sortItem('price_desc', 'Fiyat (azalan)'),
      ],
      child: _chip(
        icon: Icons.tune,
        label: _sortLabel(c.sortOption.value),
        selected: false,
        onTap: () {},
        context: context,
      ),
    );
  }

  PopupMenuItem<String> _sortItem(String value, String label) => PopupMenuItem(value: value, child: Text(label));
  String _sortLabel(String value) {
    switch (value) {
      case 'price_asc': return 'Fiyat ↑';
      case 'price_desc': return 'Fiyat ↓';
      case 'rating_desc':
      default: return 'Puan';
    }
  }

  Widget _boardTypeFilter(HotelSearchController c, BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgUnselected = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[100];
    final borderUnselected = isDark ? Colors.grey[700]! : Colors.grey[300]!;
    final textUnselected = isDark ? Colors.grey[300] : Colors.grey[800];
    
    const boards = ['BB','HB','FB','AI'];
    return Row(
      children: boards.map((b) {
        final selected = c.selectedBoardTypes.contains(b);
        return Padding(
          padding: EdgeInsets.only(right: 6.w),
          child: GestureDetector(
            onTap: () => c.toggleBoardType(b),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
              decoration: BoxDecoration(
                color: selected ? Colors.green[50] : bgUnselected,
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(color: selected ? Colors.green : borderUnselected),
              ),
              child: Text(
                b,
                style: TextStyle(
                  fontSize: 11.sp,
                  fontWeight: FontWeight.w600,
                  color: selected ? Colors.green[700] : textUnselected,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
