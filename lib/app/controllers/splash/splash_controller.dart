import 'dart:convert';

import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../data/services/services.dart';
import '../../dev_utils/dev_utils.dart';
import '../../routes/routes.dart';
import '../../view/themes/theme.dart';
import '../../view/widgets/widget.dart';

class SplashController extends GetxController with GetTickerProviderStateMixin {
  AuthService? authService;
  ThemeService? themeService;
  
  // Loading animation
  late AnimationController loadingAnimationController;
  late Animation<double> loadingAnimation;
  RxDouble loadingProgress = 0.0.obs;
  RxString loadingMessage = "Yükleniyor...".obs;

  final List<String> loadingMessages = [
    "Uygulama başlatılıyor...",
    "Servisler yükleniyor...",
    "Bağlantı kontrol ediliyor...",
    "Kullanıcı bilgileri kontrol ediliyor...",
    "Hazırlanıyor...",
  ];

  @override
  void onInit() {
    themeService = Get.find<ThemeService>();
    super.onInit();
    _initializeLoadingAnimation();
    
    // Async servislerin yüklenmesini bekle ve uygulamayı başlat
    _waitForServicesAndInitialize();
  }

  void _waitForServicesAndInitialize() async {
    try {
      // Başlangıç zamanını kaydet
      final startTime = DateTime.now();
      
      // ConnectivityService'in yüklenmesini bekle
      int attempts = 0;
      const maxAttempts = 50; // 5 saniye maksimum bekleme
      
      while (!Get.isRegistered<ConnectivityService>() && attempts < maxAttempts) {
        await Future.delayed(const Duration(milliseconds: 100));
        attempts++;
      }
      
      if (!Get.isRegistered<ConnectivityService>()) {
        cprint("ConnectivityService could not be loaded in time", errorIn: "_waitForServicesAndInitialize");
      }
      
      // Uygulamayı başlat
      final result = await initializeApp();
      
      // Minimum 2 saniye bekleme süresi
      final elapsed = DateTime.now().difference(startTime);
      const minimumDuration = Duration(seconds: 2);
      
      if (elapsed < minimumDuration) {
        final remainingTime = minimumDuration - elapsed;
        cprint("Waiting additional ${remainingTime.inMilliseconds}ms to meet minimum splash duration");
        await Future.delayed(remainingTime);
      }
      
      // Minimum süre tamamlandıktan sonra navigation yap
      if (result == true) {
        await checkNavigationFlow();
      } else {
        // Bağlantı yok veya hata durumunda da navigation yap
        await checkNavigationFlow();
      }
      
    } catch (e) {
      cprint("Error waiting for services: $e", errorIn: "_waitForServicesAndInitialize");
      // Hata durumunda da minimum bekleme süresi uygula
      await Future.delayed(const Duration(seconds: 2));
      await checkNavigationFlow();
    }
  }

