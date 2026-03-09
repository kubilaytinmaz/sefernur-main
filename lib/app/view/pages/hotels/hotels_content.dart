import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../controllers/search/hotel_search_controller.dart';
import '../../../data/models/hotel/hotel_model.dart';
import '../../../data/services/currency/currency_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../../widgets/bottom_sheet/filter_sheet_header.dart';
import '../../widgets/filters/filter_bar.dart';
import '../../widgets/filters/sort_sheet.dart';
import 'components/hotel_card.dart';
import 'hotel_detail_sheet.dart';

class HotelsContent extends StatelessWidget {
  const HotelsContent({super.key});

  @override
  Widget build(BuildContext context) {
    // Ensure controller exists even when page is opened directly from a shortcut
    final HotelSearchController c = Get.isRegistered<HotelSearchController>()
        ? Get.find<HotelSearchController>()
        : Get.put(HotelSearchController());
    // WebBeds API kullanıldığı için otomatik yükleme yok, kullanıcı arama yapmalı
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildSearchSummary(c)),
        SliverPersistentHeader(
          pinned: true,
          delegate: _FilterBarDelegate(
            child: Obx(
              () => ListingFilterBar(
                onOpenSort: () => showSortSheet<String>(
                  selected: c.sortOption.value,
                  options: const [
                    SortOption('rating_desc', 'Puan (Yüksek)'),
                    SortOption('price_asc', 'Fiyat (Artan)'),
                    SortOption('price_desc', 'Fiyat (Azalan)'),
                  ],
                  onSelect: (v) => c.setSortOption(v),
                ),
                onOpenFilters: () => _openFilterSheet(c),
                activeFilterCount: c.activeFilterCount(),
                resultCount: c.filteredResults.length,
                showResultCount: true,
                inlineResult: true,
                trailing: Builder(
                  builder: (context) {
                    final isDark = Theme.of(context).brightness == Brightness.dark;
                    return IconButton(
                      tooltip: 'Favoriler',
                      onPressed: c.toggleFavoritesOnly,
                      icon: Icon(
                        c.favoritesOnly.value == true
                            ? Icons.favorite
                            : Icons.favorite_border,
                        color: c.favoritesOnly.value == true
                            ? Colors.red
                            : (isDark ? Colors.grey[400] : Colors.grey[600]),
                        size: 20.sp,
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ),
        Obx(() {
          if (c.isSearching.value) {
            return const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            );
          }
          if (c.errorMessage.isNotEmpty) {
            return SliverFillRemaining(
              child: Center(child: Text(c.errorMessage.value)),
            );
          }
          final list = c.filteredResults.isNotEmpty || c.results.isEmpty
              ? c.filteredResults
              : c.results;
          if (list.isEmpty) {
            return const SliverFillRemaining(
              child: Center(child: Text('Sonuç yok')),
            );
          }
          return SliverList(
            delegate: SliverChildBuilderDelegate((_, i) {
              final h = list[i];
              final lowestPrice = _lowestPrice(h);
              final roomType = h.roomTypes.isNotEmpty
                  ? h.roomTypes.first.name
                  : 'Oda';
              final favService = Get.isRegistered<FavoriteService>() ? Get.find<FavoriteService>() : null;
              final currencyService = Get.isRegistered<CurrencyService>() ? Get.find<CurrencyService>() : null;
              return Obx(() {
                // Depend explicitly on favorites list for reactivity
                final _ = favService?.all.length; // ignore value; triggers rebuild
                final isFav = (h.id != null && favService!=null) ? favService.isFavorite('hotel', h.id!) : (h.favoriteUserIds.isNotEmpty);
                final formattedPrice = currencyService != null
                    ? currencyService.formatBoth(lowestPrice)
                    : '${lowestPrice.toStringAsFixed(0)} ₺';
                
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  child: HotelCard(
                    id: h.id ?? h.name,
                    name: h.name,
                    rating: h.rating,
                    reviewCount: h.reviewCount,
                    roomType: roomType,
                    location: '${h.city}${h.state.isNotEmpty ? ', ${h.state}' : ''}',
                    distance: '',
                    amenity: h.roomTypes.isNotEmpty ? h.roomTypes.first.boardType : '-',
                    originalPrice: null,
                    discountedPrice: formattedPrice,
                    discount: null,
                    totalNights: 'Gecelik',
                    imagePath: h.images.isNotEmpty ? h.images.first : '',
                    isFavorite: isFav,
                    onFavoriteToggle: () {
                      if (h.id == null) return;
                      if (favService != null) {
                        final meta = favService.buildMetaForEntity(type:'hotel', model: h);
                        favService.toggle(type:'hotel', targetId: h.id!, meta: meta);
                      }
                    },
                    onTap: () => _openHotelDetail(h),
                    onCall: () => _launchTel(h.phone),
                    onMessage: () => _launchSms(h.phone),
                    onWhatsapp: () => _launchWhatsApp(h.phone),
                  ),
                );
              });
            }, childCount: list.length),
          );
        }),
        SliverToBoxAdapter(child: SizedBox(height: 40.h)),
      ],
    );
  }

  Widget _buildSearchSummary(HotelSearchController c) {
    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        final bgColor = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[50];
        final iconColor = isDark ? Colors.grey[400] : Colors.grey[600];
        final textColor = isDark ? Colors.grey[300] : Colors.grey[800];
        
        return Container(
          color: bgColor,
          padding: EdgeInsets.all(16.w),
          child: Row(
            children: [
              Icon(Icons.person_outline, size: 16.sp, color: iconColor),
              SizedBox(width: 8.w),
              Obx(
                () => Text(
                  c.adults.value.toString(),
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: textColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              SizedBox(width: 16.w),
              Icon(Icons.bed_outlined, size: 16.sp, color: iconColor),
              SizedBox(width: 8.w),
              Obx(
                () => Text(
                  c.rooms.value.toString(),
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: textColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const Spacer(),
              Obx(() {
                final ci = c.checkIn.value;
                final co = c.checkOut.value;
                if (ci == null || co == null) return Text('Tarihler', style: TextStyle(color: textColor));
                return Text(
                  '${ci.day}.${ci.month} - ${co.day}.${co.month}',
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: textColor,
                    fontWeight: FontWeight.w500,
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  void _openFilterSheet(HotelSearchController c) {
    final boards = ['BB', 'HB', 'FB', 'AI'];
    Get.bottomSheet(
      Builder(
        builder: (context) {
          final theme = Theme.of(context);
          final isDark = theme.brightness == Brightness.dark;
          final bgColor = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white;
          
          return SafeArea(
          bottom: false,
            child: Container(
              padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 20.h),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(28.r),
                  topRight: Radius.circular(28.r),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FilterSheetHeader(
                    title: 'Filtreler',
                    onReset: () {
                      c.clearBoardTypes();
                    },
                  ),
                  Text(
                    'Pansiyon Tipi',
                    style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 6.h),
                  Wrap(
                    spacing: 8.w,
                    runSpacing: 8.h,
                    children: boards.map((b) {
                      final sel = c.selectedBoardTypes.contains(b);
                      return FilterChip(
                        label: Text(b),
                        selected: sel,
                        onSelected: (_) {
                          c.toggleBoardType(b);
                        },
                      );
                    }).toList(),
                  ),
                  SizedBox(height: 16.h),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Favoriler'),
                    value: c.favoritesOnly.value,
                    onChanged: (_) {
                      c.toggleFavoritesOnly();
                    },
                  ),
                  SizedBox(height: 12.h),
                ],
              ),
            ),
          );
        },
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  double _lowestPrice(HotelModel h) {
    if (h.roomTypes.isEmpty) return 0;
    double min = double.infinity;
    for (final r in h.roomTypes) {
      final p = r.discountedPrice ?? r.originalPrice;
      if (p < min) min = p;
    }
    return min == double.infinity ? 0 : min;
  }

  void _openHotelDetail(HotelModel h) {
    showHotelDetailSheet(h);
  }

  Future<void> _launchTel(String phone) async {
    if (phone.isEmpty) return;
    final uri = Uri(scheme: 'tel', path: phone);
    await _safeLaunch(uri, fallback: () => Get.snackbar('Telefon', phone));
  }

  Future<void> _launchSms(String phone) async {
    if (phone.isEmpty) return;
    final uri = Uri(scheme: 'sms', path: phone);
    await _safeLaunch(uri, fallback: () => Get.snackbar('SMS', phone));
  }

  Future<void> _launchWhatsApp(String phone) async {
    if (phone.isEmpty) return;
    final cleaned = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('https://wa.me/$cleaned');
    await _safeLaunch(uri, fallback: () => Get.snackbar('WhatsApp', phone));
  }

  Future<void> _safeLaunch(Uri uri, {VoidCallback? fallback}) async {
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        fallback?.call();
      }
    } catch (_) {
      fallback?.call();
    }
  }
}

class _FilterBarDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  _FilterBarDelegate({required this.child});
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
    return Container(color: theme.scaffoldBackgroundColor, child: child);
  }
  @override
  bool shouldRebuild(covariant _FilterBarDelegate oldDelegate) => false;
}
