import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../data/models/car/car_model.dart';
import '../../../data/models/reservation/reservation_builder.dart';
import '../../../data/models/reservation/reservation_model.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../../../data/services/reservation/reservation_service.dart';
import '../../../data/services/review/review_service.dart';
import '../../widgets/detail/contact_buttons.dart';
import '../../widgets/detail/detail_sheet_constants.dart';
import '../../widgets/detail/drag_handle.dart';
import '../../widgets/detail/favorite_button.dart';
import '../../widgets/detail/image_slider.dart';
import '../../widgets/detail/reserve_button_bar.dart';
import '../../widgets/detail/review_dialog.dart';
import '../../widgets/reservation/reservation_bottom_sheet.dart';
import '../../widgets/reservation/reservation_form_widgets.dart';

class CarDetailPage extends StatefulWidget {
  const CarDetailPage({super.key});

  static Future<void> showAsBottomSheet(BuildContext context, CarModel car) async {
    final reviewService = Get.find<ReviewService>();
    final favService = Get.isRegistered<FavoriteService>() ? Get.find<FavoriteService>() : null;
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CarDetailBottomSheet(car: car, reviewService: reviewService, favService: favService),
    );
  }

  @override
  State<CarDetailPage> createState() => _CarDetailPageState();
}

class _CarDetailPageState extends State<CarDetailPage> {
  late CarModel car;
  late ReviewService reviewService;
  FavoriteService? favService;
  late RxBool isFav;
  late final PageController _pageController; // retained for potential future hero transitions

