import 'webbeds_config.dart';

/// WebBeds XML Request Builder
/// 
/// Tüm API istekleri için XML şablonları oluşturur.
class WebBedsXmlBuilder {
  WebBedsXmlBuilder._();

  /// Tarih formatı: YYYY-MM-DD
  static String formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  // ============================================================
  // SEARCH HOTELS
  // ============================================================

  /// Şehir koduna göre otel ara (canlı fiyatlı)
  static String searchHotelsByCity({
    required DateTime fromDate,
    required DateTime toDate,
    required int cityCode,
    required List<RoomRequest> rooms,
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
    int countryOfResidence = WebBedsConfig.defaultCountryOfResidence,
  }) {
    final roomsXml = _buildRoomsXml(rooms, nationality, countryOfResidence);
    
    return '''
<request command="searchhotels">
    <bookingDetails>
        <fromDate>${formatDate(fromDate)}</fromDate>
        <toDate>${formatDate(toDate)}</toDate>
        <currency>$currency</currency>
        $roomsXml
    </bookingDetails>
    <return>
        <filters>
            <city>$cityCode</city>
        </filters>
        <fields>
            <field>hotelImages</field>
            <field>images</field>
        </fields>
    </return>
</request>''';
  }

  /// Otel ID listesine göre ara (performans için 50'şerli batch)
  static String searchHotelsByIds({
    required DateTime fromDate,
    required DateTime toDate,
    required List<int> hotelIds,
    required List<RoomRequest> rooms,
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
    int countryOfResidence = WebBedsConfig.defaultCountryOfResidence,
  }) {
    final roomsXml = _buildRoomsXml(rooms, nationality, countryOfResidence);
    final hotelIdsXml = hotelIds.map((id) => '<fieldValue>$id</fieldValue>').join('\n                            ');
    
    return '''
<request command="searchhotels">
    <bookingDetails>
        <fromDate>${formatDate(fromDate)}</fromDate>
        <toDate>${formatDate(toDate)}</toDate>
        <currency>$currency</currency>
        $roomsXml
    </bookingDetails>
    <return>
        <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
            <c:condition>
                <a:condition>
                    <fieldName>hotelId</fieldName>
                    <fieldTest>in</fieldTest>
                    <fieldValues>
                        $hotelIdsXml
                    </fieldValues>
                </a:condition>
            </c:condition>
        </filters>
        <fields>
            <field>hotelImages</field>
            <field>images</field>
        </fields>
    </return>
</request>''';
  }

  /// Statik veri indirme (fiyatsız, haftalık sync için)
  /// Dokümantasyon: bookingDetails gerekli - current date, 1 adult
  static String searchHotelsStatic({
    required int countryCode,
    int? cityCode,
    int currency = WebBedsConfig.defaultCurrency,
  }) {
    final filterXml = cityCode != null 
        ? '<city>$cityCode</city>' 
        : '<country>$countryCode</country>';
    
    // Statik veri için bugün ve yarın kullan
    final today = DateTime.now();
    final tomorrow = today.add(const Duration(days: 1));
    
    return '''
<request command="searchhotels">
    <bookingDetails>
        <fromDate>${formatDate(today)}</fromDate>
        <toDate>${formatDate(tomorrow)}</toDate>
        <currency>$currency</currency>
        <rooms no="1">
            <room runno="0">
                <adultsCode>1</adultsCode>
                <children no="0"></children>
                <rateBasis>-1</rateBasis>
            </room>
        </rooms>
    </bookingDetails>
    <return>
        <getRooms>true</getRooms>
        <filters>
            $filterXml
            <noPrice>true</noPrice>
        </filters>
        <fields>
            <field>hotelName</field>
            <field>address</field>
            <field>fullAddress</field>
            <field>rating</field>
            <field>hotelImages</field>
            <field>images</field>
            <field>description1</field>
            <field>description2</field>
            <field>geoPoint</field>
            <field>hotelPhone</field>
            <field>hotelCheckIn</field>
            <field>hotelCheckOut</field>
            <field>amenitie</field>
            <field>leisure</field>
            <field>business</field>
            <field>cityName</field>
            <field>cityCode</field>
            <field>countryName</field>
            <field>countryCode</field>
            <field>stateName</field>
            <field>minAge</field>
            <field>preferred</field>
            <field>chain</field>
            <field>leftToSell</field>
            <roomField>name</roomField>
            <roomField>roomInfo</roomField>
            <roomField>roomAmenities</roomField>
        </fields>
    </return>
</request>''';
  }

