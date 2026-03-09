import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';

// Removed unused AppColors import after refactor.

import '../../../data/models/car/car_model.dart';
import '../../../data/providers/transport/uber_remote_config.dart';
import '../../../data/repositories/car/car_repository.dart';
import '../../../data/services/currency/currency_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../../../data/services/transport/uber_service.dart';
// Removed legacy CarFilterSection; replaced by unified ListingFilterBar.
import '../../widgets/filters/filter_bar.dart';
import '../../widgets/filters/sort_sheet.dart';
import 'car_detail_page.dart';
import 'components/car_card.dart';

class CarRentalContent extends StatefulWidget {
  const CarRentalContent({super.key});

  @override
  State<CarRentalContent> createState() => _CarRentalContentState();
}

class _CarRentalContentState extends State<CarRentalContent> {
  final _repo = CarRepository();
  final _uberService = UberService();
  List<CarModel> _cars = const []; // visible (after filter+sort)
  List<CarModel> _allCars = const []; // raw available cars before filter
  List<UberProductEstimate> _uberOffers = const [];
  bool _loading = true;
  String _loadError = '';
  bool _uberLoading = false;
  String? _uberError;
  late final String pickupDate;
  late final String dropoffDate;
  late final int passengers;
  LatLng? _pickup;
  LatLng? _dropoff;
  String _pickupName = 'Pickup';
  String _dropoffName = 'Dropoff';
  FavoriteService? favService;

  // Sorting & filtering state
  _SortOption _sortOption = _SortOption.priceAsc;
  // Filters
  Set<String> _filterTypes = {};
  Set<String> _filterFuel = {};
  Set<String> _filterTransmission = {};
  Set<String> _filterCompanies = {};
  int? _minSeats; // minimum seats
  double? _minRating; // minimum rating
  bool _onlyDiscounted = false;
  RangeValues? _priceRange; // applied range
  RangeValues? _fullPriceRange; // original full span

