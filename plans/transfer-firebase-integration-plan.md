# Transfer Sistemi Firebase Entegrasyon Planı

## 📋 Genel Bakış

Admin panelinden yönetilen popüler hizmetler ve rotaların kullanıcı tarafına Firebase üzerinden dinamik olarak yansıtılması için kapsamlı entegrasyon planı.

## 🎯 Hedef

Hardcoded transfer verilerini ([`popular-services-simple.ts`](../web-app/src/lib/transfers/popular-services-simple.ts:1), [`popular-routes.ts`](../web-app/src/lib/transfers/popular-routes.ts:1)) Firebase'den dinamik olarak çekilen verilerle değiştirerek admin panelinden tam kontrol sağlamak.

---

## 📊 Mevcut Durum Analizi

### Admin Paneli (Mevcut - Firebase Tabanlı)
- ✅ [`/admin/transfers/popular-services`](../web-app/src/app/admin/transfers/popular-services/page.tsx:1) - PopularService yönetimi
- ✅ [`/admin/transfers/pricing`](../web-app/src/app/admin/transfers/pricing/page.tsx:1) - Araç ve rota fiyatlandırma
- ✅ [`/admin/transfers/locations`](../web-app/src/app/admin/transfers/locations/page.tsx:1) - Lokasyon ve rota yönetimi
- ✅ [`/admin/transfers/reports`](../web-app/src/app/admin/transfers/reports/page.tsx:1) - Raporlama ve analitik

### Kullanıcı Tarafı (Hardcoded)
- ⚠️ [`PopularServicesSection`](../web-app/src/components/transfers/PopularServicesSection.tsx:1) - `POPULAR_SERVICES` kullanıyor
- ⚠️ [`PopularRoutesSection`](../web-app/src/components/transfers/PopularRoutesSection.tsx:1) - `POPULAR_ROUTES` kullanıyor
- ⚠️ [`/transfer-rezervasyon/[slug]/[tourSlug]`](../web-app/src/app/transfer-rezervasyon/[slug]/[tourSlug]/page.tsx:1) - Tur detayları hardcoded

### Veri Modeli Karşılaştırması

#### Admin Paneli - PopularServiceModel
```typescript
// types/popular-service.ts
interface PopularServiceModel {
  id: string;
  type: 'tour' | 'transfer' | 'guide';
  name: string;
  nameEn?: string;
  nameTr?: string;
  description: string;
  descriptionEn?: string;
  descriptionTr?: string;
  icon: string;
  duration: { text: string; hours: number };
  distance?: { km: number; text: string };
  price: {
    display: string;
    baseAmount: number;
    type: 'per_km' | 'per_person' | 'fixed';
  };
  route?: {
    from: string;
    to: string;
    stops?: string[];
  };
  isPopular: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### Kullanıcı Tarafı - PopularService
```typescript
// lib/transfers/popular-services-simple.ts
interface PopularService {
  id: string;
  type: 'transfer' | 'tour' | 'guide';
  name: string;
  description: string;
  icon: string;
  distance?: { km: number; text: string };
  duration: { text: string; hours: number };
  price: {
    display: string;
    baseAmount: number;
    type: 'per_km' | 'per_person' | 'fixed';
  };
  route?: {
    from: string;
    to: string;
    stops?: string[];
  };
  tourDetails?: {
    highlights: string[];
    includes: string[];
    minParticipants: number;
    maxParticipants: number;
    fullDescription?: string;
    stopsDescription?: { stopName: string; description: string }[];
  };
  isPopular: boolean;
}
```

### 🔍 Kritik Farklar
1. ✅ Temel alanlar uyumlu (id, type, name, description, icon, duration, distance, price)
2. ⚠️ `tourDetails` admin modelinde yok - eklenecek
3. ⚠️ Çoklu dil desteği (nameEn, nameTr) kullanıcı tarafında kullanılmıyor
4. ⚠️ `order` alanı sıralama için kritik - kullanıcı tarafında kullanılmalı

---

## 🏗️ Mimari Tasarım

### Veri Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Popüler Hizmetler Yönetimi                                │  │
│  │ - Tur/Transfer/Rehber ekleme/düzenleme                    │  │
│  │ - Fiyat belirleme                                         │  │
│  │ - Detaylar (highlights, includes, stops)                  │  │
│  │ - Sıralama ve popülerlik ayarları                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│                     Firebase Firestore                          │
│              Collection: "popularServices"                      │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Public)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ React Query / SWR ile veri çekme                         │  │
│  │ - Client-side caching                                     │  │
│  │ - Automatic revalidation                                  │  │
│  │ - Optimistic updates                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Bileşenler                                                │  │
│  │ - PopularServicesSection                                  │  │
│  │ - PopularRoutesSection                                    │  │
│  │ - TourDetailModal                                         │  │
│  │ - TransferBookingFlow                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 İmplementasyon Planı

### Faz 1: Veri Modeli Genişletme

#### 1.1 PopularServiceModel Güncelleme
**Dosya:** [`types/popular-service.ts`](../web-app/src/types/popular-service.ts:1)

```typescript
export interface TourDetails {
  highlights: string[];
  includes: string[];
  minParticipants: number;
  maxParticipants: number;
  fullDescription?: string;
  stopsDescription?: Array<{
    stopName: string;
    description: string;
  }>;
}

