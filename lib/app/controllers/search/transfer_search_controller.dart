import 'dart:async';

import 'package:get/get.dart';

import '../../data/models/transfer/transfer_model.dart';
import '../../data/repositories/transfer/transfer_repository.dart';
import '../../data/services/favorite/favorite_service.dart';
import '../../data/services/review/review_service.dart';
import '../address/address_controller.dart';

class TransferSearchController extends GetxController {
  final TransferRepository _repo = TransferRepository();
  StreamSubscription? _sub;

  // Address controller tags used by SelectLocationPage
  final String fromTag = 'transfer_from_search';
  final String toTag = 'transfer_to_search';
  late AddressController fromAddressController;
  late AddressController toAddressController;

  // Form state
  final Rx<DateTime?> travelDate = Rx<DateTime?>(DateTime.now());
  final RxInt passengers = 2.obs;

  // Result state
  final RxBool isSearching = false.obs;
  final RxList<TransferModel> results = <TransferModel>[].obs;
  final RxList<TransferModel> filteredResults = <TransferModel>[].obs;
  final RxString errorMessage = ''.obs;
  bool _allLoadedOnce = false; // direct load flag

  // Popular routes (computed from all transfers)
  final RxList<PopularRoute> popularRoutes = <PopularRoute>[].obs;
  final RxBool loadingPopular = false.obs;

