# Transfer Pricing Tam Entegrasyon Planı

## 📋 Proje Özeti

**Amaç:** `/transferler/pricing` sayfasındaki "Transfer Hizmetleri" arayüzünü admin panelinden tamamen yönetilebilir hale getirmek. Lokasyon, popüler rota ve fiyat bilgilerini admin panelinde merkezi bir yerden kontrol edebilmek.

**Kapsam:**
- ✅ Lokasyon yönetimi (havalimanları, şehirler, dini mekanlar)
- ✅ Popüler transfer rotaları yönetimi (Cidde → Mekke, vb.)
- ✅ Rota bazlı fiyatlandırma (araç tiplerine göre)
- ✅ Frontend dinamik veri entegrasyonu

---

## 🎯 Hedefler

### Admin Panel Tarafı
1. Lokasyonları ekleyebilme, düzenleyebilme, silebilme
2. Popüler transfer rotalarını yönetebilme (CRUD)
3. Her rota için araç bazlı fiyatlandırma yapabilme
4. Rotaları sıralayabilme, aktif/pasif yapabilme

### Frontend Tarafı
1. Hardcoded `POPULAR_TRANSFER_ROUTES` kaldırılacak
2. Admin panelden gelen dinamik rotalar kullanılacak
3. Lokasyon seçiciler dinamik olacak
4. Fiyat hesaplamaları admin fiyatlarını kullanacak

---

## 📊 Mevcut Durum Analizi

### Frontend Yapısı

```
web-app/src/
├── app/transfers/page.tsx                    # Transfer ana sayfası
├── components/transfers/
│   ├── TransferSearchForm.tsx                # ⚠️ POPULAR_TRANSFER_ROUTES hardcoded
│   ├── LocationSelector.tsx                  # Lokasyon seçici
│   └── PopularServicesSection.tsx            # Sadece turlar
├── lib/transfers/
│   ├── transfer-locations.ts                 # ⚠️ LOCATIONS statik
│   ├── pricing-v2.ts                         # Fiyat hesaplama
│   └── ...
└── types/
    ├── transfer.ts                           # Transfer tipleri
    └── transfer-pricing.ts                   # ⚠️ DEFAULT_ROUTE_PRICES statik
```

### Admin Panel Yapısı

```
web-app/src/
├── app/admin/transfers/
│   ├── page.tsx                              # Transfer listesi
│   ├── pricing/page.tsx                      # ⚠️ Sadece Turlar/Transferler sekmeleri
│   └── ...
├── lib/data/
│   └── popular-services-data.ts              # ⚠️ Lokal bellekte veri
└── types/
    └── popular-service.ts                    # PopularServiceModel
```

### Tespit Edilen Sorunlar

1. **Hardcoded Veriler:**
   - `POPULAR_TRANSFER_ROUTES` (4 rota) → TransferSearchForm.tsx içinde
   - `LOCATIONS` (13 lokasyon) → transfer-locations.ts içinde
   - `DEFAULT_ROUTE_PRICES` (14 rota fiyatı) → transfer-pricing.ts içinde

2. **Admin Panel Eksiklikleri:**
   - Lokasyon yönetimi yok
   - Popüler rotalar yönetilemez
   - Rota fiyatları admin panelde değiştirilemez

3. **Veri Yapısı:**
   - `PopularServiceModel` generic, transfer-spesifik alanlar eksik
   - Lokasyon ve rota arasında ilişki yok

---

## 🏗️ Yeni Mimari Tasarımı

### Veri Modeli

