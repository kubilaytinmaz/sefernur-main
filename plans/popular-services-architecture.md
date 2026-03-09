# Popüler Transferler ve Rehberler Sistemi - Mimari Tasarım

## 📋 Proje Özeti

Transfer sayfasındaki "Popüler Rotalar" bölümünü "Popüler Transferler ve Rehberler" sistemi ile değiştireceğiz. Kullanıcılar:
- Havalimanı transferleri, şehir içi transferler
- Mekke gezileri, Medine gezileri, Taif gezisi gibi rehberli turlar
- Farklı araç tiplerini seçebilecek
- Seçimlerine göre anlık fiyat güncellemesi görecek

## 🎯 Hedefler

1. **Unified Hizmet Sistemi**: Transfer, Rehber ve Tur kategorilerini tek bir sistemde birleştir
2. **Dinamik Fiyatlandırma**: Araç tipi ve yolcu sayısına göre anlık fiyat hesaplama
3. **Gelişmiş UX**: Sekmeli navigasyon, aktif durum göstergeleri, smooth geçişler
4. **Responsive Tasarım**: Tüm ekran boyutlarında tutarlı görünüm
5. **Aynı Boyutlu Kartlar**: Grid yapısında tüm kartların aynı yükseklikte olması

## 📊 Veri Yapısı

### 1. PopularService Type Definition

```typescript
// web-app/src/lib/transfers/popular-services.ts

export type ServiceType = 'transfer' | 'guide' | 'tour';
export type ServiceCategory = 
  | 'airport_transfer'      // Havalimanı transferleri
  | 'city_transfer'         // Şehir içi transferler
  | 'intercity_transfer'    // Şehirler arası transferler
  | 'mecca_tour'            // Mekke gezileri
  | 'medina_tour'           // Medine gezileri
  | 'taif_tour'             // Taif gezisi
  | 'jeddah_tour';          // Cidde gezisi

export interface PopularService {
  id: string;
  type: ServiceType;
  category: ServiceCategory;
  name: string;
  description: string;
  icon: string;
  
  // Lokasyon bilgileri
  from: {
    city: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
  to?: {
    city: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Mesafe ve süre
  distance?: {
    km: number;
    text: string;
  };
  duration: {
    hours: number;
    text: string;
  };
  
  // Fiyatlandırma
  pricing: {
    basePrice: number; // Transfer için: mesafe bazlı, Tur için: kişi başı
    vehicleMultipliers?: Record<VehicleType, number>; // Transfer için araç çarpanları
    includes: string[]; // Fiyata dahil olanlar
    excludes: string[]; // Fiyata dahil olmayanlar
  };
  
  // Ek bilgiler
  highlights: string[]; // Öne çıkan özellikler
  isPopular: boolean;
  minPassengers: number;
  maxPassengers: number;
  languages: string[]; // Rehber dilleri (guide/tour için)
  
  // İlgili rotalar ve turlar
  relatedRouteId?: string; // transfer-locations.ts'deki rota ID'si
  relatedTourIds?: string[]; // İlgili tur ID'leri
}
```

### 2. Popüler Hizmetler Listesi

