import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../widgets/cards/card_styles.dart';

class HotelCard extends StatelessWidget {
  final String id;
  final String name;
  final double rating;
  final int reviewCount;
  final String roomType;
  final String location;
  final String distance;
  final String amenity;
  final String? originalPrice;
  final String discountedPrice;
  final String? discount;
  final String totalNights;
  final String imagePath;
  final bool isFavorite;
  final VoidCallback? onFavoriteToggle;
  final VoidCallback? onTap;
  final VoidCallback? onCall;
  final VoidCallback? onMessage;
  final VoidCallback? onWhatsapp;

  const HotelCard({
    super.key,
    required this.id,
    required this.name,
    required this.rating,
    required this.reviewCount,
    required this.roomType,
    required this.location,
    required this.distance,
    required this.amenity,
    this.originalPrice,
    required this.discountedPrice,
    this.discount,
    required this.totalNights,
    required this.imagePath,
    this.isFavorite = false,
    this.onFavoriteToggle,
    this.onTap,
    this.onCall,
    this.onMessage,
    this.onWhatsapp,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(bottom: 18.h),
  decoration: AppCardStyles.container(border: true, context: context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(children: [
              _buildImage(context),
              AppCardStyles.gradientOverlay(),
              Positioned(
                top: 12.h,
                right: 12.w,
                child: AppCardStyles.favoriteButton(
                  isFav: isFavorite,
                  onTap: onFavoriteToggle,
                  size: 38,
                ),
              ),
              if (discount != null)
                Positioned(
                  bottom: 12.h,
                  left: 12.w,
                  child: AppCardStyles.badge(
                    color: Colors.blueAccent.withOpacity(.85),
                    child: Text(
                      discount!,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              Positioned(
                bottom: 12.h,
                right: 12.w,
                child: AppCardStyles.ratingBadge(rating),
              ),
            ]),
            Padding(
              padding: EdgeInsets.fromLTRB(16.w, 14.h, 16.w, 16.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(
                      child: Text(
                        name,
                        style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w700, height: 1.15, color: theme.colorScheme.onSurface),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ]),
                  SizedBox(height: 8.h),
                  Row(children: [
                    Icon(Icons.bed, size: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                    SizedBox(width: 4.w),
                    Text(roomType, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[700])),
                  ]),
                  SizedBox(height: 10.h),
                  Row(children: [
                    Icon(Icons.location_on_outlined, size: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                    SizedBox(width: 4.w),
                    Expanded(child: Text(location, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[700]), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    SizedBox(width: 6.w),
                    Icon(Icons.near_me_outlined, size: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                    SizedBox(width: 4.w),
                    Text(distance, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[700])),
                  ]),
                  SizedBox(height: 6.h),
                  Row(children: [
                    Icon(Icons.restaurant_outlined, size: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                    SizedBox(width: 4.w),
                    Text(amenity, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[700])),
                  ]),
                  SizedBox(height: 14.h),
                  Row(children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      if (originalPrice != null)
                        Text(originalPrice!, style: TextStyle(fontSize: 11.sp, color: Colors.red, decoration: TextDecoration.lineThrough)),
                      Text(discountedPrice, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
                      Text(totalNights, style: TextStyle(fontSize: 10.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
                    ])),
                    Row(children: [
                      _actionIcon(Icons.phone, onCall, context: context),
                      SizedBox(width: 8.w),
                      _actionIcon(Icons.message_outlined, onMessage, context: context),
                      SizedBox(width: 8.w),
                      _actionIcon(Icons.chat, onWhatsapp, color: Colors.green, context: context),
                    ])
                  ])
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildImage(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
  final border = BorderRadius.vertical(top: AppCardStyles.radius.topLeft);
    if (imagePath.isEmpty) {
      return Container(
        height: 200.h,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: border,
          color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[300],
        ),
        child: Icon(Icons.photo, size: 48.sp, color: isDark ? Colors.grey[500] : Colors.grey[600]),
      );
    }
    final isNetwork = imagePath.startsWith('http');
    final isFile = imagePath.startsWith('/') || imagePath.startsWith('C:');
    Widget img;
    if (isNetwork) {
      img = Image.network(imagePath, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _fallback(context));
    } else if (isFile) {
      img = Image.file(File(imagePath), fit: BoxFit.cover, errorBuilder: (_, __, ___) => _fallback(context));
    } else {
      img = Image.asset(imagePath, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _fallback(context));
    }
    return ClipRRect(
      borderRadius: border,
  child: SizedBox(height: 200.h, width: double.infinity, child: img),
    );
  }

  Widget _fallback(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[300],
      child: Icon(Icons.broken_image, color: isDark ? Colors.grey[500] : Colors.grey[600]),
    );
  }

  Widget _actionIcon(IconData icon, VoidCallback? cb, {Color? color, required BuildContext context}) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return InkWell(
      onTap: cb,
      borderRadius: BorderRadius.circular(8.r),
      child: Container(
        padding: EdgeInsets.all(6.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[100],
          borderRadius: BorderRadius.circular(8.r),
        ),
        child: Icon(icon, size: 18.sp, color: color ?? (isDark ? Colors.grey[300] : Colors.grey[800])),
      ),
    );
  }
}