```typescript
// 1. Lokasyon Modeli
interface TransferLocationModel {
  id: string;                       // 'jeddah_airport', 'mecca', vb.
  name: string;                     // 'Cidde Havalimanı (JED)'
  nameEn?: string;                  // 'Jeddah Airport (JED)'
  city: string;                     // 'Cidde', 'Mekke', 'Medine'
  type: LocationType;               // 'airport', 'city', 'religious_site'
  coordinates?: {
    lat: number;
    lng: number;
  };
  icon?: string;                    // '✈️', '🕌', '🏙️'
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt: Date;
}

type LocationType = 'airport' | 'train_station' | 'city' | 'religious_site' | 'tour_destination';

// 2. Popüler Rota Modeli
interface PopularTransferRouteModel {
  id: string;                       // 'route-jeddah-mecca'
  name: string;                     // 'Cidde Havalimanı → Mekke'
  nameEn?: string;                  // 'Jeddah Airport → Mecca'
  fromLocationId: string;           // 'jeddah_airport'
  toLocationId: string;             // 'mecca'
  icon: string;                     // '✈️'
  isActive: boolean;                // Aktif/pasif
  isPopular: boolean;               // Ana sayfada göster
  order: number;                    // Sıralama
  distanceKm?: number;              // 75
  durationMinutes?: number;         // 75
  createdAt?: Date;
  updatedAt: Date;
}

// 3. Rota Fiyatlandırma Modeli (Mevcut - Güncellenecek)
interface RoutePricingModel {
  id: string;
  routeId: string;                  // PopularTransferRouteModel.id ile bağlantı
  routeName: string;
  fromCity: string;
  toCity: string;
  fromLocationId: string;
  toLocationId: string;
  distanceKm: number;
  durationMinutes?: number;
  prices: {
    sedan: number;                  // USD
    van: number;
    coster: number;
    bus?: number;
    vip?: number;
    jeep?: number;
  };
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt: Date;
  updatedBy: string;
}
```

### Firebase Koleksiyonları

```
Firestore
├── transfer_locations/              # Lokasyon yönetimi
│   ├── {locationId}/
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── city: string
│   │   ├── type: LocationType
│   │   ├── coordinates: {lat, lng}
│   │   ├── isActive: boolean
│   │   ├── order: number
│   │   └── updatedAt: timestamp
│   └── ...
│
├── popular_transfer_routes/         # Popüler rota yönetimi
│   ├── {routeId}/
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── fromLocationId: string
│   │   ├── toLocationId: string
│   │   ├── icon: string
│   │   ├── isActive: boolean
│   │   ├── order: number
│   │   └── updatedAt: timestamp
│   └── ...
│
└── transfer_pricing/                # Rota fiyatlandırma (MEVCUT)
    ├── {pricingId}/
    │   ├── routeId: string
    │   ├── prices: {sedan, van, ...}
    │   ├── isActive: boolean
    │   └── updatedAt: timestamp
    └── ...
```

---

## 🔧 Implementasyon Adımları

### Faz 1: Veri Modeli ve Tipler (1-2 gün)

#### 1.1. Yeni Tip Tanımlamaları

**Dosya:** `web-app/src/types/transfer-location.ts` (YENİ)

```typescript
export type LocationType = 'airport' | 'train_station' | 'city' | 'religious_site' | 'tour_destination';

export interface TransferLocationModel {
  id: string;
  name: string;
  nameEn?: string;
  city: string;
  type: LocationType;
  coordinates?: {
    lat: number;
    lng: number;
  };
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt: Date;
}

export const locationTypeLabels: Record<LocationType, string> = {
  airport: 'Havalimanı',
  train_station: 'Tren İstasyonu',
  city: 'Şehir',
  religious_site: 'Dini Mekan',
  tour_destination: 'Tur Destinasyonu',
};

export const locationTypeIcons: Record<LocationType, string> = {
  airport: '✈️',
  train_station: '🚉',
  city: '🏙️',
  religious_site: '🕌',
  tour_destination: '🗺️',
};
```

**Dosya:** `web-app/src/types/popular-transfer-route.ts` (YENİ)

```typescript
export interface PopularTransferRouteModel {
  id: string;
  name: string;
  nameEn?: string;
  fromLocationId: string;
  toLocationId: string;
  icon: string;
  isActive: boolean;
  isPopular: boolean;
  order: number;
  distanceKm?: number;
  durationMinutes?: number;
  createdAt?: Date;
  updatedAt: Date;
}

export type PopularTransferRouteInput = Omit<
  PopularTransferRouteModel,
  'id' | 'createdAt' | 'updatedAt'
>;
```

#### 1.2. Mevcut Tip Güncellemeleri

**Dosya:** `web-app/src/types/transfer-pricing.ts` (GÜNCELLEME)

