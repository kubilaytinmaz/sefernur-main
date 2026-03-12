# Oda ve Misafir Sayısına Göre Otel Arama Entegrasyon Planı

## 📋 Özet

Bu plan, otel arama sayfasında oda ve misafir sayılarına göre filtreleme ve WebBeds API entegrasyonunun tüm yönlerini kapsar. Mevcut sistem zaten temel oda/misafir seçimi sunuyor ancak bu plan, kullanıcı deneyimini iyileştirmek ve API entegrasyonunu güçlendirmek için eksiksiz bir mimari sunar.

## 🎯 Mevcut Durum Analizi

### Mevcut Özellikler
- ✅ [`HotelSearchForm`](web-app/src/components/hotels/HotelSearchForm.tsx:1) - Oda ve misafir seçimi mevcut
- ✅ [`GuestSelector`](web-app/src/components/hotels/HotelSearchForm.tsx:73) - 1-4 oda, 1-6 yetişkin, 0-4 çocuk seçimi
- ✅ Çocuk yaş seçimi (0-17 yaş)
- ✅ URL parametreleri ile arama durumu korunması
- ✅ WebBeds API entegrasyonu ([`searchByCity`](web-app/src/lib/webbeds/client.ts:58))

### Mevcut Akış
```
Kullanıcı Input → HotelSearchForm → URL Params → API Search → Results Display
```

### Eksiklikler ve İyileştirme Alanları

1. **Oda Kapasitesi Filtreleme**: Otellerin maksimum kapasite bilgisi gösterilmiyor
2. **Uygunluk Göstergesi**: Seçilen misafir sayısına göre otellerin uygunluğu belirtilmiyor
3. **Fiyatlandırma**: Fiyatlar oda/misafir sayısına göre dinamik güncellenmiyor
4. **Oda Tipi Bilgisi**: Her otelde kaç kişilik odalar olduğu gösterilmiyor
5. **Arama Sonrası Düzenleme**: Arama yapıldıktan sonra oda/misafir sayısı değiştirilemiyor

## 🏗️ Mimari Tasarım

