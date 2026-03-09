/**
 * WebBeds Resim Çekme Test Script
 *
 * Bu script, WebBeds API'sinden otel resimlerinin kaç tanesinin çekildiğini test eder.
 * Çalıştırmak için: node functions/test-images.js
 */

const crypto = require('crypto');
const https = require('https');
const { XMLParser } = require("fast-xml-parser");

// WebBeds Config
const config = {
  baseUrl: 'xmldev.dotwconnect.com',
  path: '/gatewayV4.dotw',
  username: 'birlikgrup',
  password: '21011995Kk.',
  companyId: '2285355',
  source: '1',
  product: 'hotel',
  language: 'en',
  meccaCityCode: 164,
  defaultCurrency: 520, // USD
  defaultNationality: 5, // Turkey
  defaultCountryOfResidence: 5
};

function md5Hash(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildStaticHotelsRequest() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return `<request command="searchhotels">
    <bookingDetails>
        <fromDate>${formatDate(today)}</fromDate>
        <toDate>${formatDate(tomorrow)}</toDate>
        <currency>${config.defaultCurrency}</currency>
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
            <city>${config.meccaCityCode}</city>
            <noPrice>true</noPrice>
        </filters>
        <fields>
            <field>hotelName</field>
            <field>hotelImages</field>
            <field>images</field>
        </fields>
    </return>
</request>`;
}

function wrapWithCustomer(requestXml) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<customer xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <username>${config.username}</username>
    <password>${md5Hash(config.password)}</password>
    <id>${config.companyId}</id>
    <source>${config.source}</source>
    <product>${config.product}</product>
    <language>${config.language}</language>
    ${requestXml}
</customer>`;
}

function countImages(hotel) {
  const images = new Set();
  const sources = [];
  
  // Yöntem 1: hotelImages > image elementleri
  const hotelImages = hotel.hotelImages?.image;
  if (hotelImages) {
    const imgArray = Array.isArray(hotelImages) ? hotelImages : [hotelImages];
    for (const img of imgArray) {
      const url = img['@_url'] || img['url'] || img['#text'] || img;
      if (url && typeof url === 'string' && url.startsWith('http')) {
        images.add(url);
      }
    }
    if (imgArray.length > 0) {
      sources.push(`hotelImages: ${imgArray.length} element`);
    }
  }
  
  // Yöntem 2: images > image elementleri
  const imagesEl = hotel.images?.image;
  if (imagesEl) {
    const imgArray = Array.isArray(imagesEl) ? imagesEl : [imagesEl];
    for (const img of imgArray) {
      const url = img['@_url'] || img['url'] || img['#text'] || img;
      if (url && typeof url === 'string' && url.startsWith('http')) {
        images.add(url);
      }
    }
    if (imgArray.length > 0) {
      sources.push(`images: ${imgArray.length} element`);
    }
  }
  
  // Yöntem 3: doğrudan image elementleri
  const directImages = hotel.image;
  if (directImages) {
    const imgArray = Array.isArray(directImages) ? directImages : [directImages];
    for (const img of imgArray) {
      const url = img['@_url'] || img['url'] || img['#text'] || img;
      if (url && typeof url === 'string' && url.startsWith('http')) {
        images.add(url);
      }
    }
    if (imgArray.length > 0) {
      sources.push(`direct image: ${imgArray.length} element`);
    }
  }
  
  // Yöntem 4: imageURL
  const singleImage = hotel.imageURL || hotel.imageUrl;
  if (singleImage && typeof singleImage === 'string' && singleImage.startsWith('http')) {
    images.add(singleImage);
    sources.push('imageURL: 1 element');
  }
  
  return {
    totalImages: images.size,
    sources: sources,
    firstImage: images.size > 0 ? Array.from(images)[0] : null
  };
}

function makeRequest(xmlData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.baseUrl,
      port: 443,
      path: config.path,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Accept': 'text/xml',
        'Content-Length': Buffer.byteLength(xmlData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(xmlData);
    req.end();
  });
}

async function main() {
  console.log('\n=== WebBeds Resim Çekme Test ===\n');
  
  try {
    const requestXml = buildStaticHotelsRequest();
    const fullXml = wrapWithCustomer(requestXml);
    
    console.log('API isteği gönderiliyor...');
    console.log(`Endpoint: https://${config.baseUrl}${config.path}`);
    console.log(`Şehir: Mekke (City Code: ${config.meccaCityCode})\n`);
    
    const xmlString = await makeRequest(fullXml);
    console.log(`✓ Yanıt alındı (${xmlString.length} karakter)\n`);
    
    // XML'i parse et
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    
    const result = parser.parse(xmlString);
    
    // result elementi al
    const resultEl = result.result;
    
    if (!resultEl) {
      console.log('✗ Hata: result element bulunamadı');
      console.log('Full response:', JSON.stringify(result, null, 2));
      return;
    }
    
    // Error kontrolü - request içinde error olabilir
    if (resultEl.request?.error) {
      console.log(`✗ API Hatası: ${JSON.stringify(resultEl.request.error, null, 2)}`);
      return;
    }
    
    // Hotels
    const hotels = resultEl.hotels?.hotel;
    if (!hotels) {
      console.log('✗ Hata: hotels element bulunamadı');
      console.log('Result structure:', JSON.stringify(resultEl, null, 2));
      return;
    }
    
    const hotelArray = Array.isArray(hotels) ? hotels : [hotels];
    console.log(`Bulunan otel sayısı: ${hotelArray.length}\n`);
    
    // İlk 5 oteli analiz et
    const results = [];
    
    for (let i = 0; i < Math.min(hotelArray.length, 5); i++) {
      const hotel = hotelArray[i];
      const hotelId = hotel['@_hotelid'] || hotel.hotelId;
      const hotelName = hotel.hotelName || `Otel #${hotelId}`;
      
      const imageResult = countImages(hotel);
      imageResult.hotelId = hotelId;
      imageResult.hotelName = hotelName;
      results.push(imageResult);
    }
    
    // Sonuçları yazdır
    console.log('=== İlk 5 Otelin Resim Analizi ===\n');
    
    let totalImages = 0;
    let maxImages = 0;
    let minImages = 999999;
    
    for (const result of results) {
      const count = result.totalImages;
      totalImages += count;
      maxImages = Math.max(maxImages, count);
      minImages = Math.min(minImages, count);
      
      console.log(`🏨 ${result.hotelName} (ID: ${result.hotelId})`);
      console.log(`   Resim sayısı: ${count}`);
      if (result.sources.length > 0) {
        console.log(`   Kaynaklar: ${result.sources.join(', ')}`);
      }
      if (result.firstImage) {
        console.log(`   İlk resim: ${result.firstImage}`);
      }
      console.log('');
    }
    
    console.log('=== Özet ===');
    console.log(`Toplam resim: ${totalImages}`);
    console.log(`Ortalama: ${(totalImages / results.length).toFixed(1)} resim/otel`);
    console.log(`En az: ${minImages} resim`);
    console.log(`En çok: ${maxImages} resim`);
    
    if (maxImages > 1) {
      console.log('\n✓ BAŞARILI: Birden fazla resim çekiliyor!');
    } else {
      console.log('\n✗ HATA: Hala sadece 1 resim çekiliyor.');
    }
    
  } catch (error) {
    console.error('✗ Exception:', error.message);
    console.error(error.stack);
  }
}

main();
