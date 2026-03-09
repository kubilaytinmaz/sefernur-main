import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/profile/profile_controller.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../themes/theme.dart';
import '../../widgets/widget.dart';
import '../travels/travels_content.dart';
import 'widgets/applications_tab.dart';
import 'widgets/guest_profile_view.dart';
import 'widgets/profile_header.dart';
import 'widgets/reservations_tab.dart';
import 'widgets/reviews_tab.dart';
import 'widgets/settings_tab.dart';

class ProfileContent extends GetView<ProfileController> {
  const ProfileContent({super.key});

  @override
  Widget build(BuildContext context) {
    // Check if user is guest
    final auth = Get.find<AuthService>();

    return PageRegion(
      child: Obx(() {
        // Show guest view if user is not logged in
        if (auth.isGuest.value || auth.user.value.id == null) {
          return const GuestProfileView();
        }

        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          body: Column(
            children: [
              // Header section with profile info
              Container(
                decoration: BoxDecoration(
                  color: AppColors.medinaGreen40,
                ),
                child: SafeArea(
                  bottom: false,
                  child: Column(
                    children: [
                      // iOS back button row (only shown when Navigator can pop)
                      if (GetPlatform.isIOS)
                        Builder(
                          builder: (ctx) {
                            final canPop = Navigator.of(ctx).canPop();
                            if (!canPop) return const SizedBox.shrink();
                            return Padding(
                              padding: EdgeInsets.symmetric(
                                horizontal: 16.w,
                                vertical: 0.h,
                              ),
                              child: Row(
                                children: [
                                  IconButton(
                                    padding: EdgeInsets.all(8.w),
                                    icon: Icon(
                                      Icons.arrow_back_ios,
                                      color: Colors
                                          .white, // Yeşil üzerinde her zaman beyaz
                                      size: 22.sp,
                                    ),
                                    onPressed: () =>
                                        Navigator.of(ctx).maybePop(),
                                    tooltip: 'Geri',
                                  ),
                                  const Spacer(),
                                ],
                              ),
                            );
                          },
                        ),
                      // Profile header
                      Padding(
                        padding: EdgeInsets.fromLTRB(20.w, 0, 20.w, 20.h),
                        child: const ProfileHeader(),
                      ),
                    ],
                  ),
                ),
              ),

              // Content sections
              Expanded(
                child: DefaultTabController(
                  length: 5,
                  child: Column(
                    children: [
                      _ProfilePillTabs(),
                      Expanded(
                        child: TabBarView(
                          children: [
                            ReservationsTab(),
                            ReviewsTab(),
                            // Favoriler alt menüye taşındı; burada Seyahatlerim gösteriliyor
                            TravelsContent(),
                            ApplicationsTab(),
                            SettingsTab(),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _ProfilePillTabs extends StatefulWidget {
  const _ProfilePillTabs();
  @override
  State<_ProfilePillTabs> createState() => _ProfilePillTabsState();
}

class _ProfilePillTabsState extends State<_ProfilePillTabs> {
  late TabController _controller;
  final ScrollController _scrollCtrl = ScrollController();
  final GlobalKey _scrollKey = GlobalKey();
  late final List<GlobalKey> _itemKeys;

  final _items = const [
    _ProfilePillItem('Rezervasyonlar', Icons.book_online_outlined),
    _ProfilePillItem('Yorumlar', Icons.rate_review_outlined),
    _ProfilePillItem('Seyahatlerim', Icons.card_travel_outlined),
    _ProfilePillItem('Başvurular', Icons.assignment_outlined),
    _ProfilePillItem('Ayarlar', Icons.settings_outlined),
  ];

  @override
  void initState() {
    super.initState();
    _itemKeys = List.generate(_items.length, (_) => GlobalKey());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller = DefaultTabController.of(context);
    _controller.addListener(_onChanged);
  }

  void _onChanged() {
    if (!mounted) return;
    setState(() {});
    _scrollTo(_controller.index);
  }

  @override
  void dispose() {
    _controller.removeListener(_onChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Tab bar arka planı HER ZAMAN yeşil - karanlık modda koyu yeşil, açık modda normal yeşil
    final tabBgColor = AppColors.medinaGreen40;
    final primary = Colors.green.shade700;
    return Container(
      color: tabBgColor,
      padding: EdgeInsets.fromLTRB(0.w, 8.h, 0.w, 8.h),
      child: SingleChildScrollView(
        key: _scrollKey,
        controller: _scrollCtrl,
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(horizontal: 10.w),
        child: Row(
          children: [
            for (int i = 0; i < _items.length; i++)
              _buildPill(i, primary, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildPill(int index, Color primary, bool isDark) {
    final item = _items[index];
    final selected = _controller.index == index;
    // Yeşil arka plan üzerinde tab'lar
    // Aktif tab: beyaz arka plan + yeşil içerik (her iki modda)
    // Pasif tab: beyaz transparan + beyaz içerik (her iki modda - yeşil üzerinde)
    const bgSel = Colors.white;
    final bgUnSel = Colors.white.withValues(alpha: .15);
    return Container(
      key: _itemKeys[index],
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        margin: EdgeInsets.symmetric(horizontal: 4.w),
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: selected ? bgSel : bgUnSel,
          borderRadius: BorderRadius.circular(26.r),
          border: Border.all(
            color: selected
                ? Colors.white
                : Colors.white.withValues(alpha: .25),
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
                size: 18.sp,
                color: selected
                    ? primary
                    : Colors.white, // Yeşil üzerinde beyaz
              ),
              SizedBox(width: 6.w),
              Text(
                item.label,
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected
                      ? primary
                      : Colors.white, // Yeşil üzerinde beyaz
                  letterSpacing: .15,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _onTapPill(int index) {
    _controller.animateTo(index);
    _scrollTo(index);
  }

  void _scrollTo(int index) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollCtrl.hasClients) return;
      final keyCtx = _itemKeys[index].currentContext;
      final scrollCtx = _scrollKey.currentContext;
      if (keyCtx == null || scrollCtx == null) return;

      final itemBox = keyCtx.findRenderObject() as RenderBox?;
      final scrollBox = scrollCtx.findRenderObject() as RenderBox?;
      if (itemBox == null || scrollBox == null) return;

      final itemGlobal = itemBox.localToGlobal(Offset.zero);
      final scrollGlobal = scrollBox.localToGlobal(Offset.zero);
      final delta = itemGlobal.dx - scrollGlobal.dx;

      final target = (_scrollCtrl.offset + delta - 10.w).clamp(
        0.0,
        _scrollCtrl.position.maxScrollExtent,
      );
      _scrollCtrl.animateTo(
        target.toDouble(),
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }
}

class _ProfilePillItem {
  final String label;
  final IconData icon;
  const _ProfilePillItem(this.label, this.icon);
}
