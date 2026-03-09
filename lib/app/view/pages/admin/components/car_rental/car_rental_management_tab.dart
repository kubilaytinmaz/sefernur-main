import 'package:easy_date_timeline/easy_date_timeline.dart';
import 'package:flutter/material.dart';
import '../../../../themes/theme.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/admin/car_admin_controller.dart';
import '../../../../../data/models/models.dart';
import '../../../../widgets/admin/review_moderation_sheet.dart';
import 'car_add_form.dart';
import 'car_card_item.dart';

class CarRentalManagementTab extends GetView<CarAdminController> {
  const CarRentalManagementTab({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    Get.put(CarAdminController());
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Araç Kiralama', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: _openAddCarSheet,
                icon: const Icon(Icons.add),
                label: const Text('Yeni Araç'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  elevation: 0,
                ),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) return const Center(child: CircularProgressIndicator());
              if (controller.cars.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.directions_car, size: 48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
                      SizedBox(height: 8.h),
                      Text('Henüz araç yok', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]))
                    ],
                  ),
                );
              }
              return ListView.separated(
                itemCount: controller.cars.length,
                separatorBuilder: (_, __) => SizedBox(height: 8.h),
                itemBuilder: (context, index) {
                  final car = controller.cars[index];
                  return CarCardItem(
                    car: car,
                    onEdit: () => _openAddCarSheet(edit: car),
                    onAvailability: () => _openAvailabilitySheet(car),
                    onDelete: () => _confirmDelete(car),
                    onReviews: () {
                      final id = car.id;
                      if (id != null) {
                        ReviewModerationSheet.show(
                          type: 'car',
                          targetId: id,
                          title: '${car.brand} ${car.model}',
                        );
                      }
                    },
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  void _openAddCarSheet({CarModel? edit}) {
    controller.selectCar(edit);
    final isDark = Get.isDarkMode;
    Get.bottomSheet(
      Container(
        height: Get.height * 0.9,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.only(topLeft: Radius.circular(20.r), topRight: Radius.circular(20.r)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(isDark ? 0.3 : 0.1), blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: SafeArea(
          bottom: false,
          top: false,
          child: Column(
            children: [
              Container(margin: EdgeInsets.only(top: 8.h, bottom: 8.h), width: 40.w, height: 4.h, decoration: BoxDecoration(color: isDark ? Colors.grey[700] : Colors.grey[300], borderRadius: BorderRadius.circular(2.r))),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                child: Row(
                  children: [
                    Expanded(child: Text(edit == null ? 'Yeni Araç Ekle' : 'Aracı Düzenle', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87))),
                    IconButton(onPressed: () => Navigator.of(Get.overlayContext!).pop(), icon: Icon(Icons.close_rounded, color: isDark ? Colors.grey[400] : Colors.grey[700]))
                  ],
                ),
              ),
              Divider(height: 1.h, color: isDark ? Colors.grey[800] : Colors.grey[300]),
              const Expanded(child: CarAddForm()),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
    );
  }

  void _openAvailabilitySheet(CarModel car) {
    final isDark = Get.isDarkMode;
    Get.bottomSheet(
      Container(
        height: Get.height * 0.8,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.only(topLeft: Radius.circular(20.r), topRight: Radius.circular(20.r)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(isDark ? 0.3 : 0.1), blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: SafeArea(
          bottom: false,
          top: false,
          child: Column(
            children: [
              Container(margin: EdgeInsets.only(top: 8.h, bottom: 8.h), width: 40.w, height: 4.h, decoration: BoxDecoration(color: isDark ? Colors.grey[700] : Colors.grey[300], borderRadius: BorderRadius.circular(2.r))),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                child: Row(
                  children: [
                    Expanded(child: Text('${car.brand} ${car.model} - Müsaitlik', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87))),
                    IconButton(onPressed: () => Navigator.of(Get.overlayContext!).pop(), icon: Icon(Icons.close_rounded, color: isDark ? Colors.grey[400] : Colors.grey[700])),
                  ],
                ),
              ),
              Divider(height: 1.h, color: isDark ? Colors.grey[800] : Colors.grey[300]),
              Expanded(child: _CarAvailabilitySheet(car: car)),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }
  void _confirmDelete(CarModel car) {
    Get.dialog(AlertDialog(
      title: const Text('Aracı Sil'),
      content: Text('${car.brand} ${car.model} silinsin mi?'),
      actions: [
        TextButton(onPressed: () => Navigator.of(Get.overlayContext!).pop(), child: const Text('İptal')),
        ElevatedButton(onPressed: () { Navigator.of(Get.overlayContext!).pop(); controller.deleteCar(car.id!); }, style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white), child: const Text('Sil')),
      ],
    ));
  }
}

class _CarAvailabilitySheet extends StatefulWidget {
  const _CarAvailabilitySheet({required this.car});
  final CarModel car;

  @override
  State<_CarAvailabilitySheet> createState() => _CarAvailabilitySheetState();
}

class _CarAvailabilitySheetState extends State<_CarAvailabilitySheet> {
  late final CarAdminController controller;
  DateTime selectedDate = DateTime.now();
  final TextEditingController countCtrl = TextEditingController();
  bool isAvailable = true;
  DateTime? rangeStart;
  DateTime? rangeEnd;
  final TextEditingController rangeCountCtrl = TextEditingController();
  bool rangeAvailable = true;
  late Map<String, CarDailyAvailability> _availabilityLocal;
  // UI state
  bool _showSlots = false;
  bool _showRangeSlots = false;
  // Range slot template (pattern to apply to every day in range)
  late Map<String, bool> _rangeSlotsTemplate;

  @override
  void initState() {
    super.initState();
    controller = Get.find<CarAdminController>();
  _availabilityLocal = Map<String, CarDailyAvailability>.from(widget.car.availability);
  _rangeSlotsTemplate = {for (final s in CarDailyAvailability.standardSlots()) s: true};
    _prefill();
  }

  void _prefill() {
    final key = _fmt(selectedDate);
  final a = _availabilityLocal[key];
    countCtrl.text = a?.availableCount.toString() ?? '';
    isAvailable = a?.isAvailable ?? true;
  }

  @override
  void dispose() {
    countCtrl.dispose();
  rangeCountCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 16.w, right: 16.w, top: 12.h, bottom: MediaQuery.of(context).viewInsets.bottom + 12.h),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Gün Seçimi', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700)),
            SizedBox(height: 8.h),
            EasyDateTimeLine(
              initialDate: selectedDate,
              onDateChange: (d) {
                setState(() { selectedDate = d; _prefill(); });
              },
              activeColor: AppColors.medinaGreen40,
              headerProps: const EasyHeaderProps(monthPickerType: MonthPickerType.switcher),
              dayProps: EasyDayProps(
                dayStructure: DayStructure.dayNumDayStr,
                activeDayStyle: DayStyle(
                  decoration: BoxDecoration(color: AppColors.medinaGreen40, borderRadius: BorderRadius.circular(10.r)),
                  dayNumStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                  dayStrStyle: const TextStyle(color: Colors.white),
                ),
              ),
            ),
            SizedBox(height: 12.h),
            Row(children: [
              Expanded(child: _countField('Müsait Araç Sayısı', countCtrl)),
            ]),
            Row(children: [
              Checkbox(value: isAvailable, onChanged: (v) => setState(() => isAvailable = v ?? true)),
              const Text('Müsait')
            ]),
            SizedBox(height: 8.h),
            _dailySlotsHeader(),
            if (_showSlots) ...[
              SizedBox(height: 8.h),
              _timeSlotsSection(),
            ],
            SizedBox(height: 8.h),
            SizedBox(
              width: double.infinity,
              height: 44.h,
              child: ElevatedButton.icon(
                onPressed: _save,
                icon: const Icon(Icons.save_outlined),
                label: const Text('Günü Kaydet'),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  elevation: 0,
                ),
              ),
            ),
            SizedBox(height: 16.h),
            const Divider(),
            SizedBox(height: 8.h),
            Text('Tarih Aralığına Uygula', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700)),
            SizedBox(height: 8.h),
            Row(children: [
              Expanded(child: _rangeDateField('Başlangıç', rangeStart, () => _pickRangeStart())),
              SizedBox(width: 12.w),
              Expanded(child: _rangeDateField('Bitiş', rangeEnd, () => _pickRangeEnd())),
            ]),
            SizedBox(height: 8.h),
            Row(children: [
              Expanded(child: _countField('Günlük Müsait Sayısı', rangeCountCtrl)),
            ]),
            Row(children: [
              Checkbox(value: rangeAvailable, onChanged: (v) => setState(() => rangeAvailable = v ?? true)),
              const Text('Müsait')
            ]),
            SizedBox(height: 8.h),
            _rangeSlotsHeader(),
            if (_showRangeSlots) ...[
              SizedBox(height: 8.h),
              _rangeTimeSlotsSection(),
            ],
            SizedBox(height: 8.h),
            SizedBox(
              width: double.infinity,
              height: 44.h,
              child: ElevatedButton.icon(
                onPressed: _applyRange,
                icon: const Icon(Icons.date_range),
                label: const Text('Aralığa Uygula'),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _rangeDateField(String label, DateTime? date, VoidCallback onTap) {
    final value = date == null ? 'Seçiniz' : '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12.sp, color: Colors.grey[600])),
            SizedBox(height: 6.h),
            Row(children: [
              Icon(Icons.calendar_today, size: 16.sp, color: Colors.grey[700]),
              SizedBox(width: 8.w),
              Text(value, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _countField(String label, TextEditingController ctrl) {
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]))
          ,SizedBox(height: 6.h),
          TextField(
            controller: ctrl,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(border: InputBorder.none, isDense: true),
          ),
        ],
      ),
    );
  }

  // Use local date (YYYY-MM-DD) to avoid timezone/UTC shifts that happen with toIso8601String()
  String _fmt(DateTime d) => '${d.year.toString().padLeft(4,'0')}-${d.month.toString().padLeft(2,'0')}-${d.day.toString().padLeft(2,'0')}';
  

  Future<void> _save() async {
    final count = int.tryParse(countCtrl.text.trim());
    if (count == null) {
      Get.snackbar('Hata', 'Geçerli bir sayı giriniz');
      return;
    }
    final key = _fmt(selectedDate);
  final existing = _availabilityLocal[key];
    // Use modified local slots if present, otherwise default all true
    final timeSlots = Map<String, bool>.from(
      existing?.timeSlots.isNotEmpty == true
          ? existing!.timeSlots
          : {for (final s in CarDailyAvailability.standardSlots()) s: true},
    );
  final a = CarDailyAvailability(date: key, isAvailable: isAvailable, availableCount: count, timeSlots: timeSlots);
    await controller.updateAvailability(widget.car.id!, key, a);
    // Update local state so reselecting the same date shows the saved value
    _availabilityLocal[key] = a;
    // Ensure field reflects current saved value
    setState(() {
      countCtrl.text = count.toString();
      isAvailable = a.isAvailable;
    });
    Get.snackbar('Başarılı', 'Müsaitlik kaydedildi');
  }

  Future<void> _pickRangeStart() async {
    final d = await showDatePicker(
      context: context,
      initialDate: rangeStart ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (d != null) setState(() => rangeStart = d);
  }

  Future<void> _pickRangeEnd() async {
    final base = rangeStart ?? DateTime.now();
    final d = await showDatePicker(
      context: context,
      initialDate: rangeEnd ?? base.add(const Duration(days: 1)),
      firstDate: base,
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (d != null) setState(() => rangeEnd = d);
  }

  Future<void> _applyRange() async {
    final count = int.tryParse(rangeCountCtrl.text.trim());
    if (rangeStart == null || rangeEnd == null || count == null) {
      Get.snackbar('Hata', 'Başlangıç/bitiş ve sayı gerekli');
      return;
    }
    if (!rangeEnd!.isAfter(rangeStart!)) {
      Get.snackbar('Hata', 'Bitiş tarihi başlangıçtan sonra olmalı');
      return;
    }
    final map = <String, CarDailyAvailability>{};
  // Inclusive range (user expects both start and end dates to be applied)
  for (DateTime d = rangeStart!; !d.isAfter(rangeEnd!); d = d.add(const Duration(days: 1))) {
      final key = _fmt(d);
	  map[key] = CarDailyAvailability(
        date: key,
        isAvailable: rangeAvailable,
        availableCount: count,
        timeSlots: Map<String, bool>.from(_rangeSlotsTemplate),
      );
    }
    await controller.updateAvailabilityBulk(widget.car.id!, map);
    // Update local cache for the applied range
    setState(() {
      _availabilityLocal.addAll(map);
      // If current selected date was within the range, refresh UI
      final selKey = _fmt(selectedDate);
      final updated = _availabilityLocal[selKey];
      if (updated != null) {
        countCtrl.text = updated.availableCount.toString();
        isAvailable = updated.isAvailable;
      }
    });
    Get.snackbar('Başarılı', 'Aralığa uygulandı');
  }

  Widget _timeSlotsSection() {
    final key = _fmt(selectedDate);
    final availability = _availabilityLocal[key] ?? CarDailyAvailability(date: key, isAvailable: true, availableCount: 0);
    final slots = (availability.timeSlots.isEmpty
            ? {for (final s in CarDailyAvailability.standardSlots()) s: true}
            : availability.timeSlots)
        .keys
        .toList()
      ..sort();
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Saat Bazlı Teslim / Alış Uygunluğu', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          SizedBox(height: 8.h),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: slots.length,
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 6.h,
              crossAxisSpacing: 6.w,
              childAspectRatio: 2.9,
            ),
            itemBuilder: (context, index) {
              final slot = slots[index];
              final enabled = availability.timeSlots[slot] ?? true;
              return _slotToggle(slot, enabled, key);
            },
          ),
          SizedBox(height: 8.h),
          Row(children: [
            TextButton(onPressed: _allSlotsOn, child: const Text('Hepsini Aç')),
            SizedBox(width: 8.w),
            TextButton(onPressed: _allSlotsOff, child: const Text('Hepsini Kapat')),
          ])
        ],
      ),
    );
  }

  Widget _rangeTimeSlotsSection() {
    final slots = _rangeSlotsTemplate.keys.toList()..sort();
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Saat Deseni (Aralığa Uygulanacak)', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          SizedBox(height: 8.h),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: slots.length,
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 6.h,
              crossAxisSpacing: 6.w,
              childAspectRatio: 2.9,
            ),
            itemBuilder: (context, index) {
              final slot = slots[index];
              final enabled = _rangeSlotsTemplate[slot] ?? true;
              return _rangeSlotToggle(slot, enabled);
            },
          ),
          SizedBox(height: 8.h),
          Row(children: [
            TextButton(onPressed: () => setState(() { for (final k in _rangeSlotsTemplate.keys) { _rangeSlotsTemplate[k] = true; } }), child: const Text('Hepsini Aç')),
            SizedBox(width: 8.w),
            TextButton(onPressed: () => setState(() { for (final k in _rangeSlotsTemplate.keys) { _rangeSlotsTemplate[k] = false; } }), child: const Text('Hepsini Kapat')),
          ])
        ],
      ),
    );
  }

  Widget _dailySlotsHeader() {
    return GestureDetector(
      onTap: () => setState(() => _showSlots = !_showSlots),
      child: Row(
        children: [
          Icon(_showSlots ? Icons.expand_less : Icons.expand_more, color: Colors.grey[700]),
          SizedBox(width: 4.w),
          Text('Saat Bazlı Uygunluk', style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600)),
          const Spacer(),
          if (_showSlots)
            TextButton(onPressed: _allSlotsOn, child: const Text('Aç')),
          if (_showSlots)
            TextButton(onPressed: _allSlotsOff, child: const Text('Kapat')),
        ],
      ),
    );
  }

  Widget _rangeSlotsHeader() {
    return GestureDetector(
      onTap: () => setState(() => _showRangeSlots = !_showRangeSlots),
      child: Row(
        children: [
          Icon(_showRangeSlots ? Icons.expand_less : Icons.expand_more, color: Colors.grey[700]),
          SizedBox(width: 4.w),
          Text('Saat Bazlı Desen', style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600)),
          const Spacer(),
          if (_showRangeSlots)
            TextButton(onPressed: () { setState(() { for (final k in _rangeSlotsTemplate.keys) { _rangeSlotsTemplate[k] = true; } }); }, child: const Text('Aç')),
          if (_showRangeSlots)
            TextButton(onPressed: () { setState(() { for (final k in _rangeSlotsTemplate.keys) { _rangeSlotsTemplate[k] = false; } }); }, child: const Text('Kapat')),
        ],
      ),
    );
  }

  void _allSlotsOn() {
    setState(() {
      final key = _fmt(selectedDate);
      final current = _availabilityLocal[key] ?? CarDailyAvailability(date: key, isAvailable: true, availableCount: 0);
      _availabilityLocal[key] = current.copyWith(timeSlots: {for (final s in CarDailyAvailability.standardSlots()) s: true});
    });
  }

  void _allSlotsOff() {
    setState(() {
      final key = _fmt(selectedDate);
      final current = _availabilityLocal[key] ?? CarDailyAvailability(date: key, isAvailable: true, availableCount: 0);
      _availabilityLocal[key] = current.copyWith(timeSlots: {for (final s in CarDailyAvailability.standardSlots()) s: false});
    });
  }

  Widget _rangeSlotToggle(String slot, bool enabled) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: enabled ? AppColors.medinaGreen40.withOpacity(.5) : Colors.grey[300]!),
        borderRadius: BorderRadius.circular(10.r),
      ),
      padding: EdgeInsets.symmetric(horizontal: 6.w),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(slot, style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: enabled ? Colors.black : Colors.grey)),
          Switch(
            value: enabled,
            onChanged: (v) => setState(() { _rangeSlotsTemplate[slot] = v; }),
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            activeThumbColor: AppColors.medinaGreen40,
          ),
        ],
      ),
    );
  }

  Widget _slotToggle(String slot, bool enabled, String dateKey) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: enabled ? AppColors.medinaGreen40.withOpacity(.5) : Colors.grey[300]!),
        borderRadius: BorderRadius.circular(10.r),
      ),
      padding: EdgeInsets.symmetric(horizontal: 6.w),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(slot, style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: enabled ? Colors.black : Colors.grey)),
          Switch(
            value: enabled,
            onChanged: (v) {
              setState(() {
                final current = _availabilityLocal[dateKey] ?? CarDailyAvailability(date: dateKey, isAvailable: true, availableCount: 0);
                final newSlots = Map<String, bool>.from(current.timeSlots.isEmpty
                    ? {for (final s in CarDailyAvailability.standardSlots()) s: true}
                    : current.timeSlots);
                newSlots[slot] = v;
                _availabilityLocal[dateKey] = current.copyWith(timeSlots: newSlots);
              });
            },
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            activeThumbColor: AppColors.medinaGreen40,
          ),
        ],
      ),
    );
  }
}
