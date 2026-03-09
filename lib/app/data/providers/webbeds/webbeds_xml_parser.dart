import 'package:xml/xml.dart';

import '../../models/webbeds/webbeds_models.dart';

/// WebBeds XML Response Parser
/// 
/// API yanıtlarını Dart modellerine çevirir.
class WebBedsXmlParser {
  WebBedsXmlParser._();

  // ============================================================
  // SEARCH HOTELS RESPONSE (Dinamik - fiyatlı)
  // ============================================================

  /// Search hotels yanıtını parse et (dinamik arama - sadece hotelId ve fiyat döner)
  static WebBedsSearchResponse parseSearchHotels(String xmlString) {
    try {
      final document = XmlDocument.parse(xmlString);
      final result = document.findAllElements('result').firstOrNull;
      
      if (result == null) {
        print('[WebBedsParser] result element bulunamadı');
        return WebBedsSearchResponse(
          success: false,
          errorMessage: 'Geçersiz yanıt formatı',
          hotels: [],
        );
      }

      // Error kontrolü
      final errorElement = result.findElements('error').firstOrNull;
      if (errorElement != null) {
        final errorDetails = errorElement.findElements('details').firstOrNull?.innerText ?? errorElement.innerText;
        print('[WebBedsParser] API Error: $errorDetails');
        return WebBedsSearchResponse(
          success: false,
          errorMessage: errorDetails,
          hotels: [],
        );
      }

      // Success kontrolü
      final successCode = result.findElements('successful').firstOrNull?.innerText;
      if (successCode == 'FALSE') {
        final msg = result.findElements('message').firstOrNull?.innerText ?? 'İşlem başarısız';
        print('[WebBedsParser] Success FALSE: $msg');
        return WebBedsSearchResponse(
          success: false,
          errorMessage: msg,
          hotels: [],
        );
      }

      // Hotels parse - V4'te <hotels> içinde <hotel hotelid="..."> şeklinde
      final hotels = <WebBedsHotel>[];
      final hotelsElement = result.findElements('hotels').firstOrNull;
      
      if (hotelsElement == null) {
        print('[WebBedsParser] hotels element bulunamadı');
        return WebBedsSearchResponse(
          success: true,
          hotels: [],
        );
      }
      
      final hotelElements = hotelsElement.findElements('hotel');
      print('[WebBedsParser] Bulunan otel sayısı: ${hotelElements.length}');

      for (final hotelEl in hotelElements) {
        try {
          final hotel = _parseSearchHotel(hotelEl);
          print('[WebBedsParser] Hotel parsed: id=${hotel.hotelId}, minPrice=${hotel.minPrice}, currency=${hotel.currency}');
          hotels.add(hotel);
        } catch (e) {
          print('[WebBedsParser] Hotel parse error: $e');
        }
      }

      print('[WebBedsParser] Toplam parse edilen otel: ${hotels.length}');

      return WebBedsSearchResponse(
        success: true,
        hotels: hotels,
      );
    } catch (e) {
      print('[WebBedsParser] XML parse hatası: $e');
      return WebBedsSearchResponse(
        success: false,
        errorMessage: 'XML parse hatası: $e',
        hotels: [],
      );
    }
  }

