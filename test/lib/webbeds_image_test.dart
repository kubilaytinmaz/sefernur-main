/// WebBeds Resim Çekme Test Script
/// 
/// Bu script, WebBeds API'sinden otel resimlerinin kaç tanesinin çekildiğini test eder.
/// Çalıştırmak için: flutter test test/lib/webbeds_image_test.dart

import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:xml/xml.dart';

// WebBeds Config
class WebBedsConfig {
  static const String baseUrl = 'https://xmldev.dotwconnect.com/gatewayV4.dotw';
  static const String username = 'birlikgrup';
  static const String password = '21011995Kk.';
  static const String companyId = '2285355';
  static const String source = '1';
  static const String product = 'hotel';
  static const String language = 'en';
  static const int meccaCityCode = 164;
  static const int defaultCurrency = 520; // USD
  static const int defaultNationality = 5; // Turkey
  static const int defaultCountryOfResidence = 5;
}

String _md5Hash(String input) {
  return md5.convert(input.codeUnits).toString();
}

String _encryptedPassword() => _md5Hash(WebBedsConfig.password);

String _wrapWithCustomer(String requestXml) {
  return '''<?xml version="1.0" encoding="UTF-8"?>
<customer xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <username>${WebBedsConfig.username}</username>
    <password>${_encryptedPassword()}</password>
    <id>${WebBedsConfig.companyId}</id>
    <source>${WebBedsConfig.source}</source>
    <product>${WebBedsConfig.product}</product>
    <language>${WebBedsConfig.language}</language>
    $requestXml
</customer>''';
}

String _formatDate(DateTime date) {
  return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
}

/// Statik otel verisi XML isteği (noPrice=true ile resimler gelir)
String buildStaticHotelsRequest() {
  final today = DateTime.now();
  final tomorrow = today.add(const Duration(days: 1));
  
  return '''
<request command="searchhotels">
    <bookingDetails>
        <fromDate>${_formatDate(today)}</fromDate>
        <toDate>${_formatDate(tomorrow)}</toDate>
        <currency>${WebBedsConfig.defaultCurrency}</currency>
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
            <city>${WebBedsConfig.meccaCityCode}</city>
            <noPrice>true</noPrice>
        </filters>
        <fields>
            <field>hotelName</field>
            <field>hotelImages</field>
            <field>images</field>
            <field>imageURL</field>
        </fields>
    </return>
</request>''';
}

/// Resimleri sayan fonksiyon
Map<String, dynamic> countImages(XmlElement hotelEl, int hotelId) {
  final images = <String>{};
  final sources = <String>[];
  
  // Yöntem 1: hotelImages > image elementleri
  final imagesEl = hotelEl.findElements('hotelImages').firstOrNull;
  if (imagesEl != null) {
    final imgElements = imagesEl.findElements('image').toList();
    for (final imgEl in imgElements) {
      String? url = imgEl.getAttribute('url');
      if (url.isEmpty) {
        url = imgEl.innerText.trim();
      }
      if (url.isNotEmpty && url.startsWith('http')) {
        images.add(url);
      }
    }
    if (imgElements.isNotEmpty) {
      sources.add('hotelImages: ${imgElements.length} element');
    }
  }
  
  // Yöntem 2: images > image elementleri
  final imagesEl2 = hotelEl.findElements('images').firstOrNull;
  if (imagesEl2 != null) {
    final imgElements2 = imagesEl2.findElements('image').toList();
    for (final imgEl in imgElements2) {
      String? url = imgEl.getAttribute('url');
      if (url.isEmpty) {
        url = imgEl.innerText.trim();
      }
      if (url.isNotEmpty && url.startsWith('http')) {
        images.add(url);
      }
    }
    if (imgElements2.isNotEmpty) {
      sources.add('images: ${imgElements2.length} element');
    }
  }
  
  // Yöntem 3: doğrudan image elementleri
  final directImages = hotelEl.findElements('image').toList();
  if (directImages.isNotEmpty) {
    for (final imgEl in directImages) {
      String? url = imgEl.getAttribute('url');
      if (url.isEmpty) {
        url = imgEl.innerText.trim();
      }
      if (url.isNotEmpty && url.startsWith('http')) {
        images.add(url);
      }
    }
    sources.add('direct image: ${directImages.length} element');
  }
  
  // Yöntem 4: imageURL
  final singleImage = hotelEl.findElements('imageURL').firstOrNull?.innerText.trim();
  if (singleImage != null && singleImage.startsWith('http')) {
    images.add(singleImage);
    sources.add('imageURL: 1 element');
  }
  
  return {
    'hotelId': hotelId,
    'totalImages': images.length,
    'sources': sources,
    'firstImage': images.isNotEmpty ? images.first : null,
  };
}

