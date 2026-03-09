import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../widgets/cards/card_styles.dart';

class CarCard extends StatelessWidget {
  final String brand;
  final String type;
  final String fuelType;
  final String transmission;
  final String mileage;
  final String ageLimit;
  final String deposit;
  final String location;
  final String company;
  final double rating;
  final int reviewCount;
  final String dailyPrice;
  final String totalPrice;
  final bool isFreeCancellation;
  final String imagePath;
  final VoidCallback? onTap;
  final bool isFavorited;
  final VoidCallback? onFavoriteToggle;
  final VoidCallback? onCall;
  final VoidCallback? onMessage;
  final VoidCallback? onWhatsApp;

  const CarCard({
    super.key,
    required this.brand,
    required this.type,
    required this.fuelType,
    required this.transmission,
    required this.mileage,
    required this.ageLimit,
    required this.deposit,
    required this.location,
    required this.company,
    required this.rating,
    required this.reviewCount,
    required this.dailyPrice,
    required this.totalPrice,
    required this.isFreeCancellation,
    required this.imagePath,
    this.onTap,
    this.isFavorited = false,
    this.onFavoriteToggle,
    this.onCall,
    this.onMessage,
    this.onWhatsApp,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final secondaryTextColor = isDark ? Colors.grey[400] : Colors.grey[600];
    final tertiaryTextColor = isDark ? Colors.grey[400] : Colors.grey[700];
    final placeholderColor = isDark
        ? theme.colorScheme.surfaceContainerHigh
        : Colors.grey[200];

    final specChips = [
      AppCardStyles.chip(fuelType, icon: Icons.local_gas_station),
      AppCardStyles.chip(transmission, icon: Icons.settings),
      AppCardStyles.chip(mileage, icon: Icons.speed),
      AppCardStyles.chip(ageLimit, icon: Icons.person),
    ];
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(bottom: 18.h),
        decoration: AppCardStyles.container(border: true, context: context),
        child: Padding(
          padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 16.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          brand,
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w700,
                            height: 1.1,
                            color: theme.colorScheme.onSurface,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          type,
                          style: TextStyle(
                            fontSize: 13.sp,
                            color: secondaryTextColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 12.w),
                  SizedBox(
                    width: 120.w,
                    height: 80.h,
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14.r),
                          child: Container(
                            width: 120.w,
                            height: 80.h,
                            color: placeholderColor,
                            child: imagePath.isNotEmpty
                                ? Image.network(
                                    imagePath,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) =>
                                        _placeholderImage(isDark),
                                  )
                                : _placeholderImage(isDark),
                          ),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: AppCardStyles.favoriteButton(
                            isFav: isFavorited,
                            onTap: onFavoriteToggle,
                            size: 34,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 14.h),
              Wrap(spacing: 8.w, runSpacing: 6.h, children: specChips),
              SizedBox(height: 12.h),
              Row(
                children: [
                  Icon(
                    Icons.account_balance_wallet_outlined,
                    size: 15.sp,
                    color: secondaryTextColor,
                  ),
                  SizedBox(width: 4.w),
                  Text(
                    'Depozito: $deposit',
                    style: TextStyle(fontSize: 12.sp, color: tertiaryTextColor),
                  ),
                  SizedBox(width: 10.w),
                  if (isFreeCancellation)
                    AppCardStyles.chip(
                      'Ücretsiz iptal',
                      icon: Icons.check_circle,
                      color: isDark ? Colors.green[800] : Colors.green[100],
                    ),
                ],
              ),
              SizedBox(height: 8.h),
              Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 15.sp,
                    color: secondaryTextColor,
                  ),
                  SizedBox(width: 4.w),
                  Expanded(
                    child: Text(
                      location,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: tertiaryTextColor,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 14.h),
              Builder(
                builder: (context) {
                  final theme = Theme.of(context);
                  final isDark = theme.brightness == Brightness.dark;
                  final secondaryTextColor = isDark
                      ? Colors.grey[400]
                      : Colors.grey[600];
                  final buttonBgColor = isDark
                      ? theme.colorScheme.surfaceContainerHigh
                      : Colors.grey[100];

                  return Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 6.h,
                        ),
                        decoration: BoxDecoration(
                          color: buttonBgColor,
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Text(
                          company,
                          style: TextStyle(
                            fontSize: 11.sp,
                            fontWeight: FontWeight.w600,
                            letterSpacing: .3,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ),
                      SizedBox(width: 10.w),
                      AppCardStyles.ratingBadge(rating),
                      SizedBox(width: 6.w),
                      Text(
                        '($reviewCount)',
                        style: TextStyle(
                          fontSize: 10.sp,
                          color: secondaryTextColor,
                        ),
                      ),
                      const Spacer(),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            dailyPrice,
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            'Toplam: $totalPrice',
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: secondaryTextColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  );
                },
              ),
              SizedBox(height: 14.h),
              if (onCall != null || onMessage != null || onWhatsApp != null)
                Builder(
                  builder: (context) {
                    final theme = Theme.of(context);
                    final isDark = theme.brightness == Brightness.dark;
                    final buttonBgColor = isDark
                        ? theme.colorScheme.surfaceContainerHigh
                        : Colors.grey[100];

                    return Row(
                      children: [
                        if (onCall != null)
                          _miniActionBtn(
                            icon: Icons.phone,
                            onTap: onCall,
                            color: Colors.blue,
                          ),
                        if (onMessage != null) ...[
                          SizedBox(width: 8.w),
                          _miniActionBtn(
                            icon: Icons.message,
                            onTap: onMessage,
                            color: Colors.indigo,
                          ),
                        ],
                        if (onWhatsApp != null) ...[
                          SizedBox(width: 8.w),
                          _miniActionBtn(
                            icon: Icons.chat,
                            onTap: onWhatsApp,
                            color: Colors.green,
                          ),
                        ],
                        const Spacer(),
                        TextButton.icon(
                          onPressed: onTap,
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.symmetric(
                              horizontal: 14.w,
                              vertical: 8.h,
                            ),
                            backgroundColor: buttonBgColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20.r),
                            ),
                          ),
                          icon: Icon(
                            Icons.keyboard_arrow_right,
                            color: theme.colorScheme.primary,
                          ),
                          label: Text(
                            'Detay',
                            style: TextStyle(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeholderImage(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [Colors.blue[900]!, Colors.blue[800]!]
              : [Colors.blue[100]!, Colors.blue[200]!],
        ),
      ),
      child: Center(
        child: Icon(
          Icons.directions_car,
          size: 32.sp,
          color: isDark ? Colors.blue[300] : Colors.blue[600],
        ),
      ),
    );
  }

  // _buildSpecItem removed (replaced by AppCardStyles.chip usage)

  Widget _miniActionBtn({
    required IconData icon,
    required VoidCallback? onTap,
    required Color color,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: Container(
        padding: EdgeInsets.all(6.w),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Icon(icon, size: 16.sp, color: color),
      ),
    );
  }
}
