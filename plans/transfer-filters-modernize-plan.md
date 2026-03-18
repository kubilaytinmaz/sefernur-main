# Transfer Filtreleri Modernizasyon Planı

## Proje Özeti
`/transfer-sonuclar` sayfasındaki filtre bölümünü hem tasarım hem de veri açısından modernize ederek, otel filtreleri ile tutarlı ve kullanıcı dostu bir deneyim sunmak.

## Mevcut Durum Analizi

### Sorunlar
1. **Fiyat Aralığı Filtresi**: Basit input alanları, görsel geri bildirim yok
2. **Araç Tipi Filtresi**: Standart checkbox'lar, görsel hiyerarşi eksik
3. **Kapasite Filtresi**: Buton tasarımı yetersiz, yolcu sayısına göre akıllı filtreleme yok
4. **Özellikler Filtresi**: Uzun checkbox listesi, kategorizasyon yok
5. **Mobile Desteği**: Mobil için özel tasarım yok
6. **Aktif Filtre Gösterimi**: Hangi filtrelerin aktif olduğu net görünmüyor

### Referans Tasarım
- `web-app/src/components/hotels/HotelFilters.tsx` modern tasarım prensipleri
- Histogram tabanlı fiyat slider
- Compact buton grupları
- Collapsible bölümler

---

## Tasarım Hedefleri

### 1. Fiyat Aralığı Filtresi (Histogram ile)
- **Histogram Chart**: Fiyat dağılımını görsel olarak göster
- **Dual Thumb Slider**: Çift taraflı sürüklenebilir kontrol
- **Akıllı Step**: Fiyat aralığına göre hassasiyet ayarla
- **Tıklanabilir Bar'lar**: Histogram bar'larına tıklayarak hızlı filtreleme

### 2. Araç Tipi Filtresi (Görsel Kartlar)
- **İkonlu Kart Tasarımı**: Her araç tipi için ikon + isim
- **Grid Layout**: 2 sütunlu düzen
- **Hover Efektleri**: Aktif/passif durumları net göster
- **Araç Kapasitesi**: Her kartta kapasite bilgisi

### 3. Kapasite Filtresi (Akıllı Aralık)
- **Yolcu Sayısına Göre Otomatik**: URL'den gelen yolcu sayısına göre varsayılan aralık
- **Hızlı Seçim Butonları**: 1-3, 4-6, 7-10, 11-20, 20+ seçenekleri
- **Custom Range**: Manuel min/max input

### 4. Özellikler Filtresi (Kategorize)
- **Kategorize Edilmiş Layout**: Konfor, Teknoloji, İkram gibi gruplar
- **İkonlu Checkbox'lar**: Her özellik için ikon
- **Collapsible**: Uzun listeyi gizle/göster

### 5. Sıralama Seçenekleri
- **Compact Button Group**: Fiyat (Artan/Azalan), Kapasite, Değerlendirme
- **İkonlu Seçim**: Her sıralama için ikon

### 6. Mobile Responsive
- **Bottom Sheet**: Mobil cihazlarda alttan açılan panel
- **Swipe to Close**: Hareketle kapatma
- **Apply Button**: Değişiklikleri uygula butonu

---

## Teknik Detaylar

### Type Definitions
```typescript
export interface TransferFiltersState {
  vehicleTypes: VehicleType[];
  capacityRange: { min: number; max: number };
  priceRange: { min: number; max: number };
  amenities: VehicleAmenity[];
  sortBy: 'price-asc' | 'price-desc' | 'capacity-asc' | 'rating-desc';
}

interface TransferFiltersProps {
  filters: TransferFiltersState;
  onChange: (filters: TransferFiltersState) => void;
  resultCount: number;
  minPrice?: number;
  maxPrice?: number;
  prices?: number[]; // Tüm fiyatlar - histogram için
  isOpen?: boolean; // Mobile için
  onToggle?: () => void;
}
```

### Bileşen Yapısı
```
TransferFilters
├── FilterHeader (başlık, temizle butonu, aktif filtre sayısı)
├── ResultCountBadge
├── PriceRangeSlider (histogram + dual thumb)
├── VehicleTypeFilter (grid kartlar)
├── CapacityFilter (hızlı seçim + custom range)
├── AmenitiesFilter (kategorize, collapsible)
└── SortOptions (compact button group)
```

---

## Renk Paleti ve Tema

### Ana Renkler
- **Primary**: `cyan-600` (mevcut tema ile tutarlı)
- **Active State**: `cyan-50` bg, `cyan-600` text, `cyan-200` border
- **Hover State**: `cyan-50/50` bg
- **Histogram**: `cyan-400` → `cyan-300` gradient

### Border ve Shadow
- **Border**: `border-slate-200`
- **Shadow**: `shadow-sm`
- **Radius**: `rounded-lg` / `rounded-xl`

---

## Implementasyon Adımları

