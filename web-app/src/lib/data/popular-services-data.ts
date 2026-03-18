/**
 * Popular Services - Local Data with localStorage Support
 * Admin panelden düzenlenebilir, değişiklikler localStorage'da saklanır
 *
 * Bu veriler admin panelde görüntülenip düzenlenebilir
 * Fiyatlar USD cinsindedir
 */

import type { PopularServiceModel } from "@/types/popular-service";

// localStorage key
const STORAGE_KEY = 'sefernur_popular_services';

// localStorage'dan veri yükle
function loadFromStorage(): PopularServiceModel[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Date objelerine dönüştür
    return parsed.map((item: any) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    }));
  } catch (error) {
    console.error('Error loading popular services from storage:', error);
    return null;
  }
}

// localStorage'a veri kaydet
function saveToStorage(data: PopularServiceModel[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving popular services to storage:', error);
  }
}

// Default hardcoded data
const DEFAULT_POPULAR_SERVICES: PopularServiceModel[] = [
  {
    id: 'service-city-tour-makkah',
    type: 'tour',
    name: 'Mekke Çevre Ziyareti',
    description: 'Mekke ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur',
    icon: '🕌',
    duration: {
      hours: 6,
      text: '6 saat'
    },
    distance: {
      km: 80,
      text: '80 km'
    },
    price: {
      display: '$67\'den',
      baseAmount: 67,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 67,
      van: 75,
      bus: 200,
      vip: 107,
      jeep: 107,
      coster: 120
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-city-tour-madinah',
    type: 'tour',
    name: 'Medine Çevre Ziyareti',
    description: 'Medine ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur',
    icon: '🕌',
    duration: {
      hours: 6,
      text: '6 saat'
    },
    distance: {
      km: 70,
      text: '70 km'
    },
    price: {
      display: '$61\'den',
      baseAmount: 61,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 61,
      van: 67,
      bus: 187,
      vip: 93,
      jeep: 93,
      coster: 107
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-hajj-umrah-guide',
    type: 'guide',
    name: 'Hac & Umre Rehberliği',
    description: 'Deneyimli rehber eşliğinde tam rehberlik hizmeti',
    icon: '👨‍🏫',
    duration: {
      hours: 8,
      text: 'Tam gün'
    },
    distance: {
      km: 0,
      text: '-'
    },
    price: {
      display: '$120\'den',
      baseAmount: 120,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 120,
      van: 160,
      bus: 347,
      vip: 227,
      jeep: 227,
      coster: 187
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-taif-tour',
    type: 'tour',
    name: 'Taif Günübirlik Turu',
    description: 'Taif şehrini kapsayan günübirlik tur',
    icon: '🏔️',
    duration: {
      hours: 8,
      text: '8 saat'
    },
    distance: {
      km: 240,
      text: '240 km (gidiş-dönüş)'
    },
    price: {
      display: '$93\'den',
      baseAmount: 93,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 93,
      van: 107,
      bus: 267,
      vip: 213,
      jeep: 213,
      coster: 133
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-jeddah-city-tour',
    type: 'tour',
    name: 'Cidde Şehir Turu',
    description: 'Cidde tarihi merkez ve sahil bölgesi turu',
    icon: '🏙️',
    duration: {
      hours: 5,
      text: '5 saat'
    },
    distance: {
      km: 60,
      text: '60 km'
    },
    price: {
      display: '$93\'den',
      baseAmount: 93,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 93,
      van: 107,
      bus: 267,
      vip: 213,
      jeep: 213,
      coster: 147
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-private-guide',
    type: 'guide',
    name: 'Özel Rehber Hizmeti',
    description: 'Size özel rehberlik hizmeti',
    icon: '👤',
    duration: {
      hours: 4,
      text: '4 saat'
    },
    distance: {
      km: 0,
      text: '-'
    },
    price: {
      display: '$120\'den',
      baseAmount: 120,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 120,
      van: 160,
      bus: 347,
      vip: 227,
      jeep: 227,
      coster: 187
    },
    isPopular: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-airport-transfer',
    type: 'transfer',
    name: 'Havalimanı Transfer',
    description: 'Cidde veya Medine havalimanından otelinize konforlu transfer',
    icon: '✈️',
    duration: {
      hours: 2,
      text: '2 saat'
    },
    distance: {
      km: 100,
      text: '100 km'
    },
    price: {
      display: '$67\'den',
      baseAmount: 67,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 67,
      van: 93,
      bus: 267,
      vip: 133,
      jeep: 133,
      coster: 120
    },
    route: {
      from: 'Havalimanı',
      to: 'Otel'
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-intercity-transfer',
    type: 'transfer',
    name: 'Şehirlerarası Transfer',
    description: 'Mekke, Medine, Cidde ve Taif arasında şehirlerarası transfer',
    icon: '🚗',
    duration: {
      hours: 5,
      text: '5 saat'
    },
    distance: {
      km: 400,
      text: '400 km'
    },
    price: {
      display: '$120\'den',
      baseAmount: 120,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 120,
      van: 160,
      bus: 347,
      vip: 227,
      jeep: 227,
      coster: 187
    },
    route: {
      from: 'Mekke',
      to: 'Medine'
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-complete-tour-package',
    type: 'tour',
    name: 'Tüm Tur Paketi',
    description: 'Mekke, Medine, Taif ve Cidde\'yi kapsayan kapsamlı 4 günlük tur paketi - Tüm kutsal mekanları keşfedin',
    icon: '🌟',
    duration: {
      hours: 25,
      text: '4 gün (25 saat)'
    },
    distance: {
      km: 450,
      text: '450 km (toplam)'
    },
    price: {
      display: '$314\'den',
      baseAmount: 314,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 314,
      van: 347,
      bus: 933,
      vip: 626,
      jeep: 626,
      coster: 466
    },
    tourDetails: {
      highlights: [
        'Mekke Çevre Ziyareti',
        'Medine Çevre Ziyareti',
        'Taif Günübirlik Turu',
        'Cidde Şehir Turu',
        'Kabe ve Mescid-i Haram',
        'Mescid-i Nebevi',
        'Cidde Tarihi Bölge',
        'Taif Dağları ve Bahçeleri'
      ],
      includes: [
        '4 günlük rehberli tur',
        'Tüm giriş ücretleri',
        'Klimalı araç',
        'Profesyonel rehber',
        'Otellerden alış-bırakış',
        'Su servisi',
        'Özel tur programı'
      ],
      minParticipants: 2,
      maxParticipants: 45,
      fullDescription: 'Bu kapsamlı tur paketi ile Suudi Arabistan\'ın en önemli dini ve tarihi mekanlarını 4 günde keşfedin. Mekke\'de Kabe ve Mescid-i Haram\'ı ziyaret edin, Medine\'de Mescid-i Nebevi\'nin huzurunu yaşayın, Taif\'in serin dağlarında vakit geçirin ve Cidde\'nin tarihi sokaklarında gezinin. Profesyonel rehberlerimiz eşliğinde unutulmaz bir deneyim yaşayacaksınız.',
      stopsDescription: [
        {
          stopName: '1. Gün - Mekke Çevre Ziyareti',
          description: 'Mekke ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur. Kabe, Mescid-i Haram, Arafat, Mina ve Muzdelife ziyaretleri.'
        },
        {
          stopName: '2. Gün - Medine Çevre Ziyareti',
          description: 'Medine ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur. Mescid-i Nebevi, Kuba Mescidi, Kıbleteyn Mescidi ve Uhud Dağı ziyaretleri.'
        },
        {
          stopName: '3. Gün - Taif Günübirlik Turu',
          description: 'Taif şehrini kapsayan günübirlik tur. Taif dağları, tarihi çarşı, rose bahçeleri ve Şeddan sarayı ziyaretleri.'
        },
        {
          stopName: '4. Gün - Cidde Şehir Turu',
          description: 'Cidde tarihi merkez ve sahil bölgesi turu. Al-Balad tarihi bölge, Corniche sahil yolu ve Naseef Evi ziyaretleri.'
        }
      ]
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// ═════════════════════════════════════════════════════════════════
// Public Fonksiyonlar (Firebase yerine local data kullanır)
// ═════════════════════════════════════════════════════════════════

// Global data store - localStorage'dan yükler veya default kullanır
let _initialized = false;
let POPULAR_SERVICES: PopularServiceModel[] = [...DEFAULT_POPULAR_SERVICES];

// Initialize data from localStorage or use defaults
function ensureInitialized(): void {
  if (_initialized) return;
  _initialized = true;
  const stored = loadFromStorage();
  if (stored && stored.length > 0) {
    POPULAR_SERVICES = stored;
  }
}

// Initialize on module load (client-side)
if (typeof window !== 'undefined') {
  ensureInitialized();
}

/**
 * Tüm popüler servisleri getir (veya filtrelenmiş)
 */
export async function getPopularServices(options?: {
  type?: "tour" | "transfer" | "guide";
  onlyPopular?: boolean;
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  ensureInitialized();
  let result = [...POPULAR_SERVICES];

  if (options?.type) {
    result = result.filter(s => s.type === options.type);
  }
  if (options?.onlyPopular) {
    result = result.filter(s => s.isPopular);
  }

  result.sort((a, b) => a.price.baseAmount - b.price.baseAmount);

  if (options?.limitCount) {
    result = result.slice(0, options.limitCount);
  }

  return result;
}

/**
 * ID'ye göre popüler servis getir
 */
export async function getPopularServiceById(id: string): Promise<PopularServiceModel | null> {
  return POPULAR_SERVICES.find(s => s.id === id) || null;
}

/**
 * Sadece popüler turları getir
 */
export async function getPopularTours(options?: {
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  return getPopularServices({
    type: "tour",
    onlyPopular: true,
    limitCount: options?.limitCount,
  });
}

/**
 * Sadece popüler transferleri getir
 */
export async function getPopularTransfers(options?: {
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  return getPopularServices({
    type: "transfer",
    onlyPopular: true,
    limitCount: options?.limitCount,
  });
}

/**
 * Sadece popüler rehberleri getir
 */
export async function getPopularGuides(options?: {
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  return getPopularServices({
    type: "guide",
    onlyPopular: true,
    limitCount: options?.limitCount,
  });
}

// ═════════════════════════════════════════════════════════════════
// Admin Fonksiyonları (Local CRUD - bellekte güncelleme)
// ═════════════════════════════════════════════════════════════════

/**
 * Tüm popüler servisleri getir (admin)
 */
export async function getAllPopularServices(options?: {
  type?: "tour" | "transfer" | "guide";
  onlyPopular?: boolean;
}): Promise<PopularServiceModel[]> {
  return getPopularServices(options);
}

/**
 * Popüler servis istatistiklerini getir
 */
export async function getPopularServiceStats(): Promise<{
  total: number;
  popular: number;
  byType: Record<string, number>;
}> {
  return {
    total: POPULAR_SERVICES.length,
    popular: POPULAR_SERVICES.filter(s => s.isPopular).length,
    byType: {
      transfer: POPULAR_SERVICES.filter(s => s.type === 'transfer').length,
      tour: POPULAR_SERVICES.filter(s => s.type === 'tour').length,
      guide: POPULAR_SERVICES.filter(s => s.type === 'guide').length,
    }
  };
}

/**
 * Yeni popüler servis ekle (localStorage'a kaydeder)
 */
export async function createPopularService(
  data: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const id = `service-${Date.now()}`;
  const now = new Date();
  const newService: PopularServiceModel = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  POPULAR_SERVICES.push(newService);
  saveToStorage(POPULAR_SERVICES);
  return id;
}

/**
 * Popüler servis güncelle (localStorage'a kaydeder)
 */
export async function updatePopularService(
  id: string,
  data: Partial<PopularServiceModel>
): Promise<void> {
  const index = POPULAR_SERVICES.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Servis bulunamadı");
  POPULAR_SERVICES[index] = {
    ...POPULAR_SERVICES[index],
    ...data,
    id, // ID değişmemeli
    updatedAt: new Date(),
  };
  saveToStorage(POPULAR_SERVICES);
}

/**
 * Popüler servis sil (localStorage'dan siler)
 */
export async function deletePopularService(id: string): Promise<void> {
  const index = POPULAR_SERVICES.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Servis bulunamadı");
  POPULAR_SERVICES.splice(index, 1);
  saveToStorage(POPULAR_SERVICES);
}

/**
 * localStorage'daki tüm verileri sıfırla (default değerlere dön)
 */
export function resetPopularServicesToDefaults(): void {
  POPULAR_SERVICES = [...DEFAULT_POPULAR_SERVICES];
  saveToStorage(POPULAR_SERVICES);
}

/**
 * Bir servis için minimum fiyatı hesapla
 */
export function getMinPriceForService(service: PopularServiceModel): number {
  if (service.vehiclePrices) {
    const prices = Object.values(service.vehiclePrices).filter((p): p is number => p != null && p > 0);
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  return service.price.baseAmount;
}

/**
 * Bir servis için belirli bir araç tipinin fiyatını getir
 */
export function getPriceForVehicle(
  service: PopularServiceModel,
  vehicleType: string
): number | undefined {
  if (service.vehiclePrices && vehicleType in service.vehiclePrices) {
    return service.vehiclePrices[vehicleType as keyof typeof service.vehiclePrices];
  }
  return undefined;
}
