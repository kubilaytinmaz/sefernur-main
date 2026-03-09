import 'package:cloud_functions/cloud_functions.dart';
import 'package:latlong2/latlong.dart';

class UberProductEstimate {
  final String productId;
  final String displayName;
  final String localizedDisplayName;
  final int? durationSeconds;
  final int? etaSeconds;
  final String currency;
  final double? lowEstimate;
  final double? highEstimate;
  final String displayPrice;
  final String? fareId;

  const UberProductEstimate({
    required this.productId,
    required this.displayName,
    required this.localizedDisplayName,
    required this.durationSeconds,
    required this.etaSeconds,
    required this.currency,
    required this.lowEstimate,
    required this.highEstimate,
    required this.displayPrice,
    required this.fareId,
  });

  factory UberProductEstimate.fromMap(Map<String, dynamic> map) {
    return UberProductEstimate(
      productId: map['productId']?.toString() ?? '',
      displayName: map['displayName']?.toString() ?? '-',
      localizedDisplayName: map['localizedDisplayName']?.toString() ?? '-',
      durationSeconds: int.tryParse(map['durationSeconds']?.toString() ?? ''),
      etaSeconds: int.tryParse(map['etaSeconds']?.toString() ?? ''),
      currency: map['currency']?.toString() ?? 'SAR',
      lowEstimate: double.tryParse(map['lowEstimate']?.toString() ?? ''),
      highEstimate: double.tryParse(map['highEstimate']?.toString() ?? ''),
      displayPrice: map['displayPrice']?.toString() ?? '-',
      fareId: map['fareId']?.toString(),
    );
  }
}

class UberRequestResult {
  final String requestId;
  final String status;
  final int? etaMinutes;

  const UberRequestResult({
    required this.requestId,
    required this.status,
    required this.etaMinutes,
  });

  factory UberRequestResult.fromMap(Map<String, dynamic> map) {
    return UberRequestResult(
      requestId: map['requestId']?.toString() ?? '',
      status: map['status']?.toString() ?? 'unknown',
      etaMinutes: int.tryParse(map['etaMinutes']?.toString() ?? ''),
    );
  }
}

class UberAuthStatus {
  final bool connected;
  final bool hasRefreshToken;

  const UberAuthStatus({
    required this.connected,
    required this.hasRefreshToken,
  });

  factory UberAuthStatus.fromMap(Map<String, dynamic> map) {
    return UberAuthStatus(
      connected: map['connected'] == true,
      hasRefreshToken: map['hasRefreshToken'] == true,
    );
  }
}

class UberService {
  final FirebaseFunctions _functions = FirebaseFunctions.instanceFor(
    region: 'europe-west1',
  );

  Future<UberAuthStatus> authStatus() async {
    final callable = _functions.httpsCallable('uberAuthStatus');
    final result = await callable.call();
    final data = Map<String, dynamic>.from(result.data as Map);
    return UberAuthStatus.fromMap(data);
  }

  Future<String?> getConnectUrl() async {
    final callable = _functions.httpsCallable('uberGetAuthUrl');
    final result = await callable.call();
    final data = Map<String, dynamic>.from(result.data as Map);
    final url = data['authUrl']?.toString();
    return (url == null || url.isEmpty) ? null : url;
  }

  Future<List<UberProductEstimate>> estimateRides({
    required LatLng pickup,
    required LatLng dropoff,
  }) async {
    final callable = _functions.httpsCallable('uberEstimate');
    final result = await callable.call({
      'startLatitude': pickup.latitude,
      'startLongitude': pickup.longitude,
      'endLatitude': dropoff.latitude,
      'endLongitude': dropoff.longitude,
    });

    final data = Map<String, dynamic>.from(result.data as Map);
    if (data['success'] != true) return const [];
    final estimates = (data['estimates'] as List?) ?? const [];
    return estimates
        .whereType<Map>()
        .map((e) => UberProductEstimate.fromMap(Map<String, dynamic>.from(e)))
        .where((e) => e.productId.isNotEmpty)
        .toList();
  }

  Future<UberProductEstimate?> estimateRide({
    required LatLng pickup,
    required LatLng dropoff,
  }) async {
    final list = await estimateRides(pickup: pickup, dropoff: dropoff);
    if (list.isEmpty) return null;
    list.sort((a, b) {
      final aPrice = a.lowEstimate ?? double.infinity;
      final bPrice = b.lowEstimate ?? double.infinity;
      return aPrice.compareTo(bPrice);
    });
    return list.first;
  }

  Future<UberRequestResult?> requestRide({
    required LatLng pickup,
    required LatLng dropoff,
    required String pickupName,
    required String dropoffName,
    required String productId,
    required String fareId,
  }) async {
    final callable = _functions.httpsCallable('uberRequestRide');
    final result = await callable.call({
      'startLatitude': pickup.latitude,
      'startLongitude': pickup.longitude,
      'endLatitude': dropoff.latitude,
      'endLongitude': dropoff.longitude,
      'pickupName': pickupName,
      'dropoffName': dropoffName,
      'productId': productId,
      'fareId': fareId,
    });

    final data = Map<String, dynamic>.from(result.data as Map);
    if (data['success'] != true) return null;
    return UberRequestResult.fromMap(
      Map<String, dynamic>.from(data['ride'] as Map),
    );
  }
}
