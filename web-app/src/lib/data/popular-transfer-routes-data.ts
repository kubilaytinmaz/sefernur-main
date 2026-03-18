/**
 * Popüler Transfer Rotaları Veri Katmanı
 * Admin panelinden yönetilebilir popüler transfer rotaları için
 * 
 * NOT: Şimdilik bellekte tutuluyor (Firebase entegrasyonu sonrası Firestore'a taşınacak)
 */

import type {
  PopularTransferRouteInput,
  PopularTransferRouteModel,
  PopularTransferRouteWithLocations,
} from '@/types/popular-transfer-route';
import { getTransferLocationById } from './transfer-locations-data';

// ─────────────────────────────────────────────────────────────
// BAŞLANGIÇ VERİLERİ (TransferSearchForm.tsx'den migrate edildi)
// ─────────────────────────────────────────────────────────────

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
    pricingEnabled: true,
    prices: { sedan: 67, van: 93, coster: 120, bus: 267, vip: 133, jeep: 133 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-medina-airport-to-medina',
    name: 'Medine Havalimanı → Medine',
    nameEn: 'Medina Airport → Medina',
    fromLocationId: 'medina_airport',
    toLocationId: 'medina',
    icon: '✈️',
    isActive: true,
    isPopular: true,
    order: 1,
    distanceKm: 15,
    durationMinutes: 20,
    pricingEnabled: true,
    prices: { sedan: 21, van: 32, coster: 53, bus: 147, vip: 53, jeep: 53 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-medina',
    name: 'Mekke → Medine',
    nameEn: 'Mecca → Medina',
    fromLocationId: 'mecca',
    toLocationId: 'medina',
    icon: '🕌',
    isActive: true,
    isPopular: true,
    order: 2,
    distanceKm: 450,
    durationMinutes: 300,
    pricingEnabled: true,
    prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-medina-to-mecca',
    name: 'Medine → Mekke',
    nameEn: 'Medina → Mecca',
    fromLocationId: 'medina',
    toLocationId: 'mecca',
    icon: '🕌',
    isActive: true,
    isPopular: true,
    order: 3,
    distanceKm: 450,
    durationMinutes: 300,
    pricingEnabled: true,
    prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-jeddah-airport',
    name: 'Mekke → Cidde Havalimanı',
    nameEn: 'Mecca → Jeddah Airport',
    fromLocationId: 'mecca',
    toLocationId: 'jeddah_airport',
    icon: '✈️',
    isActive: true,
    isPopular: true,
    order: 4,
    distanceKm: 75,
    durationMinutes: 75,
    pricingEnabled: true,
    prices: { sedan: 53, van: 80, coster: 107, bus: 213, vip: 120, jeep: 120 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-medina-to-medina-airport',
    name: 'Medine → Medine Havalimanı',
    nameEn: 'Medina → Medina Airport',
    fromLocationId: 'medina',
    toLocationId: 'medina_airport',
    icon: '✈️',
    isActive: true,
    isPopular: false,
    order: 5,
    distanceKm: 15,
    durationMinutes: 20,
    pricingEnabled: true,
    prices: { sedan: 21, van: 32, coster: 53, bus: 147, vip: 53, jeep: 53 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-jeddah-airport-to-medina',
    name: 'Cidde Havalimanı → Medine',
    nameEn: 'Jeddah Airport → Medina',
    fromLocationId: 'jeddah_airport',
    toLocationId: 'medina',
    icon: '✈️',
    isActive: true,
    isPopular: false,
    order: 6,
    distanceKm: 420,
    durationMinutes: 280,
    pricingEnabled: true,
    prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-medina-to-jeddah-airport',
    name: 'Medine → Cidde Havalimanı',
    nameEn: 'Medina → Jeddah Airport',
    fromLocationId: 'medina',
    toLocationId: 'jeddah_airport',
    icon: '✈️',
    isActive: true,
    isPopular: false,
    order: 7,
    distanceKm: 420,
    durationMinutes: 280,
    pricingEnabled: true,
    prices: { sedan: 120, van: 160, coster: 187, bus: 347, vip: 227, jeep: 227 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-medina-airport-to-mecca',
    name: 'Medine Havalimanı → Mekke',
    nameEn: 'Medina Airport → Mecca',
    fromLocationId: 'medina_airport',
    toLocationId: 'mecca',
    icon: '✈️',
    isActive: true,
    isPopular: false,
    order: 8,
    distanceKm: 300,
    durationMinutes: 240,
    pricingEnabled: true,
    prices: { sedan: 141, van: 192, coster: 240, bus: 494, vip: 280, jeep: 280 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-medina-airport',
    name: 'Mekke → Medine Havalimanı',
    nameEn: 'Mecca → Medina Airport',
    fromLocationId: 'mecca',
    toLocationId: 'medina_airport',
    icon: '✈️',
    isActive: true,
    isPopular: false,
    order: 9,
    distanceKm: 300,
    durationMinutes: 240,
    pricingEnabled: true,
    prices: { sedan: 141, van: 192, coster: 240, bus: 494, vip: 280, jeep: 280 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-taif',
    name: 'Mekke → Taif',
    nameEn: 'Mecca → Taif',
    fromLocationId: 'mecca',
    toLocationId: 'taif',
    icon: '🏔️',
    isActive: true,
    isPopular: false,
    order: 10,
    distanceKm: 90,
    durationMinutes: 90,
    pricingEnabled: true,
    prices: { sedan: 93, van: 107, coster: 133, bus: 267, vip: 213, jeep: 213 },
    updatedAt: new Date('2024-01-01'),
  },
  // Yeni rotalar - SAR fiyatlarından USD'ye çevrilmiş (1 SAR = 0.2666 USD)
  {
    id: 'route-mecca-to-badr-to-medina',
    name: 'Mekke → Bedir → Medine',
    nameEn: 'Mecca → Badr → Medina',
    fromLocationId: 'mecca',
    toLocationId: 'medina',
    icon: '🕌',
    isActive: true,
    isPopular: false,
    order: 11,
    distanceKm: 500,
    durationMinutes: 360,
    pricingEnabled: true,
    prices: { sedan: 147, van: 173, coster: 213, bus: 400, vip: 267, jeep: 267 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-hudeybiye',
    name: 'Mekke → Hudeybiye',
    nameEn: 'Mecca → Hudaibiyah',
    fromLocationId: 'mecca',
    toLocationId: 'hudeybiye',
    icon: '🕌',
    isActive: true,
    isPopular: false,
    order: 12,
    distanceKm: 25,
    durationMinutes: 60,
    pricingEnabled: true,
    prices: { sedan: 40, van: 48, coster: 67, bus: 187, vip: 107, jeep: 107 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-cirane',
    name: 'Mekke → Cirane',
    nameEn: 'Mecca → Jirana',
    fromLocationId: 'mecca',
    toLocationId: 'cirane',
    icon: '🕌',
    isActive: true,
    isPopular: false,
    order: 13,
    distanceKm: 25,
    durationMinutes: 60,
    pricingEnabled: true,
    prices: { sedan: 40, van: 48, coster: 67, bus: 187, vip: 107, jeep: 107 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-aisha-tanim',
    name: 'Mekke → Aişe Tenim',
    nameEn: 'Mecca → Aisha Tanim',
    fromLocationId: 'mecca',
    toLocationId: 'aisha_tanim',
    icon: '🕌',
    isActive: true,
    isPopular: false,
    order: 14,
    distanceKm: 8,
    durationMinutes: 20,
    pricingEnabled: true,
    prices: { sedan: 19, van: 32, coster: 53, bus: 133, vip: 80, jeep: 80 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-mecca-to-train-station',
    name: 'Mekke → Tren İstasyonu',
    nameEn: 'Mecca → Train Station',
    fromLocationId: 'mecca',
    toLocationId: 'mecca_train_station',
    icon: '🚉',
    isActive: true,
    isPopular: false,
    order: 15,
    distanceKm: 10,
    durationMinutes: 15,
    pricingEnabled: true,
    prices: { sedan: 21, van: 27, coster: 40, bus: 107, vip: 53, jeep: 53 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-medina-to-train-station',
    name: 'Medine → Tren İstasyonu',
    nameEn: 'Medina → Train Station',
    fromLocationId: 'medina',
    toLocationId: 'medina_train_station',
    icon: '🚉',
    isActive: true,
    isPopular: false,
    order: 16,
    distanceKm: 10,
    durationMinutes: 15,
    pricingEnabled: true,
    prices: { sedan: 21, van: 27, coster: 40, bus: 107, vip: 53, jeep: 53 },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'route-taif-to-mecca',
    name: 'Taif → Mekke',
    nameEn: 'Taif → Mecca',
    fromLocationId: 'taif',
    toLocationId: 'mecca',
    icon: '🏔️',
    isActive: true,
    isPopular: false,
    order: 17,
    distanceKm: 90,
    durationMinutes: 90,
    pricingEnabled: true,
    prices: { sedan: 93, van: 107, coster: 133, bus: 267, vip: 213, jeep: 213 },
    updatedAt: new Date('2024-01-01'),
  },
];

// ─────────────────────────────────────────────────────────────
// BELLEK DEPOSU (Firebase entegrasyonuna kadar)
// ─────────────────────────────────────────────────────────────

let POPULAR_ROUTES: PopularTransferRouteModel[] = [...INITIAL_POPULAR_ROUTES];

// ─────────────────────────────────────────────────────────────
// PUBLIC CRUD FONKSİYONLARI
// ─────────────────────────────────────────────────────────────

/**
 * Tüm popüler rotaları getir
 */
export async function getAllPopularTransferRoutes(): Promise<PopularTransferRouteModel[]> {
  return [...POPULAR_ROUTES].sort((a, b) => a.order - b.order);
}

/**
 * Sadece aktif ve popüler rotaları getir (frontend için)
 */
export async function getActivePopularTransferRoutes(): Promise<PopularTransferRouteModel[]> {
  const all = await getAllPopularTransferRoutes();
  return all.filter(route => route.isActive && route.isPopular);
}

/**
 * Sadece aktif rotaları getir (tüm rotalar, popüler olmayan dahil)
 */
export async function getActiveTransferRoutes(): Promise<PopularTransferRouteModel[]> {
  const all = await getAllPopularTransferRoutes();
  return all.filter(route => route.isActive);
}

/**
 * ID'ye göre rota getir
 */
export async function getPopularTransferRouteById(
  id: string
): Promise<PopularTransferRouteModel | null> {
  return POPULAR_ROUTES.find(route => route.id === id) || null;
}

/**
 * Lokasyon bilgileriyle birlikte rota getir
 */
export async function getRouteWithLocations(
  routeId: string
): Promise<PopularTransferRouteWithLocations | null> {
  const route = await getPopularTransferRouteById(routeId);
  if (!route) return null;

  const fromLocation = await getTransferLocationById(route.fromLocationId);
  const toLocation = await getTransferLocationById(route.toLocationId);

  return {
    ...route,
    fromLocation: fromLocation
      ? { id: fromLocation.id, name: fromLocation.name, city: fromLocation.city, icon: fromLocation.icon }
      : undefined,
    toLocation: toLocation
      ? { id: toLocation.id, name: toLocation.name, city: toLocation.city, icon: toLocation.icon }
      : undefined,
  };
}

/**
 * Tüm rotaları lokasyon bilgileriyle birlikte getir
 */
export async function getAllRoutesWithLocations(): Promise<PopularTransferRouteWithLocations[]> {
  const routes = await getAllPopularTransferRoutes();
  const result: PopularTransferRouteWithLocations[] = [];

  for (const route of routes) {
    const fromLocation = await getTransferLocationById(route.fromLocationId);
    const toLocation = await getTransferLocationById(route.toLocationId);

    result.push({
      ...route,
      fromLocation: fromLocation
        ? { id: fromLocation.id, name: fromLocation.name, city: fromLocation.city, icon: fromLocation.icon }
        : undefined,
      toLocation: toLocation
        ? { id: toLocation.id, name: toLocation.name, city: toLocation.city, icon: toLocation.icon }
        : undefined,
    });
  }

  return result;
}

/**
 * Yeni popüler rota ekle
 */
export async function createPopularTransferRoute(
  data: PopularTransferRouteInput
): Promise<string> {
  const id = `route-${Date.now()}`;
  const now = new Date();

  const newRoute: PopularTransferRouteModel = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  POPULAR_ROUTES.push(newRoute);
  return id;
}

/**
 * Popüler rota güncelle
 */
export async function updatePopularTransferRoute(
  id: string,
  data: Partial<PopularTransferRouteInput>
): Promise<void> {
  const index = POPULAR_ROUTES.findIndex(route => route.id === id);
  if (index === -1) {
    throw new Error(`Rota bulunamadı: ${id}`);
  }

  POPULAR_ROUTES[index] = {
    ...POPULAR_ROUTES[index],
    ...data,
    id, // ID değişmemeli
    updatedAt: new Date(),
  };
}

/**
 * Popüler rota sil
 */
export async function deletePopularTransferRoute(id: string): Promise<void> {
  const index = POPULAR_ROUTES.findIndex(route => route.id === id);
  if (index === -1) {
    throw new Error(`Rota bulunamadı: ${id}`);
  }

  POPULAR_ROUTES.splice(index, 1);
}

/**
 * Rotaları yeniden sırala
 */
export async function reorderPopularTransferRoutes(
  orders: Record<string, number>
): Promise<void> {
  for (const [id, order] of Object.entries(orders)) {
    const route = POPULAR_ROUTES.find(r => r.id === id);
    if (route) {
      route.order = order;
      route.updatedAt = new Date();
    }
  }
}

/**
 * Rota istatistikleri
 */
export async function getPopularTransferRouteStats(): Promise<{
  total: number;
  active: number;
  popular: number;
}> {
  return {
    total: POPULAR_ROUTES.length,
    active: POPULAR_ROUTES.filter(r => r.isActive).length,
    popular: POPULAR_ROUTES.filter(r => r.isPopular).length,
  };
}

/**
 * Rota için fiyatları getir (ID'ye göre)
 */
export async function getRoutePricesById(
  routeId: string
): Promise<import('@/types/popular-transfer-route').RouteVehiclePrices | null> {
  const route = await getPopularTransferRouteById(routeId);
  if (!route || !route.pricingEnabled || !route.prices) {
    return null;
  }
  return route.prices;
}

/**
 * İki lokasyon arasındaki rota için fiyatları getir
 */
export async function getRoutePricesByLocations(
  fromLocationId: string,
  toLocationId: string
): Promise<import('@/types/popular-transfer-route').RouteVehiclePrices | null> {
  const routes = await getAllPopularTransferRoutes();
  const route = routes.find(
    r => r.fromLocationId === fromLocationId &&
         r.toLocationId === toLocationId &&
         r.isActive
  );
  
  if (!route || !route.pricingEnabled || !route.prices) {
    return null;
  }
  
  return route.prices;
}
