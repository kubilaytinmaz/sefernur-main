# Transferler Sayfası - Birleşik Bölüm Tasarım Planı

## Özet

`/transferler/` sayfasındaki "Popüler Turlar" ve "Müsait Araçlar" bölümlerinin görsel olarak birleştirilmesi ve tur seçimi ile fiyat dinamik güncellemesinin netleştirilmesi.

## Mevcut Sorun

1. **Görsel Ayrım:** Popüler Turlar ve Müsait Araçlar bölümleri ayrı görünüyorsa da aslında birbirine bağlı
2. **Fiyat Karışıklığı:** Tur seçilmediğinde saatlik fiyat, seçildiğinde tur fiyatı gösteriliyor - bu net değil
3. **Bağlantı Eksikliği:** Kullanıcı tur seçiminin araç fiyatlarını nasıl etkilediğini görmüyor

## Tasarım Hedefleri

1. **Tek Birleşik Bölüm:** Tur seçimi ve araç kartları tek bir görsel yapıda
2. **Dinamik Fiyat:** Tur seçimi yapıldığında fiyatlar anında güncellenmeli ve bu görsel olarak belirgin olmalı
3. **Saatlik Kiralama:** Tur seçimi yoksa saatlik kiralama modu açıkça belirtilmeli
4. **Geriye Uyumluluk:** Eski tasarım kolayca geri yüklenebilmeli

---

## Yeni Tasarım Yapısı

### 1. Ana Bölüm Düzeni

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSFER HİZMETLERİ                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Arama Formu (Hero Section)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │         POPÜLER TURLAR & SAATLİK KİRALAMA         │  │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │  │   │
│  │  │  │  Tur 1 │ │  Tur 2 │ │  Tur 3 │ │  Tur 4 │ │  │   │
│  │  │  │ [Seç]  │ │ [Seç]  │ │ ✓ Seçili│ │ [Seç]  │ │  │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │  │   │
│  │  │                                                   │  │   │
│  │  │  ┌─────────────────────────────────────────────┐  │  │   │
│  │  │  │  Seçim Modu: [ ] Tur Seç  [✓] Saatlik Kirala│  │  │   │
│  │  │  │  Saat: [1▼]  (Saatlik mod aktif)            │  │  │   │
│  │  │  └─────────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  SEÇİM ÖZETİ (Sadece seçim varsa görünür)        │  │   │
│  │  │  ✓ Mekke Turu (3 saat) - 150₺                    │  │   │
│  │  │  ✓ Arafat Turu (2 saat) - 100₺                    │  │   │
│  │  │  ─────────────────────────────────                │  │   │
│  │  │  Toplam: 5 saat | 250₺                            │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MÜSAİT ARAÇLAR                               │   │
│  │  (Fiyatlar yukarıdaki seçime göre güncellenir)           │   │
│  │                                                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │          │ │          │ │          │ │          │   │   │
│  │  │  Sedan   │ │   Van    │ │   VIP    │ │  Coster  │   │   │
│  │  │          │ │          │ │          │ │          │   │   │
│  │  │  250₺    │ │  300₺    │ │  500₺    │ │  350₺    │   │   │
│  │  │  (Saatlik│ │  (Saatlik│ │  (Saatlik│ │  (Saatlik│   │   │
│  │  │   1 saat)│ │   1 saat)│ │   1 saat)│ │   1 saat)│   │   │
│  │  │          │ │          │ │          │ │          │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Bölüm 1: Tur Seçimi ve Saatlik Kiralama

#### 2.1 Başlık Alanı
```tsx
<div className="flex items-center justify-between mb-4">
  <div>
    <h2 className="text-xl font-bold text-slate-900">
      <span className="flex items-center gap-2">
        <Star className="w-5 h-5 text-cyan-600" />
        Popüler Turlar & Saatlik Kiralama
      </span>
    </h2>
    <p className="text-sm text-slate-600 mt-1">
      Tur seçin veya saatlik araç kiralayın
    </p>
  </div>
  <ModeToggle />
</div>
```

