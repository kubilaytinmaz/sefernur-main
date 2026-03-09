import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/admin/popular_search_admin_controller.dart';
import '../../../../../data/models/search/popular_search_model.dart';

class PopularSearchManagementTab extends GetView<PopularSearchAdminController> {
  const PopularSearchManagementTab({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    Get.put(PopularSearchAdminController());

    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Popüler Aramalar',
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () => _openForm(),
                icon: const Icon(Icons.add),
                label: const Text('Yeni'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(
                    horizontal: 14.w,
                    vertical: 10.h,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }
              if (controller.items.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.search,
                        size: 48.sp,
                        color: isDark ? Colors.grey[600] : Colors.grey[400],
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        'Henüz popüler arama yok',
                        style: TextStyle(
                          color: isDark ? Colors.grey[500] : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.separated(
                itemCount: controller.items.length,
                separatorBuilder: (context, index) => SizedBox(height: 8.h),
                itemBuilder: (ctx, i) {
                  final item = controller.items[i];
                  return _PopularSearchCard(
                    item: item,
                    onEdit: () => _openForm(edit: item),
                    onDelete: () => _confirmDelete(item),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  void _openForm({PopularSearchModel? edit}) {
    controller.select(edit);
    final isDark = Get.isDarkMode;
    Get.bottomSheet(
      Container(
        height: Get.height * 0.84,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20.r),
            topRight: Radius.circular(20.r),
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: Column(
            children: [
              Container(
                margin: EdgeInsets.only(top: 8.h, bottom: 8.h),
                width: 40.w,
                height: 4.h,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[700] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(2.r),
                ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        edit == null
                            ? 'Popüler Arama Ekle'
                            : 'Popüler Arama Düzenle',
                        style: TextStyle(
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(Get.overlayContext!).pop(),
                      icon: Icon(
                        Icons.close_rounded,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                  ],
                ),
              ),
              Divider(height: 1.h, color: isDark ? Colors.grey[700] : null),
              Expanded(child: _PopularSearchForm(existing: edit)),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  void _confirmDelete(PopularSearchModel item) {
    Get.dialog(
      AlertDialog(
        title: const Text('Kaydı Sil'),
        content: Text('"${item.title}" silinsin mi?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(Get.overlayContext!).pop(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(Get.overlayContext!).pop();
              final id = item.id;
              if (id != null) {
                await controller.delete(id);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Sil'),
          ),
        ],
      ),
    );
  }
}

class _PopularSearchCard extends StatelessWidget {
  final PopularSearchModel item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _PopularSearchCard({
    required this.item,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final module = item.module.name.toUpperCase();
    final segment = item.segment.name.toUpperCase();
    final routeText = [
      if (item.city.isNotEmpty) item.city,
      if (item.fromCity.isNotEmpty || item.toCity.isNotEmpty)
        '${item.fromCity} → ${item.toCity}',
    ].join('  ');

    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF252525) : Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                if (item.subtitle.isNotEmpty) ...[
                  SizedBox(height: 3.h),
                  Text(
                    item.subtitle,
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: isDark ? Colors.grey[400] : Colors.grey[700],
                    ),
                  ),
                ],
                SizedBox(height: 6.h),
                Text(
                  '$module • $segment • Sıra: ${item.sortOrder} ${item.isActive ? '• Aktif' : '• Pasif'}',
                  style: TextStyle(
                    fontSize: 11.sp,
                    color: isDark ? Colors.grey[500] : Colors.grey[600],
                  ),
                ),
                if (routeText.isNotEmpty)
                  Text(
                    routeText,
                    style: TextStyle(
                      fontSize: 11.sp,
                      color: isDark ? Colors.grey[500] : Colors.grey[600],
                    ),
                  ),
              ],
            ),
          ),
          IconButton(onPressed: onEdit, icon: const Icon(Icons.edit_outlined)),
          IconButton(
            onPressed: onDelete,
            icon: const Icon(Icons.delete_outline),
            color: Colors.red,
          ),
        ],
      ),
    );
  }
}

class _PopularSearchForm extends StatefulWidget {
  final PopularSearchModel? existing;
  const _PopularSearchForm({this.existing});

  @override
  State<_PopularSearchForm> createState() => _PopularSearchFormState();
}

class _PopularSearchFormState extends State<_PopularSearchForm> {
  final _formKey = GlobalKey<FormState>();
  late final PopularSearchAdminController controller;

  late PopularSearchModule module;
  late PopularSearchSegment segment;
  late bool isActive;

  final titleCtrl = TextEditingController();
  final subtitleCtrl = TextEditingController();
  final orderCtrl = TextEditingController();
  final cityCtrl = TextEditingController();
  final fromCityCtrl = TextEditingController();
  final toCityCtrl = TextEditingController();
  final tagsCtrl = TextEditingController();
  final keywordsCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    controller = Get.find<PopularSearchAdminController>();
    final e = widget.existing;
    module = e?.module ?? PopularSearchModule.hotel;
    segment = e?.segment ?? PopularSearchSegment.general;
    isActive = e?.isActive ?? true;

    titleCtrl.text = e?.title ?? '';
    subtitleCtrl.text = e?.subtitle ?? '';
    orderCtrl.text = (e?.sortOrder ?? 0).toString();
    cityCtrl.text = e?.city ?? '';
    fromCityCtrl.text = e?.fromCity ?? '';
    toCityCtrl.text = e?.toCity ?? '';
    tagsCtrl.text = (e?.tags ?? const []).join(', ');
    keywordsCtrl.text = (e?.keywords ?? const []).join(', ');
  }

  @override
  void dispose() {
    titleCtrl.dispose();
    subtitleCtrl.dispose();
    orderCtrl.dispose();
    cityCtrl.dispose();
    fromCityCtrl.dispose();
    toCityCtrl.dispose();
    tagsCtrl.dispose();
    keywordsCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Form(
      key: _formKey,
      child: Obx(
        () => SingleChildScrollView(
          padding: EdgeInsets.only(
            left: 16.w,
            right: 16.w,
            bottom: MediaQuery.of(context).viewInsets.bottom + 16.h,
            top: 12.h,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _dropdownRow(isDark),
              SizedBox(height: 12.h),
              _field('Başlık', titleCtrl, required: true),
              SizedBox(height: 12.h),
              _field('Alt Başlık', subtitleCtrl),
              SizedBox(height: 12.h),
              _field(
                'Sıralama',
                orderCtrl,
                keyboard: TextInputType.number,
                required: true,
              ),
              SizedBox(height: 12.h),
              if (module == PopularSearchModule.hotel ||
                  module == PopularSearchModule.tour) ...[
                _field('Şehir', cityCtrl),
                SizedBox(height: 12.h),
              ],
              if (module == PopularSearchModule.transfer) ...[
                _field('Nereden (Şehir)', fromCityCtrl),
                SizedBox(height: 12.h),
                _field('Nereye (Şehir)', toCityCtrl),
                SizedBox(height: 12.h),
              ],
              _field('Etiketler (virgül)', tagsCtrl),
              SizedBox(height: 12.h),
              _field('Anahtar Kelimeler (virgül)', keywordsCtrl),
              SizedBox(height: 8.h),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: isActive,
                onChanged: (v) => setState(() => isActive = v),
                title: const Text('Aktif'),
              ),
              SizedBox(height: 18.h),
              SizedBox(
                width: double.infinity,
                height: 48.h,
                child: ElevatedButton.icon(
                  onPressed: controller.isSaving.value ? null : _save,
                  icon: const Icon(Icons.save_outlined),
                  label: Text(
                    controller.isSaving.value ? 'Kaydediliyor...' : 'Kaydet',
                  ),
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
              SizedBox(height: 12.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _dropdownRow(bool isDark) {
    return Row(
      children: [
        Expanded(
          child: DropdownButtonFormField<PopularSearchModule>(
            initialValue: module,
            items: PopularSearchModule.values
                .map(
                  (e) => DropdownMenuItem(
                    value: e,
                    child: Text(e.name.toUpperCase()),
                  ),
                )
                .toList(),
            onChanged: (v) {
              if (v == null) return;
              setState(() {
                module = v;
                if (module != PopularSearchModule.transfer) {
                  segment = PopularSearchSegment.general;
                }
              });
            },
            decoration: const InputDecoration(labelText: 'Modül'),
          ),
        ),
        SizedBox(width: 12.w),
        Expanded(
          child: DropdownButtonFormField<PopularSearchSegment>(
            initialValue: segment,
            items: (module == PopularSearchModule.transfer
                    ? PopularSearchSegment.values
                    : [PopularSearchSegment.general])
                .map(
                  (e) => DropdownMenuItem(
                    value: e,
                    child: Text(e.name.toUpperCase()),
                  ),
                )
                .toList(),
            onChanged: (v) {
              if (v == null) return;
              setState(() => segment = v);
            },
            decoration: const InputDecoration(labelText: 'Segment'),
          ),
        ),
      ],
    );
  }

  Widget _field(
    String label,
    TextEditingController ctrl, {
    bool required = false,
    TextInputType keyboard = TextInputType.text,
  }) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboard,
      validator: required
          ? (v) => (v == null || v.trim().isEmpty) ? 'Zorunlu alan' : null
          : null,
      decoration: InputDecoration(labelText: label),
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final existing = widget.existing;
    final now = DateTime.now();

    final model = PopularSearchModel(
      id: existing?.id,
      module: module,
      segment: segment,
      title: titleCtrl.text.trim(),
      subtitle: subtitleCtrl.text.trim(),
      isActive: isActive,
      sortOrder: int.tryParse(orderCtrl.text.trim()) ?? 0,
      city: cityCtrl.text.trim(),
      fromCity: fromCityCtrl.text.trim(),
      toCity: toCityCtrl.text.trim(),
      tags: tagsCtrl.text
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList(),
      keywords: keywordsCtrl.text
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    );

    await controller.save(model);
    if (mounted) Navigator.of(context).pop();
  }
}
