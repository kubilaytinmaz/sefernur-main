# Otel Detay Sayfası API Düzeltme Planı

## Sorun Analizi

### 1. Check-in/Check-out Saatleri
- **Beklenen:** 16:00 / 13:00
- **Mevcut:** 14:00 / 12:00 (hardcoded)
- **Durum:** ❌ WebBeds API'si bu bilgiyi döndürmüyor

### 2. Otel Açıklaması  
- **Beklenen:** "Hotel 21 Makkah offers air-conditioned guestrooms..."
- **Mevcut:** Görünmüyor
- **Durum:** ✅ API'den `description1` alınabilir (statik data ile)

### 3. Oda İsimleri
- **Sorun:** "Dört Kişilikruple Room" → Yanlış birleştirme
- **Durum:** ✅ `translateRoomName` fonksiyonu düzeltilebilir

## WebBeds API Dokümantasyon Bulguları

### `searchhotels` Komutu - Static Data

WebBeds API'sinde **iki tip arama** var:

#### A) Fiyatlı Arama (Normal)
```xml
<filters>
    <city>164</city>
</filters>
```
**Dönen Alan**: `hotelId`, `roomTypes`, `rateBases`, `total`, `cancellationRules`
**Dönmeyen Alan**: ❌ `description1`, ❌ `checkInTime`, ❌ `checkOutTime`

#### B) Statik Data Arama (noPrice=true)
```xml
<filters>
    <city>164</city>
    <noPrice>true</noPrice>
</filters>
<fields>
    <field>hotelName</field>
    <field>description1</field>
    <field>fullAddress</field>
    <field>rating</field>
    <field>images</field>
    <field>geoPoint</field>
</fields>
```
**Dönen Alan**: ✅ `description1`, `description2`, `hotelName`, `fullAddress`, `rating`, `images`
**Dönmeyen Alan**: ❌ `checkInTime`, ❌ `checkOutTime` (Dokümantasyonda YOK)

### Kritik Bulgu

WebBeds DOTW V4 API dokümantasyonunda (11,617 satır):
- ✅ `description1` ve `description2` alanları **mevcut** (satır 10287, 10482, 10700-10701)
- ❌ `checkInTime` ve `checkOutTime` alanları **hiç yok**
- ❌ `checkintime` ve `checkouttime` alanları **hiç yok**

book.webbeds.com sitesindeki "Check-in: 16:00 / Check-out: 13:00" bilgisi:
- WebBeds'in kendi veritabanından geliyor (admin panel)
- API'den erişilemez
- Partner sitelere açık değil

## Çözüm Stratejisi

### Seçenek 1: Hybrid Yaklaşım (ÖNERİLEN) ⭐

**Avantaj:** Hem description hem de pricing'i bir arada alır
**Dezavantaj:** İki API çağrısı gerekir

```typescript
// 1. İlk arama: Fiyatlı arama (mevcut kod)
searchhotels(cityCode=164, rooms=...) 
→ {hotels: [{hotelId, rooms, prices}]}

// 2. İkinci arama: Statik data (sadece description için)
searchhotels(hotelIds=[...], noPrice=true, fields=[description1])
→ {hotels: [{hotelId, description1}]}

// 3. Merge: pricing + description
```

**Uygulama Yeri:** [`web-app/src/app/api/webbeds/search/route.ts`](web-app/src/app/api/webbeds/search/route.ts)

### Seçenek 2: Statik Veri Oluştur (Hızlı) 

Önemli oteller için manuel data:

```typescript
// web-app/src/lib/hotels/hotel-metadata.ts
export const HOTEL_METADATA: Record<string, {
  checkInTime: string;
  checkOutTime: string;
  descriptionTR?: string;
}> = {
  "4935665": { // Hotel 21 Makkah
    checkInTime: "16:00",
    checkOutTime: "13:00",
    descriptionTR: "Hotel 21 Makkah, Mescid-i Haram'a yakın konumda..."
  }
};
```

### Seçenek 3: Sadece Oda İsimlerini Düzelt (En Basit)

Sadece `translateRoomName` fonksiyonunu düzelt:

```typescript
function translateRoomName(name: string): string {
  // Tam eşleşmeler
  const exactMatches: Record<string, string> = {
    "Quadruple Room": "Dört Kişilik Oda",
    "Triple Room": "Üç Yataklı Oda",
    // ...
  };
  
  if (exactMatches[name]) return exactMatches[name];
  
  // Kısmi çeviriler (kelime sınırları ile)
  return name
    .replace(/\bQuadruple\b/g, "Dört Kişilik")
    .replace(/\bTriple\b/g, "Üç Yataklı")
    .replace(/\bDouble\b/g, "Çift Kişilik")
    .replace(/\bSingle\b/g, "Tek Kişilik")
    .replace(/\bRoom\b/g, "Oda");
}
```

