import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/models/tour/tour_model.dart';
import '../../../data/services/currency/currency_service.dart';
import '../../../data/services/tour/tour_service.dart';
import 'tour_detail_sheet.dart';

class TourHorizontalList extends StatefulWidget {
  const TourHorizontalList({super.key});
  @override
  State<TourHorizontalList> createState() => _TourHorizontalListState();
}

class _TourHorizontalListState extends State<TourHorizontalList> {
  late final TourService service;
  // Opsiyonel: gidiş tarihini yılda göster/gizle toggle (ileride ayar servisine taşınabilir)
  static const bool showYearInDate = true;
  @override
  void initState() {
    super.initState();
    service = Get.find<TourService>();
    if (service.activeTours.isEmpty) service.fetchActive();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(height: 250, child: Obx(() => _content()));
  }

  Widget _content() {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    if (service.isLoading.value && service.activeTours.isEmpty)
      return const Center(child: CircularProgressIndicator());
    final list = service.activeTours.take(10).toList();
    if (list.isEmpty) return Center(child: Text('Tur bulunamadı', style: TextStyle(color: theme.colorScheme.onSurfaceVariant)));
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      scrollDirection: Axis.horizontal,
      clipBehavior: Clip.none,
      itemBuilder: (_, i) {
        final t = list[i];
        return _item(t, theme, isDark);
      },
      separatorBuilder: (_, __) => const SizedBox(width: 14),
      itemCount: list.length,
    );
  }

  Widget _item(TourModel t, ThemeData theme, bool isDark) {
    return GestureDetector(
      onTap: () => TourDetailSheet.show(t),
      child: Container(
        width: 190,
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHigh : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : Colors.black.withOpacity(.05),
              blurRadius: 8,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                SizedBox(
                  height: 104,
                  width: double.infinity,
                  child: t.images.isEmpty
                      ? Container(
                          color: isDark ? Colors.grey[800] : Colors.grey[200],
                          child: Center(
                            child: Icon(Icons.landscape, color: isDark ? Colors.grey[600] : Colors.grey),
                          ),
                        )
                      : Image.network(
                          t.images.first,
                          fit: BoxFit.cover,
                          height: 104,
                          width: double.infinity,
                        ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.shade600.withOpacity(.85),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${t.durationDays} Gün',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 2),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13.5,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (t.company != null && t.company!.isNotEmpty)
                    Text(
                      t.company!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  const SizedBox(height: 2),
                  Builder(
                    builder: (_) {
                      // Öncelikle yeni startDate alanını kullan, yoksa eskisi gibi availability'den hesapla
                      DateTime? start = t.startDate;
                      if (start == null && t.availability.isNotEmpty) {
                        final dates = t.availability.values.map((a){
                          final raw = a.date; // expecting ISO or yyyy-MM-dd
                          return DateTime.tryParse(raw);
                        }).whereType<DateTime>().toList();
                        if (dates.isNotEmpty) { dates.sort(); start = dates.first; }
                      }
                      if (start == null) return const SizedBox();
                      final trMonths = [
                        'Oca',
                        'Şub',
                        'Mar',
                        'Nis',
                        'May',
                        'Haz',
                        'Tem',
                        'Ağu',
                        'Eyl',
                        'Eki',
                        'Kas',
                        'Ara',
                      ];
                      final label =
                          '${start.day.toString().padLeft(2, '0')} ${trMonths[start.month - 1]}'
                          '${showYearInDate ? ' ${start.year}' : ''}';
                      return Text('Gidiş: $label', style: TextStyle(fontSize: 10.5, color: theme.colorScheme.onSurfaceVariant, fontWeight: FontWeight.w500));
                    },
                  ),
                ],
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
              child: Obx(() => Text(
                Get.find<CurrencyService>().currentRate.value.formatBoth(t.basePrice),
                style: TextStyle(
                  color: Colors.green.shade600,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              )),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => TourDetailSheet.show(t),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'İncele',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
