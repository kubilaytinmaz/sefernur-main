/**
 * Popüler Transfer Rotası Tipi
 * Admin panelinden yönetilebilir popüler transfer rotaları için
 */


/**
 * Araç bazlı fiyat bilgisi
 */
export interface RouteVehiclePrices {
  sedan?: number;    // USD
  van?: number;      // USD
  coster?: number;   // USD
  bus?: number;      // USD
  vip?: number;      // USD
  jeep?: number;     // USD
}

export interface PopularTransferRouteModel {
  id: string;
  name: string;                     // "Cidde Havalimanı → Mekke"
  nameEn?: string;                  // "Jeddah Airport → Mecca"
  fromLocationId: string;           // transfer_locations.id referansı
  toLocationId: string;             // transfer_locations.id referansı
  icon: string;                     // '✈️', '🕌', '🚗', vb.
  isActive: boolean;                // Aktif/Pasif
  isPopular: boolean;               // Ana sayfada göster
  order: number;                    // Sıralama
  distanceKm?: number;              // Mesafe (km)
  durationMinutes?: number;         // Tahmini süre (dakika)
  prices?: RouteVehiclePrices;      // Araç bazlı USD fiyatları (opsiyonel)
  pricingEnabled?: boolean;         // Fiyat yönetimi açık mı? (varsayılan: true)
  createdAt?: Date;
  updatedAt: Date;
}

export type PopularTransferRouteInput = Omit<
  PopularTransferRouteModel,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Lokasyon bilgileriyle birlikte rota
 * Frontend'de kullanım için
 */
export interface PopularTransferRouteWithLocations extends PopularTransferRouteModel {
  fromLocation?: {
    id: string;
    name: string;
    city: string;
    icon?: string;
  };
  toLocation?: {
    id: string;
    name: string;
    city: string;
    icon?: string;
  };
}

/**
 * Rota adı oluşturur (lokasyon adlarından)
 */
export function generateRouteName(fromName: string, toName: string): string {
  return `${fromName} → ${toName}`;
}

/**
 * Rota ID oluşturur (lokasyon ID'lerinden)
 */
export function generateRouteId(fromLocationId: string, toLocationId: string): string {
  return `route-${fromLocationId}-to-${toLocationId}`;
}

/**
 * Süreyi dakikadan saat:dakika formatına çevirir
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} dk`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} saat`;
  }
  return `${hours}s ${mins}dk`;
}

/**
 * Mesafeyi formatlı string olarak döndürür
 */
export function formatDistance(km: number): string {
  return `${km} km`;
}

/**
 * Rota için minimum fiyatı hesaplar
 */
export function getRouteMinPrice(prices?: RouteVehiclePrices): number | null {
  if (!prices) return null;
  const validPrices = Object.values(prices).filter((p): p is number => p != null && p > 0);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

/**
 * Rota için maksimum fiyatı hesaplar
 */
export function getRouteMaxPrice(prices?: RouteVehiclePrices): number | null {
  if (!prices) return null;
  const validPrices = Object.values(prices).filter((p): p is number => p != null && p > 0);
  return validPrices.length > 0 ? Math.max(...validPrices) : null;
}

/**
 * Rota için fiyat aralığını formatlı string olarak döndürür
 */
export function formatRoutePriceRange(prices?: RouteVehiclePrices): string {
  const min = getRouteMinPrice(prices);
  const max = getRouteMaxPrice(prices);
  
  if (min === null || max === null) return "-";
  if (min === max) return `$${min}`;
  return `$${min} - $${max}`;
}

/**
 * Araç tipi için rota fiyatını getir
 */
export function getRouteVehiclePrice(prices?: RouteVehiclePrices, vehicleType?: string): number | null {
  if (!prices || !vehicleType) return null;
  return prices[vehicleType as keyof RouteVehiclePrices] ?? null;
}