void main() {
  testWidgets('WebBeds Resim Çekme Test', (WidgetTester tester) async {
    print('\n=== WebBeds Resim Çekme Test ===\n');
    
    final dio = Dio(BaseOptions(
      baseUrl: WebBedsConfig.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Accept': 'text/xml',
      },
    ));
    
    try {
      // XML isteği oluştur
      final requestXml = buildStaticHotelsRequest();
      final fullXml = _wrapWithCustomer(requestXml);
      
      print('API isteği gönderiliyor...');
      print('Endpoint: ${WebBedsConfig.baseUrl}');
      print('Şehir: Mekke (City Code: ${WebBedsConfig.meccaCityCode})\n');
      
      // İsteği gönder
      final response = await dio.post(
        '',
        data: fullXml,
        options: Options(
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'Accept': 'text/xml',
          },
        ),
      );
      
      if (response.statusCode == 200) {
        final xmlString = response.data as String;
        print('✓ Yanıt alındı (${xmlString.length} karakter)\n');
        
        // XML'i parse et
        final document = XmlDocument.parse(xmlString);
        final result = document.findAllElements('result').firstOrNull;
        
        if (result == null) {
          print('✗ Hata: result element bulunamadı');
          return;
        }
        
        // Error kontrolü
        final errorElement = result.findElements('error').firstOrNull;
        if (errorElement != null) {
          print('✗ API Hatası: ${errorElement.innerText}');
          return;
        }
        
        // Hotels
        final hotelsElement = result.findElements('hotels').firstOrNull;
        if (hotelsElement == null) {
          print('✗ Hata: hotels element bulunamadı');
          return;
        }
        
        final hotelElements = hotelsElement.findElements('hotel').toList();
        print('Bulunan otel sayısı: ${hotelElements.length}\n');
        
        // İlk 5 oteli analiz et
        final results = <Map<String, dynamic>>[];
        
        for (var i = 0; i < hotelElements.length && i < 5; i++) {
          final hotelEl = hotelElements[i];
          final hotelId = int.tryParse(hotelEl.getAttribute('hotelid') ?? '') ?? 0;
          final hotelName = hotelEl.findElements('hotelName').firstOrNull?.innerText ?? 'Otel #$hotelId';
          
          final imageResult = countImages(hotelEl, hotelId);
          imageResult['hotelName'] = hotelName;
          results.add(imageResult);
        }
        
        // Sonuçları yazdır
        print('=== İlk 5 Otelin Resim Analizi ===\n');
        
        int totalImages = 0;
        int maxImages = 0;
        int minImages = 999999;
        
        for (final result in results) {
          final count = result['totalImages'] as int;
          totalImages += count;
          maxImages = count > maxImages ? count : maxImages;
          minImages = count < minImages ? count : minImages;
          
          print('🏨 ${result['hotelName']} (ID: ${result['hotelId']})');
          print('   Resim sayısı: ${count}');
          if (result['sources'] != null && (result['sources'] as List).isNotEmpty) {
            print('   Kaynaklar: ${(result['sources'] as List).join(', ')}');
          }
          if (result['firstImage'] != null) {
            print('   İlk resim: ${result['firstImage']}');
          }
          print('');
        }
        
        print('=== Özet ===');
        print('Toplam resim: $totalImages');
        print('Ortalama: ${(totalImages / results.length).toStringAsFixed(1)} resim/otel');
        print('En az: $minImages resim');
        print('En çok: $maxImages resim');
        
        if (maxImages > 1) {
          print('\n✓ BAŞARILI: Birden fazla resim çekiliyor!');
        } else {
          print('\n✗ HATA: Hala sadece 1 resim çekiliyor.');
        }
        
        // Test assertion
        expect(maxImages, greaterThan(1), reason: 'En az bir otelde birden fazla resim olmalı');
        
      } else {
        print('✗ HTTP Hatası: ${response.statusCode}');
      }
      
    } catch (e, stackTrace) {
      print('✗ Exception: $e');
      print('StackTrace: $stackTrace');
      rethrow;
    }
  });
}
