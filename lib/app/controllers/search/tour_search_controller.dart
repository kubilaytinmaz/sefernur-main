import 'dart:async';

import 'package:get/get.dart';

import '../../data/models/address/address_model.dart';
import '../../data/models/tour/tour_model.dart';
import '../../data/repositories/tour/tour_repository.dart';

class TourSearchController extends GetxController {
  final TourRepository _repo = TourRepository();
  StreamSubscription? _tourSub;

  @override
  void onInit() {
    super.onInit();
    loadPopularTours();
    // Realtime dinleme: popüler işaretlemeler ve genel liste güncellensin
    _tourSub = _repo.streamAll().listen((list){
      allTours.assignAll(list);
      // Popüler listesi güncelle
      final pops = list.where((t)=> (t as dynamic).isPopular == true).toList()
        ..sort((a,b){ final r = b.rating.compareTo(a.rating); return r!=0? r : a.title.compareTo(b.title); });
      popularTours.assignAll(pops.take(5));
      // Eğer kullanıcı arama yaptıysa filtreleri tekrar uygula
      if (results.isNotEmpty) {
        // results mevcutsa id bazlı refresh (tamamen yeniden sırala)
        results.assignAll(_prioritizeNearestFuture(results));
        _applyFilters();
      }
    });
  }

  @override
  void onClose(){
    _tourSub?.cancel();
    super.onClose();
  }

  // Form state
  final Rx<DateTime?> travelDate = Rx<DateTime?>(DateTime.now());
  final RxInt adults = 2.obs;
  final RxInt children = 0.obs;
  // Seçilen bölge adresleri (şehir/ülke). Eski text query yerine kullanılıyor.
  final RxList<AddressModel> selectedRegionAddresses = <AddressModel>[].obs;

  // Data
  final RxBool isSearching = false.obs;
  final RxString errorMessage = ''.obs;
  final RxList<TourModel> allTours = <TourModel>[].obs;
  final RxList<TourModel> results = <TourModel>[].obs; // base search result
  final RxList<TourModel> filteredResults = <TourModel>[].obs; // after filters
  // Catalog preload state (kategoriler/etiketler ve popüler turlar için)
  final RxBool loadingCatalog = false.obs;

  // Filters
  final RxSet<String> selectedCategories = <String>{}.obs;
  final RxSet<String> selectedTags = <String>{}.obs;
  final RxBool favoritesOnly = false.obs;
  // Popüler turlar (admin işaretli) ilk 5
  final RxList<TourModel> popularTours = <TourModel>[].obs;
  final RxDouble minRating = 0.0.obs;
  final RxString sortOption = 'date_asc'.obs; // date_asc | price_asc | price_desc | rating_desc | duration_asc
  final RxSet<String> favoriteTourIds = <String>{}.obs;
  final RxInt maxDuration = 0.obs; // 0 means no limit
  bool _allLoadedOnce = false; // direct list load flag
  final RxBool viewingPopularOnly = false.obs;

  // Arama butonunun aktif olma koşulu: tarih seçili + en az 1 yetişkin + en az 1 bölge adresi
  // Bölge seçimi artık zorunlu değil (sadece tarih + en az 1 yetişkin yeterli)
  bool get canSearch => travelDate.value != null && adults.value > 0; // && selectedRegionAddresses.isNotEmpty (gevşetildi)

  // Derived sets for filters
  Set<String> get allCategories => allTours.map((t) => t.category.trim()).where((e) => e.isNotEmpty).map((e)=> e.toLowerCase()).toSet();
  Set<String> get allTags => allTours.expand((t) => t.tags).map((e)=> e.trim()).where((e)=> e.isNotEmpty).map((e)=> e.toLowerCase()).toSet();

  void setDate(DateTime d) => travelDate.value = d;
  // Bölge adres yönetimi
  void addRegionAddress(AddressModel a){ selectedRegionAddresses.add(a); search(); }
  void removeRegionAddressAt(int i){ if (i>=0 && i<selectedRegionAddresses.length){ selectedRegionAddresses.removeAt(i); search(); } }
  void clearRegionAddresses(){ selectedRegionAddresses.clear(); search(); }
  void incAdults() => adults.value++;
  void decAdults() { if (adults.value > 1) adults.value--; }
  void incChildren() => children.value++;
  void decChildren() { if (children.value > 0) children.value--; }