### Adım 1: PriceRangeSlider Bileşeni
- Histogram hesaplama logic'i
- Dual thumb slider implementasyonu
- Pointer events (mouse/touch) desteği
- Akıllı step hesaplama

### Adım 2: VehicleTypeFilter Bileşeni
- Araç tipi ikonları (Lucide icons)
- Grid layout (2 columns)
- Seçim state yönetimi

### Adım 3: CapacityFilter Bileşeni
- Hızlı seçim butonları
- Custom range input
- Yolcu sayısına göre varsayılan değer

### Adım 4: AmenitiesFilter Bileşeni
- Kategorizasyon (Konfor, Teknoloji, İkram)
- İkonlu checkbox'lar
- Collapsible section

### Adım 5: Mobile Desteği
- Bottom sheet component
- Apply/Cancel butonları
- Touch gesture desteği

### Adım 6: Ana Bileşen Entegrasyonu
- Tüm alt bileşenleri birleştir
- State yönetimi optimize et
- Aktif filtre sayacı ekle

---

## Dosya Yapısı

### Yeni Dosyalar
```
web-app/src/components/transfers/
├── TransferFilters.tsx (yeniden yazılacak)
├── filters/
│   ├── PriceRangeSlider.tsx
│   ├── VehicleTypeFilter.tsx
│   ├── CapacityFilter.tsx
│   ├── AmenitiesFilter.tsx
│   └── SortOptions.tsx
```

### Güncellenecek Dosyalar
```
web-app/src/app/transfer-sonuclar/page.tsx
- Filtre state yönetimi güncelle
- prices array'i filtre bileşenine geçir
- Mobile toggle state ekle
```

---

## Mockup / Wireframe

### Desktop Layout
```
┌─────────────────────────────────────┐
│  🔧 Filtreler              [2] Temizle │
│  ─────────────────────────────────── │
│  6 araç bulundu                     │
│                                     │
│  💰 Fiyat Aralığı                   │
│  ┌─────────────────────────────┐   │
│  │ ▃▅▆▅▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ │   │
│  │ ●─────────────●             │   │
│  └─────────────────────────────┘   │
│  $67 - $267                        │
│                                     │
│  🚗 Araç Tipi                       │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 🚗  │ │ 🚐  │ │ 🚌  │          │
│  │Sedan│ │ Van │ │Otobüs│          │
│  └─────┘ └─────┘ └─────┘          │
│                                     │
│  👥 Kapasite                        │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │1-3  │ │4-6  │ │7-10 │          │
│  └─────┘ └─────┘ └─────┘          │
│                                     │
│  ✨ Özellikler ▼                    │
│  (collapsible content)              │
│                                     │
│  📊 Sıralama ▼                      │
│  (collapsible content)              │
└─────────────────────────────────────┘
```

### Mobile Layout (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  (Results Area - scrollable)        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔧 Filtreler        [2]    │   │
│  ├─────────────────────────────┤   │
│  │  (Filter Content)           │   │
│  │  - Price Range              │   │
│  │  - Vehicle Type             │   │
│  │  - Capacity                 │   │
│  │  - Amenities                │   │
│  │  - Sort                     │   │
│  ├─────────────────────────────┤   │
│  │  [6 Sonuç Göster]           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Kullanıcı Akışı

1. **Sayfa Yükleme**: URL parametrelerine göre varsayılan filtreler ayarlanır
2. **Fiyat Filtreleme**: Histogram'da bar tıklanır veya thumb sürüklenir
3. **Araç Tipi Seçimi**: Görsel kartlara tıklanır
4. **Kapasite Ayarı**: Hızlı butonlar veya custom input kullanılır
5. **Sonuç Güncelleme**: Her filtre değişikliğinde sonuçlar anında güncellenir
6. **Filtre Temizleme**: "Temizle" butonu ile tüm filtreler sıfırlanır

---

## Başarı Kriterleri

- [ ] Fiyat histogramı doğru çalışır ve görsel olarak nettir
- [ ] Araç tipi kartları görsel olarak çekici ve anlaşılır
- [ ] Kapasite filtresi yolcu sayısına göre akıllı varsayılan kullanır
- [ ] Özellikler kategorize edilmiş ve kolay erişilebilir
- [ ] Mobile cihazlarda bottom sheet düzgün çalışır
- [ ] Aktif filtre sayısı doğru gösterilir
- [ ] Filtre temizleme butonu düzgün çalışır
- [ ] Tüm bileşenler otel filtreleri ile tutarlı tasarıma sahiptir

---

## Sonraki Adımlar

Bu plan onaylandıktan sonra:
1. Code moduna geç
2. Alt bileşenleri oluştur (PriceRangeSlider, VehicleTypeFilter, vb.)
3. Ana TransferFilters bileşenini yeniden yaz
4. page.tsx'i güncelle
5. Test et ve responsive kontrolü yap
