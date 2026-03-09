import 'dart:async';

import 'package:get/get.dart';

import '../../data/models/reservation/reservation_model.dart';
import '../../data/repositories/reservation/reservation_repository.dart';

class ReservationAdminController extends GetxController {
  final ReservationRepository _repo = ReservationRepository();

  final RxBool isLoading = false.obs;
  final RxList<ReservationModel> reservations = <ReservationModel>[].obs;
  final Rx<ReservationModel?> selected = Rx<ReservationModel?>(null);

  // Filtre durumları
  final Rx<ReservationType?> filterType = Rx<ReservationType?>(null); // null = hepsi
  final RxString filterStatus = ''.obs; // '' = hepsi
  final RxString searchQuery = ''.obs;

  StreamSubscription? _sub;

  @override
  void onInit() {
    super.onInit();
    listenAll();
  }

  @override
  void onClose() {
    _sub?.cancel();
    super.onClose();
  }

  void listenAll(){
    _sub?.cancel();
    _sub = _repo.streamAll().listen((list){
      reservations.assignAll(list);
    });
  }

  void setType(ReservationType? t){ filterType.value = t; }
  void setStatus(String s){ filterStatus.value = s; }
  void setSearch(String q){ searchQuery.value = q; }

  List<ReservationModel> get filtered {
    final q = searchQuery.value.toLowerCase();
    return reservations.where((r){
      if (filterType.value != null && r.type != filterType.value) return false;
      if (filterStatus.value.isNotEmpty && r.status != filterStatus.value) return false;
      if (q.isNotEmpty && !(r.title.toLowerCase().contains(q) || r.subtitle.toLowerCase().contains(q) || r.userId.toLowerCase().contains(q))) return false;
      return true;
    }).toList();
  }

  Future<void> updateStatus(ReservationModel r, String status) async {
    try {
      await _repo.updateStatus(r.id!, status);
    } catch (_) {}
  }

  void select(ReservationModel? r){ selected.value = r; }
}
