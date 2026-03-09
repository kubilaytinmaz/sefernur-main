import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../themes/colors/app_colors.dart';

/// Modern tarih seçici - referans görsel stilinde
class ModernDatePicker extends StatefulWidget {
  final DateTime? initialCheckIn;
  final DateTime? initialCheckOut;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final bool isRangeMode; // Giriş-Çıkış modu
  final String? checkInLabel;
  final String? checkOutLabel;

  const ModernDatePicker({
    super.key,
    this.initialCheckIn,
    this.initialCheckOut,
    this.firstDate,
    this.lastDate,
    this.isRangeMode = true,
    this.checkInLabel,
    this.checkOutLabel,
  });

  /// Tek tarih seçimi için
  static Future<DateTime?> showSingle({
    required BuildContext context,
    DateTime? initialDate,
    DateTime? firstDate,
    DateTime? lastDate,
    String? label,
  }) async {
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ModernDatePicker(
        initialCheckIn: initialDate,
        firstDate: firstDate,
        lastDate: lastDate,
        isRangeMode: false,
        checkInLabel: label ?? 'Tarih',
      ),
    );
    return result?['checkIn'];
  }

  /// Giriş-Çıkış tarih aralığı seçimi için
  static Future<Map<String, dynamic>?> showRange({
    required BuildContext context,
    DateTime? initialCheckIn,
    DateTime? initialCheckOut,
    DateTime? firstDate,
    DateTime? lastDate,
    String? checkInLabel,
    String? checkOutLabel,
  }) async {
    return showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ModernDatePicker(
        initialCheckIn: initialCheckIn,
        initialCheckOut: initialCheckOut,
        firstDate: firstDate,
        lastDate: lastDate,
        isRangeMode: true,
        checkInLabel: checkInLabel,
        checkOutLabel: checkOutLabel,
      ),
    );
  }

  @override
  State<ModernDatePicker> createState() => _ModernDatePickerState();
}

class _ModernDatePickerState extends State<ModernDatePicker> {
  DateTime? _checkIn;
  DateTime? _checkOut;
  bool _isSelectingCheckOut = false;
  int _flexDays = 0; // ±0, ±1, ±2, ±3, ±7

  final _weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  final _months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  final _shortWeekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  @override
  void initState() {
    super.initState();
    _checkIn = widget.initialCheckIn;
    _checkOut = widget.initialCheckOut;
  }

  DateTime get _firstDate => widget.firstDate ?? DateTime.now();
  DateTime get _lastDate => widget.lastDate ?? DateTime.now().add(const Duration(days: 365 * 2));

