import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:sefernur/app/controllers/visa/visa_controller.dart';

import '../../../../controllers/profile/profile_controller.dart';
import 'shared/empty_state.dart';

class ApplicationsTab extends GetView<ProfileController> {
  const ApplicationsTab({super.key});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Padding(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Vize Başvurularım',
            style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface),
          ),
          SizedBox(height: 16.h),
          Expanded(
            child: Obx(() {
              final list = controller.visaApplications;
              if(list.isEmpty){
                return const EmptyState(message: 'Henüz vize başvurunuz bulunmuyor', icon: Icons.description_outlined);
              }
              final visaCtrl = Get.isRegistered<VisaController>() ? Get.find<VisaController>() : null;
              return ListView.builder(
                padding: EdgeInsets.zero,
                itemCount: list.length,
                itemBuilder: (_, i){
                  final app = list[i];
                  final color = visaCtrl?.getStatusColor(app.status) ?? Colors.blueGrey;
                  final statusText = visaCtrl?.getStatusText(app.status) ?? app.status;
                  final progress = visaCtrl?.statusProgress(app.status) ?? 0.2;
                  return InkWell(
                    onTap: (){ if(visaCtrl!=null) visaCtrl.viewApplicationDetails(app); },
                    borderRadius: BorderRadius.circular(16.r),
                    child: Container(
                      margin: EdgeInsets.only(bottom: 16.h),
                      padding: EdgeInsets.all(16.w),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(16.r),
                        border: Border.all(color: color.withOpacity(0.25), width: 1),
                        boxShadow: [
                          BoxShadow(
                            color: isDark ? Colors.black26 : Colors.black12.withOpacity(0.04),
                            blurRadius: 8,
                            offset: const Offset(0,4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(12.r),
                              ),
                              child: Text(statusText, style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: color)),
                            ),
                            const Spacer(),
                            Text('#${(app.id ?? '').substring(0, (app.id?.length ?? 0).clamp(0,6))}', style: TextStyle(fontSize: 12.sp, color: theme.colorScheme.onSurfaceVariant))
                          ]),
                          SizedBox(height: 10.h),
                          Text('${app.country} - ${app.city}', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
                          SizedBox(height: 4.h),
                          Text(app.purpose, style: TextStyle(fontSize: 13.sp, color: theme.colorScheme.onSurfaceVariant)),
                          SizedBox(height: 6.h),
                          Text(DateFormat('dd MMM yyyy').format(app.createdAt), style: TextStyle(fontSize: 12.sp, color: theme.colorScheme.onSurfaceVariant)),
                          SizedBox(height: 12.h),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8.r),
                            child: LinearProgressIndicator(
                              minHeight: 6.h,
                              value: progress,
                              backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                              valueColor: AlwaysStoppedAnimation<Color>(color),
                            ),
                          ),
                          SizedBox(height: 6.h),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Text('Detaylar', style: TextStyle(fontSize: 11.sp, color: Colors.green.shade600)),
                          )
                        ],
                      ),
                    ),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}
