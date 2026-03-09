import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/services/services.dart';
import '../../routes/routes.dart';
import '../../view/themes/theme.dart';

class OnboardingItem {
  final String title;
  final String description;
  final String imagePath; // assets/images/...
  final Color? overlayColor; // Optional tint color

  OnboardingItem({
    required this.title,
    required this.description,
    required this.imagePath,
    this.overlayColor,
  });
}

class OnboardingController extends GetxController {
  final PageController pageController = PageController();
  final RxInt currentPage = 0.obs;
  late StorageService storageService;

  @override
  void onInit() {
    super.onInit();
    storageService = Get.find<StorageService>();
  }

  final List<OnboardingItem> onboardingItems = [
    OnboardingItem(
  title: "Hac & Umre Yolculuğunu Planla",
  description: "Uçuşundan konaklamana, transferinden ibadet zamanlarına kadar tüm süreci tek ekrandan organize et.",
  imagePath: 'assets/images/onboarding_1.jpg',
  overlayColor: const Color(0xFF6C63FF),
    ),
    OnboardingItem(
  title: "Rehberli ve Güvenli Deneyim",
  description: "Adım adım tavaf & sa'y yönlendirmeleri, ibadet vakti hatırlatmaları ve resmi bilgilere güvenli erişim.",
  imagePath: 'assets/images/onboarding_2.jpg',
  overlayColor: const Color(0xFF26C6DA),
    ),
    OnboardingItem(
  title: "Anlık Bildirim & Takip",
  description: "Yoğunluk durumları, önemli duyurular ve grup hareketleri için gerçek zamanlı bildirimlerle daima hazır ol.",
  imagePath: 'assets/images/onboarding_3.jpg',
  overlayColor: const Color(0xFF66BB6A),
    ),
  ];

  bool get isLastPage => currentPage.value == onboardingItems.length - 1;

  void onPageChanged(int index) {
    currentPage.value = index;
  }

  void nextPage() {
    if (!isLastPage) {
      pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void previousPage() {
    pageController.previousPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void skipOnboarding() async {
    await _completeOnboardingFlow();
  }

  void completeOnboarding() async {
    await _completeOnboardingFlow();
  }

  Future<void> _completeOnboardingFlow() async {
    try {
      // Onboarding tamamlandığını işaretle
      await storageService.setOnboardingCompleted();
      // İlk açılışın tamamlandığını işaretle
      await storageService.setFirstLaunchCompleted();
      
      // Auth sayfasına yönlendir
      Get.offAllNamed(Routes.AUTH);
    } catch (e) {
      // Hata durumunda da auth sayfasına yönlendir
      Get.offAllNamed(Routes.AUTH);
    }
  }

  void toggleLanguage() {
    // Dil değiştirme fonksiyonu - şimdilik basit bir snackbar gösterelim
    Get.snackbar(
      "Dil Seçimi",
      "Dil değiştirme özelliği yakında eklenecek",
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.white,
      colorText: Colors.black87,
      borderColor: AppColors.primary,
      borderWidth: 1.5,
      borderRadius: 12,
      margin: const EdgeInsets.all(16),
      duration: const Duration(seconds: 2),
      icon: Icon(
        Icons.language,
        color: AppColors.primary,
      ),
    );
  }

  @override
  void onClose() {
    pageController.dispose();
    super.onClose();
  }
}
