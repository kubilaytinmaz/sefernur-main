import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:icons_plus/icons_plus.dart';

import '../../../routes/routes.dart';
import '../../themes/theme.dart';

/// Dialog shown when a guest user tries to access a feature that requires authentication.
/// Prompts user to either sign in or create an account.
class LoginRequiredDialog {
  static void show({
    String? title,
    String? message,
    String? featureName,
  }) {
    // Close any existing dialogs first
    if (Get.isDialogOpen ?? false) {
      Get.back();
    }

    Get.dialog(
      AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        contentPadding: EdgeInsets.all(24.w),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Bootstrap.person_lock,
                color: AppColors.primary,
                size: 40.sp,
              ),
            ),
            SizedBox(height: 20.h),

            // Title
            Text(
              title ?? 'Giriş Yapın',
              style: TextStyle(
                color: Colors.black87,
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 12.h),

            // Message
            Text(
              message ??
                  '${featureName ?? 'Bu özelliği'} kullanmak için hesabınıza giriş yapın veya yeni bir hesap oluşturun.',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14.sp,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 24.h),

            // Sign in button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Get.back();
                  Get.toNamed(Routes.AUTH);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 14.h),
                  elevation: 0,
                ),
                child: Text(
                  'Giriş Yap / Kayıt Ol',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15.sp,
                  ),
                ),
              ),
            ),
            SizedBox(height: 12.h),

            // Continue as guest button
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Get.back(),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.grey[600],
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 14.h),
                ),
                child: Text(
                  'Daha Sonra',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 14.sp,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      barrierDismissible: true,
    );
  }

  /// Shows a specific dialog for favorite feature
  static void showForFavorites() {
    show(
      title: 'Favorilere Ekle',
      message: 'Favorilerinizi kaydetmek için hesabınıza giriş yapın veya yeni bir hesap oluşturun.',
      featureName: 'Favoriler',
    );
  }

  /// Shows a specific dialog for referral feature
  static void showForReferrals() {
    show(
      title: 'Referans Programı',
      message: 'Referans kodunuzu görmek ve kazanç elde etmek için hesabınıza giriş yapın.',
      featureName: 'Referans programı',
    );
  }

  /// Shows a specific dialog for visa application
  static void showForVisa() {
    show(
      title: 'Vize Başvurusu',
      message: 'Vize başvurusu yapmak için hesabınıza giriş yapın veya yeni bir hesap oluşturun.',
      featureName: 'Vize başvurusu',
    );
  }

  /// Shows a specific dialog for profile
  static void showForProfile() {
    show(
      title: 'Profiliniz',
      message: 'Profil bilgilerinizi görüntülemek ve düzenlemek için hesabınıza giriş yapın.',
      featureName: 'Profil',
    );
  }

  /// Shows a specific dialog for reservations
  static void showForReservations() {
    show(
      title: 'Rezervasyonlarım',
      message: 'Rezervasyonlarınızı görüntülemek için hesabınıza giriş yapın.',
      featureName: 'Rezervasyonlar',
    );
  }
}
