/**
 * Transfer Fiyat Hesaplama Sistemi v2
 * Rota bazlı USD fiyatları, TL dönüşümü ve popüler turlar entegrasyonu
 */

import { usdToTry } from "@/lib/currency";
import type { PopularServiceModel } from "@/types/popular-service";
import type { VehicleType } from "@/types/transfer";
import type { RoutePricingModel } from "@/types/transfer-pricing";
import {
  DEFAULT_ROUTE_PRICES,
  formatTL,
  formatUSD,
  getRouteVehiclePrice,
} from "@/types/transfer-pricing";

// ─── Type Definitions ─────────────────────────────────────────────────────

export interface PriceCalculationInput {
  vehicleType: VehicleType;
  routeId?: string;           // Rota ID (opsiyonel)
  routePricing?: RoutePricingModel;  // Rota fiyat verisi (opsiyonel)
  distanceKm?: number;        // Mesafe (km) - rota yoksa kullanılır
  isNightTime?: boolean;      // Gece sürşarjı için
  waitingHours?: number;      // Bekleme süresi (saat)
  extraLuggage?: number;      // Fazla bagaj sayısı
  passengerCount?: number;    // Yolcu sayısı
}

export interface PriceCalculationResult {
  usdPrice: number;           // USD fiyat
  tlPrice: number;            // TL fiyat
  displayUSD: string;         // Formatlı USD
  displayTL: string;          // Formatlı TL
  breakdown: string[];        // Fiyat dökümü
  routeUsed?: string;         // Kullanılan rota
}

// ─── Constants ─────────────────────────────────────────────────────────────

// Gece sürşarjı oranı (%)
const NIGHT_SURCHARGE_RATE = 0.20;

// Bekleme ücreti (USD/saat)
const WAITING_FEE_PER_HOUR = 5;

// Fazla bagaj ücreti (USD/adet)
const LUGGAGE_FEE_PER_ITEM = 2;

// Varsayılan mesafe bazlı fiyat (USD/km)
const DEFAULT_PRICE_PER_KM = 0.50;

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Saat string'inden gece saati kontrolü
 * @param timeString - "HH:mm" formatında saat
 * @returns Gece saati mi? (00:00-06:00)
 */
export function isNightTime(timeString: string): boolean {
  const hour = parseInt(timeString.split(":")[0], 10);
  return hour >= 0 && hour < 6;
}

/**
 * Rota bazlı fiyat hesapla
 */
function calculateRoutePrice(
  routePricing: RoutePricingModel | null,
  vehicleType: VehicleType
): number | null {
  return getRouteVehiclePrice(routePricing, vehicleType);
}

/**
 * Mesafe bazlı fiyat hesapla (rota tanımlı değilse)
 */
function calculateDistancePrice(distanceKm: number, vehicleType: VehicleType): number {
  // Araç tipine göre çarpan
  const vehicleMultiplier: Record<VehicleType, number> = {
    sedan: 1.0,
    van: 1.3,
    coster: 1.5,
    bus: 2.5,
    vip: 2.0,
    jeep: 1.3,
  };

  return Math.round(distanceKm * DEFAULT_PRICE_PER_KM * vehicleMultiplier[vehicleType]);
}

/**
 * Popüler tur için araç fiyatı hesapla
 */
export function calculateTourVehiclePrice(
  tour: PopularServiceModel,
  vehicleType: VehicleType,
  routePricingMap?: Map<string, RoutePricingModel>
): number {
  // 1. Önce override kontrol et
  if (tour.vehiclePrices?.[vehicleType]) {
    return tour.vehiclePrices[vehicleType];
  }

  // 2. Rota fiyatından çek
  if (tour.routePricingId && routePricingMap) {
    const routePricing = routePricingMap.get(tour.routePricingId);
    if (routePricing) {
      const price = calculateRoutePrice(routePricing, vehicleType);
      if (price !== null) return price;
    }
  }

  // 3. Varsayılan fiyat
  return tour.price.baseAmount;
}

/**
 * Tüm popüler turlar için araç fiyatlarını hesapla
 */
export function calculateAllTourVehiclePrices(
  tours: PopularServiceModel[],
  vehicleTypes: VehicleType[],
  routePricingMap?: Map<string, RoutePricingModel>
): Map<string, Map<VehicleType, number>> {
  const pricesMap = new Map<string, Map<VehicleType, number>>();

  for (const tour of tours) {
    const vehiclePrices = new Map<VehicleType, number>();
    for (const vehicleType of vehicleTypes) {
      const price = calculateTourVehiclePrice(tour, vehicleType, routePricingMap);
      vehiclePrices.set(vehicleType, price);
    }
    pricesMap.set(tour.id, vehiclePrices);
  }

  return pricesMap;
}

