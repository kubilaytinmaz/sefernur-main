import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/enums/place_city.dart';
import '../../../data/services/place/place_service.dart';
import 'place_detail_sheet.dart';

class PlaceHorizontalList extends StatelessWidget {
  final PlaceCity city;
  const PlaceHorizontalList({super.key, required this.city});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final service = Get.find<PlaceService>();
    return Obx(() {
      final items = service.activeByCity(city);
      if (items.isEmpty) {
        return SizedBox(
          height: 160,
          child: Center(
            child: Text('Henüz içerik yok', style: TextStyle(color: theme.colorScheme.onSurfaceVariant)),
          ),
        );
      }
      return SizedBox(
        height: 170,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            itemBuilder: (_, i) {
              final p = items[i];
              final firstImage = p.images.isNotEmpty ? p.images.first : null;
              return GestureDetector(
                onTap: () => PlaceDetailSheet.show(p),
                child: Container(
                  width: 210,
                  decoration: BoxDecoration(
                    color: isDark ? theme.colorScheme.surfaceContainerHigh : theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: isDark ? Colors.black26 : Colors.black.withOpacity(.05), blurRadius: 8, offset: const Offset(0,4))],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Stack(children:[
                          Positioned.fill(
                            child: firstImage == null ? Container(color: isDark ? Colors.white12 : Colors.black12) : Image.network(firstImage, fit: BoxFit.cover),
                          ),
                          Positioned(
                            bottom: 6, right: 6,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(40)),
                              child: const Icon(Icons.chevron_right, size: 16, color: Colors.white),
                            ),
                          )
                        ]),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(10,8,10,2),
                        child: Text(p.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.w600)),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(10,0,10,8),
                        child: Text(p.shortDescription, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: theme.colorScheme.onSurfaceVariant, fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              );
            },
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemCount: items.length,
        ),
      );
    });
  }
}
