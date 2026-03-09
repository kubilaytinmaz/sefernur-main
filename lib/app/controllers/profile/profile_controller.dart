import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../data/models/visa/visa_application_model.dart';
import '../../data/repositories/visa/visa_repository.dart';
import '../../data/services/auth/auth_service.dart';
import '../../routes/routes.dart';
import '../visa/visa_controller.dart';

class ProfileController extends GetxController {
  var isLoading = false.obs;
  var isEditingProfile = false.obs;
  
  // User Information
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();
  
  var profileImage = Rx<File?>(null);
  var profileImageUrl = 'https://via.placeholder.com/150'.obs;
  
  // Settings
  var notificationsEnabled = true.obs;
  var languagePreference = 'Türkçe'.obs;
  var pushNotifications = true.obs;
  var emailNotifications = true.obs;
  var smsNotifications = false.obs;
  
  // User data
  var user = Rx<UserProfile?>(null);
  var reservations = <Reservation>[].obs;
  var visaApplications = <VisaApplicationModel>[].obs;
  final VisaRepository _visaRepo = VisaRepository();
  String currentUserId = 'demoUser'; // TODO: auth entegrasyonu
  var reviews = <UserReview>[].obs;
  var favorites = <FavoriteItem>[].obs;
  var referralStats = Rx<ReferralStats?>(null);
  
  final languages = ['Türkçe', 'English', 'العربية'];
  
  @override
  void onInit() {
    super.onInit();
    loadUserProfile();
    loadUserData();
  }

  @override
  void onClose() {
    firstNameController.dispose();
    lastNameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    super.onClose();
  }

  void loadUserProfile() {
    // Dummy user data - replace with actual API call
    user.value = UserProfile(
      id: 'U001',
      firstName: 'Serdar',
      lastName: 'Cida',
      email: 'serdar@example.com',
      phone: '+90 532 123 4567',
      profileImageUrl: profileImageUrl.value,
      isVerified: true,
      memberSince: DateTime(2023, 1, 15),
      totalBookings: 12,
      totalReviews: 8,
      averageRating: 4.8,
    );
    
    // Fill controllers with current data
    firstNameController.text = user.value!.firstName;
    lastNameController.text = user.value!.lastName;
    phoneController.text = user.value!.phone;
    emailController.text = user.value!.email;
  }

  void loadUserData() {
    loadReservations();
    loadVisaApplications();
    loadReviews();
    loadFavorites();
    loadReferralStats();
  }

  void loadReservations() {
    // Dummy reservation data
    reservations.value = [
      Reservation(
        id: 'R001',
        type: 'Otel',
        title: 'Hilton Suites Makkah',
        date: DateTime.now().add(const Duration(days: 30)),
        status: 'Onaylandı',
        amount: 450.0,
        location: 'Mekke, Suudi Arabistan',
      ),
      Reservation(
        id: 'R002',
        type: 'Transfer',
        title: 'Havalimanı Transfer Hizmeti',
        date: DateTime.now().add(const Duration(days: 29)),
        status: 'Beklemede',
        amount: 75.0,
        location: 'Cidde Havalimanı',
      ),
      Reservation(
        id: 'R003',
        type: 'Tur',
        title: 'Umre Premium Paketi',
        date: DateTime.now().subtract(const Duration(days: 60)),
        status: 'Tamamlandı',
        amount: 1200.0,
        location: 'Mekke - Medine',
      ),
    ];
  }

  void loadVisaApplications() {
    visaApplications.bindStream(_visaRepo.streamUserApplications(currentUserId));
  }

  void loadReviews() {
    // Dummy reviews
    reviews.value = [
      UserReview(
        id: 'RV001',
        serviceName: 'Hilton Suites Makkah',
        serviceType: 'Otel',
        rating: 5,
        comment: 'Mükemmel bir konaklama deneyimi yaşadım. Personel çok ilgili ve otel temizdi.',
        date: DateTime.now().subtract(const Duration(days: 30)),
      ),
      UserReview(
        id: 'RV002',
        serviceName: 'Özel Transfer Hizmeti',
        serviceType: 'Transfer',
        rating: 4,
        comment: 'Zamanında geldi ve güvenli bir yolculuk oldu.',
        date: DateTime.now().subtract(const Duration(days: 45)),
      ),
    ];
  }

  void loadFavorites() {
    // Dummy favorites
    favorites.value = [
      FavoriteItem(
        id: 'F001',
        type: 'Otel',
        title: 'Swissotel Makkah',
        subtitle: 'Mekke, Suudi Arabistan',
        imageUrl: 'https://via.placeholder.com/100',
        price: 380.0,
      ),
      FavoriteItem(
        id: 'F002',
        type: 'Tur',
        title: 'Hac Ekonomi Paketi',
        subtitle: '14 Gün - Mekke & Medine',
        imageUrl: 'https://via.placeholder.com/100',
        price: 2500.0,
      ),
    ];
  }

