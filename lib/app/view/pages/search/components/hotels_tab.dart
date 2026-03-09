import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/hotel_search_controller.dart';
import '../../../../data/models/promotion/promotion_model.dart';
import '../../../themes/theme.dart';
import '../../../widgets/destination_field.dart';
import '../../../widgets/modern_date_picker.dart';
import '../../../widgets/search_action_button.dart';
import '../search_styles.dart';
import 'promotion_banner.dart';

class HotelsTab extends StatelessWidget {
  const HotelsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    // Controller'ı lazily register et
    final HotelSearchController controller = Get.put(
      HotelSearchController(),
      permanent: false,
    );

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.medinaGreen40,
            isDark ? Colors.black : Colors.white,
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SingleChildScrollView(
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.all(16.w),
        child: Column(
          children: [
            // Form Card: location, dates, guests, search
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(14.w),
              decoration: SearchStyles.card(
                radius: BorderRadius.circular(14.r),
                withShadow: false,
                isDark: isDark,
              ),
              child: Column(
                children: [
                  // Modern Destination Field
                  DestinationField(
                    tag: controller.addressTag,
                    label: 'Otel Destinasyonu',
                    placeholder: 'Mekke, Medine veya bölge seçin',
                    onChanged: (addr) {
                      controller.addressController.setAddress(addr);
                      if (addr.location != null) {
                        controller.addressController.setLatLng(addr.location!);
                      }
                    },
                  ),
                  SizedBox(height: 12.h),
                  // Modern Date Range Selector
                  _buildModernDateSelector(context, controller),
                  SizedBox(height: 12.h),
                  // Guest field
                  _buildGuestField(controller),
                  SizedBox(height: 16.h),
                  // Search button
                  Obx(
                    () => SearchActionButton(
                      label: 'OTELLERİ BUL',
                      enabled: controller.canSearch,
                      loading: controller.isSearching.value,
                      onPressed: () async {
                        await controller.search();
                        Get.toNamed(
                          '/hotels',
                          arguments: {
                            'fromSearch': true,
                            'controllerTag': controller.addressTag,
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 16.h),

            // Popüler oteller (form alanının ALTINDA gösterim)
            Obx(() {
              final list = controller.popularHotels;
              if (list.isEmpty) return const SizedBox();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Popüler Oteller',
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  SizedBox(height: 8.h),
                  SizedBox(
                    height: 120.h,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: list.length,
                      separatorBuilder: (_, __) => SizedBox(width: 12.w),
                      itemBuilder: (ctx, i) {
                        final h = list[i];
                        return InkWell(
                          onTap: () {
                            controller.selectHotel(h);
                            Get.toNamed(
                              '/hotels',
                              arguments: {
                                'highlightId': h.id,
                                'fromSearch': true,
                              },
                            );
                          },
                          child: Container(
                            width: 170.w,
                            padding: EdgeInsets.all(12.w),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? theme.colorScheme.surfaceContainerHigh
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(14.r),
                              border: Border.all(
                                color: isDark
                                    ? theme.colorScheme.outline
                                    : Colors.grey[300]!,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  h.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 13.sp,
                                    fontWeight: FontWeight.w600,
                                    color: theme.colorScheme.onSurface,
                                  ),
                                ),
                                SizedBox(height: 6.h),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.star,
                                      size: 16.sp,
                                      color: Colors.amber,
                                    ),
                                    SizedBox(width: 4.w),
                                    Text(
                                      h.rating.toStringAsFixed(1),
                                      style: TextStyle(
                                        fontSize: 12.sp,
                                        fontWeight: FontWeight.w500,
                                        color: theme.colorScheme.onSurface,
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: 6.h),
                                Text(
                                  h.addressModel.city.isNotEmpty
                                      ? h.addressModel.city
                                      : h.addressModel.country,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 11.sp,
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  SizedBox(height: 20.h),
                ],
              );
            }),

            // Dynamic Promotion banner
            const PromotionBanner(targetType: PromotionTargetType.hotel),
          ],
        ),
      ),
    );
  }

  Widget _buildModernDateSelector(
    BuildContext context,
    HotelSearchController controller,
  ) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Obx(() {
      final checkIn = controller.checkIn.value;
      final checkOut = controller.checkOut.value;
      final nightCount = checkIn != null && checkOut != null
          ? checkOut.difference(checkIn).inDays
          : 0;

      return GestureDetector(
        onTap: () async {
          final result = await ModernDatePicker.showRange(
            context: context,
            initialCheckIn: checkIn,
            initialCheckOut: checkOut,
            firstDate: DateTime.now(),
            lastDate: DateTime.now().add(const Duration(days: 365)),
            checkInLabel: 'Giriş',
            checkOutLabel: 'Çıkış',
          );
          if (result != null) {
            if (result['checkIn'] != null) {
              controller.setCheckIn(result['checkIn']!);
            }
            if (result['checkOut'] != null) {
              controller.setCheckOut(result['checkOut']!);
            }
          }
        },
        child: Container(
          padding: EdgeInsets.all(14.w),
          decoration: BoxDecoration(
            color: isDark
                ? theme.colorScheme.surfaceContainerHighest
                : Colors.white,
            borderRadius: BorderRadius.circular(14.r),
            border: Border.all(
              color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
            ),
          ),
          child: Row(
            children: [
              // Check-in section
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          size: 14.sp,
                          color: isDark
                              ? Colors.grey.shade400
                              : Colors.grey[600],
                        ),
                        SizedBox(width: 6.w),
                        Text(
                          'Giriş',
                          style: TextStyle(
                            fontSize: 11.sp,
                            color: isDark
                                ? Colors.grey.shade400
                                : Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 6.h),
                    Text(
                      checkIn != null
                          ? '${checkIn.day} ${_monthName(checkIn.month)}'
                          : 'Tarih seçin',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w700,
                        color: checkIn != null
                            ? theme.colorScheme.onSurface
                            : (isDark
                                  ? Colors.grey.shade600
                                  : Colors.grey[400]),
                      ),
                    ),
                    if (checkIn != null)
                      Text(
                        _weekdayName(checkIn.weekday),
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: isDark
                              ? Colors.grey.shade400
                              : Colors.grey[600],
                        ),
                      ),
                  ],
                ),
              ),

              // Arrow & night count
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w),
                child: Column(
                  children: [
                    Icon(
                      Icons.arrow_forward,
                      size: 18.sp,
                      color: isDark ? Colors.green.shade400 : AppColors.primary,
                    ),
                    if (nightCount > 0)
                      Container(
                        margin: EdgeInsets.only(top: 4.h),
                        padding: EdgeInsets.symmetric(
                          horizontal: 8.w,
                          vertical: 2.h,
                        ),
                        decoration: BoxDecoration(
                          color: isDark
                              ? Colors.green.shade900.withOpacity(0.4)
                              : AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Text(
                          '$nightCount gece',
                          style: TextStyle(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? Colors.green.shade300
                                : AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              // Check-out section
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          'Çıkış',
                          style: TextStyle(
                            fontSize: 11.sp,
                            color: isDark
                                ? Colors.grey.shade400
                                : Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        SizedBox(width: 6.w),
                        Icon(
                          Icons.calendar_today,
                          size: 14.sp,
                          color: isDark
                              ? Colors.grey.shade400
                              : Colors.grey[600],
                        ),
                      ],
                    ),
                    SizedBox(height: 6.h),
                    Text(
                      checkOut != null
                          ? '${checkOut.day} ${_monthName(checkOut.month)}'
                          : 'Tarih seçin',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w700,
                        color: checkOut != null
                            ? theme.colorScheme.onSurface
                            : (isDark
                                  ? Colors.grey.shade600
                                  : Colors.grey[400]),
                      ),
                    ),
                    if (checkOut != null)
                      Text(
                        _weekdayName(checkOut.weekday),
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: isDark
                              ? Colors.grey.shade400
                              : Colors.grey[600],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildGuestField(HotelSearchController controller) {
    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        return Obx(
          () => GestureDetector(
            onTap: () {
              showModalBottomSheet(
                context: Get.context!,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(20.r),
                  ),
                ),
                builder: (ctx) {
                  return Padding(
                    padding: EdgeInsets.fromLTRB(
                      20.w,
                      20.h,
                      20.w,
                      20.h + MediaQuery.of(ctx).padding.bottom,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Obx(
                          () => _counterRow(
                            'Yetişkin',
                            controller.adults.value,
                            onAdd: controller.incrementAdults,
                            onRemove: controller.decrementAdults,
                          ),
                        ),
                        SizedBox(height: 12.h),
                        Obx(
                          () => _counterRow(
                            'Oda',
                            controller.rooms.value,
                            onAdd: controller.incrementRooms,
                            onRemove: controller.decrementRooms,
                          ),
                        ),
                        SizedBox(height: 24.h),
                        SizedBox(
                          width: double.infinity,
                          height: 48.h,
                          child: ElevatedButton(
                            onPressed: () => Get.back(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Get.theme.primaryColor,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.r),
                              ),
                            ),
                            child: Text(
                              'Tamam',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            },
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: isDark
                    ? theme.colorScheme.surfaceContainerHighest
                    : Colors.white,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(
                  color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${controller.adults.value} Yetişkin, ${controller.rooms.value} Oda',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    'Düzenle',
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: isDark ? Colors.green.shade400 : Colors.green,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _counterRow(
    String label,
    int value, {
    required VoidCallback onAdd,
    required VoidCallback onRemove,
  }) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600),
          ),
        ),
        IconButton(
          onPressed: onRemove,
          icon: const Icon(Icons.remove_circle_outline),
        ),
        Text(
          '$value',
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
        ),
        IconButton(
          onPressed: onAdd,
          icon: const Icon(Icons.add_circle_outline),
        ),
      ],
    );
  }

  String _monthName(int m) {
    const tr = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ];
    return tr[m - 1];
  }

  String _weekdayName(int w) {
    const tr = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    // DateTime weekday: 1=Mon ..7=Sun -> Bizim dizimiz Pzt=0 .. Paz=6
    return tr[w - 1];
  }
}