  /// searchhotels yanıtındaki hotel elementini parse et
  /// NOT: searchhotels yanıtı sadece hotelid attribute ve oda/fiyat bilgisi içerir
  /// Otel adı, resim, adres için getHotelInfo çağrılmalı
  static WebBedsHotel _parseSearchHotel(XmlElement hotelEl) {
    // hotelid attribute olarak geliyor
    final hotelId = int.tryParse(hotelEl.getAttribute('hotelid') ?? '') ?? 0;
    
    // searchhotels yanıtında bu alanlar yok, ama rooms içinde fiyat var
    double? minPrice;
    String currency = 'EUR';
    String boardType = '';
    
    // En düşük fiyatı bul
    final roomTypes = hotelEl.findAllElements('roomType');
    for (final rt in roomTypes) {
      final rateBases = rt.findAllElements('rateBasis');
      for (final rb in rateBases) {
        final total = double.tryParse(_getElementText(rb, 'total') ?? '');
        if (total != null && (minPrice == null || total < minPrice)) {
          minPrice = total;
          // rateBasis id'sinden board type belirle
          final rbId = rb.getAttribute('id') ?? '';
          boardType = _rateBasisIdToBoardType(rbId);
          // Currency
          final rateType = rb.findElements('rateType').firstOrNull;
          if (rateType != null) {
            final currencyId = rateType.getAttribute('currencyid') ?? '';
            currency = _currencyIdToCode(currencyId);
          }
        }
      }
    }
    
    // Oda isimleri
    final roomNames = <String>[];
    for (final rt in roomTypes) {
      final name = _getElementText(rt, 'name');
      if (name != null && name.isNotEmpty && !roomNames.contains(name)) {
        roomNames.add(name);
      }
    }

    return WebBedsHotel(
      hotelId: hotelId,
      name: 'Otel #$hotelId', // Geçici isim - getHotelInfo ile güncellenecek
      address: '',
      fullAddress: '',
      rating: 0,
      phone: '',
      cityName: '',
      cityCode: 0,
      countryName: '',
      countryCode: 0,
      stateName: '',
      description: roomNames.isNotEmpty ? 'Oda: ${roomNames.first}' : '',
      description2: '',
      latitude: null,
      longitude: null,
      images: [],
      amenities: [],
      minPrice: minPrice,
      currency: currency,
      boardType: boardType,
      preferred: false,
      checkInTime: '',
      checkOutTime: '',
      minAge: 0,
      chain: '',
      leftToSell: 0,
      rooms: [],
    );
  }

  // ============================================================
  // STATIC DATA RESPONSE (noPrice=true)
  // ============================================================

  /// Statik otel verisi parse et (noPrice=true ile çağrılan searchhotels)
  /// Bu yanıt otel adı, adres, resim, rating gibi tam bilgiler içerir
  static WebBedsSearchResponse parseStaticHotels(String xmlString) {
    try {
      final document = XmlDocument.parse(xmlString);
      final result = document.findAllElements('result').firstOrNull;
      
      if (result == null) {
        print('[WebBedsParser-Static] result element bulunamadı');
        return WebBedsSearchResponse(
          success: false,
          errorMessage: 'Geçersiz yanıt formatı',
          hotels: [],
        );
      }

      // Error kontrolü
      final errorElement = result.findElements('error').firstOrNull;
      if (errorElement != null) {
        final errorDetails = errorElement.findElements('details').firstOrNull?.innerText ?? errorElement.innerText;
        print('[WebBedsParser-Static] API Error: $errorDetails');
        return WebBedsSearchResponse(
          success: false,
          errorMessage: errorDetails,
          hotels: [],
        );
      }

      // Hotels parse
      final hotels = <WebBedsHotel>[];
      final hotelsElement = result.findElements('hotels').firstOrNull;
      
      if (hotelsElement == null) {
        print('[WebBedsParser-Static] hotels element bulunamadı');
        return WebBedsSearchResponse(success: true, hotels: []);
      }
      
      final hotelElements = hotelsElement.findElements('hotel');
      print('[WebBedsParser-Static] Bulunan otel sayısı: ${hotelElements.length}');

      for (final hotelEl in hotelElements) {
        try {
          final hotel = _parseStaticHotel(hotelEl);
          if (hotel.hotelId > 0) {
            hotels.add(hotel);
          }
        } catch (e) {
          print('[WebBedsParser-Static] Hotel parse error: $e');
        }
      }

      print('[WebBedsParser-Static] Toplam parse edilen otel: ${hotels.length}');

      return WebBedsSearchResponse(
        success: true,
        hotels: hotels,
      );
    } catch (e) {
      print('[WebBedsParser-Static] XML parse hatası: $e');
      return WebBedsSearchResponse(
        success: false,
        errorMessage: 'XML parse hatası: $e',
        hotels: [],
      );
    }
  }

