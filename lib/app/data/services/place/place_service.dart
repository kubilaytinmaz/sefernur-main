import 'package:get/get.dart';

import '../../enums/place_city.dart';
import '../../models/place/place_model.dart';
import '../../providers/firebase/firebase_api.dart';
import '../../repositories/place/place_repository.dart';
import '../auth/auth_service.dart';

class PlaceService extends GetxService {
  late PlaceRepository repository;
  final activePlaces = <PlaceModel>[].obs; // active only cache (all cities)
  final allPlaces = <PlaceModel>[].obs; // full cache (loaded on demand)
  final isLoading = false.obs;
  final isLoadingAll = false.obs;

  Future<PlaceService> init() async {
    repository = PlaceRepository(FirebaseApi());
    await fetchActive();
    return this;
  }

  Future<void> fetchActive({PlaceCity? city}) async {
    isLoading.value = true;
    final res = await repository.readPlaces(city: city, onlyActive: true).run();
    res.match((l){ activePlaces.value = []; }, (r){
      // replace entries for given city else merge
      if (city == null) {
        activePlaces.assignAll(r..sort((a,b)=> b.createdAt.compareTo(a.createdAt)));
      } else {
        final others = activePlaces.where((p) => p.city != city).toList();
        others.addAll(r);
        others.sort((a,b)=> b.createdAt.compareTo(a.createdAt));
        activePlaces.assignAll(others);
      }
    });
    isLoading.value = false;
  }

  Future<void> fetchAll({PlaceCity? city}) async {
    isLoadingAll.value = true;
    final res = await repository.readPlaces(city: city, onlyActive: false).run();
    res.match((l){ if (city==null) allPlaces.value=[]; }, (r){
      if (city == null) {
        allPlaces.assignAll(r..sort((a,b)=> b.createdAt.compareTo(a.createdAt)));
      } else {
        final others = allPlaces.where((p)=> p.city != city).toList();
        others.addAll(r);
        others.sort((a,b)=> b.createdAt.compareTo(a.createdAt));
        allPlaces.assignAll(others);
      }
    });
    isLoadingAll.value = false;
  }

  List<PlaceModel> activeByCity(PlaceCity city) => activePlaces.where((p)=> p.city == city && p.isActive).toList();
  List<PlaceModel> allByCity(PlaceCity city) => allPlaces.where((p)=> p.city == city).toList();

  Future<bool> addPlace({
    required String title,
    required String shortDescription,
    required String longDescription,
    required PlaceCity city,
    required List<String> images,
    bool isActive = true,
    String? locationUrl,
  }) async {
    final userId = Get.isRegistered<AuthService>() && Get.find<AuthService>().user.value.id != null
        ? Get.find<AuthService>().user.value.id!
        : 'anonymous';
    final model = PlaceModel(
      title: title,
      shortDescription: shortDescription,
      longDescription: longDescription,
      city: city,
      images: images,
      isActive: isActive,
      createdBy: userId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      locationUrl: locationUrl,
    );
    final res = await repository.create(model).run();
    return res.match((l)=> false, (id){
      if (model.isActive) {
        activePlaces.insert(0, model.copyWith(id: id));
      }
      if (allPlaces.isNotEmpty) {
        allPlaces.insert(0, model.copyWith(id: id));
      }
      return true;
    });
  }

  Future<bool> updatePlace(PlaceModel model, {
    String? title,
    String? shortDescription,
    String? longDescription,
    PlaceCity? city,
    List<String>? images,
    bool? isActive,
    String? locationUrl,
  }) async {
    if (model.id == null) return false;
    final updated = model.copyWith(
      title: title ?? model.title,
      shortDescription: shortDescription ?? model.shortDescription,
      longDescription: longDescription ?? model.longDescription,
      city: city ?? model.city,
      images: images ?? model.images,
      isActive: isActive ?? model.isActive,
      updatedAt: DateTime.now(),
      locationUrl: locationUrl ?? model.locationUrl,
    );
    final res = await repository.update(updated).run();
    return res.match((l)=> false, (r){
      // sync activePlaces
      final idx = activePlaces.indexWhere((p)=> p.id == updated.id);
      if (updated.isActive) {
        if (idx != -1) {
          activePlaces[idx] = updated; activePlaces.refresh();
        } else {
          activePlaces.insert(0, updated);
        }
      } else {
        if (idx != -1) activePlaces.removeAt(idx);
      }
      // sync allPlaces
      final aidx = allPlaces.indexWhere((p)=> p.id == updated.id);
      if (aidx != -1) { allPlaces[aidx] = updated; allPlaces.refresh(); }
      return true;
    });
  }
}