  // Filters
  final RxSet<String> selectedVehicleTypes =
      <String>{}.obs; // sedan, van, bus, vip
  final RxBool favoritesOnly = false.obs;
  final RxBool viewingPopularOnly = false.obs;
  // Popüler transferler (admin işaretli) ilk 5
  final RxList<TransferModel> popularTransfers = <TransferModel>[].obs;
  final RxString sortOption =
      'price_asc'.obs; // price_asc | price_desc | duration_asc
  final RxSet<String> favoriteTransferIds = <String>{}.obs;
  FavoriteService? _favoriteService;
  ReviewService? _reviewService;
  final ratings = <String, RatingStat>{}.obs;
  // Dynamic range filter state
  final RxDouble priceMin = 0.0.obs;
  final RxDouble priceMax = 0.0.obs;
  final RxDouble selPriceMin = 0.0.obs;
  final RxDouble selPriceMax = 0.0.obs;
  final RxInt durationMin = 0.obs;
  final RxInt durationMax = 0.obs;
  final RxInt selDurationMin = 0.obs;
  final RxInt selDurationMax = 0.obs;
  final RxInt capacityMin = 0.obs;
  final RxInt capacityMax = 0.obs;
  final RxInt selCapacityMin = 0.obs;
  final RxInt selCapacityMax = 0.obs;
  final RxSet<String> companies = <String>{}.obs;
  final RxSet<String> selectedCompanies = <String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    fromAddressController = Get.isRegistered<AddressController>(tag: fromTag)
        ? Get.find<AddressController>(tag: fromTag)
        : Get.put(AddressController(), tag: fromTag);
    toAddressController = Get.isRegistered<AddressController>(tag: toTag)
        ? Get.find<AddressController>(tag: toTag)
        : Get.put(AddressController(), tag: toTag);
    _favoriteService = Get.isRegistered<FavoriteService>()
        ? Get.find<FavoriteService>()
        : null;
    _reviewService = Get.isRegistered<ReviewService>()
        ? Get.find<ReviewService>()
        : null;
    _loadPopularRoutes();
    loadPopularTransfers();
    // Realtime tüm transferleri dinle ve popüler listeyi güncel tut
    _sub = _repo.streamAll().listen((list){
      // popüler transferler güncelle
      final pops = list.where((t)=> t.isPopular).toList()
        ..sort((a,b){
          final r = b.rating.compareTo(a.rating);
          if (r != 0) return r;
          final an = '${a.company} ${a.fromShort} ${a.toShort}'.toLowerCase();
          final bn = '${b.company} ${b.fromShort} ${b.toShort}'.toLowerCase();
          return an.compareTo(bn);
        });
      popularTransfers.assignAll(pops.take(5));
    });
  }

  @override
  void onClose(){
    _sub?.cancel();
    super.onClose();
  }

  bool get canSearch =>
      fromAddressController.address.value.address.isNotEmpty &&
      toAddressController.address.value.address.isNotEmpty &&
      travelDate.value != null;

  String get fromShort => _short(fromAddressController);
  String get toShort => _short(toAddressController);

  String _short(AddressController c) {
    final addr = c.address.value;
    if (addr.address.isEmpty) return '';
    final parts = [
      addr.city,
      addr.state,
      addr.country,
    ].where((e) => e.toString().isNotEmpty).map((e) => e.toString()).toList();
    if (parts.isEmpty) return addr.address;
    return parts.join(', ');
  }

  void setDate(DateTime d) => travelDate.value = d;
  void incrementPassengers() => passengers.value++;
  void decrementPassengers() {
    if (passengers.value > 1) passengers.value--;
  }

  Future<void> search() async {
    if (!canSearch) return;
    try {
      isSearching.value = true;
      errorMessage.value = '';
      final dateStr = _fmt(travelDate.value!);
      // Sorgu oluştururken şehir > eyalet > ülke > tam adres önceliği
      String pick(AddressController c) {
        final a = c.address.value;
        if (a.city.isNotEmpty) return a.city;
        if (a.state.isNotEmpty) return a.state;
        if (a.country.isNotEmpty) return a.country;
        return a.address;
      }

      final list = await _repo.searchAvailable(
        date: dateStr,
        passengers: passengers.value,
        fromQuery: pick(fromAddressController),
        toQuery: pick(toAddressController),
        vehicleType: selectedVehicleTypes.length == 1
            ? selectedVehicleTypes.first
            : null,
      );
      results.assignAll(list);
      _computeDynamicFilters();
      _applyFilters();
      bindRatings();
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isSearching.value = false;
    }
  }

  bool get hasLoadedAll => _allLoadedOnce;

  // Load all transfers (for direct listing access without form)
  Future<void> loadAllTransfers() async {
    if (_allLoadedOnce || isSearching.value) return;
    try {
      isSearching.value = true;
      errorMessage.value = '';
      final all = await _repo.getAll();
      results.assignAll(all);
      _computeDynamicFilters();
      _applyFilters();
      bindRatings();
      _allLoadedOnce = true;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isSearching.value = false;
    }
  }

  String _fmt(DateTime d) => d.toIso8601String().split('T').first;

  // Filters API
  void toggleVehicleType(String v) {
    if (selectedVehicleTypes.contains(v)) {
      selectedVehicleTypes.remove(v);
    } else {
      selectedVehicleTypes.add(v);
    }
    _applyFilters();
  }

  void toggleFavoritesOnly() {
    favoritesOnly.toggle();
    _applyFilters();
  }
  Future<void> loadPopularTransfers() async {
    try {
      final list = await _repo.getAll();
      final pops = list.where((t) => t.isPopular).toList();
      pops.sort((a,b){
        final r = b.rating.compareTo(a.rating);
        if (r != 0) return r;
        final an = '${a.company} ${a.fromShort} ${a.toShort}'.toLowerCase();
        final bn = '${b.company} ${b.fromShort} ${b.toShort}'.toLowerCase();
        return an.compareTo(bn);
      });
      popularTransfers.assignAll(pops.take(5));
    } catch(_){ /* sessiz */ }
  }

  Future<void> showPopularOnly() async {
    viewingPopularOnly.value = true;
    if (popularTransfers.isEmpty) {
      await loadPopularTransfers();
    }
    results.assignAll(popularTransfers.toList());
    _computeDynamicFilters();
    _applyFilters();
  }

  Future<void> clearPopularOnly() async {
    if (!viewingPopularOnly.value) return;
    viewingPopularOnly.value = false;
    await loadAllTransfers();
  }

  void setSortOption(String option) {
    sortOption.value = option;
    _applyFilters();
  }

  void toggleFavorite(String id) {
    if (_favoriteService != null) {
      // Attempt to build lightweight meta for this transfer (title, etc.)
      TransferModel? t;
      try {
        t = results.firstWhere((e) => e.id == id);
      } catch (_) {}
      final meta = t != null
          ? _favoriteService!.buildMetaForEntity(type: 'transfer', model: t)
          : null;
      _favoriteService!.toggle(type: 'transfer', targetId: id, meta: meta);
    } else {
      if (favoriteTransferIds.contains(id)) {
        favoriteTransferIds.remove(id);
      } else {
        favoriteTransferIds.add(id);
      }
      favoriteTransferIds.refresh();
      if (favoritesOnly.value) _applyFilters();
    }
  }

  bool isFavorite(String? id) {
    if (id == null) return false;
    if (_favoriteService != null) {
      return _favoriteService!.isFavorite('transfer', id);
    }
    return favoriteTransferIds.contains(id);
  }

  void clearFilters() {
    selectedVehicleTypes.clear();
    favoritesOnly.value = false;
    sortOption.value = 'price_asc';
    selPriceMin.value = priceMin.value;
    selPriceMax.value = priceMax.value;
    selDurationMin.value = durationMin.value;
    selDurationMax.value = durationMax.value;
    selCapacityMin.value = capacityMin.value;
    selCapacityMax.value = capacityMax.value;
    selectedCompanies.clear();
    _applyFilters();
  }

  void setPriceRange(double start, double end) {
    selPriceMin.value = start;
    selPriceMax.value = end;
    _applyFilters();
  }

  void setDurationRange(int start, int end) {
    selDurationMin.value = start;
    selDurationMax.value = end;
    _applyFilters();
  }

  void setCapacityRange(int start, int end) {
    selCapacityMin.value = start;
    selCapacityMax.value = end;
    _applyFilters();
  }

  void toggleCompany(String c) {
    final lc = c.toLowerCase();
    if (selectedCompanies.contains(lc)) {
      selectedCompanies.remove(lc);
    } else {
      selectedCompanies.add(lc);
    }
    _applyFilters();
  }

  Future<void> _loadPopularRoutes() async {
    try {
      loadingPopular.value = true;
      final all = await _repo.getAll();
      if (all.isEmpty) {
        popularRoutes.clear();
        return;
      }
      final Map<String, _RouteAgg> map = {};
      for (final t in all) {
        final fromKey = t.fromShort;
        final toKey = t.toShort;
        final key = '$fromKey|||$toKey';
        final price = _priceOf(t);
        final agg = map.putIfAbsent(key, () => _RouteAgg(fromKey, toKey));
        agg.count++;
        agg.totalPrice += price;
        agg.avgDuration =
            ((agg.avgDuration * (agg.count - 1)) + t.durationMinutes) /
            agg.count;
        agg.sample ??= t; // keep a sample transfer
      }
      final list = map.values
          .where((a) => a.sample != null)
          .map(
            (a) => PopularRoute(
              fromShort: a.from,
              toShort: a.to,
              averagePrice: a.totalPrice / a.count,
              averageDurationMinutes: a.avgDuration.round(),
              example: a.sample!,
              frequency: a.count,
            ),
          )
          .toList();
      list.sort((a, b) => b.frequency.compareTo(a.frequency));
      popularRoutes.assignAll(list.take(8));
    } catch (e) {
      // ignore silently; could set errorMessage
    } finally {
      loadingPopular.value = false;
    }
  }

  // Apply a popular route to search form
  void applyPopularRoute(PopularRoute r) {
    // Set from
    final from = r.example.fromAddress;
    final to = r.example.toAddress;
    if (from.location != null) fromAddressController.setLatLng(from.location!);
    fromAddressController.setAddress(from);
    if (to.location != null) toAddressController.setLatLng(to.location!);
    toAddressController.setAddress(to);
    update();
  }

  void _applyFilters() {
    List<TransferModel> list = List.of(results);

    if (selectedVehicleTypes.isNotEmpty) {
      list = list
          .where(
            (t) => selectedVehicleTypes.contains(t.vehicleType.toLowerCase()),
          )
          .toList();
    }
    if (favoritesOnly.value) {
      list = list.where((t) => isFavorite(t.id)).toList();
    }
    // Popüler filtre kaldırıldı

    switch (sortOption.value) {
      case 'price_desc':
        list.sort((a, b) => _priceOf(b).compareTo(_priceOf(a)));
        break;
      case 'duration_asc':
        list.sort((a, b) => a.durationMinutes.compareTo(b.durationMinutes));
        break;
      case 'price_asc':
      default:
        list.sort((a, b) => _priceOf(a).compareTo(_priceOf(b)));
    }

    filteredResults.assignAll(list);
  }

  double _priceOf(TransferModel t) {
    if (travelDate.value == null) return t.basePrice;
    final key = _fmt(travelDate.value!);
    final a = t.availability[key];
    return a?.specialPrice ?? t.basePrice;
  }

  // Unified filter badge count for UI
  int activeFilterCount() {
    int c = 0;
    if (selectedVehicleTypes.isNotEmpty) c++;
    if (favoritesOnly.value) c++;
    // dynamic range filters considered active if boundaries differ
    if (selPriceMin.value > priceMin.value ||
        selPriceMax.value < priceMax.value) {
      c++;
    }
    if (selDurationMin.value > durationMin.value ||
        selDurationMax.value < durationMax.value) {
      c++;
    }
    if (selCapacityMin.value > capacityMin.value ||
        selCapacityMax.value < capacityMax.value) {
      c++;
    }
    if (selectedCompanies.isNotEmpty) c++;
    return c;
  }

  void _computeDynamicFilters() {
    if (results.isEmpty) {
      priceMin.value = priceMax.value = 0;
      durationMin.value = durationMax.value = 0;
      capacityMin.value = capacityMax.value = 0;
      companies.clear();
      return;
    }
    double pMin = double.infinity, pMax = 0;
    int dMin = 1 << 30, dMax = 0;
    int cMin = 1 << 30, cMax = 0;
    final comp = <String>{};
    for (final t in results) {
      final p = _priceOf(t);
      if (p < pMin) pMin = p;
      if (p > pMax) pMax = p;
      if (t.durationMinutes < dMin) dMin = t.durationMinutes;
      if (t.durationMinutes > dMax) dMax = t.durationMinutes;
      if (t.capacity < cMin) cMin = t.capacity;
      if (t.capacity > cMax) cMax = t.capacity;
      if (t.company.isNotEmpty) comp.add(t.company.toLowerCase());
    }
    priceMin.value = pMin.isFinite ? pMin : 0;
    priceMax.value = pMax;
    selPriceMin.value = priceMin.value;
    selPriceMax.value = priceMax.value;
    durationMin.value = dMin == (1 << 30) ? 0 : dMin;
    durationMax.value = dMax;
    selDurationMin.value = durationMin.value;
    selDurationMax.value = durationMax.value;
    capacityMin.value = cMin == (1 << 30) ? 0 : cMin;
    capacityMax.value = cMax;
    selCapacityMin.value = capacityMin.value;
    selCapacityMax.value = capacityMax.value;
    companies.assignAll(comp);
  }

  // Kısa adres artık model üzerinden sağlanıyor (AddressModel.short)
}