```typescript
export const POPULAR_SERVICES: PopularService[] = [
  // ──────────────────────────────────────────────────────
  // HAVAALANI TRANSFERLERİ
  // ──────────────────────────────────────────────────────
  {
    id: 'jeddah-airport-mecca',
    type: 'transfer',
    category: 'airport_transfer',
    name: 'Cidde Havalimanı → Mekke',
    description: 'Havalimanından otelinize konforlu transfer',
    icon: '✈️',
    from: {
      city: 'Cidde',
      location: 'Kral Abdulaziz Havalimanı (JED)',
      coordinates: { lat: 21.6796, lng: 39.1565 },
    },
    to: {
      city: 'Mekke',
      location: 'Harem / Oteller',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    distance: { km: 75, text: '75 km' },
    duration: { hours: 1.25, text: '60-90 dakika' },
    pricing: {
      basePrice: 150,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.6,
        vip: 2.0,
        bus: 2.7,
        jeep: 1.3,
        coster: 2.0,
      },
      includes: ['Karşılama', 'Bagaj taşıma', 'Su ikramı'],
      excludes: ['Bekleme ücreti', 'Fazla bagaj'],
    },
    highlights: [
      'Profesyonel şoför',
      '7/24 hizmet',
      'Klimalı araç',
      'Güvenli sürüş',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça', 'İngilizce'],
    relatedRouteId: 'jeddah-airport-mecca',
  },
  
  {
    id: 'medina-airport-medina',
    type: 'transfer',
    category: 'airport_transfer',
    name: 'Medine Havalimanı → Otel',
    description: 'Havalimanından otelinize güvenli transfer',
    icon: '✈️',
    from: {
      city: 'Medine',
      location: 'Medine Havalimanı',
      coordinates: { lat: 24.5534, lng: 39.7051 },
    },
    to: {
      city: 'Medine',
      location: 'Mescid-i Nebevi / Oteller',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    distance: { km: 15, text: '15 km' },
    duration: { hours: 0.33, text: '15-25 dakika' },
    pricing: {
      basePrice: 80,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.5,
        vip: 2.0,
        bus: 3.0,
        jeep: 1.3,
        coster: 2.0,
      },
      includes: ['Karşılama', 'Bagaj taşıma'],
      excludes: ['Bekleme ücreti'],
    },
    highlights: [
      'Hızlı transfer',
      'Konforlu araçlar',
      'Deneyimli sürücü',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'medina-airport-medina',
  },
  
  // ──────────────────────────────────────────────────────
  // ŞEHİRLER ARASI TRANSFERLER
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-medina-transfer',
    type: 'transfer',
    category: 'intercity_transfer',
    name: 'Mekke → Medine',
    description: 'İki kutsal şehir arası konforlu yolculuk',
    icon: '🕌',
    from: {
      city: 'Mekke',
      location: 'Harem / Otel',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    to: {
      city: 'Medine',
      location: 'Mescid-i Nebevi / Oteller',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    distance: { km: 450, text: '450 km' },
    duration: { hours: 4.5, text: '4-5 saat' },
    pricing: {
      basePrice: 500,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.4,
        vip: 1.8,
        bus: 2.0,
        jeep: 1.2,
        coster: 1.6,
      },
      includes: ['Molalar', 'Su ikramı', 'Bagaj taşıma'],
      excludes: ['Yemek', 'Konaklama'],
    },
    highlights: [
      'Modern araçlar',
      'Mola noktaları',
      'Deneyimli şoför',
      'Güvenli yolculuk',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-medina',
  },
  
  // ──────────────────────────────────────────────────────
  // MEKKE GEZİLERİ - REHBERLİ TURLAR
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-city-tour',
    type: 'guide',
    category: 'mecca_tour',
    name: 'Mekke Şehir Turu',
    description: 'Mekke\'nin kutsal yerlerini rehberli keşfedin',
    icon: '🕌',
    from: {
      city: 'Mekke',
      location: 'Otel / Harem',
    },
    duration: { hours: 4, text: '4 saat' },
    pricing: {
      basePrice: 200, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Yemek', 'Kişisel harcamalar'],
    },
    highlights: [
      'Cebeli Nur (Hira Mağarası)',
      'Cebeli Sevr',
      'Mina, Arafat, Müzdelife',
      'Cehennem Vadisi',
      'Şeytan Taşlama Yeri',
    ],
    isPopular: true,
    minPassengers: 4,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-mecca-tour',
  },
  
  {
    id: 'mecca-umrah-visit',
    type: 'guide',
    category: 'mecca_tour',
    name: 'Umre Ziyaret Noktaları',
    description: 'Hudeybiye, Cirane, Aişe Tenim ziyareti',
    icon: '🕋',
    from: {
      city: 'Mekke',
      location: 'Otel / Harem',
    },
    duration: { hours: 3, text: '3 saat' },
    pricing: {
      basePrice: 150, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Mikat noktaları',
      ],
      excludes: ['Yemek'],
    },
    highlights: [
      'Hudeybiye (Mikat)',
      'Cirane (Mikat)',
      'Aişe Tenim (Mikat)',
      'Umre için ihram noktaları',
    ],
    isPopular: true,
    minPassengers: 4,
    maxPassengers: 30,
    languages: ['Türkçe', 'Arapça'],
  },
  
  // ──────────────────────────────────────────────────────
  // MEDİNE GEZİLERİ - REHBERLİ TURLAR
  // ──────────────────────────────────────────────────────
  {
    id: 'medina-city-tour',
    type: 'guide',
    category: 'medina_tour',
    name: 'Medine Şehir Turu',
    description: 'Medine\'nin kutsal yerlerini rehberli gezin',
    icon: '🕌',
    from: {
      city: 'Medine',
      location: 'Otel / Mescid-i Nebevi',
    },
    duration: { hours: 5, text: '5 saat' },
    pricing: {
      basePrice: 220, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Yemek', 'Kişisel harcamalar'],
    },
    highlights: [
      'Uhud Dağı ve Şehitleri',
      'Kıble Camii',
      'Kuba Camii',
      'Seb\'a Mescitleri',
      'Bedir Savaş Alanı',
      'Hendek Savaşı',
    ],
    isPopular: true,
    minPassengers: 4,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'medina-medina-tour',
  },
  
  // ──────────────────────────────────────────────────────
  // TAİF GEZİSİ
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-taif-tour',
    type: 'tour',
    category: 'taif_tour',
    name: 'Taif Günübirlik Turu',
    description: 'Taif\'in tarihi ve doğal güzelliklerini keşfedin',
    icon: '🏔️',
    from: {
      city: 'Mekke',
      location: 'Otel',
    },
    to: {
      city: 'Taif',
      location: 'Tarihi Bölge',
    },
    distance: { km: 90, text: '90 km' },
    duration: { hours: 8, text: 'Tam gün (8 saat)' },
    pricing: {
      basePrice: 280, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Öğle yemeği',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Kişisel harcamalar'],
    },
    highlights: [
      'Taif Gül Bahçeleri',
      'Şifa Bahçeleri',
      'Taif Kalesi',
      'Abdullah ibn Abbas Türbesi',
      'Yerel pazar ziyareti',
    ],
    isPopular: true,
    minPassengers: 6,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-taif-tour',
  },
  
  // ──────────────────────────────────────────────────────
  // CİDDE GEZİSİ
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-jeddah-tour',
    type: 'tour',
    category: 'jeddah_tour',
    name: 'Cidde Tarihi Turu',
    description: 'Cidde\'nin tarihi ve kültürel yerlerini gezin',
    icon: '🌊',
    from: {
      city: 'Mekke',
      location: 'Otel',
    },
    to: {
      city: 'Cidde',
      location: 'Tarihi Bölge (Al-Balad)',
    },
    distance: { km: 80, text: '80 km' },
    duration: { hours: 6, text: 'Yarım gün (6 saat)' },
    pricing: {
      basePrice: 240, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Yemek', 'Kişisel harcamalar'],
    },
    highlights: [
      'Al-Balad (Tarihi Cidde)',
      'Kızıldeniz sahili',
      'Cidde Çeşmesi',
      'Nasif Evi Müzesi',
      'Alışveriş bölgeleri',
    ],
    isPopular: false,
    minPassengers: 6,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-jeddah-tour',
  },
];
```

