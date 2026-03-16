import type { VehicleType } from "./transfer";

/**
 * Rota bazlı fiyatlandırma modeli
 * Firestore koleksiyonu: transfer_pricing (type: "route")
 *
 * Nereden-nereye rotaları için araç bazlı USD fiyatları
 */
export interface RoutePricingModel {
  id: string;
  type: "route";
  routeId: string;           // Benzersiz rota tanımlayıcısı (örn: "jeddah-airport-mecca")
  routeName: string;         // Görünen ad (örn: "Jeddah Havalimanı → Mekke")
  fromCity: string;          // Kalkış yeri
  toCity: string;            // Varış yeri
  fromLocationId?: string;   // transfer_locations referansı (opsiyonel)
  toLocationId?: string;     // transfer_locations referansı (opsiyonel)
  distanceKm: number;        // Mesafe (km)
  durationMinutes?: number;  // Tahmini süre (dakika)
  prices: {
    sedan: number;           // USD
    van: number;             // USD
    coster: number;          // USD
    bus?: number;            // USD (opsiyonel)
    vip?: number;            // USD (opsiyonel)
    jeep?: number;           // USD (opsiyonel)
  };
  isActive: boolean;         // Aktif mi?
  order: number;             // Sıralama
  createdAt?: Date;
  updatedAt: Date;
  updatedBy: string;         // Admin kullanıcı ID
}

/**
 * Rota fiyatı girişi için input type (timestamps olmadan)
 */
export type RoutePricingInput = Omit<RoutePricingModel, "id" | "createdAt" | "updatedAt"> & {
  updatedBy: string;  // Zorunlu alan form için
};

/** Tüm fiyatlandırma belgeleri için union type */
export type TransferPricingDocument = RoutePricingModel;

/** Araç tipi Türkçe etiketleri (fiyatlandırma tablosu için) */
export const vehiclePricingLabels: Record<VehicleType, string> = {
  sedan: "Sedan",
  van: "Van / Minibüs",
  coster: "Coster (Toyota Hiace)",
  bus: "Otobüs",
  vip: "VIP",
  jeep: "Jeep",
};

/** Araç tipi sıralama önceliği */
export const vehiclePricingOrder: VehicleType[] = [
  "sedan",
  "van",
  "coster",
  "bus",
  "vip",
  "jeep",
];

/**
 * USD → TL Dönüşüm sabitleri
 *
 * NOT: Döviz kuru artık merkezi olarak currency.ts'den yönetiliyor.
 * Bu sabitler sadece geriye dönük uyumluluk için tutuluyor.
 *
 * Kullanım: currency.ts'deki usdToTry() fonksiyonunu kullanın.
 */
export const CURRENCY = {
  USD_TO_TL_RATE: 38,  // currency.ts'deki fallback ile aynı olmalı
  DEFAULT_CURRENCY: "USD" as const,
  DISPLAY_CURRENCY: "TL" as const,
} as const;

/**
 * Fiyat formatlama yardımcıları
 */
export function formatUSD(amount: number): string {
  return `$${amount.toFixed(0)}`;
}

export function formatTL(amount: number): string {
  return `${amount.toLocaleString("tr-TR")} ₺`;
}

/**
 * @deprecated USD → TL dönüşümü için currency.ts'deki usdToTry() fonksiyonunu kullanın.
 * Bu fonksiyon sadece geriye dönük uyumluluk için tutuluyor.
 *
 * @example
 * // Yeni kullanım:
 * import { usdToTry } from "@/lib/currency";
 * const tlPrice = usdToTry(usdAmount);
 */
export function convertUSDToTL(usdAmount: number, rate: number = CURRENCY.USD_TO_TL_RATE): number {
  return Math.round(usdAmount * rate);
}

/**
 * Araç tipi için rota fiyatını getir
 */
export function getRouteVehiclePrice(
  routePricing: RoutePricingModel | null,
  vehicleType: VehicleType
): number | null {
  if (!routePricing) return null;
  
  const price = routePricing.prices[vehicleType];
  return price !== undefined ? price : null;
}

/**
 * Varsayılan rota fiyatları (fallback için)
 * Mevcut ROUTE_FIXED_PRICES'den迁移
 */
export interface DefaultRoutePrice {
  routeId: string;
  routeName: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  prices: RoutePricingModel["prices"];
}

