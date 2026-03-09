import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/guide_search_controller.dart';
import '../../../../data/models/address/address_model.dart';
import '../../../../data/models/guide/guide_model.dart';
import '../../../../data/models/reservation/reservation_builder.dart';
import '../../../../data/models/reservation/reservation_model.dart';
import '../../../../data/services/auth/auth_service.dart';
import '../../../../data/services/currency/currency_service.dart';
import '../../../../data/services/favorite/favorite_service.dart';
import '../../../../data/services/reservation/reservation_service.dart';
import '../../../../data/services/review/review_service.dart';
import '../../../widgets/detail/contact_buttons.dart';
import '../../../widgets/detail/detail_sheet_constants.dart';
import '../../../widgets/detail/drag_handle.dart';
import '../../../widgets/detail/favorite_button.dart';
import '../../../widgets/detail/image_slider.dart';
import '../../../widgets/detail/reserve_button_bar.dart';
import '../../../widgets/detail/review_dialog.dart';
import '../../../widgets/reservation/reservation_bottom_sheet.dart';
import '../../../widgets/reservation/reservation_form_widgets.dart';

class GuideDetailSheet extends StatelessWidget {
  final GuideModel guide;
  final GuideSearchController controller;
  const GuideDetailSheet({super.key, required this.guide, required this.controller});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final favService = Get.isRegistered<FavoriteService>() ? Get.find<FavoriteService>() : null;
    final reviewService = Get.isRegistered<ReviewService>() ? Get.find<ReviewService>() : null;
    final rate = controller.rateFor(guide);
    return DraggableScrollableSheet(
      initialChildSize: DetailSheetConfig.initialChildSize,
      maxChildSize: DetailSheetConfig.maxChildSize,
      minChildSize: DetailSheetConfig.minChildSize,
      expand: false,
      builder: (ctx, scroll){
        return SafeArea(
          bottom: false,
          top: false,
          child: Stack(children:[
            Container(
              decoration: BoxDecoration(
                color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
                borderRadius: DetailSheetConfig.radius,
              ),
              child: CustomScrollView(
                controller: scroll,
                slivers: [
                  SliverToBoxAdapter(child: Padding(
                    padding: EdgeInsets.symmetric(horizontal:16.w),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
                      SizedBox(height:8.h),
                      const DragHandle(),
                      if (guide.images.isNotEmpty) ImageSlider(images: guide.images),
                    SizedBox(height:14.h),
                    Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
                      Expanded(child: Text(guide.name, style: TextStyle(fontSize:20.sp, fontWeight: FontWeight.w800, height:1.1, color: theme.colorScheme.onSurface))),
                      if (guide.id!=null) Obx(()=> FavoriteButton(initial: (favService?.isFavorite('guide', guide.id ?? '') ?? controller.isFavorite(guide.id)), onChanged: (v){ if (guide.id==null) return; if (favService!=null){ final meta = favService.buildMetaForEntity(type:'guide', model: guide); favService.toggle(type:'guide', targetId: guide.id!, meta: meta); } else { controller.toggleFavorite(guide.id!); } }))
                    ]),
                    Row(children:[
                      Icon(Icons.star_rounded, size:18.sp, color: Colors.amber), SizedBox(width:4.w),
                      Text(guide.rating.toStringAsFixed(1), style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)), SizedBox(width:6.w),
                      Text('(${guide.reviewCount} yorum)', style: TextStyle(fontSize:12.sp, color: isDark ? Colors.grey.shade400 : Colors.blueGrey[600])),
                      if (guide.id!=null && reviewService!=null) TextButton.icon(onPressed: ()=> _openReviewDialog(guide.id!, reviewService), icon: const Icon(Icons.add_comment_outlined, size:18), label: const Text('Yorum Yaz'))
                    ]),
                    Obx(() => Text('${guide.yearsExperience} yıl deneyim • ${Get.find<CurrencyService>().currentRate.value.formatBoth(rate)}/gün', style: TextStyle(fontSize:12.sp, color: isDark ? Colors.grey.shade400 : Colors.grey[700]))),
                    SizedBox(height:12.h),
                    Text(guide.bio, style: TextStyle(fontSize:13.sp, height:1.5, color: theme.colorScheme.onSurfaceVariant)),
                    SizedBox(height:16.h),
                    _section('Uzmanlıklar', guide.specialties, theme, isDark),
                    _section('Sertifikalar', guide.certifications, theme, isDark),
                    _section('Diller', guide.languages, theme, isDark),
                    if (guide.serviceAddresses.isNotEmpty) ...[
                      SizedBox(height:18.h),
                      Text('Hizmet Bölgeleri', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)),
                      SizedBox(height:8.h),
                      ...guide.serviceAddresses.map((a)=> _addressTile(a, theme, isDark)),
                    ],
                    SizedBox(height:20.h),
                    Text('İletişim', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)),
                    SizedBox(height:8.h),
                    ContactButtons(phone: guide.phone, sms: guide.phone, whatsapp: guide.whatsapp),
                    SizedBox(height:24.h),
                    if (reviewService!=null && guide.id!=null) _reviewsSection(reviewService, guide.id!, theme, isDark),
                    SizedBox(height:120.h),
                  ]),
                  ))
                ],
              ),
            ),
            Align(alignment: Alignment.bottomCenter, child: ReserveButtonBar(onPressed: guide.id == null ? null : () => _openReservationSheet(guide))),
          ]),
        );
      },
    );
  }

  Widget _section(String title, List<String> items, ThemeData theme, bool isDark){
    if (items.isEmpty) return const SizedBox();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Text(title, style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)),
      SizedBox(height:6.h),
      Wrap(spacing:6.w, runSpacing:6.h, children: items.take(12).map((e)=> Container(padding: EdgeInsets.symmetric(horizontal:10.w, vertical:6.h), decoration: BoxDecoration(color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100], borderRadius: BorderRadius.circular(10.r)), child: Text(e, style: TextStyle(fontSize:11.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)))).toList())
    ]);
  }

  Widget _addressTile(AddressModel a, ThemeData theme, bool isDark){
    return Container(
      margin: EdgeInsets.only(bottom:8.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50],
        border: Border.all(color: isDark ? theme.colorScheme.outline.withOpacity(0.3) : Colors.grey[200]!),
        borderRadius: BorderRadius.circular(14.r),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
        Icon(Icons.place, size:16.sp, color: isDark ? Colors.grey.shade400 : Colors.blueGrey[400]),
        SizedBox(width:8.w),
        Expanded(child: Text(a.address.isNotEmpty ? a.address : a.short(), style: TextStyle(fontSize:12.sp, height:1.4, color: isDark ? Colors.grey.shade300 : Colors.blueGrey[700]))),
      ]),
    );
  }

  void _openReviewDialog(String id, ReviewService service){
    showUnifiedReviewDialog(
      type: 'guide',
      id: id,
      onSubmit: (rating, comment) async {
        try { await service.addReview(type:'guide', targetId: id, rating: rating, comment: comment); Get.snackbar('Başarılı', 'Yorum kaydedildi'); } catch(e){ Get.snackbar('Hata', 'Kaydedilemedi: $e'); }
      }
    );
  }

  Widget _reviewsSection(ReviewService service, String id, ThemeData theme, bool isDark){
    return StreamBuilder<List<Map<String,dynamic>>>(
      // Only published reviews should be visible to end users
      stream: service.reviewsFor('guide', id, onlyPublished: true),
      builder: (_, snap){
        if (snap.connectionState == ConnectionState.waiting){
          return const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator());
        }
        final data = snap.data ?? [];
        if (data.isEmpty){
          return Text('Henüz yorum yok.', style: TextStyle(fontSize:12.sp, color: isDark ? Colors.grey.shade500 : Colors.grey[600]));
        }
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          Text('Yorumlar', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)),
          SizedBox(height:8.h),
          ...data.take(10).map((m)=> Container(
            margin: EdgeInsets.only(bottom:8.h),
            padding: EdgeInsets.all(10.w),
            decoration: BoxDecoration(color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50], borderRadius: BorderRadius.circular(12.r), border: Border.all(color: isDark ? theme.colorScheme.outline.withOpacity(0.3) : Colors.grey[200]!)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
              Row(children:[ Icon(Icons.star, size:14.sp, color: Colors.amber[600]), SizedBox(width:4.w), Text(m['rating']?.toStringAsFixed(1) ?? m['rating'].toString(), style: TextStyle(fontSize:11.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)) ]),
              SizedBox(height:4.h),
              Text(m['comment']??'', style: TextStyle(fontSize:11.sp, height:1.3, color: theme.colorScheme.onSurfaceVariant)),
            ]),
          ))
        ]);
      },
    );
  }

  void _openReservationSheet(GuideModel guide){
    if (guide.id == null) return;
    final reservationService = Get.find<ReservationService>();
    final currencyService = Get.find<CurrencyService>();
    final date = DateTime.now().add(const Duration(days:4));
    ReservationBottomSheet.show(ReservationBottomSheet(
      title: guide.name,
      subtitle: '${guide.yearsExperience} yıl • Günlük ${currencyService.currentRate.value.formatBoth(guide.dailyRate)}',
      price: guide.dailyRate,
      priceLabel: 'Günlük',
      bodyBuilder: (ctx, c){
        return Column(children:[
          SingleDateField(keyName: 'serviceDate', label: 'Hizmet Tarihi', initial: date),
          const CounterField(keyName: 'pax', label: 'Kişi', min:1, max: 30, initial: 1),
          DropdownField(keyName: 'language', label: 'Dil', options: guide.languages.isEmpty ? const ['tr'] : guide.languages, initial: guide.languages.isNotEmpty ? guide.languages.first : 'tr'),
        ]);
      },
      onSubmit: (controller) async {
        final serviceDate = controller.val<DateTime>('serviceDate') ?? date;
        final pax = controller.val<int>('pax') ?? 1;
        final lang = controller.val<String>('language');
        final builder = ReservationBuilder(
          type: ReservationType.guide,
          userId: Get.find<AuthService>().user.value.id ?? '',
          itemId: guide.id!,
          title: guide.name,
          subtitle: 'Rehber Hizmeti',
          imageUrl: (guide.images.isNotEmpty ? guide.images.first : ''),
          startDate: serviceDate,
          endDate: serviceDate,
          quantity: 1,
          people: pax,
          price: guide.dailyRate,
          userPhone: controller.phoneCtrl.text,
          userEmail: controller.emailCtrl.text,
          notes: controller.noteCtrl.text,
        )..addMeta({
          'language': lang,
          'yearsExperience': guide.yearsExperience,
          'pax': pax,
        });
        await reservationService.create(builder.build());
        return 'ok';
      },
    ));
  }
}