  // ============================================================
  // UTILITY METHODS - Currency & Country Codes
  // ============================================================

  /// Hesap için geçerli currency kodlarını al
  static String getCurrencies() {
    return '''
<request command="getcurrenciesaliases">
</request>''';
  }

  /// Tüm ülke kodlarını al
  static String getAllCountries() {
    return '''
<request command="getallcountries">
</request>''';
  }

  /// Tüm şehir kodlarını al (ülke bazlı)
  static String getAllCities({int? countryCode}) {
    final filter = countryCode != null 
        ? '<filter><country>$countryCode</country></filter>' 
        : '';
    return '''
<request command="getallcities">
    $filter
</request>''';
  }

  // ============================================================
  // GET ROOMS
  // ============================================================

  /// Otel oda detayları (simple - fiyat ve iptal politikası)
  static String getRoomsSimple({
    required int hotelId,
    required DateTime fromDate,
    required DateTime toDate,
    required List<RoomRequest> rooms,
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
    int countryOfResidence = WebBedsConfig.defaultCountryOfResidence,
  }) {
    final roomsXml = _buildRoomsXml(rooms, nationality, countryOfResidence);
    
    // XSD sırası: fromDate, toDate, currency -> rooms -> productId
    return '''
<request command="getrooms">
    <bookingDetails>
        <fromDate>${formatDate(fromDate)}</fromDate>
        <toDate>${formatDate(toDate)}</toDate>
        <currency>$currency</currency>
        $roomsXml
        <productId>$hotelId</productId>
    </bookingDetails>
</request>''';
  }

  /// Oda bloklama (pre-booking validation)
  static String getRoomsWithBlocking({
    required int hotelId,
    required DateTime fromDate,
    required DateTime toDate,
    required List<RoomSelectionRequest> roomSelections,
    int currency = WebBedsConfig.defaultCurrency,
    int nationality = WebBedsConfig.defaultNationality,
    int countryOfResidence = WebBedsConfig.defaultCountryOfResidence,
  }) {
    final roomsXml = _buildRoomsWithSelectionXml(roomSelections, nationality, countryOfResidence);
    
    // XSD sırası: fromDate, toDate, currency -> rooms -> productId
    return '''
<request command="getrooms">
    <bookingDetails>
        <fromDate>${formatDate(fromDate)}</fromDate>
        <toDate>${formatDate(toDate)}</toDate>
        <currency>$currency</currency>
        $roomsXml
        <productId>$hotelId</productId>
    </bookingDetails>
</request>''';
  }

  // ============================================================
  // CONFIRM BOOKING
  // ============================================================

  /// Rezervasyon onayı
  static String confirmBooking({
    required int hotelId,
    required DateTime fromDate,
    required DateTime toDate,
    required List<BookingRoomRequest> bookingRooms,
    required String customerReference,
    int currency = WebBedsConfig.defaultCurrency,
  }) {
    final roomsXml = _buildBookingRoomsXml(bookingRooms);
    
    // Dokümantasyon sırasına göre: fromDate, toDate, currency, productId, customerReference, rooms
    return '''<request command="confirmbooking">
    <bookingDetails>
        <fromDate>${formatDate(fromDate)}</fromDate>
        <toDate>${formatDate(toDate)}</toDate>
        <currency>$currency</currency>
        <productId>$hotelId</productId>
        <customerReference>$customerReference</customerReference>
$roomsXml    </bookingDetails>
</request>''';
  }

  // ============================================================
  // CANCEL BOOKING
  // ============================================================

  /// İptal ceza sorgulama (confirm=no)
  static String cancelBookingCheck({
    required String bookingCode,
  }) {
    return '''
<request command="cancelbooking">
    <bookingDetails>
        <bookingType>${WebBedsConfig.bookingTypeHotel}</bookingType>
        <bookingCode>$bookingCode</bookingCode>
        <confirm>no</confirm>
    </bookingDetails>
</request>''';
  }

