import 'package:firebase_storage/firebase_storage.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../data/models/tour/tour_model.dart';
import '../../data/repositories/tour/tour_repository.dart';

class TourAdminController extends GetxController {
  final TourRepository _repo = TourRepository();
  final FirebaseStorage _storage = FirebaseStorage.instance;

  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxList<TourModel> tours = <TourModel>[].obs;
  final Rx<TourModel?> selected = Rx<TourModel?>(null);

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    try {
      isLoading.value = true;
      tours.value = await _repo.getAll();
    } finally {
      isLoading.value = false;
    }
  }

  void select(TourModel? t) => selected.value = t;

  Future<void> save(TourModel t) async {
    isSaving.value = true;
    try {
      if (t.id == null) {
        await _repo.add(t);
      } else {
        await _repo.update(t);
      }
      await load();
      select(null);
    } finally {
      isSaving.value = false;
    }
  }

  Future<void> delete(String id) async {
    await _repo.delete(id);
    await load();
  }

  Future<void> updateAvailability(String id, String date, TourDailyAvailability a) async {
    await _repo.updateAvailability(id, date, a);
    await load();
  }

  Future<void> updateAvailabilityBulk(String id, Map<String, TourDailyAvailability> map) async {
    await _repo.updateAvailabilityBulk(id, map);
    await load();
  }

  Future<List<String>> uploadImages(List<XFile> images) async {
    final urls = <String>[];
    for (final img in images) {
      try {
        final data = await img.readAsBytes();
        final safeName = img.name.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
        final fileName = '${DateTime.now().millisecondsSinceEpoch}_$safeName';
        final ref = _storage.ref().child('tours/uploads/$fileName');
        final meta = SettableMetadata(contentType: _infer(img.path));
        await ref.putData(data, meta);
        urls.add(await ref.getDownloadURL());
      } catch (e) {
        Get.log('TourAdminController.uploadImages error: $e');
      }
    }
    return urls;
  }

  String _infer(String path) {
    final lower = path.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.heic')) return 'image/heic';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
  }
}
