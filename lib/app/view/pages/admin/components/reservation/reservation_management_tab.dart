import 'package:flutter/material.dart';
import '../../../../themes/theme.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/admin/reservation_admin_controller.dart';
import '../../../../../data/models/reservation/reservation_model.dart';
import 'reservation_detail_sheet.dart';

class ReservationManagementTab extends StatefulWidget {
  const ReservationManagementTab({super.key});
  @override
  State<ReservationManagementTab> createState() =>
      _ReservationManagementTabState();
}

class _ReservationManagementTabState extends State<ReservationManagementTab> {
  late final ReservationAdminController controller;

  static const _statusLabels = <String, String>{
    'pending': 'Beklemede',
    'confirmed': 'Onaylandı',
    'cancelled': 'İptal',
    'completed': 'Tamamlandı',
  };

  @override
  void initState() {
    super.initState();
    controller = Get.put(ReservationAdminController());
  }

  @override
  void dispose() {
    if (Get.isRegistered<ReservationAdminController>()) {
      Get.delete<ReservationAdminController>();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _topFilters(),
        _typeFilters(),
        _searchBar(),
        Expanded(child: Obx(() => _list())),
      ],
    );
  }

  Widget _searchBar() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 4.h, 16.w, 4.h),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Ara (başlık, alt başlık, kullanıcı)...',
          hintStyle: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]),
          prefixIcon: Icon(Icons.search, color: isDark ? Colors.grey[400] : Colors.grey[600]),
          filled: true,
          fillColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          contentPadding: EdgeInsets.symmetric(vertical: 12.h),
        ),
        style: TextStyle(color: isDark ? Colors.white : Colors.black87),
        onChanged: controller.setSearch,
      ),
    );
  }

  Widget _chip({
    required String label,
    bool active = false,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = AppColors.medinaGreen40;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        alignment: Alignment.center,
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: active ? primaryColor : (isDark ? const Color(0xFF1E1E1E) : Colors.white),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: active ? primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
          ),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: primaryColor.withOpacity(.25),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : (isDark ? Colors.grey[300] : Colors.black87),
            fontWeight: FontWeight.w600,
            fontSize: 12.sp,
          ),
        ),
      ),
    );
  }

  Widget _topFilters() {
    return Obx(() {
      final current = controller.filterStatus.value;
      final items = <Widget>[
        _chip(
          label: 'Hepsi',
          active: current.isEmpty,
          onTap: () => controller.setStatus(''),
        ),
        ..._statusLabels.entries.map(
          (e) => _chip(
            label: e.value,
            active: current == e.key,
            onTap: () => controller.setStatus(e.key),
          ),
        ),
      ];
      return SizedBox(
        height: 56.h,
        child: ListView.separated(
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
          scrollDirection: Axis.horizontal,
          itemBuilder: (_, i) => items[i],
          separatorBuilder: (_, __) => SizedBox(width: 10.w),
          itemCount: items.length,
        ),
      );
    });
  }

  Widget _typeFilters() {
    return Obx(() {
      final t = controller.filterType.value;
      final types = <ReservationType?>[
        null,
        ReservationType.hotel,
        ReservationType.car,
        ReservationType.transfer,
        ReservationType.tour,
        ReservationType.guide,
      ];
      final labels = <ReservationType?, String>{
        null: 'Tümü',
        ReservationType.hotel: 'Otel',
        ReservationType.car: 'Araç',
        ReservationType.transfer: 'Transfer',
        ReservationType.tour: 'Tur',
        ReservationType.guide: 'Rehber',
      };
      return SizedBox(
        height: 48.h,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          clipBehavior: Clip.none,
          padding: EdgeInsets.fromLTRB(16.w, 4.h, 16.w, 4.h),
          itemBuilder: (_, i) {
            final type = types[i];
            return _chip(
              label: labels[type]!,
              active: t == type,
              onTap: () => controller.setType(type),
            );
          },
          separatorBuilder: (_, __) => SizedBox(width: 8.w),
          itemCount: types.length,
        ),
      );
    });
  }

  Widget _list() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final list = controller.filtered;
    if (list.isEmpty) {
      return Center(
        child: Text(
          'Kayıt bulunamadı',
          style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]),
        ),
      );
    }
    return ListView.separated(
      padding: EdgeInsets.fromLTRB(16.w, 8.h, 16.w, 64.h),
      itemBuilder: (_, i) {
        final r = list[i];
        return _item(r);
      },
      separatorBuilder: (_, __) => SizedBox(height: 10.h),
      itemCount: list.length,
    );
  }

  Widget _item(ReservationModel r) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final statusColor = _statusColor(r.status);
    return GestureDetector(
      onTap: () => ReservationDetailSheet.show(r, controller),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[300]!),
        ),
        padding: EdgeInsets.all(14.w),
        child: Row(
          children: [
            _leadingIcon(r.type),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    r.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14.sp,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    r.subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11.5.sp,
                      color: Colors.grey[600],
                    ),
                  ),
                  SizedBox(height: 6.h),
                  Row(
                    children: [
                      Icon(
                        Icons.date_range,
                        size: 14.sp,
                        color: Colors.grey[600],
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        _dateRange(r),
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(width: 12.w),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(.12),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _statusLabels[r.status] ?? r.status,
                style: TextStyle(
                  fontSize: 11.sp,
                  fontWeight: FontWeight.w600,
                  color: statusColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'confirmed':
        return Colors.green[700]!;
      case 'pending':
        return Colors.orange[700]!;
      case 'cancelled':
        return Colors.red[600]!;
      case 'completed':
        return Colors.blue[700]!;
      default:
        return Colors.grey[700]!;
    }
  }

  String _dateRange(ReservationModel r) {
    String f(DateTime d) =>
        '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}';
    if (r.startDate.year == r.endDate.year &&
        r.startDate.month == r.endDate.month &&
        r.startDate.day == r.endDate.day) {
      return f(r.startDate);
    }
    return '${f(r.startDate)} - ${f(r.endDate)}';
  }

  Widget _leadingIcon(ReservationType t) {
    IconData icon;
    Color color;
    switch (t) {
      case ReservationType.hotel:
        icon = Icons.hotel;
        color = Colors.indigo;
        break;
      case ReservationType.car:
        icon = Icons.directions_car;
        color = Colors.teal;
        break;
      case ReservationType.transfer:
        icon = Icons.airport_shuttle;
        color = Colors.deepOrange;
        break;
      case ReservationType.tour:
        icon = Icons.card_travel;
        color = Colors.purple;
        break;
      case ReservationType.guide:
        icon = Icons.person_pin_circle;
        color = Colors.blueGrey;
        break;
    }
    return Container(
      width: 46.w,
      height: 46.w,
      decoration: BoxDecoration(
        color: color.withOpacity(.12),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(icon, color: color, size: 24.sp),
    );
  }
}
