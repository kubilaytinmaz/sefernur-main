# Otel Resim Görüntüleme Sorunu - Çözüm Planı

## Sorun Analizi

### Kök Neden
Bazı otellerde resimler görünmüyor çünkü:

1. **Unsplash API Kapatıldı**: `source.unsplash.com` servisi artık çalışmıyor (deprecated)
2. **WebBeds Resimleri Kullanılmıyor**: API'den gelen resimler (`@_Image` key'i) kodda düzgün okunmuyor
3. **Yetersiz Fallback**: `onError` handler'ları da yine Unsplash'e yönlendiriyor

### Teknik Detaylar

#### WebBeds API Yanıtı
API'den gelen veri yapısı:
```json
{
  "hotelImages": {
    "thumb": "https://static-images.webbeds.com/0/image/55eef1ee-eafe-44ea-bbc0-2501ebd6cb0d.jpg",
    "image": [
      {
        "url": "https://static-images.webbeds.com/...",
        "alt": "Hotel Image",
        "category": {"#text": "Hotel", "@_id": "48809"}
      }
    ]
  }
}
```

#### Mevcut Kod Akışı
1. [`xml-parser.ts:243-246`](web-app/src/lib/webbeds/xml-parser.ts:243) - WebBeds resimlerini parse edip `@_Image` key'ine yazıyor ✅
2. [`page.tsx:88-108`](web-app/src/app/hotels/page.tsx:88) - `getHotelImageUrl()` fonksiyonu `@_image` arıyor ama büyük harfle `@_Image` geldiği için bulamıyor ❌
3. [`page.tsx:208`](web-app/src/app/hotels/page.tsx:208) - Otel kartlarına resim URL'i aktarılıyor
4. Fallback olarak Unsplash kullanılıyor ❌

## Çözüm Stratejisi

### 1. WebBeds Resimlerini Düzgün Kullan

#### Dosya: `web-app/src/app/hotels/page.tsx`

**Sorun**: [`getHotelImageUrl()`](web-app/src/app/hotels/page.tsx:88) fonksiyonu `@_Image` key'ini aramıyor

**Çözüm**:
```typescript
function getHotelImageUrl(hotel: WebBedsHotelItem): string {
  const fromKnown = findFirstStringByKeys(hotel, [
    "@_Image",        // ← XML parser'ın set ettiği key (BÜYÜK HARFLE)
    "@_image",        // ← küçük harf variant
    "@_mainimage",
    "mainimage",
    "image",
    "@_imageurl",
    "imageurl",
    "@_thumbnail",
    "thumbnail",
    "@_photo",
    "photo",
    "@_hotelimage",
    "hotelimage",
  ]);

  if (fromKnown && fromKnown.startsWith("http")) return fromKnown;

  // Fallback: Placeholder resim (yerel asset)
  return "/images/hotel-placeholder.jpg";
}
```

### 2. HotelCard Bileşenini Güncelle

#### Dosya: `web-app/src/components/hotels/HotelCard.tsx`

