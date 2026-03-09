import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/search/transfer_search_controller.dart';
import '../../../data/models/reservation/reservation_builder.dart';
import '../../../data/models/reservation/reservation_model.dart';
import '../../../data/models/transfer/transfer_model.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../../../data/services/reservation/reservation_service.dart';
import '../../../data/services/review/review_service.dart';
import '../../widgets/app/listing_app_bar.dart';
import '../../widgets/detail/contact_buttons.dart';
import '../../widgets/detail/detail_sheet_constants.dart';
import '../../widgets/detail/drag_handle.dart';
import '../../widgets/detail/favorite_button.dart';
import '../../widgets/detail/image_slider.dart';
import '../../widgets/detail/reserve_button_bar.dart';
import '../../widgets/detail/review_dialog.dart';
import '../../widgets/filters/filter_bar.dart';
import '../../widgets/filters/sort_sheet.dart';
import '../../widgets/reservation/reservation_bottom_sheet.dart';
import '../../widgets/reservation/reservation_form_widgets.dart';
import '../../widgets/search/floating_search_shortcut_button.dart';
import 'components/transfer_card.dart';
import 'components/transfer_filter_section.dart';

class TransfersPage extends StatelessWidget {
  const TransfersPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Get.theme.scaffoldBackgroundColor,
    appBar: const ListingAppBar(title: 'Transfer Sonuçları'),
    body: const TransfersContent(),
    floatingActionButton: const FloatingSearchShortcutButton(searchTabIndex: 2),
  );
}

class TransfersContent extends StatelessWidget {
  const TransfersContent({super.key});
  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<TransferSearchController>()
        ? Get.find<TransferSearchController>()
        : Get.put(TransferSearchController());
    final args = Get.arguments;
    if (args is Map && args['popularOnly'] == true && !c.viewingPopularOnly.value) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        c.showPopularOnly();
      });
    }
    if (!c.hasLoadedAll && c.results.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) => c.loadAllTransfers());
    }
    return Obx(
      () => CustomScrollView(
        slivers: [
          SliverPersistentHeader(
            pinned: true,
            delegate: _TransfersFilterHeaderDelegate(
              child: ListingFilterBar(
                onOpenSort: () => showSortSheet<String>(
                  selected: c.sortOption.value,
                  options: const [
                    SortOption('price_asc', 'Fiyat (Artan)'),
                    SortOption('price_desc', 'Fiyat (Azalan)'),
                    SortOption('duration_asc', 'Süre (Kısa → Uzun)'),
                  ],
                  onSelect: (v) => c.setSortOption(v),
                ),
                onOpenFilters: () => _openFiltersSheet(c),
                activeFilterCount: c.activeFilterCount(),
                resultCount: c.filteredResults.length,
                inlineResult: true,
                trailing: IconButton(
                  tooltip: 'Favoriler',
                  onPressed: c.toggleFavoritesOnly,
                  icon: Icon(
                    c.favoritesOnly.value
                        ? Icons.favorite
                        : Icons.favorite_border,
                    color: c.favoritesOnly.value
                        ? Colors.red
                        : Colors.grey[600],
                    size: 20.sp,
                  ),
                ),
              ),
            ),
          ),
          if (c.isSearching.value)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (c.filteredResults.isEmpty)
            SliverFillRemaining(
              child: Builder(
                builder: (context) {
                  final isDark = Theme.of(context).brightness == Brightness.dark;
                  final hasError = c.errorMessage.value.trim().isNotEmpty;
                  return Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24.w),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            hasError
                                ? 'Transferler yüklenirken bir sorun oluştu'
                                : 'Uygun transfer bulunamadı',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                          if (hasError) ...[
                            SizedBox(height: 8.h),
                            Text(
                              c.errorMessage.value,
                              textAlign: TextAlign.center,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: isDark ? Colors.red[300] : Colors.red[700],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate((context, i) {
                final t = c.filteredResults[i];
                return Padding(
                  padding: EdgeInsets.fromLTRB(
                    16.w,
                    i == 0 ? 12.h : 0,
                    16.w,
                    14.h,
                  ),
                  child: TransferCard(
                    transfer: t,
                    controller: c,
                    onTap: () => _openDetail(t, c),
                  ),
                );
              }, childCount: c.filteredResults.length),
            ),
          SliverToBoxAdapter(child: SizedBox(height: 60.h)),
        ],
      ),
    );
  }
}

class _TransfersFilterHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  _TransfersFilterHeaderDelegate({required this.child});
  @override
  double get minExtent => 66.h;
  @override
  double get maxExtent => 66.h;
  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final theme = Theme.of(context);
    return Material(
      color: theme.scaffoldBackgroundColor,
      elevation: overlapsContent ? 2 : 0,
      child: child,
    );
  }

  @override
  bool shouldRebuild(covariant _TransfersFilterHeaderDelegate oldDelegate) =>
      false;
}

