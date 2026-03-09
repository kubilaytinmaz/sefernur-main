import 'package:easy_date_timeline/easy_date_timeline.dart';
import 'package:flutter/material.dart';
import '../../../../themes/theme.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/admin/guide_admin_controller.dart';
import '../../../../../data/models/guide/guide_model.dart';
import '../../../../widgets/admin/review_moderation_sheet.dart';
import 'guide_add_form.dart';
import 'guide_card_item.dart';

class GuideManagementTab extends GetView<GuideAdminController> {
  const GuideManagementTab({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    Get.put(GuideAdminController());
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
        Row(children:[
          Text('Rehberler', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)),
          const Spacer(),
          ElevatedButton.icon(
            onPressed: ()=> _openAddSheet(),
            icon: const Icon(Icons.add),
            label: const Text('Yeni Rehber'),
            style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(horizontal:14.w, vertical:10.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)), elevation:0),
          ),
        ]),
        SizedBox(height:12.h),
        Expanded(child: Obx((){
          if (controller.isLoading.value) return const Center(child: CircularProgressIndicator());
          if (controller.guides.isEmpty) return Center(child: Column(mainAxisSize: MainAxisSize.min, children:[Icon(Icons.person_pin_circle, size:48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]), SizedBox(height:8.h), Text('Henüz rehber yok', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]))]));
          return ListView.separated(
            itemBuilder: (_,i){
              final g = controller.guides[i];
              return GuideCardItem(
                guide: g,
                onEdit: ()=> _openAddSheet(edit: g),
                onAvailability: ()=> _openAvailabilitySheet(g),
                onDelete: ()=> _confirmDelete(g),
                onReviews: () {
                  final id = g.id;
                  if (id != null) {
                    ReviewModerationSheet.show(
                      type: 'guide',
                      targetId: id,
                      title: g.name,
                    );
                  }
                },
              );
            },
            separatorBuilder: (_, __)=> SizedBox(height:8.h),
            itemCount: controller.guides.length,
          );
        }))
      ]),
    );
  }

  void _openAddSheet({GuideModel? edit}) {
    controller.select(edit);
    final isDark = Get.isDarkMode;
    Get.bottomSheet(
      Container(
        height: Get.height * 0.9,
        decoration: BoxDecoration(color: isDark ? const Color(0xFF1E1E1E) : Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(20.r), topRight: Radius.circular(20.r)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(
          bottom: false,top:false, child: Column(children:[
          Container(margin: EdgeInsets.only(top:8.h,bottom:8.h), width: 40.w, height:4.h, decoration: BoxDecoration(color: isDark ? Colors.grey[700] : Colors.grey[300], borderRadius: BorderRadius.circular(2.r))),
            Padding(padding: EdgeInsets.symmetric(horizontal:16.w, vertical:8.h), child: Row(children:[
            Expanded(child: Text(edit==null? 'Yeni Rehber' : 'Rehber Düzenle', style: TextStyle(fontSize:18.sp,fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)) ),
            IconButton(onPressed: ()=> Navigator.of(Get.overlayContext!).pop(), icon: Icon(Icons.close_rounded, color: isDark ? Colors.white : Colors.black87))
          ])),
          Divider(height:1.h, color: isDark ? Colors.grey[700] : null),
          const Expanded(child: GuideAddForm())
        ])),
      ),
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
    );
  }

  void _openAvailabilitySheet(GuideModel g) {
    final isDark = Get.isDarkMode;
    Get.bottomSheet(
      Container(
        height: Get.height * 0.8,
        decoration: BoxDecoration(color: isDark ? const Color(0xFF1E1E1E) : Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(20.r), topRight: Radius.circular(20.r)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(
          bottom: false,top:false, child: Column(children:[
          Container(margin: EdgeInsets.only(top:8.h,bottom:8.h), width: 40.w, height:4.h, decoration: BoxDecoration(color: isDark ? Colors.grey[700] : Colors.grey[300], borderRadius: BorderRadius.circular(2.r))),
          Padding(padding: EdgeInsets.symmetric(horizontal:16.w, vertical:8.h), child: Row(children:[
            Expanded(child: Text('${g.name} - Müsaitlik', style: TextStyle(fontSize:18.sp,fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87), maxLines: 1, overflow: TextOverflow.ellipsis)),
            IconButton(onPressed: ()=> Navigator.of(Get.overlayContext!).pop(), icon: Icon(Icons.close_rounded, color: isDark ? Colors.white : Colors.black87)),
          ])),
          Divider(height:1.h, color: isDark ? Colors.grey[700] : null),
          Expanded(child: _GuideAvailabilitySheet(guide: g))
        ])),
      ),
      isScrollControlled: true,
    );
  }

  void _confirmDelete(GuideModel g) {
    Get.dialog(AlertDialog(title: const Text('Rehberi Sil'), content: Text('${g.name} silinsin mi?'), actions: [
      TextButton(onPressed: ()=> Navigator.of(Get.overlayContext!).pop(), child: const Text('İptal')),
      ElevatedButton(onPressed: (){ Navigator.of(Get.overlayContext!).pop(); controller.delete(g.id!); }, style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white), child: const Text('Sil')),
    ]));
  }
}

