import 'package:xml/xml.dart';

void main() {
  // API'den gelen gerçek XML formatı
  final xmlString = '''<?xml version="1.0" encoding="UTF-8"?>
<hotelImages count="2">
    <thumb><![CDATA[https://us.dotwconnect.com/poze_hotel/58/5898805/thumb.png]]></thumb>
    <image runno="0">
        <alt></alt>
        <category id="48809">Hotel</category>
        <url><![CDATA[https://us.dotwconnect.com/poze_hotel/58/5898805/Dk8Yd0wE_3aa457266aa9df7946fe4f909144bac0.png]]></url>
    </image>
    <image runno="1">
        <alt></alt>
        <category id="48809">Hotel</category>
        <url><![CDATA[https://static-images.webbeds.com/0/image/3a2d9635-51ff-4033-a88e-ca7aee69528a.jpg]]></url>
    </image>
</hotelImages>''';

  final document = XmlDocument.parse(xmlString);
  final hotelImages = document.findAllElements('hotelImages').first;
  
  print('=== Test: CDATA Parse ===\n');
  
  final images = <String>[];
  for (final imgEl in hotelImages.findElements('image')) {
    // Metot 1: getAttribute
    String? url = imgEl.getAttribute('url');
    print('getAttribute: $url');
    
    // Metot 2: <url> elementi
    if (url == null || url.isEmpty) {
      final urlEl = imgEl.findElements('url').firstOrNull;
      url = urlEl?.innerText.trim();
      print('innerText: $url');
    }
    
    if (url != null && url.isNotEmpty) {
      images.add(url);
    }
  }
  
  print('\n=== Sonuç ===');
  print('Toplam resim: ${images.length}');
  for (var i = 0; i < images.length; i++) {
    print('${i + 1}. ${images[i]}');
  }
}