  /// İptal onayı (confirm=yes)
  static String cancelBookingConfirm({
    required String bookingCode,
    required double penaltyAmount,
  }) {
    return '''
<request command="cancelbooking">
    <bookingDetails>
        <bookingType>${WebBedsConfig.bookingTypeHotel}</bookingType>
        <bookingCode>$bookingCode</bookingCode>
        <confirm>yes</confirm>
        <testPricesAndAllocation>
            <service referencenumber="$bookingCode">
                <penaltyApplied>$penaltyAmount</penaltyApplied>
            </service>
        </testPricesAndAllocation>
    </bookingDetails>
</request>''';
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  static String _buildRoomsXml(
    List<RoomRequest> rooms,
    int nationality,
    int countryOfResidence,
  ) {
    final buffer = StringBuffer();
    buffer.writeln('<rooms no="${rooms.length}">');
    
    for (int i = 0; i < rooms.length; i++) {
      final room = rooms[i];
      buffer.writeln('    <room runno="$i">');
      buffer.writeln('        <adultsCode>${room.adults}</adultsCode>');
      
      if (room.childrenAges.isEmpty) {
        buffer.writeln('        <children no="0"></children>');
      } else {
        buffer.writeln('        <children no="${room.childrenAges.length}">');
        for (int j = 0; j < room.childrenAges.length; j++) {
          buffer.writeln('            <child runno="$j">${room.childrenAges[j]}</child>');
        }
        buffer.writeln('        </children>');
      }
      
      buffer.writeln('        <rateBasis>-1</rateBasis>');
      buffer.writeln('        <passengerNationality>$nationality</passengerNationality>');
      buffer.writeln('        <passengerCountryOfResidence>$countryOfResidence</passengerCountryOfResidence>');
      buffer.writeln('    </room>');
    }
    
    buffer.writeln('</rooms>');
    return buffer.toString();
  }

  static String _buildRoomsWithSelectionXml(
    List<RoomSelectionRequest> rooms,
    int nationality,
    int countryOfResidence,
  ) {
    final buffer = StringBuffer();
    buffer.writeln('<rooms no="${rooms.length}">');
    
    for (int i = 0; i < rooms.length; i++) {
      final room = rooms[i];
      buffer.writeln('    <room runno="$i">');
      buffer.writeln('        <adultsCode>${room.adults}</adultsCode>');
      
      if (room.childrenAges.isEmpty) {
        buffer.writeln('        <children no="0"></children>');
      } else {
        buffer.writeln('        <children no="${room.childrenAges.length}">');
        for (int j = 0; j < room.childrenAges.length; j++) {
          buffer.writeln('            <child runno="$j">${room.childrenAges[j]}</child>');
        }
        buffer.writeln('        </children>');
      }
      
      buffer.writeln('        <rateBasis>-1</rateBasis>');
      buffer.writeln('        <passengerNationality>$nationality</passengerNationality>');
      buffer.writeln('        <passengerCountryOfResidence>$countryOfResidence</passengerCountryOfResidence>');
      buffer.writeln('        <roomTypeSelected>');
      buffer.writeln('            <code>${room.roomTypeCode}</code>');
      buffer.writeln('            <selectedRateBasis>${room.selectedRateBasis}</selectedRateBasis>');
      buffer.writeln('            <allocationDetails>${room.allocationDetails}</allocationDetails>');
      buffer.writeln('        </roomTypeSelected>');
      buffer.writeln('    </room>');
    }
    
    buffer.writeln('</rooms>');
    return buffer.toString();
  }

  static String _buildBookingRoomsXml(List<BookingRoomRequest> rooms) {
    final buffer = StringBuffer();
    buffer.writeln('        <rooms no="${rooms.length}">');
    
    for (int i = 0; i < rooms.length; i++) {
      final room = rooms[i];
      buffer.writeln('            <room runno="$i">');
      
      // XSD sırasına göre elementler:
      // 1. roomTypeCode
      buffer.writeln('                <roomTypeCode>${room.roomTypeCode}</roomTypeCode>');
      // 2. selectedRateBasis
      buffer.writeln('                <selectedRateBasis>${room.selectedRateBasis}</selectedRateBasis>');
      // 3. allocationDetails
      buffer.writeln('                <allocationDetails>${room.allocationDetails}</allocationDetails>');
      // 4. adultsCode
      buffer.writeln('                <adultsCode>${room.adultsCode}</adultsCode>');
      // 5. actualAdults
      buffer.writeln('                <actualAdults>${room.actualAdults}</actualAdults>');
      // 6. children
      buffer.writeln('                <children no="${room.childrenAges.length}">');
      for (int j = 0; j < room.childrenAges.length; j++) {
        buffer.writeln('                    <child runno="$j">${room.childrenAges[j]}</child>');
      }
      buffer.writeln('                </children>');
      // 7. actualChildren
      buffer.writeln('                <actualChildren no="${room.actualChildrenAges.length}">');
      for (int j = 0; j < room.actualChildrenAges.length; j++) {
        buffer.writeln('                    <actualChild runno="$j">${room.actualChildrenAges[j]}</actualChild>');
      }
      buffer.writeln('                </actualChildren>');
      // 8. extraBed
      buffer.writeln('                <extraBed>${room.extraBed}</extraBed>');
      // 9. passengerNationality
      buffer.writeln('                <passengerNationality>${room.nationality}</passengerNationality>');
      // 10. passengerCountryOfResidence
      buffer.writeln('                <passengerCountryOfResidence>${room.countryOfResidence}</passengerCountryOfResidence>');
      // 11. passengersDetails - en az bir leading passenger olmalı
      buffer.writeln('                <passengersDetails>');
      for (final passenger in room.passengers) {
        final leading = passenger.isLeading ? 'yes' : 'no';
        buffer.writeln('                    <passenger leading="$leading">');
        buffer.writeln('                        <salutation>${passenger.salutation}</salutation>');
        buffer.writeln('                        <firstName>${_sanitizeName(passenger.firstName)}</firstName>');
        buffer.writeln('                        <lastName>${_sanitizeName(passenger.lastName)}</lastName>');
        buffer.writeln('                    </passenger>');
      }
      buffer.writeln('                </passengersDetails>');
      // 12. specialRequests - SADECE sayısal kodlar kabul edilir (nonNegativeInteger)
      // getspecialrequestsids API'sinden alınan kodlar kullanılmalı
      // Şimdilik boş gönderiyoruz - special request özelliği henüz implement edilmedi
      buffer.writeln('                <specialRequests count="0"/>');
      // 13. beddingPreference (optional)
      if (room.beddingPreference != null) {
        buffer.writeln('                <beddingPreference>${room.beddingPreference}</beddingPreference>');
      }
      
      buffer.writeln('            </room>');
    }
    
    buffer.writeln('        </rooms>');
    return buffer.toString();
  }
  
  /// İsim sanitize - özel karakterleri ve boşlukları temizle
  /// WebBeds kuralları: min 2, max 25 karakter, boşluk ve özel karakter yasak
  static String _sanitizeName(String name) {
    // Boşlukları kaldır, özel karakterleri temizle
    String sanitized = name.replaceAll(RegExp(r'[^a-zA-ZğüşöçıİĞÜŞÖÇ]'), '');
    // Min 2, max 25 karakter
    if (sanitized.length < 2) {
      sanitized = sanitized.padRight(2, 'X');
    }
    if (sanitized.length > 25) {
      sanitized = sanitized.substring(0, 25);
    }
    return sanitized;
  }
}

// ============================================================
// REQUEST MODELS
// ============================================================

/// Oda arama isteği için basit model
class RoomRequest {
  final int adults;
  final List<int> childrenAges;