class _GuideAvailabilitySheet extends StatefulWidget { const _GuideAvailabilitySheet({required this.guide}); final GuideModel guide; @override State<_GuideAvailabilitySheet> createState()=> _GuideAvailabilitySheetState(); }
class _GuideAvailabilitySheetState extends State<_GuideAvailabilitySheet> {
  late final GuideAdminController controller; DateTime selectedDate = DateTime.now(); final TextEditingController specialCtrl = TextEditingController(); bool isAvailable = true; DateTime? rangeStart; DateTime? rangeEnd; bool rangeAvailable = true; final TextEditingController rangeSpecialCtrl = TextEditingController(); late Map<String, GuideDailyAvailability> _local;
  @override void initState(){ super.initState(); controller = Get.find<GuideAdminController>(); _local = Map<String, GuideDailyAvailability>.from(widget.guide.availability); _prefill(); }
  void _prefill(){ final key = _fmt(selectedDate); final a = _local[key]; specialCtrl.text = a?.specialRate?.toStringAsFixed(0) ?? ''; isAvailable = a?.isAvailable ?? true; }
  @override void dispose(){ specialCtrl.dispose(); rangeSpecialCtrl.dispose(); super.dispose(); }
  @override Widget build(BuildContext context){ return Padding(padding: EdgeInsets.only(left:16.w,right:16.w,top:12.h,bottom: MediaQuery.of(context).viewInsets.bottom+12.h), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
    Text('Gün Seçimi', style: TextStyle(fontSize:14.sp,fontWeight: FontWeight.w700)), SizedBox(height:8.h),
    EasyDateTimeLine(initialDate: selectedDate, onDateChange: (d){ setState((){ selectedDate = d; _prefill(); }); }, activeColor: AppColors.medinaGreen40, headerProps: const EasyHeaderProps(monthPickerType: MonthPickerType.switcher), dayProps: EasyDayProps(dayStructure: DayStructure.dayNumDayStr, activeDayStyle: DayStyle(decoration: BoxDecoration(color: Colors.blue, borderRadius: BorderRadius.circular(10)), dayNumStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700), dayStrStyle: const TextStyle(color: Colors.white))),),
    SizedBox(height:12.h),
    _field('Özel Günlük Ücret', specialCtrl, TextInputType.number),
    Row(children:[ Checkbox(value: isAvailable, onChanged: (v)=> setState(()=> isAvailable = v ?? true)), const Text('Müsait') ]),
    SizedBox(height:8.h),
    SizedBox(width: double.infinity, height:44.h, child: ElevatedButton.icon(onPressed: _saveSingle, icon: const Icon(Icons.save_outlined), label: const Text('Günü Kaydet'), style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)), elevation:0))),
    SizedBox(height:16.h), const Divider(), SizedBox(height:8.h), Text('Tarih Aralığına Uygula', style: TextStyle(fontSize:14.sp,fontWeight: FontWeight.w700)), SizedBox(height:8.h),
    Row(children:[ Expanded(child: _rangeDate('Başlangıç', rangeStart, _pickStart)), SizedBox(width:12.w), Expanded(child: _rangeDate('Bitiş', rangeEnd, _pickEnd)), ]), SizedBox(height:8.h),
    _field('Özel Ücret', rangeSpecialCtrl, TextInputType.number),
    Row(children:[ Checkbox(value: rangeAvailable, onChanged: (v)=> setState(()=> rangeAvailable = v ?? true)), const Text('Müsait') ]),
    SizedBox(height:8.h),
    SizedBox(width: double.infinity, height:44.h, child: ElevatedButton.icon(onPressed: _applyRange, icon: const Icon(Icons.date_range), label: const Text('Aralığa Uygula'), style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)), elevation:0))),
  ]))); }
  Widget _field(String label, TextEditingController c, TextInputType k){
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return Focus(
      child: Builder(builder: (context){
        final hasFocus = Focus.of(context).hasFocus;
        final borderColor = hasFocus ? primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[400]!);
        return AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
          decoration: BoxDecoration(
            color: isDark ? Colors.grey[900] : Colors.white,
            border: Border.all(color: borderColor, width: hasFocus?2:1.2),
            borderRadius: BorderRadius.circular(14.r),
            boxShadow: [ if (hasFocus) BoxShadow(color: primaryColor.withValues(alpha:.15), blurRadius:8, offset: const Offset(0,2)) ],
          ),
          child: TextField(
            controller: c,
            keyboardType: k,
            style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87),
            decoration: InputDecoration(
              labelText: label,
              labelStyle: TextStyle(fontSize: 11.sp, color: hasFocus? primaryColor : (isDark ? Colors.grey[400] : Colors.grey[700])),
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.zero,
            ),
          ),
        );
      }),
    );
  }
  Widget _rangeDate(String label, DateTime? d, VoidCallback onTap){
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    final value = d==null? 'Seçiniz' : '${d.day.toString().padLeft(2,'0')}.${d.month.toString().padLeft(2,'0')}.${d.year}';
    return GestureDetector(
      onTap: onTap,
      child: Builder(builder: (context){
        final highlight = d!=null;
        final borderColor = highlight? primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[400]!);
        return AnimatedContainer(
          duration: const Duration(milliseconds:150),
          padding: EdgeInsets.symmetric(horizontal:14.w, vertical:10.h),
          decoration: BoxDecoration(
            color: isDark ? Colors.grey[900] : Colors.white,
            border: Border.all(color: borderColor, width: highlight?2:1.2),
            borderRadius: BorderRadius.circular(14.r),
            boxShadow: [ if (highlight) BoxShadow(color: primaryColor.withValues(alpha:.12), blurRadius:6, offset: const Offset(0,2)) ],
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
            Text(label, style: TextStyle(fontSize:11.sp, color: highlight? primaryColor : (isDark ? Colors.grey[400] : Colors.grey[700]), fontWeight: FontWeight.w600)),
            SizedBox(height:4.h),
            Row(children:[ Icon(Icons.calendar_today, size:16.sp, color: highlight? primaryColor : (isDark ? Colors.grey[400] : Colors.grey[700])), SizedBox(width:8.w), Text(value, style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)) ])
          ]),
        );
      }),
    );
  }
  String _fmt(DateTime d)=> d.toIso8601String().split('T').first;
  Future<void> _saveSingle() async { final special = double.tryParse(specialCtrl.text.trim()); final key = _fmt(selectedDate); final a = GuideDailyAvailability(date: key, isAvailable: isAvailable, specialRate: special); await controller.updateAvailability(widget.guide.id!, key, a); _local[key] = a; setState((){ specialCtrl.text = special?.toStringAsFixed(0) ?? ''; isAvailable = a.isAvailable; }); Get.snackbar('Başarılı','Kaydedildi'); }
  Future<void> _pickStart() async { final d = await showDatePicker(context: context, initialDate: rangeStart ?? DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days:365))); if (d!=null) setState(()=> rangeStart = d); }
  Future<void> _pickEnd() async { final base = rangeStart ?? DateTime.now(); final d = await showDatePicker(context: context, initialDate: rangeEnd ?? base.add(const Duration(days:1)), firstDate: base, lastDate: DateTime.now().add(const Duration(days:365))); if (d!=null) setState(()=> rangeEnd = d); }
  Future<void> _applyRange() async { if (rangeStart==null || rangeEnd==null){ Get.snackbar('Hata','Başlangıç ve bitiş gerekli'); return;} if (!rangeEnd!.isAfter(rangeStart!)){ Get.snackbar('Hata','Bitiş başlangıçtan sonra olmalı'); return;} final special = double.tryParse(rangeSpecialCtrl.text.trim()); final map = <String, GuideDailyAvailability>{}; for(DateTime d = rangeStart!; d.isBefore(rangeEnd!); d = d.add(const Duration(days:1))){ final key = _fmt(d); map[key] = GuideDailyAvailability(date: key, isAvailable: rangeAvailable, specialRate: special); } await controller.updateAvailabilityBulk(widget.guide.id!, map); setState((){ _local.addAll(map); final selKey = _fmt(selectedDate); final updated = _local[selKey]; if (updated!=null){ specialCtrl.text = updated.specialRate?.toStringAsFixed(0) ?? ''; isAvailable = updated.isAvailable; } }); Get.snackbar('Başarılı','Aralığa uygulandı'); }
}
