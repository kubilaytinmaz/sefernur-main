import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/guide_search_controller.dart';
import '../../../../data/models/guide/guide_model.dart';
import '../../../../data/services/currency/currency_service.dart';
import '../../../../data/services/favorite/favorite_service.dart';
import '../../../widgets/cards/card_styles.dart';

class GuideCard extends StatelessWidget {
  final GuideModel guide;
  final GuideSearchController controller;
  final VoidCallback onTap;
  const GuideCard({
    super.key,
    required this.guide,
    required this.controller,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final placeholderBgColor = isDark
        ? theme.colorScheme.surfaceContainerHigh
        : Colors.blueGrey[50];
    final placeholderIconColor = isDark
        ? Colors.blueGrey[400]
        : Colors.blueGrey[300];
    final languagesTextColor = isDark ? Colors.grey[400] : Colors.blueGrey[600];
    final locationIconColor = isDark ? Colors.grey[500] : Colors.blueGrey[400];
    final locationTextColor = isDark ? Colors.grey[400] : Colors.blueGrey[600];

    final favService = Get.isRegistered<FavoriteService>()
        ? Get.find<FavoriteService>()
        : null;
    final img = guide.images.isNotEmpty ? guide.images.first : null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: AppCardStyles.container(border: true, context: context),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Container(
                  height: 120.h,
                  width: double.infinity,
                  color: placeholderBgColor,
                  child: img != null
                      ? Image.network(img, fit: BoxFit.cover)
                      : Icon(
                          Icons.person,
                          size: 52.sp,
                          color: placeholderIconColor,
                        ),
                ),
                AppCardStyles.gradientOverlay(
                  beginOpacity: .08,
                  endOpacity: .55,
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Obx(
                    () => AppCardStyles.favoriteButton(
                      isFav:
                          (favService?.isFavorite('guide', guide.id ?? '') ??
                          controller.isFavorite(guide.id)),
                      onTap: guide.id == null
                          ? null
                          : () {
                              if (favService != null && guide.id != null) {
                                final meta = favService.buildMetaForEntity(
                                  type: 'guide',
                                  model: guide,
                                );
                                favService.toggle(
                                  type: 'guide',
                                  targetId: guide.id!,
                                  meta: meta,
                                );
                              } else if (guide.id != null) {
                                controller.toggleFavorite(guide.id!);
                              }
                            },
                      size: 38,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 10.h,
                  left: 12.w,
                  child: AppCardStyles.ratingBadge(guide.rating),
                ),
              ],
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 14.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    guide.name,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w700,
                      height: 1.15,
                      color: theme.colorScheme.onSurface,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 8.h),
                  Row(
                    children: [
                      _iconStat(
                        Icons.work_outline,
                        '${guide.yearsExperience}y',
                        context: context,
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: Obx(() {
                            final currencyService = Get.find<CurrencyService>();
                            return Text(
                              currencyService.currentRate.value.formatBoth(
                                guide.dailyRate,
                              ),
                              style: TextStyle(
                                fontSize: 12.sp,
                                fontWeight: FontWeight.w700,
                                color: isDark
                                    ? Colors.green[400]
                                    : Colors.green[700],
                              ),
                              overflow: TextOverflow.fade,
                              softWrap: false,
                            );
                          }),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 10.h),
                  if (guide.languages.isNotEmpty)
                    Text(
                      guide.languages.take(4).join(', '),
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: languagesTextColor,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  if (guide.serviceAddresses.isNotEmpty) ...[
                    SizedBox(height: 8.h),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 12.sp,
                          color: locationIconColor,
                        ),
                        SizedBox(width: 4.w),
                        Expanded(
                          child: Text(
                            guide.serviceAddresses
                                .take(2)
                                .map((a) => a.short())
                                .join(' • '),
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: locationTextColor,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                  SizedBox(height: 12.h),
                  Wrap(
                    spacing: 8.w,
                    runSpacing: 6.h,
                    children: guide.specialties
                        .take(2)
                        .map((s) => _chip(s))
                        .toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _iconStat(
    IconData icon,
    String value, {
    Color? color,
    required BuildContext context,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final iconColor = color ?? (isDark ? Colors.grey[500] : Colors.grey[600]);
    final textColor = isDark ? Colors.grey[300] : Colors.grey[800];

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13.sp, color: iconColor),
        SizedBox(width: 3.w),
        Text(
          value,
          style: TextStyle(
            fontSize: 11.sp,
            fontWeight: FontWeight.w600,
            color: textColor,
          ),
        ),
      ],
    );
  }

  Widget _chip(String t) {
    return AppCardStyles.chip(t);
  }
}