## Önerilen Uygulama Planı

### Faz 1: Oda İsimleri (5 dk) ✅
1. [`translateRoomName`](web-app/src/app/hotels/[hotelId]/_client.tsx:119) fonksiyonunu düzelt
2. Test: "Quadruple Room" → "Dört Kişilik Oda"

### Faz 2: Otel Açıklaması (30 dk)
1. [`xml-builder.ts`](web-app/src/lib/webbeds/xml-builder.ts) - `noPrice` parametresi ekle
2. [`xml-builder.ts`](web-app/src/lib/webbeds/xml-builder.ts) - `fields` parametresi ekle  
3. [`search/route.ts`](web-app/src/app/api/webbeds/search/route.ts) - Phase 2'de statik data çek
4. [`search/route.ts`](web-app/src/app/api/webbeds/search/route.ts) - `description1` alanını merge et
5. [`[hotelId]/_client.tsx`](web-app/src/app/hotels/[hotelId]/_client.tsx) - Description'ı göster

### Faz 3: Check-in/out Saatleri (Manuel)
**API'den gelemediği için:**
- Varsayılan değerler kullan: 14:00 / 12:00
- VEYA önemli oteller için [`hotel-metadata.ts`](web-app/src/lib/hotels/hotel-metadata.ts) oluştur

## Detaylı Kod Değişiklikleri

### 1. Oda İsimleri Düzeltme

**Dosya:** [`web-app/src/app/hotels/[hotelId]/_client.tsx`](web-app/src/app/hotels/[hotelId]/_client.tsx:119)

```typescript
function translateRoomName(englishName: string): string {
  // Tam eşleşme tablosu
  const exactMatches: Record<string, string> = {
    "Quadruple Room": "Dört Kişilik Oda",
    "Triple Room": "Üç Yataklı Oda",
    "Double Room": "Çift Kişilik Oda",
    "Twin Room": "İki Ayrı Yataklı Oda",
    "Single Room": "Tek Kişilik Oda",
    "Standard Room": "Standart Oda",
    "Deluxe Room": "Deluxe Oda",
    "Suite": "Suit",
    "Family Room": "Aile Odası",
    "King Room": "King Oda",
    "Queen Room": "Queen Oda",
  };

  if (exactMatches[englishName]) {
    return exactMatches[englishName];
  }

  // Kısmi çeviri (kelime sınırları ile)
  let translated = englishName
    .replace(/\bQuadruple\b/g, "Dört Kişilik")
    .replace(/\bTriple\b/g, "Üç Yataklı")
    .replace(/\bDouble\b/g, "Çift Kişilik")
    .replace(/\bTwin\b/g, "İki Ayrı Yataklı")
    .replace(/\bSingle\b/g, "Tek Kişilik")
    .replace(/\bStandard\b/g, "Standart")
    .replace(/\bDeluxe\b/g, "Deluxe")
    .replace(/\bSuite\b/g, "Suit")
    .replace(/\bFamily\b/g, "Aile")
    .replace(/\bKing\b/g, "King")
    .replace(/\bQueen\b/g, "Queen")
    .replace(/\bRoom\b/g, "Oda");

  return translated;
}
```

### 2. Otel Açıklaması İçin API Değişiklikleri

**Dosya:** [`web-app/src/lib/webbeds/xml-builder.ts`](web-app/src/lib/webbeds/xml-builder.ts:58)

```typescript
export interface SearchHotelsParams {
  // ... mevcut alanlar
  noPrice?: boolean;
  fields?: string[];
}

export function buildSearchHotelsXML(params: SearchHotelsParams): string {
  const { noPrice, fields, ...rest } = params;
  
  // ... mevcut XML oluşturma
  
  let filtersXml = `<filters>`;
  
  if (noPrice) {
    filtersXml += `<noPrice>true</noPrice>`;
  }
  
  filtersXml += `</filters>`;
  
  if (fields && fields.length > 0) {
    filtersXml += `<fields>`;
    fields.forEach(f => {
      filtersXml += `<field>${f}</field>`;
    });
    filtersXml += `</fields>`;
  }
  
  // ... XML return
}
```

**Dosya:** [`web-app/src/app/api/webbeds/search/route.ts`](web-app/src/app/api/webbeds/search/route.ts:158)

