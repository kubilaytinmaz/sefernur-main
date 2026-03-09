import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/services/review/review_service.dart';
import '../../themes/colors/app_colors.dart';
import 'review_detail_sheet.dart';

class ReviewListSheet extends StatefulWidget {
  final bool showAllLatest;
  const ReviewListSheet({super.key, this.showAllLatest = false});
  static Future<void> show({bool showAllLatest = true}) async {
    Get.generalDialog(
      barrierDismissible: true,
      barrierLabel: 'review-list',
      pageBuilder: (_, __, ___) =>
          ReviewListSheet(showAllLatest: showAllLatest),
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
  State<ReviewListSheet> createState() => _ReviewListSheetState();
}

class _ReviewListSheetState extends State<ReviewListSheet>
    with TickerProviderStateMixin {
  late final ReviewService service;
  late final TabController _tab;
  final tabs = const [
    _TypeTab(keyName: 'all', label: 'Tümü', icon: Icons.all_inclusive),
    _TypeTab(keyName: 'hotel', label: 'Oteller', icon: Icons.hotel),
    _TypeTab(keyName: 'car', label: 'Araç', icon: Icons.directions_car_filled),
    _TypeTab(keyName: 'tour', label: 'Turlar', icon: Icons.tour),
    _TypeTab(keyName: 'guide', label: 'Rehber', icon: Icons.person_pin_circle),
    _TypeTab(
      keyName: 'transfer',
      label: 'Transfer',
      icon: Icons.airport_shuttle,
    ),
  ];
  @override
  void initState() {
    super.initState();
    service = Get.find<ReviewService>();
    _tab = TabController(length: tabs.length, vsync: this);
    _tab.addListener(() => _onTab());
  }

  void _onTab() {
    final t = tabs[_tab.index];
    service.setFilter(t.keyName);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );
    final showAllLatest = widget.showAllLatest;
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
                  constraints: const BoxConstraints(maxHeight: 700),
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
                        title: showAllLatest ? 'Son 50 Yorum' : 'Yorumlar',
                        onClose: () => Navigator.of(context).maybePop(),
                      ),
                      if (!showAllLatest) _tabs(),
                      Expanded(
                        child: showAllLatest
                            ? _latestListStream()
                            : Obx(() => _list()),
                      ),
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

  Widget _tabs() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 4, 12, 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(.05),
        borderRadius: BorderRadius.circular(18),
      ),
      child: TabBar(
        controller: _tab,
        isScrollable: true,
        indicator: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(14),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: AppColors.primary,
        tabs: tabs
            .map((t) => Tab(icon: Icon(t.icon, size: 16), text: t.label))
            .toList(),
      ),
    );
  }

  Widget _list() {
    final list = service.filtered;
    if (list.isEmpty) return const Center(child: Text('Yorum yok'));
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(18, 8, 18, 32),
      itemBuilder: (_, i) {
        final r = list[i];
        return _row(r);
      },
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemCount: list.length,
    );
  }

  Widget _latestListStream() {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: service.latestPublishedReviews(limit: 50),
      builder: (_, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final list = snap.data ?? [];
        if (list.isEmpty) return const Center(child: Text('Yorum yok'));
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 32),
          itemBuilder: (_, i) {
            final r = list[i];
            return _row(r);
          },
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemCount: list.length,
        );
      },
    );
  }

  Widget _row(Map<String, dynamic> r) {
    final rating = (r['rating'] ?? 0).toDouble();
    final type = (r['targetType'] ?? r['type'] ?? '').toString();
    return GestureDetector(
      onTap: () => ReviewDetailSheet.show(r),
      child: Container(
        padding: const EdgeInsets.all(14),
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
        child: Row(
          children: [
            Icon(_icon(type), size: 28, color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _typeLabel(type),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    (r['comment'] ?? '').toString(),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: List.generate(
                      5,
                      (i) => Icon(
                        i < rating.round()
                            ? Icons.star_rounded
                            : Icons.star_border_rounded,
                        size: 16,
                        color: Colors.amber.shade600,
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
  }

  IconData _icon(String t) {
    switch (t) {
      case 'hotel':
        return Icons.hotel;
      case 'car':
        return Icons.directions_car_filled;
      case 'tour':
        return Icons.tour;
      case 'guide':
        return Icons.person_pin_circle;
      case 'transfer':
        return Icons.airport_shuttle;
      default:
        return Icons.reviews;
    }
  }

  String _typeLabel(String t) {
    switch (t) {
      case 'hotel':
        return 'Otel';
      case 'car':
        return 'Araç';
      case 'tour':
        return 'Tur';
      case 'guide':
        return 'Rehber';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Diğer';
    }
  }
}

class _TypeTab {
  final String keyName;
  final String label;
  final IconData icon;
  const _TypeTab({
    required this.keyName,
    required this.label,
    required this.icon,
  });
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
