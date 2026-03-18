/**
 * Mekke ve Medine Otellerini Çekme Script'i
 *
 * Bu script WebBeds API'den Mekke (cityCode: 164) ve Medine (cityCode: 174)
 * otellerini çeker ve bir markdown dosyasına kaydeder.
 *
 * Kullanım: node fetch-hotels.js
 *
 * WebBeds API iki aşamalı çalışır:
 * 1. İlk istek: Şehirdeki otel ID'lerini fiyat ile al
 * 2. İkinci istek: Otel ID'lerini kullanarak isim ve detayları noPrice ile al
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

// WebBeds API Konfigürasyonu
const CONFIG = {
  baseUrl: 'https://xmldev.dotwconnect.com/gatewayV4.dotw',
  username: 'birlikgrup',
  password: '21011995Kk.',
  companyId: '2285355',
  source: '1',
  product: 'hotel',
  language: 'en',
  meccaCityCode: 164,  // MAKKAH
  medinaCityCode: 174, // MADINAH
};

function md5Hash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * WebBeds V4 XML formatında istek oluştur (şehir filtresi ile)
 */
function buildSearchByCityXML(cityCode, checkIn, checkOut) {
  const encryptedPassword = md5Hash(CONFIG.password);

  return `<?xml version="1.0" encoding="UTF-8"?>
<customer xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <username>${CONFIG.username}</username>
    <password>${encryptedPassword}</password>
    <id>${CONFIG.companyId}</id>
    <source>${CONFIG.source}</source>
    <product>${CONFIG.product}</product>
    <language>${CONFIG.language}</language>
    <request command="searchhotels">
        <bookingDetails>
            <fromDate>${checkIn}</fromDate>
            <toDate>${checkOut}</toDate>
            <currency>520</currency>
            <rooms no="1">
                <room runno="0">
                    <adultsCode>1</adultsCode>
                    <children no="0"></children>
                    <rateBasis>-1</rateBasis>
                    <passengerNationality>5</passengerNationality>
                    <passengerCountryOfResidence>5</passengerCountryOfResidence>
                </room>
            </rooms>
        </bookingDetails>
        <return>
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
                <city>${cityCode}</city>
            </filters>
        </return>
    </request>
</customer>`;
}

/**
 * WebBeds V4 XML formatında istek oluştur (otel ID'leri ile noPrice + fields)
 */
function buildSearchByIdsXML(hotelIds, checkIn, checkOut) {
  const encryptedPassword = md5Hash(CONFIG.password);
  const hotelIdsXml = hotelIds
    .map((id) => `                            <fieldValue>${id}</fieldValue>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<customer xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <username>${CONFIG.username}</username>
    <password>${encryptedPassword}</password>
    <id>${CONFIG.companyId}</id>
    <source>${CONFIG.source}</source>
    <product>${CONFIG.product}</product>
    <language>${CONFIG.language}</language>
    <request command="searchhotels">
        <bookingDetails>
            <fromDate>${checkIn}</fromDate>
            <toDate>${checkOut}</toDate>
            <currency>520</currency>
            <rooms no="1">
                <room runno="0">
                    <adultsCode>1</adultsCode>
                    <children no="0"></children>
                    <rateBasis>-1</rateBasis>
                    <passengerNationality>5</passengerNationality>
                    <passengerCountryOfResidence>5</passengerCountryOfResidence>
                </room>
            </rooms>
        </bookingDetails>
        <return>
            <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
                <noPrice>true</noPrice>
                <c:condition>
                    <a:condition>
                        <fieldName>hotelId</fieldName>
                        <fieldTest>in</fieldTest>
                        <fieldValues>
${hotelIdsXml}
                        </fieldValues>
                    </a:condition>
                </c:condition>
            </filters>
            <fields>
                <field>hotelName</field>
                <field>address</field>
                <field>fullAddress</field>
                <field>rating</field>
                <field>hotelImages</field>
                <field>description1</field>
                <field>description2</field>
                <field>geoPoint</field>
                <field>cityName</field>
                <field>cityCode</field>
                <field>countryName</field>
                <field>countryCode</field>
                <field>preferred</field>
                <field>hotelCheckIn</field>
                <field>hotelCheckOut</field>
            </fields>
        </return>
    </request>
</customer>`;
}

/**
 * WebBeds API'ye istek gönder
 */
function makeRequest(xmlBody) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
      },
    };

    const req = https.request(CONFIG.baseUrl, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(xmlBody);
    req.end();
  });
}

/**
 * Şehirdeki otelleri çek (iki aşamalı)
 */
