import 'dart:async';

import 'package:get/get.dart';

import '../../models/tour/tour_model.dart';
import '../../repositories/tour/tour_repository.dart';

class TourService extends GetxService {
  late TourRepository repository;
  final activeTours = <TourModel>[].obs; // only active tours
  final allTours = <TourModel>[].obs; // includes inactive (on demand)
  final isLoading = false.obs;
  final isLoadingAll = false.obs;
  StreamSubscription? _activeSub;

  Future<TourService> init() async {
    repository = TourRepository();
  await fetchActive(); // initial fetch
  _listenActive();
    return this;
  }

  Future<void> fetchActive() async {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final list = await repository.getAll();
      
      // Sadece aktif ve gelecek tarihli turları al
      final filtered = list.where((t) {
        if (!t.isActive) return false;
        // startDate varsa ve geçmişse gösterme
        if (t.startDate != null && t.startDate!.isBefore(today)) return false;
        return true;
      }).toList();
      
      // Yaklaşan tarihe göre sırala (en yakın tarih önce)
      filtered.sort((a, b) {
        final aDate = a.startDate ?? DateTime(2099, 12, 31);
        final bDate = b.startDate ?? DateTime(2099, 12, 31);
        return aDate.compareTo(bDate);
      });
      
      activeTours.assignAll(filtered);
    } finally { isLoading.value = false; }
  }

  Future<void> fetchAll() async {
    if (isLoadingAll.value) return;
    isLoadingAll.value = true;
    try {
      final list = await repository.getAll();
      allTours.assignAll(list..sort((a,b)=> b.createdAt.compareTo(a.createdAt)));
    } finally { isLoadingAll.value = false; }
  }

  List<TourModel> get effectiveAll => allTours.isNotEmpty ? allTours : activeTours; // fallback

  void _listenActive(){
    _activeSub?.cancel();
    _activeSub = repository.activeStream().listen((list){
      // Geçmiş tarihli turları filtrele ve sırala
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final filtered = list.where((t) {
        if (!t.isActive) return false;
        if (t.startDate != null && t.startDate!.isBefore(today)) return false;
        return true;
      }).toList();
      
      // Yakın tarihe göre sırala
      filtered.sort((a, b) {
        final aDate = a.startDate ?? DateTime(2099, 12, 31);
        final bDate = b.startDate ?? DateTime(2099, 12, 31);
        return aDate.compareTo(bDate);
      });
      
      activeTours.assignAll(filtered);
    });
  }

  @override
  void onClose(){
    _activeSub?.cancel();
    super.onClose();
  }
}
