import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/admin/reservation_admin_controller.dart';
import '../../../../../data/models/reservation/reservation_model.dart';

class ReservationDetailSheet extends StatelessWidget {
  final ReservationModel model;
  final ReservationAdminController controller;
  const ReservationDetailSheet({
    super.key,
    required this.model,
    required this.controller,
  });

  static Future<void> show(
    ReservationModel m,
    ReservationAdminController c,
  ) async {
    final isDark = Get.isDarkMode;
    await Get.bottomSheet(
      ReservationDetailSheet(model: m, controller: c),
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final statusColor = _statusColor(model.status);
    return DraggableScrollableSheet(
      initialChildSize: .85,
      minChildSize: .5,
      maxChildSize: .95,
      expand: false,
      builder: (_, controllerSheet) => Padding(
        padding: EdgeInsets.fromLTRB(
          16.w,
          12.h,
          16.w,
          24.h + MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Column(
          children: [
            Container(
              width: 42,
              height: 5,
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[700] : Colors.grey[300],
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            SizedBox(height: 14.h),
            Row(
              children: [
                Expanded(
                  child: Text(
                    model.title,
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 6.h,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    model.status,
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 6.h),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                model.subtitle,
                style: TextStyle(fontSize: 12.5.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
              ),
            ),
            SizedBox(height: 14.h),
            Expanded(
              child: ListView(
                controller: controllerSheet,
                children: [
                  _section(
                    'Temel Bilgiler',
                    _infoRows([
                      ['Tip', model.type.name],
                      ['Başlangıç', _fmt(model.startDate)],
                      ['Bitiş', _fmt(model.endDate)],
                      ['Kişi', model.people.toString()],
                      ['Adet/Gün', model.quantity.toString()],
                      [
                        'Fiyat',
                        '${model.price.toStringAsFixed(0)} ${model.currency}',
                      ],
                    ]),
                  ),
                  _section(
                    'İletişim',
                    _infoRows([
                      ['Kullanıcı', model.userId],
                      if (model.userEmail != null)
                        ['E-posta', model.userEmail!],
                      if (model.userPhone != null)
                        ['Telefon', model.userPhone!],
                    ]),
                  ),
                  if (model.notes != null && model.notes!.trim().isNotEmpty)
                    _section(
                      'Not',
                      Text(model.notes!, style: TextStyle(fontSize: 13.sp)),
                    ),
                  _section('Meta', _meta()),
                  SizedBox(height: 30.h),
                ],
              ),
            ),
            _actions(context),
            SizedBox(height: Get.mediaQuery.viewPadding.bottom),
            // extra space for bottom safe area
          ],
        ),
      ),
    );
  }

  Widget _actions(BuildContext context) {
    final isPending = model.status == 'pending';
    final isConfirmed = model.status == 'confirmed';
    return Row(
      children: [
        if (isPending)
          Expanded(
            child: OutlinedButton(
              onPressed: () => controller.updateStatus(model, 'cancelled'),
              child: const Text('İptal Et'),
            ),
          ),
        if (isPending) SizedBox(width: 12.w),
        if (isPending)
          Expanded(
            child: ElevatedButton(
              onPressed: () => controller.updateStatus(model, 'confirmed'),
              child: const Text('Onayla'),
            ),
          ),
        if (isConfirmed)
          Expanded(
            child: OutlinedButton(
              onPressed: () => controller.updateStatus(model, 'cancelled'),
              child: const Text('İptal'),
            ),
          ),
        if (isConfirmed) SizedBox(width: 12.w),
        if (isConfirmed)
          Expanded(
            child: ElevatedButton(
              onPressed: () => controller.updateStatus(model, 'completed'),
              child: const Text('Tamamlandı'),
            ),
          ),
        if (!isPending && !isConfirmed)
          Expanded(
            child: ElevatedButton(
              onPressed: () => Navigator.of(Get.overlayContext!).pop(),
              child: const Text('Kapat'),
            ),
          ),
      ],
    );
  }

  Widget _section(String title, Widget child) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Padding(
          padding: EdgeInsets.only(bottom: 18.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              SizedBox(height: 8.h),
              child,
            ],
          ),
        );
      },
    );
  }

  Widget _infoRows(List<List<String>> rows) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Column(
          children: rows
              .map(
                (r) => Padding(
                  padding: EdgeInsets.symmetric(vertical: 4.h),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 120.w,
                        child: Text(
                          r[0],
                          style: TextStyle(
                            fontSize: 12.5.sp,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.grey[400] : Colors.grey[700],
                          ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          r[1],
                          style: TextStyle(
                            fontSize: 12.5.sp,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }

  Widget _meta() {
    if (model.meta.isEmpty) {
      return Builder(
        builder: (context) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          return Text(
            '—',
            style: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[500], fontSize: 12.sp),
          );
        },
      );
    }
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Column(
          children: model.meta.entries
              .map(
                (e) => Row(
                  children: [
                    Expanded(
                      child: Text(
                        e.key,
                        style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[700]),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        e.value.toString(),
                        style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.white : Colors.black87),
                      ),
                    ),
                  ],
                ),
              )
              .toList(),
        );
      },
    );
  }

  String _fmt(DateTime d) {
    return '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
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
}
