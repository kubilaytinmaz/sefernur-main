import 'package:easy_date_timeline/easy_date_timeline.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/controllers.dart';
import '../../../../../data/models/models.dart';
import '../../../../widgets/admin/review_moderation_sheet.dart';
import 'hotel_add_form.dart';
import 'hotel_card_item.dart';

class HotelManagementTab extends GetView<AdminController> {
  const HotelManagementTab({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Otel Yönetimi',
                style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87),
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () {
                  controller.clearSelectedHotel();
                  _showHotelFormDialog();
                },
                icon: const Icon(Icons.add),
                label: const Text('Yeni Otel'),
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
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }
              if (controller.hotels.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.hotel_class_outlined, size: 48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
                      SizedBox(height: 8.h),
                      Text('Henüz otel yok', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600])),
                    ],
                  ),
                );
              }
              return ListView.separated(
                itemCount: controller.hotels.length,
                separatorBuilder: (_, __) => SizedBox(height: 8.h),
                itemBuilder: (context, index) {
                  final hotel = controller.hotels[index];
                  return HotelCardItem(
                    hotel: hotel,
                    onEdit: () {
                      controller.selectHotel(hotel);
                      _showHotelFormDialog();
                    },
                    onAvailability: () => _showAvailabilityBottomSheet(hotel),
                    onDelete: () => _showDeleteConfirmDialog(hotel),
                    onReviews: () {
                      final id = hotel.id;
                      if (id != null) {
                        ReviewModerationSheet.show(
                          type: 'hotel',
                          targetId: id,
                          title: hotel.name,
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

  void _showHotelFormDialog() {
    final isDark = Theme.of(Get.context!).brightness == Brightness.dark;
    Get.bottomSheet(
      Container(
        height: Get.height * 0.9,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20.r),
            topRight: Radius.circular(20.r),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.3 : 0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          bottom: false,
          top: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  margin: EdgeInsets.only(top: 8.h, bottom: 8.h),
                  width: 40.w,
                  height: 4.h,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.grey[700] : Colors.grey[300],
                    borderRadius: BorderRadius.circular(2.r),
                  ),
                ),
              ),
              // Header
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                child: Row(
                  children: [
                    Text(
                      controller.selectedHotel.value == null ? 'Yeni Otel Ekle' : 'Oteli Düzenle',
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => Navigator.of(Get.overlayContext!).pop(),
                      style: IconButton.styleFrom(
                        backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                        shape: const CircleBorder(),
                      ),
                      icon: Icon(Icons.close_rounded, size: 20.sp, color: isDark ? Colors.grey[300] : Colors.grey[800]),
                    ),
                  ],
                ),
              ),
              Divider(height: 1.h, thickness: 1, color: isDark ? Colors.grey[800] : null),
              // Form
              const Expanded(
                child: HotelAddForm(),
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
    );
  }

  void _showAvailabilityBottomSheet(HotelModel hotel) {
    final isDark = Theme.of(Get.context!).brightness == Brightness.dark;
    Get.bottomSheet(
      Container(
        height: Get.height * 0.9,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20.r),
            topRight: Radius.circular(20.r),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.3 : 0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          bottom: false,
          top: false,
          child: Column(
            children: [
              // Handle bar
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
                        '${hotel.name} - Doluluk / Kapasite',
                        style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(Get.overlayContext!).pop(),
                      style: IconButton.styleFrom(
                        backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                        shape: const CircleBorder(),
                      ),
                      icon: Icon(Icons.close_rounded, size: 20.sp, color: isDark ? Colors.grey[300] : Colors.grey[800]),
                    ),
                  ],
                ),
              ),
              Divider(height: 1.h, thickness: 1, color: isDark ? Colors.grey[800] : null),
              Expanded(
                child: HotelAvailabilitySheet(hotel: hotel),
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
    );
  }

  void _showDeleteConfirmDialog(HotelModel hotel) {
    Get.dialog(
      AlertDialog(
        title: const Text('Oteli Sil'),
        content: Text('${hotel.name} otelini silmek istediğinizden emin misiniz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(Get.overlayContext!).pop(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(Get.overlayContext!).pop();
              controller.deleteHotel(hotel.id!);
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

class HotelAvailabilitySheet extends StatefulWidget {
  const HotelAvailabilitySheet({super.key, required this.hotel});
  final HotelModel hotel;

  @override
  State<HotelAvailabilitySheet> createState() => _HotelAvailabilitySheetState();
}

class _HotelAvailabilitySheetState extends State<HotelAvailabilitySheet> {
  late final AdminController controller;
  DateTime selectedDate = DateTime.now();
  DateTime? rangeStart;
  DateTime? rangeEnd;
  final TextEditingController capacityController = TextEditingController();
  final TextEditingController rangeCapacityController = TextEditingController();
  bool isAvailable = true;
  bool rangeIsAvailable = true;

  @override
  void initState() {
    super.initState();
    controller = Get.find<AdminController>();
    // Prefill if date exists
    final key = _fmt(selectedDate);
    final existing = widget.hotel.availability[key];
    if (existing != null) {
      capacityController.text = existing.availableRooms.toString();
      isAvailable = existing.isAvailable;
    }
  }

  @override
  void dispose() {
    capacityController.dispose();
  rangeCapacityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.all(16.w),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.only(bottom: bottomInset + 12.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          // Date timeline selector
          EasyDateTimeLine(
            initialDate: selectedDate,
            onDateChange: (date) {
              setState(() {
                selectedDate = date;
                final key = _fmt(selectedDate);
                final existing = widget.hotel.availability[key];
                capacityController.text = existing?.availableRooms.toString() ?? '';
                isAvailable = existing?.isAvailable ?? true;
              });
            },
            activeColor: Theme.of(context).primaryColor,
            headerProps: const EasyHeaderProps(monthPickerType: MonthPickerType.switcher),
          ),
          SizedBox(height: 12.h),
          Text('Seçili gün: ${_displayDate(selectedDate)}', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.sp)),
          SizedBox(height: 8.h),
          _textField(
            label: 'Kapasite (kişi)',
            controller: capacityController,
            keyboardType: TextInputType.number,
          ),
          SizedBox(height: 8.h),
          Row(
            children: [
              Checkbox(
                value: isAvailable,
                onChanged: (v) => setState(() => isAvailable = v ?? true),
                activeColor: Theme.of(context).primaryColor,
              ),
              const Text('Müsait')
            ],
          ),
          SizedBox(height: 8.h),
          Row(
            children: [
              ElevatedButton.icon(
                onPressed: _saveSingle,
                icon: const Icon(Icons.save_outlined),
                label: const Text('Günü Kaydet'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  elevation: 0,
                ),
              ),
              SizedBox(width: 8.w),
              OutlinedButton.icon(
                onPressed: _deleteSingle,
                icon: const Icon(Icons.delete_outline),
                label: const Text('Sil'),
                style: OutlinedButton.styleFrom(
                  padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  side: BorderSide(color: Colors.red[400]!),
                  foregroundColor: Colors.red[700],
                ),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          Divider(height: 1.h),
          SizedBox(height: 12.h),
          // Range apply
          Text('Tarih Aralığına Uygula', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700)),
          SizedBox(height: 8.h),
          Row(
            children: [
              Expanded(
                child: _dateField(
                  label: 'Başlangıç',
                  value: rangeStart != null ? _displayDate(rangeStart!) : 'Seçiniz',
                  onTap: () async {
                    final d = await _pickDate(initial: DateTime.now());
                    if (d != null) setState(() => rangeStart = d);
                  },
                ),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: _dateField(
                  label: 'Bitiş',
                  value: rangeEnd != null ? _displayDate(rangeEnd!) : 'Seçiniz',
                  onTap: () async {
                    final d = await _pickDate(initial: (rangeStart ?? DateTime.now()));
                    if (d != null) setState(() => rangeEnd = d);
                  },
                ),
              ),
            ],
          ),
          SizedBox(height: 8.h),
          _textField(
            label: 'Aralık Kapasitesi (kişi)',
            controller: rangeCapacityController,
            keyboardType: TextInputType.number,
          ),
          SizedBox(height: 8.h),
          Row(
            children: [
              Checkbox(
                value: rangeIsAvailable,
                onChanged: (v) => setState(() => rangeIsAvailable = v ?? true),
                activeColor: Theme.of(context).primaryColor,
              ),
              const Text('Aralık Müsait')
            ],
          ),
          SizedBox(height: 8.h),
          Align(
            alignment: Alignment.centerLeft,
            child: ElevatedButton.icon(
              onPressed: _applyRange,
              icon: const Icon(Icons.calendar_month_outlined),
              label: const Text('Aralığa Uygula'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                elevation: 0,
              ),
            ),
          ),
          SizedBox(height: 12.h),
          Divider(height: 1.h),
          SizedBox(height: 12.h),
          Center(
            child: Text(
              'Tarihe dokunarak kapasiteyi düzenleyin ve kaydedin.',
              style: TextStyle(color: Colors.grey[700]),
              textAlign: TextAlign.center,
            ),
          ),
          ],
        ),
      ),
    );
  }

  // Upcoming list removed; selection handled by EasyDateTimeLine

  Future<DateTime?> _pickDate({required DateTime initial}) async {
    return showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime.now().subtract(const Duration(days: 0)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
  }

  Future<void> _saveSingle() async {
    final cap = int.tryParse(capacityController.text.trim());
    if (cap == null) {
      Get.snackbar('Hata', 'Geçerli bir kapasite giriniz', backgroundColor: Colors.orange[600], colorText: Colors.white);
      return;
    }
    final dateKey = _fmt(selectedDate);
    final availability = DailyAvailability(
      date: dateKey,
      totalRooms: cap, // kişi bazlı toplam kapasite
      availableRooms: cap, // kişi bazlı müsait kapasite
      isAvailable: isAvailable,
    );
    await controller.updateHotelAvailability(widget.hotel.id!, dateKey, availability);
    await controller.loadHotels();
    final list = controller.hotels.where((h) => h.id == widget.hotel.id).toList();
    if (list.isNotEmpty) {
      final updated = list.first;
      setState(() {
        widget.hotel.availability.clear();
        widget.hotel.availability.addAll(updated.availability);
      });
    }
  }

  Future<void> _applyRange() async {
    final cap = int.tryParse(rangeCapacityController.text.trim());
    if (cap == null || rangeStart == null || rangeEnd == null) {
      Get.snackbar('Hata', 'Başlangıç, bitiş ve aralık kapasitesi zorunludur', backgroundColor: Colors.orange[600], colorText: Colors.white);
      return;
    }
    if (!rangeStart!.isBefore(rangeEnd!)) {
      Get.snackbar('Hata', 'Bitiş tarihi başlangıçtan büyük olmalıdır', backgroundColor: Colors.orange[600], colorText: Colors.white);
      return;
    }
    final Map<String, DailyAvailability> map = {};
    for (DateTime d = rangeStart!; d.isBefore(rangeEnd!.add(const Duration(days: 1))); d = d.add(const Duration(days: 1))) {
      final key = _fmt(d);
      map[key] = DailyAvailability(
        date: key,
        totalRooms: cap,
        availableRooms: cap,
        isAvailable: rangeIsAvailable,
      );
    }
    await controller.updateBulkAvailability(widget.hotel.id!, map);
    await controller.loadHotels();
    final list = controller.hotels.where((h) => h.id == widget.hotel.id).toList();
    if (list.isNotEmpty) {
      final updated = list.first;
      setState(() {
        widget.hotel.availability.clear();
        widget.hotel.availability.addAll(updated.availability);
        // Eğer mevcut seçili gün aralık içindeyse üstteki tekil alanı da güncelle
        if (selectedDate.isAfter(rangeStart!.subtract(const Duration(days: 1))) && selectedDate.isBefore(rangeEnd!.add(const Duration(days: 1)))) {
          capacityController.text = cap.toString();
          isAvailable = rangeIsAvailable;
        }
      });
    }
  }

  Future<void> _deleteSingle() async {
    // Deleting a single day can be implemented by setting capacity 0 or isAvailable=false
    final dateKey = _fmt(selectedDate);
    final availability = DailyAvailability(
      date: dateKey,
      totalRooms: 0,
      availableRooms: 0,
      isAvailable: false,
    );
    await controller.updateHotelAvailability(widget.hotel.id!, dateKey, availability);
    await controller.loadHotels();
    final list = controller.hotels.where((h) => h.id == widget.hotel.id).toList();
    if (list.isNotEmpty) {
      final updated = list.first;
      setState(() {
        widget.hotel.availability.clear();
        widget.hotel.availability.addAll(updated.availability);
        capacityController.clear();
        isAvailable = true;
      });
    }
  }

  String _fmt(DateTime d) => d.toIso8601String().split('T').first;
  String _displayDate(DateTime d) => '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';

  Widget _dateField({required String label, required String value, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: Colors.grey[300]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12.sp, color: Colors.grey[600])),
            SizedBox(height: 6.h),
            Row(
              children: [
                Icon(Icons.calendar_today, size: 16.sp, color: Colors.grey[700]),
                SizedBox(width: 8.w),
                Expanded(child: Text(value, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _textField({required String label, required TextEditingController controller, TextInputType? keyboardType}) {
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 12.sp, color: Colors.grey[600])),
          SizedBox(height: 6.h),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            decoration: const InputDecoration(
              isDense: true,
              border: InputBorder.none,
            ),
          ),
        ],
      ),
    );
  }
}
 
