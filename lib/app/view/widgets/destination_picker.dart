import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';

import '../../controllers/address/address_controller.dart';
import '../../controllers/search/popular_search_controller.dart';
import '../../data/models/address/address_model.dart';
import '../../data/models/search/popular_search_model.dart';
import '../themes/colors/app_colors.dart';

/// Modern destinasyon seçici bottom sheet.
/// Referans görseldeki gibi tasarlanmıştır.
class DestinationPicker {
  /// Destinasyon seçici bottom sheet'i gösterir.
  /// [tag] - AddressController için benzersiz tag
  /// [title] - Başlık (varsayılan: 'Destinasyon Seç')
  /// [onSelect] - Seçim yapıldığında çağrılır
  /// [selectedAddresses] - Çoklu seçim için mevcut seçimler
  /// [multiSelect] - Çoklu seçim aktif mi
  static Future<AddressModel?> show({
    required BuildContext context,
    required String tag,
    String? title,
    void Function(AddressModel)? onSelect,
    List<AddressModel>? selectedAddresses,
    bool multiSelect = false,
  }) async {
    return showModalBottomSheet<AddressModel>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _DestinationPickerSheet(
        tag: tag,
        title: title ?? 'Destinasyon Seç',
        onSelect: onSelect,
        selectedAddresses: selectedAddresses ?? [],
        multiSelect: multiSelect,
      ),
    );
  }
}

class _DestinationPickerSheet extends StatefulWidget {
  final String tag;
  final String title;
  final void Function(AddressModel)? onSelect;
  final List<AddressModel> selectedAddresses;
  final bool multiSelect;

  const _DestinationPickerSheet({
    required this.tag,
    required this.title,
    this.onSelect,
    required this.selectedAddresses,
    required this.multiSelect,
  });

  @override
  State<_DestinationPickerSheet> createState() =>
      _DestinationPickerSheetState();
}