  /// Statik veri yanıtındaki otel elementini parse et
  /// hotelid attribute olarak, diğer alanlar element olarak gelir
  static WebBedsHotel _parseStaticHotel(XmlElement hotelEl) {
    // hotelid attribute olarak geliyor
    final hotelId = int.tryParse(hotelEl.getAttribute('hotelid') ?? '') ?? 0;
    
    // Statik alanlar element olarak
    final name = _getElementText(hotelEl, 'hotelName') ?? 'Otel #$hotelId';
    final address = _getElementText(hotelEl, 'address') ?? '';
    final fullAddress = _getElementText(hotelEl, 'fullAddress') ?? address;
    final ratingStr = _getElementText(hotelEl, 'rating') ?? '';
    final rating = _parseRating(ratingStr);
    final phone = _getElementText(hotelEl, 'hotelPhone') ?? '';
    final cityName = _getElementText(hotelEl, 'cityName') ?? '';
    final cityCode = int.tryParse(_getElementText(hotelEl, 'cityCode') ?? '') ?? 0;
    final countryName = _getElementText(hotelEl, 'countryName') ?? '';
    final countryCode = int.tryParse(_getElementText(hotelEl, 'countryCode') ?? '') ?? 0;
    final stateName = _getElementText(hotelEl, 'stateName') ?? '';
    final description = _getElementText(hotelEl, 'description1') ?? '';
    final description2 = _getElementText(hotelEl, 'description2') ?? '';
    final preferred = _getElementText(hotelEl, 'preferred') == 'yes';
    final checkInTime = _getElementText(hotelEl, 'hotelCheckIn') ?? '';
    final checkOutTime = _getElementText(hotelEl, 'hotelCheckOut') ?? '';
    final minAge = int.tryParse(_getElementText(hotelEl, 'minAge') ?? '') ?? 0;
    final chain = _getElementText(hotelEl, 'chain') ?? '';
    final leftToSell = int.tryParse(_getElementText(hotelEl, 'leftToSell') ?? '') ?? 0;

    // Geo point
    double? latitude;
    double? longitude;
    final geoPointEl = hotelEl.findElements('geoPoint').firstOrNull;
    if (geoPointEl != null) {
      latitude = double.tryParse(_getElementText(geoPointEl, 'lat') ?? '');
      longitude = double.tryParse(_getElementText(geoPointEl, 'long') ?? '');
    }

    // Images - hotelImages element içinde
    final images = <String>[];
    final imagesEl = hotelEl.findElements('hotelImages').firstOrNull;
    if (imagesEl != null) {
      for (final imgEl in imagesEl.findElements('image')) {
        final url = imgEl.getAttribute('url') ?? _getElementText(imgEl, 'url') ?? imgEl.innerText;
        if (url.isNotEmpty && url.startsWith('http')) {
          images.add(url);
        }
      }
    }
    // Alternatif: images element
    if (images.isEmpty) {
      final imagesEl2 = hotelEl.findElements('images').firstOrNull;
      if (imagesEl2 != null) {
        for (final imgEl in imagesEl2.findElements('image')) {
          final url = imgEl.getAttribute('url') ?? _getElementText(imgEl, 'url') ?? imgEl.innerText;
          if (url.isNotEmpty && url.startsWith('http')) {
            images.add(url);
          }
        }
      }
    }

    // Amenities
    final amenities = <String>[];
    for (final amenityTag in ['amenitie', 'leisure', 'business']) {
      final amenitiesEl = hotelEl.findElements(amenityTag).firstOrNull;
      if (amenitiesEl != null) {
        for (final amenity in amenitiesEl.findElements('amenity')) {
          final amenityName = _getElementText(amenity, 'name') ?? amenity.innerText;
          if (amenityName.isNotEmpty && !amenities.contains(amenityName)) {
            amenities.add(amenityName);
          }
        }
      }
    }

    // Rooms (statik data için)
    final rooms = <WebBedsRoomInfo>[];
    final roomsEl = hotelEl.findElements('rooms').firstOrNull;
    if (roomsEl != null) {
      for (final roomEl in roomsEl.findElements('room')) {
        rooms.add(_parseRoomInfo(roomEl));
      }
    }

    return WebBedsHotel(
      hotelId: hotelId,
      name: name,
      address: address,
      fullAddress: fullAddress,
      rating: rating,
      phone: phone,
      cityName: cityName,
      cityCode: cityCode,
      countryName: countryName,
      countryCode: countryCode,
      stateName: stateName,
      description: description,
      description2: description2,
      latitude: latitude,
      longitude: longitude,
      images: images,
      amenities: amenities,
      minPrice: null, // Statik veride fiyat yok
      currency: 'EUR',
      boardType: '',
      preferred: preferred,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      minAge: minAge,
      chain: chain,
      leftToSell: leftToSell,
      rooms: rooms,
    );
  }

