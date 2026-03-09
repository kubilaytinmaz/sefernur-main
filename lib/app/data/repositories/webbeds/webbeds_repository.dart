import 'package:fpdart/fpdart.dart';

import '../../../utils/utils.dart';
import '../../models/webbeds/webbeds_models.dart';
import '../../providers/webbeds/webbeds_api_provider.dart';
import '../../providers/webbeds/webbeds_config.dart';
import '../../providers/webbeds/webbeds_xml_builder.dart';
import '../../providers/webbeds/webbeds_xml_parser.dart';

/// WebBeds API Repository
/// 
/// API çağrılarını yönetir ve yanıtları parse eder.
class WebBedsRepository {
  final WebBedsApiProvider _api = WebBedsApiProvider();

  // ============================================================
  // SEARCH HOTELS
  // ============================================================

  /// Şehir koduna göre otel ara
  TaskEither<ServerFailure, WebBedsSearchResponse> searchHotelsByCity({
    required DateTime checkIn,
    required DateTime checkOut,
    required int cityCode,
    required int adults,
    int rooms = 1,
    List<int> childrenAges = const [],
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
  }) {
    // Room request oluştur
    final roomRequests = List.generate(
      rooms,
      (index) => RoomRequest(
        adults: index == 0 ? adults : 2, // İlk oda belirtilen adult, diğerleri 2
        childrenAges: index == 0 ? childrenAges : [], // Çocuklar ilk odada
      ),
    );

    final xmlRequest = WebBedsXmlBuilder.searchHotelsByCity(
      fromDate: checkIn,
      toDate: checkOut,
      cityCode: cityCode,
      rooms: roomRequests,
      currency: currency,
      nationality: nationality,
    );

    return _api.searchHotels(xmlRequest).map((xmlResponse) {
      return WebBedsXmlParser.parseSearchHotels(xmlResponse);
    });
  }

  /// Otel ID listesine göre ara (batch arama)
  TaskEither<ServerFailure, WebBedsSearchResponse> searchHotelsByIds({
    required DateTime checkIn,
    required DateTime checkOut,
    required List<int> hotelIds,
    required int adults,
    int rooms = 1,
    List<int> childrenAges = const [],
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
  }) {
    // Maximum 50 otel per request
    if (hotelIds.length > WebBedsConfig.maxHotelsPerRequest) {
      hotelIds = hotelIds.take(WebBedsConfig.maxHotelsPerRequest).toList();
    }

    final roomRequests = List.generate(
      rooms,
      (index) => RoomRequest(
        adults: index == 0 ? adults : 2,
        childrenAges: index == 0 ? childrenAges : [],
      ),
    );

    final xmlRequest = WebBedsXmlBuilder.searchHotelsByIds(
      fromDate: checkIn,
      toDate: checkOut,
      hotelIds: hotelIds,
      rooms: roomRequests,
      currency: currency,
      nationality: nationality,
    );

    return _api.searchHotels(xmlRequest).map((xmlResponse) {
      return WebBedsXmlParser.parseSearchHotels(xmlResponse);
    });
  }

  /// Statik otel verisi indir (fiyatsız, cache için)
  /// noPrice=true ile çağrılır, otel adı, resim, adres gibi bilgileri döner
  TaskEither<ServerFailure, WebBedsSearchResponse> getStaticHotels({
    required int countryCode,
    int? cityCode,
  }) {
    final xmlRequest = WebBedsXmlBuilder.searchHotelsStatic(
      countryCode: countryCode,
      cityCode: cityCode,
    );

    return _api.searchHotels(xmlRequest).map((xmlResponse) {
      // Statik veri için ayrı parser kullan
      return WebBedsXmlParser.parseStaticHotels(xmlResponse);
    });
  }

  // ============================================================
  // GET ROOMS
  // ============================================================