#### 2.2 Mod Seçici (Yeni Bileşen)
```tsx
// ModeToggle.tsx
interface ModeToggleProps {
  mode: 'tour' | 'hourly';
  onModeChange: (mode: 'tour' | 'hourly') => void;
  selectedHours: number;
  onHoursChange: (hours: number) => void;
}

// Görsel Tasarım:
// ┌─────────────────────────────────────────────────────────┐
// │  ○ Tur Seçimi    ● Saatlik Kiralama                     │
// │  ─────────────────────────────────────────────────────  │
// │  Kiralama Süresi:  [1▼] saat                            │
// └─────────────────────────────────────────────────────────┘
```

#### 2.3 Tur Kartları (Mevcut PopularServicesSection'tan)
- Yatay kaydırmalı kartlar korunacak
- Seçim durumu görsel olarak belirgin olacak
- Her kartta fiyat bilgisi gösterilecek

### 3. Bölüm 2: Seçim Özeti (Koşullu)

```tsx
// Sadece seçim varsa görünür
{selectionCount > 0 && (
  <SelectionSummaryCard 
    selectedServices={selectedServices}
    mode={mode}
    selectedHours={selectedHours}
    onRemove={handleRemove}
    onClearAll={handleClearAll}
  />
)}
```

#### 3.1 Seçim Özeti Kartı Tasarımı
```tsx
// Tur Seçimi Modu:
┌─────────────────────────────────────────────────────────┐
│  ✓ SEÇİMLİ TURLAR (2)                    [Tümünü Kaldır]│
│  ─────────────────────────────────────────────────────  │
│  1. 🕌 Mekke Turu           3 saat  •  150₺             │
│  2. ⛰️ Arafat Turu          2 saat  •  100₺             │
│  ─────────────────────────────────────────────────────  │
│  Toplam Süre: 5 saat  |  Toplam: 250₺                   │
└─────────────────────────────────────────────────────────┘

// Saatlik Kiralama Modu:
┌─────────────────────────────────────────────────────────┐
│  ⏱ SAATLİK KİRALAMA                                    │
│  ─────────────────────────────────────────────────────  │
│  Kiralama Süresi: 1 saat                                │
│  Araç tipine göre fiyat aşağıda gösterilir              │
└─────────────────────────────────────────────────────────┘
```

### 4. Bölüm 3: Müsait Araçlar

#### 4.1 Başlık ve Alt Başlık
```tsx
<div className="mb-4">
  <h2 className="text-lg font-bold text-slate-900">
    Müsait Araçlar
  </h2>
  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
    {mode === 'hourly' 
      ? `Saatlik kiralama fiyatları (${selectedHours} saat için)`
      : `Seçili turlar için fiyatlar (${selectionCount} tur)`
    }
    <Info className="w-3 h-3 text-cyan-600" />
  </p>
</div>
```

#### 4.2 Araç Kartı Fiyat Gösterimi

**Saatlik Mod:**
```tsx
// Fiyat alanı
<div className="text-right">
  <p className="text-[9px] text-slate-400 uppercase">
    {selectedHours === 24 ? 'Günlük' : `${selectedHours} Saatlik`}
  </p>
  <p className="text-base font-bold text-cyan-700">
    {formatTlUsdPairFromUsd(hourlyRate * selectedHours)}
  </p>
  <p className="text-[9px] text-slate-400">
    {hourlyRate} USD/saat
  </p>
</div>
```

**Tur Seçimi Modu:**
```tsx
// Fiyat alanı
<div className="text-right">
  <p className="text-[9px] text-slate-400 uppercase">
    Transfer + {selectionCount} Tur
  </p>
  <p className="text-base font-bold text-cyan-700">
    {formatTlUsdPairFromUsd(totalPrice)}
  </p>
  <p className="text-[9px] text-slate-400 line-clamp-2">
    {selectedServices.map(s => s.name).join(' + ')}
  </p>
</div>
```

