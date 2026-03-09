import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:sefernur/app/view/themes/colors/app_colors.dart';
import 'package:share_plus/share_plus.dart';

import '../../../controllers/referrals/referrals_controller.dart';
import '../../../data/models/referral/referral_models.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/referral/referral_service.dart';
import '../../../routes/routes.dart';

class ReferralsContent extends GetView<ReferralsController> {
  const ReferralsContent({super.key});
  ReferralService get service => Get.find<ReferralService>();

  @override
  Widget build(BuildContext context) {
    final auth = Get.find<AuthService>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    // Show guest view if user is not logged in
    return Obx(() {
      if (auth.isGuest.value || auth.user.value.id == null) {
        return _GuestReferralsView(isDark: isDark);
      }
      
      return DefaultTabController(
        length: 2,
        child: Scaffold(
          backgroundColor: theme.scaffoldBackgroundColor,
          floatingActionButton: _buildAdminFab(),
          body: NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) => [
              _ReferralSliverAppBar(isDark: isDark),
            ],
            body: TabBarView(
              children: [
                _EarningsTab(service: service),
                _WithdrawalsTab(service: service),
              ],
            ),
          ),
        ),
      );
    });
  }

  Widget? _buildAdminFab() {
    final auth = Get.find<AuthService>();
    if (auth.isGuest.value || !auth.isUserAdmin()) return null;
    return FloatingActionButton.extended(
      backgroundColor: AppColors.primary,
      onPressed: _openAdminPanel,
      icon: const Icon(
        Icons.admin_panel_settings,
        color: Colors.white,
      ),
      label: const Text(
        'Admin',
        style: TextStyle(color: Colors.white),
      ),
    );
  }

  void _openAdminPanel() {
    showModalBottomSheet(
      context: Get.context!,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (_) => const _AdminPanel(),
    );
  }
}

/// SliverAppBar for referrals - collapses on scroll
class _ReferralSliverAppBar extends StatelessWidget {
  final bool isDark;
  const _ReferralSliverAppBar({required this.isDark});

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.find<ReferralsController>();
    final service = Get.find<ReferralService>();
    
    return SliverAppBar(
      expandedHeight: 230.h,
      collapsedHeight: 10.h,
      toolbarHeight: 5.h,
      pinned: true,
      floating: false,
      automaticallyImplyLeading: false,
      backgroundColor: AppColors.medinaGreen40,
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.pin,
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [AppColors.medinaGreen40, AppColors.medinaGreen40.withOpacity(.9)],
            ),
          ),
          child: SafeArea(
          bottom: false,
            child: Padding(
              padding: EdgeInsets.fromLTRB(16.w, 18.h, 16.w, 60.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.group_add_outlined,
                        color: Colors.white.withOpacity(.95),
                        size: 22.sp,
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: Text(
                          'Referans Programı',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22.sp,
                            fontWeight: FontWeight.w700,
                            letterSpacing: .2,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () async {
                          final code = ctrl.referralCode.value;
                          final link = await service.generateShareLink(code: code);
                          Share.share('Sefernur katıl! Kod: $code\n$link');
                        },
                        icon: const Icon(Icons.share, color: Colors.white),
                      ),
                    ],
                  ),
                  SizedBox(height: 4.h),
                  Obx(
                    () => Row(
                      children: [
                        Text(
                          'Kod: ',
                          style: TextStyle(color: Colors.white70, fontSize: 12.sp),
                        ),
                        SelectableText(
                          ctrl.referralCode.value.isEmpty
                              ? '—'
                              : ctrl.referralCode.value,
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 14.sp,
                          ),
                        ),
                        IconButton(
                          onPressed: ctrl.copyReferralCode,
                          icon: const Icon(
                            Icons.copy_rounded,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 14.h),
                  _BalanceSummary(service: service, controller: ctrl),
                ],
              ),
            ),
          ),
        ),
      ),
      bottom: PreferredSize(
        preferredSize: Size.fromHeight(50.h),
        child: Container(
          color: AppColors.medinaGreen40,
          child: const _ReferralPillTabs(),
        ),
      ),
    );
  }
}

/// Guest view for referrals - prompts user to sign in
class _GuestReferralsView extends StatelessWidget {
  final bool isDark;
  