export const DEFAULT_ROUTE_PRICES: DefaultRoutePrice[] = [
  {
    routeId: "jeddah-airport-mecca",
    routeName: "Jeddah Havalimanı → Mekke",
    fromCity: "Jeddah Havalimanı",
    toCity: "Mekke",
    distanceKm: 80,
    prices: { sedan: 40, van: 53, coster: 67, bus: 100, vip: 80, jeep: 52 },
  },
  {
    routeId: "mecca-jeddah-airport",
    routeName: "Mekke → Jeddah Havalimanı",
    fromCity: "Mekke",
    toCity: "Jeddah Havalimanı",
    distanceKm: 80,
    prices: { sedan: 40, van: 53, coster: 67, bus: 100, vip: 80, jeep: 52 },
  },
  {
    routeId: "jeddah-airport-medina",
    routeName: "Jeddah Havalimanı → Medine",
    fromCity: "Jeddah Havalimanı",
    toCity: "Medine",
    distanceKm: 420,
    prices: { sedan: 67, van: 80, coster: 93, bus: 140, vip: 134, jeep: 87 },
  },
  {
    routeId: "medina-jeddah-airport",
    routeName: "Medine → Jeddah Havalimanı",
    fromCity: "Medine",
    toCity: "Jeddah Havalimanı",
    distanceKm: 420,
    prices: { sedan: 67, van: 80, coster: 93, bus: 140, vip: 134, jeep: 87 },
  },
  {
    routeId: "mecca-medina",
    routeName: "Mekke → Medine",
    fromCity: "Mekke",
    toCity: "Medine",
    distanceKm: 450,
    prices: { sedan: 67, van: 80, coster: 93, bus: 140, vip: 134, jeep: 87 },
  },
  {
    routeId: "medina-mecca",
    routeName: "Medine → Mekke",
    fromCity: "Medine",
    toCity: "Mekke",
    distanceKm: 450,
    prices: { sedan: 67, van: 80, coster: 93, bus: 140, vip: 134, jeep: 87 },
  },
  {
    routeId: "medina-airport-mecca",
    routeName: "Medine Havalimanı → Mekke",
    fromCity: "Medine Havalimanı",
    toCity: "Mekke",
    distanceKm: 300,
    prices: { sedan: 80, van: 93, coster: 107, bus: 161, vip: 160, jeep: 104 },
  },
  {
    routeId: "mecca-medina-airport",
    routeName: "Mekke → Medine Havalimanı",
    fromCity: "Mekke",
    toCity: "Medine Havalimanı",
    distanceKm: 300,
    prices: { sedan: 80, van: 93, coster: 107, bus: 161, vip: 160, jeep: 104 },
  },
  {
    routeId: "medina-airport-medina",
    routeName: "Medine Havalimanı → Medine Şehir",
    fromCity: "Medine Havalimanı",
    toCity: "Medine",
    distanceKm: 15,
    prices: { sedan: 8, van: 11, coster: 13, bus: 20, vip: 16, jeep: 10 },
  },
  {
    routeId: "medina-medina-airport",
    routeName: "Medine Şehir → Medine Havalimanı",
    fromCity: "Medine",
    toCity: "Medine Havalimanı",
    distanceKm: 15,
    prices: { sedan: 8, van: 11, coster: 13, bus: 20, vip: 16, jeep: 10 },
  },
  {
    routeId: "mecca-haram-to-hotel",
    routeName: "Mekke Haram → Otel",
    fromCity: "Haram",
    toCity: "Mekke Otel",
    distanceKm: 5,
    prices: { sedan: 5, van: 8, coster: 11, bus: 17, vip: 10, jeep: 7 },
  },
  {
    routeId: "mecca-hotel-to-haram",
    routeName: "Mekke Otel → Haram",
    fromCity: "Mekke Otel",
    toCity: "Haram",
    distanceKm: 5,
    prices: { sedan: 5, van: 8, coster: 11, bus: 17, vip: 10, jeep: 7 },
  },
  {
    routeId: "medine-prophet-to-hotel",
    routeName: "Medine Mescid-i Nebevi → Otel",
    fromCity: "Mescid-i Nebevi",
    toCity: "Medine Otel",
    distanceKm: 5,
    prices: { sedan: 5, van: 8, coster: 11, bus: 17, vip: 10, jeep: 7 },
  },
  {
    routeId: "medine-hotel-to-prophet",
    routeName: "Medine Otel → Mescid-i Nebevi",
    fromCity: "Medine Otel",
    toCity: "Mescid-i Nebevi",
    distanceKm: 5,
    prices: { sedan: 5, van: 8, coster: 11, bus: 17, vip: 10, jeep: 7 },
  },
];
