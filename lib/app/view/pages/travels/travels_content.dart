import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../controllers/travels/travels_controller.dart';
import '../../../data/services/currency/currency_service.dart';

class TravelsContent extends GetView<TravelsController> {
  const TravelsContent({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Column(
        children: [
          // Content
          Expanded(
            child: DefaultTabController(
              length: 2,
              child: Column(
                children: [
                  const _TravelPillTabs(),
                  Expanded(
                    child: TabBarView(
                      children: [
                        _buildUpcomingTravelsTab(),
                        _buildPastTravelsTab(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingTravelsTab() {
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 0, 16.w, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Yaklaşan Seyahatleriniz',
            style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16.h),

          Expanded(
            child: Obx(
              () => controller.upcomingTravels.isEmpty
                  ? _buildEmptyState(
                      'Yaklaşan seyahatiniz bulunmuyor',
                      Icons.luggage_outlined,
                      'Yeni rezervasyon yapmak için arama sayfasını ziyaret edin.',
                    )
                  : ListView.builder(
                      padding: EdgeInsets.only(bottom: 12.h),
                      itemCount: controller.upcomingTravels.length,
                      itemBuilder: (context, index) {
                        final travel = controller.upcomingTravels[index];
                        return _buildTravelCard(travel, isUpcoming: true);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPastTravelsTab() {
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 0, 16.w, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Geçmiş Seyahatleriniz',
            style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16.h),

          Expanded(
            child: Obx(
              () => controller.pastTravels.isEmpty
                  ? _buildEmptyState(
                      'Geçmiş seyahatiniz bulunmuyor',
                      Icons.history,
                      'Tamamladığınız seyahatler burada görünecektir.',
                    )
                  : ListView.builder(
                      padding: EdgeInsets.only(bottom: 12.h),
                      itemCount: controller.pastTravels.length,
                      itemBuilder: (context, index) {
                        final travel = controller.pastTravels[index];
                        return _buildTravelCard(travel, isUpcoming: false);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTravelCard(Travel travel, {required bool isUpcoming}) {
    final theme = Theme.of(Get.context!);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Travel image and basic info
          Container(
            height: 120.h,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16.r),
                topRight: Radius.circular(16.r),
              ),
              image: DecorationImage(
                image: NetworkImage(travel.imageUrl),
                fit: BoxFit.cover,
                onError: (exception, stackTrace) {},
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16.r),
                  topRight: Radius.circular(16.r),
                ),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                ),
              ),
              child: Padding(
                padding: EdgeInsets.all(16.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            travel.title,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18.sp,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 8.w,
                            vertical: 4.h,
                          ),
                          decoration: BoxDecoration(
                            color: controller
                                .getStatusColor(travel.status)
                                .withOpacity(0.9),
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Text(
                            controller.getStatusText(travel.status),
                            style: TextStyle(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      travel.location,
                      style: TextStyle(color: Colors.white70, fontSize: 14.sp),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Travel details
          Padding(
            padding: EdgeInsets.all(16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date and duration
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 16.sp,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        '${DateFormat('dd/MM/yyyy').format(travel.startDate)} - ${DateFormat('dd/MM/yyyy').format(travel.endDate)}',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    Text(
                      '${travel.endDate.difference(travel.startDate).inDays + 1} gün',
                      style: TextStyle(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.green.shade600,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 12.h),

                // Services summary
                if (travel.services.isNotEmpty) ...[
                  Row(
                    children: [
                      Icon(
                        Icons.business_center,
                        size: 16.sp,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: Text(
                          '${travel.services.length} hizmet',
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                      Row(
                        children: travel.services.take(3).map((service) {
                          return Container(
                            margin: EdgeInsets.only(left: 4.w),
                            child: Icon(
                              controller.getServiceTypeIcon(service.type),
                              size: 16.sp,
                              color: Colors.green.shade600,
                            ),
                          );
                        }).toList(),
                      ),
                      if (travel.services.length > 3) ...[
                        SizedBox(width: 4.w),
                        Text(
                          '+${travel.services.length - 3}',
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ],
                  ),
                  SizedBox(height: 12.h),
                ],

                // Documents
                if (travel.documents.isNotEmpty) ...[
                  Row(
                    children: [
                      Icon(
                        Icons.description,
                        size: 16.sp,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      SizedBox(width: 8.w),
                      Text(
                        '${travel.documents.length} belge',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12.h),
                ],

                // Amount and actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Obx(() {
                      final currencyService = Get.find<CurrencyService>();
                      return Text(
                        currencyService.currentRate.value.formatBoth(
                          travel.totalAmount,
                        ),
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.green.shade600,
                        ),
                      );
                    }),
                    Row(
                      children: [
                        TextButton(
                          onPressed: () => controller.viewTravelDetails(travel),
                          child: const Text('Detaylar'),
                        ),
                        SizedBox(width: 8.w),
                        PopupMenuButton<String>(
                          onSelected: (value) {
                            switch (value) {
                              case 'documents':
                                _showDocuments(travel);
                                break;
                              case 'support':
                                controller.createSupportRequest(travel.id);
                                break;
                              case 'cancel':
                                if (travel.canCancel) {
                                  controller.cancelTravel(travel.id);
                                }
                                break;
                              case 'review':
                                if (!isUpcoming) {
                                  _showReviewDialog(travel);
                                }
                                break;
                            }
                          },
                          itemBuilder: (context) => [
                            if (travel.documents.isNotEmpty)
                              const PopupMenuItem(
                                value: 'documents',
                                child: Row(
                                  children: [
                                    Icon(Icons.description),
                                    SizedBox(width: 8),
                                    Text('Belgeler'),
                                  ],
                                ),
                              ),
                            const PopupMenuItem(
                              value: 'support',
                              child: Row(
                                children: [
                                  Icon(Icons.support_agent),
                                  SizedBox(width: 8),
                                  Text('Destek'),
                                ],
                              ),
                            ),
                            if (isUpcoming && travel.canCancel)
                              const PopupMenuItem(
                                value: 'cancel',
                                child: Row(
                                  children: [
                                    Icon(Icons.cancel, color: Colors.red),
                                    SizedBox(width: 8),
                                    Text(
                                      'İptal Et',
                                      style: TextStyle(color: Colors.red),
                                    ),
                                  ],
                                ),
                              ),
                            if (!isUpcoming &&
                                travel.status == TravelStatus.completed)
                              const PopupMenuItem(
                                value: 'review',
                                child: Row(
                                  children: [
                                    Icon(Icons.rate_review),
                                    SizedBox(width: 8),
                                    Text('Değerlendir'),
                                  ],
                                ),
                              ),
                          ],
                          child: Icon(
                            Icons.more_vert,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                // Review (for past travels)
                if (!isUpcoming && travel.rating != null) ...[
                  SizedBox(height: 12.h),
                  Container(
                    padding: EdgeInsets.all(12.w),
                    decoration: BoxDecoration(
                      color: isDark
                          ? theme.colorScheme.surfaceContainerHigh
                          : Colors.grey[50],
                      borderRadius: BorderRadius.circular(8.r),
                      border: Border.all(
                        color: isDark
                            ? theme.colorScheme.outline
                            : Colors.grey[200]!,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Row(
                              children: List.generate(5, (index) {
                                return Icon(
                                  index < travel.rating!
                                      ? Icons.star
                                      : Icons.star_border,
                                  size: 16.sp,
                                  color: Colors.amber,
                                );
                              }),
                            ),
                            SizedBox(width: 8.w),
                            Text(
                              'Değerlendirmeniz',
                              style: TextStyle(
                                fontSize: 12.sp,
                                fontWeight: FontWeight.w600,
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                        if (travel.review != null &&
                            travel.review!.isNotEmpty) ...[
                          SizedBox(height: 8.h),
                          Text(
                            travel.review!,
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: theme.colorScheme.onSurfaceVariant,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showDocuments(Travel travel) {
    final theme = Theme.of(Get.context!);
    final isDark = theme.brightness == Brightness.dark;
    Get.bottomSheet(
      Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20.r),
            topRight: Radius.circular(20.r),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Belgeler',
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  onPressed: () => Get.back(),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            SizedBox(height: 16.h),

            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: travel.documents.length,
                itemBuilder: (context, index) {
                  final document = travel.documents[index];
                  return Container(
                    margin: EdgeInsets.only(bottom: 12.h),
                    padding: EdgeInsets.all(16.w),
                    decoration: BoxDecoration(
                      color: isDark
                          ? theme.colorScheme.surfaceContainerHigh
                          : Colors.grey[50],
                      borderRadius: BorderRadius.circular(12.r),
                      border: Border.all(
                        color: isDark
                            ? theme.colorScheme.outline
                            : Colors.grey[200]!,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: EdgeInsets.all(8.w),
                          decoration: BoxDecoration(
                            color: Colors.green.shade600.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                          child: Icon(
                            Icons.description,
                            color: Colors.green.shade600,
                            size: 24.sp,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                document.title,
                                style: TextStyle(
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.w600,
                                  color: theme.colorScheme.onSurface,
                                ),
                              ),
                              Text(
                                controller.getDocumentTypeText(document.type),
                                style: TextStyle(
                                  fontSize: 12.sp,
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                              Text(
                                DateFormat(
                                  'dd/MM/yyyy',
                                ).format(document.uploadDate),
                                style: TextStyle(
                                  fontSize: 12.sp,
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              onPressed: () =>
                                  controller.viewDocument(document),
                              icon: const Icon(Icons.visibility),
                              tooltip: 'Görüntüle',
                            ),
                            IconButton(
                              onPressed: () =>
                                  controller.downloadDocument(document),
                              icon: const Icon(Icons.download),
                              tooltip: 'İndir',
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  void _showReviewDialog(Travel travel) {
    int selectedRating = travel.rating ?? 0;
    String reviewText = travel.review ?? '';

    Get.dialog(
      AlertDialog(
        title: const Text('Seyahati Değerlendirin'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              travel.title,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            const Text('Puanınız:'),
            const SizedBox(height: 8),
            StatefulBuilder(
              builder: (context, setState) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return IconButton(
                      onPressed: () {
                        setState(() {
                          selectedRating = index + 1;
                        });
                      },
                      icon: Icon(
                        index < selectedRating ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 32,
                      ),
                    );
                  }),
                );
              },
            ),
            const SizedBox(height: 16),
            TextField(
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Yorumunuzu yazın...',
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                reviewText = value;
              },
              controller: TextEditingController(text: reviewText),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('İptal')),
          ElevatedButton(
            onPressed: () {
              controller.submitReview(travel.id, selectedRating, reviewText);
              Get.back();
            },
            child: const Text('Gönder'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String title, IconData icon, String subtitle) {
    final theme = Theme.of(Get.context!);
    final isDark = theme.brightness == Brightness.dark;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64.sp,
            color: isDark ? Colors.grey[600] : Colors.grey[400],
          ),
          SizedBox(height: 16.h),
          Text(
            title,
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8.h),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 40.w),
            child: Text(
              subtitle,
              style: TextStyle(
                fontSize: 14.sp,
                color: theme.colorScheme.onSurfaceVariant.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}

class _TravelPillTabs extends StatefulWidget {
  const _TravelPillTabs();
  @override
  State<_TravelPillTabs> createState() => _TravelPillTabsState();
}

class _TravelPillTabsState extends State<_TravelPillTabs> {
  late TabController _controller;

  final _items = const [
    _TravelPillItem('Yaklaşan Seyahatler', Icons.event_available_outlined),
    _TravelPillItem('Geçmiş Seyahatler', Icons.history),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller = DefaultTabController.of(context);
    _controller.addListener(_handleChange);
  }

  void _handleChange() {
    if (!mounted) return;
    setState(() {}); // sadece seçimi güncelle
  }

  @override
  void dispose() {
    _controller.removeListener(_handleChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.w),
      width: double.infinity,
      child: Row(
        children: [
          for (int i = 0; i < _items.length; i++) ...[
            _buildChip(theme, i),
            if (i != _items.length - 1) SizedBox(width: 6.w),
          ],
        ],
      ),
    );
  }

  Widget _buildChip(ThemeData theme, int index) {
    final selected = _controller.index == index;
    final item = _items[index];
    final isDark = theme.brightness == Brightness.dark;
    return InkWell(
      borderRadius: BorderRadius.circular(18.r),
      onTap: () => _controller.animateTo(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: selected
              ? Colors.green.shade600
              : isDark
              ? theme.colorScheme.surfaceContainerHigh
              : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(18.r),
          border: Border.all(
            color: selected
                ? Colors.green.shade600
                : (isDark ? theme.colorScheme.outline : Colors.grey.shade300),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (selected) ...[
              Icon(Icons.check, size: 14.sp, color: Colors.white),
              SizedBox(width: 4.w),
            ] else ...[
              Icon(
                item.icon,
                size: 16.sp,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              SizedBox(width: 6.w),
            ],
            Text(
              item.label,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TravelPillItem {
  final String label;
  final IconData icon;
  const _TravelPillItem(this.label, this.icon);
}