  const _GuestReferralsView({required this.isDark});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [AppColors.medinaGreen40, AppColors.medinaGreen40.withOpacity(.9)],
              ),
            ),
            child: SafeArea(
          bottom: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(16.w, 18.h, 16.w, 30.h),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.group_add_outlined,
                          color: Colors.white.withOpacity(.95),
                          size: 22.sp,
                        ),
                        SizedBox(width: 10.w),
                        Expanded(
                          child: Text(
                            'Referans Programı',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22.sp,
                              fontWeight: FontWeight.w700,
                              letterSpacing: .2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(24.w),
              child: Column(
                children: [
                  SizedBox(height: 20.h),
                  
                  // Info card
                  Container(
                    padding: EdgeInsets.all(24.w),
                    decoration: BoxDecoration(
                      color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
                      borderRadius: BorderRadius.circular(16.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: EdgeInsets.all(20.w),
                          decoration: BoxDecoration(
                            color: AppColors.medinaGreen40.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.monetization_on_outlined,
                            size: 50.sp,
                            color: AppColors.medinaGreen40,
                          ),
                        ),
                        SizedBox(height: 20.h),
                        Text(
                          'Arkadaşlarınızı Davet Edin,\nKazanın!',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 22.sp,
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.onSurface,
                            height: 1.3,
                          ),
                        ),
                        SizedBox(height: 12.h),
                        Text(
                          'Referans programımıza katılarak arkadaşlarınızı davet edin ve her başarılı rezervasyondan kazanç elde edin.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                            height: 1.5,
                          ),
                        ),
                        SizedBox(height: 24.h),
                        
                        // Benefits
                        _buildBenefitItem(
                          icon: Icons.share,
                          title: 'Paylaşın',
                          subtitle: 'Kendi referans kodunuzu paylaşın',
                          isDark: isDark,
                        ),
                        _buildBenefitItem(
                          icon: Icons.people,
                          title: 'Davet Edin',
                          subtitle: 'Arkadaşlarınız kodunuzla kayıt olsun',
                          isDark: isDark,
                        ),
                        _buildBenefitItem(
                          icon: Icons.attach_money,
                          title: 'Kazanın',
                          subtitle: 'Her rezervasyondan komisyon alın',
                          isDark: isDark,
                        ),
                        
                        SizedBox(height: 28.h),
                        
                        // Sign in button
                        SizedBox(
                          width: double.infinity,
                          height: 52.h,
                          child: ElevatedButton(
                            onPressed: () => Get.toNamed(Routes.AUTH),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.medinaGreen40,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.r),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              'Giriş Yap / Kayıt Ol',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
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
  }

  Widget _buildBenefitItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isDark,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 10.h),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(10.w),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10.r),
            ),
            child: Icon(
              icon,
              size: 22.sp,
              color: AppColors.primary,
            ),
          ),
          SizedBox(width: 14.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BalanceSummary extends StatelessWidget {
  final ReferralService service;
  final ReferralsController controller;
  const _BalanceSummary({required this.service, required this.controller});
  @override
  Widget build(BuildContext context) => Obx(() {
    final total = service.totalEarnings;
    final available = service.availableBalance;
    final pending = service.pendingEarnings;
    return Row(
      children: [
        Expanded(
          child: _MetricCard(label: 'Toplam', value: total.toStringAsFixed(2)),
        ),
        SizedBox(width: 10.w),
        Expanded(
          child: _MetricCard(
            label: 'Bekleyen',
            value: pending.toStringAsFixed(2),
            color: Colors.orange,
          ),
        ),
        SizedBox(width: 10.w),
        Expanded(
          child: GestureDetector(
            onTap: controller.requestWithdrawal,
            child: _MetricCard(
              label: 'Çekilebilir',
              value: available.toStringAsFixed(2),
              color: Colors.green,
            ),
          ),
        ),
      ],
    );
  });
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  const _MetricCard({required this.label, required this.value, this.color});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = color ?? theme.primaryColor;
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(color: c.withOpacity(.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 11.sp, color: Colors.grey[600]),
          ),
          SizedBox(height: 4.h),
          Text(
            value,
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.bold,
              color: c,
            ),
          ),
        ],
      ),
    );
  }
}

