import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/popular_search_controller.dart';
import '../../../../controllers/search/transfer_search_controller.dart';
import '../../../../data/models/promotion/promotion_model.dart';
import '../../../../data/models/search/popular_search_model.dart';
import '../../../../routes/routes.dart';
import '../../../themes/colors/app_colors.dart';
import '../../../widgets/destination_field.dart';
import '../../../widgets/modern_date_picker.dart';
import '../../../widgets/search_action_button.dart';
import '../search_styles.dart';
import 'promotion_banner.dart';

class TransfersTab extends StatefulWidget {
  const TransfersTab({super.key});
  @override
  State<TransfersTab> createState() => _TransfersTabState();
}

class _TransfersTabState extends State<TransfersTab> {
  late final TransferSearchController controller;
  late final PopularSearchController popularSearchController;
  // Sabit yükseklik: Tarih ve Kişi kutuları aynı hizada sabit kalsın.
  static const double _fixedFieldHeight = 92;
  @override
  void initState() {
    super.initState();
    controller = Get.put(TransferSearchController());
    popularSearchController = Get.isRegistered<PopularSearchController>()
        ? Get.find<PopularSearchController>()
        : Get.put(PopularSearchController(), permanent: true);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _formCard(isDark),
            SizedBox(height: 16.h),
            _popularTransfersSection(isDark),
            SizedBox(height: 16.h),
            const PromotionBanner(targetType: PromotionTargetType.transfer),
            SizedBox(height: 16.h),
            _infoSection(isDark),
          ],
        ),
      ),
    );
  }

  Widget _formCard(bool isDark) {
    return Container(
      padding: EdgeInsets.fromLTRB(14.w, 14.h, 14.w, 14.h),
      decoration: SearchStyles.card(
        radius: BorderRadius.circular(16.r),
        isDark: isDark,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Modern Transfer Destination Fields (From & To)
          TransferDestinationFields(
            fromTag: controller.fromTag,
            toTag: controller.toTag,
          ),
          SizedBox(height: 4.h),
          _datePassengerRow(isDark),
          SizedBox(height: 12.h),
          // Search button
          Obx(
            () => SearchActionButton(
              label: 'TRANSFER ARA',
              enabled: controller.canSearch,
              loading: controller.isSearching.value,
              onPressed: () async {
                await controller.search();
                Get.toNamed(Routes.TRANSFERS, arguments: {'fromSearch': true});
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _popularTransfersSection(bool isDark) {
    final theme = Theme.of(context);
    final transferSearches =
        popularSearchController.transferBySegment(PopularSearchSegment.transfer);
    final visitSearches =
        popularSearchController.transferBySegment(PopularSearchSegment.visit);

    return Obx(() {
      final list = controller.popularTransfers;
      if (list.isEmpty && transferSearches.isEmpty && visitSearches.isEmpty) {
        return const SizedBox();
      }

      return SectionBlock(
        title: 'Popüler Transferler',
        trailing: TextButton(
          onPressed: () =>
              Get.toNamed(Routes.TRANSFERS, arguments: {'popularOnly': true}),
          child: const Text('Tümü'),
        ),
        child: Column(
          children: [
            _popularSearchChips('Transfer Aramaları', transferSearches),
            _popularSearchChips('Tur & Ziyaret Aramaları', visitSearches),
            if (list.isNotEmpty) SizedBox(height: 10.h),
            ...list.take(5).map((t) {
              final routeTitle = '${t.fromShort} → ${t.toShort}';
              final vehicle = t.vehicleType;
              return Padding(
                padding: EdgeInsets.only(bottom: 8.h),
                child: InkWell(
                  onTap: () {
                    Get.toNamed(
                      Routes.TRANSFERS,
                      arguments: {'highlightId': t.id},
                    );
                  },
                  borderRadius: BorderRadius.circular(12.r),
                  child: Container(
                    padding: EdgeInsets.all(10.w),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12.r),
                      color: isDark
                          ? theme.colorScheme.surfaceContainerHighest
                          : AppColors.surfaceContainer,
                      border: Border.all(
                        color: isDark
                            ? theme.colorScheme.outline
                            : AppColors.outlineVariant,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40.w,
                          height: 40.h,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10.r),
                            color: isDark
                                ? Colors.green.shade900.withOpacity(0.4)
                                : AppColors.primary.withValues(alpha: .12),
                          ),
                          child: Icon(
                            Icons.local_taxi,
                            color: isDark
                                ? Colors.green.shade400
                                : AppColors.primary,
                            size: 22.sp,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                routeTitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 13.sp,
                                  fontWeight: FontWeight.w600,
                                  color: theme.colorScheme.onSurface,
                                ),
                              ),
                              SizedBox(height: 4.h),
                              Row(
                                children: [
                                  Icon(
                                    Icons.star,
                                    size: 14.sp,
                                    color: Colors.amber,
                                  ),
                                  SizedBox(width: 4.w),
                                  Text(
                                    t.rating.toStringAsFixed(1),
                                    style: TextStyle(
                                      fontSize: 11.sp,
                                      fontWeight: FontWeight.w600,
                                      color: theme.colorScheme.onSurface,
                                    ),
                                  ),
                                  SizedBox(width: 8.w),
                                  Text(
                                    vehicle,
                                    style: TextStyle(
                                      fontSize: 11.sp,
                                      color: isDark
                                          ? Colors.grey.shade400
                                          : Colors.grey[600],
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
            }),
          ],
        ),
      );
    });
  }

  Widget _popularSearchChips(
    String title,
    List<PopularSearchModel> items,
  ) {
    if (items.isEmpty) return const SizedBox();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 8.h),
        Text(
          title,
          style: TextStyle(
            fontSize: 12.sp,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
        SizedBox(height: 8.h),
        ...items.take(8).map(
          (item) => PopularSearchListTile(
            title: item.title,
            subtitle: item.subtitle,
            icon: title.contains('Tur')
                ? Icons.map_outlined
                : Icons.alt_route,
            onTap: () => _applyPopularTransferSearch(item),
          ),
        ),
      ],
    );
  }

  Future<void> _applyPopularTransferSearch(PopularSearchModel item) async {
    if (item.fromCity.isNotEmpty) {
      final from = popularSearchController.addressFromCity(item.fromCity);
      controller.fromAddressController.setAddress(from);
      if (from.location != null) {
        controller.fromAddressController.setLatLng(from.location!);
      }
    }

    if (item.toCity.isNotEmpty) {
      final to = popularSearchController.addressFromCity(item.toCity);
      controller.toAddressController.setAddress(to);
      if (to.location != null) {
        controller.toAddressController.setLatLng(to.location!);
      }
    }

    await controller.search();
    Get.toNamed(Routes.TRANSFERS, arguments: {'fromSearch': true});
  }

  Widget _datePassengerRow(bool isDark) {
    final d = controller.travelDate.value ?? DateTime.now();
    return Row(
      children: [
        Expanded(child: _dateField('Tarih', d, isDark)),
        SizedBox(width: 12.w),
        Expanded(child: _passengerField(isDark)),
      ],
    );
  }

  Widget _dateField(String label, DateTime date, bool isDark) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: () async {
        final picked = await ModernDatePicker.showSingle(
          context: context,
          initialDate: date,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
          label: 'Transfer Tarihi',
        );
        if (picked != null) controller.setDate(picked);
      },
      child: Container(
        height: _fixedFieldHeight.h,
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.calendar_month,
                  size: 14.sp,
                  color: isDark ? Colors.green.shade400 : AppColors.primary,
                ),
                SizedBox(width: 4.w),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                  ),
                ),
              ],
            ),
            SizedBox(height: 4.h),
            Text(
              '${date.day} ${_month(date)}',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            Text(
              _weekday(date),
              style: TextStyle(
                fontSize: 11.sp,
                color: isDark ? Colors.grey.shade500 : Colors.grey[500],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _passengerField(bool isDark) {
    final theme = Theme.of(context);
    return Container(
      height: _fixedFieldHeight.h,
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Kişi',
            style: TextStyle(
              fontSize: 12.sp,
              color: isDark ? Colors.grey.shade400 : Colors.grey[600],
            ),
          ),
          SizedBox(height: 4.h),
          Row(
            children: [
              IconButton(
                onPressed: controller.decrementPassengers,
                icon: Icon(
                  Icons.remove_circle_outline,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              Obx(
                () => Text(
                  '${controller.passengers.value}',
                  style: TextStyle(
                    fontSize: 22.sp,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              IconButton(
                onPressed: controller.incrementPassengers,
                icon: Icon(
                  Icons.add_circle_outline,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoSection(bool isDark) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(18.w),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.purple.shade900.withOpacity(0.3)
            : Colors.purple[50],
        borderRadius: BorderRadius.circular(18.r),
        border: Border.all(
          color: isDark ? Colors.purple.shade700 : Colors.purple[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: isDark ? Colors.purple.shade300 : Colors.purple[800],
              ),
              SizedBox(width: 8.w),
              Text(
                'Neden Biz?',
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.purple.shade300 : Colors.purple[900],
                ),
              ),
            ],
          ),
          SizedBox(height: 10.h),
          Text(
            '• Güvenilir şirketlerle iş ortaklığı\n• Konforlu ve klimalı araçlar\n• Deneyimli sürücüler\n• Zamanında kalkış garantisi',
            style: TextStyle(
              fontSize: 13.sp,
              height: 1.45,
              color: isDark ? Colors.purple.shade400 : Colors.purple[900],
            ),
          ),
        ],
      ),
    );
  }

  String _month(DateTime d) {
    const m = [
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
    return m[d.month - 1];
  }

  String _weekday(DateTime d) {
    const wd = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return wd[d.weekday - 1];
  }
}
