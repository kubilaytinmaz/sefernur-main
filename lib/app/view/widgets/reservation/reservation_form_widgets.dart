import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import 'reservation_bottom_sheet.dart';

// reservation_bottom_sheet.dart içindeki _ReservationSheetController tipi private olduğu için
// Get.find dynamic olarak kullanılacak.

/// Tek tarih seçimi (pickup, serviceDate vb.)
class SingleDateField extends StatelessWidget {
  final String keyName;
  final String label;
  final DateTime initial;
  final DateTime firstDate;
  final DateTime lastDate;
  SingleDateField({super.key, required this.keyName, required this.label, required this.initial, DateTime? firstDate, DateTime? lastDate}) :
    firstDate = firstDate ?? DateTime.now(),
    lastDate = lastDate ?? DateTime.now().add(const Duration(days: 365));

  @override
  Widget build(BuildContext context) {
  final c = _tryController();
  c?.values.putIfAbsent(keyName, () => initial);
  final dt = c?.val<DateTime>(keyName) ?? initial;
    return _FieldContainer(
      label: label,
      child: InkWell(
        onTap: () async {
          final picked = await showDatePicker(context: context, initialDate: dt, firstDate: firstDate, lastDate: lastDate);
            if (picked != null && c!=null) { c.setVal(keyName, DateTime(picked.year, picked.month, picked.day)); }
        },
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 12.h),
          child: Row(children:[
            const Icon(Icons.event, size:18),
            SizedBox(width:8.w),
            Text(_fmt(dt), style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w600)),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down)
          ]),
        ),
      ),
    );
  }
}

/// Tarih aralığı seçimi (check-in / check-out vb.)
class DateRangeField extends StatelessWidget {
  final String startKey;
  final String endKey;
  final String label;
  final DateTime initialStart;
  final DateTime initialEnd;
  final DateTime firstDate;
  final DateTime lastDate;
  DateRangeField({super.key, required this.startKey, required this.endKey, required this.label, required this.initialStart, required this.initialEnd, DateTime? firstDate, DateTime? lastDate})
    : firstDate = firstDate ?? DateTime.now(),
      lastDate = lastDate ?? DateTime.now().add(const Duration(days: 365));

  @override
  Widget build(BuildContext context) {
  final c = _tryController();
  c?.values.putIfAbsent(startKey, () => initialStart);
  c?.values.putIfAbsent(endKey, () => initialEnd);
  final s = c?.val<DateTime>(startKey) ?? initialStart;
  final e = c?.val<DateTime>(endKey) ?? initialEnd;
    return _FieldContainer(
      label: label,
      child: InkWell(
        onTap: () async {
          final pickedStart = await showDatePicker(context: context, initialDate: s, firstDate: firstDate, lastDate: lastDate);
          if (pickedStart == null) return;
          final pickedEnd = await showDatePicker(context: context, initialDate: e.isAfter(pickedStart) ? e : pickedStart.add(const Duration(days:1)), firstDate: pickedStart, lastDate: lastDate);
          if (pickedEnd == null) return;
          if (c!=null) {
            c.setVal(startKey, DateTime(pickedStart.year, pickedStart.month, pickedStart.day));
            c.setVal(endKey, DateTime(pickedEnd.year, pickedEnd.month, pickedEnd.day));
          }
        },
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 12.h),
          child: Row(children:[
            const Icon(Icons.date_range, size:18),
            SizedBox(width:8.w),
            Expanded(child: Text('${_fmt(s)} → ${_fmt(e)}', style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w600))),
            const Icon(Icons.keyboard_arrow_down)
          ]),
        ),
      ),
    );
  }
}

class CounterField extends StatelessWidget {
  final String keyName;
  final String label;
  final int min;
  final int max;
  final int initial;
  const CounterField({super.key, required this.keyName, required this.label, this.min = 0, this.max = 99, this.initial = 1});

  @override
  Widget build(BuildContext context) {
  final c = _tryController();
  c?.values.putIfAbsent(keyName, () => initial);
  final v = ((c?.values[keyName]) as int? ?? initial).clamp(min, max);
    return _FieldContainer(
      label: label,
      child: Row(children:[
  _counterBtn(Icons.remove, () { if (v > min && c!=null) { c.setVal(keyName, v - 1); } }),
        SizedBox(width:12.w),
        Text('$v', style: TextStyle(fontSize:16.sp, fontWeight: FontWeight.w700)),
        SizedBox(width:12.w),
  _counterBtn(Icons.add, () { if (v < max && c!=null) { c.setVal(keyName, v + 1); } }),
      ]),
    );
  }

  Widget _counterBtn(IconData icon, VoidCallback onTap) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(30),
    child: Container(
      decoration: BoxDecoration(color: Colors.blueGrey[50], borderRadius: BorderRadius.circular(30)),
      padding: EdgeInsets.all(8.w),
      child: Icon(icon, size:18, color: Colors.blueGrey[700]),
    ),
  );
}

class DropdownField extends StatelessWidget {
  final String keyName;
  final String label;
  final List<String> options;
  final String? initial;
  const DropdownField({super.key, required this.keyName, required this.label, required this.options, this.initial});
  @override
  Widget build(BuildContext context) {
  final c = _tryController();
  c?.values.putIfAbsent(keyName, () => initial ?? (options.isNotEmpty ? options.first : null));
  final current = c?.values[keyName];
    return _FieldContainer(
      label: label,
      child: DropdownButton<String>(
        value: current is String && options.contains(current) ? current : null,
        isExpanded: true,
        items: options.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
  onChanged: (v){ if (v!=null && c!=null) c.setVal(keyName, v); },
      ),
    );
  }
}

class _FieldContainer extends StatelessWidget {
  final String label; final Widget child;
  const _FieldContainer({required this.label, required this.child});
  @override
  Widget build(BuildContext context) => Container(
    margin: EdgeInsets.only(bottom:14.h),
    padding: EdgeInsets.all(12.w),
    decoration: BoxDecoration(
      border: Border.all(color: Colors.grey[200]!),
      borderRadius: BorderRadius.circular(18.r),
      color: Colors.white,
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Text(label, style: TextStyle(fontSize:11.sp, fontWeight: FontWeight.w600, color: Colors.blueGrey[600])),
      SizedBox(height:6.h),
      child,
    ]),
  );
}

String _fmt(DateTime d) => '${d.year}-${d.month.toString().padLeft(2,'0')}-${d.day.toString().padLeft(2,'0')}';

ReservationSheetController? _tryController(){
  try { return Get.find<ReservationSheetController>(); } catch(_){ return null; }
}