// ─── Main Price Calculation Function ───────────────────────────────────────

/**
 * Transfer fiyatını hesapla
 * @param input - Fiyat hesaplama parametreleri
 * @returns Detaylı fiyat hesaplaması (USD ve TL)
 */
export function calculateTransferPrice(input: PriceCalculationInput): PriceCalculationResult {
  const {
    vehicleType,
    routeId,
    routePricing,
    distanceKm = 0,
    isNightTime = false,
    waitingHours = 0,
    extraLuggage = 0,
  } = input;

  let basePriceUSD = 0;
  let routeUsed: string | undefined;

  // 1. Rota bazlı fiyat kontrolü
  if (routePricing) {
    const routePrice = calculateRoutePrice(routePricing, vehicleType);
    if (routePrice !== null) {
      basePriceUSD = routePrice;
      routeUsed = routePricing.routeName;
    }
  } else if (routeId) {
    // Varsayılan rota fiyatlarını kontrol et
    const defaultRoute = DEFAULT_ROUTE_PRICES.find(r => r.routeId === routeId);
    if (defaultRoute) {
      const price = defaultRoute.prices[vehicleType];
      if (price !== undefined) {
        basePriceUSD = price;
        routeUsed = defaultRoute.routeName;
      }
    }
  }

  // 2. Rota fiyatı yoksa mesafe bazlı hesapla
  if (basePriceUSD === 0 && distanceKm > 0) {
    basePriceUSD = calculateDistancePrice(distanceKm, vehicleType);
  }

  // 3. Ek ücretleri hesapla
  const nightSurcharge = isNightTime ? Math.round(basePriceUSD * NIGHT_SURCHARGE_RATE) : 0;
  const waitingFee = waitingHours * WAITING_FEE_PER_HOUR;
  const luggageFee = extraLuggage * LUGGAGE_FEE_PER_ITEM;

  // 4. Toplam USD fiyat
  const totalUSD = basePriceUSD + nightSurcharge + waitingFee + luggageFee;

  // 5. TL dönüşümü (merkezi currency.ts fonksiyonunu kullan)
  const totalTL = usdToTry(totalUSD);

  // 6. Fatura detayları
  const breakdown: string[] = [];

  if (routeUsed) {
    breakdown.push(`Rota: ${routeUsed}`);
  }

  breakdown.push(`Araç: ${vehicleType}`);
  breakdown.push(`Transfer ücreti: ${formatUSD(basePriceUSD)}`);

  if (nightSurcharge > 0) {
    breakdown.push(`Gece sürşarjı (%${NIGHT_SURCHARGE_RATE * 100}): ${formatUSD(nightSurcharge)}`);
  }

  if (waitingFee > 0) {
    breakdown.push(`Bekleme (${waitingHours} saat): ${formatUSD(waitingFee)}`);
  }

  if (luggageFee > 0) {
    breakdown.push(`Fazla bagaj (${extraLuggage} adet): ${formatUSD(luggageFee)}`);
  }

  breakdown.push(`---`);
  breakdown.push(`Toplam: ${formatUSD(totalUSD)} = ${formatTL(totalTL)}`);

  return {
    usdPrice: totalUSD,
    tlPrice: totalTL,
    displayUSD: formatUSD(totalUSD),
    displayTL: formatTL(totalTL),
    breakdown,
    routeUsed,
  };
}

// ─── Price Estimation Functions ───────────────────────────────────────────────

/**
 * Popüler bir rota için tahmini fiyat hesapla
 * @param routeId - Rota ID'si
 * @param vehicleType - Araç tipi
 * @param pickupTime - Alış saati (HH:mm)
 * @returns Fiyat aralığı
 */
export function estimateRoutePrice(
  routeId: string,
  vehicleType: VehicleType,
  pickupTime: string = "09:00"
): { minUSD: number; minTL: number; maxUSD: number; maxTL: number } {
  const baseCalc = calculateTransferPrice({
    vehicleType,
    routeId,
    isNightTime: isNightTime(pickupTime),
  });

  const maxCalc = calculateTransferPrice({
    vehicleType,
    routeId,
    isNightTime: true,
    waitingHours: 1,
    extraLuggage: 2,
  });

  return {
    minUSD: baseCalc.usdPrice,
    minTL: baseCalc.tlPrice,
    maxUSD: maxCalc.usdPrice,
    maxTL: maxCalc.tlPrice,
  };
}

