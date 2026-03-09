import 'package:get/get.dart';

import '../../enums/campaign_type.dart';
import '../../models/campaign/campaign_model.dart';
import '../../providers/firebase/firebase_api.dart';
import '../../repositories/campaign/campaign_repository.dart';
import '../auth/auth_service.dart';

class CampaignService extends GetxService {
  late CampaignRepository repository;
  final campaigns = <CampaignModel>[].obs;
  // All campaigns (active + inactive) loaded on demand for admin/full listing
  final allCampaigns = <CampaignModel>[].obs;
  final isLoading = false.obs;
  final isLoadingAll = false.obs;

  Future<CampaignService> init() async {
    repository = CampaignRepository(FirebaseApi());
    await fetchActive();
    return this;
  }

  Future<void> fetchActive() async {
    isLoading.value = true;
    final result = await repository.readCampaigns(onlyActive: true).run();
    result.match(
      (l) => campaigns.value = [],
      (r) => campaigns.assignAll(r..sort((a,b)=>b.createdAt.compareTo(a.createdAt))),
    );
    isLoading.value = false;
  }

  Future<void> fetchAll() async {
    // Don't refetch if already have data to reduce reads (could add manual refresh later)
    if (allCampaigns.isNotEmpty) return;
    isLoadingAll.value = true;
    final result = await repository.readCampaigns(onlyActive: false).run();
    result.match(
      (l) => allCampaigns.value = [],
      (r) => allCampaigns.assignAll(r..sort((a,b)=>b.createdAt.compareTo(a.createdAt))),
    );
    isLoadingAll.value = false;
  }

  Future<bool> addCampaign({
    required String title,
    required String shortDescription,
    required String longDescription,
    required String imageUrl,
    required CampaignType type,
    bool isActive = true,
  }) async {
    final userId = Get.isRegistered<AuthService>() && Get.find<AuthService>().user.value.id != null
        ? Get.find<AuthService>().user.value.id!
        : 'anonymous';
    final model = CampaignModel(
      title: title,
      shortDescription: shortDescription,
      longDescription: longDescription,
      imageUrl: imageUrl,
      type: type,
      isActive: isActive,
      createdBy: userId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      savedByUserIds: const [],
    );
    final res = await repository.createCampaign(model).run();
    return res.match(
      (l) => false,
      (id) {
        campaigns.insert(0, model.copyWith(id: id));
        // keep allCampaigns in sync if already loaded
        if (allCampaigns.isNotEmpty) {
          allCampaigns.insert(0, model.copyWith(id: id));
        }
        return true;
      },
    );
  }

  List<CampaignModel> byType(CampaignType type) =>
      campaigns.where((c) => c.type == type).toList();

  Future<bool> updateCampaign(CampaignModel model, {
    String? title,
    String? shortDescription,
    String? longDescription,
    String? imageUrl,
    CampaignType? type,
    bool? isActive,
  }) async {
    if (model.id == null) return false;
    final updated = model.copyWith(
      title: title ?? model.title,
      shortDescription: shortDescription ?? model.shortDescription,
      longDescription: longDescription ?? model.longDescription,
      imageUrl: imageUrl ?? model.imageUrl,
      type: type ?? model.type,
      isActive: isActive ?? model.isActive,
      updatedAt: DateTime.now(),
    );
    final res = await repository.updateCampaign(updated).run();
    return res.match(
      (l) => false,
      (r) {
        if (!updated.isActive) {
          // remove from active list
            campaigns.removeWhere((c) => c.id == updated.id);
        } else {
          final idx = campaigns.indexWhere((c) => c.id == updated.id);
          if (idx != -1) {
            campaigns[idx] = updated;
            campaigns.refresh();
          } else {
            // if became active and wasn't present (edge case) reload
            campaigns.insert(0, updated);
          }
        }
        // sync allCampaigns
        final allIdx = allCampaigns.indexWhere((c) => c.id == updated.id);
        if (allIdx != -1) {
          allCampaigns[allIdx] = updated;
          allCampaigns.refresh();
        } else if (allCampaigns.isNotEmpty) {
          allCampaigns.insert(0, updated);
        }
        return true;
      },
    );
  }

  Future<void> toggleSave(CampaignModel model) async {
    final userId = Get.isRegistered<AuthService>() && Get.find<AuthService>().user.value.id != null
        ? Get.find<AuthService>().user.value.id!
        : 'anonymous';
    final res = await repository.toggleSave(model: model, userId: userId).run();
    res.match(
      (l) {},
      (ok) {
        final idx = campaigns.indexWhere((c) => c.id == model.id);
        if (idx != -1) {
          final list = List<CampaignModel>.from(campaigns);
          final saved = List<String>.from(model.savedByUserIds);
          if (saved.contains(userId)) {
            saved.remove(userId);
          } else {
            saved.add(userId);
          }
            list[idx] = model.copyWith(
              savedByUserIds: saved,
              updatedAt: DateTime.now(),
            );
          campaigns.assignAll(list);
        }
        final allIdx = allCampaigns.indexWhere((c) => c.id == model.id);
        if (allIdx != -1) {
          final list = List<CampaignModel>.from(allCampaigns);
          final saved = List<String>.from(model.savedByUserIds);
          if (saved.contains(userId)) {
            saved.remove(userId);
          } else {
            saved.add(userId);
          }
          list[allIdx] = model.copyWith(savedByUserIds: saved, updatedAt: DateTime.now());
          allCampaigns.assignAll(list);
        }
      },
    );
  }
}
