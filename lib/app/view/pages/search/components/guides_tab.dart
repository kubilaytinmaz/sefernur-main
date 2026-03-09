import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/guide_search_controller.dart';
import '../../../../data/models/promotion/promotion_model.dart';
import '../../../../routes/routes.dart';
import '../../../themes/theme.dart';
import '../../../widgets/destination_picker.dart';
import '../../../widgets/modern_date_picker.dart';
import '../../../widgets/search_action_button.dart';
import '../search_styles.dart';
import 'promotion_banner.dart';

class GuidesTab extends StatefulWidget {
  const GuidesTab({super.key});
  @override
  State<GuidesTab> createState() => _GuidesTabState();
}

class _GuidesTabState extends State<GuidesTab> {
  late final GuideSearchController controller;
  final regionCtrl = TextEditingController(); // legacy (unused in new UI)
  @override
  void initState() {
    super.initState();
    controller = Get.put(GuideSearchController());
  }

  @override
  void dispose() {
    regionCtrl.dispose();
    super.dispose();
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
            _popularGuides(isDark),
            SizedBox(height: 16.h),
            const PromotionBanner(targetType: PromotionTargetType.guide),
            SizedBox(height: 16.h),
            _whySection(isDark),
          ],
        ),
      ),
    );
  }

  Widget _formCard(BuildContext ctx, bool isDark) {
    return Container(
      padding: EdgeInsets.fromLTRB(14.w, 12.h, 14.w, 12.h),
      decoration: SearchStyles.card(
        radius: BorderRadius.circular(16.r),
        isDark: isDark,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _addressSelect(ctx, isDark),
          SizedBox(height: 12.h),
          Obx(
            () => _dateField(
              ctx,
              controller.serviceDate.value ?? DateTime.now(),
              isDark,
            ),
          ),
          SizedBox(height: 12.h),
          _experienceSlider(isDark),
          SizedBox(height: 10.h),
          _ratingSlider(isDark),
          SizedBox(height: 10.h),
          // Filters inside the same top card for consistency
          _languageChips(isDark),
          SizedBox(height: 10.h),
          _specialtyChips(isDark),
          SizedBox(height: 12.h),
          // Primary CTA inside the same card
          _cta(ctx),
        ],
      ),
    );
  }

  // Removed separate filters card; filters are inside the top form card

  Widget _addressSelect(BuildContext ctx, bool isDark) {
    final theme = Theme.of(ctx);
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Modern Destination Selector Button
          GestureDetector(
            onTap: () async {
              final result = await DestinationPicker.show(
                context: ctx,
                tag: 'guide_search_${DateTime.now().millisecondsSinceEpoch}',
                title: 'Rehber Arama Bölgesi',
                selectedAddresses: controller.selectedAddresses.toList(),
                multiSelect: true,
                onSelect: (addr) {
                  // Toggle: eğer zaten seçiliyse kaldır, değilse ekle
                  final existing = controller.selectedAddresses.indexWhere(
                    (a) => a.city.toLowerCase() == addr.city.toLowerCase(),
                  );
                  if (existing != -1) {
                    controller.removeSearchAddress(existing);
                  } else {
                    controller.addSearchAddress(addr);
                  }
                  setState(() {});
                },
              );
              if (result != null) {
                final existing = controller.selectedAddresses.indexWhere(
                  (a) => a.city.toLowerCase() == result.city.toLowerCase(),
                );
                if (existing == -1) {
                  controller.addSearchAddress(result);
                }
                setState(() {});
              }
            },
            child: Container(
              decoration: BoxDecoration(
                color: isDark
                    ? theme.colorScheme.surfaceContainerHighest
                    : Colors.white,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(
                  color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
                ),
              ),
              padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
              child: Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 20.sp,
                    color: controller.selectedAddresses.isNotEmpty
                        ? AppColors.primary
                        : (isDark ? Colors.grey[400] : Colors.grey[600]),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Arama Bölgesi',
                          style: TextStyle(
                            fontSize: 10.sp,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                        ),
                        SizedBox(height: 2.h),
                        Text(
                          controller.selectedAddresses.isEmpty
                              ? 'Bölge seçin'
                              : controller.selectedAddresses
                                    .map(
                                      (a) => a.city.isNotEmpty
                                          ? a.city
                                          : a.country,
                                    )
                                    .join(', '),
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: controller.selectedAddresses.isNotEmpty
                                ? FontWeight.w600
                                : FontWeight.w400,
                            color: controller.selectedAddresses.isNotEmpty
                                ? theme.colorScheme.onSurface
                                : (isDark
                                      ? Colors.grey[500]
                                      : Colors.grey[500]),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 30.h,
                    margin: EdgeInsets.symmetric(horizontal: 12.w),
                    color: isDark ? Colors.grey[700] : Colors.grey[300],
                  ),
                  GestureDetector(
                    onTap: () => Get.toNamed(
                      Routes.SELECT_LOCATION,
                      arguments: {'tag': 'guide_search_map'},
                    ),
                    child: Container(
                      padding: EdgeInsets.all(8.w),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.grey[800] : Colors.grey[100],
                        borderRadius: BorderRadius.circular(8.r),
                      ),
                      child: Icon(
                        Icons.map_outlined,
                        size: 20.sp,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Seçilen adresler chips olarak
          if (controller.selectedAddresses.isNotEmpty) ...[
            SizedBox(height: 10.h),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: controller.selectedAddresses.asMap().entries.map((e) {
                final idx = e.key;
                final a = e.value;
                final label = a.city.isNotEmpty
                    ? a.city
                    : (a.state.isNotEmpty ? a.state : a.country);
                return Chip(
                  label: Text(
                    label,
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  deleteIcon: Icon(Icons.close, size: 16.sp),
                  onDeleted: () {
                    controller.removeSearchAddress(idx);
                    setState(() {});
                  },
                  backgroundColor: isDark
                      ? Colors.green.shade900.withOpacity(0.4)
                      : Get.theme.primaryColor.withOpacity(0.1),
                  side: BorderSide(
                    color: isDark
                        ? Colors.green.shade700
                        : Get.theme.primaryColor.withOpacity(0.3),
                  ),
                );
              }).toList(),
            ),
            SizedBox(height: 8.h),
            // Eşleşme modu
            Row(
              children: [
                Text(
                  'Eşleşme:',
                  style: TextStyle(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                SizedBox(width: 8.w),
                ChoiceChip(
                  label: const Text('Tam'),
                  selected: controller.addressMatchMode.value == 'full',
                  onSelected: (_) {
                    controller.setAddressMatchMode('full');
                  },
                ),
                SizedBox(width: 6.w),
                ChoiceChip(
                  label: const Text('Şehir'),
                  selected: controller.addressMatchMode.value == 'city',
                  onSelected: (_) {
                    controller.setAddressMatchMode('city');
                  },
                ),
                SizedBox(width: 6.w),
                ChoiceChip(
                  label: const Text('Ülke'),
                  selected: controller.addressMatchMode.value == 'country',
                  onSelected: (_) {
                    controller.setAddressMatchMode('country');
                  },
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _dateField(BuildContext ctx, DateTime d, bool isDark) {
    final theme = Theme.of(ctx);
    return GestureDetector(
      onTap: () async {
        final picked = await ModernDatePicker.showSingle(
          context: ctx,
          initialDate: d,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
          label: 'Rehberlik Tarihi',
        );
        if (picked != null) controller.setDate(picked);
      },
      child: Container(
        padding: EdgeInsets.all(14.w),
        decoration: BoxDecoration(
          color: isDark
              ? theme.colorScheme.surfaceContainerHighest
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(14.r),
          border: Border.all(
            color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(8.w),
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.green.shade900.withOpacity(0.4)
                    : AppColors.primary.withOpacity(0.1),
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
                  'Hizmet Tarihi',
                  style: TextStyle(
                    fontSize: 11.sp,
                    color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                  ),
                ),
                SizedBox(height: 2.h),
                Text(
                  _fmtDate(d),
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Icon(
              Icons.chevron_right,
              color: isDark ? Colors.grey.shade500 : Colors.grey[400],
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
                'Minimum Puan: ${controller.minRating.value.toStringAsFixed(1)}',
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
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

  Widget _experienceSlider(bool isDark) {
    final theme = Theme.of(context);
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.work_history, color: Colors.blue[600], size: 18.sp),
              SizedBox(width: 6.w),
              Text(
                'Deneyim: ${controller.minExperience.value > 0 ? "${controller.minExperience.value} Yıl+" : "Tümü"}',
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              if (controller.minExperience.value > 0)
                TextButton(
                  onPressed: () => controller.setMinExperience(0),
                  child: const Text('Sıfırla'),
                ),
            ],
          ),
          Slider(
            min: 0,
            max: 20,
            divisions: 20,
            value: controller.minExperience.value.toDouble().clamp(0, 20),
            label: '${controller.minExperience.value} Yıl',
            onChanged: (v) => controller.setMinExperience(v.round()),
          ),
        ],
      ),
    );
  }

  String _fmtDate(DateTime d) {
    const months = [
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
    return '${d.day.toString().padLeft(2, '0')} ${months[d.month - 1]} ${d.year}';
  }

  Widget _languageChips(bool isDark) {
    final theme = Theme.of(context);
    return Obx(() {
      final langs = controller.allLanguages.toList()..sort();
      if (langs.isEmpty) return const SizedBox();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Diller',
            style: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 8.h),
          SizedBox(
            height: 40.h,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: langs.length,
              separatorBuilder: (_, __) => SizedBox(width: 8.w),
              itemBuilder: (_, i) {
                final l = langs[i];
                final sel = controller.selectedLanguages.contains(l);
                return FilterChip(
                  label: Text(l.toUpperCase()),
                  selected: sel,
                  onSelected: (_) => controller.toggleLanguage(l),
                );
              },
            ),
          ),
        ],
      );
    });
  }

  Widget _specialtyChips(bool isDark) {
    final theme = Theme.of(context);
    return Obx(() {
      final specs = controller.allSpecialties.toList()..sort();
      if (specs.isEmpty) return const SizedBox();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Uzmanlıklar',
            style: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 8.h),
          SizedBox(
            height: 40.h,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: specs.length,
              separatorBuilder: (_, __) => SizedBox(width: 8.w),
              itemBuilder: (_, i) {
                final s = specs[i];
                final sel = controller.selectedSpecialties.contains(s);
                return FilterChip(
                  label: Text(s.toUpperCase()),
                  selected: sel,
                  onSelected: (_) => controller.toggleSpecialty(s),
                );
              },
            ),
          ),
        ],
      );
    });
  }

  Widget _popularGuides(bool isDark) {
    final theme = Theme.of(context);
    return Obx(() {
      final list = controller.popularGuides;
      if (list.isEmpty) return const SizedBox();
      return Container(
        width: double.infinity,
        padding: EdgeInsets.all(16.w),
        decoration: SearchStyles.card(
          radius: BorderRadius.circular(18.r),
          isDark: isDark,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Popüler Rehberler',
              style: TextStyle(
                fontSize: 13.sp,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            SizedBox(height: 8.h),
            SizedBox(
              height: 110.h,
              child: ListView.separated(
                padding: EdgeInsets.symmetric(horizontal: 4.w),
                scrollDirection: Axis.horizontal,
                itemCount: list.length,
                separatorBuilder: (_, __) => SizedBox(width: 12.w),
                itemBuilder: (_, i) {
                  final g = list[i];
                  return Container(
                    width: 170.w,
                    padding: EdgeInsets.all(12.w),
                    decoration: BoxDecoration(
                      color: isDark
                          ? theme.colorScheme.surfaceContainerHighest
                          : Colors.white,
                      borderRadius: BorderRadius.circular(14.r),
                      border: Border.all(
                        color: isDark
                            ? theme.colorScheme.outline
                            : Colors.grey[200]!,
                      ),
                      boxShadow: isDark
                          ? null
                          : [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 6,
                                offset: const Offset(0, 3),
                              ),
                            ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.person,
                              size: 20.sp,
                              color: isDark
                                  ? Colors.blueGrey.shade300
                                  : Colors.blueGrey[400],
                            ),
                            SizedBox(width: 6.w),
                            Expanded(
                              child: Text(
                                g.name,
                                style: TextStyle(
                                  fontSize: 11.sp,
                                  fontWeight: FontWeight.w700,
                                  color: theme.colorScheme.onSurface,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 4.h),
                        Row(
                          children: [
                            Icon(Icons.star, size: 12.sp, color: Colors.amber),
                            SizedBox(width: 3.w),
                            Text(
                              g.rating.toStringAsFixed(1),
                              style: TextStyle(
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w600,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 4.h),
                        if (g.serviceAddresses.isNotEmpty)
                          Text(
                            g.serviceAddresses.first.short(),
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: isDark
                                  ? Colors.grey.shade400
                                  : Colors.grey[600],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        const Spacer(),
                        Text(
                          '₺${controller.rateFor(g).toStringAsFixed(0)}/gün',
                          style: TextStyle(
                            fontSize: 11.sp,
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? Colors.green.shade400
                                : Colors.green[700],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _cta(BuildContext ctx) => Obx(
    () => SearchActionButton(
      label: 'REHBER ARA',
      enabled: controller.canSearch,
      loading: controller.isSearching.value,
      onPressed: () async {
        await controller.search();
        Get.toNamed(Routes.GUIDES);
      },
    ),
  );

  // Removed separate CTA card; CTA is placed at the bottom of the top form card

  Widget _whySection(bool isDark) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(18.w),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.amber.shade900.withOpacity(0.3)
            : Colors.amber[50],
        borderRadius: BorderRadius.circular(18.r),
        border: Border.all(
          color: isDark ? Colors.amber.shade700 : Colors.amber[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: isDark ? Colors.amber.shade300 : Colors.amber[800],
              ),
              SizedBox(width: 8.w),
              Text(
                'Neden Rehber?',
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.amber.shade300 : Colors.amber[900],
                ),
              ),
            ],
          ),
          SizedBox(height: 10.h),
          Text(
            'Yetkin rehberler ibadet sürecinizi kolaylaştırır, kutsal mekanların tarihini doğru aktarır ve zaman yönetimine katkı sağlar.',
            style: TextStyle(
              fontSize: 13.sp,
              height: 1.45,
              color: isDark ? Colors.amber.shade400 : Colors.amber[900],
            ),
          ),
        ],
      ),
    );
  }
}
