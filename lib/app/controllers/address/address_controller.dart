import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';

import '../../data/models/address/address_model.dart';
import '../../data/providers/transport/uber_remote_config.dart';

class AddressController extends GetxController {
  final Rx<AddressModel> address = AddressModel().obs;
  final RxBool isLoading = false.obs;
  
  List<UberFallbackCity> get _fallbackCities => UberRemoteConfig.fallbackCities;

  LatLng get _primaryFallback => _fallbackCities.first.location;

  LatLng get _secondaryFallback {
    if (_fallbackCities.length > 1) {
      return _fallbackCities[1].location;
    }
    return _primaryFallback;
  }

  // Mevcut adresi al
  AddressModel get currentAddress => address.value;

  // Koordinatları al
  LatLng getLatLng() {
    if (address.value.location != null) {
      if (address.value.location!.latitude == 0.0 &&
          address.value.location!.longitude == 0.0) {
              return _primaryFallback;
      }
      return LatLng(
        address.value.location!.latitude,
        address.value.location!.longitude,
      );
    } else {
          return _primaryFallback;
    }
  }

  LatLng getSecondaryFallbackLatLng() => _secondaryFallback;

  // Koordinatları ayarla
  void setLatLng(LatLng latLng) {
    address.value = address.value.copyWith(
      location: LatLng(
        latLng.latitude,
        latLng.longitude,
      ),
    );
  }

  // Zoom değerini al
  double getZoomValue() {
    if (address.value.location != null) {
      return 14;
    } else {
      return 11;
    }
  }

  // Adresi sıfırla
  void resetAddress() {
    address.value = AddressModel();
  }

  // Adres bilgilerini direkt ayarla
  void setAddress(AddressModel newAddress) {
    address.value = newAddress;
  }

  // Konum bilgisinden adres bilgilerini güncelle
  Future<void> updateAddressFromLocation() async {
    if (address.value.location == null) return;

    isLoading.value = true;
    
    try {
      final dio = Dio();
      
      // Nominatim API için gerekli headers ekle
      dio.options.headers = {
        'User-Agent': 'SeferNurApp/1.0 (Flutter Mobile App)',
        'Accept': 'application/json',
        'Accept-Language': Get.locale!.languageCode,
      };
      
      // Rate limiting için kısa bekleme
      await Future.delayed(const Duration(milliseconds: 200));
      
      final response = await dio.get(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=${address.value.location!.latitude}&lon=${address.value.location!.longitude}&zoom=18&addressdetails=1&accept-language=${Get.locale!.languageCode}',
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        final addressText = data['display_name'] ?? '';
        final addressData = data['address'] ?? {};
        
        // Adres bilgilerini ayrıştır
        String country = addressData['country'] ?? '';
        String countryCode = addressData['country_code'] ?? '';
        
        // Şehir için öncelik sırası: state > city > province > county
        String city = addressData['state'] ?? 
                     addressData['city'] ?? 
                     addressData['province'] ?? 
                     addressData['county'] ?? '';
        
        // İlçe için öncelik sırası: district > municipality > town > village > suburb
        String state = addressData['district'] ?? 
                      addressData['municipality'] ?? 
                      addressData['town'] ?? 
                      addressData['village'] ?? 
                      addressData['suburb'] ?? '';
        
        // Adres bilgilerini kaydet
        address.value = address.value.copyWith(
          address: addressText,
          country: country,
          countryCode: countryCode.toUpperCase(),
          city: city,
          state: state,
        );
        
      } else {
        _createFallbackAddress();
      }
    } catch (e) {
      _createFallbackAddress();
    } finally {
      isLoading.value = false;
    }
  }

  // Adres bilgilerini manuel kaydet
  void setAddressInfo({
    required String addressText,
    required String country,
    required String countryCode,
    required String city,
    required String state,
  }) {
    address.value = address.value.copyWith(
      address: addressText,
      country: country,
      countryCode: countryCode,
      city: city,
      state: state,
    );
  }

  // Fallback adres oluşturma fonksiyonu
  void _createFallbackAddress() {
    if (address.value.location == null) return;

    final fallback = _nearestFallback(address.value.location!);
    
    String fallbackAddress = 'Koordinat: ${address.value.location!.latitude.toStringAsFixed(6)}, ${address.value.location!.longitude.toStringAsFixed(6)}';
    
    // En azından koordinatları kaydet
    address.value = address.value.copyWith(
      address: fallbackAddress,
        country: 'Suudi Arabistan',
        countryCode: 'SA',
      city: fallback.city,
      state: fallback.name,
    );
  }

  UberFallbackCity _nearestFallback(LatLng location) {
    final Distance distance = const Distance();
    UberFallbackCity selected = _fallbackCities.first;
    double minDistance = double.infinity;

    for (final city in _fallbackCities) {
      final d = distance.as(LengthUnit.Kilometer, location, city.location);
      if (d < minDistance) {
        minDistance = d;
        selected = city;
      }
    }

    return selected;
  }

  // Adresin geçerli olup olmadığını kontrol et
  bool isAddressValid() {
    return address.value.hasCoordinates && address.value.address.isNotEmpty;
  }

  // Kısa adres formatı oluştur
  String getShortAddress() {
    final addr = address.value;
    if (addr.isEmpty) return '';
    
    List<String> parts = [];
    
    if (addr.state.isNotEmpty) {
      parts.add(addr.state);
    }
    if (addr.city.isNotEmpty && addr.city != addr.state) {
      parts.add(addr.city);
    }
    if (addr.country.isNotEmpty && addr.country != 'Türkiye') {
      parts.add(addr.country);
    }
    
    return parts.join(', ');
  }
}
