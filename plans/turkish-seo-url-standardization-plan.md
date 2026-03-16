# Türkçe SEO Uyumlu URL Standardizasyon Planı

## Sorun

Transferler sayfasında popüler turlar bölümünden bir tur seçip araca tıklandığında, rezervasyon sayfasında fiyat yerine "Teklif al" yazısı görünüyor.

### Root Cause

1. **ID Format Uyuşmazlığı**: Tur ID'leri `service-*` formatında, ancak `parseSlugWithId` fonksiyonu `tour-*`, `guide-*`, `transfer-*` prefix'lerini arıyor
2. **URL Parse Hatası**: Yanlış ID çıkartılıyor → tur verisi bulunamıyor → fiyat 0 oluyor → "Teklif al" yazısı gösteriliyor

## Çözüm Stratejisi

### Yaklaşım: ID Format Standardizasyonu + Türkçe SEO URL'leri

Uzun vadeli en iyi çözüm:
1. ID formatlarını standardize et (`service-*` → `tour-*`, `guide-*`)
2. Türkçe karakterli SEO uyumlu URL'ler oluştur
3. URL parse mantığını güncelle

## Yeni ID Formatları

### Mevcut → Yeni Format

| Mevcut ID | Yeni ID | Tür |
|-----------|---------|-----|
| `service-city-tour-makkah` | `tour-mekke-sehir` | Tur |
| `service-city-tour-madinah` | `tour-medine-sehir` | Tur |
| `service-hajj-umrah-guide` | `guide-hac-umreh` | Rehber |
| `service-taif-tour` | `tour-taif-gunubirlik` | Tur |
| `service-jeddah-city-tour` | `tour-cidde-sehir` | Tur |
| `service-ziyarat-makkah` | `tour-mekke-ziyaret` | Tur |
| `service-ziyarat-madinah` | `tour-medine-ziyaret` | Tur |
| `service-private-guide` | `guide-ozel` | Rehber |

### Yeni URL Formatları

**Örnek URL'ler:**
```
/transfer-rezervasyon/mercedes-vito-abc123/tur-mekke-sehir
/transfer-rezervasyon/mercedes-vito-abc123/tur-medine-sehir
/transfer-rezervasyon/mercedes-vito-abc123/tur-taif-gunubirlik
```

**Çoklu tur:**
```
/transfer-rezervasyon/mercedes-vito-abc123/tur-mekke-sehir?extraTours=tur-medine-sehir,tur-taif-gunubirlik
```

## Değiştirilecek Dosyalar

### 1. popular-services-data.ts
**Dosya:** [`web-app/src/lib/data/popular-services-data.ts`](web-app/src/lib/data/popular-services-data.ts)

**Değişiklik:** ID'leri yeni formata güncelle

```typescript
export const POPULAR_SERVICES: PopularServiceModel[] = [
  {
    id: 'tour-mekke-sehir',  // service-city-tour-makkah → tour-mekke-sehir
    type: 'tour',
    name: 'Mekke Şehir Turu',
    // ... rest of data
  },
  {
    id: 'tour-medine-sehir',  // service-city-tour-madinah → tour-medine-sehir
    type: 'tour',
    name: 'Medine Şehir Turu',
    // ... rest of data
  },
  {
    id: 'guide-hac-umreh',  // service-hajj-umrah-guide → guide-hac-umreh
    type: 'guide',
    name: 'Hac & Umre Rehberliği',
    // ... rest of data
  },
  // ... diğer turlar
];
```

### 2. parseSlugWithId Fonksiyonu
**Dosya:** [`web-app/src/lib/transfers/booking.ts`](web-app/src/lib/transfers/booking.ts:325)

**Değişiklik:** Prefix listesini güncelle

```typescript
export function parseSlugWithId(slug: string): { slug: string; id: string } {
  // Güncellenmiş prefix listesi
  const knownPrefixes = ['tour-', 'guide-', 'transfer-', 'service-']; // service- legacy için

  for (const prefix of knownPrefixes) {
    const prefixIndex = slug.lastIndexOf(prefix);
    if (prefixIndex !== -1) {
      const id = slug.substring(prefixIndex);
      const slugPart = slug.substring(0, prefixIndex - 1);
      return { slug: slugPart, id };
    }
  }

  // Fallback
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  const slugPart = parts.slice(0, -1).join("-");

  return { slug: slugPart, id };
}
```

### 3. URL Oluşturma Mantığı
**Dosya:** [`web-app/src/app/transfers/page.tsx`](web-app/src/app/transfers/page.tsx:310)

**Değişiklik:** Türkçe SEO uyumlu slug oluştur