  /// Rating string'ini double'a çevir (yıldız rating kodları için)
  static double _parseRating(String ratingStr) {
    // DOTW rating kodları: 48057=5 star, 48056=4 star, vb.
    final ratingInt = int.tryParse(ratingStr) ?? 0;
    if (ratingInt >= 48050 && ratingInt <= 48060) {
      // 48057 = 5 star, 48056 = 4 star, ...
      return (ratingInt - 48052).toDouble().clamp(0, 5);
    }
    // Doğrudan sayı ise
    final direct = double.tryParse(ratingStr) ?? 0.0;
    return direct.clamp(0, 5);
  }
  
  /// rateBasis ID'den board type belirle
  static String _rateBasisIdToBoardType(String rbId) {
    switch (rbId) {
      case '0': return 'RO'; // Room Only
      case '1331': return 'BB'; // Bed & Breakfast
      case '1334': return 'HB'; // Half Board
      case '1335': return 'FB'; // Full Board
      case '1336': return 'AI'; // All Inclusive
      default: return rbId.isNotEmpty ? 'RO' : '';
    }
  }
  
  /// Currency ID'den currency code belirle
  static String _currencyIdToCode(String currencyId) {
    switch (currencyId) {
      case '413': return 'EUR';
      case '416': return 'GBP';
      case '520': return 'USD';
      default: return 'EUR';
    }
  }

  static WebBedsRoomInfo _parseRoomInfo(XmlElement roomEl) {
    return WebBedsRoomInfo(
      name: _getElementText(roomEl, 'name') ?? '',
      roomInfo: _getElementText(roomEl, 'roomInfo') ?? '',
      roomAmenities: _getElementText(roomEl, 'roomAmenities') ?? '',
      twin: _getElementText(roomEl, 'twin') == 'yes',
    );
  }

  // ============================================================
  // GET ROOMS RESPONSE
  // ============================================================

  /// Get rooms yanıtını parse et (V4 Format)
  /// 
  /// V4 yanıt yapısı:
  /// <result> -> <hotel> -> <rooms> -> <room> -> <roomType> -> <rateBases> -> <rateBasis>
  static WebBedsRoomsResponse parseGetRooms(String xmlString) {
    try {
      print('[WebBedsParser] parseGetRooms başladı');
      print('[WebBedsParser] XML uzunluk: ${xmlString.length}');
      
      // Debug: XML'in ilk 1500 karakterini göster
      print('[WebBedsParser] XML başlangıç: ${xmlString.substring(0, xmlString.length > 1500 ? 1500 : xmlString.length)}');
      
      final document = XmlDocument.parse(xmlString);
      final result = document.findAllElements('result').firstOrNull;
      
      if (result == null) {
        print('[WebBedsParser] ERROR: result elementi bulunamadı');
        return WebBedsRoomsResponse(
          success: false,
          errorMessage: 'Geçersiz yanıt formatı',
          roomTypes: [],
        );
      }
      
      print('[WebBedsParser] result elementi bulundu');

      // Error kontrolü - request/error altında olabilir
      final requestEl = result.findElements('request').firstOrNull;
      if (requestEl != null) {
        final errorElement = requestEl.findElements('error').firstOrNull;
        if (errorElement != null) {
          final errorCode = _getElementText(errorElement, 'code') ?? '';
          final errorDetails = _getElementText(errorElement, 'details') ?? errorElement.innerText;
          print('[WebBedsParser] API Error Code: $errorCode, Details: $errorDetails');
          return WebBedsRoomsResponse(
            success: false,
            errorMessage: errorDetails,
            roomTypes: [],
          );
        }
      }

      // V4 format: hotel elementi altında bilgiler var
      final hotelEl = result.findElements('hotel').firstOrNull;
      if (hotelEl == null) {
        print('[WebBedsParser] ERROR: hotel elementi bulunamadı');
        return WebBedsRoomsResponse(
          success: false,
          errorMessage: 'Hotel bilgisi bulunamadı',
          roomTypes: [],
        );
      }
      
      // Hotel info - V4'te attribute olarak geliyor
      final hotelId = int.tryParse(hotelEl.getAttribute('id') ?? '') ?? 0;
      final hotelName = hotelEl.getAttribute('name') ?? '';
      print('[WebBedsParser] V4 hotelId: $hotelId, hotelName: $hotelName');

      // allowBook kontrolü
      final allowBook = _getElementText(hotelEl, 'allowBook');
      print('[WebBedsParser] allowBook: $allowBook');
      if (allowBook == 'no') {
        return WebBedsRoomsResponse(
          success: false,
          errorMessage: 'Bu otel için rezervasyon yapılamıyor',
          roomTypes: [],
        );
      }
      
      // Tariff notes
      final tariffNotes = _getElementText(hotelEl, 'tariffNotes') ?? '';
      
      // Min stay
      final minStay = int.tryParse(_getElementText(hotelEl, 'minStay') ?? '') ?? 0;

      // V4 Format: hotel -> rooms -> room -> roomType
      final roomTypes = <WebBedsRoomType>[];
      final roomsEl = hotelEl.findElements('rooms').firstOrNull;
      
      if (roomsEl != null) {
        print('[WebBedsParser] rooms elementi bulundu');
        
        // Her room elementi için
        for (final roomEl in roomsEl.findElements('room')) {
          final roomRunNo = roomEl.getAttribute('runno') ?? '0';
          print('[WebBedsParser] Processing room runno: $roomRunNo');
          
          // room içindeki roomType elementlerini al
          for (final rtEl in roomEl.findElements('roomType')) {
            try {
              final rt = _parseRoomTypeV4(rtEl);
              roomTypes.add(rt);
              print('[WebBedsParser] RoomType parsed: ${rt.code} - ${rt.name}');
            } catch (e) {
              print('[WebBedsParser] RoomType parse error: $e');
            }
          }
        }
      } else {
        print('[WebBedsParser] WARNING: rooms elementi bulunamadı');
      }
      
      print('[WebBedsParser] Toplam roomType sayısı: ${roomTypes.length}');

      return WebBedsRoomsResponse(
        success: true,
        hotelId: hotelId,
        hotelName: hotelName,
        tariffNotes: tariffNotes,
        minStay: minStay,
        roomTypes: roomTypes,
      );
    } catch (e, stackTrace) {
      print('[WebBedsParser] XML parse exception: $e');
      print('[WebBedsParser] StackTrace: $stackTrace');
      return WebBedsRoomsResponse(
        success: false,
        errorMessage: 'XML parse hatası: $e',
        roomTypes: [],
      );
    }
  }
  
