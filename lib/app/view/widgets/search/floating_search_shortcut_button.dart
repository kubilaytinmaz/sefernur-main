import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../controllers/main/main_controller.dart';
import '../../../controllers/search/search_controller.dart' as sc;

/// Floating action button that jumps the user from a listing page
/// to the unified Search panel and selects the desired search tab.
/// searchTabIndex mapping (SearchContent pills):
/// 0=Hotels, 1=Tours, 2=Transfer, 3=Car, 4=Guide, 5=Flights (coming soon)
class FloatingSearchShortcutButton extends StatelessWidget {
  final int searchTabIndex;
  final String? label;
  final IconData icon;
  /// Whether to pop the current route after switching to the Search tab.
  /// Enabled by default so listing sayfasından çıkıp Search paneline dönülür.
  final bool popCurrent;
  const FloatingSearchShortcutButton({
    super.key,
    required this.searchTabIndex,
    this.label,
    this.icon = Icons.search,
    this.popCurrent = true,
  });

  Future<void> _go() async {
    final searchCtrl = Get.isRegistered<sc.SearchController>()
        ? Get.find<sc.SearchController>()
        : Get.put(sc.SearchController());
    // İlgili arama sekmesini iste
    searchCtrl.requestExternalTab(searchTabIndex);

    // Ana bottom bar'ı Search'e çek
    if (Get.isRegistered<MainController>()) {
      Get.find<MainController>().changeTabIndex(1);
    }

    // Mevcut sayfadan çık (listeleme -> search panel)
    if (popCurrent) {
      // Pop işlemini bir microtask'e koymak çakışmaları azaltır
      Future.microtask(() {
        if (Get.key.currentState?.canPop() ?? false) {
          Get.back();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      backgroundColor: Theme.of(context).colorScheme.primary,
      heroTag: 'fab_search_tab_$searchTabIndex',
      
      onPressed: _go,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(50),
      ),
      
      icon: Icon(
        icon,
        color: Colors.white,
        size: 20,
      ),
      label: Text(
        label ?? 'Detaylı Arama',
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
      ),
    );
  }
}