```typescript
// Mevcut RoutePricingModel'e ek alanlar
export interface RoutePricingModel {
  // ... mevcut alanlar
  routeId?: string;  // PopularTransferRouteModel.id ile bağlantı (YENİ)
  // ... diğer alanlar
}
```

---

### Faz 2: Backend (Veri Katmanı) (2-3 gün)

#### 2.1. Lokasyon Veri Fonksiyonları

**Dosya:** `web-app/src/lib/data/transfer-locations-data.ts` (YENİ)

```typescript
import type { TransferLocationModel } from '@/types/transfer-location';

// Başlangıç verileri (transfer-locations.ts'ten migrate edilecek)
export const INITIAL_LOCATIONS: TransferLocationModel[] = [
  {
    id: 'jeddah_airport',
    name: 'Cidde Havalimanı (JED)',
    nameEn: 'Jeddah Airport (JED)',
    city: 'Cidde',
    type: 'airport',
    coordinates: { lat: 21.6796, lng: 39.1565 },
    icon: '✈️',
    isActive: true,
    order: 0,
    updatedAt: new Date(),
  },
  // ... diğer lokasyonlar
];

// CRUD fonksiyonları
export async function getAllTransferLocations(): Promise<TransferLocationModel[]> {
  // Firebase'den veya local'den çek
}

export async function getActiveTransferLocations(): Promise<TransferLocationModel[]> {
  const all = await getAllTransferLocations();
  return all.filter(loc => loc.isActive).sort((a, b) => a.order - b.order);
}

export async function getTransferLocationById(id: string): Promise<TransferLocationModel | null> {
  // ...
}

export async function createTransferLocation(data: Omit<TransferLocationModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  // ...
}

export async function updateTransferLocation(id: string, data: Partial<TransferLocationModel>): Promise<void> {
  // ...
}

export async function deleteTransferLocation(id: string): Promise<void> {
  // ...
}

// Filtre fonksiyonları
export async function getLocationsByType(type: LocationType): Promise<TransferLocationModel[]> {
  const all = await getAllTransferLocations();
  return all.filter(loc => loc.type === type);
}

export async function getLocationsByCity(city: string): Promise<TransferLocationModel[]> {
  const all = await getAllTransferLocations();
  return all.filter(loc => loc.city === city);
}
```

#### 2.2. Popüler Rota Veri Fonksiyonları

**Dosya:** `web-app/src/lib/data/popular-transfer-routes-data.ts` (YENİ)

```typescript
import type { PopularTransferRouteModel } from '@/types/popular-transfer-route';

// Başlangıç verileri (TransferSearchForm.tsx'den migrate edilecek)
export const INITIAL_POPULAR_ROUTES: PopularTransferRouteModel[] = [
  {
    id: 'route-jeddah-airport-to-mecca',
    name: 'Cidde Havalimanı → Mekke',
    nameEn: 'Jeddah Airport → Mecca',
    fromLocationId: 'jeddah_airport',
    toLocationId: 'mecca',
    icon: '✈️',
    isActive: true,
    isPopular: true,
    order: 0,
    distanceKm: 75,
    durationMinutes: 75,
    updatedAt: new Date(),
  },
  // ... diğer rotalar
];

// CRUD fonksiyonları
export async function getAllPopularTransferRoutes(): Promise<PopularTransferRouteModel[]> {
  // ...
}

export async function getActivePopularTransferRoutes(): Promise<PopularTransferRouteModel[]> {
  const all = await getAllPopularTransferRoutes();
  return all.filter(route => route.isActive && route.isPopular)
    .sort((a, b) => a.order - b.order);
}

export async function createPopularTransferRoute(data: PopularTransferRouteInput): Promise<string> {
  // ...
}

export async function updatePopularTransferRoute(id: string, data: Partial<PopularTransferRouteModel>): Promise<void> {
  // ...
}

export async function deletePopularTransferRoute(id: string): Promise<void> {
  // ...
}

// İlişkili veriler
export async function getRouteWithLocations(routeId: string): Promise<{
  route: PopularTransferRouteModel;
  fromLocation: TransferLocationModel;
  toLocation: TransferLocationModel;
} | null> {
  // ...
}
```

#### 2.3. Rota Fiyatlandırma Güncellemeleri

**Dosya:** `web-app/src/lib/data/transfer-pricing-data.ts` (YENİ veya GÜNCELLEME)

