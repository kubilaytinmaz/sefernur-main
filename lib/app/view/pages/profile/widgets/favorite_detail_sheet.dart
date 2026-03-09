import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/main/main_controller.dart';
import '../../../../controllers/search/search_controller.dart' as search;
import '../../../../data/services/favorite/favorite_service.dart';

/// Ortak favori detay bottom sheet (Türkçe ve modern tasarım)
class FavoriteDetailSheet extends StatelessWidget {
  final FavoriteEntry entry;
  final FavoriteService service;
  final Map<String, dynamic> initialMeta;
  const FavoriteDetailSheet({
    super.key,
    required this.entry,
    required this.service,
    required this.initialMeta,
  });

  static Future<void> show({
    required FavoriteEntry entry,
    required FavoriteService service,
    Map<String, dynamic>? meta,
  }) async {
    await Get.bottomSheet(
      _FavoriteDetailSheetLoader(
        entry: entry,
        service: service,
        initialMeta: meta ?? entry.meta,
      ),
      isScrollControlled: true,
      ignoreSafeArea: false,
      backgroundColor: Colors.transparent,
    );
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink(); // never used directly
}

class _FavoriteDetailSheetLoader extends StatefulWidget {
  final FavoriteEntry entry;
  final FavoriteService service;
  final Map<String, dynamic> initialMeta;
  const _FavoriteDetailSheetLoader({
    required this.entry,
    required this.service,
    required this.initialMeta,
  });
  @override
  State<_FavoriteDetailSheetLoader> createState() =>
      _FavoriteDetailSheetLoaderState();
}

class _FavoriteDetailSheetLoaderState
    extends State<_FavoriteDetailSheetLoader> {
  late Future<Map<String, dynamic>> _future;
  @override
  void initState() {
    super.initState();
    _future = widget.service.getEnrichedMeta(widget.entry, forceRefresh: true);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: .9,
      maxChildSize: .95,
      minChildSize: .6,
      expand: false,
      builder: (ctx, scroll) => FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (c, snap) {
          final meta = snap.data ?? widget.initialMeta;
          final loading = snap.connectionState == ConnectionState.waiting;
          final title = _resolveTitle(meta, widget.entry.targetType);
          final img = _resolveImage(meta);
          final rating = double.tryParse((meta['rating'] ?? '').toString());
          final reviewCount = int.tryParse(
            (meta['reviewCount'] ?? '').toString(),
          );
          final price = _price(meta);
          final currency = (meta['currency'] ?? '₺').toString();
          final chips = _chips(meta, widget.entry.targetType);
          final theme = Theme.of(context);
          return Container(
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.vertical(top: Radius.circular(26.r)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(.15),
                  blurRadius: 24,
                  offset: const Offset(0, -6),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                _HeaderBar(
                  entry: widget.entry,
                  service: widget.service,
                  imageUrl: img,
                  loading: loading,
                ),
                Expanded(
                  child: ListView(
                    controller: scroll,
                    padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 40.h),
                    children: [
                      _GoToSectionButton(entry: widget.entry),
                      SizedBox(height: 14.h),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              title,
                              style: TextStyle(
                                fontSize: 20.sp,
                                fontWeight: FontWeight.w800,
                                height: 1.15,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                          ),
                          if (rating != null)
                            _RatingBig(rating: rating, count: reviewCount),
                        ],
                      ),
                      SizedBox(height: 10.h),
                      if (chips.isNotEmpty)
                        Wrap(spacing: 6.w, runSpacing: 6.h, children: chips),
                      if (price != null)
                        Padding(
                          padding: EdgeInsets.only(top: 12.h),
                          child: Text(
                            'Fiyat: ${price.toStringAsFixed(0)} $currency',
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                              color: Colors.green.shade600,
                            ),
                          ),
                        ),
                      SizedBox(height: loading ? 20.h : 12.h),
                      if (loading) const LinearProgressIndicator(minHeight: 3),
                      if (!loading)
                        _MetaTable(meta: meta, type: widget.entry.targetType),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _resolveTitle(Map<String, dynamic> meta, String type) {
    final t = (meta['title'] ?? meta['name'] ?? '').toString();
    if (t.isNotEmpty) return t;
    switch (type) {
      case 'transfer':
        final from = meta['fromShort'] ?? '';
        final to = meta['toShort'] ?? '';
        final r = '$from → $to'.trim();
        if (r != '→') return r;
        break;
      case 'car':
        final b = meta['brand'] ?? '';
        final m = meta['model'] ?? '';
        final car = '$b $m'.trim();
        if (car.isNotEmpty) return car;
        break;
    }
    return 'Detay';
  }

  String _resolveImage(Map<String, dynamic> meta) {
    final img = (meta['imageUrl'] ?? meta['image'] ?? '')?.toString();
    if (img != null && img.isNotEmpty) return img;
    final images = meta['images'];
    if (images is List && images.isNotEmpty) return images.first.toString();
    return 'https://via.placeholder.com/800x500?text=Sefernur';
  }

  double? _price(Map<String, dynamic> m) {
    for (final k in ['price', 'minPrice', 'basePrice', 'dailyPrice']) {
      final v = m[k];
      if (v is num) return v.toDouble();
      if (v != null) {
        final p = double.tryParse(v.toString());
        if (p != null) return p;
      }
    }
    return null;
  }

  List<Widget> _chips(Map<String, dynamic> meta, String type) {
    final List<Widget> out = [];
    TextStyle st() => TextStyle(
      fontSize: 11.sp,
      fontWeight: FontWeight.w600,
      color: Colors.green.shade600,
    );
    Widget chip(String t) => Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: Colors.green.shade600.withOpacity(.08),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(t, style: st()),
    );
    switch (type) {
      case 'hotel':
        final c = (meta['city'] ?? '').toString();
        if (c.isNotEmpty) out.add(chip(c));
        final co = (meta['country'] ?? '').toString();
        if (co.isNotEmpty && co != c) out.add(chip(co));
        break;
      case 'tour':
        final d = (meta['durationDays'] ?? meta['duration'] ?? '').toString();
        if (d.isNotEmpty) out.add(chip('$d gün'));
        break;
      case 'transfer':
        final v = (meta['vehicleType'] ?? '').toString();
        if (v.isNotEmpty) out.add(chip(v));
        final cap = (meta['capacity'] ?? '').toString();
        if (cap.isNotEmpty) out.add(chip('$cap kişi'));
        break;
      case 'guide':
        final exp = (meta['yearsExperience'] ?? '').toString();
        if (exp.isNotEmpty) out.add(chip('$exp yıl deneyim'));
        final langs = (meta['languages'] ?? '').toString();
        if (langs.isNotEmpty) out.add(chip(langs));
        break;
      case 'car':
        final seats = (meta['seats'] ?? '').toString();
        if (seats.isNotEmpty) out.add(chip('$seats koltuk'));
        break;
      case 'campaign':
        final sub = (meta['subtitle'] ?? '').toString();
        if (sub.isNotEmpty) out.add(chip(sub));
        break;
    }
    return out;
  }
}

class _HeaderBar extends StatelessWidget {
  final FavoriteEntry entry;
  final FavoriteService service;
  final String imageUrl;
  final bool loading;
  const _HeaderBar({
    required this.entry,
    required this.service,
    required this.imageUrl,
    required this.loading,
  });
  @override
  Widget build(BuildContext context) {
    final isFav = service.isFavorite(entry.targetType, entry.targetId).obs;
    return SizedBox(
      height: 180.h,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: Image.network(
              imageUrl,
              fit: BoxFit.cover,
              color: loading ? Colors.black.withOpacity(.2) : null,
              colorBlendMode: loading ? BlendMode.darken : null,
              errorBuilder: (_, __, ___) => Container(
                color: Colors.grey[300],
                child: const Icon(Icons.image, size: 48),
              ),
            ),
          ),
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(.2),
                    Colors.black.withOpacity(.55),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            top: 12.h,
            left: 12.w,
            right: 12.w,
            child: Row(
              children: [
                _TypeBadge(type: entry.targetType),
                const Spacer(),
                Obx(
                  () => IconButton(
                    onPressed: () async {
                      await service.toggle(
                        type: entry.targetType,
                        targetId: entry.targetId,
                      );
                      isFav.value = !isFav.value;
                    },
                    icon: Icon(
                      isFav.value ? Icons.favorite : Icons.favorite_border,
                      color: isFav.value ? Colors.redAccent : Colors.white,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Get.back(),
                  icon: const Icon(Icons.close, color: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RatingBig extends StatelessWidget {
  final double rating;
  final int? count;
  const _RatingBig({required this.rating, this.count});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: Colors.amber[600],
        borderRadius: BorderRadius.circular(14.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star, size: 16, color: Colors.white),
          SizedBox(width: 4.w),
          Text(
            rating.toStringAsFixed(1),
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          if (count != null)
            Text(' ($count)', style: const TextStyle(color: Colors.white)),
        ],
      ),
    );
  }
}

class _MetaTable extends StatelessWidget {
  final Map<String, dynamic> meta;
  final String type;
  const _MetaTable({required this.meta, required this.type});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final rows = _filteredMeta();
    if (rows.isEmpty) return const SizedBox();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Detay Bilgileri',
          style: TextStyle(
            fontSize: 14.sp,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
        SizedBox(height: 8.h),
        ...rows.map(
          (e) => Padding(
            padding: EdgeInsets.only(bottom: 6.h),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 110.w,
                  child: Text(
                    e.$1,
                    style: TextStyle(
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    e.$2,
                    style: TextStyle(
                      fontSize: 11.sp,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<(String, String)> _filteredMeta() {
    final list = <(String, String)>[];
    void add(String k, dynamic v) {
      if (v == null) return;
      final s = v.toString();
      if (s.isEmpty) return;
      list.add((k, s));
    }

    switch (type) {
      case 'hotel':
        add('Şehir', meta['city']);
        add('Ülke', meta['country']);
        add('Min Fiyat', meta['minPrice']);
        break;
      case 'tour':
        add('Süre (gün)', meta['durationDays'] ?? meta['duration']);
        add('Fiyat', meta['basePrice']);
        break;
      case 'transfer':
        add('Araç Türü', meta['vehicleType']);
        add('Kapasite', meta['capacity']);
        add('Fiyat', meta['basePrice']);
        add(
          'Güzergah',
          '${meta['fromShort'] ?? ''} → ${meta['toShort'] ?? ''}',
        );
        break;
      case 'guide':
        add('Deneyim (yıl)', meta['yearsExperience']);
        add('Diller', meta['languages']);
        add('Günlük Ücret', meta['dailyRate']);
        break;
      case 'car':
        add('Marka', meta['brand']);
        add('Model', meta['model']);
        add('Koltuk', meta['seats']);
        add('Günlük Fiyat', meta['dailyPrice']);
        break;
      case 'campaign':
        add('Alt Başlık', meta['subtitle']);
        break;
    }
    add('Puan', meta['rating']);
    add('Yorum Sayısı', meta['reviewCount']);
    return list;
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
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(.45),
        borderRadius: BorderRadius.circular(14.r),
      ),
      child: Text(
        map[type] ?? type,
        style: TextStyle(
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
    );
  }
}

class _GoToSectionButton extends StatelessWidget {
  final FavoriteEntry entry;
  const _GoToSectionButton({required this.entry});
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: Get.theme.primaryColor.withOpacity(.1),
          foregroundColor: Get.theme.primaryColor,
          elevation: 0,
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14.r),
          ),
        ),
        icon: const Icon(Icons.open_in_new),
        label: const Text('İlgili Bölüme Git'),
        onPressed: () {
          // Haritalama: hotel -> hotels tab, car -> car rental tab, transfer -> transfers tab, guide -> guides tab, tour -> tours tab
          int targetTab = 0;
          switch (entry.targetType) {
            case 'hotel':
              targetTab = 0;
              break;
            case 'car':
              targetTab = 3;
              break; // varsayılan sıralamaya göre uyarlanabilir
            case 'transfer':
              targetTab = 2;
              break;
            case 'guide':
              targetTab = 4;
              break;
            case 'tour':
              targetTab = 1;
              break;
            default:
              targetTab = 0;
          }
          // Ana arama sekmesine geç
          if (Get.isRegistered<MainController>()) {
            Get.find<MainController>().changeTabIndex(1); // Search
          }
          // Ufak gecikme ile arama tablarının hazır olmasını bekleyip sonra ilgili alt tab'a geçecek event yayınla
          Future.delayed(const Duration(milliseconds: 150), () {
            if (Get.isRegistered<search.SearchController>()) {
              Get.find<search.SearchController>().requestExternalTab(targetTab);
            }
          });
          Get.back();
        },
      ),
    );
  }
}
