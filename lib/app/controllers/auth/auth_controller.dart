import 'package:country_code_picker/country_code_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';

import '../../data/services/services.dart';
import '../../routes/routes.dart';

class AuthController extends GetxController {
  // Phone authentication controllers
  final phoneController = TextEditingController();
  final otpController = TextEditingController();

  // Observable states
  final RxBool isLoading = false.obs;
  final RxBool isOtpSent = false.obs;
  final RxBool isResendingOtp = false.obs;
  final RxBool isSendingOtp = false.obs; // Separate loading for SMS sending
  final RxBool isVerifyingOtp = false.obs; // Separate loading for OTP verification
  final RxBool isGoogleLoading = false.obs; // Separate loading for Google sign-in
  final RxBool isAppleLoading = false.obs; // Separate loading for Apple sign-in
  final RxBool isGuestLoading = false.obs; // Separate loading for guest login
  final RxString phoneNumber = ''.obs;
  final RxString selectedCountryCode = '+90'.obs;
  final RxString verificationId = ''.obs;
  final RxString otpError = ''.obs;
  final RxString phoneError = ''.obs;
  final RxString loadingMessage = ''.obs; // For showing loading text

  late AuthService authService;

  @override
  void onInit() {
    super.onInit();
    print('📱 [INIT] AuthController.onInit() called at ${DateTime.now()}');
    authService = Get.find<AuthService>();
    _restorePendingVerification();
    print('📱 [INIT] AuthController.onInit() completed');
  }

  void _restorePendingVerification() {
    print('📱 [RESTORE] Starting restoration check at ${DateTime.now()}');
    print('📱 [RESTORE] Current route: ${Get.currentRoute}');
    print('📱 [RESTORE] isOtpSent before restoration: ${isOtpSent.value}');
    
    // Restore on auth-related routes (including Firebase callback /link route)
    final route = Get.currentRoute.toLowerCase();
    final isAuthRelatedRoute = route == Routes.AUTH ||
        route.contains('/auth') ||
      route.startsWith('/link');

    if (!isAuthRelatedRoute) {
      print('📱 [RESTORE] Skipping restoration - not on auth-related route');
      return;
    }
    
    // Restore verification state if app was restarted (e.g., after reCAPTCHA)
    if (Get.isRegistered<StorageService>()) {
      final storage = Get.find<StorageService>();
      final savedVerificationId = storage.box.read<String>('pending_verification_id');
      final savedPhoneNumber = storage.box.read<String>('pending_phone_number');
      
      if (savedVerificationId != null && savedPhoneNumber != null) {
        print('📱 [RESTORE] Found saved state - restoring...');
        print('📱 [RESTORE] Verification ID: ${savedVerificationId.substring(0, 20)}...');
        print('📱 [RESTORE] Phone: $savedPhoneNumber');
        
        verificationId.value = savedVerificationId;
        phoneNumber.value = savedPhoneNumber;
        isOtpSent.value = true;
        
        print('📱 [RESTORE] State restored - isOtpSent: ${isOtpSent.value}');
        
        // DON'T clear saved state yet - wait until successful verification
        // This ensures we can retry if restoration timing fails
        
        // Force UI update after current frame completes
        SchedulerBinding.instance.addPostFrameCallback((_) {
          print('📱 [RESTORE] Post-frame callback executing');
          print('📱 [RESTORE] isOtpSent in post-frame: ${isOtpSent.value}');
          
          // Force GetX to rebuild UI
          update();
          
          // Double-check the state is correct
          if (!isOtpSent.value) {
            print('⚠️ [RESTORE] WARNING: isOtpSent reset to false after restoration!');
            isOtpSent.value = true;
          }
        });
      } else {
        print('📱 [RESTORE] No saved state found');
      }
    } else {
      print('📱 [RESTORE] StorageService not registered');
    }
  }

  void onCountryChanged(CountryCode countryCode) {
    selectedCountryCode.value = countryCode.dialCode ?? '+90';
  }

  void _showSnackbarSafe(
    String title,
    String message, {
    required bool isError,
  }) {
    if (isClosed) return;

    final overlay = Get.key.currentState?.overlay;
    final canShow = overlay != null && overlay.mounted && Get.overlayContext != null;
    if (!canShow) {
      print('📱 [SNACKBAR] Overlay hazır değil, snackbar atlandı: $title');
      return;
    }

    try {
      Get.snackbar(
        title,
        message,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: isError ? Colors.red[50] : Colors.green[50],
        colorText: isError ? Colors.red[800] : Colors.green[800],
        borderColor: isError ? Colors.red : Colors.green,
        borderWidth: 1.5,
        borderRadius: 12,
        margin: const EdgeInsets.all(16),
        icon: Icon(
          isError ? Icons.error_outline : Icons.check_circle_outline,
          color: isError ? Colors.red[600] : Colors.green[600],
        ),
      );
    } catch (_) {
      // Snackbar atılamıyorsa akışı kırma
    }
  }

  void toggleAuthMode(bool signUp) {
    // Clear form when switching modes
    phoneController.clear();
    otpController.clear();
    isOtpSent.value = false;
    phoneError.value = '';
    otpError.value = '';
  }

  String _formatPhoneNumber(String phone) {
    // Remove all spaces and formatting
    String cleanPhone = phone.replaceAll(RegExp(r'\s+'), '');
    
    // Ensure it starts with country code
    if (!cleanPhone.startsWith(selectedCountryCode.value)) {
      cleanPhone = selectedCountryCode.value + cleanPhone;
    }
    
    return cleanPhone;
  }

