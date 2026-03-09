import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../controllers/controllers.dart';
import '../../themes/colors/app_colors.dart';
import '../../widgets/regions/page_region.dart';
import '../../widgets/snackbars/failure_snackbar.dart';
import '../../widgets/snackbars/success_snackbar.dart';

class LocationSearchResult {
  final String displayName;
  final String address;
  final LatLng coordinates;

  LocationSearchResult({
    required this.displayName,
    required this.address,
    required this.coordinates,
  });
}

class SelectLocationPage extends StatelessWidget {
  const SelectLocationPage({super.key});

  @override
  Widget build(BuildContext context) {
    final MapController mapController = MapController();
    final TextEditingController searchController = TextEditingController();
    final RxList<LocationSearchResult> searchResults = <LocationSearchResult>[].obs;
    final RxBool isSearching = false.obs;
    final RxString selectedAddress = "".obs;

  // Dinamik tag: varsayılan 'admin_address'
  final String tag = (Get.arguments is Map && (Get.arguments as Map).containsKey('tag'))
    ? (Get.arguments as Map)['tag'] as String
    : 'admin_address';
  // Controller'ı bul veya oluştur
  final AddressController addressController = Get.isRegistered<AddressController>(tag: tag)
    ? Get.find<AddressController>(tag: tag)
    : Get.put(AddressController(), tag: tag);

    // Eğer mevcut bir adres varsa, haritayı o konuma getir
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (addressController.currentAddress.hasCoordinates) {
        final location = addressController.getLatLng();
        mapController.move(location, 15.0);
        selectedAddress.value = addressController.getShortAddress();
      }
    });

    return PageRegion(
      child: Builder(
        builder: (context) {
          final theme = Theme.of(context);
          final isDark = theme.brightness == Brightness.dark;
          final appBarBg = isDark ? theme.colorScheme.surface : Colors.white;
          final appBarTextColor = theme.colorScheme.onSurface;
          
          return Scaffold(
            resizeToAvoidBottomInset: false,
            appBar: AppBar(
              title: Text(
                'Konum Seç',
                style: TextStyle(
                  color: appBarTextColor,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 1,
                ),
              ),
              backgroundColor: appBarBg,
              centerTitle: false,
              iconTheme: IconThemeData(
                color: appBarTextColor
              )
            ),
            body: SizedBox(
              width: Get.width,
              height: Get.height,
              child: Stack(
                children: [
                  // Harita - Tam ekran
                  Positioned.fill(
                child: Obx(() => FlutterMap(
                  mapController: mapController,
                  options: MapOptions(
                    initialCenter: addressController.getLatLng(),
                    initialZoom: addressController.getZoomValue(),
                    minZoom: 6,
                    maxZoom: 18,
                    onTap: (tapPosition, point) {
                      addressController.setLatLng(point);
                      _updateAddressFromLatLng(point, selectedAddress, addressController);
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                      userAgentPackageName: 'com.eyexapp.sahasist',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          width: 40.w,
                          height: 40.w,
                          point: addressController.getLatLng(),
                          child: Icon(
                            Icons.location_on,
                            color: Get.theme.colorScheme.primary,
                            size: 32.sp,
                          ),
                        ),
                      ],
                    ),
                  ]
                )),
              ),

              // Arama ve adres bilgileri - Draggable, klavye farkında alt sayfa
              DraggableScrollableSheet(
                initialChildSize: 0.58,
                minChildSize: 0.40,
                maxChildSize: 0.92,
                snap: true,
                builder: (context, scrollCtrl) {
                  final viewInsets = MediaQuery.of(context).viewInsets.bottom; // keyboard
                  final theme = Theme.of(context);
                  final isDark = theme.brightness == Brightness.dark;
                  final bgColor = isDark ? theme.colorScheme.surfaceContainerHigh : Colors.white;
                  final textColor = theme.colorScheme.onSurface;
                  final subtitleColor = isDark ? Colors.grey[400] : Colors.grey[600];
                  
                  return Container(
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(20.r),
                        topRight: Radius.circular(20.r),
                      ),
                      boxShadow: isDark ? null : [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, -5),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(16.w, 8.h, 16.w, 16.h),
                        child: SingleChildScrollView(
                          controller: scrollCtrl,
                          physics: const ClampingScrollPhysics(),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Drag handle
                              Center(
                                child: Container(
                                  width: 40.w,
                                  height: 4.h,
                                  margin: EdgeInsets.only(bottom: 12.h),
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.grey[600] : Colors.black12,
                                    borderRadius: BorderRadius.circular(100.r),
                                  ),
                                ),
                              ),
                              // Arama çubuğu
                              Container(
                                decoration: BoxDecoration(
                                  color: isDark ? theme.colorScheme.surfaceContainerHighest : theme.colorScheme.surface,
                                  borderRadius: BorderRadius.circular(100.r),
                                  boxShadow: isDark ? null : [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 10,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                  border: isDark ? Border.all(color: Colors.grey[700]!) : null,
                                ),
                                child: TextFormField(
                                  controller: searchController,
                                  decoration: textFieldInputDecoration(
                                    "Konum ara...",
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        IconButton(
                                          onPressed: () => _getCurrentLocation(mapController, selectedAddress, addressController),
                                          icon: Icon(
                                            Icons.my_location,
                                            color: AppColors.primary,
                                            size: 20.sp,
                                          ),
                                        ),
                                        IconButton(
                                          onPressed: () => _searchLocation(searchController.text, searchResults, isSearching),
                                          icon: Icon(
                                            Icons.search,
                                            color: AppColors.primary,
                                            size: 20.sp,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  onChanged: (value) {
                                    if (value.isNotEmpty) {
                                      _searchLocation(value, searchResults, isSearching);
                                    } else {
                                      searchResults.clear();
                                    }
                                  },
                                  style: Get.textTheme.bodyMedium!.copyWith(
                                    color: textColor,
                                    fontSize: 12.sp,
                                  ),
                                ),
                              ),
                              SizedBox(height: 8.h),
                              // Hac ve Umre Destinasyonları - Horizontal Scroll
                              _buildHajjUmrahDestinations(mapController, selectedAddress, addressController),
                              SizedBox(height: 8.h),
                              // Arama sonuçları veya bilgilendirici boş durum
                              Obx(() => searchResults.isNotEmpty
                                  ? Column(
                                      children: [
                                        for (int i = 0; i < searchResults.length; i++) ...[
                                          ListTile(
                                            contentPadding: EdgeInsets.zero,
                                            leading: Icon(Icons.location_on, color: AppColors.primary),
                                            title: Text(
                                              searchResults[i].address,
                                              style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: textColor),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            subtitle: Text(
                                              searchResults[i].displayName,
                                              style: TextStyle(fontSize: 10.sp, color: subtitleColor),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            onTap: () {
                                              final result = searchResults[i];
                                              addressController.setLatLng(result.coordinates);
                                              mapController.move(result.coordinates, 15.0);
                                              _updateAddressFromLatLng(result.coordinates, selectedAddress, addressController);
                                              searchResults.clear();
                                              searchController.clear();
                                            },
                                          ),
                                          Divider(height: 1.h),
                                        ]
                                      ],
                                    )
                                  : Container(
                                      margin: EdgeInsets.only(top: 12.h),
                                      width: double.infinity,
                                      padding: EdgeInsets.all(12.w),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.06),
                                        borderRadius: BorderRadius.circular(12.r),
                                        border: Border.all(color: AppColors.primary.withOpacity(0.25)),
                                      ),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Icon(Icons.map_outlined, size: 20.sp, color: AppColors.primary),
                                          SizedBox(width: 10.w),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Konum seçimi için ipuçları',
                                                  style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: AppColors.primary),
                                                ),
                                                SizedBox(height: 6.h),
                                                Text(
                                                  '• Haritaya dokunarak pin bırakabilir veya sürükleyerek konumu güncelleyebilirsiniz.\n• Üstteki aramadan adres arayabilirsiniz.\n• Mevcut konum için sağdaki hedef ikonuna dokunun.',
                                                  style: TextStyle(fontSize: 11.sp, height: 1.3, color: isDark ? Colors.grey[300] : Colors.black87),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    )),
                              // Seçili adres
                              Obx(() => selectedAddress.value.isNotEmpty
                                  ? Container(
                                      margin: EdgeInsets.only(top: 16.h),
                                      width: double.infinity,
                                      padding: EdgeInsets.all(12.w),
                                      decoration: BoxDecoration(
                                        color: isDark ? AppColors.primary.withOpacity(0.15) : AppColors.primary.withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(12.r),
                                        border: Border.all(color: isDark ? AppColors.primary.withOpacity(0.5) : AppColors.primary.withOpacity(0.35)),
                                      ),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Icon(Icons.place, size: 18.sp, color: AppColors.primary),
                                          SizedBox(width: 8.w),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text('Seçili Konum', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: AppColors.primary)),
                                                SizedBox(height: 2.h),
                                                Text(selectedAddress.value, style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: textColor)),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    )
                                  : const SizedBox.shrink()),
                              SizedBox(height: 12.h),
                              // Kaydet butonu - SafeArea üstüne oturur, nav altında kalmaz
                              SizedBox(
                                width: Get.width,
                                height: 45.h,
                                child: ElevatedButton(
                                  onPressed: () async {
                                    if (addressController.address.value.location != null) {
                                      await addressController.updateAddressFromLocation();
                                      final result = addressController.address.value;
                                      Navigator.of(context).pop(result);
                                      // Snackbar'ı navigation'dan sonra göster
                                      Future.delayed(const Duration(milliseconds: 100), () {
                                        SuccessSnackbar.show("Konum başarıyla kaydedildi");
                                      });
                                    } else {
                                      FailureSnackBar.show("Lütfen haritadan bir konum seçin");
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12.r),
                                    ),
                                  ),
                                  child: Text(
                                    'Konumu Kaydet',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                              // Klavye açıldığında içerik gizlenmesin diye ekstra boşluk
                              if (viewInsets > 0) SizedBox(height: viewInsets),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
              ),

              // Loading indicator
              Obx(() => isSearching.value
                  ? Positioned(
                      top: Get.height * 0.6 + 80.h,
                      left: 0,
                      right: 0,
                      child: const Center(
                        child: CircularProgressIndicator(),
                      ),
                    )
                  : Container()),
            ],
          ),
        ),
      );
    }),
    );
  }

  InputDecoration textFieldInputDecoration(String hintText, Widget icon) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: TextStyle(
        color: Colors.grey[600],
        fontSize: 12.sp,
        fontWeight: FontWeight.w400,
        height: 0,
        letterSpacing: 0
      ),
      errorStyle: TextStyle(
        color: AppColors.red40,
        fontSize: 10.sp,
        fontWeight: FontWeight.w300,
        height: 0,
        letterSpacing: 0
      ),
      suffixIcon: icon,
      isDense: true,
      contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(100.r),
        borderSide: BorderSide(color: Colors.grey[400]!, width: 1.w)
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(100.r),
        borderSide: BorderSide(color: Colors.blue, width: 2.w)
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(100.r),
        borderSide: BorderSide(color: Colors.grey[400]!, width: 1.w)
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(100.r),
        borderSide: BorderSide(color: AppColors.red40, width: 1.w)
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(100.r),
        borderSide: BorderSide(color: AppColors.red40, width: 1.w)
      ),
    );
  }

  Future<void> _getCurrentLocation(MapController mapController, RxString selectedAddress, AddressController addressController) async {
    try {
      // Konum servisleri kontrol et
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        FailureSnackBar.show('Konum servisleri kapalı.');
        return;
      }

      // Permission Handler kullanarak konum izni kontrol et
      PermissionStatus permissionStatus = await Permission.location.status;
      
      if (permissionStatus.isDenied) {
        // İzin reddedilmişse, izin iste
        permissionStatus = await Permission.location.request();
        
        if (permissionStatus.isDenied) {
          FailureSnackBar.show('Konum izni reddedildi.');
          return;
        }
      }

      if (permissionStatus.isPermanentlyDenied) {
        // Kalıcı olarak reddedilmişse, ayarları açmasını söyle
        FailureSnackBar.show('Konum izni kalıcı olarak reddedildi. Lütfen ayarlardan izin verin.');
        await openAppSettings();
        return;
      }

      // İzin verildiyse konumu al
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      LatLng currentLocation = LatLng(position.latitude, position.longitude);
      
      addressController.setLatLng(currentLocation);
      mapController.move(currentLocation, 15.0);
      
      // Adres bilgisini al
      await _updateAddressFromLatLng(currentLocation, selectedAddress, addressController);
      
    } catch (e) {
      print('Konum alınamadı: $e');
      FailureSnackBar.show('Konum alınamadı: $e');
    }
  }

  Future<void> _updateAddressFromLatLng(LatLng position, RxString selectedAddress, AddressController addressController) async {
    try {
      final dio = Dio();
      
      // Nominatim API için gerekli headers ekle
      dio.options.headers = {
        'User-Agent': 'SahasistApp/1.0 (Flutter Mobile App)',
        'Accept': 'application/json',
        'Accept-Language': Get.locale!.languageCode,
      };
      
      // Rate limiting için kısa bekleme
      await Future.delayed(const Duration(milliseconds: 200));
      
      final response = await dio.get(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.latitude}&lon=${position.longitude}&zoom=18&addressdetails=1&accept-language=${Get.locale!.languageCode}',
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        final address = data['display_name'] ?? '';
        final addressData = data['address'] ?? {};
        
        // Debug için adres verisini yazdır
        print('Adres verisi: $addressData');
        
        // Adres bilgilerini ayrıştır
        String country = addressData['country'] ?? '';
        String countryCode = addressData['country_code'] ?? '';
        
        // Şehir için öncelik sırası: state > city > province > county
        String city = addressData['state'] ?? 
                     addressData['city'] ?? 
                     addressData['province'] ?? 
                     addressData['county'] ?? '';
        
        // İlçe için öncelik sırası: district > municipality > town > village > suburb
        String district = addressData['district'] ?? 
                         addressData['municipality'] ?? 
                         addressData['town'] ?? 
                         addressData['village'] ?? 
                         addressData['suburb'] ?? '';
        
        String postalCode = addressData['postcode'] ?? '';
        
  // Kısa adres gösterimi için kısa formu seçili adres olarak ata
  // (şehir, ilçe, ülke vb.)
  // Önce controller'a detayları kaydediyoruz ardından kısa adresi alıyoruz
        
        // Controller'a adres bilgilerini kaydet
        addressController.setAddressInfo(
          addressText: address,
          country: country,
          countryCode: countryCode.toUpperCase(),
          city: city,
          state: district,
        );

  selectedAddress.value = addressController.getShortAddress();
        
        // Debug için kaydedilen bilgileri yazdır
        print('Controller\'a kaydedilen adres bilgileri:');
        print('Ülke: ${addressController.address.value.country}');
        print('Şehir: ${addressController.address.value.city}');
        print('İlçe: ${addressController.address.value.state}');
        print('Ülke Kodu: ${addressController.address.value.countryCode}');
        print('Tam Adres: ${addressController.address.value.address}');
        
        // Debug için parçalanan bilgileri yazdır
        print('Parçalanan adres bilgileri:');
        print('Ülke: $country');
        print('Şehir: $city');
        print('İlçe: $district');
        print('Posta Kodu: $postalCode');
        print('Tam Adres: $address');
        
      } else {
        print('API yanıt hatası: ${response.statusCode}');
        _createFallbackAddress(position, selectedAddress, addressController);
      }
    } catch (e) {
      print('Adres alınamadı: $e');
      _createFallbackAddress(position, selectedAddress, addressController);
    }
  }

  void _createFallbackAddress(LatLng position, RxString selectedAddress, AddressController addressController) {
    String fallbackAddress = 'Koordinat: ${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)}';
    selectedAddress.value = fallbackAddress;
    
    // Controller'a en azından koordinatları kaydet
    addressController.setAddressInfo(
      addressText: fallbackAddress,
      country: 'Türkiye',
      countryCode: 'TR',
      city: 'Bilinmiyor',
      state: 'Bilinmiyor',
    );
    
    print('Fallback adres kullanıldı: $fallbackAddress');
  }

  // Konum arama fonksiyonu
  Future<void> _searchLocation(String query, RxList<LocationSearchResult> searchResults, RxBool isSearching) async {
    if (query.length < 3) return;

    isSearching.value = true;
    searchResults.clear();

    try {
      final dio = Dio();
      
      // Nominatim API için gerekli headers ekle
      dio.options.headers = {
        'User-Agent': 'SahasistApp/1.0 (Flutter Mobile App)',
        'Accept': 'application/json',
        'Accept-Language': Get.locale!.languageCode,
      };
      
      // Rate limiting için kısa bekleme
      await Future.delayed(const Duration(milliseconds: 300));
      
      final response = await dio.get(
        'https://nominatim.openstreetmap.org/search?format=json&q=$query&limit=5&addressdetails=1&accept-language=${Get.locale!.languageCode}',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        
        for (final item in data) {
          final lat = double.parse(item['lat']);
          final lon = double.parse(item['lon']);
          final displayName = item['display_name'] ?? '';
          final addressData = item['address'] ?? {};
          
          final shortAddress = _createShortAddress(addressData);
          
          searchResults.add(LocationSearchResult(
            displayName: displayName,
            address: shortAddress,
            coordinates: LatLng(lat, lon),
          ));
        }
      } else {
        print('Arama API yanıt hatası: ${response.statusCode}');
        FailureSnackBar.show('Arama servisi geçici olarak kullanılamıyor. Haritadan konum seçebilirsiniz.');
      }
    } catch (e) {
      print('Arama hatası: $e');
      FailureSnackBar.show('Arama yapılamadı. Haritadan konum seçebilirsiniz.');
    } finally {
      isSearching.value = false;
    }
  }

  // Kısa adres oluşturma fonksiyonu
  String _createShortAddress(Map<String, dynamic> addressData) {
    // Sadece ilçe (district/town), şehir (state/city) ve ülke
    final List<String> parts = [];
    final district = addressData['district'] ?? addressData['town'] ?? addressData['municipality'] ?? '';
    final city = addressData['state'] ?? addressData['city'] ?? '';
    final country = addressData['country'] ?? '';
    if (district != null && district.toString().isNotEmpty) parts.add(district.toString());
    if (city != null && city.toString().isNotEmpty && city != district) parts.add(city.toString());
    if (country != null && country.toString().isNotEmpty) parts.add(country.toString());
    return parts.join(', ');
  }

  /// Hac ve Umre destinasyonları - horizontal scroll
  Widget _buildHajjUmrahDestinations(
    MapController mapController,
    RxString selectedAddress,
    AddressController addressController,
  ) {
    final destinations = [
      _HajjDestination('Mekke', Icons.mosque, const LatLng(21.3891, 39.8579)),
      _HajjDestination('Medine', Icons.mosque, const LatLng(24.4686, 39.6142)),
      _HajjDestination('Cidde', Icons.flight_land, const LatLng(21.4858, 39.1925)),
      _HajjDestination('Mina', Icons.location_on, const LatLng(21.4133, 39.8931)),
      _HajjDestination('Arafat', Icons.landscape, const LatLng(21.3549, 39.9842)),
      _HajjDestination('Müzdelife', Icons.nights_stay, const LatLng(21.3894, 39.9333)),
      _HajjDestination('Taif', Icons.park, const LatLng(21.2701, 40.4158)),
    ];

    return Builder(
      builder: (context) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        final titleColor = isDark ? Colors.grey[400] : Colors.grey[700];
        final chipBg = isDark ? AppColors.primary.withOpacity(0.15) : AppColors.primary.withOpacity(0.08);
        final chipBorder = isDark ? AppColors.primary.withOpacity(0.4) : AppColors.primary.withOpacity(0.3);
        final chipTextColor = theme.colorScheme.onSurface;
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hac & Umre Destinasyonları',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: titleColor,
              ),
            ),
            SizedBox(height: 8.h),
            SizedBox(
              height: 36.h,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: destinations.length,
                separatorBuilder: (_, __) => SizedBox(width: 8.w),
                itemBuilder: (context, index) {
                  final dest = destinations[index];
                  return ActionChip(
                    visualDensity: const VisualDensity(horizontal: -2, vertical: -2),
                    avatar: Icon(dest.icon, size: 14.sp, color: AppColors.primary),
                    label: Text(
                      dest.name,
                      style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: chipTextColor),
                    ),
                    onPressed: () {
                      addressController.setLatLng(dest.location);
                      mapController.move(dest.location, 14.0);
                      _updateAddressFromLatLng(dest.location, selectedAddress, addressController);
                    },
                    shape: StadiumBorder(side: BorderSide(color: chipBorder)),
                    backgroundColor: chipBg,
                    elevation: 0,
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _HajjDestination {
  final String name;
  final IconData icon;
  final LatLng location;
  
  const _HajjDestination(this.name, this.icon, this.location);
}