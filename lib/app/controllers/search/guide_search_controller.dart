import 'package:get/get.dart';

import '../../data/models/address/address_model.dart';
import '../../data/models/guide/guide_model.dart';
import '../../data/repositories/guide/guide_repository.dart';

class GuideSearchController extends GetxController {
  final GuideRepository _repo = GuideRepository();

  // Form state
  final Rx<DateTime?> serviceDate = Rx<DateTime?>(DateTime.now());
  // Kullanıcının arama için seçtiği adres(ler)
  final RxList<AddressModel> selectedAddresses = <AddressModel>[].obs;
  // Eşleşme modu: tam (ülke+şehir+ilçe), şehir, ülke (daha esnek arama)
  final RxString addressMatchMode = 'full'.obs; // full | city | country

  // Loading / error
  final RxBool isSearching = false.obs;
  final RxString errorMessage = ''.obs;

  // Data
  final RxList<GuideModel> allGuides = <GuideModel>[].obs;
  final RxList<GuideModel> results = <GuideModel>[].obs; // raw search result (region/date)
  final RxList<GuideModel> filteredResults = <GuideModel>[].obs; // after filters

  // Filters
  final RxSet<String> selectedLanguages = <String>{}.obs;
  final RxSet<String> selectedSpecialties = <String>{}.obs;
  final RxSet<String> selectedCertifications = <String>{}.obs;
  final RxBool favoritesOnly = false.obs;
  // Popüler rehberler (admin işaretli) ilk 5
  final RxList<GuideModel> popularGuides = <GuideModel>[].obs;
  final RxDouble minRating = 0.0.obs;
  final RxString sortOption = 'price_asc'.obs; // price_asc | price_desc | rating_desc | experience_desc
  final RxInt minExperience = 0.obs;
  final RxDouble maxPriceFilter = double.infinity.obs; // dynamic upper limit
  bool _allLoadedOnce = false; // direct open flag
  double get minDailyRate => allGuides.isEmpty ? 0 : allGuides.map((g)=> g.dailyRate).reduce((a,b)=> a < b ? a : b);
  double get maxDailyRate => allGuides.isEmpty ? 0 : allGuides.map((g)=> g.dailyRate).reduce((a,b)=> a > b ? a : b);
  final RxSet<String> favoriteGuideIds = <String>{}.obs;

  // Derived sets (for chips)
  Set<String> get allLanguages => allGuides.expand((g) => g.languages).map((e)=> e.trim()).where((e)=> e.isNotEmpty).map((e)=> e.toLowerCase()).toSet();
  Set<String> get allSpecialties => allGuides.expand((g) => g.specialties).map((e)=> e.trim()).where((e)=> e.isNotEmpty).map((e)=> e.toLowerCase()).toSet();
  Set<String> get allCertifications => allGuides.expand((g) => g.certifications).map((e)=> e.trim()).where((e)=> e.isNotEmpty).map((e)=> e.toLowerCase()).toSet();
  Set<String> get allCompanies => allGuides.map((g)=> g.company??'').where((e)=> e.trim().isNotEmpty).map((e)=> e.trim()).toSet();

  bool get canSearch => serviceDate.value != null;

  void setDate(DateTime d) => serviceDate.value = d;
  void setAddressMatchMode(String mode){ addressMatchMode.value = mode; }
  void addSearchAddress(AddressModel a){ selectedAddresses.add(a); }
  void removeSearchAddress(int index){ selectedAddresses.removeAt(index); }
  void clearSearchAddresses(){ selectedAddresses.clear(); }

  // Artık popüler rehberler admin tarafından işaretlenmiş olanlardan seçiliyor
  Future<void> loadPopularGuides() async {
    try {
      final list = await _repo.getAll();
      final pops = list.where((g) => g.isPopular).toList();
      pops.sort((a,b){
        final r = b.rating.compareTo(a.rating);
        if (r != 0) return r;
        return a.name.toLowerCase().compareTo(b.name.toLowerCase());
      });
      popularGuides.assignAll(pops.take(5));
    } catch(_){/* sessiz */}
  }

  Future<void> search() async {
    if (!canSearch) return;
    try {
      isSearching.value = true;
      errorMessage.value = '';
      if (allGuides.isEmpty) {
        final list = await _repo.getAll();
        allGuides.assignAll(list);
      }
      // Base filter: region & availability
      final dateKey = _dateKey();
      List<GuideModel> base = List.of(allGuides);
      if (selectedAddresses.isNotEmpty){
        base = base.where((g){
          if (g.serviceAddresses.isEmpty) return false; // eğer rehber hiç adres tanımlamamışsa seçilmiş adres eşleşmeyecek
          return selectedAddresses.any((searchAddr){
            return g.serviceAddresses.any((sa){
              final saCountry = sa.country.trim().toLowerCase();
              final saCity = sa.city.trim().toLowerCase();
              final saState = sa.state.trim().toLowerCase();
              final saAddress = sa.address.trim().toLowerCase();
              final qCountry = searchAddr.country.trim().toLowerCase();
              final qCity = searchAddr.city.trim().toLowerCase();
              final qState = searchAddr.state.trim().toLowerCase();

              bool containsAny(String query) {
                if (query.isEmpty) return true;
                return saCountry.contains(query) ||
                    saCity.contains(query) ||
                    saState.contains(query) ||
                    saAddress.contains(query);
              }

              switch(addressMatchMode.value){
                case 'country':
                  return qCountry.isNotEmpty && containsAny(qCountry);
                case 'city':
                  return qCity.isNotEmpty && containsAny(qCity);
                case 'full':
                default:
                  final matchCountry = qCountry.isEmpty || containsAny(qCountry);
                  final matchCity = qCity.isEmpty || containsAny(qCity);
                  final matchState = qState.isEmpty || containsAny(qState);
                  return matchCountry && matchCity && matchState;
              }
            });
          });
        }).toList();
      }
      base = base.where((g){
        final av = g.availability[dateKey];
        return av == null || av.isAvailable; // if not defined treat as available
      }).toList();
      results.assignAll(base);
      _applyFilters();
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isSearching.value = false;
    }
  }