class RatingStat {
  final double average;
  final int count;
  RatingStat(this.average, this.count);
}

extension RatingBinding on TransferSearchController {
  void bindRatings() {
    if (_reviewService == null) return;
    for (final t in results) {
      if (t.id == null) continue;
      if (ratings.containsKey(t.id)) continue;
      _reviewService!.reviewsFor('transfer', t.id!).listen((list) {
        if (list.isEmpty) {
          ratings.remove(t.id);
        } else {
          final total = list.fold<double>(
            0,
            (p, e) =>
                p + (double.tryParse(e['rating']?.toString() ?? '0') ?? 0),
          );
          ratings[t.id!] = RatingStat(total / list.length, list.length);
        }
        ratings.refresh();
      });
    }
  }
}

class PopularRoute {
  final String fromShort;
  final String toShort;
  final double averagePrice;
  final int averageDurationMinutes;
  final TransferModel example;
  final int frequency;
  PopularRoute({
    required this.fromShort,
    required this.toShort,
    required this.averagePrice,
    required this.averageDurationMinutes,
    required this.example,
    required this.frequency,
  });
}

class _RouteAgg {
  final String from;
  final String to;
  int count = 0;
  double totalPrice = 0;
  double avgDuration = 0; // running average
  TransferModel? sample;
  _RouteAgg(this.from, this.to);
}
