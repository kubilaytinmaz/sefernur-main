import 'package:latlong2/latlong.dart';

class AddressModel {
  final LatLng? location;
  final String address;
  final String country;
  final String countryCode;
  final String city;
  final String state;

  AddressModel({
    this.location,
    this.address = '',
    this.country = '',
    this.countryCode = '',
    this.city = '',
    this.state = '',
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      location: json['location'] != null 
          ? LatLng(
              double.parse(json['location']['latitude'].toString()),
              double.parse(json['location']['longitude'].toString()),
            )
          : null,
      address: json['address'] ?? '',
      country: json['country'] ?? '',
      countryCode: json['countryCode'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'location': location != null 
          ? {
              'latitude': location!.latitude,
              'longitude': location!.longitude,
            }
          : null,
      'address': address,
      'country': country,
      'countryCode': countryCode,
      'city': city,
      'state': state,
    };
  }

  AddressModel copyWith({
    LatLng? location,
    String? address,
    String? country,
    String? countryCode,
    String? city,
    String? state,
  }) {
    return AddressModel(
      location: location ?? this.location,
      address: address ?? this.address,
      country: country ?? this.country,
      countryCode: countryCode ?? this.countryCode,
      city: city ?? this.city,
      state: state ?? this.state,
    );
  }

  bool get isEmpty {
    return location == null && 
           address.isEmpty && 
           country.isEmpty && 
           city.isEmpty && 
           state.isEmpty;
  }

  bool get hasCoordinates {
    return location != null && 
           location!.latitude != 0.0 && 
           location!.longitude != 0.0;
  }

  /// Kısa gösterim: İlçe (state), Şehir (city), Ülke (country)
  /// Boş olanları atlar, hiçbiri yoksa tam address alanını döner
  String short() {
    final parts = <String>[
      if (state.isNotEmpty) state,
      if (city.isNotEmpty && city != state) city,
      if (country.isNotEmpty) country,
    ];
    if (parts.isEmpty) return address;
    return parts.join(', ');
  }
}
