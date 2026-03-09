import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/search/guide_search_controller.dart';
import '../../../data/models/guide/guide_model.dart';
import '../../widgets/app/listing_app_bar.dart';
import '../../widgets/filters/filter_bar.dart';
import '../../widgets/filters/sort_sheet.dart';
import '../../widgets/regions/page_region.dart';
import '../../widgets/search/floating_search_shortcut_button.dart';
import '../../widgets/search_action_button.dart';
import 'components/guide_card.dart';
import 'components/guide_detail_sheet.dart';
import 'components/guide_filter_sheet.dart';

class GuidesPage extends StatelessWidget {
  const GuidesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<GuideSearchController>()
        ? Get.find<GuideSearchController>()
        : Get.put(GuideSearchController());
    if (!controller.hasLoadedAll && controller.results.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => controller.loadAllGuides(),
      );
    }
    return PageRegion(
      child: Scaffold(
        appBar: const ListingAppBar(title: 'Rehberler'),
        body: Obx(() {
          return RefreshIndicator(
            onRefresh: () async {
              await controller.search();
            },
            child: CustomScrollView(
              slivers: [
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _GuidesFilterHeaderDelegate(
                    child: Obx(
                      () => ListingFilterBar(
                        onOpenSort: () => showSortSheet<String>(
                          selected: controller.sortOption.value,
                          options: const [
                            SortOption('price_asc', 'Fiyat (Artan)'),
                            SortOption('price_desc', 'Fiyat (Azalan)'),
                            SortOption('rating_desc', 'Puan (Yüksek)'),
                            SortOption('experience_desc', 'Deneyim (Yüksek)'),
                          ],
                          onSelect: (v) => controller.setSort(v),
                        ),
                        onOpenFilters: () => _openFilterSheet(controller),
                        activeFilterCount: controller.activeFilterCount(),
                        resultCount: controller.filteredResults.length,
                        inlineResult: true,
                        trailing: Obx(() {
                          final theme = Theme.of(context);
                          final isDark = theme.brightness == Brightness.dark;
                          return IconButton(
                            tooltip: 'Favoriler',
                            onPressed: controller.toggleFavoritesOnly,
                            icon: Icon(
                              controller.favoritesOnly.value
                                  ? Icons.favorite
                                  : Icons.favorite_border,
                              color: controller.favoritesOnly.value
                                  ? Colors.red
                                  : (isDark
                                        ? Colors.grey[400]
                                        : Colors.grey[600]),
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                ),
                if (controller.isSearching.value)
                  const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (controller.filteredResults.isEmpty)
                  SliverFillRemaining(child: _emptyState(controller))
                else
                  SliverPadding(
                    padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 32.h),
                    sliver: SliverGrid(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 14.h,
                        crossAxisSpacing: 14.w,
                        childAspectRatio: .48,
                      ),
                      delegate: SliverChildBuilderDelegate((_, i) {
                        final guide = controller.filteredResults[i];
                        return GuideCard(
                          guide: guide,
                          controller: controller,
                          onTap: () => _openDetail(guide, controller),
                        );
                      }, childCount: controller.filteredResults.length),
                    ),
                  ),
                SliverToBoxAdapter(child: SizedBox(height: 40.h)),
              ],
            ),
          );
        }),
        floatingActionButton: const FloatingSearchShortcutButton(
          searchTabIndex: 4,
        ),
      ),
    );
  }

  void _openFilterSheet(GuideSearchController c) {
    Get.bottomSheet(
      GuideFilterSheet(c: c),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  // Removed local sort sheet in favor of shared showSortSheet helper.

  Widget _emptyState(GuideSearchController c) {
    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        final iconColor = isDark ? Colors.grey[500] : Colors.grey[400];
        final textColor = isDark ? Colors.grey[400] : Colors.grey[700];

        return ListView(
          padding: EdgeInsets.symmetric(horizontal: 32.w, vertical: 60.h),
          children: [
            Icon(Icons.search_off, size: 72.sp, color: iconColor),
            SizedBox(height: 20.h),
            if (c.errorMessage.value.trim().isNotEmpty) ...[
              Text(
                'Rehberler yüklenirken bir sorun oluştu',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
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
              SizedBox(height: 16.h),
            ],
            Text(
              c.results.isEmpty ? 'Rehber araması yapın' : 'Sonuç bulunamadı',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15.sp,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
            SizedBox(height: 24.h),
            if (c.results.isNotEmpty)
              SearchActionButton(
                label: 'FİLTRELERİ SIFIRLA',
                enabled: true,
                loading: false,
                onPressed: () {
                  c.clearFilters();
                },
              ),
          ],
        );
      },
    );
  }

  void _openDetail(GuideModel guide, GuideSearchController c) {
    if (guide.id == null) return;
    Get.bottomSheet(
      GuideDetailSheet(guide: guide, controller: c),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }
}

class _GuidesFilterHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  _GuidesFilterHeaderDelegate({required this.child});
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
  bool shouldRebuild(covariant _GuidesFilterHeaderDelegate oldDelegate) =>
      false;
}
