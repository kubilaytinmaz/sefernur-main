import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../../data/models/models.dart';
import '../../../../../data/services/currency/currency_service.dart';

class TransferCardItem extends StatelessWidget {
  const TransferCardItem({
    super.key,
    required this.transfer,
    required this.onEdit,
    required this.onAvailability,
    required this.onDelete,
    required this.onReviews,
  });
  final TransferModel transfer;
  final VoidCallback onEdit;
  final VoidCallback onAvailability;
  final VoidCallback onDelete;
  final VoidCallback onReviews;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currencyService = Get.find<CurrencyService>();
    final usd = transfer.basePrice;
    final try_ = currencyService.toTRY(usd);
    final formatter = NumberFormat('#,##0', 'tr_TR');
    final usdFormatted = formatter.format(usd.round());
    final tryFormatted = formatter.format(try_.round());
    
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: onEdit,
        borderRadius: BorderRadius.circular(12.r),
        child: Padding(
          padding: EdgeInsets.all(12.w),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Görsel
              ClipRRect(
                borderRadius: BorderRadius.circular(8.r),
                child: Container(
                  width: 60.w,
                  height: 60.w,
                  color: isDark ? Colors.grey[800] : Colors.grey[200],
                  child: (transfer.images.isNotEmpty && transfer.images.first.isNotEmpty)
                      ? Image.network(
                          transfer.images.first,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _placeholder(),
                        )
                      : _placeholder(),
                ),
              ),
              SizedBox(width: 12.w),
              // İçerik
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Başlık ve menü
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            transfer.vehicleTitle,
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w700,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _buildPopupMenu(),
                      ],
                    ),
                    SizedBox(height: 2.h),
                    // Güzergah
                    Text(
                      _compactRoute(transfer),
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: isDark ? Colors.grey[500] : Colors.grey[600],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 6.h),
                    // Kapasite bilgileri - tek satır
                    Row(
                      children: [
                        _miniMeta(Icons.people_outline, '${transfer.capacity} Kişi', isDark),
                        SizedBox(width: 12.w),
                        _miniMeta(Icons.luggage_outlined, '${transfer.luggageCapacity} Bagaj', isDark),
                        SizedBox(width: 12.w),
                        _miniMeta(Icons.schedule, '${transfer.durationMinutes} dk', isDark),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    // Alt satır: Özellikler ve Fiyat
                    Row(
                      children: [
                        // Özellikler (varsa kısa gösterim)
                        Expanded(
                          child: transfer.amenityList.isNotEmpty
                              ? Row(
                                  children: [
                                    ...transfer.amenityList.take(3).map((a) => Padding(
                                      padding: EdgeInsets.only(right: 6.w),
                                      child: Icon(
                                        _getAmenityIcon(a),
                                        size: 14.sp,
                                        color: Colors.green[600],
                                      ),
                                    )),
                                    if (transfer.amenityList.length > 3)
                                      Text(
                                        '+${transfer.amenityList.length - 3}',
                                        style: TextStyle(
                                          fontSize: 10.sp,
                                          color: Colors.green[600],
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                  ],
                                )
                              : Text(
                                  'Özellik tanımlanmadı',
                                  style: TextStyle(
                                    fontSize: 10.sp,
                                    color: isDark ? Colors.grey[600] : Colors.grey[400],
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                        ),
                        // Fiyat
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6.r),
                          ),
                          child: Text(
                            '\$$usdFormatted / $tryFormatted₺',
                            style: TextStyle(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.w700,
                              color: Colors.green[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPopupMenu() {
    return PopupMenuButton(
      padding: EdgeInsets.zero,
      icon: Icon(Icons.more_vert, size: 20.sp),
      itemBuilder: (c) => const [
        PopupMenuItem(value: 'edit', child: Text('Düzenle')),
        PopupMenuItem(value: 'availability', child: Text('Müsaitlik')),
        PopupMenuItem(value: 'reviews', child: Text('Yorumlar')),
        PopupMenuItem(
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
    );
  }

  Widget _miniMeta(IconData icon, String text, bool isDark) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13.sp, color: isDark ? Colors.grey[500] : Colors.grey[600]),
        SizedBox(width: 3.w),
        Text(
          text,
          style: TextStyle(
            fontSize: 10.sp,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
      ],
    );
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

  Widget _placeholder() {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Center(
          child: Icon(
            Icons.directions_car,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
            size: 22.sp,
          ),
        );
      },
    );
  }

  String _compactRoute(TransferModel t) => '${t.fromShort} → ${t.toShort}';
}