  Future<void> search() async {
    if (!canSearch) return;
    try {
      isSearching.value = true;
      errorMessage.value = '';
      if (allTours.isEmpty) {
        final list = await _repo.getAll();
        allTours.assignAll(list);
      }
      final dateKey = _dateKey();
      List<TourModel> base = List.of(allTours);
      // Bölge adres filtreleme: seçilen adres yoksa tümü, varsa şehir/ülke eşleşmesi arar
      if (selectedRegionAddresses.isNotEmpty){
        base = base.where((t){
          final tourAddrs = t.serviceAddresses;
          if (tourAddrs.isEmpty) return false; // adres tanımsız turları ele
          return selectedRegionAddresses.any((sel){
            final sc = sel.city.toLowerCase();
            final scountry = sel.country.toLowerCase();
            return tourAddrs.any((ta){
              final tc = ta.city.toLowerCase();
              final tcountry = ta.country.toLowerCase();
              if (sc.isNotEmpty && tc.isNotEmpty){ if (tc == sc) return true; }
              if (scountry.isNotEmpty && tcountry.isNotEmpty){ if (tcountry == scountry) return true; }
              return false;
            });
          });
        }).toList();
      }
      // Availability & capacity check
      final pax = adults.value + children.value;
      base = base.where((t){
        final av = t.availability[dateKey];
        if (av == null) return true; // if not defined treat as available
        if (!av.isAvailable) return false;
        final capLeft = av.capacity - (av.sold ?? 0);
        return capLeft >= pax;
      }).toList();
      results.assignAll(_prioritizeNearestFuture(base));
      _applyFilters();
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isSearching.value = false;
    }
  }

  String _dateKey() => travelDate.value!.toIso8601String().split('T').first;

  // Filters actions
  void toggleCategory(String c){ final v = c.toLowerCase(); if (selectedCategories.contains(v)) { selectedCategories.remove(v); } else { selectedCategories.add(v); } _applyFilters(); }
  void toggleTag(String t){ final v = t.toLowerCase(); if (selectedTags.contains(v)) { selectedTags.remove(v); } else { selectedTags.add(v); } _applyFilters(); }
  void toggleFavoritesOnly(){ favoritesOnly.toggle(); _applyFilters(); }
  Future<void> loadPopularTours() async {
    try {
      final list = await _repo.getAll();
      final pops = list.where((t) => (t as dynamic).isPopular == true).toList();
      pops.sort((a,b){ final r = b.rating.compareTo(a.rating); return r!=0? r : a.title.compareTo(b.title); });
      popularTours.assignAll(pops.take(5));
      // Popülerler çekildiyse skeleton gerekmez
      if (loadingCatalog.value) loadingCatalog.value = false;
    } catch(_){/* sessiz */}
  }
  void setMinRating(double v){ minRating.value = v; _applyFilters(); }
  void setSort(String s){ sortOption.value = s; _applyFilters(); }
  void setMaxDuration(int v){ maxDuration.value = v; _applyFilters(); }
  void clearFilters(){ selectedCategories.clear(); selectedTags.clear(); favoritesOnly.value=false; minRating.value=0; sortOption.value='date_asc'; maxDuration.value=0; _applyFilters(); }
  void showPopularOnly(){
    viewingPopularOnly.value = true;
    // Sadece popularTours listesini sonuçlara yansıt
    results.assignAll(popularTours);
    _applyFilters();
  }
  void clearPopularOnly(){ if (viewingPopularOnly.value){ viewingPopularOnly.value=false; search(); } }
  void toggleFavorite(String id){ if (favoriteTourIds.contains(id)) { favoriteTourIds.remove(id); } else { favoriteTourIds.add(id); } favoriteTourIds.refresh(); if (favoritesOnly.value) _applyFilters(); }
  bool isFavorite(String? id)=> id!=null && favoriteTourIds.contains(id);

  double priceFor(TourModel t){ if (travelDate.value==null) return t.basePrice; final av = t.availability[_dateKey()]; return av?.specialPrice ?? t.basePrice; }