  String _dateKey() => serviceDate.value!.toIso8601String().split('T').first;

  // Filter actions
  void toggleLanguage(String lang){
    final l = lang.toLowerCase();
    if (selectedLanguages.contains(l)) { selectedLanguages.remove(l);} else { selectedLanguages.add(l);} _applyFilters();
  }
  void toggleSpecialty(String s){
    final sp = s.toLowerCase();
    if (selectedSpecialties.contains(sp)) { selectedSpecialties.remove(sp);} else { selectedSpecialties.add(sp);} _applyFilters();
  }
  void toggleCertification(String c){
    final cert = c.toLowerCase();
    if (selectedCertifications.contains(cert)) { selectedCertifications.remove(cert);} else { selectedCertifications.add(cert);} _applyFilters();
  }
  void toggleFavoritesOnly(){ favoritesOnly.toggle(); _applyFilters(); }
  
  void setMinRating(double v){ minRating.value = v; _applyFilters(); }
  void setSort(String opt){ sortOption.value = opt; _applyFilters(); }
  void setMinExperience(int v){ minExperience.value = v; _applyFilters(); }
  void setMaxPrice(double v){ maxPriceFilter.value = v; _applyFilters(); }
  void clearFilters(){ selectedLanguages.clear(); selectedSpecialties.clear(); selectedCertifications.clear(); favoritesOnly.value=false; minRating.value=0; sortOption.value='price_asc'; minExperience.value=0; maxPriceFilter.value=double.infinity; _applyFilters(); }
  void toggleFavorite(String id){ if (favoriteGuideIds.contains(id)) { favoriteGuideIds.remove(id);} else { favoriteGuideIds.add(id);} favoriteGuideIds.refresh(); if (favoritesOnly.value) _applyFilters(); }
  bool isFavorite(String? id)=> id!=null && favoriteGuideIds.contains(id);

  double rateFor(GuideModel g){
    if (serviceDate.value==null) return g.dailyRate;
    final av = g.availability[_dateKey()];
    return av?.specialRate ?? g.dailyRate;
  }

  void _applyFilters(){
    List<GuideModel> list = List.of(results);
    if (selectedLanguages.isNotEmpty){
      list = list.where((g)=> g.languages.map((e)=> e.toLowerCase()).toSet().any(selectedLanguages.contains)).toList();
    }
    if (selectedSpecialties.isNotEmpty){
      list = list.where((g)=> g.specialties.map((e)=> e.toLowerCase()).toSet().any(selectedSpecialties.contains)).toList();
    }
    if (selectedCertifications.isNotEmpty){
      list = list.where((g)=> g.certifications.map((e)=> e.toLowerCase()).toSet().any(selectedCertifications.contains)).toList();
    }
  if (favoritesOnly.value){ list = list.where((g)=> isFavorite(g.id)).toList(); }
    // Popüler filtre kaldırıldı – sadece gösterim listesi
    if (minRating.value>0){ list = list.where((g)=> g.rating >= minRating.value).toList(); }
    if (minExperience.value>0){ list = list.where((g)=> g.yearsExperience >= minExperience.value).toList(); }
    if (maxPriceFilter.value != double.infinity){ list = list.where((g)=> rateFor(g) <= maxPriceFilter.value).toList(); }

    switch (sortOption.value){
      case 'price_desc': list.sort((a,b)=> rateFor(b).compareTo(rateFor(a))); break;
      case 'rating_desc': list.sort((a,b)=> b.rating.compareTo(a.rating)); break;
      case 'experience_desc': list.sort((a,b)=> b.yearsExperience.compareTo(a.yearsExperience)); break;
      case 'price_asc':
      default: list.sort((a,b)=> rateFor(a).compareTo(rateFor(b))); break;
    }
    filteredResults.assignAll(list);
  }

  @override
  void onInit() {
    super.onInit();
    _loadInitial();
    loadPopularGuides();
  }

  bool get hasLoadedAll => _allLoadedOnce;

  Future<void> loadAllGuides() async {
    if (_allLoadedOnce || isSearching.value) return;
    try {
      isSearching.value = true;
      errorMessage.value = '';
      final list = await _repo.getAll();
      allGuides.assignAll(list);
      results.assignAll(list);
      _applyFilters();
      _allLoadedOnce = true;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isSearching.value = false;
    }
  }

  Future<void> _loadInitial() async {
    if (allGuides.isNotEmpty) return; // already loaded
    try {
      final list = await _repo.getAll();
      if (list.isNotEmpty) {
        allGuides.assignAll(list);
        // Trigger UI update for chips without performing search yet
        allGuides.refresh();
      }
    } catch (_) {
      // silent; specialties/languages just remain empty if fetch fails
    }
  }

  // Unified filter badge count for UI
  int activeFilterCount(){
    int c = 0;
    if (selectedLanguages.isNotEmpty) c++;
    if (selectedSpecialties.isNotEmpty) c++;
    if (selectedCertifications.isNotEmpty) c++;
    if (favoritesOnly.value) c++;
    if (minRating.value > 0) c++;
    if (minExperience.value > 0) c++;
    if (maxPriceFilter.value != double.infinity) c++;
    return c;
  }
}