### 1. Veri Akışı Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OTEL ARAMA AKIŞI                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│  │   Kullanıcı  │────▶│ Search Form  │────▶│ URL Params   │               │
│  │              │     │              │     │              │               │
│  │ • Şehir      │     │ • Oda Sayısı │     │ ?cityCode=   │               │
│  │ • Tarihler   │     │ • Yetişkin   │     │   164        │               │
│  │ • Oda/Misafir│     │ • Çocuk      │     │ &checkIn=    │               │
│  └──────────────┘     │ • Çocuk Yaş  │     │   2025-03-10 │               │
│                       └──────────────┘     │ &rooms=...   │               │
│                              │              └──────────────┘               │
│                              v                       │                     │
│                       ┌──────────────┐              │                     │
│                       │  Validation  │              │                     │
│                       │              │              │                     │
│                       │ • Min/Max    │              │                     │
│                       │ • Tarih      │              │                     │
│                       └──────────────┘              │                     │
│                              │                      │                     │
│                              v                      v                     │
│                       ┌──────────────────────────────────────┐           │
│                       │         API Route                     │           │
│                       │   /api/hotels/search                  │           │
│                       │                                      │           │
│                       │ 1. WebBeds Search (Phase 1)          │           │
│                       │    • Hotel IDs + Pricing             │           │
│                       │ 2. WebBeds Get Details (Phase 2)     │           │
│                       │    • Hotel metadata                  │           │
│                       │ 3. Google Places (Phase 3)           │           │
│                       │    • Ratings & reviews               │           │
│                       └──────────────────────────────────────┘           │
│                              │                                           │
│                              v                                           │
│                       ┌──────────────┐                                   │
│                       │  Response    │                                   │
│                       │              │                                   │
│                       │ • Hotel List │                                   │
│                       │ • Prices     │                                   │
│                       │ • Capacity   │                                   │
│                       └──────────────┘                                   │
│                              │                                           │
│                              v                                           │
│                       ┌──────────────────────────────────────┐           │
│                       │         Client Processing             │           │
│                       │                                      │           │
│                       │ 1. Normalize Data                     │           │
│                       │ 2. Filter by Capacity                │           │
│                       │ 3. Sort & Paginate                   │           │
│                       │ 4. Cache Results                     │           │
│                       └──────────────────────────────────────┘           │
│                              │                                           │
│                              v                                           │
│                       ┌──────────────┐                                   │
│                       │   Display    │                                   │
│                       │              │                                   │
│                       │ • Hotel Cards│                                   │
│                       │ • Filters    │                                   │
│                       │ • Sort Bar   │                                   │
│                       └──────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Bileşen Mimarisi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HotelsPage (/oteller)                                                      │
│  ├── HeroSection                                                            │
│  │   └── HotelSearchForm                                                    │
│  │       ├── CitySelector (Mekke/Medine + Diğer)                           │
│  │       ├── DateSelector (Giriş/Çıkış + Gece Sayısı)                      │
│  │       └── GuestSelector ◄─── FOCUS: Oda/Misafir Seçimi                 │
│  │           ├── RoomList                                                   │
│  │           │   └── RoomItem                                               │
│  │           │       ├── AdultsCounter (1-6)                               │
│  │           │       ├── ChildrenCounter (0-4)                             │
│  │           │       └── ChildAgeSelector (0-17 yaş)                       │
│  │           └── AddRoomButton (Max 4 oda)                                 │
│  │                                                                         │
│  └── ResultsSection                                                         │
│      ├── FilterSidebar                                                      │
│      │   ├── PriceRangeFilter                                              │
│      │   ├── StarRatingFilter                                              │
│      │   ├── DistanceFilter                                                │
│      │   └── CapacityFilter ◄─── NEW: Oda kapasitesi filtreleme           │
│      ├── SortBar                                                            │
│      └── HotelGrid                                                          │
│          └── HotelCard                                                      │
│              ├── CapacityBadge ◄─── NEW: Kapasite bilgisi                  │
│              ├── PricePerPerson ◄─── NEW: Kişi başı fiyat                 │
│              └── RoomAvailability ◄─── NEW: Oda uygunluğu                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Veri Modeli

### Room Configuration Type
```typescript
interface RoomConfig {
  adults: number;      // 1-6
  children: number;    // 0-4
  childAges: number[]; // 0-17 (çocuk sayısı kadar)
}

interface HotelSearchParams {
  cityCode: number;
  checkIn: string;     // YYYY-MM-DD
  checkOut: string;    // YYYY-MM-DD
  rooms: RoomConfig[];
  nationality?: number;
  currency?: number;
}
```

### Hotel Capacity Info
```typescript
interface HotelCapacity {
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  availableRooms: number;
  roomTypes: RoomTypeCapacity[];
}

interface RoomTypeCapacity {
  roomTypeCode: string;
  name: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  price: number;
}
```

## 🔧 Teknik İyileştirmeler

### 1. API Yanıtını Zenginleştirme

**Mevcut**: [`/api/hotels/search/route.ts`](web-app/src/app/api/hotels/search/route.ts:1)

**Eklenecek**:
- Oda kapasite bilgisi
- Maksimum misafir sayısı
- Uygun oda tipleri
- Kişi başı fiyat hesaplama

```typescript
// Phase 2'de getHotelsByIds çağrısı sonrası eklenmeli:
const enrichedHotels = mergedHotels.map(hotel => ({
  ...hotel,
  capacity: {
    maxAdults: calculateMaxAdults(hotel),
    maxChildren: calculateMaxChildren(hotel),
    maxOccupancy: calculateMaxOccupancy(hotel),
  },
  pricePerPerson: calculatePricePerPerson(hotel.price, searchParams.rooms),
  canAccommodate: checkCapacity(hotel, searchParams.rooms),
}));
```

### 2. Client-Side Filtreleme

**Mevcut**: [`_client.tsx`](web-app/src/app/hotels/_client.tsx:204) - `processedHotels`

**Eklenecek**:
```typescript
// Kapasite filtreleme
if (filters.minCapacity !== undefined) {
  hotels = hotels.filter(h => 
    h.capacity?.maxOccupancy >= filters.minCapacity!
  );
}

// Oda sayısı filtreleme
if (filters.minRooms !== undefined) {
  hotels = hotels.filter(h => 
    h.availableRooms >= filters.minRooms!
  );
}
```

