import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/models/tour/tour_model.dart';
import '../../../data/services/currency/currency_service.dart';
import '../../../data/services/tour/tour_service.dart';
import '../../themes/colors/app_colors.dart';
import 'tour_detail_sheet.dart';

class TourListSheet extends StatefulWidget {
  final bool showAll; // if true use allTours else active
  const TourListSheet({super.key, required this.showAll});
  static Future<void> show({bool showAll = false}) async {
    Get.generalDialog(
      barrierDismissible: true,
      barrierLabel: 'tour-list',
      pageBuilder: (_, __, ___) => TourListSheet(showAll: showAll),
      transitionBuilder: (context, anim, sec, child) {
        final curved = Curves.easeOutCubic.transform(anim.value);
        return Transform.translate(
          offset: Offset(0, (1 - curved) * 40),
          child: Opacity(opacity: anim.value, child: child),
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }

  @override
  State<TourListSheet> createState() => _TourListSheetState();
}

class _TourListSheetState extends State<TourListSheet> {
  late final TourService service;
  @override
  void initState() {
    super.initState();
    service = Get.find<TourService>();
    if (widget.showAll) {
      if (service.allTours.isEmpty) service.fetchAll();
    } else {
      if (service.activeTours.isEmpty) service.fetchActive();
    }
  }

  @override
  Widget build(BuildContext context) {
    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );
    return GestureDetector(
      onTap: () => Navigator.of(context).maybePop(),
      child: Material(
        color: Colors.transparent,
        child: Stack(
          children: [
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                child: Container(color: Colors.black.withOpacity(.35)),
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: SafeArea(
                bottom: false,
                top: false,
                child: Container(
                  constraints: const BoxConstraints(maxHeight: 690),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: radius,
                    border: Border.all(
                      color: AppColors.primary.withOpacity(.15),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(.3),
                        blurRadius: 36,
                        offset: const Offset(0, 18),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      _Header(
                        title: 'Umre Turları',
                        onClose: () => Navigator.of(context).maybePop(),
                      ),
                      Expanded(child: Obx(() => _list())),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _list() {
    final loading = widget.showAll
        ? service.isLoadingAll.value
        : service.isLoading.value;
    final list = widget.showAll ? service.allTours : service.activeTours;
    if (loading && list.isEmpty)
      return const Center(child: CircularProgressIndicator());
    if (list.isEmpty) return const Center(child: Text('Tur bulunamadı'));
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(18, 8, 18, 28),
      itemBuilder: (_, i) {
        final t = list[i];
        return _row(t);
      },
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemCount: list.length,
    );
  }

  Widget _row(TourModel t) {
    return GestureDetector(
      onTap: () => TourDetailSheet.show(t),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.grey[300]!),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(.05),
              blurRadius: 8,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 86,
                height: 86,
                child: t.images.isEmpty
                    ? Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.landscape, color: Colors.grey),
                      )
                    : Image.network(t.images.first, fit: BoxFit.cover),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _chip('${t.durationDays} Gün'),
                      if (t.category.isNotEmpty) _chip(t.category),
                      if (t.basePrice > 0)
                        Obx(
                          () => _chip(
                            Get.find<CurrencyService>().currentRate.value
                                .formatBoth(t.basePrice),
                          ),
                        ),
                      if (t.rating > 0)
                        _chip(
                          '⭐ ${t.rating.toStringAsFixed(1)} (${t.reviewCount})',
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    t.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _chip(String t) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: AppColors.primary.withOpacity(.07),
      borderRadius: BorderRadius.circular(18),
    ),
    child: Text(
      t,
      style: TextStyle(
        fontSize: 10.5,
        fontWeight: FontWeight.w600,
        color: AppColors.primary,
      ),
    ),
  );
}

class _Header extends StatelessWidget {
  final String title;
  final VoidCallback onClose;
  const _Header({required this.title, required this.onClose});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 14, 6, 4),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
            ),
          ),
          IconButton(onPressed: onClose, icon: const Icon(Icons.close_rounded)),
        ],
      ),
    );
  }
}
