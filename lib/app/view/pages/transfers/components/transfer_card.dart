import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../controllers/search/transfer_search_controller.dart';
import '../../../../data/models/transfer/transfer_model.dart';
import '../../../../data/services/currency/currency_service.dart';
import '../../../../data/services/favorite/favorite_service.dart';
import '../../../widgets/cards/card_styles.dart';

class TransferCard extends StatelessWidget {
  final TransferModel transfer;
  final TransferSearchController controller;
  final VoidCallback? onTap;
  const TransferCard({super.key, required this.transfer, required this.controller, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currencyService = Get.isRegistered<CurrencyService>() ? Get.find<CurrencyService>() : null;
    
    // Price calculation (special price override)
    final date = controller.travelDate.value;
    final todayKey = date?.toIso8601String().split('T').first;
    final special = todayKey != null ? transfer.availability[todayKey]?.specialPrice : null;
    final double price = special ?? transfer.basePrice;
    final bool hasDiscount = special != null && special < transfer.basePrice;
    
    // Format prices
    final formatter = NumberFormat('#,##0', 'tr_TR');
    final usdFormatted = formatter.format(price.round());
    final tryPrice = currencyService?.toTRY(price) ?? price * 32;
    final tryFormatted = formatter.format(tryPrice.round());
    
    final rating = controller.ratings[transfer.id ?? ''];
    
    // Colors
    final cardBg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final subtitleColor = isDark ? Colors.grey[400] : Colors.grey[600];
    final titleColor = theme.colorScheme.onSurface;
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16.r),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst kısım: Görsel + Araç tipi badge + Favori
            Stack(
              children: [
                // Araç görseli
                Container(
                  width: double.infinity,
                  height: 140.h,
                  color: isDark ? Colors.grey[800] : Colors.grey[200],
                  child: transfer.images.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: transfer.images.first,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(color: isDark ? Colors.grey[700] : Colors.grey[300]),
                          errorWidget: (_, __, ___) => Icon(Icons.directions_car, size: 48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
                        )
                      : Icon(Icons.directions_car, size: 48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
                ),
                // İndirim badge
                if (hasDiscount)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: Colors.redAccent,
                        borderRadius: BorderRadius.circular(6.r),
                      ),
                      child: Text(
                        '-${(((transfer.basePrice - price) / transfer.basePrice) * 100).round()}%',
                        style: TextStyle(color: Colors.white, fontSize: 11.sp, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                // Favori butonu
                if (transfer.id != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Obx(() {
                      final favService = Get.isRegistered<FavoriteService>() ? Get.find<FavoriteService>() : null;
                      final isFav = favService?.isFavorite('transfer', transfer.id!) ?? controller.isFavorite(transfer.id);
                      return AppCardStyles.favoriteButton(
                        isFav: isFav,
                        onTap: () {
                          if (transfer.id == null) return;
                          if (favService != null) {
                            final meta = favService.buildMetaForEntity(type: 'transfer', model: transfer);
                            favService.toggle(type: 'transfer', targetId: transfer.id!, meta: meta);
                          } else {
                            controller.toggleFavorite(transfer.id!);
                          }
                        },
                        size: 36,
                      );
                    }),
                  ),
                // Araç tipi badge (sol alt)
                Positioned(
                  bottom: 10,
                  left: 10,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_getVehicleIcon(transfer.vehicleTypeEnum), size: 14.sp, color: Colors.white),
                        SizedBox(width: 6.w),
                        Text(
                          transfer.vehicleTypeEnum.label.toUpperCase(),
                          style: TextStyle(
                            fontSize: 11.sp,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // İçerik kısmı
            Padding(
              padding: EdgeInsets.all(14.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Araç başlığı ve şirket
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              transfer.vehicleName.isNotEmpty 
                                  ? transfer.vehicleName 
                                  : transfer.vehicleTypeEnum.trLabel,
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w700,
                                color: titleColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 2.h),
                            Text(
                              transfer.company,
                              style: TextStyle(fontSize: 12.sp, color: subtitleColor),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      if (rating != null)
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: Colors.amber.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6.r),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.star_rounded, size: 14.sp, color: Colors.amber[700]),
                              SizedBox(width: 3.w),
                              Text(
                                rating.average.toStringAsFixed(1),
                                style: TextStyle(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.amber[800],
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 12.h),
                  
                  // Kapasite bilgileri satırı
                  Container(
                    padding: EdgeInsets.all(10.w),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[800]!.withValues(alpha: 0.5) : Colors.grey[100],
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _capacityItem(
                          icon: Icons.people_outline,
                          value: '${transfer.capacity}',
                          label: 'Kişi',
                          isDark: isDark,
                        ),
                        _divider(isDark),
                        _capacityItem(
                          icon: Icons.luggage_outlined,
                          value: '${transfer.luggageCapacity}',
                          label: 'Bagaj',
                          isDark: isDark,
                        ),
                        _divider(isDark),
                        _capacityItem(
                          icon: Icons.child_care_outlined,
                          value: '${transfer.childSeatCount}',
                          label: 'Çocuk K.',
                          isDark: isDark,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 12.h),
                  
                  // Özellikler
                  if (transfer.amenityList.isNotEmpty)
                    Wrap(
                      spacing: 6.w,
                      runSpacing: 6.h,
                      children: transfer.amenityList.take(4).map((amenity) {
                        return Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 5.h),
                          decoration: BoxDecoration(
                            color: isDark 
                                ? Colors.green.withValues(alpha: 0.15)
                                : Colors.green.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(6.r),
                            border: Border.all(
                              color: Colors.green.withValues(alpha: 0.3),
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _getAmenityIcon(amenity),
                                size: 12.sp,
                                color: Colors.green[700],
                              ),
                              SizedBox(width: 4.w),
                              Text(
                                amenity.label,
                                style: TextStyle(
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.green[700],
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  SizedBox(height: 14.h),
                  
                  // Alt satır: Süre + Fiyat
                  Row(
                    children: [
                      // Süre
                      Row(
                        children: [
                          Icon(Icons.schedule, size: 16.sp, color: subtitleColor),
                          SizedBox(width: 4.w),
                          Text(
                            '${transfer.durationMinutes} dk',
                            style: TextStyle(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w500,
                              color: subtitleColor,
                            ),
                          ),
                        ],
                      ),
                      // WhatsApp
                      if (transfer.whatsapp != null && transfer.whatsapp!.isNotEmpty) ...[
                        SizedBox(width: 12.w),
                        Icon(FontAwesomeIcons.whatsapp, size: 14.sp, color: Colors.green),
                      ],
                      const Spacer(),
                      // Fiyat
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '\$$usdFormatted',
                            style: TextStyle(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w800,
                              color: Colors.green[700],
                            ),
                          ),
                          Text(
                            '$tryFormatted₺',
                            style: TextStyle(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.w500,
                              color: subtitleColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _capacityItem({
    required IconData icon,
    required String value,
    required String label,
    required bool isDark,
  }) {
    return Column(
      children: [
        Icon(icon, size: 20.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
        SizedBox(height: 4.h),
        Text(
          value,
          style: TextStyle(
            fontSize: 14.sp,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 10.sp,
            color: isDark ? Colors.grey[500] : Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _divider(bool isDark) {
    return Container(
      width: 1,
      height: 36.h,
      color: isDark ? Colors.grey[700] : Colors.grey[300],
    );
  }

  IconData _getVehicleIcon(VehicleType type) {
    switch (type) {
      case VehicleType.sedan:
        return Icons.directions_car;
      case VehicleType.van:
        return Icons.airport_shuttle;
      case VehicleType.bus:
        return Icons.directions_bus;
      case VehicleType.vip:
        return Icons.local_taxi;
      case VehicleType.jeep:
        return Icons.terrain;
      case VehicleType.coster:
        return Icons.directions_bus_filled;
    }
  }

  IconData _getAmenityIcon(VehicleAmenity amenity) {
    switch (amenity) {
      case VehicleAmenity.insurance:
        return Icons.security;
      case VehicleAmenity.airCondition:
        return Icons.ac_unit;
      case VehicleAmenity.wifi:
        return Icons.wifi;
      case VehicleAmenity.comfort:
        return Icons.airline_seat_recline_extra;
      case VehicleAmenity.usb:
        return Icons.usb;
      case VehicleAmenity.water:
        return Icons.water_drop;
      case VehicleAmenity.snacks:
        return Icons.cookie;
      case VehicleAmenity.tv:
        return Icons.tv;
      case VehicleAmenity.bluetooth:
        return Icons.bluetooth;
      case VehicleAmenity.gps:
        return Icons.gps_fixed;
    }
  }
}