### 3. UI Bileşenleri

#### 3.1 GuestSelector İyileştirmeleri

**Mevcut**: [`HotelSearchForm.tsx`](web-app/src/components/hotels/HotelSearchForm.tsx:73)

**Eklenecek**:
- Toplam misafir sayısı özeti
- Kapasite uyarısı
- Hızlı seçim butonları (Çift, Aile, Grup)

```typescript
// Hızlı seçim presetleri
const GUEST_PRESETS = [
  { label: "Çift", rooms: [{ adults: 2, children: 0, childAges: [] }] },
  { label: "Aile", rooms: [{ adults: 2, children: 2, childAges: [5, 8] }] },
  { label: "Grup", rooms: [
    { adults: 2, children: 0, childAges: [] },
    { adults: 2, children: 1, childAges: [10] }
  ]},
  { label: "Büyük Grup", rooms: [
    { adults: 2, children: 0, childAges: [] },
    { adults: 2, children: 0, childAges: [] },
    { adults: 2, children: 2, childAges: [5, 8] }
  ]},
];
```

#### 3.2 HotelCard Kapasite Badge'i

```typescript
// HotelCard'a eklenecek:
<div className="flex items-center gap-2">
  <CapacityBadge 
    maxOccupancy={hotel.capacity?.maxOccupancy}
    currentGuests={totalGuests}
    isSuitable={hotel.canAccommodate}
  />
  <PricePerPerson 
    totalPrice={hotel.price}
    guestCount={totalGuests}
    currency="TRY"
  />
</div>
```

#### 3.3 Arama Sonrası Misafir Düzenleme

```typescript
// ResultsSection'a eklenecek:
<GuestSummaryBar 
  rooms={searchParams.rooms}
  onChange={handleGuestChange}
  onSearch={handleSearch}
/>
```

## 🎨 UI/UX İyileştirmeleri

### 1. Misafir Seçimi Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST SELECTOR UI                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  👥 2 Oda, 5 Misafir                    ▼           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  HIZLI SEÇİM                                        │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │   │
│  │  │ Çift │ │ Aile │ │ Grup │ │Büyük │              │   │
│  │  │      │ │      │ │      │ │Grup  │              │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ODA 1                                    [Kaldır]  │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  👤 Yetişkin     ─  2  +                    │   │   │
│  │  │     18+ yaş                                  │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │  👶 Çocuk        ─  1  +                    │   │   │
│  │  │     0-17 yaş                                │   │   │
│  │  │     Çocuk yaşları: [5 yaş ▼]               │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ODA 2                                    [Kaldır]  │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  👤 Yetişkin     ─  2  +                    │   │   │
│  │  │     18+ yaş                                  │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │  👶 Çocuk        ─  0  +                    │   │   │
│  │  │     0-17 yaş                                │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  + ODA EKLE (Max 4 oda)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    [ TAMAM ]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. HotelCard Kapasite Göstergesi

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ UYGUN  •  Maksimum 6 misafir  •  3 oda tipi mevcut     │
└─────────────────────────────────────────────────────────────┘
```

### 3. Fiyat Gösterimi

```
┌─────────────────────────────────────────────────────────────┐
│  Toplam: ₺3.500  •  Kişi başı: ₺700  •  2 gece            │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Kullanıcı Akışları

### Akış 1: Yeni Arama

```
1. Kullanıcı /oteller sayfasına gelir
2. Varsayılan değerler yüklenir (Mekke, bugün, yarın, 2 yetişkin)
3. Kullanıcı şehir seçer (Mekke/Medine hızlı buton veya arama)
4. Kullanıcı tarih seçer (gece sayısı veya tarih picker)
5. Kullanıcı misafir sayısını ayarlar:
   - Hızlı seçim butonlarını kullanır VEYA
   - Manuel olarak oda/kişi ekler
6. "Otel Ara" butonuna tıklar
7. URL güncellenir: /oteller?cityCode=164&checkIn=2025-03-10&checkOut=2025-03-12&rooms=...
8. API çağrısı yapılır
9. Sonuçlar gösterilir
```