```typescript
import type { RoutePricingModel } from '@/types/transfer-pricing';
import { DEFAULT_ROUTE_PRICES } from '@/types/transfer-pricing';

// Başlangıç verileri
export const INITIAL_ROUTE_PRICING: RoutePricingModel[] = DEFAULT_ROUTE_PRICES.map((route, idx) => ({
  id: `pricing-${idx}`,
  type: 'route' as const,
  routeId: route.routeId,
  routeName: route.routeName,
  fromCity: route.fromCity,
  toCity: route.toCity,
  fromLocationId: '', // Manuel olarak map edilecek
  toLocationId: '',
  distanceKm: route.distanceKm,
  prices: route.prices,
  isActive: true,
  order: idx,
  updatedAt: new Date(),
  updatedBy: 'system',
}));

// CRUD fonksiyonları
export async function getRoutePricingByRouteId(routeId: string): Promise<RoutePricingModel | null> {
  // ...
}

export async function upsertRoutePricing(routeId: string, prices: RoutePricingModel['prices']): Promise<void> {
  // ...
}
```

---

### Faz 3: Admin Panel - Lokasyon Yönetimi (3-4 gün)

#### 3.1. Lokasyon Listesi Sayfası

**Dosya:** `web-app/src/app/admin/transfers/locations/page.tsx` (YENİ)

**UI Bileşenleri:**
- Lokasyon listesi tablosu (DataTable)
- Arama ve filtreler (tip, şehir)
- Lokasyon ekleme butonu
- Düzenleme/Silme butonları
- Sıralama (order alanı)

**Tablo Kolonları:**
1. İkon
2. Ad (TR/EN)
3. Şehir
4. Tip
5. Koordinatlar
6. Aktif/Pasif
7. Sıra
8. Aksiyonlar (Düzenle, Sil)

#### 3.2. Lokasyon Ekleme/Düzenleme Formu

**Form Alanları:**
- Ad (TR) *
- Ad (EN)
- Şehir *
- Tip (dropdown) *
- İkon (emoji picker veya input)
- Koordinatlar (lat, lng)
- Aktif/Pasif toggle
- Sıra

**Validasyonlar:**
- Ad zorunlu
- Şehir zorunlu
- Tip seçimi zorunlu
- Koordinatlar sayısal olmalı

---

### Faz 4: Admin Panel - Popüler Rotalar (3-4 gün)

#### 4.1. Pricing Sayfasına Yeni Sekme

**Dosya:** `web-app/src/app/admin/transfers/pricing/page.tsx` (GÜNCELLEME)

**Yeni Tab:**
```typescript
type PricingTabType = "tours" | "transfers" | "popular_routes";  // YENİ: popular_routes
```

**Tab İçeriği:**
- Popüler rota listesi tablosu
- Rota ekleme/düzenleme butonu
- Sürükle-bırak sıralama
- Toplu işlemler

#### 4.2. Popüler Rota Formu

**Form Alanları:**
- Rota Adı (TR) *
- Rota Adı (EN)
- Nereden (lokasyon dropdown) *
- Nereye (lokasyon dropdown) *
- İkon (emoji picker) *
- Mesafe (km)
- Süre (dakika)
- Popüler işaretle (checkbox)
- Aktif/Pasif toggle
- Sıra

**Lokasyon Dropdown:**
- Transfer lokasyonlarından beslenecek
- Tip bazlı gruplama (Havalimanları, Şehirler, vb.)
- Arama özelliği

**İkon Seçici:**
- Sık kullanılan ikonlar: ✈️ 🕌 🚉 🏙️ 🗺️ 🚗
- Özel emoji girişi

#### 4.3. Rota Fiyatlandırma Entegrasyonu

**Her rota için fiyat kartı:**
```
┌─────────────────────────────────────────┐
│ Cidde Havalimanı → Mekke ✈️             │
├─────────────────────────────────────────┤
│ Araç Fiyatları (USD)                    │
│ ├─ Sedan:  $40                          │
│ ├─ Van:    $53                          │
│ ├─ Coster: $67                          │
│ ├─ Bus:    $100                         │
│ ├─ VIP:    $80                          │
│ └─ Jeep:   $52                          │
│                                         │
│ [Fiyatları Düzenle]                     │
└─────────────────────────────────────────┘
```

