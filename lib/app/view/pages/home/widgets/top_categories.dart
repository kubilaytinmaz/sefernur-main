import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../controllers/home/home_controller.dart';
import '../../../../controllers/main/main_controller.dart';
// Referans tasarım: Expedia benzeri kartlar (büyük yuvarlatılmış kare, ince border)

class TopCategoriesGrid extends GetView<HomeController> {
  const TopCategoriesGrid({super.key});
  @override
  Widget build(BuildContext context) {
    // Sabit 2 satır x 3 sütun düzeni (6 kategori varsayımı)
    final items = controller.categories.take(6).toList();
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: 6,
          crossAxisSpacing: 8,
          childAspectRatio: 1.18, // daha kompakt dikey alan
        ),
        itemBuilder: (_, i) => _CategoryItem(items[i]),
      ),
    );
  }
}

// Eski slider/pill tasarımı kaldırıldı; sade grid item

class _CategoryItem extends StatelessWidget {
  final Map<String, String> data;
  const _CategoryItem(this.data);

  @override
  Widget build(BuildContext context) {
    final icon = _mapCategoryIcon(data['icon']!);
    final isVisa =
        (data['route'] ?? '').trim() == '/visa' ||
        (data['label'] ?? '').toLowerCase().contains('vize');
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: .94, end: 1),
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
      builder: (_, scale, child) => Transform.scale(scale: scale, child: child),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (isVisa) {
              if (Get.isRegistered<MainController>()) {
                Get.find<MainController>().changeTabIndex(4);
              } else {
                // Fallback: route if MainController not found
                final route = data['route'];
                if (route != null && route.isNotEmpty) Get.toNamed(route);
              }
            } else {
              Get.toNamed(data['route']!);
            }
          },
          child: _CategorySurface(
            icon: icon,
            label: data['label']!,
            isVisa: isVisa,
          ),
        ),
      ),
    );
  }

  // Ayrı widget: farklı arka plan stilleri kolay değiştirilir
}

class _CategorySurface extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isVisa;
  const _CategorySurface({
    required this.icon,
    required this.label,
    this.isVisa = false,
  });
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final border = (isDark
        ? Colors.green.shade700.withOpacity(.5)
        : Colors.grey.shade300);
    return Container(
      decoration: BoxDecoration(
        color: isDark
            ? Colors.green.shade900.withOpacity(.4)
            : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: border, width: 1),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 30, color: Colors.green.shade600),
          const SizedBox(height: 10),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelMedium?.copyWith(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                letterSpacing: .2,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Icon eşleştirme fonksiyonunu tekrar ekleyelim (önceki yerinden çıkarılmıştı)
IconData _mapCategoryIcon(String k) {
  switch (k) {
    case 'hotel':
      return Icons.hotel_rounded;
    case 'directions_car':
      return Icons.directions_car_filled_rounded;
    case 'airport_shuttle':
      return Icons.airport_shuttle_rounded;
    case 'tour':
      return Icons.travel_explore_rounded;
    case 'map':
      return Icons.map_rounded;
    case 'workspace_premium':
      return Icons.workspace_premium_rounded;
    default:
      return Icons.circle;
  }
}
