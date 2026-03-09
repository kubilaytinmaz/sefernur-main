import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../data/services/review/review_service.dart';
import 'shared/empty_state.dart';

class ReviewsTab extends StatelessWidget {
  const ReviewsTab({super.key});
  @override
  Widget build(BuildContext context) {
    final service = Get.find<ReviewService>();
    return Padding(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ReviewFilterChips(service: service),
          SizedBox(height: 16.h),
          Expanded(
            child: Obx(() {
              if (service.filtered.isEmpty) {
                return const EmptyState(
                  message: 'Henüz yorumunuz bulunmuyor',
                  icon: Icons.rate_review_outlined,
                );
              }
              return ListView.builder(
                padding: EdgeInsets.only(bottom: 12.h),
                itemCount: service.filtered.length,
                itemBuilder: (context, index) {
                  final r = service.filtered[index];
                  final rating = (r['rating'] is int)
                      ? r['rating'] as int
                      : (r['rating'] as num?)?.round() ?? 0;
                  final comment = (r['comment'] ?? '') as String;
                  final dateStr = (r['createdAt'] ?? r['updatedAt'] ?? '');
                  DateTime? date;
                  try {
                    if (dateStr is String && dateStr.isNotEmpty)
                      date = DateTime.tryParse(dateStr);
                  } catch (_) {}
                  final dateDisplay = date != null
                      ? DateFormat('dd/MM/yyyy').format(date)
                      : '';
                  final type = (r['targetType'] ?? r['type'] ?? '-') as String;
                  final serviceName =
                      (r['serviceName'] ?? r['title'] ?? r['name'] ?? '-')
                          as String;
                  return _ReviewCard(
                    type: type,
                    rating: rating,
                    serviceName: serviceName,
                    comment: comment,
                    dateDisplay: dateDisplay,
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final String type;
  final int rating;
  final String serviceName;
  final String comment;
  final String dateDisplay;
  const _ReviewCard({
    required this.type,
    required this.rating,
    required this.serviceName,
    required this.comment,
    required this.dateDisplay,
  });
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      margin: EdgeInsets.only(bottom: 14.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(color: Colors.green.shade600.withOpacity(0.12)),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black26
                : Colors.green.shade600.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: Colors.green.shade600.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10.r),
                ),
                child: Text(
                  type,
                  style: TextStyle(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.green.shade600,
                  ),
                ),
              ),
              const Spacer(),
              Row(
                children: List.generate(
                  5,
                  (i) => Icon(
                    i < rating ? Icons.star : Icons.star_border,
                    size: 16.sp,
                    color: Colors.amber,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 10.h),
          Text(
            serviceName,
            style: TextStyle(
              fontSize: 15.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
          if (comment.isNotEmpty) ...[
            SizedBox(height: 6.h),
            Text(
              comment,
              style: TextStyle(
                fontSize: 13.sp,
                color: theme.colorScheme.onSurfaceVariant,
                height: 1.4,
              ),
            ),
          ],
          if (dateDisplay.isNotEmpty) ...[
            SizedBox(height: 8.h),
            Text(
              dateDisplay,
              style: TextStyle(
                fontSize: 11.sp,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ReviewFilterChips extends StatelessWidget {
  final ReviewService service;
  const _ReviewFilterChips({required this.service});
  static const Map<String, String> _labels = {
    'hotel': 'Otel',
    'car': 'Araç',
    'transfer': 'Transfer',
    'guide': 'Rehber',
    'tour': 'Tur',
  };
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Obx(() {
      final types = service.availableTypes.toList()..sort();
      final items = [
        ('Tümü', 'all'),
        ...types.map((t) => (_labels[t] ?? t, t)),
      ];
      return SizedBox(
        height: 36.h,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final (label, key) in items) ...[
                _chip(theme, label, key, service.activeFilter.value == key),
                SizedBox(width: 6.w),
              ],
            ],
          ),
        ),
      );
    });
  }

  Widget _chip(ThemeData theme, String label, String key, bool selected) {
    final isDark = theme.brightness == Brightness.dark;
    return InkWell(
      borderRadius: BorderRadius.circular(18.r),
      onTap: () => service.setFilter(key),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: selected
              ? Colors.green.shade600
              : (isDark
                    ? theme.colorScheme.surfaceContainerHigh
                    : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(18.r),
          border: Border.all(
            color: selected
                ? Colors.green.shade600
                : (isDark ? theme.colorScheme.outline : Colors.grey.shade300),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (selected) ...[
              Icon(Icons.check, size: 14.sp, color: Colors.white),
              SizedBox(width: 4.w),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