  int get _nightCount {
    if (_checkIn == null || _checkOut == null) return 0;
    return _checkOut!.difference(_checkIn!).inDays;
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;
    final handleColor = isDark ? Colors.grey.shade600 : Colors.grey.shade300;
    final borderColor = isDark ? Colors.grey.shade700 : Colors.grey.shade200;
    
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.85),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: EdgeInsets.only(top: 12.h),
            width: 40.w,
            height: 4.h,
            decoration: BoxDecoration(
              color: handleColor,
              borderRadius: BorderRadius.circular(2.r),
            ),
          ),
          
          // Header
          Padding(
            padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 0),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Icon(Icons.close, size: 24.sp, color: subtitleColor),
                ),
                SizedBox(width: 16.w),
                Text(
                  'Takvim',
                  style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Date selection tabs (Giriş - Çıkış)
          if (widget.isRangeMode) _buildDateTabs(isDark, surfaceColor, textColor, subtitleColor),
          
          SizedBox(height: 12.h),
          
          // Week days header
          _buildWeekDaysHeader(isDark, subtitleColor),
          
          // Calendar grid
          Flexible(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: _buildCalendarMonths(isDark, textColor),
            ),
          ),
          
          // Flex days options
          _buildFlexDaysOptions(isDark, textColor, subtitleColor, borderColor),
          
          // Confirm button
          _buildConfirmButton(bottomPadding, isDark),
        ],
      ),
    );
  }

  Widget _buildDateTabs(bool isDark, Color surfaceColor, Color textColor, Color subtitleColor) {
    final tabBgColor = isDark ? const Color(0xFF2D2D2D) : Colors.grey[100];
    final selectedBgColor = isDark ? const Color(0xFF3D3D3D) : Colors.white;
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20.w),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: tabBgColor,
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildDateTab(
              label: widget.checkInLabel ?? 'Giriş',
              date: _checkIn,
              isSelected: !_isSelectingCheckOut,
              onTap: () => setState(() => _isSelectingCheckOut = false),
              isDark: isDark,
              selectedBgColor: selectedBgColor,
              textColor: textColor,
              subtitleColor: subtitleColor,
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: _buildDateTab(
              label: widget.checkOutLabel ?? 'Çıkış',
              date: _checkOut,
              isSelected: _isSelectingCheckOut,
              onTap: () => setState(() => _isSelectingCheckOut = true),
              isDark: isDark,
              selectedBgColor: selectedBgColor,
              textColor: textColor,
              subtitleColor: subtitleColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateTab({
    required String label,
    DateTime? date,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
    required Color selectedBgColor,
    required Color textColor,
    required Color subtitleColor,
  }) {
    final placeholderColor = isDark ? Colors.grey.shade500 : Colors.grey[400];
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 16.w),
        decoration: BoxDecoration(
          color: isSelected ? selectedBgColor : Colors.transparent,
          borderRadius: BorderRadius.circular(10.r),
          boxShadow: isSelected && !isDark
              ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 11.sp,
                color: isSelected ? AppColors.medinaGreen40 : subtitleColor,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              date != null ? _formatDate(date) : 'Tarih seçin',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: date != null ? textColor : placeholderColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeekDaysHeader(bool isDark, Color subtitleColor) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: _weekDays.map((day) {
          final isWeekend = day == 'Cmt' || day == 'Paz';
          return SizedBox(
            width: 40.w,
            child: Text(
              day,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: isWeekend ? AppColors.medinaGreen40 : subtitleColor,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCalendarMonths(bool isDark, Color textColor) {
    final months = <Widget>[];
    var current = DateTime(_firstDate.year, _firstDate.month);
    final end = DateTime(_lastDate.year, _lastDate.month);
    
    while (!current.isAfter(end)) {
      months.add(_buildMonth(current, isDark, textColor));
      current = DateTime(current.year, current.month + 1);
    }
    
    return Column(children: months);
  }

  Widget _buildMonth(DateTime month, bool isDark, Color textColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(top: 16.h, bottom: 12.h, left: 4.w),
          child: Text(
            '${_months[month.month - 1]} ${month.year}',
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
        ),
        _buildMonthGrid(month, isDark, textColor),
      ],
    );
  }

  Widget _buildMonthGrid(DateTime month, bool isDark, Color textColor) {
    final firstDayOfMonth = DateTime(month.year, month.month, 1);
    final lastDayOfMonth = DateTime(month.year, month.month + 1, 0);
    final startWeekday = firstDayOfMonth.weekday; // 1=Mon, 7=Sun
    
    final days = <Widget>[];
    
    // Empty cells for days before the first day
    for (var i = 1; i < startWeekday; i++) {
      days.add(SizedBox(width: 40.w, height: 40.h));
    }
    
    // Days of the month
    for (var day = 1; day <= lastDayOfMonth.day; day++) {
      final date = DateTime(month.year, month.month, day);
      days.add(_buildDayCell(date, isDark, textColor));
    }
    
    return Wrap(
      spacing: 4.w,
      runSpacing: 4.h,
      children: days,
    );
  }

  Widget _buildDayCell(DateTime date, bool isDark, Color defaultTextColor) {
    final today = DateTime.now();
    final isToday = date.year == today.year && date.month == today.month && date.day == today.day;
    final isPast = date.isBefore(DateTime(today.year, today.month, today.day));
    final isDisabled = isPast || date.isBefore(_firstDate) || date.isAfter(_lastDate);
    
    final isCheckIn = _checkIn != null &&
        date.year == _checkIn!.year &&
        date.month == _checkIn!.month &&
        date.day == _checkIn!.day;
    
    final isCheckOut = _checkOut != null &&
        date.year == _checkOut!.year &&
        date.month == _checkOut!.month &&
        date.day == _checkOut!.day;
    
    final isInRange = _checkIn != null &&
        _checkOut != null &&
        date.isAfter(_checkIn!) &&
        date.isBefore(_checkOut!);
    
    final isWeekend = date.weekday == 6 || date.weekday == 7;
    final isSelected = isCheckIn || isCheckOut;
    
    Color bgColor = Colors.transparent;
    Color textColor = isWeekend ? AppColors.medinaGreen40 : defaultTextColor;
    
    if (isDisabled) {
      textColor = isDark ? Colors.grey.shade700 : Colors.grey[300]!;
    } else if (isSelected) {
      bgColor = AppColors.medinaGreen40;
      textColor = Colors.white;
    } else if (isInRange) {
      bgColor = AppColors.medinaGreen40.withOpacity(isDark ? 0.2 : 0.1);
      textColor = AppColors.medinaGreen40;
    }
    
    return GestureDetector(
      onTap: isDisabled ? null : () => _onDateTap(date),
      child: Container(
        width: 40.w,
        height: 40.h,
        decoration: BoxDecoration(
          color: bgColor,
          shape: isSelected ? BoxShape.circle : BoxShape.rectangle,
          borderRadius: isSelected ? null : (isInRange ? BorderRadius.zero : null),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Text(
              '${date.day}',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: isSelected || isToday ? FontWeight.w700 : FontWeight.w500,
                color: textColor,
              ),
            ),
            if (isToday && !isSelected)
              Positioned(
                bottom: 4.h,
                child: Container(
                  width: 4.w,
                  height: 4.h,
                  decoration: BoxDecoration(
                    color: AppColors.medinaGreen40,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _onDateTap(DateTime date) {
    setState(() {
      if (!widget.isRangeMode) {
        _checkIn = date;
        return;
      }
      
      if (_isSelectingCheckOut) {
        if (_checkIn != null && date.isAfter(_checkIn!)) {
          _checkOut = date;
        } else {
          // If selected date is before check-in, reset and set as new check-in
          _checkIn = date;
          _checkOut = null;
          _isSelectingCheckOut = false;
        }
      } else {
        _checkIn = date;
        _checkOut = null;
        _isSelectingCheckOut = true;
      }
    });
  }

  Widget _buildFlexDaysOptions(bool isDark, Color textColor, Color subtitleColor, Color borderColor) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: borderColor)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Yerel zaman',
                style: TextStyle(fontSize: 11.sp, color: subtitleColor),
              ),
              const Spacer(),
              Text(
                'Yerel zaman',
                style: TextStyle(fontSize: 11.sp, color: subtitleColor),
              ),
            ],
          ),
          SizedBox(height: 4.h),
          Row(
            children: [
              Text(
                _checkIn != null ? _formatDateShort(_checkIn!) : '--',
                style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, color: textColor),
              ),
              const Spacer(),
              if (widget.isRangeMode)
                Text(
                  _checkOut != null ? _formatDateShort(_checkOut!) : 'Çıkış',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w700,
                    color: _checkOut != null ? textColor : AppColors.medinaGreen40,
                  ),
                ),
            ],
          ),
          SizedBox(height: 12.h),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFlexChip('Kesin tarihler', 0, isDark, borderColor),
                SizedBox(width: 8.w),
                _buildFlexChip('±1 gün', 1, isDark, borderColor),
                SizedBox(width: 8.w),
                _buildFlexChip('±2 gün', 2, isDark, borderColor),
                SizedBox(width: 8.w),
                _buildFlexChip('±3 gün', 3, isDark, borderColor),
                SizedBox(width: 8.w),
                _buildFlexChip('±7 gün', 7, isDark, borderColor),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlexChip(String label, int days, bool isDark, Color borderColor) {
    final isSelected = _flexDays == days;
    final unselectedTextColor = isDark ? Colors.grey.shade300 : Colors.grey[700];
    return GestureDetector(
      onTap: () => setState(() => _flexDays = days),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.medinaGreen40.withOpacity(isDark ? 0.2 : 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isSelected ? AppColors.medinaGreen40 : borderColor,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.sp,
            fontWeight: FontWeight.w600,
            color: isSelected ? AppColors.medinaGreen40 : unselectedTextColor,
          ),
        ),
      ),
    );
  }

  Widget _buildConfirmButton(double bottomPadding, bool isDark) {
    final canConfirm = widget.isRangeMode
        ? (_checkIn != null && _checkOut != null)
        : _checkIn != null;
    
    String buttonText = 'Onayla';
    if (widget.isRangeMode && _nightCount > 0) {
      buttonText = 'Onayla ($_nightCount gece)';
    }
    
    final disabledBgColor = isDark ? Colors.grey.shade700 : Colors.grey[300];
    final disabledTextColor = isDark ? Colors.grey.shade500 : Colors.grey[500];
    
    return Container(
      padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 12.h + bottomPadding),
      child: SizedBox(
        width: double.infinity,
        height: 52.h,
        child: ElevatedButton(
          onPressed: canConfirm
              ? () {
                  Navigator.pop(context, {
                    'checkIn': _checkIn,
                    'checkOut': _checkOut,
                    'flexDays': _flexDays,
                  });
                }
              : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.medinaGreen40,
            foregroundColor: Colors.white,
            disabledBackgroundColor: disabledBgColor,
            disabledForegroundColor: disabledTextColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12.r),
            ),
            elevation: 0,
          ),
          child: Text(
            buttonText,
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day} ${_months[date.month - 1].substring(0, 3)} ${_shortWeekDays[date.weekday - 1]}';
  }

  String _formatDateShort(DateTime date) {
    return '${date.day} ${_months[date.month - 1].substring(0, 3)} ${_shortWeekDays[date.weekday - 1]}';
  }
}