### Akış 2: Arama Sonrası Misafir Değiştirme

```
1. Kullanıcı arama sonuçlarını görür
2. Sonuçlar üstünde özet bar görür: "2 Oda, 5 Misafir [Değiştir]"
3. "Değiştir" butonuna tıklar
4. GuestSelector popover açılır
5. Misafir sayısını değiştirir
6. "Tamam" veya "Yeni Ara" butonuna tıklar
7. Yeni arama otomatik başlar
8. Sonuçlar güncellenir
```

### Akış 3: Kapasite Uyarısı

```
1. Kullanıcı 10 kişilik grup seçer
2. Arama yapar
3. Bazı oteller "⚠️ Sınırlı Kapasite" badge'i gösterir
4. Badge'in üzerine gelir: "Maksimum 6 misafir, ek oda gerekli"
5. Kullanıcı filtreleri kullanarak sadece uygun otelleri görür
```

## 📁 Dosya Yapısı

### Yeni Dosyalar

```
web-app/src/
├── components/hotels/
│   ├── GuestSummaryBar.tsx          # NEW: Arama sonrası özet
│   ├── CapacityBadge.tsx            # NEW: Kapasite badge'i
│   ├── PricePerPerson.tsx           # NEW: Kişi başı fiyat
│   ├── GuestPresetButtons.tsx       # NEW: Hızlı seçim butonları
│   └── CapacityFilter.tsx           # NEW: Kapasite filtresi
├── lib/hotels/
│   ├── capacity-utils.ts            # NEW: Kapasite hesaplama
│   └── price-utils.ts               # NEW: Fiyat hesaplama
└── types/hotel.ts                    # UPDATE: Yeni tipler
```

### Güncellenecek Dosyalar

```
web-app/src/
├── components/hotels/
│   ├── HotelSearchForm.tsx          # UPDATE: Hızlı seçim ekle
│   ├── HotelCard.tsx                # UPDATE: Kapasite badge'i
│   └── HotelFilters.tsx             # UPDATE: Kapasite filtresi
├── app/hotels/
│   ├── _client.tsx                  # UPDATE: Kapasite filtreleme
│   └── page.tsx                     # UPDATE: GuestSummaryBar
└── app/api/hotels/search/
    └── route.ts                     # UPDATE: Kapasite verisi
```

## 🚀 Implementasyon Adımları

### Faz 1: Temel Altyapı (1-2 gün)

1. **Type tanımlamaları**
   - [`types/hotel.ts`](web-app/src/types/hotel.ts:1) güncelle
   - `HotelCapacity`, `RoomTypeCapacity` tipleri ekle

2. **Utility fonksiyonları**
   - `lib/hotels/capacity-utils.ts` oluştur
   - `lib/hotels/price-utils.ts` oluştur

3. **API yanıtı zenginleştirme**
   - [`/api/hotels/search/route.ts`](web-app/src/app/api/hotels/search/route.ts:1) güncelle
   - Kapasite bilgisi ekle

### Faz 2: UI Bileşenleri (2-3 gün)

4. **GuestSelector iyileştirmeleri**
   - Hızlı seçim butonları ekle
   - Toplam misafir özeti göster

5. **HotelCard güncellemeleri**
   - Kapasite badge'i ekle
   - Kişi başı fiyat göster

6. **GuestSummaryBar oluştur**
   - Arama sonrası özet bar
   - Misafir değiştirme modal

### Faz 3: Filtreleme (1-2 gün)

7. **CapacityFilter bileşeni**
   - Maksimum kapasite filtresi
   - Oda sayısı filtresi

8. **Client-side filtreleme**
   - [`_client.tsx`](web-app/src/app/hotels/_client.tsx:204) güncelle
   - Kapasite filtresi entegrasyonu

### Faz 4: Test ve Optimizasyon (1-2 gün)

9. **Test senaryoları**
   - Çift, aile, grup aramaları
   - Kapasite uyarıları
   - Fiyat hesaplamaları

10. **Performans optimizasyonu**
    - Cache stratejisi
    - Debouncing

