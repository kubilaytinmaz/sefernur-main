import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../controllers/visa/visa_controller.dart';
import '../../../themes/theme.dart';

class VisaTrackingTab extends GetView<VisaController> {
  const VisaTrackingTab({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Padding(
    padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _headerRow(theme, isDark),
            SizedBox(height: 12.h),
            _filterChips(theme, isDark),
            SizedBox(height: 12.h),
            Expanded(
              child: Obx(() {
                final list = controller.visibleApplications;
                if (list.isEmpty) return _empty(theme, isDark);
                return ListView.builder(
                  itemCount: list.length,
                  itemBuilder: (_, i) => _card(list[i], theme, isDark),
                );
              }),
            ),
          ],
        ),
  );
  }

  Widget _headerRow(ThemeData theme, bool isDark){
    return Obx(()=> Row(
      children:[
        Text(
          controller.isAdmin.value ? 'Tüm Başvurular' : 'Başvurularım',
          style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface),
        ),
        const Spacer(),
        IconButton(
          tooltip: controller.isAdmin.value ? 'Kullanıcı Modu' : 'Admin Modu',
          onPressed: controller.toggleAdmin,
          icon: Icon(controller.isAdmin.value ? Icons.lock_open : Icons.admin_panel_settings, color: AppColors.medinaGreen40),
        )
      ],
    ));
  }

  Widget _filterChips(ThemeData theme, bool isDark){
    const items = ['all','received','processing','completed','rejected'];
    final labels = {
      'all':'Tümü',
      'received':'Alındı',
      'processing':'İşlemde',
      'completed':'Tamamlandı',
      'rejected':'Reddedildi'
    };
    final icons = {
      'all': Icons.filter_alt_outlined,
      'received': Icons.inbox_outlined,
      'processing': Icons.autorenew,
      'completed': Icons.check_circle_outline,
      'rejected': Icons.cancel_outlined,
    };

    return Obx(() => SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: items.map((k) {
          final selected = controller.statusFilter.value == k;
          final baseColor = k == 'all' ? AppColors.medinaGreen40 : controller.getStatusColor(k);
          return Padding(
            padding: EdgeInsets.only(right: 8.w),
            child: _StatusFilterPill(
              icon: icons[k]!,
              label: labels[k]!,
              selected: selected,
              color: baseColor,
              isDark: isDark,
              onTap: () => controller.setStatusFilter(k),
            ),
          );
        }).toList(),
      ),
    ));
  }

  Widget _empty(ThemeData theme, bool isDark) => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.description_outlined, size: 64.sp, color: isDark ? Colors.grey[600] : Colors.grey[400]),
        SizedBox(height: 16.h),
        Text(
          'Henüz başvurunuz bulunmuyor',
          style: TextStyle(fontSize: 16.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
        ),
      ],
    ),
  );

  Widget _card(dynamic application, ThemeData theme, bool isDark) {
    final color = controller.getStatusColor(application.status);
    final progress = controller.statusProgress(application.status);
    return InkWell(
      onTap: () => controller.viewApplicationDetails(application),
      borderRadius: BorderRadius.circular(16.r),
      child: Container(
        margin: EdgeInsets.only(bottom: 16.h),
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: color.withOpacity(0.25), width: 1),
          boxShadow: isDark ? null : [
            BoxShadow(
              color: Colors.black12.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 10.w,
                    vertical: 6.h,
                  ),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Text(
                    controller.getStatusText(application.status),
                    style: TextStyle(
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w600,
                      color: color,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  '#${(application.id ?? '').substring(0, application.id?.length.clamp(0, 6) ?? 0)}',
                  style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                ),
              ],
            ),
            SizedBox(height: 10.h),
            Text(
              '${application.country} - ${application.city}',
              style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface),
            ),
            SizedBox(height: 4.h),
            Text(
              application.purpose,
              style: TextStyle(fontSize: 13.sp, color: isDark ? Colors.grey[400] : Colors.grey[700]),
            ),
            SizedBox(height: 6.h),
            Text(
              DateFormat('dd MMM yyyy').format(application.createdAt),
              style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[500] : Colors.grey[600]),
            ),
            SizedBox(height: 12.h),
            ClipRRect(
              borderRadius: BorderRadius.circular(8.r),
              child: LinearProgressIndicator(
                minHeight: 6.h,
                value: progress,
                backgroundColor: isDark ? Colors.grey[700] : Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),
            SizedBox(height: 6.h),
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                'Detaylar için dokunun',
                style: TextStyle(
                  fontSize: 11.sp,
                  color: AppColors.medinaGreen40,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusFilterPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;
  const _StatusFilterPill({
    required this.icon,
    required this.label,
    required this.selected,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selBg = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white;
    final unselBg = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white;
    final selFg = color;
    final unselFg = isDark ? Colors.grey[300]! : Colors.black87;

    return Material(
      color: selected ? selBg : unselBg,
      borderRadius: BorderRadius.circular(24.r),
      elevation: selected ? 2 : 0,
      shadowColor: Colors.black.withOpacity(.08),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24.r),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24.r),
            border: Border.all(
              color: selected ? color.withOpacity(.35) : (isDark ? Colors.grey[700]! : Colors.grey.withOpacity(.3)),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16.sp, color: selected ? selFg : unselFg.withOpacity(.9)),
              SizedBox(width: 6.w),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: selected ? selFg : unselFg,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