  void loadReferralStats() {
    // Dummy referral stats
    referralStats.value = ReferralStats(
      referralCode: 'SEFERNUR123',
      totalEarnings: 350.0,
      availableBalance: 200.0,
      totalReferrals: 8,
      successfulReferrals: 5,
    );
  }

  Future<void> pickProfileImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 400,
      maxHeight: 400,
      imageQuality: 80,
    );

    if (image != null) {
      profileImage.value = File(image.path);
      Get.snackbar(
        'Başarılı',
        'Profil fotoğrafı seçildi',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    }
  }

  void toggleEditProfile() {
    isEditingProfile.value = !isEditingProfile.value;
    if (!isEditingProfile.value) {
      // Reset to original values if cancelled
      firstNameController.text = user.value!.firstName;
      lastNameController.text = user.value!.lastName;
      phoneController.text = user.value!.phone;
      emailController.text = user.value!.email;
    }
  }

  void saveProfile() {
    if (firstNameController.text.isEmpty || lastNameController.text.isEmpty) {
      Get.snackbar(
        'Hata',
        'Ad ve soyad alanları boş bırakılamaz',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;

    // Simulate API call
    Future.delayed(const Duration(seconds: 2), () {
      user.value = user.value!.copyWith(
        firstName: firstNameController.text,
        lastName: lastNameController.text,
        phone: phoneController.text,
        email: emailController.text,
      );

      isLoading.value = false;
      isEditingProfile.value = false;

      Get.snackbar(
        'Başarılı',
        'Profil bilgileriniz güncellendi',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    });
  }

  void changePassword() {
    Get.dialog(
      AlertDialog(
        title: const Text('Şifre Değiştir'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Mevcut Şifre',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Yeni Şifre',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Yeni Şifre (Tekrar)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              Get.snackbar(
                'Başarılı',
                'Şifreniz güncellendi',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: Colors.green,
                colorText: Colors.white,
              );
            },
            child: const Text('Güncelle'),
          ),
        ],
      ),
    );
  }

  void verifyIdentity() {
    Get.dialog(
      AlertDialog(
        title: const Text('Kimlik Doğrulama'),
        content: const Text(
          'Kimlik doğrulama işlemi için pasaport veya kimlik belgesi yüklemeniz gerekmektedir. Bu işlem hesabınızın güvenliğini artırır.',
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              // Navigate to identity verification page
              Get.snackbar(
                'Bilgi',
                'Kimlik doğrulama sayfasına yönlendiriliyorsunuz',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: Colors.blue,
                colorText: Colors.white,
              );
            },
            child: const Text('Devam Et'),
          ),
        ],
      ),
    );
  }

  void removeFavorite(String id) {
    favorites.removeWhere((item) => item.id == id);
    Get.snackbar(
      'Başarılı',
      'Favorilerden kaldırıldı',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.orange,
      colorText: Colors.white,
    );
  }

  void contactSupport() {
    Get.dialog(
      AlertDialog(
        title: const Text('Destek'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.phone),
              title: const Text('Telefon'),
              subtitle: const Text('+90 (212) 555 0123'),
              onTap: () {
                Get.back();
                Get.snackbar(
                  'Aranıyor',
                  '+90 (212) 555 0123',
                  snackPosition: SnackPosition.BOTTOM,
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.email),
              title: const Text('E-posta'),
              subtitle: const Text('destek@sefernur.com'),
              onTap: () {
                Get.back();
                Get.snackbar(
                  'E-posta',
                  'E-posta uygulaması açılıyor...',
                  snackPosition: SnackPosition.BOTTOM,
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.chat),
              title: const Text('Canlı Destek'),
              subtitle: const Text('7/24 müşteri hizmeti'),
              onTap: () {
                Get.back();
                Get.snackbar(
                  'Canlı Destek',
                  'Canlı destek başlatılıyor...',
                  snackPosition: SnackPosition.BOTTOM,
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Kapat'),
          ),
        ],
      ),
    );
  }

  void logout() {
    Get.dialog(
      AlertDialog(
        title: const Text('Çıkış Yap'),
        content: const Text('Hesabınızdan çıkış yapmak istediğinizden emin misiniz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(Get.overlayContext!).pop(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              // Close dialog first using Navigator instead of Get.back()
              Navigator.of(Get.overlayContext!).pop();
              
              // Perform logout
              final authService = Get.find<AuthService>();
              await authService.logoutUser();
              
              // Navigate to auth page
              Get.offAllNamed(Routes.AUTH);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Çıkış Yap'),
          ),
        ],
      ),
    );
  }

  Future<void> deleteAccount() async {
    try {
      isLoading.value = true;

      // Show loading dialog
      Get.dialog(
        const Center(
          child: CircularProgressIndicator(),
        ),
        barrierDismissible: false,
      );

      // Call auth service to delete account
      final authService = Get.find<AuthService>();
      final success = await authService.deleteAccount();

      // Close loading dialog
      Get.back();

      if (success) {
        Get.snackbar(
          'Başarılı',
          'Hesabınız kalıcı olarak silindi',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green,
          colorText: Colors.white,
          duration: const Duration(seconds: 3),
        );

        // Navigate to auth/welcome page
        await Future.delayed(const Duration(seconds: 1));
        Get.offAllNamed(Routes.AUTH);
      } else {
        Get.dialog(
          AlertDialog(
            title: const Text('Hata'),
            content: const Text('Hesabınız silinirken bir hata oluştu. Lütfen tekrar deneyin.'),
            actions: [
              TextButton(
                onPressed: () => Get.back(),
                child: const Text('Tamam'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      // Close loading dialog if open
      if (Get.isDialogOpen ?? false) {
        Get.back();
      }

      Get.dialog(
        AlertDialog(
          title: const Text('Hata'),
          content: Text('Bir hata oluştu: ${e.toString()}'),
          actions: [
            TextButton(
              onPressed: () => Get.back(),
              child: const Text('Tamam'),
            ),
          ],
        ),
      );
    } finally {
      isLoading.value = false;
    }
  }

  String getReservationStatusText(String status) {
    switch (status) {
      case 'Onaylandı':
        return 'Onaylandı';
      case 'Beklemede':
        return 'Beklemede';
      case 'Tamamlandı':
        return 'Tamamlandı';
      case 'İptal Edildi':
        return 'İptal Edildi';
      default:
        return status;
    }
  }

  Color getReservationStatusColor(String status) {
    switch (status) {
      case 'Onaylandı':
        return Colors.green;
      case 'Beklemede':
        return Colors.orange;
      case 'Tamamlandı':
        return Colors.blue;
      case 'İptal Edildi':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String getVisaStatusText(String status) {
    // Normalize via visa controller if available
    if(Get.isRegistered<VisaController>()){
      return Get.find<VisaController>().getStatusText(status);
    }
    return status;
  }

  Color getVisaStatusColor(String status) {
    if(Get.isRegistered<VisaController>()){
      return Get.find<VisaController>().getStatusColor(status);
    }
    return Colors.grey;
  }
}

// Data Models
class UserProfile {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String profileImageUrl;
  final bool isVerified;
  final DateTime memberSince;
  final int totalBookings;
  final int totalReviews;
  final double averageRating;

  UserProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.profileImageUrl,
    required this.isVerified,
    required this.memberSince,
    required this.totalBookings,
    required this.totalReviews,
    required this.averageRating,
  });

  UserProfile copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? profileImageUrl,
    bool? isVerified,
  }) {
    return UserProfile(
      id: id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      isVerified: isVerified ?? this.isVerified,
      memberSince: memberSince,
      totalBookings: totalBookings,
      totalReviews: totalReviews,
      averageRating: averageRating,
    );
  }
}

class Reservation {
  final String id;
  final String type;
  final String title;
  final DateTime date;
  final String status;
  final double amount;
  final String location;

  Reservation({
    required this.id,
    required this.type,
    required this.title,
    required this.date,
    required this.status,
    required this.amount,
    required this.location,
  });
}

// Eski VisaApplication modeli kaldırıldı; VisaApplicationModel kullanılmakta.

class UserReview {
  final String id;
  final String serviceName;
  final String serviceType;
  final int rating;
  final String comment;
  final DateTime date;

  UserReview({
    required this.id,
    required this.serviceName,
    required this.serviceType,
    required this.rating,
    required this.comment,
    required this.date,
  });
}

class FavoriteItem {
  final String id;
  final String type;
  final String title;
  final String subtitle;
  final String imageUrl;
  final double price;

  FavoriteItem({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.price,
  });
}

class ReferralStats {
  final String referralCode;
  final double totalEarnings;
  final double availableBalance;
  final int totalReferrals;
  final int successfulReferrals;

  ReferralStats({
    required this.referralCode,
    required this.totalEarnings,
    required this.availableBalance,
    required this.totalReferrals,
    required this.successfulReferrals,
  });
}
