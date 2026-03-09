import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../controllers/search/tour_search_controller.dart';
import '../../../../data/models/tour/tour_model.dart';
import '../../../../data/services/currency/currency_service.dart';
import '../../../../data/services/favorite/favorite_service.dart';
import '../../../widgets/cards/card_styles.dart';

class TourCard extends StatelessWidget {
  final TourModel tour;
  final TourSearchController controller;
  final VoidCallback onTap;
  const TourCard({super.key, required this.tour, required this.controller, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final price = controller.priceFor(tour);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currencyService = Get.isRegistered<CurrencyService>() ? Get.find<CurrencyService>() : null;

    return GestureDetector(
      onTap: onTap,
      child: Container(
  decoration: AppCardStyles.container(border: true, context: context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _imageHeader(theme),
            Padding(
              padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 14.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tour.title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w700, height: 1.15, color: theme.colorScheme.onSurface), maxLines: 2, overflow: TextOverflow.ellipsis),
                  SizedBox(height: 6.h),
                  
                  // Mekke/Medine gece bilgisi - her zaman göster
                  Padding(
                    padding: EdgeInsets.only(bottom: 6.h),
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.amber[900]!.withOpacity(0.3) : Colors.amber[50],
                        borderRadius: BorderRadius.circular(8.r),
                        border: Border.all(color: isDark ? Colors.amber[700]! : Colors.amber[200]!),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.nights_stay, size: 14.sp, color: isDark ? Colors.amber[400] : Colors.amber[800]),
                          SizedBox(width: 6.w),
                          Text('Mekke: ${tour.mekkeNights ?? "-"} Gece', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.amber[300] : Colors.amber[900])),
                          Text(' • ', style: TextStyle(color: isDark ? Colors.amber[600] : Colors.amber[400])),
                          Text('Medine: ${tour.medineNights ?? "-"} Gece', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.amber[300] : Colors.amber[900])),
                        ],
                      ),
                    ),
                  ),
                  
                  if (tour.serviceType != null)
                    Padding(
                      padding: EdgeInsets.only(bottom: 6.h),
                      child: Text(tour.serviceType!, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.blueGrey[300] : Colors.blueGrey[700], fontWeight: FontWeight.w600)),
                    ),

                  Builder(builder: (_){
                    DateTime? start = tour.startDate;
                    DateTime? end = tour.endDate;
                    if (start == null && tour.availability.isNotEmpty){
                      final dates = tour.availability.values.map((a){
                        return DateTime.tryParse(a.date);
                      }).whereType<DateTime>().toList();
                      if (dates.isNotEmpty){ dates.sort(); start = dates.first; }
                    }
                    if (start == null) return const SizedBox();
                    end ??= start.add(Duration(days: tour.durationDays));
                    
                    final f = DateFormat('dd MMMM yyyy', 'tr_TR');
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Gidiş: ${f.format(start)}', style: TextStyle(fontSize: 11.sp, color: isDark ? Colors.grey[400] : Colors.grey[800])),
                        Text('Dönüş: ${f.format(end)}', style: TextStyle(fontSize: 11.sp, color: isDark ? Colors.grey[400] : Colors.grey[800])),
                      ],
                    );
                  }),
                  SizedBox(height: 8.h),

                  if (tour.flightDepartureFrom != null || tour.flightReturnFrom != null)
                    Container(
                      padding: EdgeInsets.all(8.w),
                      decoration: BoxDecoration(color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50], borderRadius: BorderRadius.circular(8.r)),
                      child: Row(
                        children: [
                          if (tour.airline != null) ...[
                            Icon(Icons.flight_takeoff, size: 16.sp, color: theme.primaryColor),
                            SizedBox(width: 8.w),
                          ],
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (tour.flightDepartureFrom != null && tour.flightDepartureTo != null)
                                  Text('${tour.flightDepartureFrom} -> ${tour.flightDepartureTo}', style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w600)),
                                if (tour.flightReturnFrom != null && tour.flightReturnTo != null)
                                  Text('${tour.flightReturnFrom} -> ${tour.flightReturnTo}', style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  SizedBox(height: 12.h),
                  _priceRow(price, currencyService, isDark),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _imageHeader(ThemeData theme){
    final isDark = theme.brightness == Brightness.dark;
  final img = tour.images.isNotEmpty ? tour.images.first : null;
  final favService = Get.isRegistered<FavoriteService>() ? Get.find<FavoriteService>() : null;
    final heroTag = 'tour_img_${tour.id ?? tour.title}';
    return ClipRRect(
      borderRadius: AppCardStyles.radius,
      child: Stack(
        children: [
          Hero(
            tag: heroTag,
            child: Container(
              height: 160.h,
              width: double.infinity,
              color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.blueGrey[50],
              child: img==null ? Icon(Icons.landscape, size:44.sp, color: isDark ? Colors.blueGrey[400] : Colors.blueGrey[300]) : Image.network(img, fit: BoxFit.cover, width: double.infinity, height: 160.h, errorBuilder: (_,__,___)=> Icon(Icons.landscape, size:44.sp, color: isDark ? Colors.blueGrey[400] : Colors.blueGrey[300])),
            ),
          ),
          AppCardStyles.gradientOverlay(),
          Positioned(
            top: 10.h,
            left: 10.w,
            child: AppCardStyles.badge(
              color: theme.primaryColor.withOpacity(.85),
              child: Row(children:[
                Icon(Icons.timer, size: 12.sp, color: Colors.white),
                SizedBox(width:4.w),
                Text('${tour.durationDays} Gün / ${tour.category}', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: Colors.white))
              ]),
            ),
          ),
          if (tour.id != null)
            Positioned(
              top: 10.h,
              right: 10.w,
              child: Obx(() {
                final isFav = favService?.isFavorite('tour', tour.id!) ?? controller.isFavorite(tour.id);
                return AppCardStyles.favoriteButton(
                  isFav: isFav,
                  onTap: tour.id == null
                      ? null
                      : () {
                          if (favService != null) {
                            final meta = favService.buildMetaForEntity(type: 'tour', model: tour);
                            favService.toggle(type: 'tour', targetId: tour.id!, meta: meta);
                          } else {
                            controller.toggleFavorite(tour.id!);
                          }
                        },
                );
              }),
            ),
          Positioned(
            bottom: 12.h,
            left: 12.w,
            child: AppCardStyles.ratingBadge(tour.rating),
          ),
          // Havayolu logosu - sağ alt
          if (tour.airline != null && tour.airline!.isNotEmpty)
            Positioned(
              bottom: 12.h,
              right: 12.w,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(8.r),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (tour.airlineLogo != null && tour.airlineLogo!.isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4.r),
                        child: Image.network(
                          tour.airlineLogo!,
                          width: 24.w,
                          height: 18.h,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => Icon(Icons.flight, size: 14.sp, color: theme.primaryColor),
                        ),
                      )
                    else
                      Icon(Icons.flight, size: 14.sp, color: theme.primaryColor),
                    SizedBox(width: 4.w),
                    Text(tour.airline!, style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w600, color: theme.primaryColor)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _priceRow(double price, CurrencyService? currencyService, bool isDark) {
    return Row(children: [
      Obx(() {
        final formattedPrice = currencyService != null
            ? currencyService.currentRate.value.formatBoth(price)
            : '₺${price.toStringAsFixed(0)}';
        return Text(formattedPrice,
            style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.green[400] : Colors.green[700]));
      }),
      if (tour.childPrice != null)
        Padding(
            padding: EdgeInsets.only(left: 8.w),
            child: Obx(() {
              final formattedChildPrice = currencyService != null
                  ? currencyService.currentRate.value.formatBoth(tour.childPrice!)
                  : '₺${tour.childPrice!.toStringAsFixed(0)}';
              return Text('Çocuk $formattedChildPrice',
                  style: TextStyle(fontSize: 10.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]));
            })),
    ]);
  }
}