  /// V4 formatında roomType parse et
  /// roomtypecode attribute olarak geliyor
  static WebBedsRoomType _parseRoomTypeV4(XmlElement rtEl) {
    // V4'te code "roomtypecode" attribute olarak geliyor
    final code = rtEl.getAttribute('roomtypecode') ?? _getElementText(rtEl, 'code') ?? '';
    final name = _getElementText(rtEl, 'name') ?? '';
    
    // roomInfo elementi altında - null olabilir
    final roomInfoEl = rtEl.findElements('roomInfo').firstOrNull;
    int maxOccupancy = 2;
    int maxAdults = 2;
    int maxChildren = 0;
    
    if (roomInfoEl != null) {
      maxOccupancy = int.tryParse(_getElementText(roomInfoEl, 'maxOccupancy') ?? '') ?? 2;
      maxAdults = int.tryParse(_getElementText(roomInfoEl, 'maxAdults') ?? '') ?? 2;
      maxChildren = int.tryParse(_getElementText(roomInfoEl, 'maxChildren') ?? '') ?? 0;
    }
    
    final description = _getElementText(rtEl, 'description') ?? '';
    final leftToSell = int.tryParse(_getElementText(rtEl, 'leftToSell') ?? '') ?? 0;

    print('[WebBedsParser] RoomType V4 parse: code=$code, name=$name, maxAdults=$maxAdults');

    // V4'te rateBases elementi altında rateBasis elementleri var
    final rates = <WebBedsRate>[];
    final ratesEl = rtEl.findElements('rateBases').firstOrNull;
    
    if (ratesEl != null) {
      for (final rateEl in ratesEl.findElements('rateBasis')) {
        rates.add(_parseRateV4(rateEl));
      }
      print('[WebBedsParser] Rate sayısı: ${rates.length}');
    } else {
      print('[WebBedsParser] WARNING: rateBases elementi bulunamadı');
    }

    return WebBedsRoomType(
      code: code,
      name: name,
      description: description,
      maxOccupancy: maxOccupancy,
      maxAdults: maxAdults,
      maxChildren: maxChildren,
      leftToSell: leftToSell,
      rates: rates,
    );
  }
  