class _EarningsTab extends StatelessWidget {
  final ReferralService service;
  const _EarningsTab({required this.service});
  Color _statusColor(ReferralEarningStatus s) {
    switch (s) {
      case ReferralEarningStatus.approved:
        return Colors.green.shade600;
      case ReferralEarningStatus.pending:
        return Colors.orange.shade700;
      case ReferralEarningStatus.rejected:
        return Colors.red.shade500;
    }
  }

  @override
  Widget build(BuildContext context) => Obx(
    () => service.earnings.isEmpty
        ? _EmptyPlaceholder(
            icon: Icons.savings_outlined,
            title: 'Henüz kazanç yok',
            lines: const [
              'Referans kodunu arkadaşlarınla paylaş.',
              'Onlar kayıt olup ilk işlemlerini tamamlayınca ödül kazan.',
              'İlk ödül: aktif kampanya signup bonusu.',
            ],
            actionLabel: 'Kodu Paylaş',
            onAction: () async {
              final code = Get.find<ReferralsController>().referralCode.value;
              final link = await service.generateShareLink(code: code);
              Share.share('Sefernur katıl! Kod: $code\n$link');
            },
          )
        : ListView.separated(
            padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 80.h),
            itemBuilder: (c, i) {
              final theme = Theme.of(c);
              final isDark = theme.brightness == Brightness.dark;
              final e = service.earnings[i];
              return Container(
                padding: EdgeInsets.all(12.w),
                decoration: BoxDecoration(
                  color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: isDark ? theme.colorScheme.outline : Colors.grey[200]!),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: Theme.of(
                        context,
                      ).primaryColor.withOpacity(.1),
                      child: Icon(
                        e.type == ReferralEarningType.signup
                            ? Icons.person_add
                            : Icons.card_giftcard,
                        color: Theme.of(context).primaryColor,
                        size: 18,
                      ),
                    ),
                    SizedBox(width: 12.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            e.type.name.toUpperCase(),
                            style: TextStyle(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            e.status.name,
                            style: TextStyle(
                              fontSize: 11.sp,
                              color: _statusColor(e.status),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '+${e.amount.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
                      ),
                    ),
                  ],
                ),
              );
            },
            separatorBuilder: (_, __) => SizedBox(height: 10.h),
            itemCount: service.earnings.length,
          ),
  );
}

class _WithdrawalsTab extends StatelessWidget {
  final ReferralService service;
  const _WithdrawalsTab({required this.service});
  Color _statusColor(ReferralEarningStatus s) {
    switch (s) {
      case ReferralEarningStatus.approved:
        return Colors.green.shade600;
      case ReferralEarningStatus.pending:
        return Colors.orange.shade700;
      case ReferralEarningStatus.rejected:
        return Colors.red.shade500;
    }
  }

  String _mask(String iban) {
    if (iban.length < 10) return iban;
    return '${iban.substring(0, 6)}***${iban.substring(iban.length - 4)}';
  }

  @override
  Widget build(BuildContext context) => Obx(
    () => service.userWithdrawals.isEmpty
        ? _EmptyPlaceholder(
            icon: Icons.payments_outlined,
            title: 'Çekim talebin yok',
            lines: const [
              'Önce onaylanmış kazanç biriktir.',
              'Minimum tutarı geçince bakiyene dokunup çekim iste.',
              'Talep durumunu burada göreceksin.',
            ],
            actionLabel: 'Gelir Elde Et',
            onAction: () => DefaultTabController.of(context).animateTo(0),
          )
        : RefreshIndicator(
            onRefresh: () async {
              if (service.currentUserId != null)
                await service.loadUserWithdrawals(service.currentUserId!);
            },
            child: ListView.separated(
              padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 80.h),
              itemBuilder: (c, i) {
                final theme = Theme.of(c);
                final isDark = theme.brightness == Brightness.dark;
                final w = service.userWithdrawals[i];
                return Container(
                  padding: EdgeInsets.all(12.w),
                  decoration: BoxDecoration(
                    color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
                    borderRadius: BorderRadius.circular(12.r),
                    border: Border.all(color: isDark ? theme.colorScheme.outline : Colors.grey[200]!),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.payments_outlined,
                        color: Theme.of(context).primaryColor,
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${w.amount.toStringAsFixed(2)} USD',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14.sp,
                              ),
                            ),
                            SizedBox(height: 4.h),
                            Text(
                              _mask(w.ibanOrAccount),
                              style: TextStyle(
                                fontSize: 11.sp,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        w.status.name,
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: _statusColor(w.status),
                        ),
                      ),
                    ],
                  ),
                );
              },
              separatorBuilder: (_, __) => SizedBox(height: 10.h),
              itemCount: service.userWithdrawals.length,
            ),
          ),
  );
}