/**
 * Popüler tur için tahmini fiyat hesapla
 */
export function estimateTourPrice(
  tour: PopularServiceModel,
  vehicleType: VehicleType,
  routePricingMap?: Map<string, RoutePricingModel>
): { usdPrice: number; tlPrice: number; displayUSD: string; displayTL: string } {
  const usdPrice = calculateTourVehiclePrice(tour, vehicleType, routePricingMap);
  const tlPrice = usdToTry(usdPrice);

  return {
    usdPrice,
    tlPrice,
    displayUSD: formatUSD(usdPrice),
    displayTL: formatTL(tlPrice),
  };
}

// ─── Vehicle Capacity Functions ───────────────────────────────────────────────

/**
 * Kapasite kontrolü - araç yolcu sayısını karşılayabiliyor mu?
 */
export function isVehicleSuitable(vehicleType: VehicleType, passengerCount: number): boolean {
  const capacities: Record<VehicleType, number> = {
    sedan: 3,
    van: 6,
    bus: 45,
    vip: 6,
    jeep: 5,
    coster: 8,
  };

  return capacities[vehicleType] >= passengerCount;
}

/**
 * Araç tipine göre kapasite getir
 */
export function getVehicleCapacity(vehicleType: VehicleType): number {
  const capacities: Record<VehicleType, number> = {
    sedan: 3,
    van: 6,
    bus: 45,
    vip: 6,
    jeep: 5,
    coster: 8,
  };

  return capacities[vehicleType];
}

/**
 * Araç tipine göre bagaj kapasitesi getir
 */
export function getVehicleLuggageCapacity(vehicleType: VehicleType): number {
  const capacities: Record<VehicleType, number> = {
    sedan: 2,
    van: 5,
    bus: 20,
    vip: 3,
    jeep: 4,
    coster: 8,
  };

  return capacities[vehicleType];
}

// ─── Export Legacy Functions for Compatibility ───────────────────────────────

/**
 * @deprecated Use calculateTransferPrice instead
 *
 * Önce admin paneldeki fiyatları dener, bulamazsa varsayılan fiyatları kullanır
 */
export async function getRouteFixedPrice(routeId: string, vehicleType: VehicleType): Promise<number | null> {
  // 1. Önce admin paneldeki popüler transfer rotalarından fiyatları çek
  try {
    const { getAllPopularTransferRoutes } = await import("@/lib/data/popular-transfer-routes-data");
    
    // Tüm rotaları al ve ID'yi tam eşleşmeye bakarak kontrol et
    const allRoutes = await getAllPopularTransferRoutes();
    
    // Önce routeId ile tam eşleşen bir rota ara (örn: "route-mecca-to-medina")
    let matchingRoute = allRoutes.find(r => r.id === routeId);
    
    // Bulamazsa, routeId'den lokasyonları parse et ve eşleşen rota ara
    if (!matchingRoute) {
      // routeId'yi parse et - örnekler:
      // "mecca-medina" → mecca, medina
      // "jeddah-airport-mecca" → jeddah_airport, mecca (locationId formatına çevir)
      const locationId = routeId.replace(/-/g, '_');
      matchingRoute = allRoutes.find(r => {
        const routeKey = `${r.fromLocationId}_${r.toLocationId}`.replace(/_/g, '-');
        return routeKey === routeId ||
               `${r.fromLocationId}-${r.toLocationId}` === routeId;
      });
    }
    
    // Eşleşen rota bulunduysa ve fiyatlandırma aktifse, araç fiyatını döndür
    if (matchingRoute && matchingRoute.pricingEnabled && matchingRoute.prices) {
      const price = matchingRoute.prices[vehicleType];
      if (price !== undefined && price !== null) {
        return price;
      }
    }
  } catch (error) {
    console.warn("Admin panel fiyatları alınamadı, varsayılan fiyatlar kullanılıyor:", error);
  }

  // 2. Admin panelde fiyat yoksa varsayılan fiyatları kullan
  const defaultRoute = DEFAULT_ROUTE_PRICES.find(r => r.routeId === routeId);
  if (!defaultRoute) return null;

  const price = defaultRoute.prices[vehicleType];
  return price !== undefined ? price : null;
}
