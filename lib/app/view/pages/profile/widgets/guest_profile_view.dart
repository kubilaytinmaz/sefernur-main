import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../routes/routes.dart';
import '../../../themes/theme.dart';

/// Widget shown to guest users in profile section
/// Prompts them to sign in or create an account
class GuestProfileView extends StatelessWidget {
  const GuestProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Column(
        children: [
          // Header with gradient
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: isDark 
                  ? [Colors.green.shade600, Colors.green.shade900]
                  : [Colors.green.shade600, Colors.green.shade400],
              ),
            ),
            child: SafeArea(
          bottom: false,
              child: Column(
                children: [
                  // iOS back button row (only shown when Navigator can pop)
                  if (GetPlatform.isIOS)
                    Builder(builder: (ctx) {
                      final canPop = Navigator.of(ctx).canPop();
                      if (!canPop) return const SizedBox.shrink();
                      return Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.w),
                        child: Row(
                          children: [
                            IconButton(
                              padding: EdgeInsets.all(8.w),
                              icon: Icon(
                                Icons.arrow_back_ios,
                                color: Colors.white,
                                size: 22.sp,
                              ),
                              onPressed: () => Navigator.of(ctx).maybePop(),
                              tooltip: 'Geri',
                            ),
                            const Spacer(),
                          ],
                        ),
                      );
                    }),
                  Padding(
                    padding: EdgeInsets.fromLTRB(20.w, 0, 20.w, 30.h),
                    child: Column(
                      children: [
                        // Guest avatar
                        CircleAvatar(
                          radius: 50.r,
                          backgroundColor: Colors.white.withOpacity(0.2),
                          child: Icon(
                            Icons.person_outline,
                            size: 50.sp,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 16.h),
                        Text(
                          'Misafir Kullanıcı',
                          style: TextStyle(
                            fontSize: 22.sp,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          'Henüz giriş yapmadınız',
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
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
                    padding: EdgeInsets.all(20.w),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(16.r),
                      boxShadow: [
                        BoxShadow(
                          color: isDark ? Colors.black26 : Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.account_circle_outlined,
                          size: 60.sp,
                          color: AppColors.primary.withOpacity(0.7),
                        ),
                        SizedBox(height: 16.h),
                        Text(
                          'Hesap Oluşturun',
                          style: TextStyle(
                            fontSize: 20.sp,
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        SizedBox(height: 12.h),
                        Text(
                          'Hesap oluşturarak veya giriş yaparak şu özelliklere erişebilirsiniz:',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: theme.colorScheme.onSurfaceVariant,
                            height: 1.4,
                          ),
                        ),
                        SizedBox(height: 20.h),
                        
                        // Feature list
                        _buildFeatureItem(Icons.favorite_outline, 'Favorilerinizi kaydedin'),
                        _buildFeatureItem(Icons.book_online_outlined, 'Rezervasyonlarınızı takip edin'),
                        _buildFeatureItem(Icons.group_add_outlined, 'Referans programından kazanın'),
                        _buildFeatureItem(Icons.history, 'Seyahat geçmişinizi görün'),
                        _buildFeatureItem(Icons.rate_review_outlined, 'Yorum yapın ve puan verin'),
                        
                        SizedBox(height: 24.h),
                        
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
                  
                  SizedBox(height: 24.h),
                  
                  // Settings section that's available for guests
                  _buildGuestSettingsSection(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String text) {
    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.h),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8.w),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(
              icon,
              size: 20.sp,
              color: AppColors.primary,
            ),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14.sp,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
          Icon(
            Icons.check_circle,
            size: 18.sp,
            color: Colors.green,
          ),
        ],
      ),
    );
      },
    );
  }

  Widget _buildGuestSettingsSection() {
    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Genel Ayarlar',
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 12.h),
          _buildSettingsItem(
            icon: Icons.language,
            title: 'Dil',
            subtitle: 'Türkçe',
            onTap: () {
              // TODO: Open language picker
            },
          ),
          _buildSettingsItem(
            icon: Icons.help_outline,
            title: 'Yardım & Destek',
            subtitle: 'SSS ve iletişim',
            onTap: () {
              // TODO: Open help page
            },
          ),
          _buildSettingsItem(
            icon: Icons.info_outline,
            title: 'Hakkında',
            subtitle: 'Uygulama bilgileri',
            onTap: () {
              // TODO: Open about page
            },
          ),
        ],
      ),
    );
      },
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.r),
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 4.w),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(10.w),
              decoration: BoxDecoration(
                color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.grey[100],
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(
                icon,
                size: 22.sp,
                color: theme.colorScheme.onSurfaceVariant,
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
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              size: 22.sp,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
      },
    );
  }
}
