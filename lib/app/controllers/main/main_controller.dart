import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/services/auth/auth_service.dart';
import '../../view/pages/home/home_content.dart';
import '../../view/pages/profile/widgets/favorites_tab.dart';
import '../../view/pages/referrals/referrals_content.dart';
import '../../view/pages/search/search_content.dart';
import '../../view/pages/visa/visa_content.dart';

class MainController extends GetxController {
  var currentIndex = 0.obs;

  // Bottom navigation bar items (Referanslar sadece admin için görünür)
  // Bottom navigation: Home | Search | Favoriler | [Referanslar - admin only] | Vize

  /// Admin kullanıcı mı kontrol et (reaktif)
  /// Bu getter Obx içinde çağrılmalı, böylece user değiştiğinde UI güncellenir
  bool get isAdmin {
    if (!Get.isRegistered<AuthService>()) return false;
    final auth = Get.find<AuthService>();
    // user.value'ya erişiyoruz ki Obx reaktif olsun
    final _ = auth.user.value;
    return auth.isUserAdmin();
  }

  List<IconData> get bottomNavIcons {
    final base = [
      Icons.home_rounded,
      Icons.search_rounded,
      Icons.favorite_rounded,
    ];
    if (isAdmin) base.add(Icons.card_giftcard);
    base.add(Icons.menu_book_rounded);
    return base;
  }

  List<String> get bottomNavLabels {
    final base = [
      'Ana Sayfa',
      'Ara',
      'Favoriler',
    ];
    if (isAdmin) base.add('Referanslar');
    base.add('Vize');
    return base;
  }

  void changeTabIndex(int index) {
    currentIndex.value = index;
  }

  Widget getCurrentPage() {
    if (isAdmin) {
      // Admin için: 0=Home, 1=Search, 2=Favorites, 3=Referrals, 4=Visa
      switch (currentIndex.value) {
        case 0:
          return const HomeContent();
        case 1:
          return const SearchContent();
        case 2:
          return const FavoritesTab();
        case 3:
          return const ReferralsContent();
        case 4:
          return const VisaContent();
        default:
          return const HomeContent();
      }
    } else {
      // Normal kullanıcı için: 0=Home, 1=Search, 2=Favorites, 3=Visa
      switch (currentIndex.value) {
        case 0:
          return const HomeContent();
        case 1:
          return const SearchContent();
        case 2:
          return const FavoritesTab();
        case 3:
          return const VisaContent();
        default:
          return const HomeContent();
      }
    }
  }
}
