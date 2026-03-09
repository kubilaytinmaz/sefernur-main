import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/search/tour_search_controller.dart';
import '../../../data/models/reservation/reservation_builder.dart';
import '../../../data/models/reservation/reservation_model.dart';
import '../../../data/models/tour/tour_model.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/currency/currency_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../../../data/services/reservation/reservation_service.dart';
import '../../../data/services/review/review_service.dart';
import '../../widgets/app/listing_app_bar.dart';
import '../../widgets/bottom_sheet/filter_sheet_header.dart';
import '../../widgets/detail/contact_buttons.dart';
import '../../widgets/detail/detail_sheet_constants.dart';
import '../../widgets/detail/drag_handle.dart';
import '../../widgets/detail/favorite_button.dart';
import '../../widgets/detail/image_slider.dart';
import '../../widgets/detail/reserve_button_bar.dart';
import '../../widgets/detail/review_dialog.dart';
import '../../widgets/filters/filter_bar.dart';
import '../../widgets/filters/sort_sheet.dart';
import '../../widgets/reservation/reservation_bottom_sheet.dart';
import '../../widgets/reservation/reservation_form_widgets.dart';
import '../../widgets/search/floating_search_shortcut_button.dart';
import 'components/tour_card.dart';

class ToursPage extends StatelessWidget {
  const ToursPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<TourSearchController>()
        ? Get.find<TourSearchController>()
        : Get.put(TourSearchController());
    if (!controller.hasLoadedAll && controller.results.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) => controller.loadAllTours());
    }
    // Popülerden geldiysek sadece popülerleri göster
    final args = Get.arguments;
    if (args is Map && args['popularOnly'] == true && !controller.viewingPopularOnly.value) {
      WidgetsBinding.instance.addPostFrameCallback((_) => controller.showPopularOnly());
    }
    // Arama bottom sheet'ten tur seçildiyse direkt detayını aç
    if (args is Map && args['openTour'] is TourModel) {
      final tour = args['openTour'] as TourModel;
      // Argümanı map'ten çıkar ki rebuild'de tekrar açılmasın
      args.remove('openTour');
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _openDetail(tour, controller);
      });
    }
    return Scaffold(
      backgroundColor: Get.theme.scaffoldBackgroundColor,
      appBar: const ListingAppBar(title: 'Turlar'),
      body: Obx(() {
        return CustomScrollView(
          slivers: [
            SliverPersistentHeader(
              pinned: true,
              delegate: _ToursFilterHeaderDelegate(
                child: Obx(() => ListingFilterBar(
                  onOpenSort: () => showSortSheet<String>(
                    selected: controller.sortOption.value,
                    options: const [
                      SortOption('date_asc','Yaklaşan Tarih'),
                      SortOption('price_asc','Fiyat (Artan)'),
                      SortOption('price_desc','Fiyat (Azalan)'),
                      SortOption('rating_desc','Puan (Yüksek)'),
                      SortOption('duration_asc','Süre (Kısa)'),
                    ],
                    onSelect: (v) => controller.setSort(v),
                  ),
                  onOpenFilters: () => _openFilterSheet(controller),
                  activeFilterCount: controller.activeFilterCount(),
                  resultCount: controller.filteredResults.length,
                  inlineResult: true,
                  trailing: Builder(
                    builder: (context) {
                      final isDark = Theme.of(context).brightness == Brightness.dark;
                      return IconButton(
                        tooltip: 'Favoriler',
                        onPressed: controller.toggleFavoritesOnly,
                        icon: Icon(
                          controller.favoritesOnly.value ? Icons.favorite : Icons.favorite_border,
                          color: controller.favoritesOnly.value ? Colors.red : (isDark ? Colors.grey[400] : Colors.grey[600]),
                          size: 20.sp,
                        ),
                      );
                    },
                  ),
                )),
              ),
            ),
            if (controller.isSearching.value)
              const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
            else if (controller.filteredResults.isEmpty)
              SliverFillRemaining(
                child: Builder(
                  builder: (context) {
                    final isDark = Theme.of(context).brightness == Brightness.dark;
                    return Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.w),
                        child: Text('Uygun tur bulunamadı', style: TextStyle(fontSize: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
                      ),
                    );
                  },
                ),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate((_, i){
                  final t = controller.filteredResults[i];
                  return Padding(
                    padding: EdgeInsets.fromLTRB(16.w, 8.h, 16.w, 6.h),
                    child: TourCard(
                      tour: t,
                      controller: controller,
                      onTap: () => _openDetail(t, controller),
                    ),
                  );
                }, childCount: controller.filteredResults.length),
              ),
            SliverToBoxAdapter(child: SizedBox(height: 40.h)),
          ],
        );
      }),
      floatingActionButton: const FloatingSearchShortcutButton(searchTabIndex: 1),
    );
  }

  void _openFilterSheet(TourSearchController c) {
    Get.bottomSheet(
      DraggableScrollableSheet(
        initialChildSize: 0.75,
        maxChildSize: 0.95,
        minChildSize: 0.45,
        expand: false,
        builder: (ctx, scroll) {
          final theme = Theme.of(ctx);
          final isDark = theme.brightness == Brightness.dark;
          final bgColor = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white;
          final textColor = theme.colorScheme.onSurface;
          
          return SafeArea(
          bottom: false,
            top: false,
            child: Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(28.r),
                  topRight: Radius.circular(28.r),
                ),
              ),
              child: SingleChildScrollView(
                controller: scroll,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const FilterSheetHeader(title: 'Filtreler', spacingAfter: 14),
                    Obx(() => Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (c.allCategories.isNotEmpty) ...[
                              Text('Kategoriler',
                                  style: TextStyle(
                                      fontSize: 13.sp,
                                      fontWeight: FontWeight.w600,
                                      color: textColor)),
                              SizedBox(height: 6.h),
                              Wrap(
                                  spacing: 6.w,
                                  runSpacing: 6.h,
                                  children: c.allCategories
                                      .take(20)
                                      .map((cat) {
                                    final sel =
                                        c.selectedCategories.contains(cat);
                                    return FilterChip(
                                        label: Text(cat.toUpperCase()),
                                        selected: sel,
                                        onSelected: (_) =>
                                            c.toggleCategory(cat));
                                  }).toList()),
                              SizedBox(height: 14.h),
                            ],
                            if (c.allTags.isNotEmpty) ...[
                              Text('Etiketler',
                                  style: TextStyle(
                                      fontSize: 13.sp,
                                      fontWeight: FontWeight.w600,
                                      color: textColor)),
                              SizedBox(height: 6.h),
                              Wrap(
                                  spacing: 6.w,
                                  runSpacing: 6.h,
                                  children: c.allTags.take(30).map((tag) {
                                    final sel = c.selectedTags.contains(tag);
                                    return FilterChip(
                                        label: Text(tag.toUpperCase()),
                                        selected: sel,
                                        onSelected: (_) =>
                                            c.toggleTag(tag));
                                  }).toList()),
                              SizedBox(height: 14.h),
                            ],
                            Row(children: [
                              Expanded(child: _ratingFilter(c, ctx)),
                              SizedBox(width: 12.w),
                              Expanded(child: _durationFilter(c, ctx)),
                            ]),
                            SizedBox(height: 18.h),
                            Row(children: [
                              Obx(() => Switch(
                                  value: c.favoritesOnly.value,
                                  onChanged: (_) => c.toggleFavoritesOnly())),
                              SizedBox(width: 8.w),
                              Text('Sadece Favoriler',
                                  style: TextStyle(
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w600,
                                      color: textColor)),
                            ]),
                            SizedBox(height: 12.h),
                            Row(children: [
                              Expanded(
                                  child: ElevatedButton.icon(
                                      onPressed: () => c.clearFilters(),
                                      icon: const Icon(Icons.refresh),
                                      label: const Text('Temizle'))),
                              SizedBox(width: 12.w),
                              Expanded(
                                  child: ElevatedButton.icon(
                                      onPressed: () => Navigator.pop(ctx),
                                      icon: const Icon(
                                          Icons.check_circle_outline),
                                      label: const Text('Uygula'))),
                            ])
                          ],
                        )),
                  ],
                ),
              ),
            ),
          );
        },
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  // Removed local sort sheet (now using showSortSheet helper)
  
  String _shortAddresses(TourModel t) {
    if (t.serviceAddresses.isEmpty) return '';
    return t.serviceAddresses.take(3).map((a) {
      if (a.city.isNotEmpty) return a.city;
      if (a.country.isNotEmpty) return a.country;
      return a.address.split(',').first;
    }).join(', ');
  }

  void _openDetail(TourModel tour, TourSearchController c) {
    final price = c.priceFor(tour);
    final favService =
        Get.isRegistered<FavoriteService>() ? Get.find<FavoriteService>() : null;
    final reviewService =
        Get.isRegistered<ReviewService>() ? Get.find<ReviewService>() : null;
    final dateKey = c.travelDate.value?.toIso8601String().split('T').first;
    final av = dateKey != null ? tour.availability[dateKey] : null;
    final capLeft = av == null ? null : av.capacity - (av.sold ?? 0);
  // heroTag removed (shared ImageSlider handles hero if needed)
  Get.bottomSheet(
    DraggableScrollableSheet(
      initialChildSize: DetailSheetConfig.initialChildSize,
      maxChildSize: DetailSheetConfig.maxChildSize,
      minChildSize: DetailSheetConfig.minChildSize,
      expand: false,
      builder: (ctx, scroll){
        final theme = Theme.of(ctx);
        final isDark = theme.brightness == Brightness.dark;
        final bgColor = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white;
        final textColor = theme.colorScheme.onSurface;
        final subtitleColor = isDark ? Colors.grey[400] : Colors.blueGrey[600];
        final cardBg = isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50];
        final borderColor = isDark ? Colors.grey[700]! : Colors.grey[200]!;
        
        return SafeArea(
          bottom: false,top:false, child: Stack(children:[
          Container(
            decoration: BoxDecoration(color: bgColor, borderRadius: DetailSheetConfig.radius),
            child: CustomScrollView(
              controller: scroll,
              slivers:[SliverToBoxAdapter(child: Padding(padding: EdgeInsets.fromLTRB(20.w,12.h,20.w,24.h), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
                const DragHandle(),
                if (tour.images.isNotEmpty) ImageSlider(images: tour.images),
                SizedBox(height:14.h),
                Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
                  Expanded(child: Text(tour.title, style: TextStyle(fontSize:20.sp, fontWeight: FontWeight.w800, height:1.2, color: textColor))),
                  if (tour.id!=null) Obx(()=> FavoriteButton(initial: (favService?.isFavorite('tour', tour.id!) ?? c.isFavorite(tour.id)), onChanged: (_){ if (favService!=null){ final meta = favService.buildMetaForEntity(type: 'tour', model: tour); favService.toggle(type:'tour', targetId: tour.id!, meta: meta);} else { c.toggleFavorite(tour.id!);} }))
                ]),
                Row(children:[
                  Icon(Icons.star_rounded, size:18.sp, color: Colors.amber), SizedBox(width:4.w),
                  Text(tour.rating.toStringAsFixed(1), style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w600, color: textColor)), SizedBox(width:6.w),
                  Text('(\${tour.reviewCount} yorum)', style: TextStyle(fontSize:12.sp, color: subtitleColor)),
                  if (tour.id!=null && reviewService!=null) TextButton.icon(onPressed: ()=> _openAddReviewDialog(tour.id, 'tour'), icon: const Icon(Icons.add_comment_outlined, size:18), label: const Text('Yorum Yaz'))
                ]),
                Text('\${tour.durationDays} gün • \${_shortAddresses(tour)}', style: TextStyle(fontSize:12.sp, color: subtitleColor)),
                
                if (tour.serviceType != null)
                  Padding(padding: EdgeInsets.only(top: 6.h), child: Text(tour.serviceType!, style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.blueGrey[300] : Colors.blueGrey[800]))),
                
                // Mekke/Medine gece bilgisi - her zaman göster
                Padding(padding: EdgeInsets.only(top: 8.h), child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.amber[900]!.withOpacity(0.3) : Colors.amber[50],
                    borderRadius: BorderRadius.circular(10.r),
                    border: Border.all(color: isDark ? Colors.amber[700]! : Colors.amber[200]!),
                  ),
                  child: Row(children: [
                    Icon(Icons.nights_stay, size: 16.sp, color: isDark ? Colors.amber[400] : Colors.amber[800]),
                    SizedBox(width: 8.w),
                    Flexible(child: Text('Mekke: ${tour.mekkeNights ?? "-"} Gece', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.amber[300] : Colors.amber[900]))),
                    Text(' • ', style: TextStyle(color: isDark ? Colors.amber[600] : Colors.amber[400])),
                    Flexible(child: Text('Medine: ${tour.medineNights ?? "-"} Gece', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.amber[300] : Colors.amber[900]))),
                  ]),
                )),

                if (tour.flightDepartureFrom != null || tour.flightReturnFrom != null)
                  Container(
                    margin: EdgeInsets.only(top: 12.h),
                    padding: EdgeInsets.all(10.w),
                    decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(10.r), border: isDark ? Border.all(color: borderColor) : null),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      if (tour.airline != null) Padding(
                        padding: EdgeInsets.only(bottom: 6.h), 
                        child: Row(children: [
                          if (tour.airlineLogo != null && tour.airlineLogo!.isNotEmpty)
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4.r),
                              child: Image.network(tour.airlineLogo!, width: 32.w, height: 24.h, fit: BoxFit.contain, errorBuilder: (_, __, ___) => Icon(Icons.flight_takeoff, size: 18.sp, color: theme.primaryColor)),
                            )
                          else
                            Icon(Icons.flight_takeoff, size: 18.sp, color: theme.primaryColor),
                          SizedBox(width: 8.w), 
                          Text(tour.airline!, style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.bold, color: textColor))
                        ]),
                      ),
                      if (tour.flightDepartureFrom != null && tour.flightDepartureTo != null)
                        Row(children: [Text('Gidiş: ', style: TextStyle(fontSize: 11.sp, color: subtitleColor)), Text('\${tour.flightDepartureFrom} -> \${tour.flightDepartureTo}', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: textColor))]),
                      if (tour.flightReturnFrom != null && tour.flightReturnTo != null)
                        Padding(padding: EdgeInsets.only(top: 4.h), child: Row(children: [Text('Dönüş: ', style: TextStyle(fontSize: 11.sp, color: subtitleColor)), Text('\${tour.flightReturnFrom} -> \${tour.flightReturnTo}', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: textColor))])),
                    ]),
                  ),

                SizedBox(height:10.h),
                Wrap(spacing:6.w, runSpacing:6.h, children:[ _chip(tour.category, ctx), ...tour.tags.take(6).map((t) => _chip(t, ctx)) ]),
                SizedBox(height:16.h),
                _priceRow(price, tour, av),
                if (capLeft != null) Padding(padding: EdgeInsets.only(top:8.h), child: Text('Kalan Kapasite: \$capLeft', style: TextStyle(fontSize:12.sp, fontWeight: FontWeight.w600, color: capLeft <5 ? Colors.red : Colors.green[700]))),
                if (tour.company != null) Padding(padding: EdgeInsets.only(top:12.h), child: Text('Düzenleyen: \${tour.company}', style: TextStyle(fontSize:12.sp, fontWeight: FontWeight.w500, color: textColor))),
                if (tour.addressModel != null) ...[
                  SizedBox(height:14.h), Text('Başlangıç Adresi', style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w700, color: textColor)), SizedBox(height:4.h), Text(tour.addressModel!.address, style: TextStyle(fontSize:12.sp, height:1.4, color: subtitleColor))
                ],
                SizedBox(height:18.h),
                if (tour.program.isNotEmpty) Text('Program', style: TextStyle(fontSize:15.sp, fontWeight: FontWeight.w700, color: textColor)),
                if (tour.program.isNotEmpty) SizedBox(height:8.h),
                ..._buildProgramTimeline(tour.program, ctx),
                SizedBox(height:20.h),
                Text('İletişim', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700, color: textColor)),
                SizedBox(height:8.h),
                ContactButtons(phone: tour.phone, sms: tour.phone, whatsapp: tour.whatsapp),
                SizedBox(height:24.h),
                if (reviewService!=null && tour.id!=null) _reviewsSection(reviewService, tour.id!),
                SizedBox(height:120.h),
              ]),)),
              ],
            ),
          ),
          Align(alignment: Alignment.bottomCenter, child: ReserveButtonBar(onPressed: tour.id == null ? null : () => _openReservationSheet(tour, c, price))),
        ]));
      },
    ),
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
  );
  }
  List<Widget> _buildProgramTimeline(List<TourDayProgram> days, BuildContext ctx){
    if (days.isEmpty) return [];
    final theme = Theme.of(ctx);
    final isDark = theme.brightness == Brightness.dark;
    final cardBg = isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50];
    final borderColor = isDark ? Colors.grey[700]! : Colors.grey[200]!;
    final dayLabelColor = isDark ? Colors.grey[400] : Colors.grey[500];
    final titleColor = theme.colorScheme.onSurface;
    final detailsColor = isDark ? Colors.grey[400] : Colors.grey[700];
    final countryColor = isDark ? Colors.grey[500] : Colors.grey[600];
    
    return days.map((d){
      return Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
        Column(children:[
          Container(
            width: 26.w,
            alignment: Alignment.center,
            child: CircleAvatar(
              radius: 12.r,
              backgroundColor: theme.primaryColor.withOpacity(.15),
              child: Text('${d.day}', style: TextStyle(fontSize:11.sp, fontWeight: FontWeight.w700, color: theme.primaryColor)),
            ),
          ),
          if (d != days.last)
            Container(width:2.w, height: 50.h, color: theme.primaryColor.withOpacity(.25)),
        ]),
        SizedBox(width:10.w),
        Expanded(child: Container(
          margin: EdgeInsets.only(bottom:14.h),
          padding: EdgeInsets.all(12.w),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(14.r),
            border: Border.all(color: borderColor),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
            // Gün başlığı (dayLabel varsa göster)
            if (d.dayLabel != null && d.dayLabel!.isNotEmpty)
              Padding(
                padding: EdgeInsets.only(bottom: 4.h),
                child: Text(d.dayLabel!, style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w600, color: dayLabelColor)),
              ),
            Text(d.title, style: TextStyle(fontSize:12.sp, fontWeight: FontWeight.w700, color: titleColor)),
            SizedBox(height:4.h),
            Text(d.details, style: TextStyle(fontSize:11.sp, height:1.4, color: detailsColor)),
            // Konum bilgisi
            if (d.addressModel != null && (d.addressModel!.address.isNotEmpty || d.addressModel!.city.isNotEmpty))
              Container(
                margin: EdgeInsets.only(top: 8.h),
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 8.h),
                decoration: BoxDecoration(
                  color: theme.primaryColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10.r),
                  border: Border.all(color: theme.primaryColor.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.place, size: 16.sp, color: theme.primaryColor),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            d.addressModel!.city.isNotEmpty ? d.addressModel!.city : d.addressModel!.address,
                            style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: theme.primaryColor),
                          ),
                          if (d.addressModel!.country.isNotEmpty)
                            Text(
                              d.addressModel!.country,
                              style: TextStyle(fontSize: 9.sp, color: countryColor),
                            ),
                        ],
                      ),
                    ),
                    if (d.addressModel!.location != null)
                      Icon(Icons.chevron_right, size: 16.sp, color: isDark ? Colors.grey[500] : Colors.grey[400]),
                  ],
                ),
              ),
          ]),
        ))
      ]);
    }).toList();
  }

  // Removed local image slider (using shared ImageSlider)
  void _openReservationSheet(TourModel tour, TourSearchController c, double price){
    if (tour.id == null) return;
    final reservationService = Get.find<ReservationService>();
    final travel = c.travelDate.value ?? DateTime.now().add(const Duration(days:3));
    ReservationBottomSheet.show(ReservationBottomSheet(
      title: tour.title,
      subtitle: '${tour.durationDays} gün • ${_shortAddresses(tour)}',
      price: price,
      priceLabel: 'Kişi',
      bodyBuilder: (ctx, ctrl){
        return Column(children:[
          SingleDateField(keyName: 'travelDate', label: 'Tur Tarihi', initial: travel),
          CounterField(keyName: 'adults', label: 'Yetişkin', min:1, max: 50, initial: c.adults.value),
          CounterField(keyName: 'children', label: 'Çocuk', min:0, max: 50, initial: c.children.value),
        ]);
      },
      onSubmit: (controller) async {
        final date = controller.val<DateTime>('travelDate') ?? travel;
        final adults = controller.val<int>('adults') ?? 1;
        final children = controller.val<int>('children') ?? 0;
        final totalPax = adults + children;
        final totalPrice = price * adults + (tour.childPrice != null ? tour.childPrice!.toDouble() * children : price * 0.7 * children);
        final builder = ReservationBuilder(
          type: ReservationType.tour,
          userId: Get.find<AuthService>().user.value.id ?? '',
          itemId: tour.id!,
          title: tour.title,
          subtitle: _shortAddresses(tour),
          imageUrl: (tour.images.isNotEmpty ? tour.images.first : ''),
          startDate: date,
          endDate: date.add(Duration(days: tour.durationDays - 1)),
          quantity: tour.durationDays,
          people: totalPax,
          price: totalPrice,
          userPhone: controller.phoneCtrl.text,
          userEmail: controller.emailCtrl.text,
          notes: controller.noteCtrl.text,
        )..addMeta({
          'durationDays': tour.durationDays,
          'adults': adults,
          'children': children,
          'baseAdultPrice': price,
          if (tour.childPrice != null) 'childPrice': tour.childPrice,
        });
        await reservationService.create(builder.build());
        return 'ok';
      },
    ));
  }

  Widget _chip(String text, BuildContext ctx) {
    final theme = Theme.of(ctx);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
        decoration: BoxDecoration(
            color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100],
            borderRadius: BorderRadius.circular(20.r)),
        child: Text(text,
            style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)));
  }

  Widget _priceRow(double price, TourModel tour, av) {
    final special = av?.specialPrice;
    final hasDiscount = special != null && special < tour.basePrice;
    final currencyService = Get.find<CurrencyService>();
    return Row(children: [
      Obx(() => Text(currencyService.currentRate.value.formatBoth(price),
          style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.bold,
              color: Colors.green[700]))),
      if (hasDiscount) ...[
        SizedBox(width: 8.w),
        Obx(() => Text(currencyService.currentRate.value.formatBoth(tour.basePrice),
            style: TextStyle(
                fontSize: 12.sp,
                color: Colors.grey,
                decoration: TextDecoration.lineThrough))),
      ],
      if (tour.childPrice != null)
        Padding(
            padding: EdgeInsets.only(left: 12.w),
            child: Obx(() => Text('Çocuk ${currencyService.currentRate.value.formatBoth(tour.childPrice!)}',
                style: TextStyle(fontSize: 11.sp, color: Colors.grey[600])))),
    ]);
  }

  // Removed legacy contact buttons (using ContactButtons)

  // Removed legacy contact button + launcher helpers (standardized)

  void _openAddReviewDialog(String? id, String type){ if (id==null) return; showUnifiedReviewDialog(type: type, id: id, onSubmit: (r,c) async { final service = Get.find<ReviewService>(); await service.addReview(type: type, targetId: id, rating: r, comment: c); }); }

  Widget _reviewsSection(ReviewService service, String id) {
    final showAll = false.obs;
    return StreamBuilder<List<Map<String, dynamic>>>(
  // Only published reviews should be visible to end users
  stream: id.isEmpty ? const Stream.empty() : service.reviewsFor('tour', id, onlyPublished: true),
      builder: (ctx, snap) {
        if (!snap.hasData) return const SizedBox();
        final reviews = snap.data!;
        if (reviews.isEmpty) {
          return Text('Henüz yorum yok',
              style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]));
        }
        return Obx(() {
          final visible = showAll.value ? reviews : reviews.take(5).toList();
          return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children:[
                  Text('Yorumlar', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  if (reviews.length>5)
                    TextButton(onPressed: ()=> showAll.value = !showAll.value, child: Text(showAll.value ? 'Daha Az' : 'Daha Fazla'))
                ]),
                SizedBox(height: 8.h),
                ...visible.map((r) {
                  final rt = double.tryParse(r['rating']?.toString() ?? '0') ?? 0;
                  final cm = (r['comment'] ?? '') as String;
                  return Container(
                      margin: EdgeInsets.only(bottom: 8.h),
                      padding: EdgeInsets.all(10.w),
                      decoration: BoxDecoration(
                          color: Colors.grey[50],
                          borderRadius: BorderRadius.circular(10.r),
                          border: Border.all(color: Colors.grey[200]!)),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              Icon(Icons.star, size: 14.sp, color: Colors.amber[600]),
                              SizedBox(width: 4.w),
                              Text(rt.toStringAsFixed(1), style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600))
                            ]),
                            SizedBox(height: 4.h),
                            Text(cm.isEmpty ? '(Yorum yok)' : cm, style: TextStyle(fontSize: 11.sp, height: 1.35))
                          ]));
                }),
              ]);
        });
      },
    );
  }

  Widget _ratingFilter(TourSearchController c, BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.colorScheme.onSurface;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Icon(Icons.star, color: Colors.amber[600], size: 18.sp),
        SizedBox(width: 6.w),
        Obx(() => Text('Min Puan: ${c.minRating.value.toStringAsFixed(1)}',
            style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: textColor))),
        if (c.minRating.value > 0)
          TextButton(
              onPressed: () => c.setMinRating(0),
              child: const Text('Sıfırla'))
      ]),
      Obx(() => Slider(
          min: 0,
          max: 5,
          divisions: 10,
          value: c.minRating.value.clamp(0, 5),
          label: c.minRating.value.toStringAsFixed(1),
          onChanged: (v) => c.setMinRating(v)))
    ]);
  }

  Widget _durationFilter(TourSearchController c, BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.colorScheme.onSurface;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Icon(Icons.timelapse, size: 18.sp, color: Colors.blueGrey[600]),
        SizedBox(width: 6.w),
        Obx(() => Text(
            'Max Gün: ${c.maxDuration.value == 0 ? 'Sınırsız' : c.maxDuration.value}',
            style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: textColor))),
        if (c.maxDuration.value > 0)
          TextButton(
              onPressed: () => c.setMaxDuration(0),
              child: const Text('Sıfırla'))
      ]),
      Obx(() => Slider(
          min: 0,
          max: 30,
          divisions: 30,
          value: c.maxDuration.value.toDouble().clamp(0, 30),
          label: c.maxDuration.value == 0
              ? '—'
              : c.maxDuration.value.toString(),
          onChanged: (v) => c.setMaxDuration(v.round())))
    ]);
  }

  // --- End old header delegate removal ---
}

class _ToursFilterHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  _ToursFilterHeaderDelegate({required this.child});
  @override double get minExtent => 66.h;
  @override double get maxExtent => 66.h;
  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    final theme = Theme.of(context);
    return Material(color: theme.scaffoldBackgroundColor, elevation: overlapsContent ? 2 : 0, child: child);
  }
  @override bool shouldRebuild(covariant _ToursFilterHeaderDelegate oldDelegate) => false;
}

// Removed legacy _ToursBarDelegate (replaced by ListingFilterBar)