```typescript
// Phase 2: Fetch hotel metadata (name, address, images, DESCRIPTION)
const detailMap = await fetchHotelDetails(hotelIds, checkIn, checkOut, currency, nationality);

async function fetchHotelDetails(
  hotelIds: string[],
  checkIn: string,
  checkOut: string,
  currency: number,
  nationality: number,
): Promise<Map<string, HotelObj>> {
  const detailMap = new Map<string, HotelObj>();

  const batches: string[][] = [];
  for (let i = 0; i < hotelIds.length; i += BATCH_SIZE) {
    batches.push(hotelIds.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      const xml = buildSearchByIdsXML({ 
        hotelIds: batch, 
        checkIn, 
        checkOut, 
        currency, 
        nationality,
        noPrice: true,  // ← Statik data için
        fields: [        // ← Description almak için
          'hotelName',
          'address',
          'description1',
          'rating',
          'images',
          'geoPoint'
        ]
      });
      const resp = await axios.post(WEBBEDS_CONFIG.baseUrl, xml, {
        headers: V4_HEADERS,
        timeout: 30000,
      });
      return resp.data;
    }),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    try {
      const parsed = parseWebBedsXML(result.value);
      const hotels = extractHotelsFromSearchResponse(parsed);
      for (const hotel of hotels) {
        const id = String(hotel["@_HotelId"] || "");
        if (id) detailMap.set(id, hotel);
      }
    } catch {
      // ignore parse errors
    }
  }

  return detailMap;
}
```

### 3. Check-in/out Saatleri (Manuel Çözüm)

**Yeni Dosya:** `web-app/src/lib/hotels/hotel-metadata.ts`

```typescript
export interface HotelMetadata {
  checkInTime: string;
  checkOutTime: string;
  descriptionTR?: string;
}

export const HOTEL_METADATA: Record<string, HotelMetadata> = {
  "4935665": {
    checkInTime: "16:00",
    checkOutTime: "13:00",
    descriptionTR: "Hotel 21 Makkah, Mescid-i Haram'a yakın konumda bulunan, klimalı misafir odaları ve ücretsiz kablosuz internet erişimi sunan bir oteldir."
  },
  // Diğer önemli oteller eklenebilir
};

export function getHotelMetadata(hotelId: string): HotelMetadata | undefined {
  return HOTEL_METADATA[hotelId];
}
```

**Dosya:** [`web-app/src/components/hotels/HotelInfoSection.tsx`](web-app/src/components/hotels/HotelInfoSection.tsx:71)

```typescript
import { getHotelMetadata } from "@/lib/hotels/hotel-metadata";

function HotelInfoSection({ hotelId, checkInTime, checkOutTime, description }: Props) {
  // Önce metadata'dan dene
  const metadata = getHotelMetadata(hotelId);
  
  const finalCheckIn = metadata?.checkInTime || checkInTime || "14:00";
  const finalCheckOut = metadata?.checkOutTime || checkOutTime || "12:00";
  const finalDescription = description || metadata?.descriptionTR;
  
  // ... render
}
```

## Test Senaryosu

### Test URL
```
http://localhost:3001/hotels/4935665/?checkIn=2026-03-09&checkOut=2026-03-10&adults=2&cityCode=164&hotelName=Hotel%2021%20Makkah&hotelAddress=Al%20Mursalat%20Mekke&image=https%3A%2F%2Fus.dotwconnect.com%2Fpoze_hotel%2F49%2F4935665%2FFH5gzQEq_160839a268760f375f7de7aeafb17ea4.jpg&stars=3
```

### Beklenen Sonuç

**Oda İsimleri:**
- ✅ "Dört Kişilik Oda" (Quadruple Room)
- ✅ "Üç Yataklı Oda" (Triple Room)

**Otel Açıklaması:**
- ✅ API'den gelen `description1` görünür

**Check-in/out:**
- ⚠️ Varsayılan: 14:00 / 12:00
- ✅ Metadata ile: 16:00 / 13:00

## Sonuç ve Öneri

### Kısa Vadeli (Hızlı Çözüm)
1. ✅ Oda isimlerini düzelt → 5 dakika
2. ⚠️ Check-in/out için metadata kullan → 10 dakika
3. ❌ Description'ı şimdilik gösterme

### Orta Vadeli (Tam Çözüm)
1. ✅ Oda isimlerini düzelt
2. ✅ Description için statik data API ekle → 30 dakika
3. ✅ Önemli oteller için metadata → Sürekli güncelle

### Uzun Vadeli (İdeal)
- WebBeds desteğine başvur: Check-in/out saatleri için API endpoint iste
- Veya book.webbeds.com'dan web scraping (TOS ihlali riski)