void _openFiltersSheet(TransferSearchController c) {
  Get.bottomSheet(
    DraggableScrollableSheet(
      initialChildSize: 0.55,
      maxChildSize: 0.75,
      minChildSize: 0.3,
      expand: false,
      builder: (context, scroll) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDark
                ? theme.colorScheme.surfaceContainerHigh
                : Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(28.r),
              topRight: Radius.circular(28.r),
            ),
          ),
          child: Column(
            children: [
              // Drag handle
              Container(
                margin: EdgeInsets.only(top: 12.h, bottom: 8.h),
                width: 40.w,
                height: 4.h,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[600] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(2.r),
                ),
              ),
              // Title
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Filtreler',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        c.clearFilters();
                        Get.back();
                      },
                      child: Text(
                        'Sıfırla',
                        style: TextStyle(color: theme.primaryColor),
                      ),
                    ),
                  ],
                ),
              ),
              Divider(color: isDark ? Colors.grey[700] : Colors.grey[200]),
              Expanded(
                child: SingleChildScrollView(
                  controller: scroll,
                  padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 20.h),
                  child: TransferFilterSection(controller: c),
                ),
              ),
              // Apply button
              SafeArea(
          bottom: false,
                top: false,
                child: Padding(
                  padding: EdgeInsets.fromLTRB(16.w, 8.h, 16.w, 12.h),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Get.back(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 14.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                      ),
                      child: Text(
                        'Uygula',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    ),
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
  );
}

void _openDetail(TransferModel transfer, TransferSearchController c) {
  final rating = c.ratings[transfer.id];
  final reviewService = Get.isRegistered<ReviewService>()
      ? Get.find<ReviewService>()
      : null;
  Get.bottomSheet(
    DraggableScrollableSheet(
      initialChildSize: DetailSheetConfig.initialChildSize,
      maxChildSize: DetailSheetConfig.maxChildSize,
      minChildSize: DetailSheetConfig.minChildSize,
      expand: false,
      builder: (context, scroll) => SafeArea(
          bottom: false,
        top: false,
        child: _TransferDetailContent(
          transfer: transfer,
          controller: c,
          rating: rating,
          scroll: scroll,
          reviewService: reviewService,
        ),
      ),
    ),
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    ignoreSafeArea: false,
  );
}

