import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../../data/models/guide/guide_model.dart';

class GuideCardItem extends StatelessWidget {
  final GuideModel guide;
  final VoidCallback onEdit;
  final VoidCallback onAvailability;
  final VoidCallback onDelete;
  final VoidCallback onReviews;

  const GuideCardItem({
    super.key,
    required this.guide,
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
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _avatar(),
          SizedBox(width: 12.w),
          Expanded(child: _info(context)),
          _menu(context),
        ],
      ),
    );
  }

  Widget _avatar() {
    final img = guide.images.isNotEmpty
        ? NetworkImage(guide.images.first)
        : null;
    return CircleAvatar(
      radius: 28.r,
      backgroundImage: img,
      child: img == null
          ? Icon(Icons.person, size: 28.r, color: Colors.grey[500])
          : null,
    );
  }

  Widget _info(BuildContext ctx) {
    final isDark = Theme.of(ctx).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                guide.name,
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : Colors.black87,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Icon(Icons.star, size: 14.sp, color: Colors.amber),
            SizedBox(width: 2.w),
            Text(
              guide.rating.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
        SizedBox(height: 4.h),
        Text(
          _shortList(guide.specialties),
          style: TextStyle(
            fontSize: 12.sp,
            color: isDark ? Colors.blueGrey[300] : Colors.blueGrey[600],
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        SizedBox(height: 4.h),
        Text(
          '${guide.yearsExperience} yıl deneyim • ${guide.dailyRate.toStringAsFixed(0)}₺/gün',
          style: TextStyle(
            fontSize: 11.sp,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.grey[400] : Colors.grey[700],
          ),
        ),
        SizedBox(height: 6.h),
        Wrap(
          spacing: 6.w,
          runSpacing: 4.h,
          children: guide.languages
              .take(4)
              .map((l) => _chip(l, isDark))
              .toList(),
        ),
      ],
    );
  }

  String _shortList(List<String> list) {
    if (list.isEmpty) return '—';
    final take = list.length > 3 ? list.sublist(0, 3) : list;
    return take.join(', ') + (list.length > 3 ? '…' : '');
  }

  Widget _chip(String t, [bool isDark = false]) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[100],
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Text(
        t,
        style: TextStyle(
          fontSize: 10.sp,
          fontWeight: FontWeight.w600,
          color: isDark ? Colors.grey[300] : Colors.black87,
        ),
      ),
    );
  }

  Widget _menu(BuildContext ctx) {
    final isDark = Theme.of(ctx).brightness == Brightness.dark;
    return PopupMenuButton<String>(
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
          case 'del':
            onDelete();
            break;
        }
      },
      itemBuilder: (_) => [
        const PopupMenuItem(value: 'edit', child: Text('Düzenle')),
        const PopupMenuItem(value: 'avail', child: Text('Müsaitlik')),
        const PopupMenuItem(value: 'reviews', child: Text('Yorumlar')),
        const PopupMenuItem(value: 'del', child: Text('Sil')),
      ],
      child: Icon(
        Icons.more_vert,
        size: 20.sp,
        color: isDark ? Colors.grey[400] : Colors.grey[600],
      ),
    );
  }
}