  /// Otel oda detayları (fiyat ve iptal politikası)
  TaskEither<ServerFailure, WebBedsRoomsResponse> getRooms({
    required int hotelId,
    required DateTime checkIn,
    required DateTime checkOut,
    required int adults,
    int rooms = 1,
    List<int> childrenAges = const [],
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
  }) {
    final roomRequests = List.generate(
      rooms,
      (index) => RoomRequest(
        adults: index == 0 ? adults : 2,
        childrenAges: index == 0 ? childrenAges : [],
      ),
    );

    final xmlRequest = WebBedsXmlBuilder.getRoomsSimple(
      hotelId: hotelId,
      fromDate: checkIn,
      toDate: checkOut,
      rooms: roomRequests,
      currency: currency,
      nationality: nationality,
    );

    return _api.getRooms(xmlRequest).map((xmlResponse) {
      return WebBedsXmlParser.parseGetRooms(xmlResponse);
    });
  }

  /// Oda bloklama (pre-booking validation)
  TaskEither<ServerFailure, WebBedsRoomsResponse> blockRoom({
    required int hotelId,
    required DateTime checkIn,
    required DateTime checkOut,
    required List<RoomSelectionRequest> roomSelections,
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
  }) {
    final xmlRequest = WebBedsXmlBuilder.getRoomsWithBlocking(
      hotelId: hotelId,
      fromDate: checkIn,
      toDate: checkOut,
      roomSelections: roomSelections,
      currency: currency,
      nationality: nationality,
    );

    return _api.getRooms(xmlRequest).map((xmlResponse) {
      return WebBedsXmlParser.parseGetRooms(xmlResponse);
    });
  }

  // ============================================================
  // BOOKING
  // ============================================================

  /// Rezervasyon onayı
  TaskEither<ServerFailure, WebBedsBookingResponse> confirmBooking({
    required int hotelId,
    required DateTime checkIn,
    required DateTime checkOut,
    required List<BookingRoomRequest> bookingRooms,
    required String customerReference,
    int currency = WebBedsConfig.defaultCurrency,
  }) {
    final xmlRequest = WebBedsXmlBuilder.confirmBooking(
      hotelId: hotelId,
      fromDate: checkIn,
      toDate: checkOut,
      bookingRooms: bookingRooms,
      customerReference: customerReference,
      currency: currency,
    );

    // DEBUG: XML'i loglayalım
    print('=== CONFIRM BOOKING XML REQUEST ===');
    print(xmlRequest);
    print('=================================');

    return _api.confirmBooking(xmlRequest).map((xmlResponse) {
      return WebBedsXmlParser.parseConfirmBooking(xmlResponse);
    });
  }

  // ============================================================
  // CANCELLATION
  // ============================================================

  /// İptal ceza sorgulama
  TaskEither<ServerFailure, WebBedsCancelResponse> checkCancellation({
    required String bookingCode,
  }) {
    final xmlRequest = WebBedsXmlBuilder.cancelBookingCheck(
      bookingCode: bookingCode,
    );

    return _api.cancelBooking(xmlRequest).map((xmlResponse) {
      return WebBedsXmlParser.parseCancelBooking(xmlResponse);
    });
  }

  /// İptal onayı
  TaskEither<ServerFailure, WebBedsCancelResponse> confirmCancellation({
    required String bookingCode,
    required double penaltyAmount,
  }) {
    final xmlRequest = WebBedsXmlBuilder.cancelBookingConfirm(
      bookingCode: bookingCode,
      penaltyAmount: penaltyAmount,
    );

    return _api.cancelBooking(xmlRequest).map((xmlResponse) {
      return WebBedsXmlParser.parseCancelBooking(xmlResponse);
    });
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /// Hesap için geçerli currency kodlarını al
  TaskEither<ServerFailure, String> getCurrencies() {
    final xmlRequest = WebBedsXmlBuilder.getCurrencies();
    return _api.postXml(xmlBody: xmlRequest);
  }

  /// Tüm ülke kodlarını al
  TaskEither<ServerFailure, String> getAllCountries() {
    final xmlRequest = WebBedsXmlBuilder.getAllCountries();
    return _api.postXml(xmlBody: xmlRequest);
  }

  /// Tüm şehir kodlarını al
  TaskEither<ServerFailure, String> getAllCities({int? countryCode}) {
    final xmlRequest = WebBedsXmlBuilder.getAllCities(countryCode: countryCode);
    return _api.postXml(xmlBody: xmlRequest);
  }
}