export interface PopularServiceModel {
  id: string;
  type: 'tour' | 'transfer' | 'guide';
  name: string;
  nameEn?: string;
  nameTr?: string;
  description: string;
  descriptionEn?: string;
  descriptionTr?: string;
  icon: string;
  duration: {
    text: string;
    hours: number;
  };
  distance?: {
    km: number;
    text: string;
  };
  price: {
    display: string;
    baseAmount: number;
    type: 'per_km' | 'per_person' | 'fixed';
  };
  route?: {
    from: string;
    to: string;
    stops?: string[];
  };
  tourDetails?: TourDetails; // YENİ EKLENEN
  isPopular: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### 1.2 Rota Modeli Oluşturma
**Dosya:** `types/popular-route.ts` (YENİ)

```typescript
export interface PopularRouteModel {
  id: string;
  name: string;
  nameEn?: string;
  nameTr?: string;
  icon: string;
  from: {
    locationId: string;
    city: string;
    name: string;
  };
  to: {
    locationId: string;
    city: string;
    name: string;
  };
  distance: {
    km: number;
    text: string;
  };
  duration: {
    minutes: number;
    text: string;
  };
  isPopular: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

### Faz 2: Firebase Fonksiyonları

#### 2.1 Public API Fonksiyonları
**Dosya:** `lib/firebase/transfers-public.ts` (YENİ)

```typescript
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { PopularServiceModel } from '@/types/popular-service';
import type { PopularRouteModel } from '@/types/popular-route';

/**
 * Tüm popüler hizmetleri getir (aktif olanlar)
 */
export async function getPopularServices(options?: {
  type?: 'tour' | 'transfer' | 'guide';
  onlyPopular?: boolean;
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  const constraints = [where('isPopular', '==', true)];
  
  if (options?.type) {
    constraints.push(where('type', '==', options.type));
  }
  
  if (options?.onlyPopular) {
    constraints.push(where('isPopular', '==', true));
  }
  
  constraints.push(orderBy('order', 'asc'));
  
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }
  
  const q = query(collection(db, 'popularServices'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as PopularServiceModel));
}

/**
 * ID'ye göre popüler hizmet getir
 */
export async function getPopularServiceById(
  id: string
): Promise<PopularServiceModel | null> {
  const docRef = doc(db, 'popularServices', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as PopularServiceModel;
}

/**
 * Popüler rotaları getir
 */
export async function getPopularRoutes(options?: {
  onlyPopular?: boolean;
  limitCount?: number;
}): Promise<PopularRouteModel[]> {
  const constraints = [];
  
  if (options?.onlyPopular) {
    constraints.push(where('isPopular', '==', true));
  }
  
  constraints.push(orderBy('order', 'asc'));
  
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }
  
  const q = query(collection(db, 'popularRoutes'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as PopularRouteModel));
}
```

#### 2.2 Admin Domain Fonksiyonları Güncelleme
**Dosya:** [`lib/firebase/admin-domain.ts`](../web-app/src/lib/firebase/admin-domain.ts:1)

Popüler Rotalar için CRUD fonksiyonları eklenecek:

```typescript
// ─── POPULAR ROUTES (YENİ) ─────────────────────────────────────

export async function getAllPopularRoutes(): Promise<PopularRouteModel[]> {
  return fetchAll(
    COLLECTIONS.POPULAR_ROUTES,
    [orderBy('order', 'asc')],
    mapPopularRoute
  );
}

export async function getPopularRouteById(
  id: string
): Promise<PopularRouteModel | null> {
  const docRef = doc(db, COLLECTIONS.POPULAR_ROUTES, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return mapPopularRoute(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function createPopularRoute(
  data: Omit<PopularRouteModel, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.POPULAR_ROUTES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePopularRoute(
  id: string,
  data: Partial<Omit<PopularRouteModel, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.POPULAR_ROUTES, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePopularRoute(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.POPULAR_ROUTES, id));
}

function mapPopularRoute(id: string, d: Record<string, unknown>): PopularRouteModel {
  return {
    id,
    name: readString(d.name),
    nameEn: readString(d.nameEn) || undefined,
    nameTr: readString(d.nameTr) || undefined,
    icon: readString(d.icon),
    from: {
      locationId: readString((d.from as any)?.locationId),
      city: readString((d.from as any)?.city),
      name: readString((d.from as any)?.name),
    },
    to: {
      locationId: readString((d.to as any)?.locationId),
      city: readString((d.to as any)?.city),
      name: readString((d.to as any)?.name),
    },
    distance: {
      km: readNumber((d.distance as any)?.km),
      text: readString((d.distance as any)?.text),
    },
    duration: {
      minutes: readNumber((d.duration as any)?.minutes),
      text: readString((d.duration as any)?.text),
    },
    isPopular: d.isPopular === true,
    order: readNumber(d.order),
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}
```

---

### Faz 3: React Query Hooks

#### 3.1 Popüler Hizmetler için Hooks
**Dosya:** `hooks/usePopularServices.ts` (YENİ)

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPopularServices, getPopularServiceById } from '@/lib/firebase/transfers-public';
import type { PopularServiceModel } from '@/types/popular-service';

export function usePopularServices(options?: {
  type?: 'tour' | 'transfer' | 'guide';
  onlyPopular?: boolean;
  limitCount?: number;
}): UseQueryResult<PopularServiceModel[], Error> {
  return useQuery({
    queryKey: ['popularServices', options],
    queryFn: () => getPopularServices(options),
    staleTime: 5 * 60 * 1000, // 5 dakika
    cacheTime: 10 * 60 * 1000, // 10 dakika
  });
}

export function usePopularServiceById(
  id: string | null
): UseQueryResult<PopularServiceModel | null, Error> {
  return useQuery({
    queryKey: ['popularService', id],
    queryFn: () => (id ? getPopularServiceById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Sadece turları getir
export function usePopularTours() {
  return usePopularServices({ type: 'tour', onlyPopular: true });
}

// Sadece transferleri getir
export function usePopularTransfers() {
  return usePopularServices({ type: 'transfer', onlyPopular: true });
}

// Sadece rehberleri getir
export function usePopularGuides() {
  return usePopularServices({ type: 'guide', onlyPopular: true });
}
```

#### 3.2 Popüler Rotalar için Hooks
**Dosya:** `hooks/usePopularRoutes.ts` (YENİ)

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPopularRoutes } from '@/lib/firebase/transfers-public';
import type { PopularRouteModel } from '@/types/popular-route';

export function usePopularRoutes(options?: {
  onlyPopular?: boolean;
  limitCount?: number;
}): UseQueryResult<PopularRouteModel[], Error> {
  return useQuery({
    queryKey: ['popularRoutes', options],
    queryFn: () => getPopularRoutes(options),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}
```

---

### Faz 4: Bileşen Güncellemeleri

#### 4.1 PopularServicesSection Güncelleme
**Dosya:** [`components/transfers/PopularServicesSection.tsx`](../web-app/src/components/transfers/PopularServicesSection.tsx:1)

**Değişiklikler:**
1. `POPULAR_SERVICES` import'u kaldır
2. `usePopularTours()` hook'u ekle
3. Loading ve error state'leri ekle
4. Veri yoksa placeholder göster

```typescript
import { usePopularTours } from '@/hooks/usePopularServices';

export function PopularServicesSection({
  onServiceSelect,
  selectedServiceIds = [],
  className,
  availableVehicles = [],
}: PopularServicesSectionProps) {
  const { data: services, isLoading, error } = usePopularTours();
  
  // Loading state
  if (isLoading) {
    return <LoadingPopularServices />;
  }
  
  // Error state
  if (error) {
    return <ErrorPopularServices error={error} />;
  }
  
  // Empty state
  if (!services || services.length === 0) {
    return <EmptyPopularServices />;
  }
  
  // Rest of component logic...
  // services array'i artık Firebase'den geliyor
}
```

#### 4.2 PopularRoutesSection Güncelleme
**Dosya:** [`components/transfers/PopularRoutesSection.tsx`](../web-app/src/components/transfers/PopularRoutesSection.tsx:1)

```typescript
import { usePopularRoutes } from '@/hooks/usePopularRoutes';

export function PopularRoutesSection({
  onRouteSelect,
  selectedRouteId,
  className,
}: PopularRoutesSectionProps) {
  const { data: routes, isLoading, error } = usePopularRoutes({
    onlyPopular: true
  });
  
  if (isLoading) return <LoadingPopularRoutes />;
  if (error) return <ErrorPopularRoutes error={error} />;
  if (!routes || routes.length === 0) return <EmptyPopularRoutes />;
  
  // Rest of component...
}
```

---

### Faz 5: Admin Paneli Geliştirmeleri

#### 5.1 Popüler Hizmetler Formu Güncelleme
**Dosya:** [`app/admin/transfers/popular-services/page.tsx`](../web-app/src/app/admin/transfers/popular-services/page.tsx:1)

**Eklenecek alanlar:**
- Tour Details bölümü
  - Highlights (çoklu text input)
  - Includes (çoklu text input)
  - Min/Max Participants
  - Full Description (textarea)
  - Stops Description (dinamik alan listesi)

```typescript
// ServiceForm component'ine eklenecek
<div className="border-t border-gray-200 pt-4 mt-4">
  <h4 className="mb-3 text-sm font-semibold text-gray-900">
    Tur Detayları (Tur tipi için)
  </h4>
  
  {formData.type === 'tour' && (
    <>
      {/* Highlights */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Öne Çıkanlar
        </label>
        <DynamicStringList
          values={tourDetails.highlights}
          onChange={(val) => setTourDetails({ ...tourDetails, highlights: val })}
          placeholder="Örn: Cebeli Nur (Hira Mağarası)"
        />
      </div>
      
      {/* Includes */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Fiyata Dahil
        </label>
        <DynamicStringList
          values={tourDetails.includes}
          onChange={(val) => setTourDetails({ ...tourDetails, includes: val })}
          placeholder="Örn: Türkçe rehber"
        />
      </div>
      
      {/* Min/Max Participants */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Min. Katılımcı
          </label>
          <input
            type="number"
            value={tourDetails.minParticipants}
            onChange={(e) => setTourDetails({ 
              ...tourDetails, 
              minParticipants: Number(e.target.value) 
            })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            min="1"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Max. Katılımcı
          </label>
          <input
            type="number"
            value={tourDetails.maxParticipants}
            onChange={(e) => setTourDetails({ 
              ...tourDetails, 
              maxParticipants: Number(e.target.value) 
            })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            min="1"
          />
        </div>
      </div>
      
      {/* Full Description */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Detaylı Açıklama
        </label>
        <textarea
          value={tourDetails.fullDescription}
          onChange={(e) => setTourDetails({ 
            ...tourDetails, 
            fullDescription: e.target.value 
          })}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Tur hakkında detaylı açıklama..."
        />
      </div>
      
      {/* Stops Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Durak Açıklamaları
        </label>
        <DynamicStopDescriptions
          values={tourDetails.stopsDescription}
          onChange={(val) => setTourDetails({ 
            ...tourDetails, 
            stopsDescription: val 
          })}
        />
      </div>
    </>
  )}
</div>
```

#### 5.2 Popüler Rotalar Yönetim Sayfası
**Dosya:** `app/admin/transfers/popular-routes/page.tsx` (YENİ)

Locations sayfasına benzer yapıda, ancak sadece popüler rotaları yönetmek için basitleştirilmiş bir sayfa.

---

### Faz 6: Veri Migrasyonu

#### 6.1 Migrasyon Script'i
**Dosya:** `scripts/migrate-popular-services.ts` (YENİ)

```typescript
import { POPULAR_SERVICES } from '../web-app/src/lib/transfers/popular-services-simple';
import { createPopularService } from '../web-app/src/lib/firebase/admin-domain';

async function migratePopularServices() {
  console.log('🚀 Popüler hizmetler migrasyonu başlıyor...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const service of POPULAR_SERVICES) {
    try {
      // ID'yi kaldır (Firestore otomatik oluşturacak)
      const { id, ...serviceData } = service;
      
      // Firebase'e ekle
      const newId = await createPopularService({
        ...serviceData,
        order: successCount, // Sıralama
      });
      
      console.log(`✅ ${service.name} eklendi (${newId})`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${service.name} eklenemedi:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migrasyon tamamlandı:`);
  console.log(`   ✅ Başarılı: ${successCount}`);
  console.log(`   ❌ Hatalı: ${errorCount}`);
}

migratePopularServices();
```

#### 6.2 Rotalar için Migrasyon
**Dosya:** `scripts/migrate-popular-routes.ts` (YENİ)

Benzer mantık ile popüler rotaları migrate edecek.

---

## 🚀 Uygulama Adımları

### Adım 1: Hazırlık (1-2 saat)
1. ✅ Veri modellerini incele ve karşılaştır
2. ✅ Firebase collections yapısını belirle
3. ✅ Type definition'ları hazırla

### Adım 2: Backend (3-4 saat)
1. [`types/popular-service.ts`](../web-app/src/types/popular-service.ts:1) - TourDetails ekle
2. `types/popular-route.ts` - Yeni model oluştur
3. `lib/firebase/transfers-public.ts` - Public API fonksiyonları
4. [`lib/firebase/admin-domain.ts`](../web-app/src/lib/firebase/admin-domain.ts:1) - Popüler rotalar CRUD
5. [`lib/firebase/firestore.ts`](../web-app/src/lib/firebase/firestore.ts:1) - COLLECTIONS.POPULAR_ROUTES ekle

### Adım 3: React Query Hooks (1-2 saat)
1. `hooks/usePopularServices.ts` - Hizmetler için hooks
2. `hooks/usePopularRoutes.ts` - Rotalar için hooks

### Adım 4: Frontend Bileşenler (4-5 saat)
1. [`components/transfers/PopularServicesSection.tsx`](../web-app/src/components/transfers/PopularServicesSection.tsx:1) güncelle
2. [`components/transfers/PopularRoutesSection.tsx`](../web-app/src/components/transfers/PopularRoutesSection.tsx:1) güncelle
3. Loading/Error/Empty state bileşenleri ekle
4. [`components/transfers/TourDetailModal.tsx`](../web-app/src/components/transfers/TourDetailModal.tsx:1) güncelle

### Adım 5: Admin Paneli (5-6 saat)
1. [`app/admin/transfers/popular-services/page.tsx`](../web-app/src/app/admin/transfers/popular-services/page.tsx:1) - Tour details form ekle
2. `app/admin/transfers/popular-routes/page.tsx` - Yeni sayfa oluştur
3. DynamicStringList ve DynamicStopDescriptions helper bileşenleri
4. Admin menüsüne Popüler Rotalar linki ekle

### Adım 6: Veri Migrasyonu (1 saat)
1. `scripts/migrate-popular-services.ts` - Script hazırla
2. `scripts/migrate-popular-routes.ts` - Script hazırla
3. Test ortamında çalıştır
4. Production'a migrate et

### Adım 7: Test & Cleanup (2-3 saat)
1. Tüm yeni fonksiyonları test et
2. UI/UX kontrolleri
3. Performance optimizasyonu
4. Hardcoded dosyaları kaldır veya deprecated işaretle
5. Documentation güncelle

---

## ✅ Kontrol Listesi

### Backend
- [ ] `TourDetails` interface ekle
- [ ] `PopularRouteModel` oluştur
- [ ] `getPopularServices()` fonksiyonu
- [ ] `getPopularServiceById()` fonksiyonu
- [ ] `getPopularRoutes()` fonksiyonu
- [ ] Admin: Popüler rotalar CRUD fonksiyonları
- [ ] Firestore collections güncelle

### Frontend Hooks
- [ ] `usePopularServices` hook
- [ ] `usePopularServiceById` hook
- [ ] `usePopularTours` hook
- [ ] `usePopularTransfers` hook
- [ ] `usePopularGuides` hook
- [ ] `usePopularRoutes` hook

### UI Bileşenler
- [ ] PopularServicesSection Firebase entegrasyonu
- [ ] PopularRoutesSection Firebase entegrasyonu
- [ ] Loading state bileşenleri
- [ ] Error state bileşenleri
- [ ] Empty state bileşenleri
- [ ] TourDetailModal güncelleme

### Admin Panel
- [ ] Popüler hizmetler form - Tour details ekle
- [ ] Popüler rotalar yönetim sayfası
- [ ] DynamicStringList bileşeni
- [ ] DynamicStopDescriptions bileşeni
- [ ] Menü güncellemesi

### Migrasyon
- [ ] Popüler hizmetler migrasyon script
- [ ] Popüler rotalar migrasyon script
- [ ] Test ortamında migrasyon
- [ ] Production migrasyon

### Test & Cleanup
- [ ] Unit testler
- [ ] Integration testler
- [ ] E2E testler
- [ ] Performance testleri
- [ ] Hardcoded dosyaları temizle
- [ ] Documentation

---

## 🔒 Firestore Güvenlik Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Popüler Hizmetler - Public read, admin write
    match /popularServices/{serviceId} {
      allow read: if true; // Herkes okuyabilir
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
    
    // Popüler Rotalar - Public read, admin write
    match /popularRoutes/{routeId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
  }
}
```

---

## 📊 Performans Optimizasyonları

### 1. Client-Side Caching
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      cacheTime: 10 * 60 * 1000, // 10 dakika
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});
```

### 2. Firestore Index'ler
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "popularServices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPopular", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "popularRoutes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPopular", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### 3. Lazy Loading
- TourDetailModal'da lazy load
- Büyük listelerde pagination
- Infinite scroll desteği (opsiyonel)

---

## 🎨 UX İyileştirmeleri

### Loading States
```typescript
function LoadingPopularServices() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
}
```

### Error States
```typescript
function ErrorPopularServices({ error }: { error: Error }) {
  return (
    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-3" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Veri Yüklenemedi
      </h3>
      <p className="text-sm text-red-700 mb-4">
        {error.message}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
```

### Empty States
```typescript
function EmptyPopularServices() {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-12 text-center">
      <Inbox className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Henüz Popüler Hizmet Yok
      </h3>
      <p className="text-sm text-gray-600">
        Yönetici henüz popüler hizmet eklememiş.
      </p>
    </div>
  );
}
```

---

## 🐛 Olası Sorunlar ve Çözümler

### Sorun 1: Veri modeli uyumsuzluğu
**Çözüm:** Migration script'te field mapping yapılmalı

### Sorun 2: Firestore query limitleri
**Çözüm:** Composite index'ler oluşturulmalı

### Sorun 3: Cache invalidation
**Çözüm:** React Query'nin automatic revalidation özelliğini kullan

### Sorun 4: Real-time güncellemeler gerekebilir
**Çözüm:** `onSnapshot` ile realtime listener ekle (Phase 2)

---

## 📈 Gelecek Geliştirmeler

### Faz 2 (Gelecek)
1. Real-time updates (onSnapshot)
2. Arama ve filtreleme
3. Favorilere ekleme
4. Paylaşma özellikleri
5. SEO optimizasyonu
6. Image upload ve gallery
7. Çoklu dil desteği aktif etme
8. Analytics entegrasyonu

---

## 📚 Referanslar

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [React Query Docs](https://tanstack.com/query/latest)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**Son Güncelleme:** 2026-03-12  
**Tahmini Süre:** 18-23 saat  
**Öncelik:** Yüksek  
**Zorluk:** Orta