async function fetchHotelsForCity(cityCode, checkIn, checkOut) {

  try {
    // Aşama 1: Otel ID'lerini al
    console.log(`  📡 Aşama 1: Otel ID'leri çekiliyor...`);
    const searchXml = buildSearchByCityXML(cityCode, checkIn, checkOut);
    const searchResponse = await makeRequest(searchXml);

    // Ham XML yanıtını kaydet (debug için)
    const debugPath1 = path.join(__dirname, `debug-step1-city-${cityCode}.xml`);
    fs.writeFileSync(debugPath1, searchResponse, 'utf8');

    // XML parse ve otel ID'lerini çıkar
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const parsed = parser.parse(searchResponse);
    const result = parsed['result'];
    const hotelsNode = result?.['hotels'];
    const hotelsArray = hotelsNode?.['hotel'];

    const hotelIds = [];
    
    if (hotelsArray) {
      const hotelList = Array.isArray(hotelsArray) ? hotelsArray : [hotelsArray];
      
      for (const hotel of hotelList) {
        const hotelId = hotel['@_hotelid'] || hotel['@_HotelId'];
        if (hotelId) {
          hotelIds.push(hotelId);
        }
      }
    }

    console.log(`  ✅ Aşama 1: ${hotelIds.length} otel ID bulundu`);

    if (hotelIds.length === 0) {
      return [];
    }

    // Aşama 2: Otel detaylarını al (noPrice + fields ile)
    console.log(`  📡 Aşama 2: Otel detayları çekiliyor...`);
    
    // WebBeds API max 50 ID per request
    const allHotels = [];
    const batchSize = 50;

    for (let i = 0; i < hotelIds.length; i += batchSize) {
      const batch = hotelIds.slice(i, i + batchSize);
      console.log(`    📦 Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} ID`);
      
      const detailsXml = buildSearchByIdsXML(batch, checkIn, checkOut);
      const detailsResponse = await makeRequest(detailsXml);

      // Ham XML yanıtını kaydet (debug için)
      const debugPath2 = path.join(__dirname, `debug-step2-city-${cityCode}-batch-${Math.floor(i / batchSize) + 1}.xml`);
      fs.writeFileSync(debugPath2, detailsResponse, 'utf8');

      // XML parse ve otel detaylarını çıkar
      const parsedDetails = parser.parse(detailsResponse);
      const resultDetails = parsedDetails['result'];
      const hotelsNodeDetails = resultDetails?.['hotels'];
      const hotelsArrayDetails = hotelsNodeDetails?.['hotel'];

      if (hotelsArrayDetails) {
        const hotelListDetails = Array.isArray(hotelsArrayDetails) ? hotelsArrayDetails : [hotelsArrayDetails];
        
        for (const hotel of hotelListDetails) {
          const hotelId = hotel['@_hotelid'] || hotel['@_HotelId'] || '';
          const hotelName = hotel['hotelName'] || hotel['HotelName'] || '';
          const address = hotel['address'] || hotel['Address'] || '';
          const rating = hotel['rating'] || hotel['Rating'] || '';
          const cityName = hotel['cityName'] || hotel['CityName'] || '';

          if (hotelId) {
            allHotels.push({
              hotelId,
              hotelName: String(hotelName).trim(),
              address: String(address).trim(),
              rating: String(rating).trim(),
              cityName: String(cityName).trim(),
            });
          }
        }
      }
    }

    console.log(`  ✅ Aşama 2: ${allHotels.length} otel detayı alındı`);
    return allHotels;

  } catch (error) {
    console.error(`  ❌ Hata: ${error.message}`);
    throw error;
  }
}

/**
 * Markdown formatında otel listesi oluştur
 */
function generateMarkdown(meccaHotels, medinaHotels) {
  let markdown = '# Mekke ve Medine Otelleri\n\n';
  markdown += `Bu dosya WebBeds API'den çekilen Mekke ve Medine'deki anlaşmalı otelleri içerir.\n\n`;
  markdown += `*Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}*\n\n`;
  markdown += `*Toplam Otel Sayısı: ${meccaHotels.length + medinaHotels.length}*\n\n`;
  markdown += `---\n\n`;

  // Mekke Otelleri
  markdown += '## Mekke Otelleri\n\n';
  markdown += `*Toplam: ${meccaHotels.length} otel*\n\n`;
  markdown += '| Otel Adı | Otel ID | Adres | Puan |\n';
  markdown += '|----------|---------|-------|------|\n';

  meccaHotels.forEach(hotel => {
    const name = hotel.hotelName.replace(/\|/g, '\\|');
    const address = hotel.address.replace(/\|/g, '\\|').substring(0, 50);
    markdown += `| ${name} | ${hotel.hotelId} | ${address} | ${hotel.rating} |\n`;
  });

  markdown += '\n---\n\n';

  // Medine Otelleri
  markdown += '## Medine Otelleri\n\n';
  markdown += `*Toplam: ${medinaHotels.length} otel*\n\n`;
  markdown += '| Otel Adı | Otel ID | Adres | Puan |\n';
  markdown += '|----------|---------|-------|------|\n';

  medinaHotels.forEach(hotel => {
    const name = hotel.hotelName.replace(/\|/g, '\\|');
    const address = hotel.address.replace(/\|/g, '\\|').substring(0, 50);
    markdown += `| ${name} | ${hotel.hotelId} | ${address} | ${hotel.rating} |\n`;
  });

  return markdown;
}

/**
 * Birden fazla tarih aralığı dene
 */
