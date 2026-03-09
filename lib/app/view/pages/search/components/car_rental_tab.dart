import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../controllers/address/address_controller.dart';
import '../../../../controllers/search/car_search_controller.dart';
import '../../../../data/models/address/address_model.dart';
import '../../../../data/models/car/car_model.dart';
import '../../../../data/models/promotion/promotion_model.dart';
import '../../../../data/providers/transport/uber_remote_config.dart';
import '../../../../data/services/transport/uber_service.dart';
import '../../../../routes/routes.dart';
import '../../../themes/theme.dart';
import '../../../widgets/destination_field.dart';
import '../../../widgets/modern_date_picker.dart';
import '../../../widgets/search_action_button.dart';
import '../search_styles.dart';
import 'promotion_banner.dart';

class CarRentalTab extends StatefulWidget {
  const CarRentalTab({super.key});

  @override
  State<CarRentalTab> createState() => _CarRentalTabState();
}

class _CarRentalTabState extends State<CarRentalTab> {
  late final CarSearchController controller;
  late final UberService uberService;
  final String uberDestinationTag = 'taxi_uber_destination';
  UberProductEstimate? uberEstimate;
  bool uberLoading = false;
  bool uberConnected = false;

  @override
  void initState() {
    super.initState();
    controller = Get.put(CarSearchController());
    uberService = UberService();
    if (!Get.isRegistered<AddressController>(tag: uberDestinationTag)) {
      Get.put(AddressController(), tag: uberDestinationTag);
    }
    _bootstrapTaxiLocations();
    _loadUberAuthStatus();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.medinaGreen40,
            isDark ? Colors.black : Colors.white,
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SingleChildScrollView(
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.all(16.w),
        child: Column(
          children: [
            // Form Card: type, locations, dates, times, passengers, search
            Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(14.w, 12.h, 14.w, 12.h),
              decoration: SearchStyles.card(
                radius: BorderRadius.circular(14.r),
                isDark: isDark,
              ),
              child: Column(
                children: [
                  Obx(
                    () => Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildTripTypeButton(
                          'Günlük Taxi',
                          !controller.isMonthly.value,
                          () => controller.toggleMonthly(false),
                          isDark,
                        ),
                        SizedBox(width: 16.w),
                        _buildTripTypeButton(
                          'Aylık Taxi',
                          controller.isMonthly.value,
                          () => controller.toggleMonthly(true),
                          isDark,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 12.h),
                  // Modern Destination Field for pickup location
                  DestinationField(
                    tag: controller.addressTag,
                    label: 'Taxi Alış Noktası',
                    placeholder: 'Şehir veya Havalimanı seçin',
                    onChanged: (addr) {
                      controller.addressController.setAddress(addr);
                      if (addr.location != null) {
                        controller.addressController.setLatLng(addr.location!);
                      }
                      setState(() {});
                    },
                  ),
                  SizedBox(height: 10.h),
                  DestinationField(
                    tag: uberDestinationTag,
                    label: 'Uber Varış Noktası',
                    placeholder: 'Varış noktası seçin',
                    onChanged: (_) => setState(() {}),
                  ),
                  SizedBox(height: 10.h),
                  // Checkbox
                  Obx(
                    () => Row(
                      children: [
                        Checkbox(
                          value: controller.differentReturnLocation.value,
                          onChanged: (v) =>
                              controller.differentReturnLocation.value =
                                  v ?? false,
                          activeColor: Theme.of(context).primaryColor,
                        ),
                        Expanded(
                          child: Text(
                            'Araç farklı bir yerde teslim edilecek',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: isDark
                                  ? Colors.grey.shade400
                                  : Colors.grey[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 10.h),
                  // Dates
                  Obx(
                    () => Row(
                      children: [
                        Expanded(
                          child: _buildDateTimeField(
                            'Alış Tarihi',
                            controller.pickupDate.value ?? DateTime.now(),
                            isPickup: true,
                            isDark: isDark,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: _buildDateTimeField(
                            'Teslim Tarihi',
                            controller.dropoffDate.value ??
                                DateTime.now().add(const Duration(days: 1)),
                            isPickup: false,
                            isDark: isDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 10.h),
                  Obx(
                    () => Row(
                      children: [
                        Expanded(
                          child: _buildTimeSlotField(
                            'Alış Saati',
                            controller.pickupTimeSlot.value,
                            true,
                            isDark,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: _buildTimeSlotField(
                            'Teslim Saati',
                            controller.dropoffTimeSlot.value,
                            false,
                            isDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 12.h),
                  // Driver/group size field
                  Obx(
                    () => Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16.w),
                      decoration: BoxDecoration(
                        color: isDark
                            ? theme.colorScheme.surfaceContainerHighest
                            : Colors.white,
                        borderRadius: BorderRadius.circular(12.r),
                        border: Border.all(
                          color: isDark
                              ? theme.colorScheme.outline
                              : Colors.grey[300]!,
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(
                            'Kişi sayısı: ',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: isDark
                                  ? Colors.grey.shade400
                                  : Colors.grey[700],
                            ),
                          ),
                          const Spacer(),
                          IconButton(
                            onPressed: controller.decrementPassengers,
                            icon: const Icon(Icons.remove_circle_outline),
                          ),
                          Text(
                            '${controller.passengers.value}',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          IconButton(
                            onPressed: controller.incrementPassengers,
                            icon: const Icon(Icons.add_circle_outline),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 16.h),
                  // Search button
                  Obx(() {
                    // Reaktif değerleri oku (GetX dependency tracking için)
                    final _ = controller.addressController.address.value;
                    return SearchActionButton(
                      label: 'UYGUN TAXI BUL',
                      enabled: controller.canSearch,
                      loading: controller.isSearching.value,
                      onPressed: () async {
                        await controller.search();
                        if (controller.errorMessage.isEmpty) {
                          final pickupAddress =
                              controller.addressController.currentAddress;
                          final destinationController =
                              Get.find<AddressController>(
                                tag: uberDestinationTag,
                              );
                          final dropoffAddress =
                              destinationController.currentAddress;

                          Get.toNamed(
                            Routes.CAR_RENTAL,
                            arguments: {
                              'pickupDate': controller.pickupDate.value
                                  ?.toIso8601String()
                                  .split('T')
                                  .first,
                              'dropoffDate': controller.dropoffDate.value
                                  ?.toIso8601String()
                                  .split('T')
                                  .first,
                              'passengers': controller.passengers.value,
                              'pickupLat': pickupAddress.location?.latitude,
                              'pickupLng': pickupAddress.location?.longitude,
                              'dropoffLat': dropoffAddress.location?.latitude,
                              'dropoffLng': dropoffAddress.location?.longitude,
                              'pickupName': pickupAddress.address.isNotEmpty
                                  ? pickupAddress.address
                                  : pickupAddress.city,
                              'dropoffName': dropoffAddress.address.isNotEmpty
                                  ? dropoffAddress.address
                                  : dropoffAddress.city,
                            },
                          );
                        } else {
                          Get.snackbar(
                            'Arama Hatası',
                            controller.errorMessage.value,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                        }
                      },
                    );
                  }),
                ],
              ),
            ),
            SizedBox(height: 16.h),
            _uberSection(isDark),
            SizedBox(height: 10.h),
            _popularCarsSection(isDark),
            SizedBox(height: 10.h),
            // Dynamic Promotion banner
            const PromotionBanner(targetType: PromotionTargetType.car),
            SizedBox(height: 8.h),
            // Info section
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.blue.shade900.withOpacity(0.3)
                    : Colors.blue[50],
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(
                  color: isDark ? Colors.blue.shade700 : Colors.blue[200]!,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: isDark ? Colors.blue.shade300 : Colors.blue[700],
                        size: 20.sp,
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: Text(
                          'Taxi Bilgileri',
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? Colors.blue.shade300
                                : Colors.blue[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 10.h),
                  Text(
                    '• Kutsal topraklarda güvenli taxi deneyimi\n'
                    '• 7/24 acil durum destek hizmeti\n'
                    '• Kutsal mekan rotalarına özel navigasyon\n'
                    '• Temiz ve konforlu araç filosu',
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: isDark ? Colors.blue.shade400 : Colors.blue[600],
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _uberSection(bool isDark) {
    if (!UberRemoteConfig.uberEnabled) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);
    final destinationController = Get.find<AddressController>(
      tag: uberDestinationTag,
    );
    final hasPickup = controller.addressController.currentAddress.hasCoordinates;
    final hasDropoff = destinationController.currentAddress.hasCoordinates;

    String durationText() {
      final seconds = uberEstimate?.durationSeconds;
      if (seconds == null) return '-';
      final mins = (seconds / 60).round();
      return '$mins dk';
    }

    String priceText() {
      if (uberEstimate == null) return '-';
      return uberEstimate!.displayPrice;
    }

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(14.w),
      decoration: SearchStyles.card(
        radius: BorderRadius.circular(14.r),
        isDark: isDark,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Uber ile Yolculuk',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 6.h),
          Text(
            'Süre ve ücret bilgisini hızlıca görüp Uber üzerinden çağırabilirsiniz.',
            style: TextStyle(
              fontSize: 12.sp,
              color: isDark ? Colors.grey.shade400 : Colors.grey[700],
            ),
          ),
          SizedBox(height: 10.h),
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
            decoration: BoxDecoration(
              color: isDark
                  ? theme.colorScheme.surfaceContainerHighest
                  : Colors.grey[100],
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Row(
              children: [
                Icon(
                  uberConnected ? Icons.verified_user : Icons.link_off,
                  size: 16.sp,
                  color: uberConnected
                      ? (isDark ? Colors.green.shade400 : Colors.green[700])
                      : (isDark ? Colors.orange.shade300 : Colors.orange[700]),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: Text(
                    uberConnected
                        ? 'Uber hesabı bağlı'
                        : 'Uber hesabı bağlı değil',
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                if (!uberConnected)
                  TextButton(
                    onPressed: uberLoading ? null : _connectUber,
                    child: const Text('Bağlan'),
                  ),
              ],
            ),
          ),
          SizedBox(height: 10.h),
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: isDark
                  ? theme.colorScheme.surfaceContainerHighest
                  : Colors.white,
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(
                color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tahmini Süre',
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 2.h),
                      Text(
                        durationText(),
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 34.h, color: Colors.grey.withValues(alpha: .35)),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tahmini Ücret',
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 2.h),
                      Text(
                        priceText(),
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 10.h),
          Row(
            children: [
              Expanded(
                child: TextButton.icon(
                  onPressed: (!hasPickup || !hasDropoff || uberLoading)
                      ? null
                      : _fetchUberEstimate,
                  style: TextButton.styleFrom(
                    elevation: 0,
                    shadowColor: Colors.transparent,
                    backgroundColor: isDark
                        ? theme.colorScheme.surfaceContainerHighest
                        : Colors.grey[100],
                    padding: EdgeInsets.symmetric(vertical: 12.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                  ),
                  icon: uberLoading
                      ? SizedBox(
                          width: 14.w,
                          height: 14.w,
                          child: const CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.calculate_outlined),
                  label: const Text('Ücret & Süre'),
                ),
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: TextButton.icon(
                  onPressed: (!hasPickup || !hasDropoff || uberLoading)
                      ? null
                      : _requestUberRide,
                  style: TextButton.styleFrom(
                    elevation: 0,
                    shadowColor: Colors.transparent,
                    backgroundColor: isDark
                        ? theme.colorScheme.surfaceContainerHighest
                        : Colors.grey[100],
                    padding: EdgeInsets.symmetric(vertical: 12.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                  ),
                  icon: const Icon(Icons.local_taxi),
                  label: Text(uberConnected ? 'Uber Çağır' : 'Uber Bağla'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _fetchUberEstimate() async {
    final destinationController = Get.find<AddressController>(
      tag: uberDestinationTag,
    );

    final pickup = controller.addressController.currentAddress.location;
    final dropoff = destinationController.currentAddress.location;
    if (pickup == null || dropoff == null) return;

    setState(() => uberLoading = true);
    try {
      final result = await uberService.estimateRide(
        pickup: pickup,
        dropoff: dropoff,
      );
      if (!mounted) return;
      setState(() {
        uberEstimate = result;
      });
      if (result == null) {
        Get.snackbar('Uber', 'Tahmin bilgisi alınamadı');
      }
    } finally {
      if (mounted) setState(() => uberLoading = false);
    }
  }

  Future<void> _requestUberRide() async {
    final destinationController = Get.find<AddressController>(
      tag: uberDestinationTag,
    );

    final pickupAddress = controller.addressController.currentAddress;
    final dropoffAddress = destinationController.currentAddress;
    final pickup = pickupAddress.location;
    final dropoff = dropoffAddress.location;
    if (pickup == null || dropoff == null) return;

    if (!uberConnected) {
      await _connectUber();
      return;
    }

    if (uberEstimate == null) {
      await _fetchUberEstimate();
    }

    if (uberEstimate == null ||
        uberEstimate!.productId.isEmpty ||
        (uberEstimate!.fareId ?? '').isEmpty) {
      Get.snackbar(
        'Uber',
        'Canlı çağrı için fare bilgisi gerekli. Lütfen tekrar tahmin alınız.',
      );
      return;
    }

    setState(() => uberLoading = true);
    try {
      final ride = await uberService.requestRide(
        pickup: pickup,
        dropoff: dropoff,
        pickupName: pickupAddress.address.isNotEmpty
            ? pickupAddress.address
            : pickupAddress.city,
        dropoffName: dropoffAddress.address.isNotEmpty
            ? dropoffAddress.address
            : dropoffAddress.city,
        productId: uberEstimate!.productId,
        fareId: uberEstimate!.fareId!,
      );

      if (ride == null) {
        Get.snackbar('Uber', 'Araç çağrısı oluşturulamadı');
        return;
      }

      Get.snackbar(
        'Uber',
        'Araç talebi gönderildi (Durum: ${ride.status})',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      if (mounted) setState(() => uberLoading = false);
    }
  }

  Future<void> _connectUber() async {
    if (!UberRemoteConfig.oauthConnectEnabled) {
      Get.snackbar('Uber', 'Uber bağlantısı geçici olarak devre dışı');
      return;
    }

    setState(() => uberLoading = true);
    try {
      final url = await uberService.getConnectUrl();
      if (url == null || url.isEmpty) {
        Get.snackbar('Uber', 'Bağlantı URL alınamadı');
        return;
      }
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } finally {
      if (mounted) setState(() => uberLoading = false);
    }
  }

  Future<void> _loadUberAuthStatus() async {
    try {
      final status = await uberService.authStatus();
      if (!mounted) return;
      setState(() => uberConnected = status.connected);
    } catch (_) {
      if (!mounted) return;
      setState(() => uberConnected = false);
    }
  }

  Future<void> _bootstrapTaxiLocations() async {
    final destinationController = Get.find<AddressController>(
      tag: uberDestinationTag,
    );
    final fallbackCities = UberRemoteConfig.fallbackCities;
    final fallbackPickup = fallbackCities.first;
    final fallbackDropoff = fallbackCities.length > 1
        ? fallbackCities[1]
        : fallbackCities.first;

    if (!controller.addressController.currentAddress.hasCoordinates) {
      try {
        final permission = await Geolocator.checkPermission();
        final effectivePermission = permission == LocationPermission.denied
            ? await Geolocator.requestPermission()
            : permission;
        if (effectivePermission == LocationPermission.always ||
            effectivePermission == LocationPermission.whileInUse) {
          final pos = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.high,
            ),
          );
          controller.addressController.setAddress(
            AddressModel(
              location: LatLng(pos.latitude, pos.longitude),
              country: 'Suudi Arabistan',
              countryCode: 'SA',
              city: fallbackPickup.city,
              state: fallbackPickup.name,
            ),
          );
          await controller.addressController.updateAddressFromLocation();
        } else {
          controller.addressController.setAddress(
            AddressModel(
              location: fallbackPickup.location,
              country: 'Suudi Arabistan',
              countryCode: 'SA',
              city: fallbackPickup.city,
              state: fallbackPickup.name,
              address: fallbackPickup.name,
            ),
          );
        }
      } catch (_) {
        controller.addressController.setAddress(
          AddressModel(
            location: fallbackPickup.location,
            country: 'Suudi Arabistan',
            countryCode: 'SA',
            city: fallbackPickup.city,
            state: fallbackPickup.name,
            address: fallbackPickup.name,
          ),
        );
      }
    }

    if (!destinationController.currentAddress.hasCoordinates) {
      destinationController.setAddress(
        AddressModel(
          location: fallbackDropoff.location,
          country: 'Suudi Arabistan',
          countryCode: 'SA',
          city: fallbackDropoff.city,
          state: fallbackDropoff.name,
          address: fallbackDropoff.name,
        ),
      );
    }

    if (mounted) setState(() {});
  }

  Widget _popularCarsSection(bool isDark) {
    final theme = Theme.of(context);
    return Obx(() {
      final list = controller.popularCars;
      if (list.isEmpty) return const SizedBox();
      return Container(
        width: double.infinity,
        padding: EdgeInsets.all(16.w),
        decoration: SearchStyles.card(
          radius: BorderRadius.circular(18.r),
          isDark: isDark,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Popüler Taxi Seçenekleri',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                if (list.length > 5)
                  TextButton(
                    onPressed: () {
                      /* opsiyonel: tümüne git */
                    },
                    child: const Text('Tümü'),
                  ),
              ],
            ),
            SizedBox(height: 8.h),
            Column(
              children: list
                  .take(5)
                  .map((c) => _popularCarItem(c, isDark))
                  .toList(),
            ),
          ],
        ),
      );
    });
  }

  Widget _popularCarItem(CarModel c, bool isDark) {
    final theme = Theme.of(context);
    return Container(
      margin: EdgeInsets.only(bottom: 10.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: isDark
            ? theme.colorScheme.surfaceContainerHighest
            : Colors.white,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(
          color: isDark ? theme.colorScheme.outline : Colors.grey[200]!,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.directions_car,
            color: isDark ? Colors.green.shade400 : Get.theme.primaryColor,
            size: 20.sp,
          ),
          SizedBox(width: 10.w),
          Expanded(
            child: Text(
              '${c.brand} ${c.model}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
          Icon(Icons.star, size: 14.sp, color: Colors.amber),
          SizedBox(width: 4.w),
          Text(
            c.rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: 11.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeSlotField(
    String label,
    String value,
    bool isPickup,
    bool isDark,
  ) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: () async {
        final selected = await showModalBottomSheet<String>(
          context: context,
          backgroundColor: isDark
              ? theme.colorScheme.surfaceContainerHigh
              : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
          ),
          builder: (_) {
            final slots = CarDailyAvailability.standardSlots();
            return SafeArea(
              bottom: false,
              child: Column(
                children: [
                  SizedBox(height: 8.h),
                  Container(
                    width: 40.w,
                    height: 4.h,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[600] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(2.r),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(16.w),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            label,
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: Icon(
                            Icons.close,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Divider(
                    height: 1,
                    color: isDark ? theme.colorScheme.outline : null,
                  ),
                  Expanded(
                    child: ListView.builder(
                      itemCount: slots.length,
                      itemBuilder: (_, i) {
                        final s = slots[i];
                        final selected = s == value;
                        return ListTile(
                          title: Text(
                            s,
                            style: TextStyle(
                              fontWeight: selected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          trailing: selected
                              ? Icon(
                                  Icons.check,
                                  color: isDark
                                      ? Colors.green.shade400
                                      : Get.theme.primaryColor,
                                )
                              : null,
                          onTap: () => Navigator.pop(context, s),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
        if (selected != null) {
          setState(() {
            if (isPickup) {
              controller.pickupTimeSlot.value = selected;
            } else {
              controller.dropoffTimeSlot.value = selected;
            }
          });
        }
      },
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: isDark
              ? theme.colorScheme.surfaceContainerHighest
              : Colors.white,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12.sp,
                color: isDark ? Colors.grey.shade400 : Colors.grey[600],
              ),
            ),
            SizedBox(height: 8.h),
            Row(
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const Spacer(),
                Icon(
                  Icons.access_time,
                  color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTripTypeButton(
    String title,
    bool isSelected,
    VoidCallback onTap,
    bool isDark,
  ) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 20.w,
            height: 20.h,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isSelected ? Colors.green : Colors.transparent,
              border: Border.all(
                color: isSelected
                    ? Colors.green
                    : (isDark ? Colors.grey.shade600 : Colors.grey),
                width: 2,
              ),
            ),
            child: isSelected
                ? Icon(Icons.check, size: 14.sp, color: Colors.white)
                : null,
          ),
          SizedBox(width: 8.w),
          Text(
            title,
            style: TextStyle(
              fontSize: 14.sp,
              color: theme.colorScheme.onSurface,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateTimeField(
    String label,
    DateTime date, {
    required bool isPickup,
    required bool isDark,
  }) {
    final theme = Theme.of(context);
    return Builder(
      builder: (context) => GestureDetector(
        onTap: () async {
          final DateTime? picked = await ModernDatePicker.showSingle(
            context: context,
            initialDate: date,
            firstDate: DateTime.now(),
            lastDate: DateTime.now().add(const Duration(days: 365)),
            label: isPickup ? 'Alış Tarihi' : 'İade Tarihi',
          );
          if (picked != null) {
            setState(() {
              if (isPickup) {
                controller.setPickupDate(picked);
              } else {
                controller.setDropoffDate(picked);
              }
            });
          }
        },
        child: Container(
          padding: EdgeInsets.all(14.w),
          decoration: BoxDecoration(
            color: isDark
                ? theme.colorScheme.surfaceContainerHighest
                : Colors.white,
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(
              color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.calendar_month,
                    size: 14.sp,
                    color: isDark ? Colors.green.shade400 : AppColors.primary,
                  ),
                  SizedBox(width: 4.w),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 11.sp,
                      color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 6.h),
              Text(
                '${date.day} ${_monthYear(date).split(',').first}',
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              Text(
                _monthYear(date).split(', ').last,
                style: TextStyle(
                  fontSize: 11.sp,
                  color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _monthYear(DateTime d) {
    const months = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ];
    final weekday = [
      'Pazartesi',
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi',
      'Pazar',
    ][d.weekday - 1];
    return '${months[d.month - 1]}, $weekday';
  }
}
