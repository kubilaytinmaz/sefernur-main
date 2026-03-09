import 'dart:async';

import 'package:get/get.dart';

import '../../models/models.dart';
import '../../repositories/repository.dart';
import '../auth/auth_service.dart';

class ReservationService extends GetxService {
  late ReservationRepository _repository;
  final reservations = <ReservationModel>[].obs;
  final filtered = <ReservationModel>[].obs;
  final activeFilter = Rxn<ReservationType>(); // null = all
  final statusFilter = RxnString(); // null = all, values: active, cancelled, completed
  final isLoading = false.obs;
  final error = RxnString();
  StreamSubscription<List<ReservationModel>>? _subscription;

  // Allowed status transitions
  static const _transitions = <String, List<String>>{
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
  };

  Future<ReservationService> init() async {
    _repository = ReservationRepository();
    _bindAuthUser();
    return this;
  }

  void _bindAuthUser() {
    final auth = Get.find<AuthService>();
    ever(auth.user, (user) {
      final id = user.id;
      if (id != null && id.isNotEmpty) {
        _subscribeUser(id);
      } else {
        reservations.clear();
        filtered.clear();
      }
    });
  }

  void _subscribeUser(String userId) {
    _subscription?.cancel();
    _subscription = _repository.streamUserReservations(userId).listen((list) {
      // Optional: sort by startDate desc to be safe
      list.sort((a, b) => b.startDate.compareTo(a.startDate));
      reservations.assignAll(list);
      _applyFilter();
    });
  }

  void setFilter(ReservationType? type) {
    activeFilter.value = type;
    _applyFilter();
  }

  void setStatusFilter(String? statusKey) {
    statusFilter.value = statusKey;
    _applyFilter();
  }

  void _applyFilter() {
    Iterable<ReservationModel> list = reservations;
    final type = activeFilter.value;
    if (type != null) {
      list = list.where((r) => r.type == type);
    }
    final sf = statusFilter.value;
    if (sf != null) {
      switch (sf) {
        case 'active':
          list = list.where((r) => r.status == 'pending' || r.status == 'confirmed');
          break;
        case 'cancelled':
          list = list.where((r) => r.status == 'cancelled');
          break;
        case 'completed':
          list = list.where((r) => r.status == 'completed');
          break;
      }
    }
    filtered.assignAll(list);
  }

  Future<String> create(ReservationModel model) async {
    try {
      isLoading.value = true;
      error.value = null;
      // Local hızlı kontrol (stream verisi üzerinde)
      final conflictLocal = reservations.any((r) =>
          r.userId == model.userId &&
          r.type == model.type &&
          r.itemId == model.itemId &&
          (r.status == 'pending' || r.status == 'confirmed'));
      if (conflictLocal) {
        error.value = 'Bu hizmet için bekleyen/onaylı bir rezervasyonunuz zaten var.';
        throw Exception(error.value);
      }
      // Remote kesin kontrol (yarış durumları için)
      final remoteConflict = await _repository.hasActiveReservation(
        userId: model.userId,
        type: model.type,
        itemId: model.itemId,
      );
      if (remoteConflict) {
        error.value = 'Bu hizmet için bekleyen/onaylı bir rezervasyonunuz zaten var.';
        throw Exception(error.value);
      }
      final id = await _repository.create(model);
      return id;
    } catch (e) {
      error.value = 'Rezervasyon oluşturulamadı: $e';
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> update(String id, ReservationModel updated) async {
    try {
      isLoading.value = true; error.value = null;
      await _repository.update(id, updated);
    } catch (e) {
      error.value = 'Rezervasyon güncellenemedi: $e';
      rethrow;
    } finally { isLoading.value = false; }
  }

  Future<void> updatePartial(String id, Map<String, dynamic> fields) async {
    try { await _repository.updateFields(id, fields); } catch (e) { error.value = 'Alan güncelleme hatası: $e'; rethrow; }
  }

  Future<void> changeStatus(String id, String currentStatus, String newStatus) async {
    if (!_canTransition(currentStatus, newStatus)) {
      error.value = 'Geçersiz durum geçişi: $currentStatus -> $newStatus';
      return;
    }
    try { await _repository.updateStatus(id, newStatus); } catch (e) { error.value = 'Durum güncellenemedi: $e'; rethrow; }
  }

  bool _canTransition(String from, String to) => _transitions[from]?.contains(to) ?? false;

  Future<void> cancel(String id) async => changeStatus(id, 'pending', 'cancelled');

  Future<void> hardDelete(String id) async { try { await _repository.delete(id); } catch (e) { error.value='Silme hatası: $e'; rethrow; } }

  // Expose a live filtered stream (maps base subscription updates)
  Stream<List<ReservationModel>> filteredStream() {
    final controller = StreamController<List<ReservationModel>>.broadcast();
    void emit(){
      final filt = activeFilter.value;
      final base = reservations.toList();
      final out = filt == null ? base : base.where((r)=> r.type == filt).toList();
      controller.add(out);
    }
    final sub1 = reservations.listen((_) => emit());
    final sub2 = activeFilter.listen((_) => emit());
  final sub3 = statusFilter.listen((_) => emit());
  controller.onCancel = () { sub1.cancel(); sub2.cancel(); sub3.cancel(); };
    // initial emit
    emit();
    return controller.stream.distinct((prev, next) => _listEquals(prev, next));
  }

  bool _listEquals(List<ReservationModel> a, List<ReservationModel> b) {
    if (identical(a,b)) return true; if (a.length != b.length) return false; for (var i=0;i<a.length;i++){ if(a[i].id!=b[i].id || a[i].updatedAt!=b[i].updatedAt) return false; } return true; }

  ReservationModel? byId(String id) => reservations.firstWhereOrNull((r) => r.id == id);

  @override
  void onClose() {
    _subscription?.cancel();
    super.onClose();
  }
}
