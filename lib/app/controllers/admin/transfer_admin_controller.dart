import 'dart:io';

import 'package:firebase_storage/firebase_storage.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../data/models/models.dart';
import '../../data/repositories/transfer/transfer_repository.dart';

class TransferAdminController extends GetxController {
  final TransferRepository _repo = TransferRepository();
  // Use default instance (now configured correctly after flutterfire configure)
  final FirebaseStorage _storage = FirebaseStorage.instance;

  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxList<TransferModel> transfers = <TransferModel>[].obs;
  final Rx<TransferModel?> selected = Rx<TransferModel?>(null);

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    try { isLoading.value = true; transfers.value = await _repo.getAll(); } finally { isLoading.value = false; }
  }

  void select(TransferModel? t) => selected.value = t;

  Future<void> save(TransferModel t) async {
    isSaving.value = true;
    try {
      if (t.id == null) {
        await _repo.add(t);
      } else {
        await _repo.update(t);
      }
      await load();
    } finally { isSaving.value = false; }
  }

  Future<void> delete(String id) async { await _repo.delete(id); await load(); }

  Future<void> updateAvailability(String id, String date, TransferDailyAvailability a) async { await _repo.updateAvailability(id, date, a); await load(); }

  Future<void> updateAvailabilityBulk(String id, Map<String, TransferDailyAvailability> map) async { await _repo.updateAvailabilityBulk(id, map); await load(); }

  Future<List<String>> uploadImages(List<XFile> images) async {
    final downloadUrls = <String>[];
    // (Hotel logic ile aynı) — sadece basit putFile + whenComplete
    for (final image in images) {
      try {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}_${image.name}';
        final ref = _storage.ref().child('transfers/uploads/$fileName');
        final uploadTask = ref.putFile(File(image.path));
        await uploadTask.whenComplete(() {});
        final url = await ref.getDownloadURL();
        downloadUrls.add(url);
      } catch (e) {
        Get.snackbar('Yükleme Hatası', 'Resim yüklenemedi');
      }
    }
    return downloadUrls;
  }

}
