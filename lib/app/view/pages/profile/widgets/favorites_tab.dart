import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/main/main_controller.dart';
import '../../../../controllers/search/search_controller.dart' as search;
import '../../../../data/services/favorite/favorite_service.dart';
import '../../../themes/theme.dart';
import 'favorite_detail_sheet.dart';
import 'shared/empty_state.dart';

class FavoritesTab extends StatelessWidget {
  const FavoritesTab({super.key});
  @override
  Widget build(BuildContext context) {
    final service = Get.find<FavoriteService>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      color: theme.scaffoldBackgroundColor,
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.medinaGreen40,
              border: Border(
                bottom: BorderSide(
                  color: isDark ? Colors.black26 : Colors.white.withOpacity(0.1),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(child: _FavoriteFilterChips(service: service)),
                Obx(
                  () => Tooltip(
                    message: service.directNavigationEnabled.value
                        ? 'Detay açma kapalı. Tıklayınca ilgili arama sekmesine gider.'
                        : 'Detay sheet açılır. Tıklayınca sekme yönlendirmesi yerine detay gösterilir.',
                    child: IconButton(
                      onPressed: () => service.directNavigationEnabled.toggle(),
                      icon: Icon(
                        service.directNavigationEnabled.value
                            ? Icons.link_outlined
                            : Icons.layers_outlined,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Obx(() {
              if (service.filtered.isEmpty) {
                return Padding(
                  padding: EdgeInsets.all(20.w),
                  child: const EmptyState(
                    message: 'Henüz favori ürününüz bulunmuyor',
                    icon: Icons.favorite_border,
                  ),
                );
              }
              return ListView.separated(
                padding: EdgeInsets.all(16.w),
                itemCount: service.filtered.length,
                separatorBuilder: (_, __) => SizedBox(height: 14.h),
                itemBuilder: (context, index) {
                  final entry = service.filtered[index];
                  final needRefresh = (entry.meta['title'] ?? '')
                      .toString()
                      .isEmpty;
                  return _FavoriteCard(
                    entry: entry,
                    service: service,
                    forceRefresh: needRefresh,
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _FavoriteCard extends StatelessWidget {
  final FavoriteEntry entry;
  final FavoriteService service;
  final bool forceRefresh;
  const _FavoriteCard({
    required this.entry,
    required this.service,
    this.forceRefresh = false,
  });
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: service.getEnrichedMeta(entry, forceRefresh: forceRefresh),
      builder: (context, snap) {
        final meta = snap.data ?? entry.meta;
        final loading = snap.connectionState == ConnectionState.waiting;
        final title = _resolveTitle(meta);
        final subtitle =
            (meta['subtitle'] ?? meta['city'] ?? meta['location'] ?? '')
                as String;
        final rating = double.tryParse((meta['rating'] ?? '').toString());
        final reviewCount = int.tryParse(
          (meta['reviewCount'] ?? '').toString(),
        );
        final price = _extractPrice(meta);
        final currency = (meta['currency'] ?? 'TL').toString();
        final imageUrl = _resolveImage(meta);
        final chips = _buildChips(meta);

        return GestureDetector(
          onTap: () {
            // Eğer direct navigation aktifse ilgili arama sekmesine yönlendir.
            if (service.directNavigationEnabled.value) {
              int targetTab = 0;
              switch (entry.targetType) {
                case 'hotel':
                  targetTab = 0;
                  break;
                case 'tour':
                  targetTab = 1;
                  break;
                case 'transfer':
                  targetTab = 2;
                  break;
                case 'car':
                  targetTab = 3;
                  break;
                case 'guide':
                  targetTab = 4;
                  break;
                case 'campaign':
                  targetTab = 0;
                  break;
              }
              if (Get.isRegistered<MainController>()) {
                Get.find<MainController>().changeTabIndex(
                  1,
                ); // Search ana sekmesi
              }
              Future.delayed(const Duration(milliseconds: 120), () {
                if (Get.isRegistered<search.SearchController>()) {
                  Get.find<search.SearchController>().requestExternalTab(
                    targetTab,
                  );
                }
              });
              return; // sheet açma
            }
            FavoriteDetailSheet.show(
              entry: entry,
              service: service,
              meta: meta,
            );
          },
          onLongPress: () => service.getEnrichedMeta(entry, forceRefresh: true),
          child: Builder(
            builder: (context) {
              final theme = Theme.of(context);
              final isDark = theme.brightness == Brightness.dark;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOut,
                height: 150.h,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20.r),
                  color: isDark
                      ? theme.colorScheme.surfaceContainerHigh
                      : Colors.grey.shade100,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Background image
                    _CardImage(imageUrl: imageUrl, loading: loading),
                    // Gradient overlay
                    Positioned.fill(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.05),
                              Colors.black.withOpacity(0.55),
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Top bar (type badge & favorite action)
                    Positioned(
                      top: 10.h,
                      left: 14.w,
                      right: 14.w,
                      child: Row(
                        children: [
                          _TypeBadge(type: entry.targetType),
                          const Spacer(),
                          _FavoriteHeart(
                            onTap: () => service.toggle(
                              type: entry.targetType,
                              targetId: entry.targetId,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Bottom content
                    Positioned(
                      left: 16.w,
                      right: 16.w,
                      bottom: 14.h,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  title,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 15.sp,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                    height: 1.2,
                                  ),
                                ),
                              ),
                              if (rating != null) ...[
                                SizedBox(width: 8.w),
                                _RatingChip(
                                  rating: rating,
                                  reviewCount: reviewCount,
                                ),
                              ],
                            ],
                          ),
                          if (subtitle.isNotEmpty)
                            Padding(
                              padding: EdgeInsets.only(top: 4.h),
                              child: Text(
                                subtitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 11.sp,
                                  color: Colors.white.withOpacity(0.85),
                                ),
                              ),
                            ),
                          if (chips.isNotEmpty)
                            Padding(
                              padding: EdgeInsets.only(top: 6.h),
                              child: Wrap(
                                spacing: 6.w,
                                runSpacing: 4.h,
                                children: chips.take(4).toList(),
                              ),
                            ),
                          if (price != null)
                            Padding(
                              padding: EdgeInsets.only(top: 6.h),
                              child: Text(
                                '${price.toStringAsFixed(0)} $currency',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          if (loading)
                            Padding(
                              padding: EdgeInsets.only(top: 6.h),
                              child: LinearProgressIndicator(
                                minHeight: 3.h,
                                backgroundColor: Colors.white24,
                                color: Colors.white,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  String _resolveTitle(Map<String, dynamic> meta) {
    final t = (meta['title'] ?? meta['name'] ?? '').toString();
    if (t.isNotEmpty) return t;
    // derive fallback per type
    switch (entry.targetType) {
      case 'transfer':
        final from = meta['fromShort'] ?? meta['from'] ?? '';
        final to = meta['toShort'] ?? meta['to'] ?? '';
        final route = '$from → $to'.trim();
        if (route != '→') return route;
        break;
      case 'car':
        final brand = meta['brand'] ?? '';
        final model = meta['model'] ?? '';
        final car = '$brand $model'.trim();
        if (car.isNotEmpty) return car;
        break;
    }
    return '-';
  }

  String _resolveImage(Map<String, dynamic> meta) {
    final img = (meta['imageUrl'] ?? meta['image'] ?? '')?.toString();
    if (img != null && img.isNotEmpty) return img;
    // Some documents may have images list not yet merged
    final images = meta['images'];
    if (images is List && images.isNotEmpty) return images.first.toString();
    return 'https://via.placeholder.com/600x400?text=Favori';
  }

  List<Widget> _buildChips(Map<String, dynamic> meta) {
    final List<Widget> chips = [];
    TextStyle st() => TextStyle(
      fontSize: 9.5.sp,
      fontWeight: FontWeight.w600,
      color: Colors.white,
    );
    Widget chip(String label) {
      return Container(
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(.18),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(label, style: st()),
      );
    }

    switch (entry.targetType) {
      case 'hotel':
        final city = (meta['city'] ?? '').toString();
        if (city.isNotEmpty) chips.add(chip(city));
        final country = (meta['country'] ?? '').toString();
        if (country.isNotEmpty && country != city) chips.add(chip(country));
        break;
      case 'car':
        final seats = (meta['seats'] ?? '').toString();
        if (seats.isNotEmpty) chips.add(chip('$seats koltuk'));
        break;
      case 'transfer':
        final vehicle = (meta['vehicleType'] ?? '').toString();
        if (vehicle.isNotEmpty) chips.add(chip(vehicle));
        final cap = (meta['capacity'] ?? '').toString();
        if (cap.isNotEmpty) chips.add(chip('$cap kişi'));
        break;
      case 'guide':
        final exp = (meta['yearsExperience'] ?? '').toString();
        if (exp.isNotEmpty) chips.add(chip('$exp yıl'));
        final langs = (meta['languages'] ?? '').toString();
        if (langs.isNotEmpty) chips.add(chip(langs.split(',').take(1).first));
        break;
      case 'tour':
        final dur = (meta['durationDays'] ?? meta['duration'] ?? '').toString();
        if (dur.isNotEmpty) chips.add(chip('$dur gün'));
        break;
      case 'campaign':
        final sub = (meta['subtitle'] ?? '').toString();
        if (sub.isNotEmpty) chips.add(chip(sub));
        break;
    }
    return chips;
  }

  double? _extractPrice(Map<String, dynamic> meta) {
    for (final key in ['price', 'minPrice', 'basePrice', 'dailyPrice']) {
      final v = meta[key];
      if (v is num) return v.toDouble();
      if (v != null) {
        final p = double.tryParse(v.toString());
        if (p != null) return p;
      }
    }
    return null;
  }

  // Legacy detail & meta chip helpers removed after modern FavoriteDetailSheet integration.
}

class _CardImage extends StatelessWidget {
  final String imageUrl;
  final bool loading;
  const _CardImage({required this.imageUrl, required this.loading});
  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: imageUrl,
      child: Image.network(
        imageUrl,
        fit: BoxFit.cover,
        color: loading ? Colors.black.withOpacity(0.15) : null,
        colorBlendMode: loading ? BlendMode.darken : null,
        errorBuilder: (context, __, ___) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          return Container(
            color: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
            child: Icon(
              Icons.image,
              size: 40,
              color: isDark ? Colors.grey.shade600 : Colors.white70,
            ),
          );
        },
      ),
    );
  }
}

class _TypeBadge extends StatelessWidget {
  final String type;
  const _TypeBadge({required this.type});
  @override
  Widget build(BuildContext context) {
    final map = {
      'hotel': 'Otel',
      'car': 'Araç',
      'transfer': 'Transfer',
      'guide': 'Rehber',
      'tour': 'Tur',
      'campaign': 'Kampanya',
    };
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.55),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Text(
        map[type] ?? type,
        style: TextStyle(
          fontSize: 11.sp,
          fontWeight: FontWeight.w600,
          color: Colors.white,
          letterSpacing: .2,
        ),
      ),
    );
  }
}

class _FavoriteHeart extends StatelessWidget {
  final VoidCallback onTap;
  const _FavoriteHeart({required this.onTap});
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(40),
      child: Container(
        padding: EdgeInsets.all(6.w),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(.9),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(.15), blurRadius: 4),
          ],
        ),
        child: Icon(Icons.favorite, color: Colors.redAccent, size: 20.sp),
      ),
    );
  }
}

class _RatingChip extends StatelessWidget {
  final double rating;
  final int? reviewCount;
  const _RatingChip({required this.rating, this.reviewCount});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.black.withOpacity(.7)
            : Colors.white.withOpacity(.85),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star, size: 14, color: Colors.amber),
          SizedBox(width: 4.w),
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: 12.sp,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          if (reviewCount != null) ...[
            SizedBox(width: 4.w),
            Text(
              '($reviewCount)',
              style: TextStyle(
                fontSize: 10.sp,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _FavoriteFilterChips extends StatelessWidget {
  final FavoriteService service;
  const _FavoriteFilterChips({required this.service});

  static const labels = {
    'hotel': 'Otel',
    'car': 'Araç',
    'transfer': 'Transfer',
    'guide': 'Rehber',
    'tour': 'Tur',
    'campaign': 'Kampanya',
  };

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final active = service.activeFilter.value;
      final types = _distinctTypes();
      return Container(
        decoration: BoxDecoration(
          color: AppColors.medinaGreen40,
        ),
        padding: EdgeInsets.symmetric(vertical: 8.h),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: EdgeInsets.symmetric(horizontal: 10.w),
          child: Row(
            children: [
              _buildPill(
                context,
                label: 'Tümü',
                keyVal: 'all',
                selected: active == 'all',
              ),
              for (final t in types)
                _buildPill(
                  context,
                  label: labels[t] ?? t,
                  keyVal: t,
                  selected: active == t,
                ),
            ],
          ),
        ),
      );
    });
  }

  Iterable<String> _distinctTypes() {
    final set = service.all.map((e) => e.targetType).toSet();
    final ordered = ['hotel', 'car', 'transfer', 'guide', 'tour', 'campaign'];
    return ordered.where(set.contains);
  }

  Widget _buildPill(
    BuildContext context, {
    required String label,
    required String keyVal,
    required bool selected,
  }) {
    const bgSel = Colors.white;
    final bgUnSel = Colors.white.withOpacity(.12);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOut,
      margin: EdgeInsets.symmetric(horizontal: 4.w),
      child: InkWell(
        borderRadius: BorderRadius.circular(26.r),
        onTap: () => service.setFilter(keyVal),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 9.h),
          decoration: BoxDecoration(
            color: selected ? bgSel : bgUnSel,
            borderRadius: BorderRadius.circular(26.r),
            border: Border.all(
              color: selected ? Colors.white : Colors.white.withOpacity(.18),
              width: 1,
            ),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(.15),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (selected) ...[
                Icon(Icons.check, size: 16.sp, color: AppColors.medinaGreen40),
                SizedBox(width: 6.w),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected ? AppColors.medinaGreen40 : Colors.white,
                  letterSpacing: .15,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