// ---------------- Admin Panel ----------------
class _AdminPanel extends StatefulWidget {
  const _AdminPanel();
  @override
  State<_AdminPanel> createState() => _AdminPanelState();
}

class _AdminPanelState extends State<_AdminPanel> {
  final ReferralService _service = Get.find<ReferralService>();
  int _tab = 0; // 0=configs 1=earnings 2=withdrawals
  ReferralEarningStatus? _earnFilter; // null=all
  ReferralEarningStatus? _withFilter;
  String _statusText(ReferralEarningStatus s) {
    switch (s) {
      case ReferralEarningStatus.pending:
        return 'Bekleyen';
      case ReferralEarningStatus.approved:
        return 'Onaylı';
      case ReferralEarningStatus.rejected:
        return 'Reddedildi';
    }
  }

  @override
  void initState() {
    super.initState();
    _service.loadAllConfigs();
    _service.loadAdminEarnings();
    _service.loadWithdrawals();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;
    final cardColor = isDark ? const Color(0xFF2D2D2D) : Colors.white;
    final handleColor = isDark ? Colors.grey.shade600 : Colors.grey.shade300;
    
    return DraggableScrollableSheet(
      expand: false,
      maxChildSize: .9,
      builder: (c, scroll) => Container(
        padding: EdgeInsets.fromLTRB(16.w, 8.h, 16.w, 16.h),
        decoration: BoxDecoration(
          color: surfaceColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              width: 44,
              height: 4,
              margin: EdgeInsets.only(bottom: 12.h),
              decoration: BoxDecoration(
                color: handleColor,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            Row(
              children: [
                Icon(Icons.admin_panel_settings, color: textColor),
                SizedBox(width: 8.w),
                Text(
                  'Admin Panel',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
              ],
            ),
            SizedBox(height: 10.h),
            _buildTabs(context, isDark),
            SizedBox(height: 12.h),
            Expanded(child: _buildTabBody(scroll, isDark, cardColor, textColor, subtitleColor)),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs(BuildContext context, bool isDark) {
    final labels = ['Konfig', 'Ödüller', 'Çekimler'];
    final unselectedBg = isDark ? const Color(0xFF2D2D2D) : Colors.grey[200];
    final unselectedText = isDark ? Colors.grey.shade300 : Colors.black87;
    return Row(
      children: List.generate(labels.length, (i) {
        final sel = i == _tab;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _tab = i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: EdgeInsets.symmetric(vertical: 10.h),
              margin: EdgeInsets.only(right: i < labels.length - 1 ? 6.w : 0),
              decoration: BoxDecoration(
                color: sel ? AppColors.medinaGreen40 : unselectedBg,
                borderRadius: BorderRadius.circular(10.r),
              ),
              alignment: Alignment.center,
              child: Text(
                labels[i],
                style: TextStyle(
                  color: sel ? Colors.white : unselectedText,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _buildTabBody(ScrollController scroll, bool isDark, Color cardColor, Color textColor, Color subtitleColor) {
    switch (_tab) {
      case 0:
        return _buildConfigs(scroll, isDark, cardColor, textColor, subtitleColor);
      case 1:
        return _buildEarnings(isDark, cardColor, textColor, subtitleColor);
      case 2:
        return _buildWithdrawals(isDark, cardColor, textColor, subtitleColor);
    }
    return const SizedBox();
  }

  Widget _buildConfigs(ScrollController scroll, bool isDark, Color cardColor, Color textColor, Color subtitleColor) {
    return Column(
      children: [
        Row(
          children: [
            ElevatedButton.icon(
              onPressed: _openCreateConfig,
              icon: const Icon(Icons.add),
              label: const Text('Yeni Konfig'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.medinaGreen40,
                foregroundColor: Colors.white,
              ),
            ),
            SizedBox(width: 8.w),
            IconButton(
              onPressed: () => _service.loadAllConfigs(),
              icon: Icon(Icons.refresh, color: subtitleColor),
            ),
          ],
        ),
        SizedBox(height: 8.h),
        Expanded(
          child: Obx(
            () => ListView.builder(
              controller: scroll,
              itemCount: _service.allConfigs.length,
              itemBuilder: (c, i) {
                final cfg = _service.allConfigs[i];
                return Card(
                  color: cardColor,
                  child: ListTile(
                    title: Text(cfg.name, style: TextStyle(color: textColor)),
                    subtitle: Text(
                      'Signup ${cfg.signupReward} • Book% ${cfg.bookingRewardPercent} • Fix ${cfg.bookingRewardFixed}',
                      style: TextStyle(color: subtitleColor),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Switch(
                          value: cfg.active,
                          activeThumbColor: AppColors.medinaGreen40,
                          onChanged: (v) =>
                              _service.adminToggleActive(cfg.id!, v),
                        ),
                        IconButton(
                          icon: Icon(Icons.edit, color: subtitleColor),
                          onPressed: () => _openEditConfig(cfg),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEarnings(bool isDark, Color cardColor, Color textColor, Color subtitleColor) {
    return Column(
      children: [
        _statusFilters((s) {
          setState(() => _earnFilter = s);
        }, isDark),
        Expanded(
          child: Obx(() {
            final list = _service.adminEarnings
                .where((e) => _earnFilter == null || e.status == _earnFilter)
                .toList();
            if (list.isEmpty) return Center(child: Text('Kayıt yok', style: TextStyle(color: subtitleColor)));
            return ListView.separated(
              itemCount: list.length,
              separatorBuilder: (_, __) => SizedBox(height: 6.h),
              itemBuilder: (c, i) {
                final e = list[i];
                return Card(
                  color: cardColor,
                  child: ListTile(
                    leading: Icon(
                      Icons.monetization_on_outlined,
                      color: AppColors.medinaGreen40,
                    ),
                    title: Text(
                      '${e.type.name} +${e.amount.toStringAsFixed(2)}',
                      style: TextStyle(color: textColor),
                    ),
                    subtitle: Text(
                      '${e.referralId.substring(0, 6)}... • ${_statusText(e.status)}',
                      style: TextStyle(color: subtitleColor),
                    ),
                    trailing: PopupMenuButton<String>(
                      onSelected: (v) {
                        if (v == 'approve')
                          _service.adminSetEarningStatus(
                            e.id!,
                            ReferralEarningStatus.approved,
                          );
                        else if (v == 'reject')
                          _service.adminSetEarningStatus(
                            e.id!,
                            ReferralEarningStatus.rejected,
                          );
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'approve', child: Text('Onayla')),
                        PopupMenuItem(value: 'reject', child: Text('Reddet')),
                      ],
                    ),
                  ),
                );
              },
            );
          }),
        ),
      ],
    );
  }

  Widget _buildWithdrawals(bool isDark, Color cardColor, Color textColor, Color subtitleColor) {
    return Column(
      children: [
        _statusFilters((s) {
          setState(() => _withFilter = s);
        }, isDark),
        Expanded(
          child: Obx(() {
            final list = _service.withdrawals
                .where((w) => _withFilter == null || w.status == _withFilter)
                .toList();
            if (list.isEmpty) return Center(child: Text('Talep yok', style: TextStyle(color: subtitleColor)));
            return ListView.separated(
              itemCount: list.length,
              separatorBuilder: (_, __) => SizedBox(height: 6.h),
              itemBuilder: (c, i) {
                final w = list[i];
                return Card(
                  color: cardColor,
                  child: ListTile(
                    leading: Icon(
                      Icons.payments,
                      color: AppColors.medinaGreen40,
                    ),
                    title: Obx(() {
                      return Text(
                        '${w.amount.toStringAsFixed(2)} USD • ${w.status.name}',
                        style: TextStyle(color: textColor),
                      );
                    }),
                    subtitle: Obx(() {
                      final u = _service.userCache[w.userId];
                      final email = u?.email ?? '';
                      final displayName = u?.fullName?.isNotEmpty == true
                          ? u!.fullName!
                          : (u?.firstName != null
                                ? '${u!.firstName} ${u.lastName ?? ''}'.trim()
                                : '');
                      final ibanMasked = w.ibanOrAccount.length > 10
                          ? '${w.ibanOrAccount.substring(0, 6)}***${w.ibanOrAccount.substring(w.ibanOrAccount.length - 4)}'
                          : w.ibanOrAccount;
                      return Text(
                        '${displayName.isNotEmpty ? displayName : 'Kullanıcı'}${email.isNotEmpty ? ' • $email' : ''} • $ibanMasked',
                        style: TextStyle(color: subtitleColor),
                      );
                    }),
                    trailing: PopupMenuButton<String>(
                      onSelected: (v) {
                        if (v == 'approve')
                          _service.adminSetWithdrawalStatus(
                            w.id!,
                            ReferralEarningStatus.approved,
                          );
                        else if (v == 'reject')
                          _service.adminSetWithdrawalStatus(
                            w.id!,
                            ReferralEarningStatus.rejected,
                          );
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'approve', child: Text('Onayla')),
                        PopupMenuItem(value: 'reject', child: Text('Reddet')),
                      ],
                    ),
                  ),
                );
              },
            );
          }),
        ),
      ],
    );
  }

  Widget _statusFilters(ValueChanged<ReferralEarningStatus?> onSel, bool isDark) {
    final opts = [
      null,
      ReferralEarningStatus.pending,
      ReferralEarningStatus.approved,
      ReferralEarningStatus.rejected,
    ];
    final unselectedBg = isDark ? const Color(0xFF2D2D2D) : Colors.grey[200];
    final unselectedText = isDark ? Colors.grey.shade300 : Colors.black87;
    return SizedBox(
      height: 36.h,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: opts.length,
        separatorBuilder: (_, __) => SizedBox(width: 6.w),
        padding: EdgeInsets.only(bottom: 4.h),
        itemBuilder: (c, i) {
          final sel = (_tab == 1 ? _earnFilter : _withFilter) == opts[i];
          final label = opts[i] == null ? 'Tümü' : _statusText(opts[i]!);
          return GestureDetector(
            onTap: () => onSel(opts[i]),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: sel ? AppColors.medinaGreen40 : unselectedBg,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(
                child: Text(
                  label,
                  style: TextStyle(
                    color: sel ? Colors.white : unselectedText,
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _openCreateConfig() => _openConfigDialog();
  void _openEditConfig(ReferralConfigModel cfg) => _openConfigDialog(edit: cfg);
  void _openConfigDialog({ReferralConfigModel? edit}) {
    final nameCtrl = TextEditingController(text: edit?.name ?? '');
    final signupCtrl = TextEditingController(
      text: (edit?.signupReward ?? 0).toString(),
    );
    final perCtrl = TextEditingController(
      text: (edit?.bookingRewardPercent ?? 0).toString(),
    );
    final fixCtrl = TextEditingController(
      text: (edit?.bookingRewardFixed ?? 0).toString(),
    );
    var active = edit?.active ?? true;
    showDialog(
      context: context,
      builder: (c) => StatefulBuilder(
        builder: (c, setSt) => AlertDialog(
          title: Text(edit == null ? 'Konfig Oluştur' : 'Konfig Düzenle'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Ad'),
                ),
                TextField(
                  controller: signupCtrl,
                  decoration: const InputDecoration(labelText: 'Signup Ödülü'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: perCtrl,
                  decoration: const InputDecoration(labelText: 'Booking %'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: fixCtrl,
                  decoration: const InputDecoration(labelText: 'Booking Sabit'),
                  keyboardType: TextInputType.number,
                ),
                Row(
                  children: [
                    const Text('Aktif'),
                    Switch(
                      value: active,
                      onChanged: (v) => setSt(() => active = v),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(c),
              child: const Text('İptal'),
            ),
            ElevatedButton(
              onPressed: () async {
                final name = nameCtrl.text.trim();
                final sr =
                    double.tryParse(signupCtrl.text.replaceAll(',', '.')) ?? 0;
                final bp =
                    double.tryParse(perCtrl.text.replaceAll(',', '.')) ?? 0;
                final bf =
                    double.tryParse(fixCtrl.text.replaceAll(',', '.')) ?? 0;
                if (edit == null) {
                  await _service.adminCreateConfig(
                    name: name,
                    signupReward: sr,
                    bookingRewardPercent: bp,
                    bookingRewardFixed: bf,
                    active: active,
                  );
                } else {
                  await _service.adminUpdateConfig(
                    ReferralConfigModel(
                      id: edit.id,
                      name: name,
                      active: active,
                      signupReward: sr,
                      bookingRewardPercent: bp,
                      bookingRewardFixed: bf,
                      startsAt: edit.startsAt,
                      endsAt: edit.endsAt,
                    ),
                  );
                }
                if (context.mounted) Navigator.pop(c);
              },
              child: const Text('Kaydet'),
            ),
          ],
        ),
      ),
    );
  }
}

// Pill style tabs similar to search content
class _ReferralPillTabs extends StatefulWidget {
  const _ReferralPillTabs();
  @override
  State<_ReferralPillTabs> createState() => _ReferralPillTabsState();
}

class _ReferralPillTabsState extends State<_ReferralPillTabs> {
  late TabController _controller;
  final _items = const [
    _PillTabItem('Kazançlar', Icons.savings_outlined),
    _PillTabItem('Çekimler', Icons.payments_outlined),
  ];
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller = DefaultTabController.of(context);
    _controller.addListener(_listener);
  }

  void _listener() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_listener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
      child: Row(
        children: [
          for (int i = 0; i < _items.length; i++) ...[
            Expanded(child: _buildPill(i)),
            if (i < _items.length - 1) SizedBox(width: 8.w),
          ],
        ],
      ),
    );
  }

  Widget _buildPill(int i) {
    final item = _items[i];
    final sel = _controller.index == i;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      decoration: BoxDecoration(
        color: sel ? Colors.white : Colors.white.withOpacity(.12),
        borderRadius: BorderRadius.circular(26.r),
        border: Border.all(
          color: sel ? Colors.white : Colors.white.withOpacity(.18),
          width: 1,
        ),
        boxShadow: sel
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(.15),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(26.r),
        onTap: () => _controller.animateTo(i),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(item.icon, size: 18.sp, color: sel ? AppColors.medinaGreen40 : Colors.white),
              SizedBox(width: 6.w),
              Text(
                item.label,
                style: TextStyle(
                  fontSize: 13.sp,
                  fontWeight: sel ? FontWeight.w700 : FontWeight.w500,
                  color: sel ? AppColors.medinaGreen40 : Colors.white,
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

class _PillTabItem {
  final String label;
  final IconData icon;
  const _PillTabItem(this.label, this.icon);
}

class _EmptyPlaceholder extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<String> lines;
  final String? actionLabel;
  final VoidCallback? onAction;
  const _EmptyPlaceholder({
    required this.icon,
    required this.title,
    required this.lines,
    this.actionLabel,
    this.onAction,
  });
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: EdgeInsets.fromLTRB(28.w, 48.h, 28.w, 120.h),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(24.w),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDark 
                  ? theme.colorScheme.surfaceContainerHigh 
                  : theme.primaryColor.withOpacity(.12),
            ),
            child: Icon(
              icon,
              size: 46.sp,
              color: isDark ? Colors.grey[400] : theme.primaryColor,
            ),
          ),
          SizedBox(height: 24.h),
          Text(
            title,
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 14.h),
          ...lines.map(
            (l) => Padding(
              padding: EdgeInsets.only(bottom: 8.h),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.arrow_right,
                    color: theme.primaryColor,
                    size: 18.sp,
                  ),
                  Expanded(
                    child: Text(
                      l,
                      style: TextStyle(
                        fontSize: 13.sp,
                        height: 1.3,
                        color: isDark ? Colors.grey[400] : Colors.grey[700],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (actionLabel != null) ...[
            SizedBox(height: 14.h),
            ElevatedButton.icon(
              onPressed: onAction,
              icon: const Icon(Icons.play_arrow),
              label: Text(actionLabel!),
            ),
          ],
        ],
      ),
    );
  }
}