  @override
  void initState() {
    super.initState();
    final args = Get.arguments as Map<String, dynamic>?;
    pickupDate =
        args?['pickupDate'] ??
        DateTime.now().toIso8601String().split('T').first;
    dropoffDate =
        args?['dropoffDate'] ??
        DateTime.now()
            .add(const Duration(days: 1))
            .toIso8601String()
            .split('T')
            .first;
    passengers = args?['passengers'] ?? 2;
    final pickupLat = (args?['pickupLat'] as num?)?.toDouble();
    final pickupLng = (args?['pickupLng'] as num?)?.toDouble();
    final dropoffLat = (args?['dropoffLat'] as num?)?.toDouble();
    final dropoffLng = (args?['dropoffLng'] as num?)?.toDouble();
    final pickupNameArg = args?['pickupName']?.toString() ?? '';
    final dropoffNameArg = args?['dropoffName']?.toString() ?? '';
    _pickupName = pickupNameArg.trim().isEmpty ? 'Pickup' : pickupNameArg;
    _dropoffName = dropoffNameArg.trim().isEmpty ? 'Dropoff' : dropoffNameArg;
    if (pickupLat != null && pickupLng != null) {
      _pickup = LatLng(pickupLat, pickupLng);
    }
    if (dropoffLat != null && dropoffLng != null) {
      _dropoff = LatLng(dropoffLat, dropoffLng);
    }
    favService = Get.isRegistered<FavoriteService>()
        ? Get.find<FavoriteService>()
        : null;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _loadError = '';
      final cars = await _repo.getAvailableCars(
        pickupDate: pickupDate,
        dropoffDate: dropoffDate,
        passengers: passengers,
      );
      _allCars = cars;
      _initializeRanges();
      _applySortAndFilter();

      if (UberRemoteConfig.uberEnabled &&
          UberRemoteConfig.hybridResultsEnabled &&
          _pickup != null &&
          _dropoff != null) {
        await _loadUberOffers();
      }
    } catch (e) {
      _loadError = e.toString();
      _allCars = const [];
      _cars = const [];
      _initializeRanges();
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _initializeRanges() {
    if (_allCars.isEmpty) {
      _fullPriceRange = null;
      _priceRange = null;
      return;
    }
    final prices = _allCars
        .map((c) => c.discountedDailyPrice ?? c.dailyPrice)
        .toList();
    final minP = prices.reduce((a, b) => a < b ? a : b);
    final maxP = prices.reduce((a, b) => a > b ? a : b);
    _fullPriceRange = RangeValues(minP, maxP);
    _priceRange ??= _fullPriceRange; // keep user selection if already set
  }

  void _applySortAndFilter() {
    List<CarModel> list = List.of(_allCars);
    // Filters
    list = list.where((c) {
      if (_filterTypes.isNotEmpty && !_filterTypes.contains(c.type))
        return false;
      if (_filterFuel.isNotEmpty && !_filterFuel.contains(c.fuelType))
        return false;
      if (_filterTransmission.isNotEmpty &&
          !_filterTransmission.contains(c.transmission))
        return false;
      if (_filterCompanies.isNotEmpty && !_filterCompanies.contains(c.company))
        return false;
      if (_minSeats != null && c.seats < _minSeats!) return false;
      if (_minRating != null && c.rating < _minRating!) return false;
      if (_onlyDiscounted && c.discountedDailyPrice == null) return false;
      if (_priceRange != null) {
        final price = c.discountedDailyPrice ?? c.dailyPrice;
        if (price < _priceRange!.start - 0.001 ||
            price > _priceRange!.end + 0.001)
          return false;
      }
      return true;
    }).toList();

    // Sorting
    list.sort((a, b) {
      switch (_sortOption) {
        case _SortOption.priceAsc:
          return (a.discountedDailyPrice ?? a.dailyPrice).compareTo(
            b.discountedDailyPrice ?? b.dailyPrice,
          );
        case _SortOption.priceDesc:
          return (b.discountedDailyPrice ?? b.dailyPrice).compareTo(
            a.discountedDailyPrice ?? a.dailyPrice,
          );
        case _SortOption.ratingDesc:
          final r = b.rating.compareTo(a.rating);
          if (r != 0) return r;
          return b.reviewCount.compareTo(a.reviewCount);
        case _SortOption.reviewCountDesc:
          final r2 = b.reviewCount.compareTo(a.reviewCount);
          if (r2 != 0) return r2;
          return b.rating.compareTo(a.rating);
        case _SortOption.newest:
          return b.createdAt.compareTo(a.createdAt);
      }
    });

    setState(() => _cars = list);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final headerBgColor = isDark
        ? theme.colorScheme.surfaceContainerHigh
        : Colors.grey[50];
    final secondaryTextColor = isDark ? Colors.grey[400] : Colors.grey[600];
    final primaryTextColor = isDark ? Colors.grey[300] : Colors.grey[800];

    final activeFilters = _activeFilterCount();
    return CustomScrollView(
      slivers: [
        // Header region (location + date + passenger info)
        SliverToBoxAdapter(
          child: Container(
            width: double.infinity,
            color: headerBgColor,
            padding: EdgeInsets.fromLTRB(
              16.w,
              16.h + MediaQuery.of(context).padding.top,
              16.w,
              16.h,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.location_on_outlined,
                      size: 16.sp,
                      color: secondaryTextColor,
                    ),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        'Seçilen bölge',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: primaryTextColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8.h),
                Row(
                  children: [
                    Icon(
                      Icons.access_time_outlined,
                      size: 16.sp,
                      color: secondaryTextColor,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      '$pickupDate - $dropoffDate · $passengers kişi',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: primaryTextColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        // Promo banners
        SliverToBoxAdapter(
          child: SizedBox(
            height: 100.h,
            child: ListView(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
              scrollDirection: Axis.horizontal,
              children: [
                _buildPromoBanner(
                  'SEFERNUR\'da',
                  '300 TL\'ye Varan',
                  'İndirim',
                  Colors.green,
                ),
                SizedBox(width: 12.w),
                _buildPromoBanner(
                  'GreenMotion\'da',
                  '%15 İndirim!',
                  '',
                  Colors.blue,
                ),
                SizedBox(width: 12.w),
                _buildPromoBanner(
                  'Qcar\'da',
                  'Özel Fırsatlar',
                  'Keşfet',
                  Colors.orange,
                ),
              ],
            ),
          ),
        ),
        if (UberRemoteConfig.uberEnabled && UberRemoteConfig.hybridResultsEnabled)
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16.w, 4.h, 16.w, 8.h),
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.all(14.w),
                decoration: BoxDecoration(
                  color: isDark
                      ? theme.colorScheme.surfaceContainerHigh
                      : Colors.white,
                  borderRadius: BorderRadius.circular(14.r),
                  border: Border.all(
                    color: isDark ? Colors.grey[700]! : Colors.grey[200]!,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.local_taxi_outlined,
                          size: 18.sp,
                          color: theme.colorScheme.primary,
                        ),
                        SizedBox(width: 8.w),
                        Expanded(
                          child: Text(
                            'Uber Canlı Teklifler',
                            style: TextStyle(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                        if (_uberLoading)
                          SizedBox(
                            width: 14.w,
                            height: 14.w,
                            child: const CircularProgressIndicator(
                              strokeWidth: 2,
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    if (_uberOffers.isEmpty)
                      Text(
                        _uberError == null
                            ? 'Canlı teklif bulunamadı'
                            : 'Canlı teklif alınamadı',
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: isDark ? Colors.grey[400] : Colors.grey[700],
                        ),
                      )
                    else
                      Column(
                        children: _uberOffers.take(4).map((offer) {
                          final etaText = offer.etaSeconds == null
                              ? '-'
                              : '${(offer.etaSeconds! / 60).round()} dk';
                          final subtitle =
                              '${offer.displayPrice} • ETA: $etaText';
                          return Container(
                            margin: EdgeInsets.only(bottom: 8.h),
                            padding: EdgeInsets.all(10.w),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? theme.colorScheme.surfaceContainerHighest
                                  : Colors.grey[50],
                              borderRadius: BorderRadius.circular(10.r),
                              border: Border.all(
                                color: isDark
                                    ? Colors.grey[700]!
                                    : Colors.grey[200]!,
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        offer.localizedDisplayName,
                                        style: TextStyle(
                                          fontSize: 12.sp,
                                          fontWeight: FontWeight.w700,
                                          color: theme.colorScheme.onSurface,
                                        ),
                                      ),
                                      SizedBox(height: 2.h),
                                      Text(
                                        subtitle,
                                        style: TextStyle(
                                          fontSize: 11.sp,
                                          color: isDark
                                              ? Colors.grey[400]
                                              : Colors.grey[700],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(width: 8.w),
                                ElevatedButton(
                                  onPressed: () =>
                                      _requestUberRideFromList(offer),
                                  style: ElevatedButton.styleFrom(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 12.w,
                                      vertical: 8.h,
                                    ),
                                  ),
                                  child: const Text('Çağır'),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                  ],
                ),
              ),
            ),
          ),
        // Pinned filter bar
        SliverPersistentHeader(
          pinned: true,
          delegate: _CarFilterHeaderDelegate(
            child: ListingFilterBar(
              onOpenSort: _onSortTap,
              onOpenFilters: _onFilterTap,
              activeFilterCount: activeFilters,
                resultCount: _loading
                  ? null
                  : _cars.length +
                    (UberRemoteConfig.uberEnabled &&
                        UberRemoteConfig.hybridResultsEnabled
                      ? _uberOffers.length
                      : 0),
              inlineResult: true,
              trailing: Builder(
                builder: (context) {
                  final theme = Theme.of(context);
                  final isDark = theme.brightness == Brightness.dark;
                  return IconButton(
                    tooltip: 'Favoriler',
                    onPressed: () => setState(
                      () {},
                    ), // placeholder; no favorites toggle for all cars currently
                    icon: Icon(
                      Icons.favorite_border,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  );
                },
              ),
            ),
          ),
        ),
        if (_loading)
          const SliverFillRemaining(
            child: Center(child: CircularProgressIndicator()),
          )
        else if (_cars.isEmpty)
          SliverFillRemaining(
            child: Builder(
              builder: (context) {
                final theme = Theme.of(context);
                final isDark = theme.brightness == Brightness.dark;
                final hasError = _loadError.trim().isNotEmpty;
                return Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24.w),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          hasError
                              ? 'Araçlar yüklenirken bir sorun oluştu'
                              : 'Uygun araç bulunamadı',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                        ),
                        if (hasError) ...[
                          SizedBox(height: 8.h),
                          Text(
                            _loadError,
                            textAlign: TextAlign.center,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: isDark
                                  ? Colors.red[300]
                                  : Colors.red[700],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          )
        else
          SliverList(
            delegate: SliverChildBuilderDelegate((context, index) {
              final c = _cars[index];
              final isFav =
                  favService?.all.any(
                    (e) => e.targetType == 'car' && e.targetId == c.id,
                  ) ??
                  false;
              final currencyService = Get.isRegistered<CurrencyService>()
                  ? Get.find<CurrencyService>()
                  : null;

              return Obx(() {
                final formattedDaily = currencyService != null
                    ? currencyService.formatBoth(c.dailyPrice)
                    : '${c.dailyPrice.toStringAsFixed(0)} TL';
                final formattedTotal = currencyService != null
                    ? currencyService.formatBoth(
                        c.dailyPrice,
                      ) // Assuming total is same for now or needs calc
                    : '${c.dailyPrice.toStringAsFixed(0)} TL';

                return Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 8.h,
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16.r),
                    clipBehavior: Clip.none,
                    child: CarCard(
                      brand: '${c.brand} ${c.model}',
                      type: c.type,
                      fuelType: c.fuelType,
                      transmission: c.transmission,
                      mileage: '-',
                      ageLimit: '21+',
                      deposit: '-',
                      location: c.locationName,
                      company: c.company,
                      rating: c.rating,
                      reviewCount: c.reviewCount,
                      dailyPrice: formattedDaily,
                      totalPrice: formattedTotal,
                      isFreeCancellation: true,
                      imagePath: c.images.isNotEmpty ? c.images.first : '',
                      onTap: () => _openDetails(c),
                      isFavorited: isFav,
                      onFavoriteToggle: () {
                        if (c.id == null) return;
                        final meta = favService?.buildMetaForEntity(
                          type: 'car',
                          model: c,
                        );
                        favService?.toggle(
                          type: 'car',
                          targetId: c.id!,
                          meta: meta,
                        );
                      },
                      onCall: () {},
                      onMessage: () {},
                      onWhatsApp: () {},
                    ),
                  ),
                );
              });
            }, childCount: _cars.length),
          ),
        SliverToBoxAdapter(child: SizedBox(height: 60.h)),
      ],
    );
  }

  int _activeFilterCount() {
    int count = 0;
    if (_filterTypes.isNotEmpty) count++;
    if (_filterFuel.isNotEmpty) count++;
    if (_filterTransmission.isNotEmpty) count++;
    if (_filterCompanies.isNotEmpty) count++;
    if (_minSeats != null) count++;
    if (_minRating != null) count++;
    if (_onlyDiscounted) count++;
    if (_priceRange != null &&
        _fullPriceRange != null &&
        (_priceRange!.start != _fullPriceRange!.start ||
            _priceRange!.end != _fullPriceRange!.end))
      count++;
    return count;
  }

  void _onSortTap() {
    showSortSheet<_SortOption>(
      selected: _sortOption,
      options: const [
        SortOption(_SortOption.priceAsc, 'Fiyat (Artan)'),
        SortOption(_SortOption.priceDesc, 'Fiyat (Azalan)'),
        SortOption(_SortOption.ratingDesc, 'Puan (Yüksek)'),
        SortOption(_SortOption.reviewCountDesc, 'Yorum Sayısı'),
        SortOption(_SortOption.newest, 'En Yeni'),
      ],
      onSelect: (v) {
        setState(() {
          _sortOption = v;
          _applySortAndFilter();
        });
      },
    );
  }

  void _onFilterTap() {
    final allTypes = _allCars.map((c) => c.type).toSet();
    final allFuel = _allCars.map((c) => c.fuelType).toSet();
    final allTrans = _allCars.map((c) => c.transmission).toSet();
    final allCompanies = _allCars
        .map((c) => c.company)
        .where((e) => e.trim().isNotEmpty)
        .toSet();
    RangeValues tempRange =
        _priceRange ?? _fullPriceRange ?? const RangeValues(0, 0);
    Set<String> tTypes = {..._filterTypes};
    Set<String> tFuel = {..._filterFuel};
    Set<String> tTrans = {..._filterTransmission};
    Set<String> tCompanies = {..._filterCompanies};
    int? tSeats = _minSeats;
    double? tRating = _minRating;
    bool tDiscounted = _onlyDiscounted;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? Theme.of(context).colorScheme.surfaceContainerHigh
          : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (context, setModal) {
          final theme = Theme.of(context);
          final isDark = theme.brightness == Brightness.dark;
          final handleColor = isDark ? Colors.grey[600] : Colors.grey[300];
          final priceTextColor = isDark ? Colors.grey[400] : Colors.grey[700];
          final dividerColor = isDark ? Colors.grey[800] : Colors.grey[200];

          return DraggableScrollableSheet(
            initialChildSize: 0.85,
            maxChildSize: 0.92,
            minChildSize: 0.5,
            expand: false,
            builder: (context, scrollCtrl) => Column(
              children: [
                // Header
                Padding(
                  padding: EdgeInsets.fromLTRB(16.w, 10.h, 16.w, 8.h),
                  child: Column(
                    children: [
                      Container(
                        width: 40.w,
                        height: 4.h,
                        decoration: BoxDecoration(
                          color: handleColor,
                          borderRadius: BorderRadius.circular(2.r),
                        ),
                      ),
                      SizedBox(height: 10.h),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Filtrele',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              setModal(() {
                                tTypes.clear();
                                tFuel.clear();
                                tTrans.clear();
                                tCompanies.clear();
                                tSeats = null;
                                tRating = null;
                                tDiscounted = false;
                                tempRange = _fullPriceRange ?? tempRange;
                              });
                            },
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.symmetric(horizontal: 8.w),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text('Sıfırla', style: TextStyle(fontSize: 13.sp)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Divider(height: 1, color: dividerColor),
                // Content
                Expanded(
                  child: ListView(
                    controller: scrollCtrl,
                    padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 8.h),
                    children: [
                      // Fiyat
                      _filterSectionTitle('Fiyat Aralığı', context),
                      if (_fullPriceRange != null) ...[
                        SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            trackHeight: 3,
                            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                            overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
                          ),
                          child: RangeSlider(
                            values: tempRange,
                            min: _fullPriceRange!.start,
                            max: _fullPriceRange!.end,
                            divisions: 20,
                            onChanged: (v) => setModal(() => tempRange = v),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.only(bottom: 4.h),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${tempRange.start.toStringAsFixed(0)} TL', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: priceTextColor)),
                              Text('${tempRange.end.toStringAsFixed(0)} TL', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: priceTextColor)),
                            ],
                          ),
                        ),
                      ] else
                        Padding(
                          padding: EdgeInsets.only(bottom: 8.h),
                          child: Text('Fiyat bilgisi yok', style: TextStyle(fontSize: 12.sp, color: theme.colorScheme.onSurface)),
                        ),
                      SizedBox(height: 8.h),
                      
                      // Araç Tipi
                      _filterSectionTitle('Araç Tipi', context),
                      _wrapChips(allTypes, tTypes, (v) {
                        setModal(() => tTypes.contains(v) ? tTypes.remove(v) : tTypes.add(v));
                      }, context),
                      SizedBox(height: 12.h),
                      
                      // Yakıt & Vites - yan yana
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _filterSectionTitle('Yakıt', context),
                                _wrapChips(allFuel, tFuel, (v) {
                                  setModal(() => tFuel.contains(v) ? tFuel.remove(v) : tFuel.add(v));
                                }, context),
                              ],
                            ),
                          ),
                          SizedBox(width: 16.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _filterSectionTitle('Vites', context),
                                _wrapChips(allTrans, tTrans, (v) {
                                  setModal(() => tTrans.contains(v) ? tTrans.remove(v) : tTrans.add(v));
                                }, context),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 12.h),
                      
                      // Firma
                      _filterSectionTitle('Firma', context),
                      _wrapChips(allCompanies, tCompanies, (v) {
                        setModal(() => tCompanies.contains(v) ? tCompanies.remove(v) : tCompanies.add(v));
                      }, context),
                      SizedBox(height: 12.h),
                      
                      // Min Koltuk & Min Puan - yan yana
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _filterSectionTitle('Min. Koltuk', context),
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 12.w),
                                  decoration: BoxDecoration(
                                    color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100],
                                    borderRadius: BorderRadius.circular(10.r),
                                    border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
                                  ),
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<int?>(
                                      value: tSeats,
                                      isExpanded: true,
                                      hint: Text('Seç', style: TextStyle(fontSize: 13.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
                                      items: [null, 4, 5, 6, 7, 8].map((e) => DropdownMenuItem(value: e, child: Text(e == null ? 'Hepsi' : '$e+', style: TextStyle(fontSize: 13.sp)))).toList(),
                                      onChanged: (v) => setModal(() => tSeats = v),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 16.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _filterSectionTitle('Min. Puan', context),
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 12.w),
                                  decoration: BoxDecoration(
                                    color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100],
                                    borderRadius: BorderRadius.circular(10.r),
                                    border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
                                  ),
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<double?>(
                                      value: tRating,
                                      isExpanded: true,
                                      hint: Text('Seç', style: TextStyle(fontSize: 13.sp, color: isDark ? Colors.grey[400] : Colors.grey[600])),
                                      items: [null, 3.0, 3.5, 4.0, 4.5].map((e) => DropdownMenuItem(value: e, child: Text(e == null ? 'Hepsi' : '$e+', style: TextStyle(fontSize: 13.sp)))).toList(),
                                      onChanged: (v) => setModal(() => tRating = v),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8.h),
                      
                      // İndirimli switch
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 4.h),
                        decoration: BoxDecoration(
                          color: isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[50],
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Sadece İndirimli', style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w500, color: theme.colorScheme.onSurface)),
                            Switch.adaptive(
                              value: tDiscounted,
                              onChanged: (v) => setModal(() => tDiscounted = v),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 16.h),
                    ],
                  ),
                ),
                // Footer buttons
                Container(
                  padding: EdgeInsets.fromLTRB(16.w, 10.h, 16.w, 10.h + MediaQuery.of(context).padding.bottom),
                  decoration: BoxDecoration(
                    color: isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white,
                    border: Border(top: BorderSide(color: dividerColor!)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            padding: EdgeInsets.symmetric(vertical: 12.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                            side: BorderSide(color: isDark ? Colors.grey[600]! : Colors.grey[400]!),
                          ),
                          child: Text('İptal', style: TextStyle(fontSize: 14.sp)),
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: () {
                            _filterTypes = tTypes;
                            _filterFuel = tFuel;
                            _filterTransmission = tTrans;
                            _filterCompanies = tCompanies;
                            _minSeats = tSeats;
                            _minRating = tRating;
                            _onlyDiscounted = tDiscounted;
                            _priceRange = tempRange;
                            _applySortAndFilter();
                            Navigator.pop(context);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.primaryColor,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 12.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                          ),
                          child: Text('Uygula', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _openDetails(CarModel car) {
    CarDetailPage.showAsBottomSheet(context, car);
  }

  Widget _buildPromoBanner(
    String title,
    String subtitle,
    String description,
    Color color,
  ) {
    return Container(
      width: 180.w,
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 12.sp,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 4.h),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 14.sp,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          if (description.isNotEmpty) ...[
            SizedBox(height: 2.h),
            Text(
              description,
              style: TextStyle(
                fontSize: 11.sp,
                color: color,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _loadUberOffers() async {
    if (_pickup == null || _dropoff == null) return;
    if (!UberRemoteConfig.livePriceEnabled) return;

    if (!mounted) return;
    setState(() {
      _uberLoading = true;
      _uberError = null;
    });

    try {
      final offers = await _uberService.estimateRides(
        pickup: _pickup!,
        dropoff: _dropoff!,
      );
      if (!mounted) return;
      setState(() {
        _uberOffers = offers;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _uberOffers = const [];
        _uberError = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _uberLoading = false;
        });
      }
    }
  }

  Future<void> _requestUberRideFromList(UberProductEstimate offer) async {
    if (_pickup == null || _dropoff == null) return;
    if ((offer.fareId ?? '').isEmpty) {
      Get.snackbar(
        'Uber',
        'Bu ürün için fare_id bulunamadı. Yeniden tahmin alınız.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    try {
      final ride = await _uberService.requestRide(
        pickup: _pickup!,
        dropoff: _dropoff!,
        pickupName: _pickupName,
        dropoffName: _dropoffName,
        productId: offer.productId,
        fareId: offer.fareId!,
      );
      if (ride == null) {
        Get.snackbar('Uber', 'Araç talebi oluşturulamadı');
        return;
      }
      Get.snackbar(
        'Uber',
        'Talep gönderildi: ${ride.status}',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar('Uber', 'Talep hatası: $e');
    }
  }
}

enum _SortOption { priceAsc, priceDesc, ratingDesc, reviewCountDesc, newest }

class _CarFilterHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  _CarFilterHeaderDelegate({required this.child});
  @override
  double get minExtent => 66.h;
  @override
  double get maxExtent => 66.h;
  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final theme = Theme.of(context);
    return Material(
      elevation: overlapsContent ? 2 : 0,
      color: theme.scaffoldBackgroundColor,
      child: child,
    );
  }

  @override
  bool shouldRebuild(covariant _CarFilterHeaderDelegate oldDelegate) => false;
}

Widget _filterSectionTitle(String text, BuildContext context) {
  final theme = Theme.of(context);
  return Padding(
    padding: EdgeInsets.only(bottom: 6.h),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 12.sp,
        fontWeight: FontWeight.w600,
        color: theme.colorScheme.onSurface,
      ),
    ),
  );
}

Widget _wrapChips(
  Set<String> source,
  Set<String> selected,
  void Function(String) onTap,
  BuildContext context,
) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;
  final unselectedBgColor = isDark
      ? theme.colorScheme.surfaceContainerHighest
      : Colors.grey[100];
  final unselectedBorderColor = isDark ? Colors.grey[700]! : Colors.grey[300]!;
  final unselectedTextColor = isDark ? Colors.grey[300] : Colors.grey[800];

  final sorted = source.toList()..sort();
  return Wrap(
    spacing: 6.w,
    runSpacing: 6.h,
    children: sorted.map((v) {
      final isSel = selected.contains(v);
      return GestureDetector(
        onTap: () => onTap(v),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
          decoration: BoxDecoration(
            color: isSel ? theme.primaryColor : unselectedBgColor,
            borderRadius: BorderRadius.circular(16.r),
            border: Border.all(
              color: isSel ? theme.primaryColor : unselectedBorderColor,
              width: isSel ? 1.5 : 1,
            ),
          ),
          child: Text(
            v,
            style: TextStyle(
              fontSize: 11.sp,
              color: isSel ? Colors.white : unselectedTextColor,
              fontWeight: isSel ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ),
      );
    }).toList(),
  );
}

// Removed _FixedHeaderDelegate after migrating to inline ListingFilterBar.
