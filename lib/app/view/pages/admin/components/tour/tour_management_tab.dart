// Full Tour management tab with availability handling
import 'package:easy_date_timeline/easy_date_timeline.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/admin/tour_admin_controller.dart';
import '../../../../../data/models/tour/tour_model.dart';
import '../../../../themes/theme.dart';
import '../../../../widgets/admin/review_moderation_sheet.dart';
import 'tour_add_form.dart';
import 'tour_card_item.dart';

class TourManagementTab extends StatefulWidget {
	const TourManagementTab({super.key});
	@override
	State<TourManagementTab> createState() => _TourManagementTabState();
}

class _TourManagementTabState extends State<TourManagementTab> with SingleTickerProviderStateMixin {
	late final TourAdminController controller;
	late final TabController _tabController;

	@override
	void initState() {
		super.initState();
		controller = Get.put(TourAdminController());
		_tabController = TabController(length: 2, vsync: this);
	}

	@override
	void dispose() {
		_tabController.dispose();
		super.dispose();
	}

	/// Turları tarihe göre ayır ve sırala
	List<TourModel> _getUpcomingTours(List<TourModel> tours) {
		final now = DateTime.now();
		final today = DateTime(now.year, now.month, now.day);
		return tours.where((t) {
			final tourDate = t.startDate ?? t.endDate;
			if (tourDate == null) return true; // Tarihsiz turlar güncel sayılır
			return !tourDate.isBefore(today);
		}).toList()
		..sort((a, b) {
			final aDate = a.startDate ?? a.endDate ?? DateTime(2100);
			final bDate = b.startDate ?? b.endDate ?? DateTime(2100);
			return aDate.compareTo(bDate); // Yaklaşan tarihler önce
		});
	}

	List<TourModel> _getPastTours(List<TourModel> tours) {
		final now = DateTime.now();
		final today = DateTime(now.year, now.month, now.day);
		return tours.where((t) {
			final tourDate = t.endDate ?? t.startDate;
			if (tourDate == null) return false;
			return tourDate.isBefore(today);
		}).toList()
		..sort((a, b) {
			final aDate = a.endDate ?? a.startDate ?? DateTime(1900);
			final bDate = b.endDate ?? b.startDate ?? DateTime(1900);
			return bDate.compareTo(aDate); // En son geçenler önce
		});
	}

	@override
	Widget build(BuildContext context) {
		final isDark = Theme.of(context).brightness == Brightness.dark;
		return Padding(
			padding: EdgeInsets.fromLTRB(16.w,16.h,16.w,0),
			child: Column(
				crossAxisAlignment: CrossAxisAlignment.start,
				children:[
					Row(children:[
						Text('Turlar', style: TextStyle(fontSize:20.sp,fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)),
						const Spacer(),
						ElevatedButton.icon(onPressed: _openAddSheet, icon: const Icon(Icons.add), label: const Text('Yeni Tur'), style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(horizontal:14.w, vertical:10.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)), elevation:0),)
					]),
					SizedBox(height:12.h),
					// İç Tab Bar
					Container(
						decoration: BoxDecoration(
							color: isDark ? Colors.grey[850] : Colors.grey[200],
							borderRadius: BorderRadius.circular(12.r),
						),
						child: TabBar(
							controller: _tabController,
							indicator: BoxDecoration(
								color: AppColors.medinaGreen40,
								borderRadius: BorderRadius.circular(10.r),
							),
							indicatorSize: TabBarIndicatorSize.tab,
							dividerColor: Colors.transparent,
							labelColor: Colors.white,
							unselectedLabelColor: isDark ? Colors.grey[400] : Colors.grey[700],
							labelStyle: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600),
							unselectedLabelStyle: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w500),
							padding: EdgeInsets.all(4.w),
							tabs: [
								Tab(
									child: Row(
										mainAxisAlignment: MainAxisAlignment.center,
										children: [
											Icon(Icons.upcoming, size: 16.sp),
											SizedBox(width: 6.w),
											const Text('Güncel Turlar'),
										],
									),
								),
								Tab(
									child: Row(
										mainAxisAlignment: MainAxisAlignment.center,
										children: [
											Icon(Icons.history, size: 16.sp),
											SizedBox(width: 6.w),
											const Text('Geçmiş Turlar'),
										],
									),
								),
							],
						),
					),
					SizedBox(height:12.h),
					Expanded(
						child: Obx((){
							if (controller.isLoading.value) return const Center(child: CircularProgressIndicator());
							if (controller.tours.isEmpty) return Center(child: Column(mainAxisSize: MainAxisSize.min, children:[Icon(Icons.tour, size:48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]), SizedBox(height:8.h), Text('Henüz tur yok', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]))]));
							
