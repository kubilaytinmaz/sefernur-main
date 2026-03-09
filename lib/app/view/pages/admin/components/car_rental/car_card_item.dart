import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../../data/models/models.dart';

class CarCardItem extends StatelessWidget {
  const CarCardItem({
    super.key,
    required this.car,
    required this.onEdit,
    required this.onAvailability,
    required this.onDelete,
    required this.onReviews,
  });

  final CarModel car;
  final VoidCallback onEdit;
  final VoidCallback onAvailability;
  final VoidCallback onDelete;
  final VoidCallback onReviews;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(14.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: EdgeInsets.all(12.w),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(10.r),
          child: Container(
            width: 64.w,
            height: 56.h,
            color: isDark ? Colors.grey[800] : Colors.grey[200],
            child: (car.images.isNotEmpty && car.images.first.isNotEmpty)
                ? Image.network(
                    car.images.first,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Center(
                      child: Icon(
                        Icons.directions_car,
                        color: Colors.grey[600],
                        size: 22.sp,
                      ),
                    ),
                  )
                : Center(
                    child: Icon(
                      Icons.directions_car,
                      color: Colors.grey[600],
                      size: 22.sp,
                    ),
                  ),
          ),
        ),
        title: Text(
          '${car.brand} ${car.model}',
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w700),
        ),
        subtitle: Wrap(
          spacing: 10.w,
          runSpacing: 4.h,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            _metaItem(Icons.people, '${car.seats} kişi'),
            _metaItem(Icons.settings, car.transmission),
            _metaItem(Icons.local_gas_station, car.fuelType),
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            const PopupMenuItem(value: 'edit', child: Text('Düzenle')),
            const PopupMenuItem(
              value: 'availability',
              child: Text('Müsaitlik'),
            ),
            const PopupMenuItem(value: 'reviews', child: Text('Yorumlar')),
            const PopupMenuItem(
              value: 'delete',
              child: Text('Sil', style: TextStyle(color: Colors.red)),
            ),
          ],
          onSelected: (v) {
            switch (v) {
              case 'edit':
                onEdit();
                break;
              case 'availability':
                onAvailability();
                break;
              case 'reviews':
                onReviews();
                break;
              case 'delete':
                onDelete();
                break;
            }
          },
        ),
        onTap: onEdit,
      ),
    );
  }

  Widget _metaItem(IconData icon, String text) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14.sp,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
            SizedBox(width: 4.w),
            Text(
              text,
              style: TextStyle(
                fontSize: 12.sp,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
            ),
          ],
        );
      },
    );
  }
}
