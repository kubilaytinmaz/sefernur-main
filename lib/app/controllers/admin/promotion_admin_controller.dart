import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/models/promotion/promotion_model.dart';
import '../../data/repositories/promotion/promotion_repository.dart';

class PromotionAdminController extends GetxController {
  final PromotionRepository _repo = PromotionRepository();

  final promotions = <PromotionModel>[].obs;
  final isLoading = false.obs;
  final selectedTargetFilter = Rx<PromotionTargetType?>(null);

  // Form controllers
  final titleController = TextEditingController();
  final subtitleController = TextEditingController();
  final descriptionController = TextEditingController();
  final discountPercentController = TextEditingController();
  final discountCodeController = TextEditingController();
  final badgeTextController = TextEditingController();
  final priorityController = TextEditingController();

  // Form state
  final selectedTargetType = PromotionTargetType.hotel.obs;
  final gradientStartColor = '#4A90E2'.obs;
  final gradientEndColor = '#7B68EE'.obs;
  final badgeColor = '#FF9800'.obs;
  final isActive = true.obs;
  final startDate = Rx<DateTime?>(null);
  final endDate = Rx<DateTime?>(null);

  @override
  void onInit() {
    super.onInit();
    _bindStream();
  }

  void _bindStream() {
    promotions.bindStream(_repo.streamAll());
  }

  List<PromotionModel> get filteredPromotions {
    if (selectedTargetFilter.value == null) return promotions;
    return promotions.where((p) => p.targetType == selectedTargetFilter.value).toList();
  }

  void setTargetFilter(PromotionTargetType? type) {
    selectedTargetFilter.value = type;
  }

  void resetForm() {
    titleController.clear();
    subtitleController.clear();
    descriptionController.clear();
    discountPercentController.clear();
    discountCodeController.clear();
    badgeTextController.clear();
    priorityController.text = '0';
    selectedTargetType.value = PromotionTargetType.hotel;
    gradientStartColor.value = '#4A90E2';
    gradientEndColor.value = '#7B68EE';
    badgeColor.value = '#FF9800';
    isActive.value = true;
    startDate.value = null;
    endDate.value = null;
  }

  void loadPromotion(PromotionModel p) {
    titleController.text = p.title;
    subtitleController.text = p.subtitle;
    descriptionController.text = p.description ?? '';
    discountPercentController.text = p.discountPercent.toString();
    discountCodeController.text = p.discountCode ?? '';
    badgeTextController.text = p.badgeText ?? '';
    priorityController.text = p.priority.toString();
    selectedTargetType.value = p.targetType;
    gradientStartColor.value = p.gradientStartColor;
    gradientEndColor.value = p.gradientEndColor;
    badgeColor.value = p.badgeColor ?? '#FF9800';
    isActive.value = p.isActive;
    startDate.value = p.startDate;
    endDate.value = p.endDate;
  }

  Future<void> save({String? existingId}) async {
    if (titleController.text.trim().isEmpty) {
      _showSnackBar('Başlık zorunludur', isError: true);
      return;
    }
    if (subtitleController.text.trim().isEmpty) {
      _showSnackBar('Alt başlık zorunludur', isError: true);
      return;
    }

    isLoading.value = true;
    try {
      final model = PromotionModel(
        id: existingId,
        title: titleController.text.trim(),
        subtitle: subtitleController.text.trim(),
        description: descriptionController.text.trim().isEmpty ? null : descriptionController.text.trim(),
        targetType: selectedTargetType.value,
        discountPercent: int.tryParse(discountPercentController.text) ?? 0,
        discountCode: discountCodeController.text.trim().isEmpty ? null : discountCodeController.text.trim(),
        gradientStartColor: gradientStartColor.value,
        gradientEndColor: gradientEndColor.value,
        badgeText: badgeTextController.text.trim().isEmpty ? null : badgeTextController.text.trim(),
        badgeColor: badgeColor.value,
        isActive: isActive.value,
        startDate: startDate.value,
        endDate: endDate.value,
        priority: int.tryParse(priorityController.text) ?? 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      if (existingId != null) {
        await _repo.update(existingId, model);
        _showSnackBar('İndirim güncellendi');
      } else {
        await _repo.create(model);
        _showSnackBar('İndirim oluşturuldu');
      }
      // Navigator.pop kullanarak bottom sheet'i kapat
      if (Get.isDialogOpen == true || Get.isBottomSheetOpen == true) {
        Get.back();
      }
    } catch (e) {
      _showSnackBar('İşlem başarısız: $e', isError: true);
    } finally {
      isLoading.value = false;
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    final context = Get.context;
    if (context != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: isError ? Colors.red : Colors.green,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> delete(String id) async {
    try {
      await _repo.delete(id);
      _showSnackBar('İndirim silindi');
    } catch (e) {
      _showSnackBar('Silme başarısız: $e', isError: true);
    }
  }

  Future<void> toggleActive(String id, bool active) async {
    try {
      await _repo.toggleActive(id, active);
    } catch (e) {
      _showSnackBar('İşlem başarısız: $e', isError: true);
    }
  }

  @override
  void onClose() {
    titleController.dispose();
    subtitleController.dispose();
    descriptionController.dispose();
    discountPercentController.dispose();
    discountCodeController.dispose();
    badgeTextController.dispose();
    priorityController.dispose();
    super.onClose();
  }
}
