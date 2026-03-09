# Otel Detay Sayfası - Kapsamlı Tasarım Planı

## 📋 Mevcut Durum Analizi

### Mevcut Özellikler
- ✅ Hero section (resim + otel bilgisi kartı) - Glassmorphism tasarım
- ✅ Quick info bar (tarih, yetişkin sayısı)
- ✅ Oda listesi + Rezervasyon formu
- ✅ Sticky booking form (desktop)

### Mevcut Sorunlar
- ❌ Tek resim gösterimi (WebBeds API'den çoklu resim geliyor)
- ❌ Otel açıklaması yok
- ❌ Olanaklar/Özellikler listesi yok
- ❌ Lokasyon/harita bilgisi yok
- ❌ Kullanıcı yorumları yok
- ❌ İptal politikası detayı yok
- ❌ Benzer oteller önerisi yok

---

## 🎯 Tasarım Hedefleri

1. **Bilgi Zenginliği:** Otel hakkında mümkün olan tüm bilgileri göster
2. **Görsel Etki:** Çoklu resim galerisi ile oteli daha iyi tanıt
3. **Kullanıcı Güveni:** Yorumlar ve detaylı bilgilerle güven oluştur
4. **Dönüşüm Oranı:** Kolay rezervasyon akışı ile satışı artır
5. **Mekke/Medine Odaklı:** Kutsal mekana uzaklık bilgisi vurgula

---

## 📐 Sayfa Düzeni (Layout)

```
┌─────────────────────────────────────────────────────────────┐
│                    HERO SECTION                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │                 │  │  Otel Adı                        │  │
│  │   Ana Resim     │  │  ★★★★★                          │  │
│  │                 │  │  📍 Adres                        │  │
│  │                 │  │  📅 Tarihler                     │  │
│  │                 │  │  💰 Fiyat                        │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              RESİM GALERİSİ (Grid)                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │    │ │    │ │    │ │    │ │    │ │    │               │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  OTEL BİLGİLERİ | OLANAKLAR | LOKASYON | YORUMLAR          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Açıklama     │ │ İkonlu       │ │ Google Maps  │        │
│  │ Check-in/out │ │ Olanaklar    │ │ Uzaklık      │        │
│  │ Özellikler   │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Kullanıcı Yorumları (Google Places)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  ODA SEÇENEKLERİ (Sol)     |    REZERVASYON (Sağ/Sticky)  │
│  ┌──────────────────────┐  │  ┌──────────────────────┐    │
│  │ Oda Kartı 1          │  │  │ Form                 │    │
│  │ Oda Kartı 2          │  │  │ Ödeme                │    │
│  │ ...                 │  │  │                      │    │
│  └──────────────────────┘  │  └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  BENZER OTELLER                                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│  └────┘ └────┘ └────┘ └────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Teknik Gereksinimler

### API Veri Yapısı (WebBeds)

```typescript
// WebBeds API'den gelen veriler:
interface HotelDetailData {
  hotelName: string;
  address: string;
  fullAddress: {
    hotelStreetAddress: string;
    hotelZipCode: string;
    hotelCountry: string;
    hotelCity: string;
  };
  rating: string; // 561 = 3★, 562 = 4★, 563 = 5★
  hotelImages: {
    thumb: string;
    image: Array<{
      url: string;
      alt: string;
      category: { #text: string; @_id: string };
    }>;
  };
  description1: string; // Otel açıklaması
  geoPoint: {
    lat: number;
    lng: number;
  };
  cityName: string;
  cityCode: number;
  countryName: string;
}
```

### Yeni API Endpoint'leri

1. **Otel Detay API** (`/api/webbeds/hotel/[hotelId]`)
   - Tek otelin detaylı bilgilerini çeker
   - Resimler, açıklama, koordinatlar

2. **Google Places Reviews API** (Mevcut ratings API'ye ekle)
   - Yorum metinleri de çekilmeli
   - Place Details API kullanılacak

---

## 📝 Detaylı Bölüm Planları

### 1. Resim Galerisi Bölümü

**Konum:** Hero section hemen altı

**Özellikler:**
- Grid layout (ana resim + 5 küçük resim)
- Hover ile büyütme efekti
- Tıklayınca lightbox/modal açılması
- WebBeds `hotelImages.image[]` kullanımı
- Fallback: Şehir resimleri

**Komponent:** `HotelImageGallery.tsx`

```typescript
interface HotelImageGalleryProps {
  images: string[];
  hotelName: string;
}
```

### 2. Otel Bilgileri Bölümü

**Konum:** Resim galerisi altı, sol kolon

**İçerik:**
- Otel açıklaması (`description1`)
- Check-in/Check-out saatleri
- Otel kategorisi/rating
- Dil desteği
- Ödeme yöntemleri

**Komponent:** `HotelInfoSection.tsx`

### 3. Olanaklar (Amenities) Bölümü

**Konum:** Otel bilgileri yanında

**Özellikler:**
- İkonlu grid layout
- Kategoriler: Genel, Oda, Hizmetler, Yiyecek
- WebBeds API'den `amenities` veya `facility` verisi
- Varsayılan ikon seti (Lucide icons)

**Komponent:** `HotelAmenities.tsx`

```typescript
interface AmenityCategory {
  name: string;
  icon: string;
  items: string[];
}
```

### 4. Lokasyon Bölümü

**Konum:** Olanaklar altı

**Özellikler:**
- Google Maps embed
- Kutsal mekana uzaklık (Mekke/Medine için)
- Adres detayları
- Yakın ulaşım noktaları

**Komponent:** `HotelLocation.tsx`

### 5. Kullanıcı Yorumları Bölümü

**Konum:** Lokasyon altı

**Özellikler:**
- Google Places API'den yorumlar
- Yorum kartları (avatar, isim, puan, metin)
- "Tüm yorumları gör" linki (Google Maps'e)
- Ortalama puan göstergesi

**Komponent:** `HotelReviews.tsx`

### 6. İptal Politikası Bölümü

**Konum:** Yorumlar altı veya oda kartı içinde

**Özellikler:**
- Accordion tasarım
- Ücretsiz iptal koşulları
- İptal deadline bilgisi
- İade politikası

**Komponent:** `CancellationPolicy.tsx`

### 7. Benzer Oteller Bölümü

**Konum:** Sayfanın en altı

**Özellikler:**
- Aynı şehirdeki benzer oteller
- Mini kart tasarımı
- Fiyat karşılaştırması
- "İncele" butonu

**Komponent:** `SimilarHotels.tsx`

---

## 🎨 Tasarım Prensipleri

### Renk Paleti
- Primary: Emerald (mevcut tutarlılık için)
- Secondary: Slate
- Accent: Amber (yıldızlar için)

### Tipografi
- Başlıklar: Inter/SF Pro Display
- Body: Inter/SF Pro Text
- Fiyat: Monospace (opsiyonel)

### Efektler
- Glassmorphism (mevcut hero ile tutarlı)
- Subtle shadows
- Smooth transitions (200-300ms)
- Hover states

### Responsive
- Mobile: Stack layout
- Tablet: 2 kolon
- Desktop: 3 kolon (oda listesi + sticky form)

---

## 🚀 Implementasyon Sırası

### Faz 1: Temel Bölümler (Yüksek Öncelik)
1. Resim Galerisi
2. Otel Bilgileri
3. Olanaklar

### Faz 2: Gelişmiş Özellikler (Orta Öncelik)
4. Lokasyon + Google Maps
5. Kullanıcı Yorumları
6. İptal Politikası

### Faz 3: UX İyileştirmeleri (Düşük Öncelik)
7. Benzer Oteller
8. Loading states
9. Error handling
10. SEO optimizasyonu

---

## 📦 Yeni Dosya Yapısı

```
web-app/src/
├── components/
│   └── hotels/
│       ├── HotelImageGallery.tsx      (YENİ)
│       ├── HotelInfoSection.tsx       (YENİ)
│       ├── HotelAmenities.tsx         (YENİ)
│       ├── HotelLocation.tsx          (YENİ)
│       ├── HotelReviews.tsx           (YENİ)
│       ├── CancellationPolicy.tsx     (YENİ)
│       ├── SimilarHotels.tsx          (YENİ)
│       └── index.ts                   (GÜNCELLE)
├── app/
│   ├── api/
│   │   └── webbeds/
│   │       └── hotel/
│   │           └── [hotelId]/
│   │               └── route.ts       (YENİ)
│   └── hotels/
│       └── [hotelId]/
│           └── _client.tsx            (GÜNCELLE)
└── lib/
    └── hotels/
        └── detail-types.ts            (YENİ)
```

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Resim Yönetimi:**
   - WebBeds resimleri bazen yüklenmeyebilir
   - Her zaman fallback resim hazır olmalı
   - Lazy loading kullanılmalı

2. **API Rate Limiting:**
   - Google Places API quota'sı dikkatli kullanılmalı
   - Cache mekanizması önemli

3. **Performance:**
   - Çoklu resim lazy loading
   - Component lazy loading
   - Image optimization (Next.js Image)

4. **Accessibility:**
   - Alt text for images
   - ARIA labels
   - Keyboard navigation
   - Focus states

---

## 🔄 Sonraki Adımlar

Bu plan onaylandıktan sonra:
1. Code mode'a geçiş
2. Komponentleri sırayla oluştur
3. API endpoint'lerini ekle
4. Test ve debug
5. Responsive kontrol

---

## 📊 Başarı Metrikleri

- Sayfa yükleme süresi < 3 saniye
- Resim yükleme başarısı > 95%
- Mobil UX skoru > 90
- Rezervasyon dönüşüm oranı artışı
