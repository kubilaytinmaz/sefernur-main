import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../../data/models/tour/tour_model.dart';
import '../../../../../data/services/currency/currency_service.dart';
import '../../../../themes/theme.dart';

class TourCardItem extends StatelessWidget {
  final TourModel tour;
  final VoidCallback onEdit;
  final VoidCallback onAvailability;
  final VoidCallback onDelete;
  final VoidCallback onReviews;
  const TourCardItem({
    super.key,
    required this.tour,
    required this.onEdit,
    required this.onAvailability,
    required this.onDelete,
    required this.onReviews,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: EdgeInsets.all(14.w),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: isDark ? Colors.grey[800]! : Colors.grey[300]!,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Thumb(images: tour.images),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        tour.title,
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    PopupMenuButton<String>(
                      onSelected: (v) {
                        switch (v) {
                          case 'edit':
                            onEdit();
                            break;
                          case 'avail':
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
                      itemBuilder: (_) => const [
                        PopupMenuItem(
                          value: 'edit',
                          child: ListTile(
                            leading: Icon(Icons.edit),
                            title: Text('Düzenle'),
                          ),
                        ),
                        PopupMenuItem(
                          value: 'avail',
                          child: ListTile(
                            leading: Icon(Icons.event_available),
                            title: Text('Müsaitlik'),
                          ),
                        ),
                        PopupMenuItem(
                          value: 'reviews',
                          child: ListTile(
                            leading: Icon(Icons.reviews),
                            title: Text('Yorumlar'),
                          ),
                        ),
                        PopupMenuItem(
                          value: 'delete',
                          child: ListTile(
                            leading: Icon(Icons.delete, color: Colors.red),
                            title: Text('Sil'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                SizedBox(height: 4.h),
                Wrap(
                  spacing: 6.w,
                  runSpacing: 4.h,
                  children: [
                    _chip('${tour.durationDays} Gün'),
                    if (tour.category.isNotEmpty) _chip(tour.category),
                    if (tour.serviceType != null) _chip(tour.serviceType!),
                    if (tour.basePrice > 0)
                      Obx(() {
                        final currencyService = Get.find<CurrencyService>();
                        // USD önce, TRY sonra göster (basePrice USD olarak saklanır)
                        final tryPrice = currencyService.toTRY(tour.basePrice);
                        final usdFormatted = NumberFormat('#,##0', 'tr_TR').format(tour.basePrice);
                        final tryFormatted = NumberFormat('#,##0', 'tr_TR').format(tryPrice);
                        return _chip(
                          '\$$usdFormatted / $tryFormatted₺',
                        );
                      }),
                    if (tour.rating > 0)
                      _chip(
                        '⭐ ${tour.rating.toStringAsFixed(1)} (${tour.reviewCount})',
                      ),
                    // Başlangıç tarihi varsa göster
                    if (tour.startDate != null)
                      _dateChip(tour.startDate!),
                  ],
                ),
                SizedBox(height: 6.h),
                Text(
                  _programShort(),
                  style: TextStyle(
                    fontSize: 11.5.sp,
                    color: isDark ? Colors.grey[400] : Colors.grey[700],
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 6.h),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: tour.serviceAddresses.take(4).map((a) {
                      final txt = a.city.isNotEmpty
                          ? a.city
                          : (a.country.isNotEmpty
                                ? a.country
                                : a.address.split(',').first);
                      return Padding(
                        padding: EdgeInsets.only(right: 6.w),
                        child: _region(txt),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _dateChip(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final isPast = date.isBefore(today);
    final dateStr = '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
    
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final color = isPast 
            ? (isDark ? Colors.red.shade400 : Colors.red.shade600)
            : (isDark ? Colors.blue.shade400 : Colors.blue.shade600);
        return Container(
          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
          decoration: BoxDecoration(
            color: color.withValues(alpha: .15),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isPast ? Icons.history : Icons.calendar_today,
                size: 10.sp,
                color: color,
              ),
              SizedBox(width: 4.w),
              Text(
                dateStr,
                style: TextStyle(
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _programShort() {
    if (tour.program.isEmpty) return tour.description;
    final firstTwo = tour.program.take(2).map((d) {
      final label = (d.dayLabel == null || d.dayLabel!.isEmpty)
          ? '${d.day}.'
          : d.dayLabel!;
      return '$label ${d.title}';
    });
    return firstTwo.join(' • ');
  }

  Widget _chip(String t) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
          decoration: BoxDecoration(
            color: isDark ? Colors.grey[800] : Colors.grey[100],
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            t,
            style: TextStyle(
              fontSize: 10.5.sp,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.grey[300] : Colors.black87,
            ),
          ),
        );
      },
    );
  }

  Widget _region(String r) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final color = isDark ? Colors.green.shade400 : AppColors.medinaGreen40;
        return Container(
          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
          decoration: BoxDecoration(
            color: color.withValues(alpha: .1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            r,
            style: TextStyle(
              fontSize: 10.sp,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        );
      },
    );
  }
}

class _Thumb extends StatelessWidget {
  final List<String> images;
  const _Thumb({required this.images});
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final url = images.isNotEmpty ? images.first : null;
    return ClipRRect(
      borderRadius: BorderRadius.circular(14.r),
      child: Container(
        width: 86.w,
        height: 86.w,
        color: isDark ? Colors.grey[800] : Colors.grey[200],
        child: url == null
            ? Icon(
                Icons.landscape,
                color: isDark ? Colors.grey[400] : Colors.grey[500],
                size: 32.sp,
              )
            : Image.network(url, fit: BoxFit.cover),
      ),
    );
  }
}