**Sorun**: 
- [`getHotelImageUrl()`](web-app/src/components/hotels/HotelCard.tsx:49) fonksiyonu Unsplash kullanıyor
- [`onError` handler'lar](web-app/src/components/hotels/HotelCard.tsx:102) Unsplash'e fallback yapıyor

**Çözüm**:
```typescript
function getHotelImageUrl(hotel: HotelCardData): string {
  // Eğer image prop'u varsa ve http ile başlıyorsa kullan
  if (hotel.image && hotel.image.startsWith("http")) {
    return hotel.image;
  }
  
  // Fallback: Placeholder
  return "/images/hotel-placeholder.jpg";
}

function getDefaultImage(): string {
  return "/images/hotel-placeholder.jpg";
}

// Image onError handler'ı
<img
  onError={(e) => {
    e.currentTarget.src = "/images/hotel-placeholder.jpg";
  }}
/>
```

### 3. Otel Detay Sayfasını Güncelle

#### Dosya: `web-app/src/app/hotels/[hotelId]/_client.tsx`

**Sorun**: 
- [`hotelImage` state](web-app/src/app/hotels/[hotelId]/_client.tsx:421) Unsplash default kullanıyor
- [`hotelImages` array](web-app/src/app/hotels/[hotelId]/_client.tsx:427) Unsplash URL'leri içeriyor
- [`onError` handler'lar](web-app/src/app/hotels/[hotelId]/_client.tsx:667) Unsplash'e fallback yapıyor

**Çözüm**:
```typescript
// hotelImage default değeri
const hotelImage =
  searchParams.get("image") ||
  "/images/hotel-placeholder.jpg";

// hotelImages array - Tek resim varsa onu 3 kez göster
const hotelImages = useMemo(() => {
  const baseImage = hotelImage;
  if (baseImage && baseImage.startsWith("http")) {
    return [baseImage, baseImage, baseImage];
  }
  return [
    "/images/hotel-placeholder.jpg",
    "/images/hotel-placeholder.jpg",
    "/images/hotel-placeholder.jpg"
  ];
}, [hotelImage]);

// onError handler
<img
  onError={(e) => {
    e.currentTarget.src = "/images/hotel-placeholder.jpg";
  }}
/>
```

### 4. Placeholder Resim Ekle

**Yeni Dosya**: `web-app/public/images/hotel-placeholder.jpg`

Seçenekler:
1. Generic hotel/building illüstrasyonu
2. Logo/brand placeholder
3. Gradient background with icon

**Geçici Çözüm**: SVG placeholder (kod içinde)
```typescript
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Crect fill='%23e2e8f0' width='1200' height='700'/%3E%3Ctext fill='%2394a3b8' font-family='system-ui' font-size='48' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";
```

## Uygulama Adımları

### Adım 1: Otel Listesi Sayfası (page.tsx)
- [ ] `getHotelImageUrl()` fonksiyonuna `@_Image` key'ini ekle
- [ ] Unsplash fallback'ini placeholder ile değiştir

### Adım 2: HotelCard Bileşeni
- [ ] `getHotelImageUrl()` fonksiyonunu sadeleştir
- [ ] `getDefaultImage()` fonksiyonunu placeholder döndürecek şekilde güncelle
- [ ] Tüm `onError` handler'larını placeholder kullanacak şekilde değiştir
- [ ] Unsplash URL'lerini tamamen kaldır

### Adım 3: Otel Detay Sayfası (_client.tsx)
- [ ] `hotelImage` default değerini placeholder yap
- [ ] `hotelImages` array'ini tek resmi 3 kez kullanacak şekilde düzenle
- [ ] Tüm `onError` handler'larını güncelle
- [ ] Unsplash URL'lerini kaldır

### Adım 4: Placeholder Resim
- [ ] SVG placeholder ile başla (inline data URL)
- [ ] İsterseniz daha sonra gerçek resim eklenebilir

### Adım 5: Test
- [ ] Resmi olan otellerin düzgün göründüğünü kontrol et
- [ ] Resmi olmayan otellerin placeholder gösterdiğini kontrol et
- [ ] onError durumlarında placeholder'ın çalıştığını test et

## Beklenen Sonuç

✅ WebBeds API'den gelen resimler düzgün görüntülenecek
✅ Resmi olmayan otellerde profesyonel placeholder gösterilecek
✅ Unsplash bağımlılığı tamamen kaldırılacak
✅ Resim yükleme hataları güvenli şekilde yönetilecek

## Ek Notlar

### WebBeds Resim Kalitesi
WebBeds API'si genellikle kaliteli otel resimleri sağlıyor:
- `thumb`: Küçük önizleme resimleri
- `image`: Array içinde birden fazla resim
- URL format: `https://static-images.webbeds.com/...`

### Case Sensitivity
XML parser `@_` prefix'i ile attribute'ları parse ediyor ve büyük harfle (`@_Image`) key oluşturuyor. `findFirstStringByKeys()` fonksiyonu case-insensitive arama yapıyor ancak listeye büyük harfli versiyonu eklemek daha güvenli.

### Performans
Placeholder resim olarak SVG data URL kullanmak:
- Ekstra HTTP isteği gerektirmez
- Instant yükleme sağlar
- Boyutu çok küçük (~500 bytes)

### Alternatif Placeholder Kaynakları
- **Pexels/Pixabay**: Ücretsiz otel/building resimleri
- **UI Avatars**: Otel adından dinamik placeholder
- **Gradient + Icon**: Tailwind gradients + Lucide Building2 icon
