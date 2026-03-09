import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../controllers/booking/webbeds_booking_controller.dart';
import '../../../data/models/payment/kuveytturk_models.dart';
import '../../../data/models/webbeds/webbeds_models.dart';
import '../../../data/services/currency/currency_service.dart';
import '../../../data/services/webbeds/webbeds_service.dart';
import '../../widgets/payment/card_input_bottom_sheet.dart';
import '../payment/kuveytturk_payment_page.dart';

/// WebBeds Otel Rezervasyon Sayfası
///
/// 4 adımlı wizard: Oda Seçimi → Yolcu Bilgileri → Özet → Onay
class WebBedsBookingPage extends StatelessWidget {
  const WebBedsBookingPage({super.key});

  @override
  Widget build(BuildContext context) {
    final hotel = Get.arguments as WebBedsHotel;

    // Controller'ı başlat
    final controller = Get.put(WebBedsBookingController());

    // Otel odalarını yükle
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.loadHotelRooms(hotel);
    });

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Obx(() => Text(controller.stepTitle)),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            controller.reset();
            Navigator.of(context).pop();
          },
        ),
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.currentStep.value == 0) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.error.value != null &&
            controller.currentStep.value == 0) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64.sp, color: Colors.red[300]),
                SizedBox(height: 16.h),
                Text(controller.error.value!, textAlign: TextAlign.center),
                SizedBox(height: 16.h),
                ElevatedButton(
                  onPressed: () => controller.loadHotelRooms(hotel),
                  child: const Text('Tekrar Dene'),
                ),
              ],
            ),
          );
        }

        return Column(
          children: [
            // Progress indicator
            _buildProgressIndicator(controller),

            // Content
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _buildStepContent(controller, hotel),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildProgressIndicator(WebBedsBookingController controller) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      color: Colors.white,
      child: Row(
        children: List.generate(7, (index) {
          // 0, 2, 4, 6 = daireler (step 1,2,3,4)
          // 1, 3, 5 = çizgiler
          if (index.isOdd) {
            // Çizgi
            final stepBefore = index ~/ 2;
            return Expanded(
              child: Container(
                height: 2.h,
                color: controller.currentStep.value > stepBefore
                    ? Colors.teal
                    : Colors.grey[300],
              ),
            );
          } else {
            // Daire
            final step = index ~/ 2;
            final isActive = controller.currentStep.value >= step;
            final isCompleted = controller.currentStep.value > step;
            return Container(
              width: 32.w,
              height: 32.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isActive ? Colors.teal : Colors.grey[300],
              ),
              child: Center(
                child: isCompleted
                    ? Icon(Icons.check, size: 16.sp, color: Colors.white)
                    : Text(
                        '${step + 1}',
                        style: TextStyle(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.bold,
                          color: isActive ? Colors.white : Colors.grey[600],
                        ),
                      ),
              ),
            );
          }
        }),
      ),
    );
  }

  Widget _buildStepContent(
    WebBedsBookingController controller,
    WebBedsHotel hotel,
  ) {
    switch (controller.currentStep.value) {
      case 0:
        return _RoomSelectionStep(
          controller: controller,
          hotel: hotel,
          key: const ValueKey(0),
        );
      case 1:
        return _PassengerInfoStep(
          controller: controller,
          key: const ValueKey(1),
        );
      case 2:
        return _SummaryStep(
          controller: controller,
          hotel: hotel,
          key: const ValueKey(2),
        );
      case 3:
        return _ConfirmationStep(
          controller: controller,
          hotel: hotel,
          key: const ValueKey(3),
        );
      default:
        return const SizedBox();
    }
  }
}

// ============================================================
// STEP 0: ODA SEÇİMİ
// ============================================================

class _RoomSelectionStep extends StatelessWidget {
  final WebBedsBookingController controller;
  final WebBedsHotel hotel;

