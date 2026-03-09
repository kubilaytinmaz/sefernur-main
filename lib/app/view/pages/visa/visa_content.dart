import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/visa/visa_controller.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../routes/routes.dart';
import '../../themes/theme.dart';
import 'widgets/help_tab.dart';
import 'widgets/step_indicator.dart';
import 'widgets/steps_documents.dart';
import 'widgets/steps_payment.dart';
import 'widgets/steps_personal.dart';
import 'widgets/steps_travel.dart';
import 'widgets/tracking_tab.dart';

class VisaContent extends GetView<VisaController> {
  const VisaContent({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Get.find<AuthService>();
    
    return Obx(() {
      // Show guest view if user is not logged in
      if (auth.isGuest.value || auth.user.value.id == null) {
        return const _GuestVisaView();
      }
      
      final theme = Theme.of(context);
      
      return Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        floatingActionButton: auth.isUserAdmin()
            ? Obx(
                () => FloatingActionButton(
                  onPressed: () => controller.isAdmin.toggle(),
                  backgroundColor: controller.isAdmin.value
                      ? Colors.red
                      : AppColors.medinaGreen40,
                  tooltip: 'Admin Modu',
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Icon(
                    controller.isAdmin.value
                        ? Icons.lock_open
                        : Icons.admin_panel_settings,
                    color: Colors.white,
                  ),
                ),
              )
            : null,
        body: DefaultTabController(
          length: 3,
          child: NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) => [
              SliverAppBar(
                expandedHeight: 140.h,
                collapsedHeight: 5.h,
                toolbarHeight: 0,
                floating: false,
                pinned: true,
                snap: false,
                backgroundColor: AppColors.medinaGreen40,
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppColors.medinaGreen40,
                          AppColors.medinaGreen40.withOpacity(0.9),
                        ],
                      ),
                    ),
                    child: SafeArea(
          bottom: false,
                      child: Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            Text('Vize İşlemleri', style: TextStyle(color: Colors.white, fontSize: 22.sp, fontWeight: FontWeight.bold)),
                            SizedBox(height: 4.h),
                            Text('Umre, hac ve ziyaret vizeleriniz için güvenli başvuru', style: TextStyle(color: Colors.white70, fontSize: 14.sp)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                bottom: PreferredSize(
                  preferredSize: Size.fromHeight(50.h),
                  child: const _VisaPillTabs(),
                ),
              ),
            ],
            body: TabBarView(
              children: [
                _ApplicationTab(),
                const VisaTrackingTab(),
                const VisaHelpTab(),
              ],
            ),
          ),
        ),
      );
    });
  }
}

/// Guest view for visa application - prompts user to sign in
class _GuestVisaView extends StatelessWidget {
  const _GuestVisaView();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
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
                colors: [
                  AppColors.medinaGreen40,
                  AppColors.medinaGreen40.withOpacity(.9),
                ],
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
                          Icons.assignment_outlined,
                          color: Colors.white.withOpacity(.95),
                          size: 22.sp,
                        ),
                        SizedBox(width: 10.w),
                        Expanded(
                          child: Text(
                            'Vize Başvurusu',
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
                      boxShadow: isDark ? null : [
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
                            color: AppColors.primary.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.flight_takeoff,
                            size: 50.sp,
                            color: AppColors.primary,
                          ),
                        ),
                        SizedBox(height: 20.h),
                        Text(
                          'Vize Başvurunuzu\nKolayca Yapın',
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
                          'Vize başvurusu yapmak için hesabınıza giriş yapın. Başvurunuzun durumunu takip edebilir ve gerekli belgeleri yükleyebilirsiniz.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                            height: 1.5,
                          ),
                        ),
                        SizedBox(height: 24.h),
                        
                        // Features
                        _buildFeatureItem(
                          icon: Icons.description,
                          title: 'Kolay Başvuru',
                          subtitle: 'Adım adım başvuru formu',
                        ),
                        _buildFeatureItem(
                          icon: Icons.cloud_upload,
                          title: 'Belge Yükleme',
                          subtitle: 'Güvenli belge yönetimi',
                        ),
                        _buildFeatureItem(
                          icon: Icons.track_changes,
                          title: 'Durum Takibi',
                          subtitle: 'Başvurunuzu anlık takip edin',
                        ),
                        
                        SizedBox(height: 28.h),
                        
                        // Sign in button
                        SizedBox(
                          width: double.infinity,
                          height: 52.h,
                          child: ElevatedButton(
                            onPressed: () => Get.toNamed(Routes.AUTH),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
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

  Widget _buildFeatureItem({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
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
                        color: theme.colorScheme.onSurface,
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
      },
    );
  }
}

