import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/auth/auth_controller.dart';
import '../../themes/theme.dart';
import '../../widgets/regions/page_region.dart';
import 'widgets/auth_widgets.dart';

class AuthPage extends GetView<AuthController> {
  const AuthPage({super.key});

  @override
  Widget build(BuildContext context) {
    print('📱 [UI] AuthPage.build() called at ${DateTime.now()}');
    return PageRegion(
      child: Scaffold(
        backgroundColor: Get.theme.scaffoldBackgroundColor,
        resizeToAvoidBottomInset: false, // Klavye açıldığında layout değişmesin
        body: SafeArea(
          bottom: false,
          left: false,
          right: false,
          top: false,
          child: Obx(() {
            print('📱 [UI] Obx rebuilding - isOtpSent: ${controller.isOtpSent.value}');
            if (controller.isOtpSent.value) {
              print('📱 [UI] Rendering OTP verification page');
              return _buildOtpVerificationPage();
            } else {
              print('📱 [UI] Rendering phone input page');
              return _buildPhoneInputPage();
            }
          }),
        ),
      ),
    );
  }

  Widget _buildPhoneInputPage() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
        final isKeyboardOpen = keyboardHeight > 0;
        
        return Column(
          children: [
            // Main content area - takes remaining space
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 24.w),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Top spacing - smaller when keyboard is open
                    SizedBox(height: isKeyboardOpen ? 20.h : 60.h),
                    
                    // App Logo - smaller when keyboard is open
                    Image.asset(
                      'assets/images/app_icon.png',
                      height: isKeyboardOpen ? 60.h : 80.h,
                      width: isKeyboardOpen ? 60.w : 80.w,
                    ),
                    
                    SizedBox(height: isKeyboardOpen ? 16.h : 24.h),
                    
                    // Welcome Text
                    Builder(
                      builder: (context) {
                        final isDark = Theme.of(context).brightness == Brightness.dark;
                        return Column(
                          children: [
                            Text(
                              'Hoş Geldiniz',
                              style: TextStyle(
                                fontSize: isKeyboardOpen ? 24.sp : 28.sp,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                            
                            SizedBox(height: 8.h),
                            
                            Text(
                              'Yolculuğunuza başlamak için\ntelefon numaranızı girin',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: isKeyboardOpen ? 14.sp : 16.sp,
                                color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                                height: 1.4,
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                    
                    SizedBox(height: isKeyboardOpen ? 24.h : 40.h),
                    
                    // Phone Number Field
                    PhoneInputField(
                      controller: controller.phoneController,
                      onCountryChanged: controller.onCountryChanged,
                      errorText: controller.phoneError.value.isEmpty ? null : controller.phoneError.value,
                    ),
                    
                    SizedBox(height: 24.h),
                    
                    // Continue Button with loading message
                    Obx(() => AuthActionButton(
                      onPressed: controller.sendOtp,
                      text: controller.isSendingOtp.value 
                          ? 'SMS Gönderiliyor...' 
                          : 'Devam Et',
                      isLoading: controller.isSendingOtp.value,
                    )),
                    
                    // Only show divider and Google button when keyboard is closed
                    if (!isKeyboardOpen) ...[
                      SizedBox(height: 20.h),
                      
                      // Divider
                      Builder(
                        builder: (context) {
                          final isDark = Theme.of(context).brightness == Brightness.dark;
                          return Row(
                            children: [
                              Expanded(child: Divider(color: isDark ? Colors.grey.shade700 : Colors.grey[300], thickness: 1)),
                              Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16.w),
                                child: Text(
                                  'veya',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: isDark ? Colors.grey.shade500 : Colors.grey[500],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              Expanded(child: Divider(color: isDark ? Colors.grey.shade700 : Colors.grey[300], thickness: 1)),
                            ],
                          );
                        },
                      ),
                      
                      SizedBox(height: 20.h),
                      
                      // Google Sign-In
                      Obx(() => SocialLoginButton.google(
                        onPressed: controller.signInWithGoogle,
                        isLoading: controller.isGoogleLoading.value,
                      )),
                      
                      SizedBox(height: 12.h),
                      
                      // Apple Sign-In
                      Builder(
                        builder: (context) {
                          final isDark = Theme.of(context).brightness == Brightness.dark;
                          return Obx(() => SocialLoginButton.apple(
                            onPressed: controller.signInWithApple,
                            isLoading: controller.isAppleLoading.value,
                            isDark: isDark,
                          ));
                        },
                      ),
                      
                      SizedBox(height: 16.h),
                      
                      // Guest Login Button
                      Obx(() => GuestLoginButton(
                        onPressed: controller.continueAsGuest,
                        isLoading: controller.isGuestLoading.value,
                      )),
                    ],
                    
                    SizedBox(height: 20.h),
                  ],
                ),
              ),
            ),
            
            // Terms text at bottom - always visible, fixed position
            Builder(
              builder: (context) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                return Container(
                  color: isDark ? const Color(0xFF121212) : Colors.white,
                  padding: EdgeInsets.fromLTRB(24.w, 10.h, 24.w, 20.h),
                  child: Text(
                    'Devam ederek Kullanım Koşulları ve Gizlilik Politikası\'nı kabul etmiş olursunuz.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: isDark ? Colors.grey.shade500 : Colors.grey[500],
                      height: 1.4,
                    ),
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildOtpVerificationPage() {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(height: 40.h),
          
          // Back Button
          Row(
            children: [
              IconButton(
                onPressed: controller.goBackToPhoneInput,
                icon: Icon(
                  Icons.arrow_back_ios,
                  color: AppColors.primary,
                  size: 20.sp,
                ),
              ),
              Text(
                'Geri',
                style: TextStyle(
                  fontSize: 16.sp,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          
          SizedBox(height: 20.h),
          
          // OTP Icon
          Container(
            height: 80.h,
            width: 80.w,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.smartphone,
              size: 40.sp,
              color: AppColors.primary,
            ),
          ),
          
          SizedBox(height: 24.h),
          
          // Title
          Builder(
            builder: (context) {
              final isDark = Theme.of(context).brightness == Brightness.dark;
              return Text(
                'Doğrulama Kodu',
                style: TextStyle(
                  fontSize: 28.sp,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              );
            },
          ),
          
          SizedBox(height: 12.h),
          
          // Description
          Builder(
            builder: (context) {
              final isDark = Theme.of(context).brightness == Brightness.dark;
              return Obx(() => Text(
                '${controller.phoneNumber.value} numarasına gönderilen 6 haneli kodu girin',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15.sp,
                  color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                  height: 1.4,
                ),
              ));
            },
          ),
          
          SizedBox(height: 40.h),
          
          // OTP Input
          Obx(() => OTPInputField(
            onCompleted: controller.verifyOtp,
            hasError: controller.otpError.value.isNotEmpty,
            errorText: controller.otpError.value.isEmpty ? null : controller.otpError.value,
          )),
          
          // Loading indicator for verification
          Obx(() => controller.isVerifyingOtp.value
              ? Padding(
                  padding: EdgeInsets.only(top: 20.h),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 18.sp,
                        height: 18.sp,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.primary,
                          ),
                        ),
                      ),
                      SizedBox(width: 10.w),
                      Text(
                        'Doğrulanıyor...',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                )
              : const SizedBox.shrink()),
          
          SizedBox(height: 32.h),
          
          // Resend Timer
          OTPTimer(
            onTimerFinished: () {},
            onResend: controller.resendOtp,
          ),
          
          SizedBox(height: 40.h),
        ],
      ),
    );
  }
}
