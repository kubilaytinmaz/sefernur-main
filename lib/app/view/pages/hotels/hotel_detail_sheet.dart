import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../data/adapters/webbeds_hotel_adapter.dart';
import '../../../data/models/hotel/hotel_model.dart';
import '../../../data/models/reservation/reservation_builder.dart';
import '../../../data/models/reservation/reservation_model.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../../../data/services/reservation/reservation_service.dart';
import '../../../data/services/review/review_service.dart';
import '../../../data/services/webbeds/webbeds_service.dart';
import '../../widgets/detail/contact_buttons.dart';
import '../../widgets/detail/detail_sheet_constants.dart';
import '../../widgets/detail/drag_handle.dart';
import '../../widgets/detail/favorite_button.dart';
import '../../widgets/detail/image_slider.dart';
import '../../widgets/detail/reserve_button_bar.dart';
import '../../widgets/detail/review_dialog.dart';
import '../../widgets/reservation/reservation_bottom_sheet.dart';
import '../../widgets/reservation/reservation_form_widgets.dart';

/// Shows the standardized hotel detail sheet.
Future<void> showHotelDetailSheet(HotelModel hotel) async {
  final reviewService = Get.isRegistered<ReviewService>()
      ? Get.find<ReviewService>()
      : null;
  await Get.bottomSheet(
    DraggableScrollableSheet(
      initialChildSize: DetailSheetConfig.initialChildSize,
      maxChildSize: DetailSheetConfig.maxChildSize,
      minChildSize: DetailSheetConfig.minChildSize,
      expand: false,
      builder: (ctx, scroll) => SafeArea(
        bottom: false,
        top: false,
        child: _HotelDetailContent(
          hotel: hotel,
          reviewService: reviewService,
          scroll: scroll,
        ),
      ),
    ),
    ignoreSafeArea: false,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
  );
}

class _HotelDetailContent extends StatefulWidget {
  final HotelModel hotel;
  final ReviewService? reviewService;
  final ScrollController scroll;
  const _HotelDetailContent({
    required this.hotel,
    required this.reviewService,
    required this.scroll,
  });
  @override
  State<_HotelDetailContent> createState() => _HotelDetailContentState();
}

class _HotelDetailContentState extends State<_HotelDetailContent> {
  late RxBool isFav;
  FavoriteService? favService;
  @override
  void initState() {
    super.initState();
    favService = Get.isRegistered<FavoriteService>()
        ? Get.find<FavoriteService>()
        : null;
    final h = widget.hotel;
    isFav =
        (h.id != null && favService != null
                ? favService!.isFavorite('hotel', h.id!)
                : h.favoriteUserIds.isNotEmpty)
            .obs;
  }

  @override
  Widget build(BuildContext context) {
    final h = widget.hotel;
    final lowestPrice = _lowestPrice(h);
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: DetailSheetConfig.radius,
          ),
          child: CustomScrollView(
            controller: widget.scroll,
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 24.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const DragHandle(),
                      if (h.images.isNotEmpty) ImageSlider(images: h.images),
                      SizedBox(height: 12.h),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              h.name,
                              style: TextStyle(
                                fontSize: 20.sp,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          Obx(
                            () => FavoriteButton(
                              initial: isFav.value,
                              onChanged: (v) {
                                final hId = h.id;
                                if (hId == null) return;
                                if (favService != null) {
                                  final meta = favService!.buildMetaForEntity(
                                    type: 'hotel',
                                    model: h,
                                  );
                                  favService!.toggle(
                                    type: 'hotel',
                                    targetId: hId,
                                    meta: meta,
                                  );
                                }
                                isFav.value = v;
                              },
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8.h),
                      Row(
                        children: [
                          Icon(
                            Icons.star_rounded,
                            size: 18.sp,
                            color: Colors.amber,
                          ),
                          SizedBox(width: 4.w),
                          Text(
                            h.rating.toStringAsFixed(1),
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(width: 6.w),
                          Text(
                            '(${h.reviewCount} yorum)',
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: Colors.blueGrey[600],
                            ),
                          ),
                          const Spacer(),
                          if (h.id != null && widget.reviewService != null)
                            TextButton.icon(
                              onPressed: () => _openReviewDialog(h),
                              icon: const Icon(
                                Icons.add_comment_outlined,
                                size: 18,
                              ),
                              label: const Text('Yorum Yaz'),
                            ),
                        ],
                      ),
                      SizedBox(height: 12.h),
                      if (h.address.isNotEmpty) _addressBox(h),
                      SizedBox(height: 16.h),
                      Text(
                        'Hakkında',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: 6.h),
                      Text(
                        h.description,
                        style: TextStyle(
                          fontSize: 12.sp,
                          height: 1.5,
                          color: Colors.blueGrey[700],
                        ),
                      ),
                      SizedBox(height: 18.h),
                      if (h.roomTypes.isNotEmpty) ...[
                        Text(
                          'Oda Tipleri',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: 8.h),
                        ...h.roomTypes.take(6).map(_roomTypeTile),
                        SizedBox(height: 10.h),
                      ],
                      _priceSummary(lowestPrice),
                      SizedBox(height: 22.h),
                      Text(
                        'İletişim',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      ContactButtons(
                        phone: h.phone,
                        sms: h.phone,
                        whatsapp: h.whatsapp,
                      ),
                      SizedBox(height: 24.h),
                      if (h.amenities.isNotEmpty) _amenities(h.amenities),
                      SizedBox(height: 24.h),
                      if (widget.reviewService != null && h.id != null)
                        _reviewsSection(h),
                      SizedBox(height: 120.h),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: ReserveButtonBar(onPressed: () => _openReservationSheet(h)),
        ),
      ],
    );
  }