## 🎨 UI Bileşenleri Tasarımı

### 1. Sayfa Yapısı (transfers/page.tsx)

```
┌─────────────────────────────────────────────────────────┐
│ Hero Section                                             │
│ - Başlık                                                 │
│ - Arama Formu (TransferSearchForm)                       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Popüler Transferler ve Rehberler                         │
│ ┌───────────────────────────────────────────────────┐   │
│ │ [Transferler] [Rehberler] [Turlar]                │   │ ← Sekmeler
│ └───────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Araç Tipi: [Sedan ▼] Yolcu: [2 ▼] Bagaj: [2 ▼]   │   │ ← Filtreler
│ └───────────────────────────────────────────────────┘   │
│ ┌──────┬──────┬──────┬──────┬──────┬──────┐             │
│ │ Kart │ Kart │ Kart │ Kart │ Kart │ Kart │             │ ← Grid (aynı yükseklik)
│ │ 150₺ │ 220₺ │ 180₺ │ 200₺ │ 280₺ │ 150₺ │             │
│ └──────┴──────┴──────┴──────┴──────┴──────┘             │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Filtreler ve Sıralama                                     │
│ [Araç Tipi ▼] [Kapasite ▼] [Temizle]                     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Transfer Kartları (Firestore'dan)                         │
│ ┌──────┬──────┬──────┬──────┐                             │
│ │ Kart │ Kart │ Kart │ Kart │                             │
│ └──────┴──────┴──────┴──────┘                             │
└─────────────────────────────────────────────────────────┘
```