  const _RoomSelectionStep({
    super.key,
    required this.controller,
    required this.hotel,
  });

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final response = controller.roomsResponse.value;
      if (response == null || response.roomTypes.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.hotel_outlined, size: 64.sp, color: Colors.grey[400]),
              SizedBox(height: 16.h),
              Text(
                'Oda bilgisi bulunamadı',
                style: TextStyle(fontSize: 14.sp, color: Colors.grey[600]),
              ),
            ],
          ),
        );
      }

      final webBedsService = Get.find<WebBedsService>();
      final checkIn = webBedsService.lastCheckIn;
      final checkOut = webBedsService.lastCheckOut;
      final nights = webBedsService.nights;

      return Column(
        children: [
          // Otel & tarih bilgisi
          Container(
            margin: EdgeInsets.all(16.w),
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16.r),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hotel.name,
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8.h),
                Row(
                  children: [
                    Icon(Icons.star, size: 16.sp, color: Colors.amber),
                    SizedBox(width: 4.w),
                    Text(
                      '${hotel.starRating.toStringAsFixed(1)} Yıldız',
                      style: TextStyle(fontSize: 12.sp),
                    ),
                    SizedBox(width: 16.w),
                    Icon(
                      Icons.location_on,
                      size: 16.sp,
                      color: Colors.grey[600],
                    ),
                    SizedBox(width: 4.w),
                    Expanded(
                      child: Text(
                        hotel.cityName,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: Colors.grey[600],
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                Divider(height: 24.h),
                Row(
                  children: [
                    _dateInfo('Giriş', checkIn),
                    SizedBox(width: 16.w),
                    Icon(Icons.arrow_forward, size: 16.sp, color: Colors.grey),
                    SizedBox(width: 16.w),
                    _dateInfo('Çıkış', checkOut),
                    const Spacer(),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 12.w,
                        vertical: 6.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.teal.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Text(
                        '$nights Gece',
                        style: TextStyle(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Tariff notes
          if (response.tariffNotes != null && response.tariffNotes!.isNotEmpty)
            Container(
              margin: EdgeInsets.symmetric(horizontal: 16.w),
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: Colors.amber[200]!),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 18.sp,
                    color: Colors.amber[800],
                  ),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: Text(
                      response.tariffNotes!,
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: Colors.amber[900],
                      ),
                    ),
                  ),
                ],
              ),
            ),

          SizedBox(height: 8.h),

          // Oda listesi
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.only(
                left: 16.w,
                right: 16.w,
                bottom: MediaQuery.of(context).viewPadding.bottom + 16.h,
              ),
              itemCount: response.roomTypes.length,
              itemBuilder: (context, index) {
                final roomType = response.roomTypes[index];
                return _RoomTypeCard(
                  roomType: roomType,
                  onSelectRate: (rate) => _selectRoom(roomType, rate),
                );
              },
            ),
          ),
        ],
      );
    });
  }

  Widget _dateInfo(String label, DateTime? date) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 10.sp, color: Colors.grey[600]),
        ),
        Text(
          date != null ? DateFormat('dd MMM', 'tr').format(date) : '-',
          style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  void _selectRoom(WebBedsRoomType roomType, WebBedsRate rate) async {
    final success = await controller.selectRoomAndRate(roomType, rate);
    if (!success && controller.error.value != null) {
      Get.snackbar(
        'Hata',
        controller.error.value!,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red[100],
      );
    }
  }
}

/// Oda tipi kartı
class _RoomTypeCard extends StatelessWidget {
  final WebBedsRoomType roomType;
  final Function(WebBedsRate) onSelectRate;