  bool _validatePhoneNumber() {
    final phone = phoneController.text.trim();
    
    if (phone.isEmpty) {
      phoneError.value = 'Telefon numarası gerekli';
      return false;
    }
    
    // Remove spaces for validation
    final cleanPhone = phone.replaceAll(RegExp(r'\s+'), '');
    
    // Turkish phone number validation (10 digits after removing spaces)
    if (selectedCountryCode.value == '+90' && cleanPhone.length != 10) {
      phoneError.value = 'Geçerli bir telefon numarası girin';
      return false;
    }
    
    // General validation for other countries (minimum 7 digits)
    if (cleanPhone.length < 7) {
      phoneError.value = 'Geçerli bir telefon numarası girin';
      return false;
    }
    
    phoneError.value = '';
    return true;
  }

  Future<void> sendOtp() async {
    if (!_validatePhoneNumber()) {
      return;
    }

    isLoading.value = true;
    isSendingOtp.value = true;
    loadingMessage.value = 'SMS gönderiliyor...';
    phoneNumber.value = _formatPhoneNumber(phoneController.text.trim());
    
    try {
      await authService.sendPhoneVerification(
        phoneNumber.value,
        (String verificationId) {
          // OTP sent successfully
          this.verificationId.value = verificationId;
          isOtpSent.value = true;
          isLoading.value = false;
          isSendingOtp.value = false;
          loadingMessage.value = '';
          
          // Save state in case app is restarted (e.g., after reCAPTCHA redirect)
          if (Get.isRegistered<StorageService>()) {
            final storage = Get.find<StorageService>();
            storage.box.write('pending_verification_id', verificationId);
            storage.box.write('pending_phone_number', phoneNumber.value);
          }
          
          _showSnackbarSafe(
            "Başarılı",
            "Doğrulama kodu ${phoneNumber.value} numarasına gönderildi",
            isError: false,
          );
        },
        (String error) {
          // OTP send failed
          isLoading.value = false;
          isSendingOtp.value = false;
          loadingMessage.value = '';
          _showSnackbarSafe(
            "Hata",
            error,
            isError: true,
          );
        },
      );
    } catch (e) {
      isLoading.value = false;
      isSendingOtp.value = false;
      loadingMessage.value = '';
      _showSnackbarSafe(
        "Hata",
        "Bir hata oluştu: ${e.toString()}",
        isError: true,
      );
    }
  }

  Future<void> verifyOtp(String otp) async {
    if (otp.length != 6) {
      otpError.value = 'Doğrulama kodu 6 haneli olmalıdır';
      return;
    }

    isLoading.value = true;
    isVerifyingOtp.value = true;
    loadingMessage.value = 'Doğrulanıyor...';
    otpError.value = '';
    
    try {
      // Kullanıcı varsa giriş yap, yoksa otomatik kayıt ol
      final success = await authService.verifyPhoneNumber(
        verificationId.value,
        otp,
        {
          'phoneNumber': phoneNumber.value,
        },
      );
      
      if (success) {
        // Clear saved verification state on successful verification
        print('📱 [VERIFY] Verification successful - clearing saved state');
        if (Get.isRegistered<StorageService>()) {
          final storage = Get.find<StorageService>();
          storage.box.remove('pending_verification_id');
          storage.box.remove('pending_phone_number');
          print('📱 [VERIFY] Saved state cleared');
        }
        Get.offAllNamed(Routes.MAIN);
      } else {
        otpError.value = 'Geçersiz doğrulama kodu';
      }
    } catch (e) {
      // Check for session expired error
      final errorMsg = e.toString().toLowerCase();
      if (errorMsg.contains('expired') || errorMsg.contains('session')) {
        otpError.value = 'Doğrulama süresi doldu. Lütfen yeni kod isteyin.';
      } else {
        otpError.value = 'Doğrulama kodu doğrulanamadı';
      }
    } finally {
      isLoading.value = false;
      isVerifyingOtp.value = false;
      loadingMessage.value = '';
    }
  }

  Future<void> resendOtp() async {
    isResendingOtp.value = true;
    await sendOtp();
    isResendingOtp.value = false;
  }

  Future<void> signInWithGoogle() async {
    isGoogleLoading.value = true;
    
    try {
      final success = await authService.signInWithGoogle();
      
      if (success) {
        Get.offAllNamed(Routes.MAIN);
      }
    } catch (e) {
      _showSnackbarSafe(
        "Hata",
        "Google ile giriş yapılamadı",
        isError: true,
      );
    } finally {
      isGoogleLoading.value = false;
    }
  }

  Future<void> signInWithApple() async {
    isAppleLoading.value = true;
    
    try {
      final success = await authService.signInWithApple();
      
      if (success) {
        Get.offAllNamed(Routes.MAIN);
      }
    } catch (e) {
      _showSnackbarSafe(
        "Hata",
        "Apple ile giriş yapılamadı",
        isError: true,
      );
    } finally {
      isAppleLoading.value = false;
    }
  }

  void goBackToPhoneInput() {
    print('📱 [NAV] User going back to phone input');
    isOtpSent.value = false;
    otpController.clear();
    otpError.value = '';
    
    // Clear saved state when user manually goes back
    if (Get.isRegistered<StorageService>()) {
      final storage = Get.find<StorageService>();
      storage.box.remove('pending_verification_id');
      storage.box.remove('pending_phone_number');
      print('📱 [NAV] Cleared saved state on back navigation');
    }
  }

  /// Continue as guest without signing in
  /// User can explore the app but won't have access to certain features
  Future<void> continueAsGuest() async {
    isGuestLoading.value = true;
    try {
      authService.continueAsGuest();
      Get.offAllNamed(Routes.MAIN);
    } finally {
      isGuestLoading.value = false;
    }
  }

  @override
  void onClose() {
    phoneController.dispose();
    otpController.dispose();
    super.onClose();
  }
}