  RoomRequest({
    required this.adults,
    this.childrenAges = const [],
  });
}

/// Oda seçimi için model (bloklama adımı)
class RoomSelectionRequest {
  final int adults;
  final List<int> childrenAges;
  final String roomTypeCode;
  final String selectedRateBasis;
  final String allocationDetails;

  RoomSelectionRequest({
    required this.adults,
    this.childrenAges = const [],
    required this.roomTypeCode,
    required this.selectedRateBasis,
    required this.allocationDetails,
  });
}

/// Rezervasyon onayı için oda modeli
class BookingRoomRequest {
  final String roomTypeCode;
  final String selectedRateBasis;
  final String allocationDetails;
  final int adultsCode; // API'nin beklediği adult kodu
  final int actualAdults; // Gerçek yetişkin sayısı
  final List<int> childrenAges;
  final List<int> actualChildrenAges;
  final int extraBed;
  final int nationality;
  final int countryOfResidence;
  final List<PassengerInfo> passengers;
  final List<String> specialRequests;
  final int? beddingPreference;

  BookingRoomRequest({
    required this.roomTypeCode,
    required this.selectedRateBasis,
    required this.allocationDetails,
    required this.adultsCode,
    required this.actualAdults,
    this.childrenAges = const [],
    this.actualChildrenAges = const [],
    this.extraBed = 0,
    this.nationality = WebBedsConfig.defaultNationality,
    this.countryOfResidence = WebBedsConfig.defaultCountryOfResidence,
    required this.passengers,
    this.specialRequests = const [],
    this.beddingPreference,
  });
}

/// Yolcu bilgileri
class PassengerInfo {
  final bool isLeading;
  final int salutation;
  final String firstName;
  final String lastName;

  PassengerInfo({
    required this.isLeading,
    required this.salutation,
    required this.firstName,
    required this.lastName,
  });
}
