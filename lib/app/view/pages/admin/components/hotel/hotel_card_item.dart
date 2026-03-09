import 'dart:io';

import 'package:flutter/material.dart';
import '../../../../themes/theme.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../../data/models/models.dart';

class HotelCardItem extends StatelessWidget {
  const HotelCardItem({
    super.key,
    required this.hotel,
    required this.onEdit,
    required this.onAvailability,
    required this.onDelete,
    required this.onReviews,
  });

  final HotelModel hotel;
  final VoidCallback onEdit;
  final VoidCallback onAvailability;
  final VoidCallback onDelete;
  final VoidCallback onReviews;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      margin: EdgeInsets.only(bottom: 4.h),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(14.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            spreadRadius: 1,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14.r),
          onTap: onEdit,
          child: Padding(
            padding: EdgeInsets.all(12.w),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10.r),
                  child: Container(
                    width: 80.w,
                    height: 80.w,
                    color: Colors.grey[200],
                    child: _buildThumb(hotel),
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Text(
                              hotel.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 6.h),
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 14.sp,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                          SizedBox(width: 4.w),
                          Expanded(
                            child: Text(
                              '${hotel.city}, ${hotel.state}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: isDark
                                    ? Colors.grey[400]
                                    : Colors.grey[600],
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8.h),
                      Wrap(
                        spacing: 8.w,
                        runSpacing: 6.h,
                        children: [
                          _pill(
                            icon: Icons.star_rounded,
                            label:
                                '${hotel.rating.toStringAsFixed(1)} • ${hotel.reviewCount}',
                            bg: Colors.amber.withOpacity(0.15),
                            fg: Colors.amber[800]!,
                          ),
                          if ((hotel.category).toString().isNotEmpty)
                            _pill(
                              icon: Icons.category_outlined,
                              label: hotel.category,
                              bg: AppColors.medinaGreen40.withOpacity(0.1),
                              fg: AppColors.medinaGreen40,
                            ),
                          if (hotel.isActive == false)
                            _pill(
                              icon: Icons.pause_circle_outline,
                              label: 'Pasif',
                              bg: Colors.red.withOpacity(0.08),
                              fg: Colors.red[700]!,
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                PopupMenuButton(
                  icon: Icon(Icons.more_vert, size: 20.sp),
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit, size: 16.sp),
                          SizedBox(width: 8.w),
                          const Text('Düzenle'),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'availability',
                      child: Row(
                        children: [
                          Icon(Icons.calendar_today, size: 16.sp),
                          SizedBox(width: 8.w),
                          const Text('Doluluk Oranı'),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'reviews',
                      child: Row(
                        children: [
                          Icon(Icons.reviews, size: 16.sp),
                          SizedBox(width: 8.w),
                          const Text('Yorumlar'),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, size: 16.sp, color: Colors.red),
                          SizedBox(width: 8.w),
                          const Text(
                            'Sil',
                            style: TextStyle(color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) {
                    switch (value) {
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
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helpers
  Widget _buildThumb(HotelModel hotel) {
    if (hotel.images.isNotEmpty) {
      final src = hotel.images.first;
      final bool isUrl =
          src.startsWith('http://') || src.startsWith('https://');
      if (isUrl) {
        return Image.network(
          src,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stack) => _thumbFallback(),
        );
      } else {
        return Image.file(
          File(src),
          fit: BoxFit.cover,
          errorBuilder: (context, error, stack) => _thumbFallback(),
        );
      }
    }
    return _thumbFallback();
  }

  Widget _thumbFallback() {
    return Container(
      color: Colors.grey[300],
      child: Icon(Icons.hotel, size: 28.sp, color: Colors.grey[600]),
    );
  }

  Widget _pill({
    required IconData icon,
    required String label,
    required Color bg,
    required Color fg,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14.sp, color: fg),
          SizedBox(width: 4.w),
          Text(
            label,
            style: TextStyle(
              fontSize: 11.sp,
              color: fg,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