#### 4.3 Fiyat Değişim Animasyonu
```tsx
// Fiyat değiştiğinde animasyon
<div className={cn(
  "transition-all duration-300",
  priceChanged && "animate-pulse bg-cyan-50 rounded-lg px-2 py-1"
)}>
  {formattedPrice}
</div>
```

---

## State Yönetimi

### Ana State Yapısı
```tsx
interface TransfersPageState {
  // Seçim modu
  mode: 'tour' | 'hourly';
  
  // Tur seçimi
  selectedServiceIds: string[];
  selectedServices: PopularServiceModel[];
  
  // Saatlik kiralama
  selectedHours: number;
  
  // Fiyat değişim animasyonu için
  priceChanged: boolean;
  lastPrice: number;
}
```

### State Akışı
```
Kullanıcı Etkileşimi
       │
       ├─► Mod Değiştir (tour ↔ hourly)
       │     └─► Seçili turları temizle
       │     └─► Fiyatları yeniden hesapla
       │
       ├─► Tur Seç/Seçimi Kaldar
       │     └─► selectedServiceIds güncelle
       │     └─► Fiyatları yeniden hesapla
       │     └─► Animasyon tetikle
       │
       └─► Saat Değiştir
             └─► selectedHours güncelle
             └─► Fiyatları yeniden hesapla
             └─► Animasyon tetikle
```

---

## Yeni Bileşenler

### 1. ModeToggle Bileşeni
```tsx
// web-app/src/components/transfers/ModeToggle.tsx
interface ModeToggleProps {
  mode: 'tour' | 'hourly';
  onModeChange: (mode: 'tour' | 'hourly') => void;
  selectedHours: number;
  onHoursChange: (hours: number) => void;
  disabled?: boolean; // Tur seçiliyken saat değiştirilemez
}
```

### 2. SelectionSummaryCard Bileşeni
```tsx
// web-app/src/components/transfers/SelectionSummaryCard.tsx
interface SelectionSummaryCardProps {
  selectedServices: PopularServiceModel[];
  mode: 'tour' | 'hourly';
  selectedHours: number;
  totalHours: number;
  totalPrice: number;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}
```

### 3. EnhancedTransferCard Bileşeni
```tsx
// Mevcut TransferCard'ın geliştirilmiş hali
interface EnhancedTransferCardProps {
  transfer: TransferModel;
  selectedServices: PopularServiceModel[];
  mode: 'tour' | 'hourly';
  selectedHours: number;
  hourlyRates: Record<VehicleType, number | null>;
  priceChanged: boolean;
}
```

---

## Dosya Yapısı

### Yeni Dosyalar
```
web-app/src/components/transfers/
├── ModeToggle.tsx                    (Yeni)
├── SelectionSummaryCard.tsx          (Yeni)
├── UnifiedTransferSection.tsx        (Yeni - Ana konteyner)
└── transfers/
    └── page.tsx                      (Güncellenecek)
```

### Güncellenecek Dosyalar
```
web-app/src/components/transfers/
├── PopularServicesSection.tsx        (ModeToggle entegrasyonu)
└── transfers/
    └── page.tsx                      (Yeni yapıya geçiş)
```

### Geriye Uyumluluk İçin
```tsx
// Eski tasarımı korumak için feature flag
const USE_UNIFIED_DESIGN = true; // Admin panelinden değiştirilebilir

export default function TransfersPage() {
  if (!USE_UNIFIED_DESIGN) {
    return <LegacyTransfersPage />;
  }
  return <UnifiedTransfersPage />;
}
```

---

## Responsive Tasarım

### Mobil (< 640px)
- Tur kartları: Tek kart, yatay kaydırma
- Mod toggle: Stack layout
- Seçim özeti: Collapsible (detayı görmek için tıkla)
- Araç kartları: 1 kolon

### Tablet (640px - 1024px)
- Tur kartları: 2-3 kart görünür, yatay kaydırma
- Mod toggle: Inline
- Seçim özeti: Tam genişlik
- Araç kartları: 2-3 kolon