### 2. Bileşen Hiyerarşisi

```typescript
// PopularServicesSection.tsx
├── ServiceTypeTabs
│   └── Tab (Transferler, Rehberler, Turlar)
├── ServiceFilters
│   ├── VehicleTypeSelector (sadece transfer için)
│   ├── PassengerCountSelector
│   └── LuggageCountSelector (sadece transfer için)
└── ServicesGrid
    └── ServiceCard[] (aynı yükseklikte)
        ├── ServiceIcon
        ├── ServiceTitle
        ├── ServiceDescription
        ├── ServiceHighlights
        ├── ServiceDuration
        └── PriceDisplay (dinamik)
```

### 3. Bileşen Detayları

#### ServiceTypeTabs.tsx
```typescript
interface ServiceTypeTabsProps {
  activeType: ServiceType;
  onTypeChange: (type: ServiceType) => void;
  counts: Record<ServiceType, number>;
}

// Sekme görünümü:
// [Transferler (8)] [Rehberler (4)] [Turlar (3)]
//  ^^^^^^^^^^^^^ aktif (cyan border, bg)
```

#### VehicleTypeSelector.tsx
```typescript
interface VehicleTypeSelectorProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
  disabled?: boolean; // Rehber/Tur sekmesinde disabled
}

// Görsel dropdown:
// Araç Tipi: [🚗 Sedan ▼]
//            [🚐 Van]
//            [👑 VIP]
//            [🚌 Otobüs]
```

#### ServiceCard.tsx
```typescript
interface ServiceCardProps {
  service: PopularService;
  vehicleType?: VehicleType; // Transfer için
  passengerCount: number;
  luggageCount?: number; // Transfer için
  isActive: boolean;
  onClick: () => void;
}

// Kart yapısı (h-full flex flex-col):
┌─────────────────────────┐
│ 🕌 İkon                  │
│ Mekke Şehir Turu        │ ← Başlık (line-clamp-2)
│ 4 saat                  │ ← Süre
│ ─────────────────────── │
│ • Cebeli Nur            │ ← Öne çıkanlar (2-3 madde)
│ • Mina, Arafat          │
│ ─────────────────────── │ ← mt-auto (alta yapışır)
│ Kişi başı               │
│ 220 TL / $7.33          │ ← Fiyat (bold, büyük)
└─────────────────────────┘
```

#### PriceDisplay.tsx
```typescript
interface PriceDisplayProps {
  price: number;
  priceType: 'per_person' | 'total';
  loading?: boolean;
}

// Görünüm:
// Kişi başı
// 220 TL / $7.33
// veya
// Toplam
// 450 TL / $15.00
```

## 🔄 State Yönetimi ve Veri Akışı

### State Yapısı

```typescript
// PopularServicesSection.tsx içinde
const [activeServiceType, setActiveServiceType] = useState<ServiceType>('transfer');
const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('sedan');
const [passengerCount, setPassengerCount] = useState(2);
const [luggageCount, setLuggageCount] = useState(2);
const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
```

### Veri Akışı

```
1. Kullanıcı sekme değiştirir (Transferler → Rehberler)
   ↓
2. activeServiceType state güncellenir
   ↓
3. Kartlar filtrelenir (POPULAR_SERVICES.filter(s => s.type === activeServiceType))
   ↓
4. Araç tipi seçici disabled olur (rehber/tur için)
   ↓
5. Fiyatlar yeniden hesaplanır

6. Kullanıcı araç tipi değiştirir (Sedan → Van)
   ↓
7. selectedVehicleType state güncellenir
   ↓
8. Tüm transfer kartlarının fiyatları yeniden hesaplanır
   ↓
9. PriceDisplay bileşenleri güncellenir

10. Kullanıcı bir karta tıklar
    ↓
11. selectedServiceId state güncellenir
    ↓
12. Alt kısımdaki transfer kartları filtrelenir (opsiyonel)
    ↓
13. Seçili kart vurgulanır (border, shadow)
```

## 💰 Fiyat Hesaplama Sistemi