  /// V4 formatında rateBasis parse et
  static WebBedsRate _parseRateV4(XmlElement rateEl) {
    // V4'te id ve description attribute olarak geliyor
    final id = rateEl.getAttribute('id') ?? _getElementText(rateEl, 'id') ?? '';
    final name = rateEl.getAttribute('description') ?? _getElementText(rateEl, 'name') ?? '';
    
    // Price: total elementi altında, veya direkt text
    final totalEl = rateEl.findElements('total').firstOrNull;
    double price = 0.0;
    if (totalEl != null) {
      // İç text fiyat olabilir veya formatted elementi olabilir
      final formattedPrice = _getElementText(totalEl, 'formatted');
      final rawPrice = formattedPrice ?? totalEl.innerText.trim();
      // Sayısal olmayan karakterleri temizle
      final cleanPrice = rawPrice.replaceAll(RegExp(r'[^\d.]'), '');
      price = double.tryParse(cleanPrice) ?? 0.0;
    }
    
    // Currency - rateType elementinden veya currencyShort'tan
    final rateTypeEl = rateEl.findElements('rateType').firstOrNull;
    final currency = rateTypeEl?.getAttribute('currencyshort') ?? 
                     _getElementText(rateEl, 'currency') ?? 'USD';
    
    // allocationDetails - blocking için gerekli
    final allocationDetails = _getElementText(rateEl, 'allocationDetails') ?? '';
    
    // Non-refundable kontrolü
    final nonRefundable = rateTypeEl?.getAttribute('nonrefundable') == 'yes' ||
                          _getElementText(rateEl, 'nonRefundable') == 'yes';
    
    // Minimum selling price
    final mspEl = rateEl.findElements('totalMinimumSelling').firstOrNull;
    double? minimumSellingPrice;
    if (mspEl != null) {
      final mspText = mspEl.innerText.replaceAll(RegExp(r'[^\d.]'), '');
      minimumSellingPrice = double.tryParse(mspText);
    }
    
    // Status (blocking durumunda önemli)
    final status = _getElementText(rateEl, 'status') ?? '';

    print('[WebBedsParser] Rate V4 parse: id=$id, name=$name, price=$price, currency=$currency');

    // Cancellation policy
    CancellationPolicy? cancellationPolicy;
    final cancelEl = rateEl.findElements('cancellationRules').firstOrNull;
    if (cancelEl != null) {
      cancellationPolicy = _parseCancellationPolicyV4(cancelEl);
    }

    // Specials (promosyonlar)
    final specials = <String>[];
    final specialsEl = rateEl.findElements('specials').firstOrNull;
    if (specialsEl != null) {
      for (final special in specialsEl.findElements('special')) {
        final desc = _getElementText(special, 'description') ?? special.innerText;
        if (desc.isNotEmpty) {
          specials.add(desc);
        }
      }
    }

    return WebBedsRate(
      id: id,
      name: name,
      price: price,
      currency: currency,
      allocationDetails: allocationDetails,
      nonRefundable: nonRefundable,
      minimumSellingPrice: minimumSellingPrice,
      cancellationPolicy: cancellationPolicy,
      specials: specials,
      status: status,
    );
  }
  
  /// V4 formatında cancellation rules parse et
  static CancellationPolicy _parseCancellationPolicyV4(XmlElement cancelEl) {
    final deadlines = <CancellationDeadline>[];
    
    for (final ruleEl in cancelEl.findElements('rule')) {
      final fromDate = _getElementText(ruleEl, 'fromDate') ?? '';
      final toDate = _getElementText(ruleEl, 'toDate') ?? '';
      
      // Cancel charge
      final chargeEl = ruleEl.findElements('cancelCharge').firstOrNull;
      double charge = 0.0;
      String chargeType = 'amount';
      if (chargeEl != null) {
        final chargeText = chargeEl.innerText.replaceAll(RegExp(r'[^\d.]'), '');
        charge = double.tryParse(chargeText) ?? 0.0;
        // Yüzde mi amount mı kontrol et
        if (chargeEl.innerText.contains('%')) {
          chargeType = 'percent';
        }
      }
      
      deadlines.add(CancellationDeadline(
        fromDate: fromDate,
        toDate: toDate,
        charge: charge,
        chargeType: chargeType,
      ));
    }
    
    return CancellationPolicy(deadlines: deadlines);
  }