class _DestinationPickerSheetState extends State<_DestinationPickerSheet> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  late AddressController _addressController;
  late PopularSearchController _popularSearchController;

  final List<_DestinationCategory> _categories = [
    _DestinationCategory(
      title: 'Kutsal Topraklar',
      icon: Icons.mosque,
      destinations: [
        _Destination(
          name: 'Mekke',
          subtitle: 'Suudi Arabistan',
          icon: Icons.location_city,
          address: AddressModel(
            address: 'Mekke',
            city: 'Mekke',
            country: 'Suudi Arabistan',
            location: const LatLng(21.4225, 39.8262),
            state: 'Mekke',
          ),
        ),
        _Destination(
          name: 'Medine',
          subtitle: 'Suudi Arabistan',
          icon: Icons.location_city,
          address: AddressModel(
            address: 'Medine',
            city: 'Medine',
            country: 'Suudi Arabistan',
            location: const LatLng(24.4539, 39.6142),
            state: 'Medine',
          ),
        ),
        _Destination(
          name: 'Cidde',
          subtitle: 'Suudi Arabistan',
          icon: Icons.location_city,
          address: AddressModel(
            address: 'Cidde',
            city: 'Cidde',
            country: 'Suudi Arabistan',
            location: const LatLng(21.5425, 39.1857),
            state: 'Mekke',
          ),
        ),
        _Destination(
          name: 'Taif',
          subtitle: 'Suudi Arabistan',
          icon: Icons.location_city,
          address: AddressModel(
            address: 'Taif',
            city: 'Taif',
            country: 'Suudi Arabistan',
            location: const LatLng(21.2703, 40.4158),
            state: 'Mekke',
          ),
        ),
      ],
    ),
    _DestinationCategory(
      title: 'Hac Mekanları',
      icon: Icons.place,
      destinations: [
        _Destination(
          name: 'Mina',
          subtitle: 'Mekke, Suudi Arabistan',
          icon: Icons.mosque,
          address: AddressModel(
            address: 'Mina',
            city: 'Mina',
            country: 'Suudi Arabistan',
            location: const LatLng(21.4133, 39.8933),
            state: 'Mekke',
          ),
        ),
        _Destination(
          name: 'Arafat',
          subtitle: 'Mekke, Suudi Arabistan',
          icon: Icons.mosque,
          address: AddressModel(
            address: 'Arafat Dağı',
            city: 'Arafat',
            country: 'Suudi Arabistan',
            location: const LatLng(21.3547, 39.9842),
            state: 'Mekke',
          ),
        ),
        _Destination(
          name: 'Müzdelife',
          subtitle: 'Mekke, Suudi Arabistan',
          icon: Icons.mosque,
          address: AddressModel(
            address: 'Müzdelife',
            city: 'Müzdelife',
            country: 'Suudi Arabistan',
            location: const LatLng(21.3925, 39.9333),
            state: 'Mekke',
          ),
        ),
      ],
    ),
  ];

  List<_Destination> _filteredDestinations = [];
  List<_SearchResult> _apiSearchResults = [];
  String _searchQuery = '';
  bool _isSearching = false;
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    _addressController = Get.isRegistered<AddressController>(tag: widget.tag)
        ? Get.find<AddressController>(tag: widget.tag)
        : Get.put(AddressController(), tag: widget.tag);
    _popularSearchController = Get.isRegistered<PopularSearchController>()
        ? Get.find<PopularSearchController>()
        : Get.put(PopularSearchController(), permanent: true);
    _updateFilteredList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _updateFilteredList() {
    if (_searchQuery.isEmpty) {
      _filteredDestinations = [];
      _apiSearchResults = [];
    } else {
      final query = _searchQuery.toLowerCase();
      // Sabit kategorilerde arama
      _filteredDestinations = _categories
          .expand((c) => c.destinations)
          .where(
            (d) =>
                d.name.toLowerCase().contains(query) ||
                d.subtitle.toLowerCase().contains(query),
          )
          .toList();
    }
  }

  /// Nominatim API ile dinamik konum araması
  Future<void> _searchLocationApi(String query) async {
    if (query.length < 2) {
      setState(() {
        _apiSearchResults = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);

    try {
      final dio = Dio();
      dio.options.headers = {
        'User-Agent': 'SefernurApp/1.0 (Flutter Mobile App)',
        'Accept': 'application/json',
        'Accept-Language': Get.locale?.languageCode ?? 'tr',
      };

      // Rate limiting için kısa bekleme
      await Future.delayed(const Duration(milliseconds: 200));

      final response = await dio.get(
        'https://nominatim.openstreetmap.org/search',
        queryParameters: {
          'format': 'json',
          'q': query,
          'limit': '8',
          'addressdetails': '1',
          'accept-language': Get.locale?.languageCode ?? 'tr',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final results = <_SearchResult>[];

        for (final item in data) {
          final lat = double.tryParse(item['lat']?.toString() ?? '');
          final lon = double.tryParse(item['lon']?.toString() ?? '');
          if (lat == null || lon == null) continue;

          final displayName = item['display_name'] ?? '';
          final addressData = item['address'] ?? {};
          final shortAddress = _createShortAddress(addressData);
          final type = item['type'] ?? '';

          results.add(
            _SearchResult(
              name: shortAddress.isNotEmpty
                  ? shortAddress.split(',').first
                  : displayName.split(',').first,
              subtitle: shortAddress,
              displayName: displayName,
              coordinates: LatLng(lat, lon),
              type: type,
              addressData: addressData,
            ),
          );
        }

        if (mounted) {
          setState(() {
            _apiSearchResults = results;
            _isSearching = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Konum arama hatası: $e');
      if (mounted) {
        setState(() => _isSearching = false);
      }
    }
  }

  String _createShortAddress(Map<String, dynamic> addressData) {
    final List<String> parts = [];
    final district =
        addressData['district'] ??
        addressData['town'] ??
        addressData['municipality'] ??
        addressData['suburb'] ??
        '';
    final city =
        addressData['state'] ??
        addressData['city'] ??
        addressData['province'] ??
        '';
    final country = addressData['country'] ?? '';

    if (district.toString().isNotEmpty) parts.add(district.toString());
    if (city.toString().isNotEmpty && city != district) {
      parts.add(city.toString());
    }
    if (country.toString().isNotEmpty) parts.add(country.toString());

    return parts.join(', ');
  }

  void _onSearchChanged(String value) {
    _searchQuery = value;
    _updateFilteredList();

    // Debounce API araması
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _searchLocationApi(value);
    });

    setState(() {});
  }

  bool _isSelected(_Destination dest) {
    if (widget.selectedAddresses.isEmpty) return false;
    return widget.selectedAddresses.any(
      (a) => a.city.toLowerCase() == dest.address.city.toLowerCase(),
    );
  }

  void _selectDestination(_Destination dest) {
    _addressController.setAddress(dest.address);
    if (dest.address.location != null) {
      _addressController.setLatLng(dest.address.location!);
    }

    if (widget.onSelect != null) {
      widget.onSelect!(dest.address);
    }

    if (!widget.multiSelect) {
      Navigator.of(context).pop(dest.address);
    }
  }

  void _openMapSelector() {
    Navigator.of(context).pop();
    Get.toNamed('/select-location', arguments: {'tag': widget.tag});
  }

  bool get _isHotelContext => widget.tag.contains('hotel');

  _Destination _popularToDestination(PopularSearchModel item) {
    final address = _popularSearchController.addressFromCity(item.city);
    return _Destination(
      name: item.title,
      subtitle: item.subtitle.isNotEmpty
          ? item.subtitle
          : (address.country.isNotEmpty
                ? '${address.city}, ${address.country}'
                : address.city),
      icon: Icons.local_fire_department,
      address: address,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgColor = isDark
        ? theme.colorScheme.surfaceContainerHigh
        : Colors.white;

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
          ),
          child: Column(
            children: [
              // Drag handle
              Container(
                margin: EdgeInsets.only(top: 12.h),
                width: 40.w,
                height: 4.h,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[600] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(2.r),
                ),
              ),

              // Header with close button
              Padding(
                padding: EdgeInsets.fromLTRB(16.w, 16.h, 8.w, 8.h),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(
                        Icons.close,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        widget.title,
                        style: TextStyle(
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Search field with map icon
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDark
                              ? theme.colorScheme.surfaceContainerHighest
                              : Colors.grey[100],
                          borderRadius: BorderRadius.circular(12.r),
                          border: Border.all(
                            color: isDark
                                ? theme.colorScheme.outline
                                : Colors.grey[300]!,
                          ),
                        ),
                        child: TextField(
                          controller: _searchController,
                          focusNode: _focusNode,
                          decoration: InputDecoration(
                            hintText: 'Otel, Şehir, Bölge veya Tema adı',
                            hintStyle: TextStyle(
                              fontSize: 14.sp,
                              color: isDark
                                  ? Colors.grey[500]
                                  : Colors.grey[600],
                            ),
                            prefixIcon: Icon(
                              Icons.location_on_outlined,
                              size: 20.sp,
                              color: isDark
                                  ? Colors.grey[400]
                                  : Colors.grey[600],
                            ),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 16.w,
                              vertical: 14.h,
                            ),
                          ),
                          onChanged: _onSearchChanged,
                        ),
                      ),
                    ),
                    SizedBox(width: 12.w),
                    // Map icon button
                    InkWell(
                      onTap: _openMapSelector,
                      borderRadius: BorderRadius.circular(12.r),
                      child: Container(
                        padding: EdgeInsets.all(14.w),
                        decoration: BoxDecoration(
                          color: isDark
                              ? theme.colorScheme.surfaceContainerHighest
                              : Colors.grey[100],
                          borderRadius: BorderRadius.circular(12.r),
                          border: Border.all(
                            color: isDark
                                ? theme.colorScheme.outline
                                : Colors.grey[300]!,
                          ),
                        ),
                        child: Icon(
                          Icons.map_outlined,
                          size: 22.sp,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 16.h),

              // Content - Categories or search results
              Expanded(
                child: _searchQuery.isNotEmpty
                    ? _buildSearchResults(isDark, theme)
                    : _buildCategories(scrollController, isDark, theme),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSearchResults(bool isDark, ThemeData theme) {
    // Loading durumu
    if (_isSearching) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 32.w,
              height: 32.w,
              child: CircularProgressIndicator(
                strokeWidth: 2.w,
                color: AppColors.primary,
              ),
            ),
            SizedBox(height: 12.h),
            Text(
              'Aranıyor...',
              style: TextStyle(fontSize: 14.sp, color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    // Hem sabit hem API sonuçları boşsa
    if (_filteredDestinations.isEmpty && _apiSearchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 48.sp, color: Colors.grey[400]),
            SizedBox(height: 12.h),
            Text(
              'Sonuç bulunamadı',
              style: TextStyle(fontSize: 14.sp, color: Colors.grey[600]),
            ),
            SizedBox(height: 8.h),
            TextButton.icon(
              onPressed: _openMapSelector,
              icon: const Icon(Icons.map_outlined),
              label: const Text('Haritada Seç'),
            ),
          ],
        ),
      );
    }

    return ListView(
      padding: EdgeInsets.only(
        left: 16.w,
        right: 16.w,
        bottom: MediaQuery.of(context).viewPadding.bottom + 16.h,
      ),
      children: [
        // Önerilen destinasyonlar (sabit liste)
        if (_filteredDestinations.isNotEmpty) ...[
          Padding(
            padding: EdgeInsets.only(bottom: 8.h),
            child: Row(
              children: [
                Icon(Icons.star_outline, size: 16.sp, color: Colors.amber),
                SizedBox(width: 6.w),
                Text(
                  'Önerilen Destinasyonlar',
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          ..._filteredDestinations.map(
            (dest) => _buildDestinationTile(dest, isDark, theme),
          ),
          if (_apiSearchResults.isNotEmpty) SizedBox(height: 16.h),
        ],
        // API sonuçları
        if (_apiSearchResults.isNotEmpty) ...[
          Padding(
            padding: EdgeInsets.only(bottom: 8.h),
            child: Row(
              children: [
                Icon(Icons.public, size: 16.sp, color: AppColors.primary),
                SizedBox(width: 6.w),
                Text(
                  'Tüm Konumlar',
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          ..._apiSearchResults.map(
            (result) => _buildApiResultTile(result, isDark, theme),
          ),
        ],
      ],
    );
  }

  Widget _buildApiResultTile(
    _SearchResult result,
    bool isDark,
    ThemeData theme,
  ) {
    return InkWell(
      onTap: () => _selectApiResult(result),
      borderRadius: BorderRadius.circular(12.r),
      child: Container(
        margin: EdgeInsets.only(bottom: 8.h),
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: isDark
              ? theme.colorScheme.surfaceContainerHighest.withOpacity(0.5)
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isDark
                ? theme.colorScheme.outline.withOpacity(0.3)
                : Colors.grey[200]!,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(8.w),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Icon(
                _getLocationIcon(result.type),
                size: 20.sp,
                color: AppColors.primary,
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    result.name,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    result.subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey[400], size: 20.sp),
          ],
        ),
      ),
    );
  }

  IconData _getLocationIcon(String type) {
    switch (type) {
      case 'city':
        return Icons.location_city;
      case 'town':
      case 'village':
        return Icons.holiday_village;
      case 'state':
      case 'province':
      case 'region':
        return Icons.map;
      case 'country':
        return Icons.flag;
      case 'hotel':
      case 'guest_house':
        return Icons.hotel;
      case 'airport':
        return Icons.flight;
      default:
        return Icons.location_on_outlined;
    }
  }

  void _selectApiResult(_SearchResult result) {
    // AddressData'dan şehir ve ülke bilgilerini çıkar
    final addressData = result.addressData;
    final city =
        addressData['city']?.toString() ??
        addressData['town']?.toString() ??
        addressData['state']?.toString() ??
        result.name;
    final country = addressData['country']?.toString() ?? '';
    final countryCode =
        addressData['country_code']?.toString().toUpperCase() ?? '';
    final state = addressData['state']?.toString() ?? '';

    final address = AddressModel(
      address: result.subtitle,
      city: city,
      country: country,
      countryCode: countryCode,
      state: state,
      location: result.coordinates,
    );

    _addressController.setAddress(address);
    _addressController.setLatLng(result.coordinates);

    if (widget.onSelect != null) {
      widget.onSelect!(address);
    }

    if (!widget.multiSelect) {
      Navigator.of(context).pop(address);
    }
  }

  Widget _buildCategories(
    ScrollController scrollController,
    bool isDark,
    ThemeData theme,
  ) {
    final hotelPopular = _isHotelContext
        ? _popularSearchController.byModule(PopularSearchModule.hotel)
        : const <PopularSearchModel>[];

    return ListView.builder(
      controller: scrollController,
      padding: EdgeInsets.only(
        left: 16.w,
        right: 16.w,
        bottom: MediaQuery.of(context).viewPadding.bottom + 16.h,
      ),
      itemCount: _categories.length + (_isHotelContext ? 1 : 0),
      itemBuilder: (context, index) {
        if (_isHotelContext && index == 0) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.local_fire_department, size: 18.sp, color: AppColors.primary),
                  SizedBox(width: 8.w),
                  Text(
                    'Popüler Aramalar',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 8.h),
              ...hotelPopular.take(10).map((item) {
                final destination = _popularToDestination(item);
                return _buildDestinationTile(destination, isDark, theme);
              }),
              SizedBox(height: 16.h),
            ],
          );
        }

        final categoryIndex = _isHotelContext ? index - 1 : index;
        final category = _categories[categoryIndex];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category header
            Padding(
              padding: EdgeInsets.only(
                top: categoryIndex > 0 ? 16.h : 0,
                bottom: 8.h,
              ),
              child: Row(
                children: [
                  Icon(category.icon, size: 18.sp, color: AppColors.primary),
                  SizedBox(width: 8.w),
                  Text(
                    category.title,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
            ),
            // Destinations in this category
            ...category.destinations.map((dest) {
              return _buildDestinationTile(dest, isDark, theme);
            }),
          ],
        );
      },
    );
  }

  Widget _buildDestinationTile(
    _Destination dest,
    bool isDark,
    ThemeData theme,
  ) {
    final isSelected = _isSelected(dest);

    return InkWell(
      onTap: () => _selectDestination(dest),
      borderRadius: BorderRadius.circular(12.r),
      child: Container(
        margin: EdgeInsets.only(bottom: 8.h),
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark
                    ? AppColors.primary.withOpacity(0.15)
                    : AppColors.primary.withOpacity(0.08))
              : (isDark
                    ? theme.colorScheme.surfaceContainerHighest
                    : Colors.grey[50]),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? theme.colorScheme.outline : Colors.grey[200]!),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            // Icon
            Container(
              width: 44.w,
              height: 44.w,
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary.withOpacity(0.15)
                    : (isDark ? Colors.grey[800] : Colors.grey[100]),
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(
                dest.icon,
                size: 22.sp,
                color: isSelected
                    ? AppColors.primary
                    : (isDark ? Colors.grey[400] : Colors.grey[600]),
              ),
            ),
            SizedBox(width: 12.w),
            // Text content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dest.name,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: isSelected
                          ? AppColors.primary
                          : theme.colorScheme.onSurface,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    dest.subtitle,
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: isDark ? Colors.grey[500] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            // Check icon if selected
            if (isSelected)
              Icon(Icons.check_circle, size: 22.sp, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}

class _DestinationCategory {
  final String title;
  final IconData icon;
  final List<_Destination> destinations;

  const _DestinationCategory({
    required this.title,
    required this.icon,
    required this.destinations,
  });
}

class _Destination {
  final String name;
  final String subtitle;
  final IconData icon;
  final AddressModel address;

  const _Destination({
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.address,
  });
}

/// API'den gelen arama sonuçları için model
class _SearchResult {
  final String name;
  final String subtitle;
  final String displayName;
  final LatLng coordinates;
  final String type;
  final Map<String, dynamic> addressData;

  const _SearchResult({
    required this.name,
    required this.subtitle,
    required this.displayName,
    required this.coordinates,
    required this.type,
    required this.addressData,
  });
}
