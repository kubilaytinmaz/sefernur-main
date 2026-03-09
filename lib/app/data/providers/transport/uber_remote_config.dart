import 'dart:convert';

import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:latlong2/latlong.dart';

class UberFallbackCity {
  final String name;
  final String city;
  final LatLng location;

  const UberFallbackCity({
    required this.name,
    required this.city,
    required this.location,
  });
}

class UberRemoteConfig {
  UberRemoteConfig._();

  static final FirebaseRemoteConfig _rc = FirebaseRemoteConfig.instance;

  static const String _kUberEnabled = 'uber_enabled';
  static const String _kLivePriceEnabled = 'uber_live_price_enabled';
  static const String _kLiveEtaEnabled = 'uber_live_eta_enabled';
  static const String _kHybridResultsEnabled = 'uber_hybrid_results_enabled';
  static const String _kOauthConnectEnabled = 'uber_oauth_connect_enabled';
  static const String _kResultPriority = 'uber_result_priority';
  static const String _kMaxDistanceKm = 'uber_max_estimate_distance_km';
  static const String _kClientId = 'uber_client_id';
  static const String _kFallbackCitiesJson = 'uber_fallback_cities_json';

  static const String _defaultFallbackCitiesJson =
      '[{"name":"Mekke","city":"Mekke","lat":21.4225,"lng":39.8262},'
      '{"name":"Medine","city":"Medine","lat":24.5247,"lng":39.5692}]';

  static const Map<String, dynamic> _defaults = {
    _kUberEnabled: true,
    _kLivePriceEnabled: true,
    _kLiveEtaEnabled: true,
    _kHybridResultsEnabled: true,
    _kOauthConnectEnabled: true,
    _kResultPriority: 'hybrid',
    _kMaxDistanceKm: 120.0,
    _kClientId: '',
    _kFallbackCitiesJson: _defaultFallbackCitiesJson,
  };

  static Future<void> init() async {
    await _rc.setDefaults(_defaults);
    await _rc.setConfigSettings(
      RemoteConfigSettings(
        fetchTimeout: const Duration(seconds: 20),
        minimumFetchInterval: const Duration(hours: 1),
      ),
    );
    await _rc.fetchAndActivate();
  }

  static bool get uberEnabled => _rc.getBool(_kUberEnabled);
  static bool get livePriceEnabled => _rc.getBool(_kLivePriceEnabled);
  static bool get liveEtaEnabled => _rc.getBool(_kLiveEtaEnabled);
  static bool get hybridResultsEnabled => _rc.getBool(_kHybridResultsEnabled);
  static bool get oauthConnectEnabled => _rc.getBool(_kOauthConnectEnabled);
  static String get resultPriority => _rc.getString(_kResultPriority);
  static double get maxEstimateDistanceKm => _rc.getDouble(_kMaxDistanceKm);
  static String get clientId => _rc.getString(_kClientId);

  static List<UberFallbackCity> get fallbackCities {
    try {
      final raw = _rc.getString(_kFallbackCitiesJson);
      final source = raw.isNotEmpty ? raw : _defaultFallbackCitiesJson;
      final decoded = jsonDecode(source);
      if (decoded is! List) return _defaultCities;
      final parsed = decoded
          .whereType<Map>()
          .map((e) {
            final lat = double.tryParse(e['lat']?.toString() ?? '');
            final lng = double.tryParse(e['lng']?.toString() ?? '');
            if (lat == null || lng == null) return null;
            return UberFallbackCity(
              name: (e['name'] ?? '').toString().trim().isEmpty
                  ? 'Bilinmiyor'
                  : (e['name'] ?? '').toString(),
              city: (e['city'] ?? '').toString().trim().isEmpty
                  ? 'Bilinmiyor'
                  : (e['city'] ?? '').toString(),
              location: LatLng(lat, lng),
            );
          })
          .whereType<UberFallbackCity>()
          .toList();
      return parsed.isEmpty ? _defaultCities : parsed;
    } catch (_) {
      return _defaultCities;
    }
  }

  static List<UberFallbackCity> get _defaultCities => const [
        UberFallbackCity(
          name: 'Mekke',
          city: 'Mekke',
          location: LatLng(21.4225, 39.8262),
        ),
        UberFallbackCity(
          name: 'Medine',
          city: 'Medine',
          location: LatLng(24.5247, 39.5692),
        ),
      ];
}