### Desktop (> 1024px)
- Tur kartları: 4-5 kart görünür
- Mod toggle: Inline
- Seçim özeti: Tam genişlik
- Araç kartları: 4 kolon

---

## Fiyat Hesaplama Mantığı

### Saatlik Mod
```tsx
const calculateHourlyPrice = (
  vehicleType: VehicleType,
  hours: number
): number => {
  const hourlyRate = DEFAULT_HOURLY_RATES[vehicleType]?.tiers[0]?.pricePerHour;
  return hourlyRate * hours;
};
```

### Tur Seçimi Modu
```tsx
const calculateTourPrice = (
  vehicleType: VehicleType,
  services: PopularServiceModel[]
): number => {
  return services.reduce((total, service) => {
    const price = service.vehiclePrices?.[vehicleType] 
      ?? service.price.baseAmount;
    return total + price;
  }, 0);
};
```

---

## Animasyonlar

### Fiyat Değişim Animasyonu
```tsx
// Tailwind animate-pulse veya custom animation
@keyframes priceChange {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); background-color: rgb(236 254 255); }
}

.price-changed {
  animation: priceChange 0.5s ease-in-out;
}
```

### Seçim Animasyonu
```tsx
// Tur seçildiğinde
.tour-selected {
  animation: selectTour 0.3s ease-out;
}

@keyframes selectTour {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
```

---

## Erişilebilirlik

### Klavye Navigasyonu
- Tab ile tur kartları arasında gezinme
- Enter/Space ile seçim
- Escape ile modal kapatma

### Ekran Okuyucu
- ARIA etiketleri
- Live region for price updates
- Focus management

---

## SEO Optimizasyonu

### Meta Tags
```tsx
// page.tsx head
export const metadata = {
  title: 'Transfer Hizmetleri - Saatlik Kiralama ve Popüler Turlar',
  description: 'Havalimanı transferi, saatlik araç kiralama ve popüler turlar. En uygun fiyatlarla konforlu ulaşım.',
};
```

### Schema.org
```tsx
// Product schema for vehicles
// Tour schema for popular tours
```

---

## Test Senaryoları

### Kullanıcı Akışları
1. **Saatlik Kiralama:**
   - Sayfa yükle → Saatlik mod aktif → Saat seç → Araç kartlarını gör → Fiyatları kontrol et → Rezervasyon

2. **Tur Seçimi:**
   - Sayfa yükle → Tur moduna geç → Tur seç → Fiyatlar güncellenir → Araç kartlarını gör → Rezervasyon

3. **Mod Değiştirme:**
   - Tur seçili → Saatlik moda geç → Seçim temizlenir → Fiyatlar güncellenir

4. **Çoklu Tur Seçimi:**
   - 2+ tur seç → Uyarı göster → Toplam fiyat hesapla → Araç kartlarında göster

---

## Implementasyon Sırası

1. **Phase 1: Temel Yapı**
   - ModeToggle bileşeni
   - State yönetimi güncellemesi
   - Legacy kodu koruma

2. **Phase 2: Seçim Özeti**
   - SelectionSummaryCard bileşeni
   - Koşullu render

3. **Phase 3: Araç Kartları**
   - Fiyat gösterimi güncellemesi
   - Animasyonlar

4. **Phase 4: Responsive & Polish**
   - Mobil optimizasyon
   - Animasyon iyileştirmeleri
   - Erişilebilirlik

5. **Phase 5: Test & Deploy**
   - Test senaryoları
   - Performance kontrol
   - Deploy

---

## Geri Yükleme

Eğer yeni tasarım beğenilmezse:

```tsx
// web-app/src/app/transfers/page.tsx
const USE_UNIFIED_DESIGN = false; // Bu değişkeni false yap

// Veya environment variable
const USE_UNIFIED_DESIGN = process.env.NEXT_PUBLIC_USE_UNIFIED_TRANSFER_DESIGN === 'true';
```

Eski kod `LegacyTransfersPage.tsx` olarak saklanacak.