```typescript
// Booking URL oluştur
const bookingUrl = useMemo(() => {
  if (selectedServices.length === 0) {
    return `/transfer-rezervasyon/${vehicleSlug}/tursuz`;
  }

  const firstService = selectedServices[0];
  // Türkçe karakterli SEO slug
  const tourSlug = `${createSlug(firstService.name)}-${firstService.id}`;
  const baseUrl = `/transfer-rezervasyon/${vehicleSlug}/${tourSlug}`;

  if (selectedServices.length > 1) {
    const extraTourIds = selectedServices.slice(1).map(s => s.id).join(',');
    return `${baseUrl}?extraTours=${extraTourIds}`;
  }
  return baseUrl;
}, [selectedServices, vehicleSlug]);
```

### 4. createSlug Fonksiyonu (Zaten mevcut)
**Dosya:** [`web-app/src/lib/transfers/seo-slugs.ts`](web-app/src/lib/transfers/seo-slugs.ts:26)

Bu fonksiyon zaten Türkçe karakterleri İngilizce'ye çeviriyor ve SEO uyumlu slug oluşturuyor:
- "Mekke Şehir Turu" → "mekke-sehir-turu"
- "Medine Şehir Turu" → "medine-sehir-turu"

## Yeni URL Örnekleri

### Tek Tur Seçimi
```
/transfer-rezervasyon/mercedes-vito-vip-abc123/mekke-sehir-turu-tour-mekke-sehir
```

### Çoklu Tur Seçimi
```
/transfer-rezervasyon/mercedes-vito-vip-abc123/mekke-sehir-turu-tour-mekke-sehir?extraTours=tour-medine-sehir,tour-taif-gunubirlik
```

### Tursuz
```
/transfer-rezervasyon/mercedes-vito-vip-abc123/tursuz
```

## Test Senaryoları

### Test 1: Tek Tur Seçimi
1. Transferler sayfasına git
2. "Mekke Şehir Turu" seç
3. Araca tıkla
4. **Beklenen URL:** `/transfer-rezervasyon/.../mekke-sehir-turu-tour-mekke-sehir`
5. **Beklenen Sonuç:** Fiyat doğru görünsün

### Test 2: Çoklu Tur Seçimi
1. Transferler sayfasına git
2. "Mekke Şehir Turu" + "Medine Şehir Turu" seç
3. Araca tıkla
4. **Beklenen URL:** `/transfer-rezervasyon/.../mekke-sehir-turu-tour-mekke-sehir?extraTours=tour-medine-sehir`
5. **Beklenen Sonuç:** Toplam fiyat doğru görünsün

### Test 3: Tursuz
1. Tur seçmeden araca tıkla
4. **Beklenen URL:** `/transfer-rezervasyon/.../tursuz`
5. **Beklenen Sonuç:** Sadece transfer fiyatı görünsün

## SEO Avantajları

### Yeni URL Formatı
```
/transfer-rezervasyon/mercedes-vito-vip/mekke-sehir-turu
```

### SEO Anahtar Kelimeler
- ✅ "mekke sehir turu" - URL'de geçiyor
- ✅ "mercedes vito vip" - URL'de geçiyor
- ✅ "transfer rezervasyon" - URL'de geçiyor
- ✅ Türkçe karakterler → İngilizce'ye çevriliyor (SEO için)
- ✅ Tire ile ayrılmış kelimeler (Google için ideal)

## Geriye Dönük Uyumluluk

### Legacy URL'ler
Eski URL'ler (`service-*` formatında) hala çalışmalı:

```typescript
const knownPrefixes = ['tour-', 'guide-', 'transfer-', 'service-'];
```

Bu sayede:
- Eski linkler kırılmaz
- Arama motoru indexleri korunur
- Kullanıcı deneyimi bozulmaz

## Uygulama Sırası

1. ✅ **popular-services-data.ts** - ID'leri güncelle
2. ✅ **booking.ts** - parseSlugWithId fonksiyonunu güncelle
3. ✅ **transfers/page.tsx** - URL oluşturma mantığını kontrol et
4. ✅ **Test** - Tüm senaryoları test et

## Riskler ve Önlemler

### Risk 1: Eski Linklerin Kırılması
**Önlem:** `service-` prefix'ini desteklemeye devam et

### Risk 2: Arama Motoru Indexleri
**Önlem:** 301 redirect eklemek gerekebilir (production için)

### Risk 3: Cache Sorunları
**Önlem:** React Query cache'ini temizle

## Sonuç

Bu değişikliklerle:
1. ✅ URL'ler Türkçe ve SEO uyumlu olacak
2. ✅ ID formatları tutarlı olacak
3. ✅ Fiyat doğru şekilde gösterilecek
4. ✅ "Teklif al" sorunu çözülecek
5. ✅ Geriye dönük uyumluluk korunacak