  void _applyFilters(){
    List<TourModel> list = List.of(results);
    
    // Geçmiş tarihleri filtrele (bugünden önceki turları kaldır)
    final today = DateTime.now();
    final todayDate = DateTime(today.year, today.month, today.day);
    list = list.where((t) {
      // startDate varsa ona göre kontrol et
      if (t.startDate != null) {
        return !t.startDate!.isBefore(todayDate);
      }
      // Availability varsa en yakın tarihe göre kontrol et
      if (t.availability.isNotEmpty) {
        final keys = t.availability.keys.toList();
        keys.sort();
        for (final k in keys) {
          try {
            final d = DateTime.parse(k);
            if (!d.isBefore(todayDate)) {
              final av = t.availability[k];
              if (av != null && av.isAvailable) return true;
            }
          } catch (_) {}
        }
        return false; // Tüm availabilityler geçmişte
      }
      // Ne startDate ne availability varsa göster
      return true;
    }).toList();
    
    if (selectedCategories.isNotEmpty){ list = list.where((t)=> selectedCategories.contains(t.category.toLowerCase())).toList(); }
    if (selectedTags.isNotEmpty){ list = list.where((t)=> t.tags.map((e)=> e.toLowerCase()).toSet().any(selectedTags.contains)).toList(); }
  if (favoritesOnly.value){ list = list.where((t)=> isFavorite(t.id)).toList(); }
  // Popüler filtre kaldırıldı (artık sadece gösterim listesi var)
    if (minRating.value>0){ list = list.where((t)=> t.rating >= minRating.value).toList(); }
    if (maxDuration.value>0){ list = list.where((t)=> t.durationDays <= maxDuration.value).toList(); }

    switch (sortOption.value){
      case 'price_asc': list.sort((a,b)=> priceFor(a).compareTo(priceFor(b))); break;
      case 'price_desc': list.sort((a,b)=> priceFor(b).compareTo(priceFor(a))); break;
      case 'rating_desc': list.sort((a,b)=> b.rating.compareTo(a.rating)); break;
      case 'duration_asc': list.sort((a,b)=> a.durationDays.compareTo(b.durationDays)); break;
      case 'date_asc':
      default: // Tarihe göre sırala (varsayılan)
        list = _prioritizeNearestFuture(list);
        break;
    }

    // Yakın gelecek önceliklendirmesi filtre sonrası da korunsun
    filteredResults.assignAll(_prioritizeNearestFuture(list));
  }

  // İlk yüklemede tüm turları getirip kategoriler/etiketler ve popüler listeyi hazırlar
  Future<void> preload() async {
    if (allTours.isNotEmpty || loadingCatalog.value) return;
    try {
      loadingCatalog.value = true;
      final list = await _repo.getAll();
      allTours.assignAll(list);
      // Popülerleri (isPopular) buradan da türet (onInit içindeki çağrıya ek, ikinci sorguyu gereksiz kılar)
      if (popularTours.isEmpty) {
        final pops = list.where((t)=> (t as dynamic).isPopular == true).toList()
          ..sort((a,b){ final r = b.rating.compareTo(a.rating); return r!=0? r : a.title.compareTo(b.title); });
        popularTours.assignAll(pops.take(5));
      }
      // Preload sonrası mevcut tarih & pax uygun ise otomatik temel sonuç listesi atanabilir
      results.assignAll(list);
      _applyFilters();
    } catch (_) {} finally { loadingCatalog.value = false; }
  }

  bool get hasLoadedAll => _allLoadedOnce;

  Future<void> loadAllTours() async {
    if (_allLoadedOnce || isSearching.value) return;
    try {
      isSearching.value = true;
      errorMessage.value = '';
      final list = await _repo.getAll();
      
      // Geçmiş tarihli turları filtrele
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final filtered = list.where((t) {
        if (!t.isActive) return false;
        // startDate varsa ve geçmişse gösterme
        if (t.startDate != null && t.startDate!.isBefore(today)) return false;
        return true;
      }).toList();
      
      allTours.assignAll(filtered);
      results.assignAll(_prioritizeNearestFuture(filtered));
      _applyFilters();
      _allLoadedOnce = true;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isSearching.value = false;
    }
  }

  // Unified filter badge count for UI
  int activeFilterCount(){
    int c = 0;
    if (selectedCategories.isNotEmpty) c++;
    if (selectedTags.isNotEmpty) c++;
  if (favoritesOnly.value) c++;
    if (minRating.value > 0) c++;
    if (maxDuration.value > 0) c++;
    return c;
  }

  /// Seçili tarihten (travelDate) sonra uygunluk tanımlı en yakın availability
  /// gününe sahip turları listenin başına çeker, diğerlerini kronolojik sıraya göre takip ettirir.
  List<TourModel> _prioritizeNearestFuture(List<TourModel> input){
    if (travelDate.value == null || input.isEmpty) return input;
    final selected = travelDate.value!;
    // Her tur için seçilen tarihten >= olan ilk availability gününü bul
    DateTime? firstFutureDateFor(TourModel t){
      if (t.availability.isEmpty) return null;
      final keys = t.availability.keys.toList();
      keys.sort();
      for (final k in keys){
        try {
          final d = DateTime.parse(k);
          if (!d.isBefore(selected)) {
            final av = t.availability[k];
            if (av != null && av.isAvailable) return d;
          }
        } catch(_){ /* ignore parse */ }
      }
      return null;
    }
    final withFuture = <(TourModel,DateTime)>[];
    final withoutFuture = <TourModel>[];
    for (final t in input){
      final d = firstFutureDateFor(t);
      if (d != null){
        withFuture.add((t,d));
      } else {
        withoutFuture.add(t);
      }
    }
    withFuture.sort((a,b)=> a.$2.compareTo(b.$2));
    return [for (final e in withFuture) e.$1, ...withoutFuture];
  }
}
