import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/search/search_controller.dart' as search;
import '../../themes/theme.dart';
import 'components/car_rental_tab.dart';
import 'components/guides_tab.dart';
import 'components/hotels_tab.dart';
import 'components/tours_tab.dart';
import 'components/transfers_tab.dart';

class SearchContent extends StatefulWidget {
  const SearchContent({super.key});
  @override
  State<SearchContent> createState() => _SearchContentState();
}

class _SearchContentState extends State<SearchContent>
    with TickerProviderStateMixin {
  late final search.SearchController _searchController;
  late final TabController _tabController;
  Worker? _externalTabWorker;

  @override
  void initState() {
    super.initState();
    _searchController = Get.isRegistered<search.SearchController>()
        ? Get.find<search.SearchController>()
        : Get.put(search.SearchController());
    _tabController = TabController(
      length: 6,
      vsync: this,
      initialIndex: _searchController.selectedTabIndex.value,
    );
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) return; // wait final
      _searchController.changeTab(_tabController.index);
    });
    _externalTabWorker = ever<int>(_searchController.externalRequestedTab, (
      val,
    ) {
      if (val >= 0 && val < _tabController.length) {
        // Animate only if different
        if (_tabController.index != val) {
          _tabController.animateTo(val);
        }
        _searchController.changeTab(val);
        _searchController.externalRequestedTab.value = -1;
      }
    });

    // Eğer buton, SearchContent henüz build olmadan tab isteği yolladıysa burada yakala
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final pending = _searchController.externalRequestedTab.value;
      if (pending >= 0 && pending < _tabController.length) {
        if (_tabController.index != pending) {
          _tabController.animateTo(pending);
        }
        _searchController.changeTab(pending);
        _searchController.externalRequestedTab.value = -1;
      }
    });
  }

  @override
  void dispose() {
    _externalTabWorker?.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      color: theme.scaffoldBackgroundColor,
      child: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            automaticallyImplyLeading: false,
            elevation: 0,
            backgroundColor: AppColors.medinaGreen40,
            pinned: false,
            floating: true,
            snap: true,
            expandedHeight: 100.h,
            flexibleSpace: const FlexibleSpaceBar(background: _Header()),
          ),
          SliverPersistentHeader(
            pinned: true,
            delegate: _PinnedPillsHeaderDelegate(
              minExtentValue: 84.h,
              maxExtentValue: 84.h,
              controller: _tabController,
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: const [
            HotelsTab(),
            ToursTab(),
            TransfersTab(),
            CarRentalTab(),
            GuidesTab(),
            FlightsComingSoonTab(),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.medinaGreen40,
            AppColors.medinaGreen40.withValues(alpha: 0.9),
          ],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 10.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(
                    Icons.mosque_outlined,
                    color: Colors.white.withValues(alpha: .95),
                    size: 22.sp,
                  ),
                  SizedBox(width: 10.w),
                  Expanded(
                    child: Text(
                      'Sefernur ile Arama',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24.sp,
                        fontWeight: FontWeight.w700,
                        letterSpacing: .2,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 6.h),
              Text(
                'Arayışını detaylı bul - Otel, araç, transfer, rehber ve turlar.',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: .90),
                  fontSize: 16.sp,
                  height: 1.25,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PinnedPillsHeaderDelegate extends SliverPersistentHeaderDelegate {
  final double minExtentValue;
  final double maxExtentValue;
  final TabController controller;
  _PinnedPillsHeaderDelegate({
    required this.minExtentValue,
    required this.maxExtentValue,
    required this.controller,
  });

  @override
  double get minExtent => minExtentValue;

  @override
  double get maxExtent => maxExtentValue;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Stack(
      fit: StackFit.expand,
      children: [
        ColoredBox(color: AppColors.medinaGreen40),
        ColoredBox(color: AppColors.medinaGreen40.withValues(alpha: 0.9)),
        _PillTabs(controller: controller),
      ],
    );
  }

  @override
  bool shouldRebuild(covariant _PinnedPillsHeaderDelegate oldDelegate) {
    return minExtentValue != oldDelegate.minExtentValue ||
        maxExtentValue != oldDelegate.maxExtentValue;
  }
}

class _PillTabs extends StatefulWidget {
  final TabController controller;
  const _PillTabs({required this.controller});
  @override
  State<_PillTabs> createState() => _PillTabsState();
}

class _PillTabsState extends State<_PillTabs> {
  TabController get _controller => widget.controller;

  final _items = const [
    _PillItem('Oteller', Icons.home_work_outlined),
    _PillItem('Turlar', Icons.mosque_outlined),
    _PillItem('Transfer', Icons.directions_bus_filled),
    _PillItem('Taxi', Icons.directions_car_filled),
    _PillItem('Rehberler', Icons.menu_book_outlined),
    _PillItem('Uçak', Icons.flight_takeoff_outlined),
  ];

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller.addListener(_onChanged);
  }

  void _onChanged() {
    if (!mounted) return;
    setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_onChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primary = Get.theme.primaryColor;
    return Container(
      padding: EdgeInsets.fromLTRB(8.w, 6.h, 8.w, 8.h),
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Fixed order & rows: first 3 items top row, last 3 bottom row.
          // We only adapt sizing (padding, icon/text size) to fit width; no reordering.
          final maxWidth = constraints.maxWidth;
          final row1 = [0, 1, 2];
          final row2 = [3, 4, 5];

          final paddingCandidates = <double>[
            12.w,
            11.w,
            10.w,
            9.w,
            8.w,
            7.w,
            6.w,
          ];
          final fontCandidates = <double>[11.5.sp, 11.sp, 10.5.sp];
          final iconCandidates = <double>[16.sp, 15.sp, 14.sp];
          final gapCandidates = <double>[6.w, 5.w, 4.w];
          const spacing = 8.0; // fixed visual spacing between pills

          double rowTotalWidth(
            List<int> idxs,
            double padH,
            double fontSize,
            double iconSize,
            double gap,
          ) {
            double sum = 0;
            for (final i in idxs) {
              sum += _measurePillWidth(
                context,
                i,
                paddingH: padH,
                fontSize: fontSize,
                iconSize: iconSize,
                gap: gap,
              );
            }
            if (idxs.length > 1) sum += spacing * (idxs.length - 1);
            return sum;
          }

          double? chosenPad;
          double? chosenFont;
          double? chosenIcon;
          double? chosenGap;

          outer:
          for (final pad in paddingCandidates) {
            for (final font in fontCandidates) {
              for (final icon in iconCandidates) {
                for (final gap in gapCandidates) {
                  final w1 = rowTotalWidth(row1, pad, font, icon, gap);
                  final w2 = rowTotalWidth(row2, pad, font, icon, gap);
                  if (w1 <= maxWidth && w2 <= maxWidth) {
                    chosenPad = pad;
                    chosenFont = font;
                    chosenIcon = icon;
                    chosenGap = gap;
                    break outer;
                  }
                }
              }
            }
          }

          chosenPad ??= paddingCandidates.last;
          chosenFont ??= fontCandidates.last;
          chosenIcon ??= iconCandidates.last;
          chosenGap ??= gapCandidates.last;

          List<Widget> buildRow(List<int> idxs) => [
            for (var i = 0; i < idxs.length; i++) ...[
              if (i > 0) const SizedBox(width: spacing),
              _buildPill(
                idxs[i],
                primary,
                horizontalPadding: chosenPad!,
                fontSize: chosenFont!,
                iconSize: chosenIcon!,
                gap: chosenGap!,
              ),
            ],
          ];

          return Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: buildRow(row1),
              ),
              SizedBox(height: 4.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: buildRow(row2),
              ),
            ],
          );
        },
      ),
    );
  }

  // Measures the approximate width of a pill at index using the current styles
  double _measurePillWidth(
    BuildContext context,
    int index, {
    required double paddingH,
    required double fontSize,
    required double iconSize,
    required double gap,
  }) {
    final item = _items[index];
    final selected = _controller.index == index;
    final textStyle = TextStyle(
      fontSize: fontSize,
      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
      letterSpacing: .1,
    );

    final tp = TextPainter(
      text: TextSpan(text: item.label, style: textStyle),
      maxLines: 1,
      textDirection: TextDirection.ltr,
    )..layout();

    final textWidth = tp.width;
    final iconWidth = iconSize;
    final horizontalPaddingTotal = paddingH * 2;
    const borderTotal = 2.0; // 1px left + 1px right

    return horizontalPaddingTotal + iconWidth + gap + textWidth + borderTotal;
  }

  // Dynamic split helpers removed; fixed ordering is enforced.

  Widget _buildPill(
    int index,
    Color primary, {
    required double horizontalPadding,
    required double fontSize,
    required double iconSize,
    required double gap,
  }) {
    final item = _items[index];
    final selected = _controller.index == index;
    const bgSel = Colors.white;
    final bgUnSel = Colors.white.withValues(alpha: .12);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      padding: EdgeInsets.symmetric(
        horizontal: horizontalPadding,
        vertical: 8.h,
      ),
      decoration: BoxDecoration(
        color: selected ? bgSel : bgUnSel,
        borderRadius: BorderRadius.circular(26.r),
        border: Border.all(
          color: selected ? Colors.white : Colors.white.withValues(alpha: .18),
          width: 1,
        ),
        boxShadow: selected
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .15),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(26.r),
        onTap: () => _onTapPill(index),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              item.icon,
              size: iconSize,
              color: selected ? primary : Colors.white,
            ),
            SizedBox(width: gap),
            Text(
              item.label,
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? primary : Colors.white,
                letterSpacing: .1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _onTapPill(int index) {
    _controller.animateTo(index);
  }
}

class _PillItem {
  final String label;
  final IconData icon;
  const _PillItem(this.label, this.icon);
}

class FlightsComingSoonTab extends StatelessWidget {
  const FlightsComingSoonTab({super.key});
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
      alignment: Alignment.center,
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.flight_takeoff_outlined, size: 48.sp, color: Colors.white),
          SizedBox(height: 12.h),
          Text(
            'Uçak bileti hizmeti için en uygun fiyat alınabilecek bir sistem hazırlanmaktadır.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: .85),
            ),
          ),
          SizedBox(height: 6.h),
          Text(
            'İnşallah en kısa zamanda aktif olacaktır.\nErken rezervasyon fırsatları ve uygun fiyatlar için takipte kalınız.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11.5.sp,
              height: 1.3,
              color: Colors.white.withValues(alpha: .75),
            ),
          ),
        ],
      ),
    );
  }
}