							final upcomingTours = _getUpcomingTours(controller.tours);
							final pastTours = _getPastTours(controller.tours);
							
							return TabBarView(
								controller: _tabController,
								children: [
									// Güncel Turlar
									upcomingTours.isEmpty
										? Center(child: Column(mainAxisSize: MainAxisSize.min, children:[
											Icon(Icons.event_available, size:48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
											SizedBox(height:8.h),
											Text('Yaklaşan tur yok', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]))
										]))
										: ListView.separated(
											itemCount: upcomingTours.length,
											separatorBuilder: (_, __)=> SizedBox(height:8.h),
											itemBuilder: (c,i) => _buildTourCard(upcomingTours[i]),
										),
									// Geçmiş Turlar
									pastTours.isEmpty
										? Center(child: Column(mainAxisSize: MainAxisSize.min, children:[
											Icon(Icons.history, size:48.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
											SizedBox(height:8.h),
											Text('Geçmiş tur yok', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]))
										]))
										: ListView.separated(
											itemCount: pastTours.length,
											separatorBuilder: (_, __)=> SizedBox(height:8.h),
											itemBuilder: (c,i) => _buildTourCard(pastTours[i], isPast: true),
										),
								],
							);
						}),
					),
				]
			),
		);
	}

	Widget _buildTourCard(TourModel t, {bool isPast = false}) {
		return Opacity(
			opacity: isPast ? 0.7 : 1.0,
			child: TourCardItem(
				tour: t,
				onEdit: ()=> _openAddSheet(edit: t),
				onAvailability: ()=> _openAvailabilitySheet(t),
				onDelete: ()=> _confirmDelete(t),
				onReviews: () {
					final id = t.id;
					if (id != null) {
						ReviewModerationSheet.show(
							type: 'tour',
							targetId: id,
							title: t.title,
						);
					}
				},
			),
		);
	}
	void _openAddSheet({TourModel? edit}){ controller.select(edit); final isDark = Get.isDarkMode; Get.bottomSheet(Container(height: Get.height*0.9, decoration: BoxDecoration(color: isDark ? const Color(0xFF1E1E1E) : Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(20.r), topRight: Radius.circular(20.r)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: isDark ? .2 : .1), blurRadius:10, offset: const Offset(0,-5))]), child: SafeArea(
          bottom: false,top:false, child: Column(children:[ Container(margin: EdgeInsets.only(top:8.h,bottom:8.h), width:40.w,height:4.h, decoration: BoxDecoration(color: isDark ? Colors.grey[700] : Colors.grey[300], borderRadius: BorderRadius.circular(2.r))), Padding(padding: EdgeInsets.symmetric(horizontal:16.w, vertical:8.h), child: Row(children:[ Expanded(child: Text(edit==null? 'Yeni Tur' : 'Tur Düzenle', style: TextStyle(fontSize:18.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87))), IconButton(onPressed: ()=> Navigator.of(Get.overlayContext!).pop(), icon: Icon(Icons.close_rounded, color: isDark ? Colors.grey[400] : Colors.grey[700])) ])), Divider(height:1.h, color: isDark ? Colors.grey[800] : Colors.grey[300]), const Expanded(child: TourAddForm()) ]))), isScrollControlled: true, isDismissible: false, enableDrag: false); }
	void _openAvailabilitySheet(TourModel t){ final isDark = Get.isDarkMode; Get.bottomSheet(Container(height: Get.height*0.8, decoration: BoxDecoration(color: isDark ? const Color(0xFF1E1E1E) : Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(20.r), topRight: Radius.circular(20.r)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: isDark ? .2 : .1), blurRadius:10, offset: const Offset(0,-5))]), child: SafeArea(
          bottom: false,top:false, child: Column(children:[ Container(margin: EdgeInsets.only(top:8.h,bottom:8.h), width:40.w,height:4.h, decoration: BoxDecoration(color: isDark ? Colors.grey[700] : Colors.grey[300], borderRadius: BorderRadius.circular(2.r))), Padding(padding: EdgeInsets.symmetric(horizontal:16.w, vertical:8.h), child: Row(children:[ Expanded(child: Text('${t.title} - Müsaitlik', style: TextStyle(fontSize:18.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87), maxLines:1, overflow: TextOverflow.ellipsis)), IconButton(onPressed: ()=> Navigator.of(Get.overlayContext!).pop(), icon: Icon(Icons.close_rounded, color: isDark ? Colors.grey[400] : Colors.grey[700])) ])), Divider(height:1.h, color: isDark ? Colors.grey[800] : Colors.grey[300]), Expanded(child: _TourAvailabilitySheet(tour: t)) ]))), isScrollControlled: true); }
	void _confirmDelete(TourModel t){ Get.dialog(AlertDialog(title: const Text('Turu Sil'), content: Text('${t.title} silinsin mi?'), actions:[ TextButton(onPressed: ()=> Navigator.of(Get.overlayContext!).pop(), child: const Text('İptal')), ElevatedButton(onPressed: (){ Navigator.of(Get.overlayContext!).pop(); controller.delete(t.id!); }, style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white), child: const Text('Sil')) ])); }
}