### Transfer Fiyatlandırması

```typescript
function calculateTransferPrice(
  service: PopularService,
  vehicleType: VehicleType,
  passengerCount: number,
  luggageCount: number
): number {
  if (service.type !== 'transfer') return 0;
  
  const basePrice = service.pricing.basePrice;
  const multiplier = service.pricing.vehicleMultipliers?.[vehicleType] || 1.0;
  
  // Mesafe bazlı fiyat
  let price = basePrice * multiplier;
  
  // Fazla bagaj (standart 2 üzeri)
  if (luggageCount > 2) {
    const extraLuggage = luggageCount - 2;
    price += extraLuggage * 10; // 10 TL per bagaj
  }
  
  return Math.round(price);
}
```

### Rehber/Tur Fiyatlandırması

```typescript
function calculateGuideTourPrice(
  service: PopularService,
  passengerCount: number
): number {
  if (service.type === 'transfer') return 0;
  
  // Kişi başı fiyat
  const pricePerPerson = service.pricing.basePrice;
  const totalPrice = pricePerPerson * passengerCount;
  
  // Minimum kişi kontrolü
  if (passengerCount < service.minPassengers) {
    // Minimum grup fiyatı uygula
    return pricePerPerson * service.minPassengers;
  }
  
  return Math.round(totalPrice);
}
```

### Unified Hesaplama Fonksiyonu

```typescript
// web-app/src/lib/transfers/service-pricing.ts
export function calculateServicePrice(
  service: PopularService,
  options: {
    vehicleType?: VehicleType;
    passengerCount: number;
    luggageCount?: number;
  }
): {
  total: number;
  priceType: 'per_person' | 'total';
  breakdown: string[];
} {
  if (service.type === 'transfer') {
    const total = calculateTransferPrice(
      service,
      options.vehicleType || 'sedan',
      options.passengerCount,
      options.luggageCount || 0
    );
    
    return {
      total,
      priceType: 'total',
      breakdown: [
        `Baz fiyat: ${service.pricing.basePrice} TL`,
        `Araç çarpanı: x${service.pricing.vehicleMultipliers?.[options.vehicleType || 'sedan']}`,
        options.luggageCount && options.luggageCount > 2 
          ? `Fazla bagaj: ${(options.luggageCount - 2) * 10} TL` 
          : null,
      ].filter(Boolean) as string[],
    };
  } else {
    const total = calculateGuideTourPrice(service, options.passengerCount);
    
    return {
      total,
      priceType: 'per_person',
      breakdown: [
        `Kişi başı: ${service.pricing.basePrice} TL`,
        `Yolcu sayısı: ${options.passengerCount}`,
        options.passengerCount < service.minPassengers
          ? `Minimum grup: ${service.minPassengers} kişi`
          : null,
      ].filter(Boolean) as string[],
    };
  }
}
```

## 🎨 Stil ve UX Gereksinimleri

### 1. Kartların Aynı Yükseklikte Olması

