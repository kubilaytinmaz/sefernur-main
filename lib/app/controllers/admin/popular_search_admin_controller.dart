import 'dart:async';

import 'package:get/get.dart';

import '../../data/models/search/popular_search_model.dart';
import '../../data/repositories/search/popular_search_repository.dart';

class PopularSearchAdminController extends GetxController {
  final PopularSearchRepository _repository = PopularSearchRepository();
  StreamSubscription? _sub;

  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxList<PopularSearchModel> items = <PopularSearchModel>[].obs;
  final Rx<PopularSearchModel?> selected = Rx<PopularSearchModel?>(null);

  @override
  void onInit() {
    super.onInit();
    _listen();
  }

  @override
  void onClose() {
    _sub?.cancel();
    super.onClose();
  }

  void _listen() {
    isLoading.value = true;
    _sub = _repository.streamAll().listen((data) {
      items.assignAll(data);
      isLoading.value = false;
    });
  }

  void select(PopularSearchModel? model) => selected.value = model;

  Future<void> save(PopularSearchModel model) async {
    isSaving.value = true;
    try {
      await _repository.save(model);
      selected.value = null;
    } finally {
      isSaving.value = false;
    }
  }

  Future<void> delete(String id) async {
    await _repository.delete(id);
  }
}