  @override
  void initState() {
    super.initState();
    final args = Get.arguments as Map<String, dynamic>?;
    car = args?['car'];
    reviewService = Get.find<ReviewService>();
    favService = Get.isRegistered<FavoriteService>() ? Get.find<FavoriteService>() : null;
  isFav = (favService?.all.any((e) => e.targetType == 'car' && e.targetId == car.id) ?? false).obs;
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${car.brand} ${car.model}'),
        actions: [
          Obx(() => IconButton(
            icon: Icon(isFav.value ? Icons.favorite : Icons.favorite_border, color: isFav.value ? Colors.redAccent : Colors.white),
            onPressed: () async {
              if (car.id != null) {
                final meta = favService?.buildMetaForEntity(type: 'car', model: car);
                await favService?.toggle(type:'car', targetId: car.id!, meta: meta);
                isFav.value = !isFav.value;
              }
            },
          )),
        ],
      ),
      body: _bodyContent(),
    );
  }

  Widget _bodyContent({ScrollController? controller}) {
    return ListView(
      controller: controller,
      padding: EdgeInsets.all(16.w),
      children: [
        _imageSlider(car.images),
        SizedBox(height: 16.h),
        Text('${car.brand} ${car.model}', style: TextStyle(fontSize: 22.sp, fontWeight: FontWeight.bold)),
        SizedBox(height: 8.h),
        Text('Şirket: ${car.company}', style: TextStyle(fontSize: 14.sp, color: Colors.grey[700])),
        SizedBox(height: 8.h),
        Text('Tür: ${car.type}  ·  Vites: ${car.transmission}  ·  Yakıt: ${car.fuelType}', style: TextStyle(fontSize: 13.sp)),
        SizedBox(height: 12.h),
        Row(children:[
          Icon(Icons.star, color: Colors.orange, size: 18.sp),
          SizedBox(width:4.w),
          Text('${car.rating} (${car.reviewCount} yorum)', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
        ]),
        SizedBox(height: 18.h),
        _priceBox(car),
        SizedBox(height: 24.h),
        _contactRow(car),
        SizedBox(height: 24.h),
        Row(
          children: [
            Text('Yorumlar', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w600)),
            const Spacer(),
            TextButton.icon(
              onPressed: () => _openReviewDialog(car, reviewService),
              icon: const Icon(Icons.rate_review),
              label: const Text('Yorum Yaz'),
            ),
          ],
        ),
        StreamBuilder<List<Map<String,dynamic>>>(
          // Show only published (approved) reviews publicly
          stream: reviewService.reviewsFor('car', car.id ?? '', onlyPublished: true),
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            final data = snap.data ?? [];
            if (data.isEmpty) {
              return Padding(
                padding: EdgeInsets.symmetric(vertical: 12.h),
                child: Text('Henüz yayınlanmış yorum yok', style: TextStyle(color: Colors.grey[600], fontSize: 13.sp)),
              );
            }
            return Column(
              children: data.map((r) => _reviewTile(r)).toList(),
            );
          },
        ),
        SizedBox(height: 32.h),
      ],
    );
  }

  Widget _imageSlider(List<String> images) => ImageSlider(images: images, margin: EdgeInsets.only(bottom: 12.h));

  Widget _priceBox(CarModel car) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Günlük Fiyat', style: TextStyle(fontSize: 12.sp, color: Colors.blue[700])),
                SizedBox(height: 4.h),
                Text('${car.dailyPrice.toStringAsFixed(0)} TL', style: TextStyle(fontSize: 22.sp, fontWeight: FontWeight.bold, color: Colors.blue[900])),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => _openReservationSheet(car),
            style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 14.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30.r))),
            child: Text('REZERVE ET', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _contactRow(CarModel car) => ContactButtons(phone: car.phone, sms: car.phone, whatsapp: car.phone);

  // Removed legacy circle buttons (using standardized ContactButtons now)

  Widget _reviewTile(Map<String,dynamic> r) {
    final rating = (r['rating'] ?? 0).toDouble();
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.person, size: 16.sp, color: Colors.grey[600]),
              SizedBox(width: 6.w),
              Expanded(child: Text(r['userId'] ?? 'Kullanıcı', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600))),
              _ratingStars(rating),
            ],
          ),
          SizedBox(height: 6.h),
          Text(r['comment'] ?? '', style: TextStyle(fontSize: 12.sp, color: Colors.grey[800])),
        ],
      ),
    );
  }

  Widget _ratingStars(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) => Icon(
        i < rating.floor() ? Icons.star : (i < rating ? Icons.star_half : Icons.star_border),
        size: 14.sp,
        color: Colors.orange,
      )),
    );
  }

  void _openReviewDialog(CarModel car, ReviewService service) {
    if (car.id == null) return;
    showUnifiedReviewDialog(
      type: 'car',
      id: car.id!,
      onSubmit: (r, c) async {
        try { await service.addReview(type: 'car', targetId: car.id!, rating: r, comment: c); Get.snackbar('Başarılı', 'Yorum kaydedildi'); } catch (e){ Get.snackbar('Hata', 'Kaydedilemedi: $e'); }
      },
    );
  }

  void _openReservationSheet(CarModel car){
    final reservationService = Get.find<ReservationService>();
    final start = DateTime.now().add(const Duration(days:1));
    final end = start.add(const Duration(days:1));
    ReservationBottomSheet.show(ReservationBottomSheet(
      title: '${car.brand} ${car.model}',
      subtitle: car.addressModel.address,
      price: car.discountedDailyPrice ?? car.dailyPrice,
      priceLabel: 'Günlük',
      bodyBuilder: (context, c){
        return Column(children:[
          DateRangeField(
            startKey: 'pickupDate',
            endKey: 'dropoffDate',
            label: 'Alış / Bırakış Tarihi',
            initialStart: start,
            initialEnd: end,
          ),
          CounterField(keyName: 'passengers', label: 'Yolcu', min: 1, max: car.seats, initial: 1),
          const DropdownField(keyName: 'pickupSlot', label: 'Alış Saati', options: ['08:00','10:00','12:00','14:00','16:00'], initial: '10:00'),
          const DropdownField(keyName: 'dropoffSlot', label: 'Bırakış Saati', options: ['08:00','10:00','12:00','14:00','16:00'], initial: '10:00'),
        ]);
      },
      onSubmit: (controller) async {
        final pickup = controller.val<DateTime>('pickupDate') ?? start;
        final drop = controller.val<DateTime>('dropoffDate') ?? end;
        final pax = controller.val<int>('passengers') ?? 1;
        final builder = ReservationBuilder(
          type: ReservationType.car,
          userId: Get.find<AuthService>().user.value.id ?? '',
          itemId: car.id ?? '',
          title: '${car.brand} ${car.model}',
          subtitle: car.addressModel.address,
            imageUrl: (car.images.isNotEmpty ? car.images.first : ''),
          startDate: pickup,
          endDate: drop,
          quantity: drop.difference(pickup).inDays == 0 ? 1 : drop.difference(pickup).inDays,
          people: pax,
          price: car.discountedDailyPrice ?? car.dailyPrice,
          userPhone: controller.phoneCtrl.text,
          userEmail: controller.emailCtrl.text,
          notes: controller.noteCtrl.text,
        )..addMeta({
          'dailyPrice': car.dailyPrice,
          if (car.discountedDailyPrice!=null) 'discountedDailyPrice': car.discountedDailyPrice,
          'company': car.company,
          'pickupSlot': controller.val<String>('pickupSlot'),
          'dropoffSlot': controller.val<String>('dropoffSlot'),
          'passengers': pax,
        });
        try {
          await reservationService.create(builder.build());
        } catch (e) {
          rethrow;
        }
        return 'ok';
      },
    ));
  }
}

