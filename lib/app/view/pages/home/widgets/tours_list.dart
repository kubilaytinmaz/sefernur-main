import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../data/models/tour/tour_model.dart';
import '../../../../data/services/currency/currency_service.dart';
import '../../../../data/services/tour/tour_service.dart';

class ToursHorizontal extends StatefulWidget {
  const ToursHorizontal({super.key});
  @override State<ToursHorizontal> createState() => _ToursHorizontalState();
}

class _ToursHorizontalState extends State<ToursHorizontal> {
  late final TourService service;
  @override void initState(){
    super.initState();
    service = Get.find<TourService>();
    if (service.activeTours.isEmpty) service.fetchActive();
  }
  @override Widget build(BuildContext context){
    return SizedBox(
      height:230,
      child: Obx(()=> _buildContent()),
    );
  }

  Widget _buildContent(){
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    if (service.isLoading.value && service.activeTours.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    final list = service.activeTours.take(10).toList();
    if (list.isEmpty) {
      return Center(child: Text('Aktif tur yok', style: TextStyle(color: theme.colorScheme.onSurfaceVariant)));
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal:16),
      scrollDirection: Axis.horizontal,
      itemBuilder: (_,i){ final t = list[i]; return _card(t, theme, isDark); },
      separatorBuilder: (_,__)=> const SizedBox(width:14),
      itemCount: list.length,
    );
  }

  Widget _card(TourModel t, ThemeData theme, bool isDark){
    return Container(
      width:185,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        boxShadow:[BoxShadow(color: isDark ? Colors.black26 : Colors.black.withOpacity(.05), blurRadius:8, offset: const Offset(0,5))],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children:[
          Stack(children:[
            SizedBox(
              height:100,
              width: double.infinity,
              child: t.images.isEmpty
                ? Container(color: isDark ? Colors.grey[800] : Colors.grey[200], child: Icon(Icons.landscape, color: isDark ? Colors.grey[600] : Colors.grey))
                : Image.network(t.images.first, fit: BoxFit.cover),
            ),
            Positioned(
              top:8,left:8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal:8, vertical:3),
                decoration: BoxDecoration(color: Colors.green.shade600.withOpacity(.85), borderRadius: BorderRadius.circular(10)),
                child: Text('${t.durationDays} Gün / ${t.category}', style: const TextStyle(color: Colors.white, fontSize:11.5, fontWeight: FontWeight.w600)),
              ),
            ),
            // Uçak firması logosu - sağ alt
            if (t.airline != null && t.airline!.isNotEmpty)
              Positioned(
                bottom: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: isDark ? theme.colorScheme.surface.withOpacity(0.95) : Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(6),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (t.airlineLogo != null && t.airlineLogo!.isNotEmpty)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: Image.network(
                            t.airlineLogo!,
                            width: 20,
                            height: 16,
                            fit: BoxFit.contain,
                            errorBuilder: (_, __, ___) => Icon(Icons.flight, size: 14, color: Colors.green.shade600),
                          ),
                        )
                      else
                        Icon(Icons.flight, size: 14, color: Colors.green.shade600),
                      const SizedBox(width: 4),
                      Text(t.airline!, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Colors.green.shade600)),
                    ],
                  ),
                ),
              ),
          ]),
          Padding(
            padding: const EdgeInsets.fromLTRB(12,8,12,2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.title, maxLines:2, overflow: TextOverflow.ellipsis, style: TextStyle(fontWeight: FontWeight.w700, fontSize:14, color: theme.colorScheme.onSurface)),
                // Mekke/Medine gece bilgisi - her zaman göster
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.nights_stay, size: 12, color: isDark ? Colors.amber[400] : Colors.amber[700]),
                    const SizedBox(width: 4),
                    Text('Mekke: ${t.mekkeNights ?? "-"}G', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.amber[300] : Colors.amber[800])),
                    Text(' • ', style: TextStyle(fontSize: 10, color: isDark ? Colors.amber[200] : Colors.amber[400])),
                    Text('Medine: ${t.medineNights ?? "-"}G', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.amber[300] : Colors.amber[800])),
                  ],
                ),
                Builder(builder: (_){
                  DateTime? start = t.startDate;
                  if (start == null) {
                    final dates = t.availability.values
                        .map((a){
                          final raw = a.date; // expected format yyyy-MM-dd or ISO
                          return DateTime.tryParse(raw);
                        })
                        .whereType<DateTime>()
                        .toList();
                    if (dates.isNotEmpty){ dates.sort(); start = dates.first; }
                  }
                  if (start == null) return const SizedBox();
                  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
                  final label = '${start.day.toString().padLeft(2,'0')} ${months[start.month-1]}';
                  return Padding(
                    padding: const EdgeInsets.only(top:4),
                    child: Text('Gidiş: $label', style: TextStyle(fontSize:10.5, fontWeight: FontWeight.w500, color: theme.colorScheme.onSurfaceVariant)),
                  );
                })
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12,0,12,0),
            child: Obx(() {
              final currencyService = Get.find<CurrencyService>();
              return Text(
                currencyService.currentRate.value.formatBoth(t.basePrice),
                style: TextStyle(color: Colors.green.shade600, fontWeight: FontWeight.bold, fontSize:14),
              );
            }),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.fromLTRB(12,0,12,10),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (){
                  // Detay sheet açılabilir (tour_detail_sheet kullanılabilir)
                  Get.toNamed('/tours', arguments: {'id': t.id});
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical:8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('İncele', style: TextStyle(fontSize:12, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