class _ApplicationTab extends GetView<VisaController> {
  @override
  Widget build(BuildContext context) => Obx(() => controller.showApplicationForm.value
    ? SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _FormCard(),
          ],
        ),
      )
    : SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _CompactInformationSection(),
            SizedBox(height: 20.h),
            _StartApplicationButton(),
          ],
        ),
      ),
  );
}

/// Compact information section with smaller text
class _CompactInformationSection extends StatelessWidget {
  const _CompactInformationSection();
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark 
            ? [AppColors.medinaGreen40.withOpacity(0.3), AppColors.medinaGreen40.withOpacity(0.15)]
            : [AppColors.medinaGreen40.withOpacity(0.1), AppColors.medinaGreen40.withOpacity(0.05)],
        ),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.medinaGreen40.withOpacity(0.3), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.info_outline, color: AppColors.medinaGreen40, size: 20.sp),
            SizedBox(width: 8.w),
            Text('Vize Başvuru Rehberi', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: AppColors.medinaGreen40)),
          ]),
          SizedBox(height: 10.h),
          Text(
            'Umre, hac veya manevi ziyaretler için vize başvuru sürecini kolaylaştırıyoruz.',
            style: TextStyle(fontSize: 13.sp, color: isDark ? Colors.grey[400] : Colors.grey[700], height: 1.4),
          ),
          SizedBox(height: 12.h),
          Container(
            padding: EdgeInsets.all(10.w),
            decoration: BoxDecoration(color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white, borderRadius: BorderRadius.circular(8.r)),
            child: Column(children: [
              _CompactInfoItem(icon: Icons.schedule, title: 'İşlem Süresi', subtitle: '5-15 iş günü'),
              Divider(height: 12.h),
              _CompactInfoItem(icon: Icons.document_scanner, title: 'Gerekli Belgeler', subtitle: 'Pasaport, Fotoğraf, Kimlik'),
              Divider(height: 12.h),
              _CompactInfoItem(icon: Icons.support_agent, title: 'Destek', subtitle: '7/24 müşteri hizmeti'),
            ]),
          ),
        ],
      ),
    );
  }
}

class _CompactInfoItem extends StatelessWidget {
  final IconData icon; final String title; final String subtitle;
  const _CompactInfoItem({required this.icon, required this.title, required this.subtitle});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Row(children: [
      Icon(icon, color: AppColors.medinaGreen40, size: 18.sp),
      SizedBox(width: 10.w),
      Expanded(child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[300] : null)),
          Text(subtitle, style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
        ],
      )),
    ]);
  }
}

class _StartApplicationButton extends GetView<VisaController> {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52.h,
      child: ElevatedButton.icon(
        onPressed: () {
          controller.showApplicationForm.value = true;
          controller.currentStep.value = 0;
        },
        icon: Icon(Icons.assignment_add, size: 22.sp),
        label: Text(
          'Vize Başvurusu Yap',
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.medinaGreen40,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
          elevation: 2,
        ),
      ),
    );
  }
}

