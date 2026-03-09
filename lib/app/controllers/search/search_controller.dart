import 'package:get/get.dart';

/// Arama sekmesi (otel, tur, transfer vb.) için controller.
/// Dışarıdan (ör. Favoriler ekranından) belirli bir sekmeye yönlendirme
/// ihtiyacı için [externalRequestedTab] alanı eklendi. Değer >=0 olduğunda
/// UI tarafındaki TabController bu değere animate edecek ve ardından -1'e
/// sıfırlayacak.
class SearchController extends GetxController {
  /// Mevcut seçili sekme (içeriden değişir)
  final selectedTabIndex = 0.obs;

  /// Dış kaynaklı yönlendirme isteği. -1 => yok.
  final externalRequestedTab = (-1).obs;

  void changeTab(int index) {
    selectedTabIndex.value = index;
  }

  /// Favoriler / başka modüller özelinde sekme değiştirme talebi.
  void requestExternalTab(int index) {
    if (index < 0) return;
    externalRequestedTab.value = index;
  }
}