## 📊 Başarı Metrikleri

### KPI'ler

1. **Kullanıcı Deneyimi**
   - Arama süresi: < 2 saniye
   - Misafir değiştirme: < 3 tıklama
   - Hata oranı: < 1%

2. **İş Metrikleri**
   - Arama dönüşümü: +15%
   - Sayfa kalma süresi: +20%
   - Filtre kullanımı: +30%

3. **Teknik**
   - API yanıt süresi: < 1 saniye
   - Cache hit rate: > 80%
   - Bundle size: < 50KB ek

## 🔐 Güvenlik ve Validasyon

### Input Validasyonu

```typescript
// Maksimum sınırlar
const MAX_ROOMS = 4;
const MAX_ADULTS_PER_ROOM = 6;
const MAX_CHILDREN_PER_ROOM = 4;
const MAX_TOTAL_GUESTS = 20;

// Validasyon fonksiyonu
function validateGuestConfig(rooms: RoomConfig[]): ValidationResult {
  const totalGuests = rooms.reduce((sum, r) => sum + r.adults + r.children, 0);
  
  if (rooms.length > MAX_ROOMS) {
    return { valid: false, error: `Maksimum ${MAX_ROOMS} oda seçebilirsiniz` };
  }
  
  if (totalGuests > MAX_TOTAL_GUESTS) {
    return { valid: false, error: `Maksimum ${MAX_TOTAL_GUESTS} misafir için arama yapabilirsiniz` };
  }
  
  // ... daha fazla validasyon
  
  return { valid: true };
}
```

### API Rate Limiting

```typescript
// Rate limiting middleware
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // maksimum 100 istek
  message: "Çok fazla istek, lütfen bekleyin"
};
```

## 🌐 Çoklu Dil Desteği

### Türkçe (Varsayılan)
- "Oda", "Misafir", "Yetişkin", "Çocuk"
- "Maksimum X misafir"
- "Kişi başı"

### İngilizce
- "Room", "Guest", "Adult", "Child"
- "Max X guests"
- "Per person"

### Arapça
- "غرفة", "ضيف", "بالغ", "طفل"
- "حد أقصى X ضيف"
- "للشخص الواحد"

## 📱 Responsive Tasarım

### Mobile (< 768px)
- GuestSelector: Full-screen modal
- Hızlı seçim: 2x2 grid
- Oda listesi: Stack layout

### Tablet (768px - 1024px)
- GuestSelector: Bottom sheet
- Hızlı seçim: 4x1 grid
- Oda listesi: 2 column

### Desktop (> 1024px)
- GuestSelector: Dropdown popover
- Hızlı seçim: 4x1 grid
- Oda listesi: Inline

## 🎯 Önceliklendirme

### Yüksek Öncelik (Faz 1-2)
1. ✅ Temel oda/misafir seçimi (mevcut)
2. 🔲 Hızlı seçim presetleri
3. 🔲 Kapasite badge'i
4. 🔲 Kişi başı fiyat

### Orta Öncelik (Faz 3)
5. 🔲 Kapasite filtresi
6. 🔲 Arama sonrası misafir değiştirme
7. 🔲 Kapasite uyarıları

### Düşük Öncelik (Faz 4)
8. 🔲 Gelişmiş filtreleme
9. 🔲 Misafir profili kaydetme
10. 🔲 Grup rezervasyonu önerileri

## 📝 Notlar

### WebBeds API Kısıtlamaları
- Maksimum 50 hotel ID per batch request
- `searchhotels` sadece hotel ID + fiyat döner
- Detaylar için `getHotelsByIds` gerekli
- Oda kapasitesi `getRooms` ile alınabilir

### Performans İpuçları
- Arama sonuçlarını cache et (5 dakika)
- Debounce kullan (300ms)
- Lazy loading implement et
- Pagination kullan (20 otel per page)

### Gelecek Geliştirmeler
- AI tabanlı otel önerileri
- Dinamik fiyatlandırma
- Grup rezervasyonu indirimi
- Aile paketleri

---

**Doküman Versiyonu**: 1.0  
**Son Güncelleme**: 2025-03-10  
**Durum**: Taslak - Onay Bekliyor