const DATE_RANGES = [
  { name: 'Bugün', checkIn: null, checkOut: null },
  { name: '1 Hafta Sonra', checkIn: 7, checkOut: 8 },
  { name: '1 Ay Sonra', checkIn: 30, checkOut: 31 },
  { name: '2 Ay Sonra', checkIn: 60, checkOut: 61 },
  { name: '3 Ay Sonra (Haziran)', checkIn: 90, checkOut: 91 },
  { name: '6 Ay Sonra (Eylül)', checkIn: 180, checkOut: 181 },
];

/**
 * Tarih aralığına göre check-in/out tarihlerini hesapla
 */
function getDatesForRange(range) {
  const today = new Date();
  
  if (range.checkIn === null) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      checkIn: today.toISOString().split('T')[0],
      checkOut: tomorrow.toISOString().split('T')[0],
    };
  }
  
  const checkInDate = new Date(today);
  checkInDate.setDate(checkInDate.getDate() + range.checkIn);
  
  const checkOutDate = new Date(today);
  checkOutDate.setDate(checkOutDate.getDate() + range.checkOut);
  
  return {
    checkIn: checkInDate.toISOString().split('T')[0],
    checkOut: checkOutDate.toISOString().split('T')[0],
  };
}

/**
 * Ana fonksiyon
 */
async function main() {
  console.log('🏨 Mekke ve Medine otelleri çekiliyor (Birden fazla tarih deneniyor)...\n');

  // Komut satırından tarih parametresi al
  const dateArg = process.argv[2];
  let dateRangesToTry = DATE_RANGES;
  
  if (dateArg) {
    // Özel tarih formatı: YYYY-MM-DD veya gün sayısı
    if (dateArg.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const checkIn = new Date(dateArg);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 1);
      dateRangesToTry = [{
        name: `Özel Tarih: ${dateArg}`,
        checkIn: null,
        checkOut: null,
        customCheckIn: dateArg,
        customCheckOut: checkOut.toISOString().split('T')[0],
      }];
    } else if (!isNaN(parseInt(dateArg))) {
      const days = parseInt(dateArg);
      dateRangesToTry = [{
        name: `${days} gün sonra`,
        checkIn: days,
        checkOut: days + 1,
      }];
    }
  }

  const allResults = [];

  try {
    for (const dateRange of dateRangesToTry) {
      console.log(`\n${'═'.repeat(50)}`);
      console.log(`📅 Tarih Aralığı: ${dateRange.name}`);
      console.log(`${'═'.repeat(50)}`);
      
      const dates = dateRange.customCheckIn
        ? { checkIn: dateRange.customCheckIn, checkOut: dateRange.customCheckOut }
        : getDatesForRange(dateRange);
      
      console.log(`   Check-in: ${dates.checkIn}`);
      console.log(`   Check-out: ${dates.checkOut}\n`);

      // Mekke otellerini çek
      console.log('📡 Mekke otelleri çekiliyor (cityCode: 164)...');
      const meccaHotels = await fetchHotelsForCity(CONFIG.meccaCityCode, dates.checkIn, dates.checkOut);
      console.log(`✅ Mekke: ${meccaHotels.length} otel bulundu\n`);

      // Medine otellerini çek
      console.log('📡 Medine otelleri çekiliyor (cityCode: 174)...');
      const medinaHotels = await fetchHotelsForCity(CONFIG.medinaCityCode, dates.checkIn, dates.checkOut);
      console.log(`✅ Medine: ${medinaHotels.length} otel bulundu\n`);

      allResults.push({
        dateRange: dateRange.name,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        meccaCount: meccaHotels.length,
        medinaCount: medinaHotels.length,
        meccaHotels,
        medinaHotels,
      });
    }

    // En iyi sonucu bul
    const bestResult = allResults.reduce((best, current) => {
      const currentTotal = current.meccaCount + current.medinaCount;
      const bestTotal = best.meccaCount + best.medinaCount;
      return currentTotal > bestTotal ? current : best;
    });

    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 TÜM TARİHLERİN ÖZETİ');
    console.log(`${'═'.repeat(60)}`);
    
    allResults.forEach(r => {
      console.log(`${r.dateRange.padEnd(25)} | Mekke: ${r.meccaCount.toString().padStart(3)} | Medine: ${r.medinaCount.toString().padStart(3)} | Toplam: ${(r.meccaCount + r.medinaCount).toString().padStart(3)}`);
    });
    
    console.log(`${'═'.repeat(60)}`);
    console.log(`🏆 En iyi sonuç: ${bestResult.dateRange} (${bestResult.meccaCount + bestResult.medinaCount} otel)`);
    console.log(`${'═'.repeat(60)}\n`);

    // En iyi sonucu markdown olarak kaydet
    console.log('📝 Markdown dosyası oluşturuluyor...');
    const markdown = generateMarkdown(bestResult.meccaHotels, bestResult.medinaHotels);

    const outputPath = path.join(__dirname, '..', 'mekke-medine-otelleri.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');
    console.log(`✅ Dosya kaydedildi: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
main();
