import 'package:firebase_storage/firebase_storage.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../data/models/models.dart';
import '../../data/repositories/repository.dart';

class CarAdminController extends GetxController {
  final CarRepository _repo = CarRepository();
  final FirebaseStorage _storage = FirebaseStorage.instance;

  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxList<CarModel> cars = <CarModel>[].obs;
  final Rx<CarModel?> selectedCar = Rx<CarModel?>(null);

  @override
  void onInit() {
    super.onInit();
    loadCars();
  }

  Future<void> loadCars() async {
    try {
      isLoading.value = true;
      cars.value = await _repo.getAllCars();
    } finally {
      isLoading.value = false;
    }
  }

  void selectCar(CarModel? car) {
    selectedCar.value = car;
  }

  Future<void> saveCar(CarModel car) async {
    isSaving.value = true;
    try {
      if (car.id == null) {
        await _repo.addCar(car);
      } else {
        await _repo.updateCar(car);
      }
      await loadCars();
    } finally {
      isSaving.value = false;
    }
  }

  Future<void> deleteCar(String id) async {
    await _repo.deleteCar(id);
    await loadCars();
  }

  Future<void> updateAvailability(String id, String date, CarDailyAvailability a) async {
    await _repo.updateCarAvailability(id, date, a);
    // Optimistic local update
    final index = cars.indexWhere((c) => c.id == id);
    if (index != -1) {
      final current = cars[index];
      final newMap = Map<String, CarDailyAvailability>.from(current.availability);
      newMap[date] = a;
      cars[index] = current.copyWith(
        availability: newMap,
        updatedAt: DateTime.now(),
      );
    }
  }

  Future<void> updateAvailabilityBulk(String id, Map<String, CarDailyAvailability> map) async {
    await _repo.updateCarAvailabilityBulk(id, map);
    final index = cars.indexWhere((c) => c.id == id);
    if (index != -1) {
      final current = cars[index];
      final newMap = Map<String, CarDailyAvailability>.from(current.availability);
      map.forEach((k, v) => newMap[k] = v);
      cars[index] = current.copyWith(
        availability: newMap,
        updatedAt: DateTime.now(),
      );
    }
  }

  // Upload local images to Firebase Storage, return download URLs
  Future<List<String>> uploadImages(List<XFile> images) async {
    final urls = <String>[];
    for (final img in images) {
      try {
        // Read as bytes to avoid File IO issues across platforms
        final data = await img.readAsBytes();
        final safeName = img.name.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
        final fileName = '${DateTime.now().millisecondsSinceEpoch}_$safeName';
        final ref = _storage.ref().child('cars/uploads/$fileName');
        final metadata = SettableMetadata(contentType: _inferContentType(img.path));
        await ref.putData(data, metadata);
        final url = await ref.getDownloadURL();
        urls.add(url);
      } on FirebaseException catch (e) {
        // Bubble up with context so UI can display a friendly message
        throw Exception('Firebase Storage hatası (${e.code}): ${e.message ?? e.toString()}');
      } catch (e) {
        throw Exception('Görüntü yükleme başarısız: ${e.toString()}');
      }
    }
    return urls;
  }

  String _inferContentType(String path) {
    final lower = path.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.heic')) return 'image/heic';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
  }
}