class _CarDetailBottomSheet extends StatefulWidget {
  final CarModel car;
  final ReviewService reviewService;
  final FavoriteService? favService;
  const _CarDetailBottomSheet({required this.car, required this.reviewService, this.favService});

  @override
  State<_CarDetailBottomSheet> createState() => _CarDetailBottomSheetState();
}

class _CarDetailBottomSheetState extends State<_CarDetailBottomSheet> {
  late final PageController _pageController;
  // Removed _current (unused with standardized ImageSlider)
  late RxBool isFav;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  isFav = (widget.favService?.all.any((e) => e.targetType == 'car' && e.targetId == widget.car.id) ?? false).obs;
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final car = widget.car;
    return DraggableScrollableSheet(
      initialChildSize: DetailSheetConfig.initialChildSize,
      maxChildSize: DetailSheetConfig.maxChildSize,
      minChildSize: DetailSheetConfig.minChildSize,
      expand: false,
      builder: (context, scrollController) => SafeArea(
          bottom: false,
        top: false,
        child: Stack(children:[
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: DetailSheetConfig.radius),
            child: CustomScrollView(
              controller: scrollController,
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(20.w,12.h,20.w,24.h),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
                      const DragHandle(),
                      if (car.images.isNotEmpty) ImageSlider(images: car.images),
                      SizedBox(height:12.h),
                      Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
                        Expanded(child: Text('${car.brand} ${car.model}', style: TextStyle(fontSize:20.sp, fontWeight: FontWeight.w800))),
                        Obx(()=> FavoriteButton(initial: isFav.value, onChanged: (v) async { if (car.id!=null){ final meta = widget.favService?.buildMetaForEntity(type:'car', model: car); await widget.favService?.toggle(type:'car', targetId: car.id!, meta: meta); isFav.value = v; } })),
                      ]),
                      SizedBox(height:8.h),
                      Wrap(spacing:6.w, runSpacing:6.h, children:[
                        _specChip(car.type), _specChip(car.transmission), _specChip(car.fuelType), _specChip('${car.seats} koltuk')
                      ]),
                      SizedBox(height:16.h),
                      _priceBox(car),
                      SizedBox(height:16.h),
                      _addressBox(car),
                      SizedBox(height:24.h),
                      Text('İletişim', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700)),
                      SizedBox(height:8.h),
                      _contactRow(car),
                      SizedBox(height:24.h),
                      Text('Yorumlar', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700)),
                      SizedBox(height:8.h),
                      StreamBuilder<List<Map<String,dynamic>>>(
                        // Explicitly restrict to published reviews
                        stream: widget.reviewService.reviewsFor('car', car.id ?? '', onlyPublished: true),
                        builder: (context, snap){
                          if (snap.connectionState == ConnectionState.waiting) return const Center(child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator()));
                          final data = snap.data ?? [];
                          if (data.isEmpty){ return Column(crossAxisAlignment: CrossAxisAlignment.start, children:[ Text('Henüz yorum yok', style: TextStyle(fontSize:12.sp, color: Colors.blueGrey[600])), SizedBox(height:8.h), OutlinedButton.icon(onPressed: ()=> _openReviewDialog(car, widget.reviewService), icon: const Icon(Icons.add_comment_outlined), label: const Text('Yorum Yaz')), ]); }
                          return Column(children:[ ...data.map(_reviewTile), SizedBox(height:8.h), OutlinedButton.icon(onPressed: ()=> _openReviewDialog(car, widget.reviewService), icon: const Icon(Icons.add_comment_outlined), label: const Text('Yorum Yaz')), ]);
                        },
                      ),
                      SizedBox(height:120.h),
                    ]),
                  ),
                )
              ],
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: ReserveButtonBar(
              onPressed: widget.car.id == null ? null : () => _openReservationSheet(widget.car),
            ),
          ),
        ]),
      ),
    );
  }

  // Standardized slider replaced by ImageSlider directly

  Widget _priceBox(CarModel car) {
    final hasDiscount = (car.discountedDailyPrice != null && car.discountedDailyPrice! < car.dailyPrice);
    final price = car.discountedDailyPrice ?? car.dailyPrice;
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(color: Colors.blueGrey[50], borderRadius: BorderRadius.circular(20.r)),
      child: Row(children:[
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          Text('Günlük Fiyat', style: TextStyle(fontSize:12.sp, fontWeight: FontWeight.w600, color: Colors.blueGrey[600])),
          SizedBox(height:4.h),
          Row(children:[
            Text('${price.toStringAsFixed(0)} TL', style: TextStyle(fontSize:22.sp, fontWeight: FontWeight.w800, color: Colors.blueGrey[900])),
            if (hasDiscount) ...[
              SizedBox(width:8.w),
              Text('${car.dailyPrice.toStringAsFixed(0)} TL', style: TextStyle(fontSize:11.sp, color: Colors.grey, decoration: TextDecoration.lineThrough)),
            ]
          ])
        ])),
        Icon(Icons.local_offer, color: Colors.blueGrey[400], size:22.sp)
      ]),
    );
  }
  Widget _addressBox(CarModel car) => Container(
    padding: EdgeInsets.all(12.w),
    decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(20.r), border: Border.all(color: Colors.grey[200]!)),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Icon(Icons.place, size:18.sp, color: Colors.blueGrey[400]),
      SizedBox(width:8.w),
      Expanded(child: Text(car.addressModel.address, style: TextStyle(fontSize:12.sp, height:1.4, color: Colors.blueGrey[700]))),
    ]),
  );
  Widget _specChip(String text) => Container(padding: EdgeInsets.symmetric(horizontal:10.w, vertical:6.h), decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(14.r)), child: Text(text, style: TextStyle(fontSize:11.sp, fontWeight: FontWeight.w600, color: Colors.blueGrey[800])));
  Widget _contactRow(CarModel car) => _CarDetailPageState()._contactRow(car);
  Widget _reviewTile(Map<String,dynamic> r) => _CarDetailPageState()._reviewTile(r);
  void _openReviewDialog(CarModel car, ReviewService s) => _CarDetailPageState()._openReviewDialog(car, s);
  
  void _openReservationSheet(CarModel car){
    final reservationService = Get.find<ReservationService>();
    final start = DateTime.now().add(const Duration(days:1));
    final end = start.add(const Duration(days:1));
    ReservationBottomSheet.show(ReservationBottomSheet(
      title: '${car.brand} ${car.model}',
      subtitle: car.addressModel.address,
      price: car.discountedDailyPrice ?? car.dailyPrice,
      priceLabel: 'Günlük',
      bodyBuilder: (context, c){
        return Column(children:[
          DateRangeField(
            startKey: 'pickupDate',
            endKey: 'dropoffDate',
            label: 'Alış / Bırakış Tarihi',
            initialStart: start,
            initialEnd: end,
          ),
          CounterField(keyName: 'passengers', label: 'Yolcu', min: 1, max: car.seats, initial: 1),
          const DropdownField(keyName: 'pickupSlot', label: 'Alış Saati', options: ['08:00','10:00','12:00','14:00','16:00'], initial: '10:00'),
          const DropdownField(keyName: 'dropoffSlot', label: 'Bırakış Saati', options: ['08:00','10:00','12:00','14:00','16:00'], initial: '10:00'),
        ]);
      },
      onSubmit: (controller) async {
        final pickup = controller.val<DateTime>('pickupDate') ?? start;
        final drop = controller.val<DateTime>('dropoffDate') ?? end;
        final pax = controller.val<int>('passengers') ?? 1;
        final builder = ReservationBuilder(
          type: ReservationType.car,
          userId: Get.find<AuthService>().user.value.id ?? '',
          itemId: car.id ?? '',
          title: '${car.brand} ${car.model}',
          subtitle: car.addressModel.address,
          imageUrl: (car.images.isNotEmpty ? car.images.first : ''),
          startDate: pickup,
          endDate: drop,
          quantity: drop.difference(pickup).inDays == 0 ? 1 : drop.difference(pickup).inDays,
          people: pax,
          price: car.discountedDailyPrice ?? car.dailyPrice,
          userPhone: controller.phoneCtrl.text,
          userEmail: controller.emailCtrl.text,
          notes: controller.noteCtrl.text,
        )..addMeta({
          'dailyPrice': car.dailyPrice,
          if (car.discountedDailyPrice!=null) 'discountedDailyPrice': car.discountedDailyPrice,
          'company': car.company,
          'pickupSlot': controller.val<String>('pickupSlot'),
          'dropoffSlot': controller.val<String>('dropoffSlot'),
          'passengers': pax,
        });
        await reservationService.create(builder.build());
        return 'ok';
      },
    ));
  }
}
