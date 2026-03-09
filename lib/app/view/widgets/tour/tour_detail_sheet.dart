import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/models/tour/tour_model.dart';
import '../../../data/services/currency/currency_service.dart';
import '../../themes/colors/app_colors.dart';
import '../detail/contact_buttons.dart';

class TourDetailSheet extends StatefulWidget {
  final TourModel model;
  const TourDetailSheet({super.key, required this.model});
  static Future<void> show(TourModel m) async {
    Get.generalDialog(
      barrierDismissible: true,
      barrierLabel: 'tour-detail',
      pageBuilder: (_, __, ___) => TourDetailSheet(model: m),
      transitionBuilder: (context, anim, sec, child){ final curved = Curves.easeOutCubic.transform(anim.value); return Transform.translate(offset: Offset(0,(1-curved)*40), child: Opacity(opacity: anim.value, child: child)); },
      transitionDuration: const Duration(milliseconds: 320),
    );
  }
  @override State<TourDetailSheet> createState()=> _TourDetailSheetState();
}

class _TourDetailSheetState extends State<TourDetailSheet>{
  int _page=0;
  
  String _formatDateTurkish(DateTime? date) {
    if (date == null) return '';
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
  
  @override Widget build(BuildContext context){
    final t = widget.model;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    const radius = BorderRadius.only(topLeft: Radius.circular(26), topRight: Radius.circular(26));
    return GestureDetector(
      onTap: ()=> Navigator.of(context).maybePop(),
      child: Material(
        color: Colors.transparent,
        child: Stack(
          children:[
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX:14,sigmaY:14),
                child: Container(color: Colors.black.withOpacity(.35)),
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: SafeArea(
          bottom: false,
                top:false,
                child: Container(
                  constraints: const BoxConstraints(maxHeight:720),
                  decoration: BoxDecoration(
                    color: isDark ? theme.colorScheme.surfaceContainerHigh : AppColors.surface,
                    borderRadius: radius,
                    border: Border.all(color: AppColors.primary.withOpacity(.15)),
                    boxShadow:[BoxShadow(color: Colors.black.withOpacity(.3), blurRadius:36, offset: const Offset(0,18))],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children:[
                      _Header(title: t.title, onClose: ()=> Navigator.of(context).maybePop()),
                      Expanded(
                        child: ListView(
                          padding: const EdgeInsets.fromLTRB(18,12,18,32),
                          children:[
                            if(t.images.isNotEmpty) _slider(t),
                            const SizedBox(height:14),
                            // Gidiş - Dönüş Tarihleri
                            if (t.startDate != null || t.endDate != null) ...[
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: isDark ? Colors.green.shade900.withOpacity(0.3) : AppColors.primary.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: isDark ? Colors.green.shade700.withOpacity(0.4) : AppColors.primary.withOpacity(0.2)),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Icon(Icons.flight_takeoff, size: 18, color: isDark ? Colors.green.shade400 : AppColors.primary),
                                              const SizedBox(width: 6),
                                              Text('Gidiş', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.grey.shade400 : Colors.black54)),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            _formatDateTurkish(t.startDate),
                                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.green.shade300 : AppColors.primary),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(width: 1, height: 40, color: isDark ? Colors.green.shade700.withOpacity(0.5) : AppColors.primary.withOpacity(0.3)),
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.only(left: 14),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Icon(Icons.flight_land, size: 18, color: isDark ? Colors.green.shade400 : AppColors.primary),
                                                const SizedBox(width: 6),
                                                Text('Dönüş', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.grey.shade400 : Colors.black54)),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              t.endDate != null 
                                                ? _formatDateTurkish(t.endDate)
                                                : (t.startDate != null 
                                                    ? _formatDateTurkish(t.startDate!.add(Duration(days: t.durationDays - 1)))
                                                    : '-'),
                                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.green.shade300 : AppColors.primary),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 14),
                            ],
                            Wrap(
                              spacing:8,
                              runSpacing:8,
                              children:[
                                _chip('${t.durationDays} Gün'),
                                if(t.category.isNotEmpty) _chip(t.category),
                                if(t.serviceType != null) _chip(t.serviceType!),
                                if(t.mekkeNights != null) _chip('Mekke ${t.mekkeNights} Gece'),
                                if(t.medineNights != null) _chip('Medine ${t.medineNights} Gece'),
                                if(t.basePrice>0) Obx(() => _chip(Get.find<CurrencyService>().currentRate.value.formatBoth(t.basePrice))),
                                if(t.rating>0) _chip('⭐ ${t.rating.toStringAsFixed(1)} (${t.reviewCount})'),
                              ],
                            ),
                            const SizedBox(height:14),
                            // Firma bilgisi
                            if (t.company != null && t.company!.isNotEmpty) ...[
                              Row(
                                children: [
                                  Icon(Icons.business, size: 18, color: isDark ? Colors.grey.shade400 : Colors.black54),
                                  const SizedBox(width: 8),
                                  Text(t.company!, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
                                ],
                              ),
                              const SizedBox(height: 12),
                            ],
                            Text(t.description, style: TextStyle(fontSize:13.4, height:1.4, color: theme.colorScheme.onSurface)),
                            const SizedBox(height:18),
                            // İletişim butonları
                            if (t.phone != null || t.whatsapp != null) ...[
                              Text('İletişim', style: TextStyle(fontSize:15, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)),
                              const SizedBox(height:10),
                              ContactButtons(phone: t.phone, sms: t.phone, whatsapp: t.whatsapp),
                              const SizedBox(height:18),
                            ],
                            if(t.serviceAddresses.isNotEmpty) _addresses(t),
                            if(t.program.isNotEmpty) ...[
                              const SizedBox(height:22),
                              Text('Günlük Program', style: TextStyle(fontSize:15, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)),
                              const SizedBox(height:10),
                              ...t.program.map((d)=> Padding(padding: const EdgeInsets.only(bottom:14), child: _day(d)))
                            ],
                            const SizedBox(height:100),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),
            // Rezerve Et butonu
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
                decoration: BoxDecoration(
                  color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(isDark ? 0.3 : 0.1), blurRadius: 10, offset: const Offset(0, -4))],
                ),
                child: SafeArea(
          bottom: false,
                  top: false,
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('Toplam Fiyat', style: TextStyle(fontSize: 11, color: isDark ? Colors.grey.shade400 : Colors.black54)),
                            Obx(() => Text(
                              Get.find<CurrencyService>().currentRate.value.formatBoth(t.basePrice),
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: isDark ? Colors.green.shade400 : AppColors.primary),
                            )),
                          ],
                        ),
                      ),
                      ElevatedButton.icon(
                        onPressed: () => _onReservePressed(t),
                        icon: const Icon(Icons.calendar_month, size: 20),
                        label: const Text('Rezerve Et', style: TextStyle(fontWeight: FontWeight.w700)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
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
  
  void _onReservePressed(TourModel t) async {
    // WhatsApp veya telefon varsa oradan iletişim
    if (t.whatsapp != null && t.whatsapp!.isNotEmpty) {
      final cleaned = t.whatsapp!.replaceAll(RegExp(r'[^0-9+]'), '');
      final message = Uri.encodeComponent('Merhaba, "${t.title}" turu için rezervasyon yapmak istiyorum.');
      Get.defaultDialog(
        title: 'Rezervasyon',
        middleText: 'WhatsApp üzerinden rezervasyon yapmak ister misiniz?',
        textConfirm: 'WhatsApp\'a Git',
        textCancel: 'İptal',
        confirmTextColor: Colors.white,
        onConfirm: () async {
          Get.back();
          final url = Uri.parse('https://wa.me/$cleaned?text=$message');
          if (await canLaunchUrl(url)) {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          }
        },
      );
    } else if (t.phone != null && t.phone!.isNotEmpty) {
      Get.defaultDialog(
        title: 'Rezervasyon',
        middleText: 'Telefonla rezervasyon yapmak ister misiniz?',
        textConfirm: 'Ara',
        textCancel: 'İptal',
        confirmTextColor: Colors.white,
        onConfirm: () async {
          Get.back();
          final url = Uri(scheme: 'tel', path: t.phone);
          if (await canLaunchUrl(url)) {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          }
        },
      );
    } else {
      Get.snackbar('Bilgi', 'Bu tur için iletişim bilgisi bulunmuyor.', snackPosition: SnackPosition.BOTTOM);
    }
  }
  
  Widget _slider(TourModel t){ 
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Column(children:[ SizedBox(height:200, child: PageView.builder(itemCount: t.images.length, onPageChanged: (i)=> setState(()=> _page=i), itemBuilder: (_,i)=> ClipRRect(borderRadius: BorderRadius.circular(18), child: Image.network(t.images[i], fit: BoxFit.cover)))), const SizedBox(height:8), Row(mainAxisAlignment: MainAxisAlignment.center, children:[ for(int i=0;i<t.images.length;i++) AnimatedContainer(duration: const Duration(milliseconds:300), margin: const EdgeInsets.symmetric(horizontal:4), width: _page==i? 18:8, height:8, decoration: BoxDecoration(color: _page==i? (isDark ? Colors.green.shade400 : AppColors.primary): (isDark ? Colors.green.shade800 : AppColors.primary.withOpacity(.25)), borderRadius: BorderRadius.circular(30))) ]) ]); 
  }
  Widget _chip(String t){ 
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(padding: const EdgeInsets.symmetric(horizontal:10, vertical:5), decoration: BoxDecoration(color: isDark ? Colors.green.shade900.withOpacity(0.4) : AppColors.primary.withOpacity(.07), borderRadius: BorderRadius.circular(20)), child: Text(t, style: TextStyle(fontSize:11, fontWeight: FontWeight.w600, color: isDark ? Colors.green.shade300 : AppColors.primary))); 
  }
  Widget _addresses(TourModel t){ 
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children:[ Text('Hizmet Verilen Bölgeler', style: TextStyle(fontSize:15, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)), const SizedBox(height:10), Wrap(spacing:8, runSpacing:8, children: t.serviceAddresses.map((a){ final txt = a.city.isNotEmpty? a.city : (a.country.isNotEmpty? a.country : a.address.split(',').first); return Container(padding: const EdgeInsets.symmetric(horizontal:10, vertical:5), decoration: BoxDecoration(color: isDark ? Colors.blueGrey.shade800.withOpacity(0.4) : Colors.blueGrey.withOpacity(.08), borderRadius: BorderRadius.circular(18)), child: Text(txt, style: TextStyle(fontSize:11.5, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface))); }).toList()) ]);
  }
  Widget _day(TourDayProgram d){ 
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50], borderRadius: BorderRadius.circular(16), border: Border.all(color: isDark ? theme.colorScheme.outline.withOpacity(0.3) : Colors.grey[300]!)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[ Text('${d.day}. Gün - ${d.title}', style: TextStyle(fontSize:13.5, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)), const SizedBox(height:6), Text(d.details, style: TextStyle(fontSize:12.5, height:1.35, color: theme.colorScheme.onSurfaceVariant)) ]));
  }
}

class _Header extends StatelessWidget{ 
  final String title; 
  final VoidCallback onClose; 
  const _Header({required this.title, required this.onClose}); 
  
  @override Widget build(BuildContext context){ 
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(18,14,6,4), 
      child: Row(children:[ 
        Expanded(child: Text(title, maxLines:2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize:19, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface))), 
        IconButton(onPressed: onClose, icon: Icon(Icons.close_rounded, color: theme.colorScheme.onSurface)) 
      ])
    ); 
  }
}