  Widget _addressBox(HotelModel h) => Container(
    padding: EdgeInsets.all(12.w),
    decoration: BoxDecoration(
      color: Colors.grey[50],
      borderRadius: BorderRadius.circular(20.r),
      border: Border.all(color: Colors.grey[200]!),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.place, size: 18.sp, color: Colors.blueGrey[500]),
        SizedBox(width: 8.w),
        Expanded(
          child: Text(
            h.addressModel.address,
            style: TextStyle(
              fontSize: 12.sp,
              height: 1.4,
              color: Colors.blueGrey[700],
            ),
          ),
        ),
      ],
    ),
  );

  Widget _roomTypeTile(RoomType r) {
    final price = r.discountedPrice ?? r.originalPrice;
    final hasDiscount =
        r.discountedPrice != null && r.discountedPrice! < r.originalPrice;
    return Container(
      margin: EdgeInsets.only(bottom: 8.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.r),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  r.name,
                  style: TextStyle(
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 4.h),
                Text(
                  '${r.boardType} • Kapasite: ${r.capacity}',
                  style: TextStyle(
                    fontSize: 11.sp,
                    color: Colors.blueGrey[600],
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${price.toStringAsFixed(0)} ₺',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w700,
                  color: Colors.green[700],
                ),
              ),
              if (hasDiscount)
                Text(
                  '${r.originalPrice.toStringAsFixed(0)} ₺',
                  style: TextStyle(
                    fontSize: 10.sp,
                    color: Colors.grey,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _priceSummary(double price) => Container(
    padding: EdgeInsets.all(16.w),
    decoration: BoxDecoration(
      color: Colors.blueGrey[50],
      borderRadius: BorderRadius.circular(24.r),
    ),
    child: Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Başlangıç Fiyatı',
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.blueGrey[600],
                ),
              ),
              SizedBox(height: 4.h),
              Text(
                '${price.toStringAsFixed(0)} ₺ / gece',
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w800,
                  color: Colors.blueGrey[900],
                ),
              ),
            ],
          ),
        ),
        const Icon(Icons.attach_money, color: Colors.blueGrey),
      ],
    ),
  );

  Widget _amenities(List<String> items) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Özellikler',
        style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700),
      ),
      SizedBox(height: 8.h),
      Wrap(
        spacing: 6.w,
        runSpacing: 6.h,
        children: items
            .take(20)
            .map(
              (e) => Container(
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(14.r),
                ),
                child: Text(
                  e,
                  style: TextStyle(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            )
            .toList(),
      ),
    ],
  );

  Widget _reviewsSection(HotelModel h) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      // Public view: only show published (approved) reviews
      stream: widget.reviewService!.reviewsFor(
        'hotel',
        h.id!,
        onlyPublished: true,
      ),
      builder: (_, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(12),
              child: CircularProgressIndicator(),
            ),
          );
        }
        final data = snap.data ?? [];
        if (data.isEmpty) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Yorumlar',
                style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 8.h),
              Text(
                'Henüz yorum yok',
                style: TextStyle(fontSize: 12.sp, color: Colors.blueGrey[600]),
              ),
            ],
          );
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Yorumlar',
              style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700),
            ),
            SizedBox(height: 8.h),
            ...data.take(8).map(_reviewTile),
          ],
        );
      },
    );
  }

  Widget _reviewTile(Map<String, dynamic> r) {
    final rating = (r['rating'] ?? 0).toDouble();
    return Container(
      margin: EdgeInsets.only(bottom: 10.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(18.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ...List.generate(
                5,
                (i) => Icon(
                  i < rating.round()
                      ? Icons.star_rounded
                      : Icons.star_border_rounded,
                  size: 14.sp,
                  color: Colors.amber,
                ),
              ),
              const Spacer(),
              Text(
                (r['user'] ?? 'Anonim'),
                style: TextStyle(
                  fontSize: 11.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.blueGrey[600],
                ),
              ),
            ],
          ),
          SizedBox(height: 6.h),
          Text(
            r['comment'] ?? '',
            style: TextStyle(fontSize: 11.sp, height: 1.35),
          ),
        ],
      ),
    );
  }

  void _openReviewDialog(HotelModel h) {
    if (h.id == null || widget.reviewService == null) return;
    showUnifiedReviewDialog(
      type: 'hotel',
      id: h.id!,
      onSubmit: (rating, comment) async {
        try {
          await widget.reviewService!.addReview(
            type: 'hotel',
            targetId: h.id!,
            rating: rating,
            comment: comment,
          );
          Get.snackbar('Başarılı', 'Yorum kaydedildi');
        } catch (e) {
          Get.snackbar('Hata', 'Kaydedilemedi: $e');
        }
      },
    );
  }

  double _lowestPrice(HotelModel h) {
    if (h.roomTypes.isEmpty) return 0;
    double m = double.infinity;
    for (final r in h.roomTypes) {
      final p = r.discountedPrice ?? r.originalPrice;
      if (p < m) m = p;
    }
    return m == double.infinity ? 0 : m;
  }

  void _openReservationSheet(HotelModel h) {
    if (h.id == null) return;

    // WebBeds otel ise ayrı akış
    if (WebBedsHotelAdapter.isWebBedsHotel(h)) {
      _openWebBedsBookingSheet(h);
      return;
    }

    // Legacy Firebase akışı (artık kullanılmıyor ama UI bozulmasın diye kalsın)
    final reservationService = Get.find<ReservationService>();
    final start = DateTime.now().add(const Duration(days: 2));
    final end = start.add(const Duration(days: 2));
    final price = _lowestPrice(h);
    ReservationBottomSheet.show(
      ReservationBottomSheet(
        title: h.name,
        subtitle: h.addressModel.address,
        price: price,
        priceLabel: 'Gece',
        bodyBuilder: (context, c) {
          return Column(
            children: [
              DateRangeField(
                startKey: 'checkIn',
                endKey: 'checkOut',
                label: 'Check-in / Check-out',
                initialStart: start,
                initialEnd: end,
              ),
              const CounterField(
                keyName: 'adults',
                label: 'Yetişkin',
                min: 1,
                max: 10,
                initial: 2,
              ),
              const CounterField(
                keyName: 'rooms',
                label: 'Oda',
                min: 1,
                max: 5,
                initial: 1,
              ),
              const DropdownField(
                keyName: 'board',
                label: 'Pansiyon Tipi',
                options: ['BB', 'HB', 'FB', 'AI'],
                initial: 'BB',
              ),
            ],
          );
        },
        onSubmit: (controller) async {
          final ci = controller.val<DateTime>('checkIn') ?? start;
          final co = controller.val<DateTime>('checkOut') ?? end;
          final adults = controller.val<int>('adults') ?? 2;
          final rooms = controller.val<int>('rooms') ?? 1;
          final board = controller.val<String>('board');
          final nights = co.difference(ci).inDays;
          final builder =
              ReservationBuilder(
                type: ReservationType.hotel,
                userId: Get.find<AuthService>().user.value.id ?? '',
                itemId: h.id!,
                title: h.name,
                subtitle: h.addressModel.address,
                imageUrl: (h.images.isNotEmpty ? h.images.first : ''),
                startDate: ci,
                endDate: co,
                quantity: nights,
                people: adults,
                price: price * (nights <= 0 ? 1 : nights) * rooms,
                userPhone: controller.phoneCtrl.text,
                userEmail: controller.emailCtrl.text,
                notes: controller.noteCtrl.text,
              )..addMeta({
                'nights': nights,
                'baseNightly': price,
                'company': h.category,
                'roomTypeExample': h.roomTypes.isNotEmpty
                    ? h.roomTypes.first.id
                    : null,
                'adults': adults,
                'rooms': rooms,
                if (board != null) 'boardType': board,
              });
          try {
            await reservationService.create(builder.build());
          } catch (e) {
            rethrow;
          }
          return 'ok';
        },
      ),
    );
  }

  /// WebBeds otel rezervasyon sayfasını aç
  void _openWebBedsBookingSheet(HotelModel h) {
    final webBedsService = Get.find<WebBedsService>();

    // Seçilen WebBeds otelini bul
    final webBedsHotel = webBedsService.searchResults.firstWhereOrNull(
      (hotel) => 'wb_${hotel.hotelId}' == h.id,
    );

    if (webBedsHotel == null) {
      Get.snackbar('Hata', 'Otel bilgisi bulunamadı');
      return;
    }

    // Booking sayfasına git
    Get.toNamed('/webbeds-booking', arguments: webBedsHotel);
  }
}