  const _RoomTypeCard({required this.roomType, required this.onSelectRate});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Oda başlığı
          Container(
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.vertical(top: Radius.circular(16.r)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _cleanRoomName(roomType.name),
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        'Maks. ${roomType.maxAdults} Yetişkin${roomType.maxChildren > 0 ? ' • ${roomType.maxChildren} Çocuk' : ''}',
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                if (roomType.leftToSell > 0 && roomType.leftToSell <= 5)
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 8.w,
                      vertical: 4.h,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Text(
                      'Son ${roomType.leftToSell} oda!',
                      style: TextStyle(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.red[700],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Rates
          ...roomType.rates.map(
            (rate) => _RateItem(rate: rate, onSelect: () => onSelectRate(rate)),
          ),
        ],
      ),
    );
  }

  /// Oda isminden fazla boşlukları temizle
  String _cleanRoomName(String name) {
    return name.replaceAll(RegExp(r'\s+'), ' ').trim();
  }
}

/// Rate satırı
class _RateItem extends StatelessWidget {
  final WebBedsRate rate;
  final VoidCallback onSelect;

  const _RateItem({required this.rate, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final hasMSP =
        rate.minimumSellingPrice != null && rate.minimumSellingPrice! > 0;

    return InkWell(
      onTap: onSelect,
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Colors.grey[200]!)),
        ),
        child: Row(
          children: [
            // Rate bilgisi
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8.w,
                          vertical: 4.h,
                        ),
                        decoration: BoxDecoration(
                          color: _getRateBasisColor(rate.name),
                          borderRadius: BorderRadius.circular(6.r),
                        ),
                        child: Text(
                          rate.rateBasisName,
                          style: TextStyle(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      SizedBox(width: 8.w),
                      if (rate.nonRefundable)
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 6.w,
                            vertical: 2.h,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(4.r),
                          ),
                          child: Text(
                            'İade Edilemez',
                            style: TextStyle(
                              fontSize: 9.sp,
                              color: Colors.red[700],
                            ),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 6.h),
                  if (rate.specials.isNotEmpty)
                    Text(
                      rate.specials.first,
                      style: TextStyle(
                        fontSize: 10.sp,
                        color: Colors.green[700],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  if (rate.cancellationPolicy?.hasFreeCancellation ?? false)
                    Text(
                      'Ücretsiz İptal',
                      style: TextStyle(
                        fontSize: 10.sp,
                        color: Colors.green[700],
                      ),
                    ),
                  // MSP Uyarısı (B2C satış için)
                  if (hasMSP)
                    Padding(
                      padding: EdgeInsets.only(top: 4.h),
                      child: Text(
                        'Min. Satış: \$${rate.minimumSellingPrice!.toStringAsFixed(0)}',
                        style: TextStyle(
                          fontSize: 9.sp,
                          color: Colors.orange[700],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Fiyat - USD ve TL olarak göster
            _buildPriceColumn(rate.price),
            SizedBox(width: 8.w),
            Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceColumn(double usdPrice) {
    final currencyService = Get.find<CurrencyService>();
    final tryPrice = currencyService.toTRY(usdPrice);
    final tryFormatted = NumberFormat(
      '#,###',
      'tr_TR',
    ).format(tryPrice.round());

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          '\$${usdPrice.toStringAsFixed(0)}',
          style: TextStyle(
            fontSize: 16.sp,
            fontWeight: FontWeight.bold,
            color: Colors.teal[700],
          ),
        ),
        Text(
          '₺$tryFormatted',
          style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]),
        ),
      ],
    );
  }

  Color _getRateBasisColor(String basis) {
    switch (basis.toUpperCase()) {
      case 'RO':
      case 'ROOM ONLY':
        return Colors.grey;
      case 'BB':
      case 'BED AND BREAKFAST':
        return Colors.blue;
      case 'HB':
      case 'HALF BOARD':
        return Colors.orange;
      case 'FB':
      case 'FULL BOARD':
        return Colors.green;
      case 'AI':
      case 'ALL INCLUSIVE':
        return Colors.purple;
      default:
        return Colors.teal;
    }
  }
}

// ============================================================
// STEP 1: YOLCU BİLGİLERİ
// ============================================================

class _PassengerInfoStep extends StatelessWidget {
  final WebBedsBookingController controller;

  const _PassengerInfoStep({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Obx(
            () => ListView.builder(
              padding: EdgeInsets.only(
                left: 16.w,
                right: 16.w,
                top: 16.h,
                bottom: 16.h,
              ),
              itemCount: controller.passengers.length,
              itemBuilder: (context, index) {
                final passenger = controller.passengers[index];
                return _PassengerForm(
                  index: index,
                  data: passenger,
                  onChanged: (data) => controller.updatePassenger(index, data),
                );
              },
            ),
          ),
        ),

        // İleri butonu
        Container(
          padding: EdgeInsets.all(16.w),
          color: Colors.white,
          child: SafeArea(
            top: false,
            child: SizedBox(
              width: double.infinity,
              child: Obx(
                () => ElevatedButton(
                  onPressed: controller.isPassengerInfoComplete
                      ? () => controller.validateAndProceedToSummary()
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey[300],
                    disabledForegroundColor: Colors.grey[500],
                    padding: EdgeInsets.symmetric(vertical: 16.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                  ),
                  child: Text(
                    'Devam Et',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Yolcu formu
class _PassengerForm extends StatelessWidget {
  final int index;
  final PassengerFormData data;
  final Function(PassengerFormData) onChanged;

  const _PassengerForm({
    required this.index,
    required this.data,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                data.isChild ? 'Çocuk ${index + 1}' : 'Yolcu ${index + 1}',
                style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
              ),
              if (data.isLeading) ...[
                SizedBox(width: 8.w),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                  decoration: BoxDecoration(
                    color: Colors.teal[50],
                    borderRadius: BorderRadius.circular(4.r),
                  ),
                  child: Text(
                    'Ana Yolcu',
                    style: TextStyle(fontSize: 10.sp, color: Colors.teal[700]),
                  ),
                ),
              ],
              if (data.isChild) ...[
                SizedBox(width: 8.w),
                Text(
                  '(${data.childAge} yaş)',
                  style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]),
                ),
              ],
            ],
          ),
          SizedBox(height: 16.h),

          if (!data.isChild) ...[
            // Cinsiyet
            DropdownButtonFormField<String>(
              initialValue: data.salutation,
              decoration: InputDecoration(
                labelText: 'Cinsiyet',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16.w,
                  vertical: 12.h,
                ),
              ),
              items: SalutationOptions.options
                  .where((o) => o['code'] != 'CHD' && o['code'] != 'INF')
                  .map((o) {
                    return DropdownMenuItem(
                      value: o['code'],
                      child: Text(o['label']!),
                    );
                  })
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  onChanged(data.copyWith(salutation: value));
                }
              },
            ),
            SizedBox(height: 12.h),

            // Ad
            TextFormField(
              initialValue: data.firstName,
              decoration: InputDecoration(
                labelText: 'Ad',
                hintText: 'Pasaporttaki ad',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16.w,
                  vertical: 12.h,
                ),
              ),
              textCapitalization: TextCapitalization.words,
              onChanged: (value) => onChanged(data.copyWith(firstName: value)),
            ),
            SizedBox(height: 12.h),

            // Soyad
            TextFormField(
              initialValue: data.lastName,
              decoration: InputDecoration(
                labelText: 'Soyad',
                hintText: 'Pasaporttaki soyad',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16.w,
                  vertical: 12.h,
                ),
              ),
              textCapitalization: TextCapitalization.words,
              onChanged: (value) => onChanged(data.copyWith(lastName: value)),
            ),
            SizedBox(height: 12.h),

            // TC / Pasaport No
            TextFormField(
              initialValue: data.identityNumber,
              decoration: InputDecoration(
                labelText: 'TC Kimlik No / Pasaport No',
                hintText: 'Kimlik veya pasaport numaranız',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16.w,
                  vertical: 12.h,
                ),
                prefixIcon: Icon(Icons.badge_outlined, size: 20.sp),
              ),
              keyboardType: TextInputType.text,
              onChanged: (value) =>
                  onChanged(data.copyWith(identityNumber: value)),
            ),

            // Ana yolcu için iletişim bilgileri
            if (data.isLeading) ...[
              SizedBox(height: 16.h),
              Container(
                padding: EdgeInsets.all(12.w),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      size: 16.sp,
                      color: Colors.blue[700],
                    ),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        'Rezervasyon onayı bu bilgilere gönderilecektir',
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: Colors.blue[700],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 12.h),

              // Telefon
              TextFormField(
                initialValue: data.phone,
                decoration: InputDecoration(
                  labelText: 'Telefon',
                  hintText: '+90 5XX XXX XX XX',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 12.h,
                  ),
                  prefixIcon: Icon(Icons.phone_outlined, size: 20.sp),
                ),
                keyboardType: TextInputType.phone,
                onChanged: (value) => onChanged(data.copyWith(phone: value)),
              ),
              SizedBox(height: 12.h),