  void _initializeLoadingAnimation() {
    loadingAnimationController = AnimationController(
      duration: const Duration(milliseconds: 2500),
      vsync: this,
    );
    
    loadingAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: loadingAnimationController,
      curve: Curves.easeInOut,
    ));
    
    loadingAnimation.addListener(() {
      loadingProgress.value = loadingAnimation.value;
    });
    
    // Start loading animation
    loadingAnimationController.forward();
  }

  Future<bool> initializeApp() async {
    try {
      // ConnectivityService'in yüklenip yüklenmediğini kontrol et
      if (!Get.isRegistered<ConnectivityService>()) {
        cprint("ConnectivityService not found, proceeding without connection check", errorIn: "initializeApp");
        loadingMessage.value = "Hazırlanıyor...";
        loadingProgress.value = 1.0;
        return false; // Navigation _waitForServicesAndInitialize'da yapılacak
      }

      var connectivityService = Get.find<ConnectivityService>();
      var starterService = Get.find<StarterService>();

      if (connectivityService.isConnected.value) {
        // Step 1: Initialize services
        loadingMessage.value = loadingMessages[1];
        loadingProgress.value = 0.2;
        
        await starterService.initializeAppServices();
        
        // Step 2: Check connection
        loadingMessage.value = loadingMessages[2];
        loadingProgress.value = 0.5;

        await Future.delayed(const Duration(milliseconds: 600));
        
        // Step 3: Check app version
        loadingMessage.value = loadingMessages[3];
        loadingProgress.value = 0.7;

        var result = await checkAppVersion();
        
        // Step 4: Finalizing
        loadingMessage.value = loadingMessages[4];
        loadingProgress.value = 0.9;
        
        await Future.delayed(const Duration(milliseconds: 400));
        
        loadingProgress.value = 1.0;
        await Future.delayed(const Duration(milliseconds: 200));

        // Navigation işlemi _waitForServicesAndInitialize'da yapılacak
        return result;
      } else {
        // Complete loading even if no connection
        loadingMessage.value = "Bağlantı hatası";
        loadingProgress.value = 1.0;
        FailureSnackBar.show(
          "internetConnectionNotFoundMessage".tr,
        );
        return false;
      }
    } catch (e) {
      // Complete loading on error
      loadingMessage.value = "Hata oluştu";
      loadingProgress.value = 1.0;
      cprint("Error in initializeApp: $e", errorIn: "initializeApp");
      return false;
    }
  }

  Future checkNavigationFlow() async {
    authService = Get.find<AuthService>();
    final storageService = Get.find<StorageService>();
    
    // İlk kez açılış mı kontrol et
    final isFirstLaunch = storageService.isFirstLaunch();
    final onboardingCompleted = storageService.onboardingCompleted();
    
    cprint("First launch: $isFirstLaunch, Onboarding completed: $onboardingCompleted");
    
    if (isFirstLaunch && !onboardingCompleted) {
      // İlk kez açılış ve onboarding tamamlanmamış -> Onboarding'e git
      cprint("Navigating to onboarding - first launch");
      Get.offAllNamed(Routes.ONBOARDING);
    } else {
      // Onboarding tamamlanmış veya ilk açılış değil -> Authentication kontrolü yap
      await checkForCachedUser();
    }
  }

  Future checkForCachedUser() async {
    authService = Get.find<AuthService>();
    final authenticated = await authService!.checkAuthentication();
    
    cprint("User authenticated: $authenticated");
    
    if (authenticated) {
      // Kullanıcı oturum açmış -> Main sayfasına git
      authService!.isGuest.value = false;
      cprint("Navigating to main - user authenticated");
      Get.offAllNamed(Routes.MAIN);
    } else {
      // Kullanıcı oturum açmamış -> Auth sayfasına git
      authService!.isGuest.value = true;
      cprint("Navigating to auth - user not authenticated");
      Get.offAllNamed(Routes.AUTH);
    }
  }

  Future<bool> checkAppVersion() async {
    try {
      PackageInfo packageInfo = await PackageInfo.fromPlatform();
      final currentAppVersion = packageInfo.version;
      final buildNo = packageInfo.buildNumber;

      final config = await getAppVersionFromFirebaseConfig();

      if (config != null && config['versionNumber'] == currentAppVersion && config['buildNumber'] == buildNo) {
        return true;
      } else {
        if (kDebugMode) {
          cprint("Latest version of app is not installed on your system");
          cprint("This is for testing purpose only. In debug mode update screen will not be open up");
          cprint("If you are planning to publish app on store then please update app version in firebase config");
          // Debug modda güncelleme dialogunu göstermeden devam et
          return true;
        }
        openDialog();
        return false;
      }
    } catch (e) {
      cprint("Error checking app version: $e", errorIn: "checkAppVersion");
      // Hata durumunda varsayılan olarak devam et
      return true;
    }
  }

  Future<Map?> getAppVersionFromFirebaseConfig() async {
    try {
      final remoteConfig = FirebaseRemoteConfig.instance;
      await remoteConfig.setConfigSettings(RemoteConfigSettings(
        fetchTimeout: const Duration(minutes: 1),
        minimumFetchInterval: const Duration(hours: 1),
      ));
      await remoteConfig.fetchAndActivate();
      var data = remoteConfig.getString('supportedVersion');
      if (data.isNotEmpty) {
        return jsonDecode(data) as Map;
      } else {
        cprint(
          "Please add your app's current version into Remote config in firebase",
          errorIn: "getAppVersionFromFirebaseConfig"
        );
        return null;
      }
    } catch (e) {
      cprint(
        "Firebase Remote Config error: $e",
        errorIn: "getAppVersionFromFirebaseConfig"
      );
      // Remote config hatası durumunda null döndür
      return null;
    }
  }

  void openDialog() {
    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: EdgeInsets.symmetric(horizontal: 20.w),
        child: Container(
          padding: EdgeInsets.all(24.w),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20.r),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Modern icon container
              Container(
                height: 80.h,
                width: 80.w,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primary,
                      AppColors.primary.withOpacity(0.8),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20.r),
                ),
                child: Icon(
                  Icons.system_update_outlined,
                  color: Colors.white,
                  size: 40.sp,
                ),
              ),
              SizedBox(height: 24.h),
              // Title
              Text(
                "Güncelleme Mevcut",
                style: Get.textTheme.headlineSmall!.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.h),
              // Description
              Text(
                "Daha iyi deneyim için uygulamanızı güncelleyin",
                style: Get.textTheme.bodyMedium!.copyWith(
                  color: Colors.grey[600],
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32.h),
              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        side: BorderSide(
                          color: AppColors.primary,
                          width: 1.5.w,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25.r),
                        ),
                      ),
                      onPressed: () async {
                        Get.back();
                        await checkNavigationFlow(); // Navigation akışını kontrol et
                      },
                      child: Text(
                        "Daha Sonra",
                        style: Get.textTheme.labelLarge!.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25.r),
                        ),
                        elevation: 0,
                      ),
                      onPressed: () async {
                        Get.back();
                        Get.offAllNamed(Routes.MAIN); // Main sayfaya yönlendir
                      },
                      child: Text(
                        "Güncelle",
                        style: Get.textTheme.labelLarge!.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  @override
  void onClose() {
    loadingAnimationController.dispose();
    super.onClose();
  }
  
}
