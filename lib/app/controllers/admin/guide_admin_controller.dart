import 'package:firebase_storage/firebase_storage.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../data/models/guide/guide_model.dart';
import '../../data/repositories/guide/guide_repository.dart';

class GuideAdminController extends GetxController {
  final GuideRepository _repo = GuideRepository();
  final FirebaseStorage _storage = FirebaseStorage.instance;

  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxList<GuideModel> guides = <GuideModel>[].obs;
  final Rx<GuideModel?> selected = Rx<GuideModel?>(null);

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    try {
      isLoading.value = true;
      guides.value = await _repo.getAll();
    } finally {
      isLoading.value = false;
    }
  }

  void select(GuideModel? g) => selected.value = g;

  Future<void> save(GuideModel g) async {
    isSaving.value = true;
    try {
      if (g.id == null) {
        await _repo.add(g);
      } else {
        await _repo.update(g);
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

  Future<void> updateAvailability(String id, String date, GuideDailyAvailability a) async {
    await _repo.updateAvailability(id, date, a);
    await load();
  }

  Future<void> updateAvailabilityBulk(String id, Map<String, GuideDailyAvailability> map) async {
    await _repo.updateAvailabilityBulk(id, map);
    await load();
  }

  Future<List<String>> uploadImages(List<XFile> images) async {
    final urls = <String>[];
    for (final img in images) {
      final data = await img.readAsBytes();
      final safeName = img.name.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
      final fileName = '${DateTime.now().millisecondsSinceEpoch}_$safeName';
      final ref = _storage.ref().child('guides/uploads/$fileName');
      final meta = SettableMetadata(contentType: _infer(img.path));
      await ref.putData(data, meta);
      urls.add(await ref.getDownloadURL());
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