class _TransferDetailContent extends StatelessWidget {
  final dynamic transfer;
  final TransferSearchController controller;
  final dynamic rating;
  final ScrollController scroll;
  final ReviewService? reviewService;
  const _TransferDetailContent({
    required this.transfer,
    required this.controller,
    required this.rating,
    required this.scroll,
    required this.reviewService,
  });
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final onSurface = theme.colorScheme.onSurface;
    final subtitleColor = isDark ? Colors.grey[400] : Colors.blueGrey[600];
    final chipBg = isDark
        ? theme.colorScheme.surfaceContainerHighest
        : Colors.grey[100];
    final chipIconColor = isDark ? Colors.blueGrey[400] : Colors.blueGrey[500];
    final addressBg = isDark
        ? theme.colorScheme.surfaceContainerHighest
        : Colors.grey[50];
    final addressBorder = isDark ? Colors.grey[700]! : Colors.grey[200]!;

    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            color: isDark
                ? theme.colorScheme.surfaceContainerHigh
                : Colors.white,
            borderRadius: DetailSheetConfig.radius,
          ),
          child: CustomScrollView(
            controller: scroll,
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 24.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const DragHandle(),
                      if (transfer.images.isNotEmpty)
                        ImageSlider(images: List<String>.from(transfer.images)),
                      SizedBox(height: 12.h),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              '${transfer.fromShort} → ${transfer.toShort}',
                              style: TextStyle(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.w800,
                                color: onSurface,
                              ),
                            ),
                          ),
                          if (transfer.id != null)
                            Obx(() {
                              final favService =
                                  Get.isRegistered<FavoriteService>()
                                  ? Get.find<FavoriteService>()
                                  : null;
                              final isFav =
                                  favService?.isFavorite(
                                    'transfer',
                                    transfer.id!,
                                  ) ??
                                  controller.isFavorite(transfer.id);
                              return FavoriteButton(
                                initial: isFav,
                                onChanged: (_) {
                                  if (transfer.id == null) return;
                                  if (favService != null) {
                                    final meta = favService.buildMetaForEntity(
                                      type: 'transfer',
                                      model: transfer,
                                    );
                                    favService.toggle(
                                      type: 'transfer',
                                      targetId: transfer.id!,
                                      meta: meta,
                                    );
                                  } else {
                                    controller.toggleFavorite(transfer.id!);
                                  }
                                },
                              );
                            }),
                        ],
                      ),
                      if (rating != null)
                        Row(
                          children: [
                            Icon(
                              Icons.star_rounded,
                              size: 18.sp,
                              color: Colors.amber,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              rating.average.toStringAsFixed(1),
                              style: TextStyle(
                                fontSize: 14.sp,
                                fontWeight: FontWeight.w600,
                                color: onSurface,
                              ),
                            ),
                            SizedBox(width: 6.w),
                            Text(
                              '(${rating.count} yorum)',
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: subtitleColor,
                              ),
                            ),
                            if (transfer.id != null && reviewService != null)
                              TextButton.icon(
                                onPressed: () => _openReviewDialog(
                                  transfer.id,
                                  reviewService!,
                                ),
                                icon: Icon(
                                  Icons.add_comment_outlined,
                                  size: 18,
                                  color: theme.primaryColor,
                                ),
                                label: Text(
                                  'Yorum Yaz',
                                  style: TextStyle(color: theme.primaryColor),
                                ),
                              ),
                          ],
                        ),
                      SizedBox(height: 8.h),
                      Wrap(
                        spacing: 8.w,
                        runSpacing: 8.h,
                        children: [
                          _infoChip(
                            Icons.timer,
                            '${transfer.durationMinutes} dk',
                            chipBg: chipBg,
                            iconColor: chipIconColor,
                            textColor: onSurface,
                          ),
                          _infoChip(
                            Icons.people,
                            '${transfer.capacity} kişi',
                            chipBg: chipBg,
                            iconColor: chipIconColor,
                            textColor: onSurface,
                          ),
                          _infoChip(
                            Icons.directions_car_filled,
                            transfer.vehicleType,
                            chipBg: chipBg,
                            iconColor: chipIconColor,
                            textColor: onSurface,
                          ),
                        ],
                      ),
                      SizedBox(height: 16.h),
                      _addressBox(
                        'Kalkış',
                        transfer.fromAddress.address,
                        bg: addressBg,
                        border: addressBorder,
                        isDark: isDark,
                        onSurface: onSurface,
                      ),
                      SizedBox(height: 10.h),
                      _addressBox(
                        'Varış',
                        transfer.toAddress.address,
                        bg: addressBg,
                        border: addressBorder,
                        isDark: isDark,
                        onSurface: onSurface,
                      ),
                      SizedBox(height: 20.h),
                      Text(
                        'İletişim',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w700,
                          color: onSurface,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      ContactButtons(
                        phone: transfer.phone,
                        sms: transfer.phone,
                        whatsapp: transfer.whatsapp,
                      ),
                      SizedBox(height: 24.h),
                      if (reviewService != null && transfer.id != null)
                        _reviewsSection(
                          isDark: isDark,
                          onSurface: onSurface,
                          subtitleColor: subtitleColor,
                        ),
                      SizedBox(height: 120.h),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: ReserveButtonBar(
            onPressed: transfer.id == null
                ? null
                : () => _openReservationSheet(transfer),
          ),
        ),
      ],
    );
  }

  Widget _infoChip(
    IconData icon,
    String text, {
    Color? chipBg,
    Color? iconColor,
    Color? textColor,
  }) => Container(
    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
    decoration: BoxDecoration(
      color: chipBg ?? Colors.grey[100],
      borderRadius: BorderRadius.circular(14.r),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14.sp, color: iconColor ?? Colors.blueGrey[500]),
        SizedBox(width: 4.w),
        Text(
          text,
          style: TextStyle(
            fontSize: 11.sp,
            fontWeight: FontWeight.w600,
            color: textColor,
          ),
        ),
      ],
    ),
  );
  Widget _addressBox(
    String label,
    String address, {
    Color? bg,
    Color? border,
    bool isDark = false,
    Color? onSurface,
  }) => Container(
    padding: EdgeInsets.all(12.w),
    decoration: BoxDecoration(
      color: bg ?? Colors.grey[50],
      borderRadius: BorderRadius.circular(18.r),
      border: Border.all(color: border ?? Colors.grey[200]!),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          Icons.place,
          size: 16.sp,
          color: isDark ? Colors.blueGrey[400] : Colors.blueGrey[400],
        ),
        SizedBox(width: 6.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 11.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.blueGrey[400] : Colors.blueGrey[600],
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                address,
                style: TextStyle(
                  fontSize: 11.sp,
                  height: 1.35,
                  color: isDark ? Colors.blueGrey[300] : Colors.blueGrey[700],
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
  void _openReviewDialog(String id, ReviewService service) {
    showUnifiedReviewDialog(
      type: 'transfer',
      id: id,
      onSubmit: (r, c) async {
        try {
          await service.addReview(
            type: 'transfer',
            targetId: id,
            rating: r,
            comment: c,
          );
          Get.snackbar('Başarılı', 'Yorum kaydedildi');
        } catch (e) {
          Get.snackbar('Hata', 'Kaydedilemedi: $e');
        }
      },
    );
  }

  Widget _reviewsSection({
    required bool isDark,
    required Color onSurface,
    Color? subtitleColor,
  }) {
    final reviewBg = isDark
        ? Get.theme.colorScheme.surfaceContainerHighest
        : Colors.grey[50];
    final reviewBorder = isDark ? Colors.grey[700]! : Colors.grey[200]!;
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: transfer.id == null
          ? const Stream.empty()
          : reviewService!.reviewsFor(
              'transfer',
              transfer.id,
              onlyPublished: true,
            ),
      builder: (_, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(12),
              child: CircularProgressIndicator(),
            ),
          );
        }
        final data = snap.data ?? [];
        if (data.isEmpty) {
          return Text(
            'Henüz yorum yok',
            style: TextStyle(
              fontSize: 12.sp,
              color: subtitleColor ?? Colors.blueGrey[600],
            ),
          );
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Yorumlar',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: onSurface,
              ),
            ),
            SizedBox(height: 8.h),
            ...data
                .take(8)
                .map(
                  (r) => Container(
                    margin: EdgeInsets.only(bottom: 10.h),
                    padding: EdgeInsets.all(10.w),
                    decoration: BoxDecoration(
                      color: reviewBg,
                      borderRadius: BorderRadius.circular(14.r),
                      border: Border.all(color: reviewBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.star_rounded,
                              size: 14.sp,
                              color: Colors.amber,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              (r['rating'] ?? 0).toString(),
                              style: TextStyle(
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w600,
                                color: onSurface,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          r['comment'] ?? '',
                          style: TextStyle(
                            fontSize: 11.sp,
                            height: 1.3,
                            color: isDark ? Colors.grey[300] : Colors.grey[800],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
          ],
        );
      },
    );
  }

  void _openReservationSheet(dynamic transfer) {
    if (transfer.id == null) return;
    final reservationService = Get.find<ReservationService>();
    final now = DateTime.now().add(const Duration(days: 1));
    ReservationBottomSheet.show(
      ReservationBottomSheet(
        title: '${transfer.fromShort} → ${transfer.toShort}',
        subtitle: transfer.company,
        price: transfer.basePrice,
        priceLabel: 'Fiyat',
        bodyBuilder: (ctx, c) {
          return Column(
            children: [
              SingleDateField(
                keyName: 'travelDate',
                label: 'Tarih',
                initial: now,
              ),
              CounterField(
                keyName: 'passengers',
                label: 'Yolcu',
                min: 1,
                max: transfer.capacity,
                initial: 1,
              ),
            ],
          );
        },
        onSubmit: (controller) async {
          final date = controller.val<DateTime>('travelDate') ?? now;
          final pax = controller.val<int>('passengers') ?? 1;
          final builder =
              ReservationBuilder(
                type: ReservationType.transfer,
                userId: Get.find<AuthService>().user.value.id ?? '',
                itemId: transfer.id,
                title: '${transfer.fromShort} → ${transfer.toShort}',
                subtitle: transfer.vehicleType,
                imageUrl: (transfer.images is List && transfer.images.isNotEmpty
                    ? transfer.images.first
                    : ''),
                startDate: date,
                endDate: date,
                quantity: 1,
                people: pax,
                price: transfer.basePrice,
                userPhone: controller.phoneCtrl.text,
                userEmail: controller.emailCtrl.text,
                notes: controller.noteCtrl.text,
              )..addMeta({
                'vehicleType': transfer.vehicleType,
                'durationMinutes': transfer.durationMinutes,
                'capacity': transfer.capacity,
                'fromAddress': transfer.fromAddress.address,
                'toAddress': transfer.toAddress.address,
                'passengers': pax,
              });
          await reservationService.create(builder.build());
          return 'ok';
        },
      ),
    );
  }
}

// Removed legacy _actionButton (replaced by ContactButtons)

// Legacy launcher removed (ContactButtons handles launching)

// Removed legacy add review dialog (using unified dialog now)