class _FormCard extends GetView<VisaController> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
    padding: EdgeInsets.all(16.w),
    decoration: BoxDecoration(
      color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
      borderRadius: BorderRadius.circular(16.r),
    ),
    child: Column(
      children: [
        // Header with back button
        Row(
          children: [
            Obx(() => controller.currentStep.value == 0
              ? IconButton(
                  onPressed: () => controller.showApplicationForm.value = false,
                  icon: Icon(Icons.arrow_back_ios, size: 18.sp, color: isDark ? Colors.grey[400] : Colors.grey[700]),
                  tooltip: 'Geri',
                )
              : const SizedBox.shrink(),
            ),
            Expanded(
              child: Text(
                'Vize Başvuru Formu',
                style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface),
                textAlign: TextAlign.center,
              ),
            ),
            SizedBox(width: 40.w), // Balance for back button
          ],
        ),
        SizedBox(height: 12.h),
        Padding(
          padding: EdgeInsets.all(0.w),
          child: const VisaStepIndicator(),
        ),
        SizedBox(height: 16.h),
        Padding(
          padding: EdgeInsets.all(0.w),
          child: Obx(() {
            switch (controller.currentStep.value) {
              case 0:
                return const VisaPersonalStep();
              case 1:
                return const VisaTravelStep();
              case 2:
                return const VisaDocumentsStep();
              case 3:
                return const VisaPaymentStep();
              default:
                return const SizedBox.shrink();
            }
          }),
        ),
        SizedBox(height: 24.h),
        Container(
          padding: EdgeInsets.all(0.w),
          child: Obx(
            () => Row(
              children: [
                if (controller.currentStep.value > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: controller.previousStep,
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                      child: const Text('Geri'),
                    ),
                  ),
                if (controller.currentStep.value > 0) SizedBox(width: 16.w),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      if (controller.validateCurrentStep()) {
                        if (controller.currentStep.value == 3) {
                          controller.submitApplication();
                        } else {
                          controller.nextStep();
                        }
                      } else {
                        Get.snackbar(
                          'Hata',
                          'Lütfen tüm gerekli alanları doldurun',
                          snackPosition: SnackPosition.BOTTOM,
                          backgroundColor: Colors.red,
                          colorText: Colors.white,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.medinaGreen40,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 16.h),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                    ),
                    child: Obx(
                      () => controller.isLoading.value
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            )
                          : Text(
                              controller.currentStep.value == 3
                                  ? 'Başvuruyu Gönder'
                                  : 'İleri',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
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
}

// Legacy helper widgets & methods have been extracted into dedicated files under widgets/.
// This file now only wires them together in the main tab structure.

class _VisaPillTabs extends StatefulWidget {
  const _VisaPillTabs();
  @override
  State<_VisaPillTabs> createState() => _VisaPillTabsState();
}

class _VisaPillTabsState extends State<_VisaPillTabs> {
  late TabController _controller;

  final _items = const [
    _VisaPillItem('Yeni Başvuru', Icons.assignment_outlined),
    _VisaPillItem('Başvuru Takip', Icons.location_searching),
    _VisaPillItem('Yardım', Icons.help_outline),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller = DefaultTabController.of(context);
    _controller.addListener(_onChanged);
  }

  void _onChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_onChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const primary = AppColors.medinaGreen40;
    return Container(
      color: primary,
      padding: EdgeInsets.fromLTRB(0.w, 8.h, 0.w, 8.h),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: 10.w),
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: [
            for (int i = 0; i < _items.length; i++) _buildPill(i, primary),
          ],
        ),
      ),
    );
  }

  Widget _buildPill(int index, Color primary) {
    final item = _items[index];
    final selected = _controller.index == index;
    const bgSel = Colors.white;
    final bgUnSel = Colors.white.withOpacity(.12);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      margin: EdgeInsets.symmetric(horizontal: 4.w),
      padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
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
      child: InkWell(
        borderRadius: BorderRadius.circular(26.r),
        onTap: () => _controller.animateTo(index),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              item.icon,
              size: 18.sp,
              color: selected ? primary : Colors.white,
            ),
            SizedBox(width: 6.w),
            Text(
              item.label,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? primary : Colors.white,
                letterSpacing: .15,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VisaPillItem {
  final String label;
  final IconData icon;
  const _VisaPillItem(this.label, this.icon);
}