  // ============================================================
  // CONFIRM BOOKING RESPONSE
  // ============================================================

  /// Confirm booking yanıtını parse et
  static WebBedsBookingResponse parseConfirmBooking(String xmlString) {
    try {
      // DEBUG: Ham yanıtı logla
      print('=== CONFIRM BOOKING XML RESPONSE ===');
      print(xmlString);
      print('====================================');
      
      final document = XmlDocument.parse(xmlString);
      final result = document.findAllElements('result').firstOrNull;
      
      if (result == null) {
        return WebBedsBookingResponse(
          success: false,
          errorMessage: 'Geçersiz yanıt formatı',
        );
      }

      // Error kontrolü - attribute'ları da al
      final errorElement = result.findElements('error').firstOrNull;
      if (errorElement != null) {
        final errorCode = errorElement.getAttribute('code') ?? '';
        final errorText = errorElement.innerText;
        print('=== WEBBEDS ERROR ===');
        print('Code: $errorCode');
        print('Message: $errorText');
        print('=====================');
        return WebBedsBookingResponse(
          success: false,
          errorMessage: 'Hata $errorCode: $errorText',
        );
      }

      // Success kontrolü
      final successCode = result.findElements('successful').firstOrNull?.innerText;
      if (successCode != 'TRUE') {
        final msg = result.findElements('message').firstOrNull?.innerText ?? 'Rezervasyon başarısız';
        return WebBedsBookingResponse(
          success: false,
          errorMessage: msg,
        );
      }

      // Booking details
      final bookingCode = _getElementText(result, 'bookingCode') ?? '';
      final paymentGuaranteedBy = _getElementText(result, 'paymentGuaranteedBy') ?? '';
      final totalPrice = double.tryParse(_getElementText(result, 'totalPrice') ?? '') ?? 0.0;
      final currency = _getElementText(result, 'currency') ?? 'USD';
      final bookingStatus = _getElementText(result, 'bookingStatus') ?? '';

      return WebBedsBookingResponse(
        success: true,
        bookingCode: bookingCode,
        paymentGuaranteedBy: paymentGuaranteedBy,
        totalPrice: totalPrice,
        currency: currency,
        bookingStatus: bookingStatus,
      );
    } catch (e) {
      return WebBedsBookingResponse(
        success: false,
        errorMessage: 'XML parse hatası: $e',
      );
    }
  }

  // ============================================================
  // CANCEL BOOKING RESPONSE
  // ============================================================

  /// Cancel booking yanıtını parse et
  static WebBedsCancelResponse parseCancelBooking(String xmlString) {
    try {
      final document = XmlDocument.parse(xmlString);
      final result = document.findAllElements('result').firstOrNull;
      
      if (result == null) {
        return WebBedsCancelResponse(
          success: false,
          errorMessage: 'Geçersiz yanıt formatı',
        );
      }

      // Error kontrolü
      final errorElement = result.findElements('error').firstOrNull;
      if (errorElement != null) {
        return WebBedsCancelResponse(
          success: false,
          errorMessage: errorElement.innerText,
        );
      }

      // Ceza tutarı (check aşaması)
      final charge = double.tryParse(_getElementText(result, 'charge') ?? '') ?? 0.0;
      final chargeType = _getElementText(result, 'chargeType') ?? '';
      
      // İptal onaylandı mı?
      final cancelled = _getElementText(result, 'cancelled') == 'yes';
      final cancellationNumber = _getElementText(result, 'cancellationNumber') ?? '';

      return WebBedsCancelResponse(
        success: true,
        charge: charge,
        chargeType: chargeType,
        cancelled: cancelled,
        cancellationNumber: cancellationNumber,
      );
    } catch (e) {
      return WebBedsCancelResponse(
        success: false,
        errorMessage: 'XML parse hatası: $e',
      );
    }
  }

  // ============================================================
  // HELPER
  // ============================================================

  static String? _getElementText(XmlElement parent, String name) {
    final element = parent.findElements(name).firstOrNull;
    return element?.innerText.trim();
  }
}