```typescript
// ServiceCard.tsx
<Link href={`#`} className="group h-full">
  <Card className="h-full flex flex-col border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all">
    <CardContent className="p-4 flex flex-col h-full">
      {/* Üst içerik */}
      <div className="flex-grow">
        {/* İkon, başlık, açıklama, öne çıkanlar */}
      </div>
      
      {/* Alt fiyat (mt-auto ile alta yapışır) */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <PriceDisplay price={price} priceType="per_person" />
      </div>
    </CardContent>
  </Card>
</Link>
```

### 2. Aktif Durum Göstergeleri

```typescript
<Card className={cn(
  "h-full flex flex-col transition-all cursor-pointer",
  isActive 
    ? "border-cyan-500 ring-2 ring-cyan-200 shadow-lg" 
    : "border-slate-200 hover:border-cyan-300 hover:shadow-md"
)}>
```

### 3. Smooth Geçişler

```css
/* Tüm kartlarda */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Fiyat değişiminde */
.price-transition {
  transition: opacity 150ms ease-in-out;
}
```

### 4. Responsive Grid

```typescript
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
  {/* Kartlar */}
</div>

// Breakpoints:
// mobile: 2 columns
// sm (640px): 3 columns
// lg (1024px): 4 columns
// xl (1280px): 6 columns
```

## 📁 Dosya Yapısı

```
web-app/src/
├── lib/
│   └── transfers/
│       ├── popular-services.ts          ← YENİ: Hizmet verileri ve tipler
│       ├── service-pricing.ts           ← YENİ: Fiyat hesaplama
│       ├── popular-routes.ts            (mevcut)
│       ├── pricing.ts                   (mevcut)
│       └── transfer-locations.ts        (mevcut)
│
├── components/
│   └── transfers/
│       ├── PopularServicesSection.tsx   ← YENİ: Ana bileşen
│       ├── ServiceTypeTabs.tsx          ← YENİ: Sekme navigasyon
│       ├── ServiceFilters.tsx           ← YENİ: Filtreler
│       ├── VehicleTypeSelector.tsx      ← YENİ: Araç seçici
│       ├── ServicesGrid.tsx             ← YENİ: Grid container
│       ├── ServiceCard.tsx              ← YENİ: Hizmet kartı
│       ├── PriceDisplay.tsx             ← YENİ: Fiyat gösterimi
│       ├── TransferSearchForm.tsx       (mevcut)
│       ├── LocationSelector.tsx         (mevcut)
│       └── DatePicker.tsx               (mevcut)
│
└── app/
    └── transfers/
        └── page.tsx                     ← GÜNCELLE: Popüler hizmetler entegrasyonu
```

## 🔄 Uygulama Adımları

### Faz 1: Veri Katmanı (1-5. Todolar)
1. `popular-services.ts` oluştur
2. `PopularService` tipini tanımla
3. `POPULAR_SERVICES` dizisini doldur (transfer, guide, tour)
4. `service-pricing.ts` oluştur
5. Fiyat hesaplama fonksiyonlarını yaz

### Faz 2: UI Bileşenleri (6-10. Todolar)
6. `ServiceCard.tsx` oluştur (h-full flex flex-col)
7. `PriceDisplay.tsx` oluştur
8. `ServiceTypeTabs.tsx` oluştur
9. `ServiceFilters.tsx` oluştur
10. `VehicleTypeSelector.tsx` oluştur
11. `ServicesGrid.tsx` oluştur
12. `PopularServicesSection.tsx` oluştur (ana orkestrasyon)

### Faz 3: Sayfa Entegrasyonu (20-23. Todolar)
13. `transfers/page.tsx` güncelle
14. Popüler Rotalar bölümünü kaldır
15. PopularServicesSection ekle
16. State yönetimini bağla
17. Alt kısımdaki filtrelemeyi bağla

### Faz 4: Stil ve UX (24-28. Todolar)
18. Kartların aynı yükseklikte olmasını sağla
19. Hover ve aktif durumları ekle
20. Geçiş animasyonları ekle
21. Responsive tasarımı test et
22. Loading ve error durumlarını ekle

## ✅ Başarı Kriterleri

- [ ] Transferler, Rehberler, Turlar sekmelerinde sorunsuz geçiş
- [ ] Araç tipi değiştiğinde transfer fiyatları anında güncelleniyor
- [ ] Tüm kartlar aynı yükseklikte (flex-col, h-full)
- [ ] Hover efektleri smooth ve profesyonel
- [ ] Mobile'da 2, tablet'te 3, desktop'ta 6 kolon grid
- [ ] Seçili kart görsel olarak belirgin (border, ring, shadow)
- [ ] Fiyatlar doğru hesaplanıyor (TL ve USD)
- [ ] Alt kısımdaki transfer kartları seçime göre filtreleniyor (opsiyonel)
- [ ] Loading ve error durumları kullanıcı dostu

## 🚀 Gelecek Geliştirmeler

1. **Favori Hizmetler**: Kullanıcılar favori transferleri kaydedebilir
2. **Karşılaştırma**: Farklı hizmetleri yan yana karşılaştırma
3. **Dinamik Fiyatlandırma**: Sezon, gün ve saate göre fiyat ayarı
4. **Rezervasyon Entegrasyonu**: Karttan direkt rezervasyon
5. **Harita Görünümü**: Rotaları harita üzerinde göster
6. **İncelemeler**: Her hizmet için kullanıcı yorumları
7. **Paket Teklifleri**: Transfer + Rehber kombine paketler
8. **Çoklu Dil**: İngilizce, Arapça destek
