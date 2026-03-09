import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../controllers/notification/notification_controller.dart';
import '../../themes/theme.dart';

class NotificationsPage extends GetView<NotificationController> {
  const NotificationsPage({super.key});

  // Sabit yeşil renk - karanlık modda da aynı kalacak
  static const Color _headerColor = AppColors.medinaGreen40;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF121212) : Colors.grey[50],
      appBar: AppBar(
        backgroundColor: _headerColor,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Bildirimler',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          Obx(
            () => controller.unreadCount.value > 0
                ? TextButton(
                    onPressed: controller.markAllRead,
                    child: const Text(
                      'Hepsini Okundu Yap',
                      style: TextStyle(color: Colors.white),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: Obx(() {
              if (controller.loading.value) {
                return _buildLoadingList();
              }
              final items = controller.notifications;
              if (items.isEmpty) {
                return _buildEmptyState();
              }
              return RefreshIndicator(
                onRefresh: controller.refreshNotifications,
                child: ListView.builder(
                  padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 24.h),
                  itemCount: items.length,
                  itemBuilder: (_, i) => _NotificationCard(
                    model: items[i],
                    onTap: () async {
                      final n = items[i];
                      if (!n.read && n.id != null)
                        await controller.markRead(n.id!);
                      // Future: navigate based on n.type / n.relatedCollection
                    },
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [_headerColor, _headerColor.withOpacity(0.9)],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Güncel Bildirimler',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8.h),
              Obx(
                () => Text(
                  controller.unreadCount.value > 0
                      ? '${controller.unreadCount.value} okunmamış bildirim'
                      : 'Tüm bildirimler okundu',
                  style: TextStyle(color: Colors.white70, fontSize: 14.sp),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return RefreshIndicator(
          onRefresh: controller.refreshNotifications,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.fromLTRB(24.w, 24.h, 24.w, 80.h),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: constraints.maxHeight - 96.h,
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Builder(
                      builder: (context) {
                        final isDarkEmpty =
                            Theme.of(context).brightness == Brightness.dark;
                        return Container(
                          width: double.infinity,
                          constraints: BoxConstraints(maxWidth: 420.w),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(28.r),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(
                                  isDarkEmpty ? 0.3 : 0.08,
                                ),
                                blurRadius: 24,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(28.r),
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Positioned.fill(
                                  child: Image.asset(
                                    'assets/images/onboarding_1.jpg',
                                    fit: BoxFit.cover,
                                    color: Colors.black.withOpacity(0.35),
                                    colorBlendMode: BlendMode.darken,
                                  ),
                                ),
                                Positioned.fill(
                                  child: DecoratedBox(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                        colors: [
                                          Colors.black.withOpacity(0.25),
                                          Colors.black.withOpacity(0.65),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 24.w,
                                    vertical: 42.h,
                                  ),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 90.w,
                                        height: 90.w,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          gradient: LinearGradient(
                                            colors: [
                                              Get.theme.primaryColor,
                                              Get.theme.primaryColor
                                                  .withOpacity(0.6),
                                            ],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Get.theme.primaryColor
                                                  .withOpacity(0.4),
                                              blurRadius: 18,
                                              offset: const Offset(0, 6),
                                            ),
                                          ],
                                        ),
                                        child: Icon(
                                          Icons.notifications_none_rounded,
                                          size: 42.sp,
                                          color: Colors.white,
                                        ),
                                      ),
                                      SizedBox(height: 28.h),
                                      Text(
                                        'Henüz Bildirim Yok',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 24.sp,
                                          height: 1.15,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 0.2,
                                          color: Colors.white,
                                        ),
                                      ),
                                      SizedBox(height: 14.h),
                                      Text(
                                        'Yeni kampanya, rezervasyon ve durum güncellemeleri geldiğinde burada göreceksiniz. Takipte kalın!',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 14.sp,
                                          height: 1.4,
                                          color: Colors.white.withOpacity(0.85),
                                        ),
                                      ),
                                      SizedBox(height: 30.h),
                                      ElevatedButton.icon(
                                        onPressed:
                                            controller.refreshNotifications,
                                        icon: const Icon(Icons.refresh_rounded),
                                        label: const Text('Yenile'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.white,
                                          foregroundColor:
                                              Get.theme.primaryColor,
                                          elevation: 0,
                                          padding: EdgeInsets.symmetric(
                                            horizontal: 28.w,
                                            vertical: 14.h,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              18.r,
                                            ),
                                          ),
                                          textStyle: TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 15.sp,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    SizedBox(height: 48.h),
                    Wrap(
                      spacing: 12.w,
                      runSpacing: 12.h,
                      alignment: WrapAlignment.center,
                      children: [
                        _infoChip(Icons.campaign_outlined, 'Kampanyalar'),
                        _infoChip(
                          Icons.event_available_outlined,
                          'Rezervasyon',
                        ),
                        _infoChip(Icons.flag_circle_outlined, 'Vize'),
                        _infoChip(Icons.rate_review_outlined, 'İnceleme'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Builder(
      builder: (context) {
        final isDarkChip = Theme.of(context).brightness == Brightness.dark;
        return Container(
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
          decoration: BoxDecoration(
            color: isDarkChip ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: BorderRadius.circular(20.r),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDarkChip ? 0.2 : 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(
              color: isDarkChip ? Colors.grey.shade800 : Colors.grey.shade200,
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 18.sp, color: _headerColor),
              SizedBox(width: 6.w),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: isDarkChip ? Colors.grey[300] : Colors.grey[700],
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLoadingList() {
    return ListView.builder(
      padding: EdgeInsets.fromLTRB(20.w, 24.h, 20.w, 24.h),
      itemCount: 6,
      itemBuilder: (_, i) =>
          _ShimmerPlaceholder(margin: EdgeInsets.only(bottom: 16.h)),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final dynamic model; // NotificationModel
  final VoidCallback onTap;
  const _NotificationCard({required this.model, required this.onTap});

  Color _typeColor(BuildContext context) {
    final t = (model.type ?? '') as String;
    if (t.startsWith('reservation_')) return Colors.indigo;
    if (t.startsWith('visa_')) return Colors.teal;
    if (t.startsWith('review_')) return Colors.orange;
    if (t.endsWith('_created')) return Colors.purple;
    return Theme.of(context).primaryColor;
  }

  IconData _icon() {
    final t = (model.type ?? '') as String;
    if (t.startsWith('reservation_')) return Icons.event_available;
    if (t.startsWith('visa_')) return Icons.flag_circle_outlined;
    if (t.startsWith('review_')) return Icons.rate_review_outlined;
    if (t.endsWith('_created')) return Icons.new_releases_outlined;
    return Icons.notifications_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final color = _typeColor(context);
    final read = model.read == true;
    final isDarkCard = Theme.of(context).brightness == Brightness.dark;
    final createdAt = model.createdAt is DateTime
        ? model.createdAt as DateTime
        : (model.createdAt is String
              ? DateTime.tryParse(model.createdAt)
              : null);
    final timeText = createdAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(createdAt)
        : '';
    return GestureDetector(
      onTap: onTap,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 250),
        opacity: read ? 0.65 : 1,
        child: Container(
          margin: EdgeInsets.only(bottom: 16.h),
          padding: EdgeInsets.all(16.w),
          decoration: BoxDecoration(
            color: isDarkCard ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: BorderRadius.circular(20.r),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDarkCard ? 0.2 : 0.05),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(
              color: read
                  ? (isDarkCard ? Colors.grey.shade800 : Colors.grey.shade200)
                  : color.withOpacity(0.3),
              width: 1,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44.w,
                height: 44.w,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [color, color.withOpacity(0.7)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Icon(_icon(), color: Colors.white, size: 22.sp),
              ),
              SizedBox(width: 14.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            model.title ?? '-',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              height: 1.2,
                            ),
                          ),
                        ),
                        if (!read)
                          Container(
                            width: 10.w,
                            height: 10.w,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: 6.h),
                    Text(
                      model.message ?? '',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: isDarkCard ? Colors.grey[400] : Colors.grey[700],
                        height: 1.3,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          size: 14.sp,
                          color: isDarkCard
                              ? Colors.grey[600]
                              : Colors.grey[500],
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          timeText,
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: isDarkCard
                                ? Colors.grey[600]
                                : Colors.grey[500],
                          ),
                        ),
                        const Spacer(),
                        Text(
                          _chipText(model.type),
                          style: TextStyle(
                            fontSize: 11.sp,
                            fontWeight: FontWeight.w600,
                            color: color,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _chipText(String? type) {
    if (type == null) return '';
    if (type.startsWith('reservation_')) return 'Rezervasyon';
    if (type.startsWith('visa_')) return 'Vize';
    if (type.startsWith('review_')) return 'İnceleme';
    if (type.endsWith('_created')) return 'Yeni';
    return 'Bilgi';
  }
}

class _ShimmerPlaceholder extends StatelessWidget {
  final EdgeInsetsGeometry? margin;
  const _ShimmerPlaceholder({this.margin});

  @override
  Widget build(BuildContext context) {
    final isDarkShimmer = Theme.of(context).brightness == Brightness.dark;
    return Container(
      margin: margin,
      height: 92.h,
      decoration: BoxDecoration(
        color: isDarkShimmer ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDarkShimmer ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: isDarkShimmer ? Colors.grey.shade800 : Colors.grey.shade100,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          SizedBox(width: 16.w),
          Container(
            width: 44.w,
            height: 44.w,
            decoration: BoxDecoration(
              color: isDarkShimmer
                  ? const Color(0xFF2A2A2A)
                  : const Color(0xFFEFEFEF),
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 14.h,
                  width: 160.w,
                  decoration: _grey(isDarkShimmer),
                ),
                SizedBox(height: 8.h),
                Container(
                  height: 12.h,
                  width: double.infinity,
                  decoration: _grey(isDarkShimmer),
                ),
                SizedBox(height: 6.h),
                Container(
                  height: 12.h,
                  width: 120.w,
                  decoration: _grey(isDarkShimmer),
                ),
              ],
            ),
          ),
          SizedBox(width: 16.w),
        ],
      ),
    );
  }

  BoxDecoration _grey(bool isDark) => BoxDecoration(
    color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFF2F2F2),
    borderRadius: BorderRadius.circular(8.r),
  );
}
