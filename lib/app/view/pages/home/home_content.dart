import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:sefernur/app/view/themes/theme.dart';

import '../../../data/enums/blog_category.dart';
import '../../../data/enums/place_city.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../widgets/blog/blog_horizontal_list.dart';
import '../../widgets/blog/blog_list_sheet.dart';
import '../../widgets/place/place_horizontal_list.dart';
import '../../widgets/place/place_list_sheet.dart';
import '../../widgets/review/review_horizontal_list.dart';
import '../../widgets/review/review_list_sheet.dart';
import '../../widgets/tour/tour_horizontal_list.dart';
import '../../widgets/tour/tour_list_sheet.dart';
import 'widgets/admin_add_sheet.dart';
import 'widgets/greeting_card.dart';
import 'widgets/section_header.dart';
import 'widgets/top_categories.dart';
import 'widgets/weather_comparison.dart';

class HomeContent extends StatelessWidget {
  const HomeContent({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
          bottom: false,
        child: CustomScrollView(
          slivers: [
            const SliverToBoxAdapter(child: GreetingCard()),
            const SliverToBoxAdapter(child: SizedBox(height: 14)),
            const SliverToBoxAdapter(child: TopCategoriesGrid()),
            SliverToBoxAdapter(
              child: SectionHeader(
                'Mekke’de Gezilecek Yerler',
                onSeeAll: () =>
                    PlaceListSheet.show(city: PlaceCity.mekke, showAll: false),
              ),
            ),
            const SliverToBoxAdapter(
              child: PlaceHorizontalList(city: PlaceCity.mekke),
            ),
            SliverToBoxAdapter(
              child: SectionHeader(
                'Medine’de Gezilecek Yerler',
                onSeeAll: () =>
                    PlaceListSheet.show(city: PlaceCity.medine, showAll: false),
              ),
            ),
            const SliverToBoxAdapter(
              child: PlaceHorizontalList(city: PlaceCity.medine),
            ),
            SliverToBoxAdapter(
              child: SectionHeader(
                'Hazırlık Rehberleri',
                subtitle: 'Umre öncesi ipuçları',
                onSeeAll: () => BlogListSheet.show(
                  category: BlogCategory.hazirlik,
                  showAll: false,
                ),
              ),
            ),
            const SliverToBoxAdapter(
              child: BlogHorizontalList(category: BlogCategory.hazirlik),
            ),
            const SliverToBoxAdapter(
              child: SectionHeader(
                'Aylık Hava Durumu',
                subtitle: 'Mekke & Medine',
              ),
            ),
            const SliverToBoxAdapter(child: WeatherComparison()),
            SliverToBoxAdapter(
              child: SectionHeader(
                'Umre Turları',
                subtitle: 'Öne çıkan paketler',
                onSeeAll: () => TourListSheet.show(showAll: false),
              ),
            ),
            const SliverToBoxAdapter(child: TourHorizontalList()),
            SliverToBoxAdapter(
              child: SectionHeader(
                'Yorumlar',
                subtitle: 'Kullanıcı deneyimleri',
                // See all: open sheet showing latest 50 published reviews
                onSeeAll: () => ReviewListSheet.show(showAllLatest: true),
              ),
            ),
            const SliverToBoxAdapter(child: ReviewHorizontalList()),
            const SliverPadding(padding: EdgeInsets.only(bottom: 20)),
          ],
        ),
      ),
      floatingActionButton: _buildAdminFab(context),
    );
  }

  Widget? _buildAdminFab(BuildContext context) {
    final auth = Get.find<AuthService>();
    if (!auth.isUserAdmin()) return null;
    return FloatingActionButton(
      onPressed: () => _openAdminSheet(context),
      backgroundColor: AppColors.medinaGreen40,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: const Icon(Icons.add, color: Colors.white),
    );
  }

  void _openAdminSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AdminAddSheet(),
    );
  }
}
