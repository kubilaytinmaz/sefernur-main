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
    name: 'Mekke Şehir Turu',
    description: 'Mekke ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur',
    icon: '🕌',
    duration: {
      hours: 4,
      text: '4 saat'
    },
    distance: {
      km: 50,
      text: '50 km'
    },
    price: {
      display: '$133\'den',
      baseAmount: 133,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 107,
      van: 133,
      bus: 160,
      vip: 213,
      jeep: 187,
      coster: 147
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-city-tour-madinah',
    type: 'tour',
    name: 'Medine Şehir Turu',
    description: 'Medine ve çevresindeki tarihi ve dini mekanları kapsayan rehberli tur',
    icon: '🕌',
    duration: {
      hours: 4,
      text: '4 saat'
    },
    distance: {
      km: 40,
      text: '40 km'
    },
    price: {
      display: '$133\'den',
      baseAmount: 133,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 107,
      van: 133,
      bus: 160,
      vip: 213,
      jeep: 187,
      coster: 147
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
      display: '$267',
      baseAmount: 267,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 213,
      van: 267,
      bus: 320,
      vip: 400,
      jeep: 293,
      coster: 280
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
      display: '$213\'den',
      baseAmount: 213,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 187,
      van: 213,
      bus: 240,
      vip: 320,
      jeep: 253,
      coster: 227
    },
    isPopular: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-jeddah-city-tour',
    type: 'tour',
    name: 'Jeddah Şehir Turu',
    description: 'Jeddah tarihi merkez ve sahil bölgesi turu',
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
      display: '$160\'den',
      baseAmount: 160,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 133,
      van: 160,
      bus: 187,
      vip: 240,
      jeep: 200,
      coster: 173
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-ziyarat-makkah',
    type: 'tour',
    name: 'Mekke Ziyaret Turları',
    description: 'Mekke civarındaki önemli ziyaret yerlerini kapsayan tur',
    icon: '🗺️',
    duration: {
      hours: 6,
      text: '6 saat'
    },
    distance: {
      km: 80,
      text: '80 km'
    },
    price: {
      display: '$187\'den',
      baseAmount: 187,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 160,
      van: 187,
      bus: 213,
      vip: 267,
      jeep: 227,
      coster: 200
    },
    isPopular: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'service-ziyarat-madinah',
    type: 'tour',
    name: 'Medine Ziyaret Turları',
    description: 'Medine civarındaki önemli ziyaret yerlerini kapsayan tur',
    icon: '🗺️',
    duration: {
      hours: 6,
      text: '6 saat'
    },
    distance: {
      km: 70,
      text: '70 km'
    },
    price: {
      display: '$187\'den',
      baseAmount: 187,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 160,
      van: 187,
      bus: 213,
      vip: 267,
      jeep: 227,
      coster: 200
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
      display: '$400',
      baseAmount: 400,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 320,
      van: 400,
      bus: 480,
      vip: 587,
      jeep: 453,
      coster: 427
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
      display: '$133\'den',
      baseAmount: 133,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 107,
      van: 133,
      bus: 160,
      vip: 213,
      jeep: 187,
      coster: 147
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
      display: '$267\'den',
      baseAmount: 267,
      type: 'fixed'
    },
    vehiclePrices: {
      sedan: 213,
      van: 267,
      bus: 320,
      vip: 400,
      jeep: 293,
      coster: 280
    },
    route: {
      from: 'Mekke',
      to: 'Medine'
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
