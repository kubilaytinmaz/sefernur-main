import 'package:get/get.dart';

import '../../data/models/car/car_model.dart';
import '../../data/repositories/car/car_repository.dart';
import '../address/address_controller.dart';

class CarSearchController extends GetxController {
  final CarRepository _repo = CarRepository();

  // Address handling (shared with SelectLocationPage via tag)
  final String addressTag = 'car_search_address';
  late AddressController addressController;

  // Form state
  final Rx<DateTime?> pickupDate = Rx<DateTime?>(DateTime.now());
  final Rx<DateTime?> dropoffDate = Rx<DateTime?>(DateTime.now().add(const Duration(days: 1)));
  final RxInt passengers = 2.obs;
  // Time slots (HH:mm) based on CarDailyAvailability.standardSlots()
  final RxString pickupTimeSlot = '10:00'.obs;
  final RxString dropoffTimeSlot = '10:00'.obs;
  final RxBool isMonthly = false.obs; // trip type toggle
  final RxBool differentReturnLocation = false.obs;

  // Result state
  final RxBool isSearching = false.obs;
  final RxList<CarModel> results = <CarModel>[].obs;
  final RxList<CarModel> filteredResults = <CarModel>[].obs;
  final RxString errorMessage = ''.obs;

  // Filters
  final RxSet<String> selectedTransmissions = <String>{}.obs; // manual, automatic
  final RxSet<String> selectedFuels = <String>{}.obs; // petrol, diesel, hybrid, electric
  final RxSet<String> selectedTypes = <String>{}.obs; // economy, suv, premium
  final RxBool favoritesOnly = false.obs;
  // Admin işaretli popüler araçlardan ilk 5
  final RxList<CarModel> popularCars = <CarModel>[] .obs;
  final RxString sortOption = 'rating_desc'.obs; // rating_desc | price_asc | price_desc
  final RxSet<String> favoriteCarIds = <String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    addressController = Get.isRegistered<AddressController>(tag: addressTag)
        ? Get.find<AddressController>(tag: addressTag)
        : Get.put(AddressController(), tag: addressTag);
    _loadPopularCars();
  }

  // Form interactions
  void setPickupDate(DateTime d) {
    pickupDate.value = d;
    if (isMonthly.value) {
      dropoffDate.value = d.add(const Duration(days: 30));
    } else if (dropoffDate.value != null && !dropoffDate.value!.isAfter(d)) {
      dropoffDate.value = d.add(const Duration(days: 1));
    }
  }

  void setDropoffDate(DateTime d) {
    if (pickupDate.value == null) {
      pickupDate.value = d;
      dropoffDate.value = d.add(const Duration(days: 1));
      return;
    }
    if (d.isAfter(pickupDate.value!)) {
      dropoffDate.value = d;
    }
  }

  void toggleMonthly(bool v) {
    isMonthly.value = v;
    if (v && pickupDate.value != null) {
      dropoffDate.value = pickupDate.value!.add(const Duration(days: 30));
    }
  }

  void incrementPassengers() => passengers.value++;
  void decrementPassengers() { if (passengers.value > 1) passengers.value--; }

  // Derived
  bool get canSearch => addressController.address.value.address.isNotEmpty && pickupDate.value != null && dropoffDate.value != null;

  String get shortAddressDisplay {
    final addr = addressController.address.value;
    if (addr.address.isEmpty) return 'Nereden?';
    final parts = [addr.city, addr.state, addr.country]
        .where((e) => e.toString().isNotEmpty)
        .map((e) => e.toString())
        .toList();
    if (parts.isEmpty) return addr.address;
    return parts.join(', ');
  }

  Future<void> search() async {
    if (!canSearch) return;
    try {
      isSearching.value = true;
      errorMessage.value = '';
      final pu = pickupDate.value!;
      final dr = dropoffDate.value!;
      final pickupStr = _fmt(pu);
      final dropoffStr = _fmt(dr);
      final list = await _repo.getAvailableCars(
        pickupDate: pickupStr,
        dropoffDate: dropoffStr,
        passengers: passengers.value,
  pickupTimeSlot: pickupTimeSlot.value,
      );
      // AddressModel filtreleme: seçilen şehir / eyalet / ülke adres controller'dan alınır
      final selAddr = addressController.address.value;
      List<CarModel> filtered = list;
      bool matchCarAddress(CarModel car) {
        final city = car.addressModel.city.trim().toLowerCase();
        final state = car.addressModel.state.trim().toLowerCase();
        final country = car.addressModel.country.trim().toLowerCase();
        final full = car.addressModel.address.trim().toLowerCase();

        if (selAddr.city.trim().isNotEmpty) {
          final q = selAddr.city.trim().toLowerCase();
          final hasStructured = city.isNotEmpty || state.isNotEmpty || country.isNotEmpty;
          if (!hasStructured) return true;
          return city.contains(q) || state.contains(q) || full.contains(q);
        }

        if (selAddr.state.trim().isNotEmpty) {
          final q = selAddr.state.trim().toLowerCase();
          final hasStructured = city.isNotEmpty || state.isNotEmpty || country.isNotEmpty;
          if (!hasStructured) return true;
          return state.contains(q) || city.contains(q) || full.contains(q);
        }

        if (selAddr.country.trim().isNotEmpty) {
          final q = selAddr.country.trim().toLowerCase();
          if (country.isEmpty) return true;
          return country.contains(q) || full.contains(q);
        }

        return true;
      }

      filtered = filtered.where(matchCarAddress).toList();
      results.assignAll(filtered);
      _applyFilters();
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isSearching.value = false;
    }
  }

  String _fmt(DateTime d) => d.toIso8601String().split('T').first;

  // Filters API
  void toggleTransmission(String t) {
    if (selectedTransmissions.contains(t)) {
      selectedTransmissions.remove(t);
    } else {
      selectedTransmissions.add(t);
    }
    _applyFilters();
  }

  void toggleFuel(String f) {
    if (selectedFuels.contains(f)) {
      selectedFuels.remove(f);
    } else {
      selectedFuels.add(f);
    }
    _applyFilters();
  }

  void toggleType(String t) {
    if (selectedTypes.contains(t)) {
      selectedTypes.remove(t);
    } else {
      selectedTypes.add(t);
    }
    _applyFilters();
  }

  void setSortOption(String option) {
    sortOption.value = option;
    _applyFilters();
  }

  void toggleFavoritesOnly() {
    favoritesOnly.toggle();
    _applyFilters();
  }
  Future<void> _loadPopularCars() async {
    try {
      final list = await _repo.getAvailableCars(
        pickupDate: _fmt(pickupDate.value ?? DateTime.now()),
        dropoffDate: _fmt(dropoffDate.value ?? DateTime.now().add(const Duration(days:1))),
        passengers: passengers.value,
        pickupTimeSlot: pickupTimeSlot.value,
      );
      final pops = list.where((c) => c.isPopular).toList();
      pops.sort((a,b){
        final r = b.rating.compareTo(a.rating);
        if (r != 0) return r;
        final an = '${a.brand} ${a.model}'.trim().toLowerCase();
        final bn = '${b.brand} ${b.model}'.trim().toLowerCase();
        return an.compareTo(bn);
      });
      popularCars.assignAll(pops.take(5));
    } catch(_){/* sessiz */}
  }

  void toggleFavorite(String carId) {
    if (favoriteCarIds.contains(carId)) {
      favoriteCarIds.remove(carId);
    } else {
      favoriteCarIds.add(carId);
    }
    favoriteCarIds.refresh();
    if (favoritesOnly.value) _applyFilters();
  }

  bool isFavorite(String? carId) => carId != null && favoriteCarIds.contains(carId);

  void clearFilters() {
    selectedTransmissions.clear();
    selectedFuels.clear();
    selectedTypes.clear();
    favoritesOnly.value = false;
    sortOption.value = 'rating_desc';
    _applyFilters();
  }

  void _applyFilters() {
    List<CarModel> list = List.of(results);

    if (selectedTransmissions.isNotEmpty) {
      list = list.where((c) => selectedTransmissions.contains(c.transmission.toLowerCase())).toList();
    }
    if (selectedFuels.isNotEmpty) {
      list = list.where((c) => selectedFuels.contains(c.fuelType.toLowerCase())).toList();
    }
    if (selectedTypes.isNotEmpty) {
      list = list.where((c) => selectedTypes.contains(c.type.toLowerCase())).toList();
    }
    if (favoritesOnly.value) {
      list = list.where((c) => isFavorite(c.id)).toList();
    }
    // Popüler filtre opsiyonu kaldırıldı – sadece gösterim için tutuluyor

    switch (sortOption.value) {
      case 'price_asc':
        list.sort((a,b) => _priceOf(a).compareTo(_priceOf(b)));
        break;
      case 'price_desc':
        list.sort((a,b) => _priceOf(b).compareTo(_priceOf(a)));
        break;
      case 'rating_desc':
      default:
        list.sort((a,b) => b.rating.compareTo(a.rating));
    }

    filteredResults.assignAll(list);
  }

  double _priceOf(CarModel c) => c.discountedDailyPrice ?? c.dailyPrice;
}
