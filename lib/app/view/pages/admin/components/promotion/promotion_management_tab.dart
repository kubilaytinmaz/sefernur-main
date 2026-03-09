import 'package:flutter/material.dart';
import '../../../../themes/theme.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../../controllers/admin/promotion_admin_controller.dart';
import '../../../../../data/models/promotion/promotion_model.dart';

class PromotionManagementTab extends GetView<PromotionAdminController> {
  const PromotionManagementTab({super.key});

  static final Color _primaryColor = AppColors.medinaGreen40;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GetBuilder<PromotionAdminController>(
      init: PromotionAdminController(),
      builder: (ctrl) => Column(
        children: [
          // Filter & Add bar
          Container(
            padding: EdgeInsets.all(16.w),
            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
            child: Row(
              children: [
                // Filter dropdown
                Expanded(
                  child: Obx(() => DropdownButtonFormField<PromotionTargetType?>(
                    initialValue: ctrl.selectedTargetFilter.value,
                    dropdownColor: isDark ? const Color(0xFF2A2A2A) : Colors.white,
                    style: TextStyle(color: isDark ? Colors.white : Colors.black87),
                    decoration: InputDecoration(
                      labelText: 'Filtre',
                      labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600]),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.r)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                        borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
                    ),
                    items: [
                      DropdownMenuItem(value: null, child: Text('Tümü', style: TextStyle(color: isDark ? Colors.white : Colors.black87))),
                      ...PromotionTargetType.values.map((t) => DropdownMenuItem(
                        value: t,
                        child: Text(t.label, style: TextStyle(color: isDark ? Colors.white : Colors.black87)),
                      )),
                    ],
                    onChanged: ctrl.setTargetFilter,
                  )),
                ),
                SizedBox(width: 12.w),
                ElevatedButton.icon(
                  onPressed: () => _showForm(context, ctrl),
                  icon: const Icon(Icons.add, color: Colors.white),
                  label: const Text('Yeni İndirim', style: TextStyle(color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryColor,
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
                  ),
                ),
              ],
            ),
          ),
          // List
          Expanded(
            child: Obx(() {
              final list = ctrl.filteredPromotions;
              if (list.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.local_offer_outlined, size: 64.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
                      SizedBox(height: 16.h),
                      Text('Henüz indirim eklenmemiş', style: TextStyle(fontSize: 16.sp, color: isDark ? Colors.grey[500] : Colors.grey[600])),
                    ],
                  ),
                );
              }
              return ListView.separated(
                padding: EdgeInsets.all(16.w),
                itemCount: list.length,
                separatorBuilder: (_, __) => SizedBox(height: 12.h),
                itemBuilder: (ctx, i) => _buildCard(ctx, ctrl, list[i], isDark),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext ctx, PromotionAdminController ctrl, PromotionModel p, bool isDark) {
    final startColor = _parseColor(p.gradientStartColor);
    final endColor = _parseColor(p.gradientEndColor);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12.r),
        gradient: LinearGradient(colors: [startColor, endColor]),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Preview banner
          Padding(
            padding: EdgeInsets.all(16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        p.title,
                        style: TextStyle(color: Colors.white, fontSize: 16.sp, fontWeight: FontWeight.bold),
                      ),
                    ),
                    // Status badge
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: p.isCurrentlyActive ? Colors.green : Colors.red,
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Text(
                        p.isCurrentlyActive ? 'Aktif' : 'Pasif',
                        style: TextStyle(color: Colors.white, fontSize: 10.sp, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 4.h),
                Text(p.subtitle, style: TextStyle(color: Colors.white70, fontSize: 13.sp)),
                SizedBox(height: 8.h),
                Row(
                  children: [
                    _infoBadge(p.targetType.label, Icons.category),
                    SizedBox(width: 8.w),
                    if (p.discountPercent > 0) _infoBadge('%${p.discountPercent}', Icons.percent),
                    if (p.badgeText != null) ...[
                      SizedBox(width: 8.w),
                      _infoBadge(p.badgeText!, Icons.local_offer),
                    ],
                  ],
                ),
              ],
            ),
          ),
          // Actions
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(12.r),
                bottomRight: Radius.circular(12.r),
              ),
            ),
            child: Row(
              children: [
                // Date info
                Expanded(
                  child: Text(
                    _formatDateRange(p.startDate, p.endDate),
                    style: TextStyle(fontSize: 11.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                  ),
                ),
                // Toggle active
                IconButton(
                  icon: Icon(
                    p.isActive ? Icons.visibility : Icons.visibility_off,
                    color: p.isActive ? Colors.green : Colors.grey,
                  ),
                  onPressed: () => ctrl.toggleActive(p.id!, !p.isActive),
                  tooltip: p.isActive ? 'Pasifleştir' : 'Aktifleştir',
                ),
                // Edit
                IconButton(
                  icon: Icon(Icons.edit, color: _primaryColor),
                  onPressed: () => _showForm(ctx, ctrl, existing: p),
                  tooltip: 'Düzenle',
                ),
                // Delete
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => _confirmDelete(ctx, ctrl, p),
                  tooltip: 'Sil',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoBadge(String text, IconData icon) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: Colors.white24,
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12.sp, color: Colors.white),
          SizedBox(width: 4.w),
          Text(text, style: TextStyle(color: Colors.white, fontSize: 11.sp, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  String _formatDateRange(DateTime? start, DateTime? end) {
    final fmt = DateFormat('dd.MM.yyyy');
    if (start == null && end == null) return 'Süresiz';
    if (start != null && end == null) return '${fmt.format(start)} - Süresiz';
    if (start == null && end != null) return 'Başlangıç yok - ${fmt.format(end)}';
    return '${fmt.format(start!)} - ${fmt.format(end!)}';
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.blue;
    }
  }

  void _showForm(BuildContext ctx, PromotionAdminController ctrl, {PromotionModel? existing}) {
    if (existing != null) {
      ctrl.loadPromotion(existing);
    } else {
      ctrl.resetForm();
    }

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _PromotionFormSheet(ctrl: ctrl, existingId: existing?.id),
    );
  }

  void _confirmDelete(BuildContext ctx, PromotionAdminController ctrl, PromotionModel p) {
    showDialog(
      context: ctx,
      builder: (_) => AlertDialog(
        title: const Text('İndirimi Sil'),
        content: Text('"${p.title}" indirimini silmek istediğinize emin misiniz?'),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('İptal')),
          TextButton(
            onPressed: () {
              Get.back();
              ctrl.delete(p.id!);
            },
            child: const Text('Sil', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _PromotionFormSheet extends StatelessWidget {
  final PromotionAdminController ctrl;
  final String? existingId;

  const _PromotionFormSheet({required this.ctrl, this.existingId});

  static final Color _primaryColor = AppColors.medinaGreen40;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: EdgeInsets.only(top: 12.h),
            width: 40.w,
            height: 4.h,
            decoration: BoxDecoration(color: isDark ? Colors.grey[700] : Colors.grey[300], borderRadius: BorderRadius.circular(2.r)),
          ),
          // Title
          Padding(
            padding: EdgeInsets.all(16.w),
            child: Row(
              children: [
                Text(
                  existingId != null ? 'İndirimi Düzenle' : 'Yeni İndirim',
                  style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87),
                ),
                const Spacer(),
                IconButton(onPressed: () => Navigator.of(context).pop(), icon: Icon(Icons.close, color: isDark ? Colors.grey[400] : Colors.grey[600])),
              ],
            ),
          ),
          Divider(height: 1, color: isDark ? Colors.grey[800] : Colors.grey[300]),
          // Form
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Target type
                  Text('Hedef Alan', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87)),
                  SizedBox(height: 8.h),
                  Obx(() => Wrap(
                    spacing: 8.w,
                    children: PromotionTargetType.values.map((t) => ChoiceChip(
                      label: Text(t.label),
                      selected: ctrl.selectedTargetType.value == t,
                      onSelected: (_) => ctrl.selectedTargetType.value = t,
                      selectedColor: _primaryColor.withOpacity(0.2),
                      backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                      labelStyle: TextStyle(color: isDark ? Colors.white : Colors.black87),
                    )).toList(),
                  )),
                  SizedBox(height: 16.h),

                  // Title
                  _textField(ctrl.titleController, 'Başlık *', 'örn: SEFERNUR', isDark),
                  SizedBox(height: 12.h),

                  // Subtitle
                  _textField(ctrl.subtitleController, 'Alt Başlık *', 'örn: Seçili otellerde özel indirim!', isDark),
                  SizedBox(height: 12.h),

                  // Description
                  _textField(ctrl.descriptionController, 'Açıklama', 'Detaylı açıklama (isteğe bağlı)', isDark, maxLines: 2),
                  SizedBox(height: 12.h),

                  // Discount percent & code
                  Row(
                    children: [
                      Expanded(child: _textField(ctrl.discountPercentController, 'İndirim %', '0-100', isDark, keyboardType: TextInputType.number)),
                      SizedBox(width: 12.w),
                      Expanded(child: _textField(ctrl.discountCodeController, 'İndirim Kodu', 'örn: UMRE2025', isDark)),
                    ],
                  ),
                  SizedBox(height: 12.h),

                  // Badge text & priority
                  Row(
                    children: [
                      Expanded(child: _textField(ctrl.badgeTextController, 'Rozet Metni', 'örn: %20 İNDİRİM', isDark)),
                      SizedBox(width: 12.w),
                      Expanded(child: _textField(ctrl.priorityController, 'Öncelik', '0 = en önce', isDark, keyboardType: TextInputType.number)),
                    ],
                  ),
                  SizedBox(height: 16.h),

                  // Colors
                  Text('Renk Ayarları', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87)),
                  SizedBox(height: 8.h),
                  _colorPickers(),
                  SizedBox(height: 16.h),

                  // Date range
                  Text('Geçerlilik Tarihleri', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87)),
                  SizedBox(height: 8.h),
                  Row(
                    children: [
                      Expanded(child: _datePicker(context, 'Başlangıç', ctrl.startDate, isDark)),
                      SizedBox(width: 12.w),
                      Expanded(child: _datePicker(context, 'Bitiş', ctrl.endDate, isDark)),
                    ],
                  ),
                  SizedBox(height: 16.h),

                  // Active toggle
                  Obx(() => SwitchListTile(
                    title: Text('Aktif', style: TextStyle(color: isDark ? Colors.white : Colors.black87)),
                    subtitle: Text('Pasifse kullanıcılara gösterilmez', style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600])),
                    value: ctrl.isActive.value,
                    onChanged: (v) => ctrl.isActive.value = v,
                    activeThumbColor: _primaryColor,
                  )),
                  SizedBox(height: 24.h),

                  // Preview
                  Text('Önizleme', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87)),
                  SizedBox(height: 8.h),
                  _preview(),
                  SizedBox(height: 24.h),
                ],
              ),
            ),
          ),
          // Save button
          Container(
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(isDark ? 0.3 : 0.1), blurRadius: 4, offset: const Offset(0, -2))],
            ),
            child: Obx(() => SizedBox(
              width: double.infinity,
              height: 50.h,
              child: ElevatedButton(
                onPressed: ctrl.isLoading.value ? null : () => ctrl.save(existingId: existingId),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                ),
                child: ctrl.isLoading.value
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(existingId != null ? 'Güncelle' : 'Oluştur', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
            )),
          ),
        ],
      ),
    );
  }

  Widget _textField(TextEditingController controller, String label, String hint, bool isDark, {int maxLines = 1, TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: TextStyle(color: isDark ? Colors.white : Colors.black87),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600]),
        hintText: hint,
        hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[400]),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.r)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.r),
          borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.r),
          borderSide: BorderSide(color: _primaryColor, width: 2),
        ),
        filled: true,
        fillColor: isDark ? Colors.grey[900] : Colors.white,
        contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
      ),
    );
  }

  Widget _colorPickers() {
    final presetColors = ['#4A90E2', '#7B68EE', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9800', '#E91E63'];

    return Column(
      children: [
        // Start color
        Row(
          children: [
            Text('Başlangıç:', style: TextStyle(fontSize: 12.sp)),
            SizedBox(width: 8.w),
            Expanded(
              child: Obx(() => SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: presetColors.map((c) => GestureDetector(
                    onTap: () => ctrl.gradientStartColor.value = c,
                    child: Container(
                      margin: EdgeInsets.only(right: 6.w),
                      width: 28.w,
                      height: 28.w,
                      decoration: BoxDecoration(
                        color: Color(int.parse(c.replaceFirst('#', '0xFF'))),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: ctrl.gradientStartColor.value == c ? Colors.black : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                  )).toList(),
                ),
              )),
            ),
          ],
        ),
        SizedBox(height: 8.h),
        // End color
        Row(
          children: [
            Text('Bitiş:', style: TextStyle(fontSize: 12.sp)),
            SizedBox(width: 24.w),
            Expanded(
              child: Obx(() => SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: presetColors.map((c) => GestureDetector(
                    onTap: () => ctrl.gradientEndColor.value = c,
                    child: Container(
                      margin: EdgeInsets.only(right: 6.w),
                      width: 28.w,
                      height: 28.w,
                      decoration: BoxDecoration(
                        color: Color(int.parse(c.replaceFirst('#', '0xFF'))),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: ctrl.gradientEndColor.value == c ? Colors.black : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                  )).toList(),
                ),
              )),
            ),
          ],
        ),
      ],
    );
  }

  Widget _datePicker(BuildContext context, String label, Rx<DateTime?> dateRx, bool isDark) {
    return Obx(() => GestureDetector(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: dateRx.value ?? DateTime.now(),
          firstDate: DateTime(2020),
          lastDate: DateTime(2030),
        );
        if (picked != null) dateRx.value = picked;
      },
      child: Container(
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[400]!),
          borderRadius: BorderRadius.circular(8.r),
          color: isDark ? Colors.grey[900] : Colors.white,
        ),
        child: Row(
          children: [
            Icon(Icons.calendar_today, size: 16.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
            SizedBox(width: 8.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(fontSize: 10.sp, color: isDark ? Colors.grey[500] : Colors.grey[600])),
                  Text(
                    dateRx.value != null ? DateFormat('dd.MM.yyyy').format(dateRx.value!) : 'Seçilmedi',
                    style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w500, color: isDark ? Colors.white : Colors.black87),
                  ),
                ],
              ),
            ),
            if (dateRx.value != null)
              GestureDetector(
                onTap: () => dateRx.value = null,
                child: Icon(Icons.clear, size: 16.sp, color: isDark ? Colors.grey[500] : Colors.grey),
              ),
          ],
        ),
      ),
    ));
  }

  Widget _preview() {
    return Obx(() {
      final startColor = Color(int.parse(ctrl.gradientStartColor.value.replaceFirst('#', '0xFF')));
      final endColor = Color(int.parse(ctrl.gradientEndColor.value.replaceFirst('#', '0xFF')));

      return Container(
        width: double.infinity,
        height: 120.h,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12.r),
          gradient: LinearGradient(colors: [startColor, endColor]),
        ),
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              ctrl.titleController.text.isEmpty ? 'Başlık' : ctrl.titleController.text,
              style: TextStyle(color: Colors.white, fontSize: 16.sp, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4.h),
            Text(
              ctrl.subtitleController.text.isEmpty ? 'Alt başlık' : ctrl.subtitleController.text,
              style: TextStyle(color: Colors.white70, fontSize: 13.sp),
            ),
            const Spacer(),
            if (ctrl.badgeTextController.text.isNotEmpty)
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Text(
                  ctrl.badgeTextController.text,
                  style: TextStyle(color: Colors.white, fontSize: 12.sp, fontWeight: FontWeight.bold),
                ),
              ),
          ],
        ),
      );
    });
  }
}
