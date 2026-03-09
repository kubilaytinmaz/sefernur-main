import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/tour_search_controller.dart';
import '../../../../data/models/address/address_model.dart';
import '../../../../data/models/promotion/promotion_model.dart';
import '../../../../data/models/tour/tour_model.dart';
import '../../../../routes/routes.dart';
import '../../../themes/colors/app_colors.dart';
import '../../../themes/theme.dart';
import '../../../widgets/modern_date_picker.dart';
import '../../../widgets/search_action_button.dart';
import '../search_styles.dart';
import 'promotion_banner.dart';

class ToursTab extends StatefulWidget {
  const ToursTab({super.key});
  @override
  State<ToursTab> createState() => _ToursTabState();
}

class _ToursTabState extends State<ToursTab> {
  late final TourSearchController controller;
  TourModel? _selectedTour;
  @override
  void initState() {
    super.initState();
    controller = Get.put(TourSearchController());
    controller.preload();
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
            _formCard(context, isDark),
            SizedBox(height: 16.h),
            _popularToursSection(isDark),
            SizedBox(height: 16.h),
            const PromotionBanner(targetType: PromotionTargetType.tour),
            SizedBox(height: 16.h),
            _infoSection(isDark),
          ],
        ),
      ),
    );
  }

  Widget _formCard(BuildContext ctx, bool isDark) {
    return Container(
      padding: EdgeInsets.fromLTRB(14.w, 12.h, 14.w, 12.h),
      decoration: SearchStyles.card(radius: BorderRadius.circular(16.r), isDark: isDark),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _tourSearchField(isDark),
          SizedBox(height: 8.h),
          Obx(() {
            if (controller.selectedRegionAddresses.isEmpty) {
              return const SizedBox.shrink();
            }
            return Padding(
              padding: EdgeInsets.only(bottom: 8.h),
              child: _regionAddressesSection(isDark),
            );
          }),
          Obx(() => _dateField(ctx, controller.travelDate.value ?? DateTime.now(), isDark)),
          SizedBox(height: 12.h),
          _paxRow(isDark),
            SizedBox(height: 10.h),
          _ratingSlider(isDark),
          SizedBox(height: 6.h),
          _durationSlider(isDark),
          SizedBox(height: 12.h),
          _categoryChips(isDark),
          SizedBox(height: 10.h),
          _tagChips(isDark),
          SizedBox(height: 12.h),
          _searchButton(ctx),
        ],
      ),
    );
  }

  // Removed separate filters card to keep filters within top form card

  Widget _regionAddressesSection(bool isDark) {
    return Obx(() {
      final addrs = controller.selectedRegionAddresses;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (addrs.isNotEmpty)
            Column(
              children: addrs.asMap().entries.map((e) {
                final i = e.key;
                final a = e.value;
                return _addressTile(a, i, isDark);
              }).toList(),
            ),
        ],
      );
    });
  }

  Widget _tourSearchField(bool isDark) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: _openTourSearchBottomSheet,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(14.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.white,
          borderRadius: BorderRadius.circular(14.r),
          border: Border.all(
            color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.search,
              size: 20.sp,
              color: isDark ? Colors.grey.shade400 : Colors.grey[600],
            ),
            SizedBox(width: 10.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tur Arama',
                    style: TextStyle(
                      fontSize: 10.sp,
                      color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    _selectedTour?.title ?? 'Tur, paket veya tema seçin',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.keyboard_arrow_down, color: Colors.grey[500]),
          ],
        ),
      ),
    );
  }

  void _openTourSearchBottomSheet() {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final query = ''.obs;

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.75,
          minChildSize: 0.45,
          maxChildSize: 0.95,
          expand: false,
          builder: (_, scrollController) {
            return Obx(() {
              final text = query.value.trim().toLowerCase();
              final all = controller.allTours.toList();
              final popular = controller.popularTours.toList();

              final filtered = text.isEmpty
                  ? all
                  : all.where((t) {
                      final title = t.title.toLowerCase();
                      final category = t.category.toLowerCase();
                      final tags = t.tags.join(' ').toLowerCase();
                      return title.contains(text) ||
                          category.contains(text) ||
                          tags.contains(text);
                    }).toList();

              return Column(
                children: [
                  SizedBox(height: 8.h),
                  Container(
                    width: 40.w,
                    height: 4.h,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[600] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(2.r),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.fromLTRB(16.w, 14.h, 16.w, 8.h),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Tur Seç',
                            style: TextStyle(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(ctx),
                          icon: const Icon(Icons.close),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    child: TextField(
                      onChanged: (v) => query.value = v,
                      decoration: InputDecoration(
                        hintText: 'Tur adı, kategori veya etiket ara',
                        prefixIcon: const Icon(Icons.search),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 10.h),
                  Expanded(
                    child: ListView(
                      controller: scrollController,
                      padding: EdgeInsets.fromLTRB(16.w, 6.h, 16.w, 20.h),
                      children: [
                        if (text.isEmpty && popular.isNotEmpty) ...[
                          Text(
                            'Popüler Turlar',
                            style: TextStyle(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          SizedBox(height: 8.h),
                          ...popular.take(6).map(
                            (t) => _tourSearchTile(t, ctx, isDark),
                          ),
                          SizedBox(height: 8.h),
                        ],
                        Text(
                          'Tüm Turlar',
                          style: TextStyle(
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        SizedBox(height: 8.h),
                        ...filtered.map(
                          (t) => _tourSearchTile(t, ctx, isDark),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            });
          },
        );
      },
    );
  }

  Widget _tourSearchTile(TourModel tour, BuildContext ctx, bool isDark) {
    final theme = Theme.of(ctx);
    final hasImage = tour.images.isNotEmpty;
    final price = controller.priceFor(tour);

    return GestureDetector(
      onTap: () {
        Navigator.pop(ctx);
        Get.toNamed(Routes.TOURS, arguments: {'openTour': tour});
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 10.h),
        decoration: BoxDecoration(
          color: isDark
              ? theme.colorScheme.surfaceContainerHighest
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isDark ? Colors.grey[700]! : Colors.grey[200]!,
          ),
        ),
        child: Row(
          children: [
            // Tour image thumbnail
            ClipRRect(
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12.r),
                bottomLeft: Radius.circular(12.r),
              ),
              child: hasImage
                  ? Image.network(
                      tour.images.first,
                      width: 80.w,
                      height: 80.h,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 80.w,
                        height: 80.h,
                        color: isDark ? Colors.grey[800] : Colors.grey[200],
                        child: Icon(Icons.mosque_outlined,
                            size: 28.sp, color: theme.colorScheme.primary),
                      ),
                    )
                  : Container(
                      width: 80.w,
                      height: 80.h,
                      color: isDark ? Colors.grey[800] : Colors.grey[200],
                      child: Icon(Icons.mosque_outlined,
                          size: 28.sp, color: theme.colorScheme.primary),
                    ),
            ),
            SizedBox(width: 12.w),
            // Tour info
            Expanded(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 10.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tour.title,
                      style: TextStyle(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      '${tour.durationDays} gün • ${tour.category}',
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                    if (price > 0) ...[
                      SizedBox(height: 4.h),
                      Text(
                        '${price.toStringAsFixed(0)} ₺',
                        style: TextStyle(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w800,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.only(right: 10.w),
              child: Icon(Icons.chevron_right,
                  size: 20.sp,
                  color: isDark ? Colors.grey[500] : Colors.grey[400]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _addressTile(AddressModel a, int index, bool isDark) {
    final theme = Theme.of(context);
    final parts = <String>[];
    if (a.city.isNotEmpty) parts.add(a.city);
    if (a.state.isNotEmpty && a.state.toLowerCase() != a.city.toLowerCase()) {
      parts.add(a.state);
    }
    if (a.country.isNotEmpty) parts.add(a.country);
    final short = parts.isEmpty
        ? (a.address.isNotEmpty ? a.address : 'Adres')
        : parts.join(' • ');
    return Container(
      margin: EdgeInsets.only(bottom: 6.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.white,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(color: isDark ? theme.colorScheme.outline : Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Icon(Icons.place, size: 16.sp, color: isDark ? Colors.green.shade400 : Get.theme.primaryColor),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(
              short,
              style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            onPressed: () => controller.removeRegionAddressAt(index),
            icon: Icon(Icons.close, size: 18, color: theme.colorScheme.onSurface),
            tooltip: 'Kaldır',
          ),
        ],
      ),
    );
  }

  // _pickRegionAddress kaldırıldı (adres ekleme geçici olarak devre dışı)

  Widget _dateField(BuildContext ctx, DateTime d, bool isDark) {
    final theme = Theme.of(ctx);
    return GestureDetector(
      onTap: () async {
          final picked = await ModernDatePicker.showSingle(
            context: ctx,
            initialDate: d,
            firstDate: DateTime.now(),
            lastDate: DateTime.now().add(const Duration(days: 365)),
            label: 'Tur Tarihi',
          );
        if (picked != null) controller.setDate(picked);
      },
      child: Container(
        padding: EdgeInsets.all(14.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50],
          borderRadius: BorderRadius.circular(14.r),
          border: Border.all(color: isDark ? theme.colorScheme.outline : Colors.grey[300]!),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(8.w),
              decoration: BoxDecoration(
                color: isDark ? Colors.green.shade900.withOpacity(0.4) : AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(
                Icons.calendar_month,
                size: 20.sp,
                color: isDark ? Colors.green.shade400 : AppColors.primary,
              ),
            ),
            SizedBox(width: 12.w),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tur Tarihi',
                  style: TextStyle(fontSize: 11.sp, color: isDark ? Colors.grey.shade400 : Colors.grey[600]),
                ),
                SizedBox(height: 2.h),
                Text(
                  _fmtDate(d),
                  style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface),
                ),
              ],
            ),
            const Spacer(),
            Icon(Icons.chevron_right, color: isDark ? Colors.grey.shade500 : Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  String _fmtDate(DateTime d) {
    const m = [
      'Ocak',
      'Şub',
      'Mar',
      'Nis',
      'May',
      'Haz',
      'Tem',
      'Ağu',
      'Eyl',
      'Eki',
      'Kas',
      'Ara',
    ];
    return '${d.day.toString().padLeft(2, '0')} ${m[d.month - 1]} ${d.year}';
  }

  Widget _paxRow(bool isDark) {
    return Obx(
      () => Row(
        children: [
          _counter(
            'Yetişkin',
            controller.adults.value,
            controller.incAdults,
            controller.decAdults,
            isDark,
          ),
          SizedBox(width: 12.w),
          _counter(
            'Çocuk',
            controller.children.value,
            controller.incChildren,
            controller.decChildren,
            isDark,
          ),
        ],
      ),
    );
  }

  Widget _counter(String label, int value, VoidCallback inc, VoidCallback dec, bool isDark) {
    final theme = Theme.of(context);
    return Expanded(
      child: Container(
        padding: EdgeInsets.all(14.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50],
          borderRadius: BorderRadius.circular(14.r),
          border: Border.all(color: isDark ? theme.colorScheme.outline : Colors.grey[300]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 11.sp, color: isDark ? Colors.grey.shade400 : Colors.grey[600]),
            ),
            SizedBox(height: 6.h),
            Row(
              children: [
                IconButton(
                  onPressed: dec,
                  icon: Icon(Icons.remove_circle_outline, color: theme.colorScheme.onSurface),
                ),
                Text(
                  '$value',
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                IconButton(
                  onPressed: inc,
                  icon: Icon(Icons.add_circle_outline, color: theme.colorScheme.onSurface),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _ratingSlider(bool isDark) {
    final theme = Theme.of(context);
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.star, color: Colors.amber[600], size: 18.sp),
              SizedBox(width: 6.w),
              Text(
                'Min Puan: ${controller.minRating.value.toStringAsFixed(1)}',
                style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
              ),
              if (controller.minRating.value > 0)
                TextButton(
                  onPressed: () => controller.setMinRating(0),
                  child: const Text('Sıfırla'),
                ),
            ],
          ),
          Slider(
            min: 0,
            max: 5,
            divisions: 10,
            value: controller.minRating.value.clamp(0, 5),
            label: controller.minRating.value.toStringAsFixed(1),
            onChanged: (v) => controller.setMinRating(v),
          ),
        ],
      ),
    );
  }

  Widget _durationSlider(bool isDark) {
    final theme = Theme.of(context);
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.timelapse, size: 18.sp, color: isDark ? Colors.blueGrey.shade400 : Colors.blueGrey[600]),
              SizedBox(width: 6.w),
              Text(
                'Maks. Gün: ${controller.maxDuration.value == 0 ? 'Sınırsız' : controller.maxDuration.value}',
                style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
              ),
              if (controller.maxDuration.value > 0)
                TextButton(
                  onPressed: () => controller.setMaxDuration(0),
                  child: const Text('Temizle'),
                ),
            ],
          ),
          Slider(
            min: 0,
            max: 30,
            divisions: 30,
            value: controller.maxDuration.value.toDouble(),
            label: controller.maxDuration.value == 0
                ? 'Sınırsız'
                : controller.maxDuration.value.toString(),
            onChanged: (v) => controller.setMaxDuration(v.round()),
          ),
        ],
      ),
    );
  }

  Widget _categoryChips(bool isDark) {
    final theme = Theme.of(context);
    return Obx(() {
      if (controller.loadingCatalog.value) {
        return _sectionSkeleton(title: 'Kategoriler', itemWidth: 70.w, isDark: isDark);
      }
      final cats = controller.allCategories.toList();
      if (cats.isEmpty) return const SizedBox();
      final selectedCount = controller.selectedCategories.length;
      return GestureDetector(
        onTap: () => _showCategoryBottomSheet(cats, isDark),
        child: Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
          decoration: BoxDecoration(
            color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.white,
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(color: isDark ? theme.colorScheme.outline : Colors.grey[300]!),
          ),
          child: Row(
            children: [
              Icon(Icons.category_outlined, size: 20.sp, color: isDark ? Colors.green.shade400 : Get.theme.primaryColor),
              SizedBox(width: 10.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Kategoriler',
                      style: TextStyle(fontSize: 10.sp, color: isDark ? Colors.grey.shade400 : Colors.grey[600]),
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      selectedCount == 0 ? 'Tümü' : '$selectedCount kategori seçili',
                      style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
                    ),
                  ],
                ),
              ),
              Icon(Icons.keyboard_arrow_down, size: 20.sp, color: isDark ? Colors.grey.shade400 : Colors.grey[500]),
            ],
          ),
        ),
      );
    });
  }

  void _showCategoryBottomSheet(List<String> cats, bool isDark) {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (_, scrollCtrl) {
            return Column(
              children: [
                // Header
                Padding(
                  padding: EdgeInsets.all(16.w),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Kategori Seç',
                          style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          controller.selectedCategories.clear();
                          controller.filteredResults.refresh();
                        },
                        child: const Text('Temizle'),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: Icon(Icons.close, color: theme.colorScheme.onSurface),
                      ),
                    ],
                  ),
                ),
                // Search field
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  child: TextField(
                    style: TextStyle(color: theme.colorScheme.onSurface),
                    decoration: InputDecoration(
                      hintText: 'Kategori ara...',
                      hintStyle: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey[600]),
                      prefixIcon: Icon(Icons.search, color: theme.colorScheme.onSurface),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                    ),
                    onChanged: (val) {
                      // Filter locally if needed
                    },
                  ),
                ),
                SizedBox(height: 12.h),
                // List
                Expanded(
                  child: ListView.builder(
                    controller: scrollCtrl,
                    itemCount: cats.length,
                    itemBuilder: (_, i) {
                      final c = cats[i];
                      return Obx(() {
                        final sel = controller.selectedCategories.contains(c);
                        return CheckboxListTile(
                          value: sel,
                          onChanged: (_) => controller.toggleCategory(c),
                          title: Text(c.toUpperCase(), style: TextStyle(color: theme.colorScheme.onSurface)),
                          controlAffinity: ListTileControlAffinity.leading,
                          activeColor: isDark ? Colors.green.shade400 : Get.theme.primaryColor,
                        );
                      });
                    },
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _tagChips(bool isDark) {
    return Obx(() {
      if (controller.loadingCatalog.value) {
        return _sectionSkeleton(title: 'Etiketler', itemWidth: 60.w, isDark: isDark);
      }
      final tags = controller.allTags.toList();
      if (tags.isEmpty) return const SizedBox();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Etiketler',
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey.shade300 : Colors.grey[700],
                ),
              ),
              const Spacer(),
              if (controller.selectedTags.isNotEmpty)
                TextButton(
                  onPressed: () {
                    controller.selectedTags.clear();
                    controller.filteredResults.refresh();
                  },
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size(40.w, 24.h)),
                  child: Text('Temizle', style: TextStyle(fontSize: 11.sp)),
                ),
            ],
          ),
          SizedBox(height: 6.h),
          SizedBox(
            height: 32.h,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: tags.length,
              separatorBuilder: (_, __) => SizedBox(width: 8.w),
              itemBuilder: (_, i) {
                final t = tags[i];
                final sel = controller.selectedTags.contains(t);
                return FilterChip(
                  label: Text(t.toUpperCase(), style: TextStyle(fontSize: 11.sp)),
                  selected: sel,
                  onSelected: (_) => controller.toggleTag(t),
                  visualDensity: const VisualDensity(horizontal: -2, vertical: -2),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                );
              },
            ),
          ),
        ],
      );
    });
  }

  Widget _popularToursSection(bool isDark) {
    final theme = Theme.of(context);
    return Obx(() {
      if (controller.loadingCatalog.value) {
        return _sectionSkeleton(
          title: 'Popüler Turlar',
          itemWidth: 120.w,
          rows: 2,
          isDark: isDark,
        );
      }
        // Artık yalnızca admin tarafından işaretlenen popüler turlar gösterilir (isPopular == true)
        final pops = controller.popularTours.toList();
        if (pops.isEmpty) return const SizedBox();
        final top = pops.take(5).toList();
      return Container(
        width: double.infinity,
        padding: EdgeInsets.all(16.w),
        decoration: SearchStyles.card(radius: BorderRadius.circular(18.r), isDark: isDark),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Popüler Turlar',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () {
                      controller.showPopularOnly();
                      // Arama sonuç sayfasına yönlendir (Routes.TOURS varsayılan route adı)
                      Get.toNamed(Routes.TOURS, arguments: {'popularOnly': true});
                  },
                  child: const Text('Tümü'),
                ),
              ],
            ),
            SizedBox(height: 8.h),
            Column(children: top.map((t) => _popularItem(t, isDark)).toList()),
          ],
        ),
      );
    });
  }

  Widget _popularItem(TourModel t, bool isDark) {
    final theme = Theme.of(context);
    return Container(
      margin: EdgeInsets.only(bottom: 10.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.white,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(color: isDark ? theme.colorScheme.outline : Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Icon(
            Icons.local_activity,
            color: isDark ? Colors.green.shade400 : Get.theme.primaryColor,
            size: 20.sp,
          ),
          SizedBox(width: 10.w),
          Expanded(
            child: Text(
              t.title,
              style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Icon(Icons.star, size: 14.sp, color: Colors.amber),
          SizedBox(width: 4.w),
          Text(
            t.rating.toStringAsFixed(1),
            style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
          ),
        ],
      ),
    );
  }

  Widget _sectionSkeleton({
    required String title,
    required double itemWidth,
    int rows = 1,
    bool isDark = false,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface),
              ),
            ),
            SizedBox(width: 40.w, height: 18.h, child: _shimmerBox(isDark)),
          ],
        ),
        SizedBox(height: 8.h),
        Wrap(
          spacing: 8.w,
          runSpacing: 8.h,
          children: List.generate(
            rows * 6,
            (i) => _shimmerChip(width: itemWidth, isDark: isDark),
          ).toList(),
        ),
      ],
    );
  }

  Widget _shimmerChip({required double width, bool isDark = false}) {
    return Container(
      width: width,
      height: 30.h,
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[200],
        borderRadius: BorderRadius.circular(20.r),
      ),
    );
  }

  Widget _shimmerBox(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[200],
        borderRadius: BorderRadius.circular(8.r),
      ),
    );
  }

  Widget _searchButton(BuildContext ctx) => Obx(
    () => SearchActionButton(
      label: 'TUR ARA',
      enabled: controller.canSearch,
      loading: controller.isSearching.value,
      onPressed: () async {
        await controller.search();
        Get.toNamed(Routes.TOURS);
      },
    ),
  );

  // Removed separate CTA card; CTA is now inside the top form card

  Widget _infoSection(bool isDark) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(18.w),
      decoration: BoxDecoration(
        color: isDark ? Colors.blue.shade900.withOpacity(0.3) : Colors.blue[50],
        borderRadius: BorderRadius.circular(18.r),
        border: Border.all(color: isDark ? Colors.blue.shade700 : Colors.blue[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: isDark ? Colors.blue.shade300 : Colors.blue[800]),
              SizedBox(width: 8.w),
              Text(
                'Tur Bilgileri',
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.blue.shade300 : Colors.blue[900],
                ),
              ),
            ],
          ),
          SizedBox(height: 10.h),
          Text(
            'Paket turlarda konaklama, rehberlik ve ulaşım içerikleri farklılık gösterebilir. Detay sayfasından günlük program ve özel fiyatları inceleyin.',
            style: TextStyle(
              fontSize: 13.sp,
              height: 1.45,
              color: isDark ? Colors.blue.shade400 : Colors.blue[900],
            ),
          ),
        ],
      ),
    );
  }
}