class _TourAvailabilitySheet extends StatefulWidget { const _TourAvailabilitySheet({required this.tour}); final TourModel tour; @override State<_TourAvailabilitySheet> createState()=> _TourAvailabilitySheetState(); }
class _TourAvailabilitySheetState extends State<_TourAvailabilitySheet> {
	late final TourAdminController controller; DateTime selectedDate = DateTime.now(); final TextEditingController capCtrl = TextEditingController(); final TextEditingController specialCtrl = TextEditingController(); bool isAvailable = true; DateTime? rangeStart; DateTime? rangeEnd; bool rangeAvailable = true; final TextEditingController rangeCapCtrl = TextEditingController(); final TextEditingController rangeSpecialCtrl = TextEditingController(); late Map<String, TourDailyAvailability> _local;
	@override void initState(){ super.initState(); controller = Get.find<TourAdminController>(); _local = Map<String, TourDailyAvailability>.from(widget.tour.availability); _prefill(); }
	void _prefill(){ final key = _fmt(selectedDate); final a = _local[key]; capCtrl.text = a?.capacity.toString() ?? ''; specialCtrl.text = a?.specialPrice?.toStringAsFixed(0) ?? ''; isAvailable = a?.isAvailable ?? true; }
	@override void dispose(){ capCtrl.dispose(); specialCtrl.dispose(); rangeCapCtrl.dispose(); rangeSpecialCtrl.dispose(); super.dispose(); }
	@override Widget build(BuildContext context){ return Padding(padding: EdgeInsets.only(left:16.w,right:16.w,top:12.h, bottom: MediaQuery.of(context).viewInsets.bottom+12.h), child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[ Text('Gün Seçimi', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700)), SizedBox(height:8.h), EasyDateTimeLine(initialDate: selectedDate, onDateChange: (d){ setState((){ selectedDate = d; _prefill(); }); }, activeColor: AppColors.medinaGreen40, headerProps: const EasyHeaderProps(monthPickerType: MonthPickerType.switcher), dayProps: EasyDayProps(dayStructure: DayStructure.dayNumDayStr, activeDayStyle: DayStyle(decoration: BoxDecoration(color: Colors.blue, borderRadius: BorderRadius.circular(10)), dayNumStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700), dayStrStyle: const TextStyle(color: Colors.white))),), SizedBox(height:12.h), Row(children:[ Expanded(child: _field('Kapasite', capCtrl, TextInputType.number)), SizedBox(width:12.w), Expanded(child: _field('Özel Fiyat', specialCtrl, TextInputType.number)), ]), Row(children:[ Checkbox(value: isAvailable, onChanged: (v)=> setState(()=> isAvailable = v ?? true)), const Text('Müsait') ]), SizedBox(height:8.h), SizedBox(width: double.infinity, height:44.h, child: ElevatedButton.icon(onPressed: _saveSingle, icon: const Icon(Icons.save_outlined), label: const Text('Günü Kaydet'), style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)), elevation:0))), SizedBox(height:16.h), const Divider(), SizedBox(height:8.h), Text('Tarih Aralığına Uygula', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700)), SizedBox(height:8.h), Row(children:[ Expanded(child: _rangeDate('Başlangıç', rangeStart, _pickStart)), SizedBox(width:12.w), Expanded(child: _rangeDate('Bitiş', rangeEnd, _pickEnd)), ]), SizedBox(height:8.h), Row(children:[ Expanded(child: _field('Günlük Kapasite', rangeCapCtrl, TextInputType.number)), SizedBox(width:12.w), Expanded(child: _field('Özel Fiyat', rangeSpecialCtrl, TextInputType.number)), ]), Row(children:[ Checkbox(value: rangeAvailable, onChanged: (v)=> setState(()=> rangeAvailable = v ?? true)), const Text('Müsait') ]), SizedBox(height:8.h), SizedBox(width: double.infinity, height:44.h, child: ElevatedButton.icon(onPressed: _applyRange, icon: const Icon(Icons.date_range), label: const Text('Aralığa Uygula'), style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)), elevation:0))), ]))); }
	Widget _field(String label, TextEditingController c, TextInputType k){ return Focus(child: Builder(builder: (context){ final hasFocus = Focus.of(context).hasFocus; final borderColor = hasFocus ? AppColors.medinaGreen40 : Colors.grey[400]!; return AnimatedContainer(duration: const Duration(milliseconds:150), padding: EdgeInsets.symmetric(horizontal:14.w, vertical:10.h), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: borderColor, width: hasFocus?2:1.2), borderRadius: BorderRadius.circular(14.r), boxShadow: [ if (hasFocus) BoxShadow(color: AppColors.medinaGreen40.withValues(alpha:.15), blurRadius:8, offset: const Offset(0,2)) ]), child: TextField(controller: c, keyboardType: k, style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w600), decoration: InputDecoration(labelText: label, labelStyle: TextStyle(fontSize:11.sp, color: hasFocus? AppColors.medinaGreen40 : Colors.grey[700]), border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.zero))); })); }
	Widget _rangeDate(String label, DateTime? d, VoidCallback onTap){ final value = d==null? 'Seçiniz' : '${d.day.toString().padLeft(2,'0')}.${d.month.toString().padLeft(2,'0')}.${d.year}'; return GestureDetector(onTap: onTap, child: Builder(builder: (context){ final highlight = d!=null; final borderColor = highlight? AppColors.medinaGreen40 : Colors.grey[400]!; return AnimatedContainer(duration: const Duration(milliseconds:150), padding: EdgeInsets.symmetric(horizontal:14.w, vertical:10.h), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: borderColor, width: highlight?2:1.2), borderRadius: BorderRadius.circular(14.r), boxShadow: [ if (highlight) BoxShadow(color: AppColors.medinaGreen40.withValues(alpha:.12), blurRadius:6, offset: const Offset(0,2)) ]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[ Text(label, style: TextStyle(fontSize:11.sp, color: highlight? AppColors.medinaGreen40 : Colors.grey[700], fontWeight: FontWeight.w600)), SizedBox(height:4.h), Row(children:[ Icon(Icons.calendar_today, size:16.sp, color: highlight? AppColors.medinaGreen40 : Colors.grey[700]), SizedBox(width:8.w), Text(value, style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w700)) ]) ])); })); }
	String _fmt(DateTime d)=> d.toIso8601String().split('T').first; Future<void> _saveSingle() async { final cap = int.tryParse(capCtrl.text.trim()); final special = double.tryParse(specialCtrl.text.trim()); if (cap==null){ Get.snackbar('Hata','Geçerli kapasite'); return;} final key = _fmt(selectedDate); final a = TourDailyAvailability(date: key, isAvailable: isAvailable, capacity: cap, specialPrice: special); await controller.updateAvailability(widget.tour.id!, key, a); _local[key] = a; setState((){ capCtrl.text = cap.toString(); specialCtrl.text = special?.toStringAsFixed(0) ?? ''; isAvailable = a.isAvailable; }); Get.snackbar('Başarılı','Kaydedildi'); }
	Future<void> _pickStart() async { final d = await showDatePicker(context: context, initialDate: rangeStart ?? DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days:365))); if (d!=null) setState(()=> rangeStart = d); }
	Future<void> _pickEnd() async { final base = rangeStart ?? DateTime.now(); final d = await showDatePicker(context: context, initialDate: rangeEnd ?? base.add(const Duration(days:1)), firstDate: base, lastDate: DateTime.now().add(const Duration(days:365))); if (d!=null) setState(()=> rangeEnd = d); }
	Future<void> _applyRange() async { final cap = int.tryParse(rangeCapCtrl.text.trim()); final special = double.tryParse(rangeSpecialCtrl.text.trim()); if (rangeStart==null || rangeEnd==null || cap==null){ Get.snackbar('Hata','Başlangıç/bitiş ve kapasite gerekli'); return;} if (!rangeEnd!.isAfter(rangeStart!)){ Get.snackbar('Hata','Bitiş başlangıçtan sonra olmalı'); return;} final map = <String, TourDailyAvailability>{}; for(DateTime d = rangeStart!; d.isBefore(rangeEnd!); d = d.add(const Duration(days:1))){ final key = _fmt(d); map[key] = TourDailyAvailability(date: key, isAvailable: rangeAvailable, capacity: cap, specialPrice: special); } await controller.updateAvailabilityBulk(widget.tour.id!, map); setState((){ _local.addAll(map); final selKey = _fmt(selectedDate); final updated = _local[selKey]; if (updated!=null){ capCtrl.text = updated.capacity.toString(); specialCtrl.text = updated.specialPrice?.toStringAsFixed(0) ?? ''; isAvailable = updated.isAvailable; } }); Get.snackbar('Başarılı','Aralığa uygulandı'); }
}