              // E-posta
              TextFormField(
                initialValue: data.email,
                decoration: InputDecoration(
                  labelText: 'E-posta',
                  hintText: 'ornek@email.com',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 12.h,
                  ),
                  prefixIcon: Icon(Icons.email_outlined, size: 20.sp),
                ),
                keyboardType: TextInputType.emailAddress,
                onChanged: (value) => onChanged(data.copyWith(email: value)),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

// ============================================================
// STEP 2: ÖZET
// ============================================================

class _SummaryStep extends StatelessWidget {
  final WebBedsBookingController controller;
  final WebBedsHotel hotel;

  const _SummaryStep({
    super.key,
    required this.controller,
    required this.hotel,
  });

  @override
  Widget build(BuildContext context) {
    final rate = controller.selectedRate.value;
    final roomType = controller.selectedRoomType.value;

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Otel bilgisi
                _summaryCard(
                  title: 'Otel',
                  children: [
                    _summaryRow('Otel Adı', hotel.name),
                    _summaryRow(
                      'Şehir',
                      '${hotel.cityName}, ${hotel.countryName}',
                    ),
                    _summaryRow(
                      'Giriş',
                      controller.checkIn != null
                          ? DateFormat(
                              'dd MMM yyyy',
                              'tr',
                            ).format(controller.checkIn!)
                          : '-',
                    ),
                    _summaryRow(
                      'Çıkış',
                      controller.checkOut != null
                          ? DateFormat(
                              'dd MMM yyyy',
                              'tr',
                            ).format(controller.checkOut!)
                          : '-',
                    ),
                    _summaryRow('Gece', '${controller.nights}'),
                  ],
                ),

                SizedBox(height: 12.h),

                // Oda bilgisi
                _summaryCard(
                  title: 'Oda',
                  children: [
                    _summaryRow('Oda Tipi', roomType?.name ?? '-'),
                    _summaryRow('Pansiyon', rate?.rateBasisName ?? '-'),
                    _summaryRow('Yetişkin', '${controller.adults}'),
                    if (controller.childrenAges.isNotEmpty)
                      _summaryRow('Çocuk', '${controller.childrenAges.length}'),
                    _summaryRow('Oda Sayısı', '${controller.rooms}'),
                  ],
                ),

                SizedBox(height: 12.h),

                // Yolcu bilgisi
                ...controller.passengers.where((p) => !p.isChild).map((p) {
                  return _passengerCard(p);
                }),

                SizedBox(height: 12.h),

                // Özel istekler
                _summaryCard(
                  title: 'Özel İstekler (Opsiyonel)',
                  children: [
                    TextField(
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Özel isteklerinizi yazın...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                      onChanged: (value) {
                        controller.specialRequests.clear();
                        if (value.isNotEmpty) {
                          controller.addSpecialRequest(value);
                        }
                      },
                    ),
                  ],
                ),

                SizedBox(height: 12.h),

                // Fiyat özeti
                _buildPriceSummaryCard(controller),

                // İptal politikası
                if (rate?.cancellationPolicy != null) ...[
                  SizedBox(height: 12.h),
                  Container(
                    padding: EdgeInsets.all(12.w),
                    decoration: BoxDecoration(
                      color: rate!.nonRefundable
                          ? Colors.red[50]
                          : Colors.green[50],
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          rate.nonRefundable
                              ? Icons.warning_amber
                              : Icons.check_circle_outline,
                          color: rate.nonRefundable
                              ? Colors.red[700]
                              : Colors.green[700],
                          size: 20.sp,
                        ),
                        SizedBox(width: 8.w),
                        Expanded(
                          child: Text(
                            rate.nonRefundable
                                ? 'Bu oda iade edilemez.'
                                : 'Ücretsiz iptal imkanı mevcuttur.',
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: rate.nonRefundable
                                  ? Colors.red[700]
                                  : Colors.green[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),

        // Ödeme butonu
        Container(
          padding: EdgeInsets.all(16.w),
          color: Colors.white,
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                TextButton(
                  onPressed: () => controller.previousStep(),
                  child: const Text('Geri'),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Obx(
                    () => ElevatedButton.icon(
                      onPressed:
                          controller.isLoading.value ||
                              controller.isPaymentProcessing.value
                          ? null
                          : () => _startPayment(context),
                      icon: controller.isPaymentProcessing.value
                          ? SizedBox(
                              width: 20.w,
                              height: 20.w,
                              child: const CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.payment, color: Colors.white),
                      label: Text(
                        controller.isPaymentProcessing.value
                            ? 'İşleniyor...'
                            : 'Ödeme Yap',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: Colors.grey[300],
                        disabledForegroundColor: Colors.grey[500],
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// KuveytTürk 3D Secure ödeme akışını başlat
  Future<void> _startPayment(BuildContext context) async {
    // Kart bilgisi bottom sheet'i göster
    final cardInfo = await CardInputBottomSheet.show(
      context: context,
      amount: controller.totalPrice,
      currency: controller.currency,
    );
    if (cardInfo == null) return; // Kullanıcı iptal etti

    // 3D ödeme başlat
    final htmlContent = await controller.initiatePayment(cardInfo: cardInfo);

    if (htmlContent == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(controller.error.value ?? 'Ödeme başlatılamadı'),
            backgroundColor: Colors.red[400],
          ),
        );
      }
      return;
    }

    // KuveytTürk 3D Secure sayfasına git
    final result = await Get.to<KuveytTurkPaymentResult>(
      () => KuveytTurkPaymentPage(
        htmlContent: htmlContent,
        orderId: controller.paymentOrderId.value!,
        amount: controller.totalPrice,
        currency: controller.currency,
      ),
    );

    // Ödeme sonucunu işle
    if (result != null) {
      await controller.handlePaymentResult(result);

      if (!result.isSuccess && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.errorMessage ?? 'Ödeme işlemi tamamlanamadı'),
            backgroundColor: Colors.red[400],
          ),
        );
      }
    } else {
      // Kullanıcı ödemeyi iptal etti
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Ödeme işlemi iptal edildi'),
            backgroundColor: Colors.orange[400],
          ),
        );
      }
    }
  }

  Widget _summaryCard({required String title, required List<Widget> children}) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 12.h),
          ...children,
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]),
          ),
          Text(
            value,
            style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _passengerCard(PassengerFormData p) {
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Başlık
          Row(
            children: [
              Icon(
                p.isLeading ? Icons.person : Icons.person_outline,
                size: 18.sp,
                color: p.isLeading ? Colors.teal : Colors.grey[600],
              ),
              SizedBox(width: 8.w),
              Text(
                p.isLeading ? 'Ana Yolcu' : 'Yolcu',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.bold,
                  color: p.isLeading ? Colors.teal : Colors.grey[800],
                ),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          // Ad Soyad
          _summaryRow('Ad Soyad', '${p.firstName} ${p.lastName}'),
          // Cinsiyet
          _summaryRow('Cinsiyet', SalutationOptions.getLabel(p.salutation)),
          // TC/Pasaport
          if (p.identityNumber.isNotEmpty)
            _summaryRow('TC/Pasaport No', p.identityNumber),
          // Ana yolcu için telefon ve e-posta
          if (p.isLeading) ...[
            if (p.phone.isNotEmpty) _summaryRow('Telefon', p.phone),
            if (p.email.isNotEmpty) _summaryRow('E-posta', p.email),
          ],
        ],
      ),
    );
  }

  Widget _buildPriceSummaryCard(WebBedsBookingController controller) {
    final currencyService = Get.find<CurrencyService>();
    final totalUSD = controller.totalPrice;
    final totalTRY = currencyService.toTRY(totalUSD);
    final perNightTRY = currencyService.toTRY(controller.pricePerNight);
    final perPersonTRY = currencyService.toTRY(controller.pricePerPerson);

    // TL formatı için
    final formatter = NumberFormat('#,###', 'tr_TR');

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.teal[50],
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: Colors.teal[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Toplam tutar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Toplam Tutar',
                style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${totalUSD.toStringAsFixed(0)}',
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal[700],
                    ),
                  ),
                  Text(
                    '₺${formatter.format(totalTRY.round())}',
                    style: TextStyle(fontSize: 14.sp, color: Colors.grey[700]),
                  ),
                ],
              ),
            ],
          ),
          Divider(height: 16.h),
          // Gecelik
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Gecelik',
                style: TextStyle(fontSize: 12.sp, color: Colors.grey[700]),
              ),
              Text(
                '\$${controller.pricePerNight.toStringAsFixed(0)} / ₺${formatter.format(perNightTRY.round())}',
                style: TextStyle(fontSize: 12.sp),
              ),
            ],
          ),
          SizedBox(height: 4.h),
          // Kişi başı
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Kişi Başı',
                style: TextStyle(fontSize: 12.sp, color: Colors.grey[700]),
              ),
              Text(
                '\$${controller.pricePerPerson.toStringAsFixed(0)} / ₺${formatter.format(perPersonTRY.round())}',
                style: TextStyle(fontSize: 12.sp),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ============================================================
// STEP 3: ONAY
// ============================================================

class _ConfirmationStep extends StatelessWidget {
  final WebBedsBookingController controller;
  final WebBedsHotel hotel;

  const _ConfirmationStep({
    super.key,
    required this.controller,
    required this.hotel,
  });

  @override
  Widget build(BuildContext context) {
    final booking = controller.bookingResult.value;

    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        children: [
          SizedBox(height: 32.h),

          // Başarı ikonu
          Container(
            width: 80.w,
            height: 80.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.green[100],
            ),
            child: Icon(Icons.check, size: 48.sp, color: Colors.green[700]),
          ),

          SizedBox(height: 24.h),

          Text(
            'Rezervasyonunuz Onaylandı!',
            style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold),
          ),

          SizedBox(height: 8.h),

          Text(
            'Rezervasyon detayları e-posta adresinize gönderilecektir.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14.sp, color: Colors.grey[600]),
          ),

          SizedBox(height: 32.h),

          // Rezervasyon bilgileri
          Container(
            padding: EdgeInsets.all(20.w),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16.r),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                _infoRow(
                  'Rezervasyon Kodu',
                  booking?.bookingCode ?? '-',
                  isHighlight: true,
                ),
                Divider(height: 24.h),
                _infoRow('Otel', hotel.name),
                _infoRow('Şehir', '${hotel.cityName}, ${hotel.countryName}'),
                _infoRow(
                  'Adres',
                  hotel.fullAddress.isNotEmpty
                      ? hotel.fullAddress
                      : hotel.address,
                ),
                if (hotel.phone.isNotEmpty) _infoRow('Telefon', hotel.phone),
                Divider(height: 16.h),
                _infoRow(
                  'Giriş',
                  controller.checkIn != null
                      ? DateFormat(
                          'dd MMM yyyy',
                          'tr',
                        ).format(controller.checkIn!)
                      : '-',
                ),
                _infoRow(
                  'Çıkış',
                  controller.checkOut != null
                      ? DateFormat(
                          'dd MMM yyyy',
                          'tr',
                        ).format(controller.checkOut!)
                      : '-',
                ),
                _infoRow('Gece Sayısı', '${controller.nights}'),
                _infoRow(
                  'Misafir',
                  '${controller.adults} Yetişkin${controller.childrenAges.isNotEmpty ? ', ${controller.childrenAges.length} Çocuk' : ''}',
                ),
                Divider(height: 16.h),
                _infoRow(
                  'Toplam Tutar',
                  _formatPriceWithTRY(booking?.totalPrice ?? 0),
                ),
                _infoRow('Durum', _statusText(booking?.bookingStatus)),
              ],
            ),
          ),

          SizedBox(height: 16.h),

          // Voucher Bilgisi (ZORUNLU - paymentGuaranteedBy)
          if (booking?.paymentGuaranteedBy != null &&
              booking!.paymentGuaranteedBy!.isNotEmpty)
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: Colors.amber[300]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.receipt_long,
                        color: Colors.amber[800],
                        size: 20.sp,
                      ),
                      SizedBox(width: 8.w),
                      Text(
                        'Voucher Bilgisi',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber[900],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12.h),
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(12.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Text(
                      booking.paymentGuaranteedBy!,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: Colors.grey[800],
                        height: 1.5,
                      ),
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    '⚠️ Bu bilgi otel girişinde gösterilmelidir.',
                    style: TextStyle(
                      fontSize: 11.sp,
                      color: Colors.amber[800],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),

          SizedBox(height: 16.h),

          // Önemli bilgiler
          Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: Colors.blue[700],
                      size: 18.sp,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      'Önemli Bilgiler',
                      style: TextStyle(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[700],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8.h),
                Text(
                  '• Rezervasyon kodunuzu saklayınız.\n'
                  '• Check-in saatinde kimlik/pasaport gereklidir.\n'
                  '• İptal politikasını kontrol ediniz.',
                  style: TextStyle(
                    fontSize: 11.sp,
                    color: Colors.blue[800],
                    height: 1.6,
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: 32.h),

          // Tamam butonu
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                controller.reset();
                Get.offAllNamed('/main');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 16.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
              child: Text(
                'Ana Sayfaya Dön',
                style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
              ),
            ),
          ),

          SizedBox(height: 12.h),

          // Rezervasyonlarım butonu
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                controller.reset();
                Get.offAllNamed('/profile', arguments: {'tab': 'reservations'});
              },
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
              child: Text(
                'Rezervasyonlarımı Gör',
                style: TextStyle(fontSize: 16.sp),
              ),
            ),
          ),

          // Alt navigasyon için boşluk
          SizedBox(height: 80.h),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isHighlight ? 16.sp : 12.sp,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
              color: isHighlight ? Colors.teal[700] : null,
            ),
          ),
        ],
      ),
    );
  }

  String _statusText(String? status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'ok':
        return 'Onaylandı';
      case 'pending':
      case 'on request':
        return 'Beklemede';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Beklemede';
    }
  }

  String _formatPriceWithTRY(double usdPrice) {
    final currencyService = Get.find<CurrencyService>();
    final tryPrice = currencyService.toTRY(usdPrice);
    return '\$${usdPrice.toStringAsFixed(2)} / ₺${tryPrice.toStringAsFixed(0)}';
  }
}