---

### Faz 5: Frontend Entegrasyonu (2-3 gün)

#### 5.1. React Query Hooks

**Dosya:** `web-app/src/hooks/useTransferLocations.ts` (YENİ)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTransferLocations,
  getActiveTransferLocations,
  createTransferLocation,
  updateTransferLocation,
  deleteTransferLocation,
} from '@/lib/data/transfer-locations-data';

export function useTransferLocations() {
  return useQuery({
    queryKey: ['transferLocations'],
    queryFn: getAllTransferLocations,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

export function useActiveTransferLocations() {
  return useQuery({
    queryKey: ['transferLocations', 'active'],
    queryFn: getActiveTransferLocations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTransferLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransferLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferLocations'] });
    },
  });
}

// ... diğer mutations
```

**Dosya:** `web-app/src/hooks/usePopularTransferRoutes.ts` (YENİ)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllPopularTransferRoutes,
  getActivePopularTransferRoutes,
  createPopularTransferRoute,
  updatePopularTransferRoute,
  deletePopularTransferRoute,
} from '@/lib/data/popular-transfer-routes-data';

export function usePopularTransferRoutes() {
  return useQuery({
    queryKey: ['popularTransferRoutes'],
    queryFn: getAllPopularTransferRoutes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActivePopularTransferRoutes() {
  return useQuery({
    queryKey: ['popularTransferRoutes', 'active'],
    queryFn: getActivePopularTransferRoutes,
    staleTime: 5 * 60 * 1000,
  });
}

// ... diğer mutations
```

#### 5.2. TransferSearchForm Güncellemesi

**Dosya:** `web-app/src/components/transfers/TransferSearchForm.tsx` (GÜNCELLEME)

**Değişiklikler:**

```typescript
// ❌ KALDIRILACAK
const POPULAR_TRANSFER_ROUTES: PopularTransferRoute[] = [ ... ];

// ✅ YENİ
import { useActivePopularTransferRoutes } from '@/hooks/usePopularTransferRoutes';

export function TransferSearchForm({ ... }) {
  // Dinamik veri
  const { data: popularRoutes = [], isLoading } = useActivePopularTransferRoutes();
  
  // Loading state
  if (isLoading) {
    return <div>Popüler rotalar yükleniyor...</div>;
  }
  
  return (
    <>
      {/* Popüler Rotalar */}
      <div className="mb-6">
        <h4>En Çok Kullanılan Transferler</h4>
        <div className="flex flex-wrap gap-1.5">
          {popularRoutes.map((route) => (
            <button
              key={route.id}
              onClick={() => handlePopularRouteSelect(route)}
              className="..."
            >
              <span>{route.icon}</span>
              <span>{route.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* ... form devamı */}
    </>
  );
}
```

#### 5.3. LocationSelector Güncellemesi

**Dosya:** `web-app/src/components/transfers/LocationSelector.tsx` (GÜNCELLEME)

```typescript
import { useActiveTransferLocations } from '@/hooks/useTransferLocations';

export function LocationSelector({ ... }) {
  // Dinamik lokasyonlar
  const { data: allLocations = [], isLoading } = useActiveTransferLocations();
  
  // Tip bazlı gruplama
  const groupedLocations = useMemo(() => {
    return allLocations.reduce((acc, loc) => {
      if (!acc[loc.type]) acc[loc.type] = [];
      acc[loc.type].push(loc);
      return acc;
    }, {} as Record<LocationType, TransferLocationModel[]>);
  }, [allLocations]);
  
  return (
    <div>
      <label>{label}</label>
      <select ...>
        {Object.entries(groupedLocations).map(([type, locs]) => (
          <optgroup key={type} label={locationTypeLabels[type]}>
            {locs.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.icon} {loc.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
```

---

## 📱 Kullanıcı Akışları

### Admin Akışı

```
1. Admin Panel'e giriş
2. Transfers > Locations sayfasına git
3. "Yeni Lokasyon" butonuna tıkla
4. Form doldur (Ad, Şehir, Tip, İkon, vb.)
5. "Kaydet" butonuna tıkla
6. ✅ Lokasyon eklendi

7. Transfers > Pricing sayfasına git
8. "Popüler Rotalar" sekmesine geç
9. "Yeni Rota" butonuna tıkla
10. Nereden/Nereye lokasyonlarını seç
11. İkon, sıra ve diğer bilgileri gir
12. "Kaydet" butonuna tıkla
13. ✅ Popüler rota eklendi

14. Rota için fiyat belirle
15. Her araç tipi için USD fiyatı gir
16. "Fiyatları Kaydet" butonuna tıkla
17. ✅ Fiyatlar kaydedildi
```

### Kullanıcı Akışı (Frontend)

```
1. /transferler sayfasına git
2. "En Çok Kullanılan Transferler" bölümünde admin tarafından 
   eklenen rotaları gör
3. Bir rotaya tıkla (örn: Cidde Havalimanı → Mekke ✈️)
4. Form otomatik dolar (Nereden: Cidde Havalimanı, Nereye: Mekke)
5. Tarih, saat, yolcu sayısı seç
6. "Transfer Ara" butonuna tıkla
7. ✅ Admin tarafından belirlenen fiyatlarla araçlar listelenir
```

---

## 🧪 Test Senaryoları

### Admin Panel Testleri

#### Lokasyon Yönetimi
- [ ] Yeni lokasyon ekleme
- [ ] Lokasyon düzenleme
- [ ] Lokasyon silme
- [ ] Lokasyon aktif/pasif yapma
- [ ] Lokasyon sıralama
- [ ] Lokasyon arama
- [ ] Lokasyon tip filtreleme

#### Popüler Rota Yönetimi
- [ ] Yeni rota ekleme
- [ ] Rota düzenleme
- [ ] Rota silme
- [ ] Rota aktif/pasif yapma
- [ ] Rota sıralama (sürükle-bırak)
- [ ] Lokasyon dropdown çalışması
- [ ] İkon seçici çalışması

#### Rota Fiyatlandırma
- [ ] Rota fiyatları görüntüleme
- [ ] Rota fiyatları güncelleme
- [ ] Araç tipi bazlı fiyat girişi
- [ ] Toplu fiyat güncelleme

### Frontend Testleri

#### TransferSearchForm
- [ ] Popüler rotalar dinamik yükleniyor
- [ ] Rota tıklanınca form dolduruluyor
- [ ] Admin panelde eklenen yeni rotalar görünüyor
- [ ] Admin panelde silinen rotalar kaybolmuş
- [ ] Sıralama admin paneldeki sırayla aynı

#### LocationSelector
- [ ] Lokasyonlar dinamik yükleniyor
- [ ] Tip bazlı gruplama çalışıyor
- [ ] Admin panelde eklenen lokasyonlar görünüyor
- [ ] Aktif olmayan lokasyonlar görünmüyor

#### Fiyat Hesaplama
- [ ] Admin paneldeki fiyatlar kullanılıyor
- [ ] Araç bazlı fiyat farklılıkları doğru
- [ ] Gece ücreti eklendiğinde doğru hesaplama
- [ ] Ek bagaj ücreti doğru

---

## 🚀 Dağıtım (Deployment) Stratejisi

### Faz 1: Veri Migrasyonu
1. Mevcut statik verileri Firebase'e aktar
   - `transfer-locations.ts` → `transfer_locations` koleksiyonu
   - `POPULAR_TRANSFER_ROUTES` → `popular_transfer_routes` koleksiyonu
   - `DEFAULT_ROUTE_PRICES` → `transfer_pricing` koleksiyonu
2. Veri doğrulama scriptleri çalıştır
3. Backup al

### Faz 2: Backend Dağıtımı
1. Yeni tip tanımlamalarını dağıt
2. Veri fonksiyonlarını dağıt
3. API endpoint'lerini test et

### Faz 3: Admin Panel Dağıtımı
1. Lokasyon yönetimi sayfasını dağıt
2. Pricing sayfasına popüler rotalar sekmesini ekle
3. Admin kullanıcılarına eğitim ver

### Faz 4: Frontend Dağıtımı
1. Hardcoded verileri kaldır
2. Dinamik veri entegrasyonunu aktifleştir
3. Cache mekanizmasını kontrol et
4. A/B test yap (eski vs yeni)

### Faz 5: Monitoring ve İyileştirme
1. Kullanıcı davranışlarını izle
2. Performance metrikleri takip et
3. Hata loglarını kontrol et
4. Feedback topla ve iyileştir

---

## 📊 Metrik ve KPI'lar

### Teknik Metrikler
- Sayfa yükleme süresi: < 2 saniye
- API yanıt süresi: < 500ms
- Cache hit rate: > 80%
- Hata oranı: < 1%

### İş Metrikleri
- Admin kullanım oranı: Takip edilecek
- Popüler rota tıklama oranı: Artış bekleniyor
- Rezervasyon dönüşüm oranı: Artış bekleniyor

---

## 🔒 Güvenlik Önlemleri

1. **Admin Panel:**
   - Authentication/Authorization kontrolü
   - Role-based access control (RBAC)
   - Audit log (kim ne zaman ne değiştirdi)

2. **Firebase Rules:**
   - Sadece admin kullanıcılar yazabilir
   - Herkes okuyabilir (public data)
   - Validation rules

3. **Frontend:**
   - XSS koruması
   - Input sanitization
   - Rate limiting

---

## 📚 Dokümantasyon

### Admin Kullanım Kılavuzu
- Lokasyon nasıl eklenir?
- Popüler rota nasıl oluşturulur?
- Fiyatlar nasıl güncellenir?
- Sıralama nasıl yapılır?

### Developer Dokümantasyonu
- API referansı
- Veri modeli açıklamaları
- Component kullanımı
- Hook kullanımı

---

## 🎯 Sonuç ve Beklenen Faydalar

### Admin Tarafı
✅ Tek bir yerden tüm transfer verilerini yönetebilme
✅ Hızlı güncelleme yapabilme (kod değişikliği gerektirmez)
✅ Popüler rotaları dinamik olarak değiştirebilme
✅ Fiyatları anlık güncelleyebilme

### Kullanıcı Tarafı
✅ Güncel ve doğru lokasyon bilgileri
✅ Admin tarafından belirlenen popüler rotalar
✅ Doğru fiyat hesaplamaları
✅ Daha iyi kullanıcı deneyimi

### Teknik Faydalar
✅ Maintainability artışı
✅ Hardcoded verilerden kurtulma
✅ Scalability (ölçeklenebilirlik)
✅ Veri tutarlılığı

---

## ⏱️ Tahmini Süre ve Kaynak

**Toplam Süre:** 12-16 gün

| Faz | Süre | Geliştirici |
|-----|------|-------------|
| Faz 1: Veri Modeli | 1-2 gün | 1 Backend Dev |
| Faz 2: Backend | 2-3 gün | 1 Backend Dev |
| Faz 3: Admin Lokasyon | 3-4 gün | 1 Fullstack Dev |
| Faz 4: Admin Rotalar | 3-4 gün | 1 Fullstack Dev |
| Faz 5: Frontend | 2-3 gün | 1 Frontend Dev |
| Test & QA | 1-2 gün | 1 QA |

**Paralel Çalışma:** Faz 3, 4, 5 kısmen paralel yapılabilir.

---

## 🔄 Alternatif Yaklaşımlar

### Alternatif 1: Firebase Yerine REST API
- Avantajlar: Daha fazla kontrol, complex sorgular
- Dezavantajlar: Backend geliştirme süresi artar

### Alternatif 2: GraphQL
- Avantajlar: Flexible data fetching, client-driven
- Dezavantajlar: Learning curve, setup complexity

### Alternatif 3: Statik Kalıp CMS Entegrasyonu
- Avantajlar: Non-technical kullanıcılar için kolay
- Dezavantajlar: Ek maliyet, 3rd party dependency

---

## 📞 İletişim ve Destek

**Proje Sahibi:** [İsim]
**Tech Lead:** [İsim]
**Backend Lead:** [İsim]
**Frontend Lead:** [İsim]

**Slack Kanalı:** #transfer-pricing-integration
**Jira Board:** [Link]
**Design Figma:** [Link]

---

**Son Güncelleme:** 16 Mart 2026
**Versiyon:** 1.0
**Durum:** Planlama Tamamlandı ✅
