// Transfer Fiyat Hesaplama Sistemi
// Rota bazlı sabit fiyatlar (SAR'dan TL'ye çevrilmiş)
import type { PopularServiceModel } from "@/types/popular-service";
import type { VehicleType } from "@/types/transfer";

export interface TransferPricing {
  basePrice: number;
  pricePerKm: number;
  nightSurcharge: number; // Gece 00:00-06:00 arası ek ücret
  waitingFeePerHour: number; // Bekleme ücreti
  luggageFee: number; // Fazla bagaj ücreti (standart 2 bagaj üzeri)
}

// Araç tipine göre fiyatlandırma (varsayılan, rota bazlı override edilir)
export const VEHICLE_PRICING: Record<VehicleType, TransferPricing> = {
  sedan: {
    basePrice: 1425, // JED-Mekke baz fiyatı
    pricePerKm: 2.5,
    nightSurcharge: 200,
    waitingFeePerHour: 100,
    luggageFee: 50,
  },
  van: {
    basePrice: 1900, // JED-Mekke baz fiyatı
    pricePerKm: 3.5,
    nightSurcharge: 300,
    waitingFeePerHour: 150,
    luggageFee: 50,
  },
  bus: {
    basePrice: 5000, // Büyük gruplar için
    pricePerKm: 5,
    nightSurcharge: 500,
    waitingFeePerHour: 200,
    luggageFee: 0, // Otobüste fazla bagaj ücreti yok
  },
  vip: {
    basePrice: 3000, // VIP araçlar
    pricePerKm: 4,
    nightSurcharge: 400,
    waitingFeePerHour: 200,
    luggageFee: 100,
  },
  jeep: {
    basePrice: 2000,
    pricePerKm: 3,
    nightSurcharge: 250,
    waitingFeePerHour: 120,
    luggageFee: 50,
  },
  coster: {
    basePrice: 2375, // Toyota Hiace baz fiyatı
    pricePerKm: 4,
    nightSurcharge: 300,
    waitingFeePerHour: 150,
    luggageFee: 50,
  },
};

// Rota bazlı sabit fiyatlar (SAR'dan TL'ye çevrilmiş, 1 SAR = 9.5 TL)
export interface RouteFixedPrice {
  routeId: string;
  sedan: number;
  van: number;
  coster: number; // Toyota Hiace
}

export const ROUTE_FIXED_PRICES: RouteFixedPrice[] = [
  // Jeddah Havalimanı (JED) ↔ Mekke
  { routeId: 'jeddah-airport-mecca', sedan: 1425, van: 1900, coster: 2375 },
  { routeId: 'mecca-jeddah-airport', sedan: 1425, van: 1900, coster: 2375 },
  
  // Jeddah Havalimanı (JED) ↔ Medine
  { routeId: 'jeddah-airport-medina', sedan: 3325, van: 3800, coster: 4275 },
  { routeId: 'medina-jeddah-airport', sedan: 3325, van: 3800, coster: 4275 },
  
  // Mekke ↔ Medine
  { routeId: 'mecca-medina', sedan: 2375, van: 2850, coster: 3325 },
  { routeId: 'medina-mecca', sedan: 2375, van: 2850, coster: 3325 },
  
  // Medine Havalimanı (MED) ↔ Mekke (tahmini)
  { routeId: 'medina-airport-mecca', sedan: 3500, van: 4000, coster: 4500 },
  { routeId: 'mecca-medina-airport', sedan: 3500, van: 4000, coster: 4500 },
  
  // Medine Havalimanı (MED) ↔ Medine Şehir (tahmini)
  { routeId: 'medina-airport-medina', sedan: 300, van: 400, coster: 500 },
  { routeId: 'medina-medina-airport', sedan: 300, van: 400, coster: 500 },
  
  // Mekke Şehir İçi (tahmini)
  { routeId: 'mecca-haram-to-hotel', sedan: 200, van: 300, coster: 400 },
  { routeId: 'mecca-hotel-to-haram', sedan: 200, van: 300, coster: 400 },
  
  // Medine Şehir İçi (tahmini)
  { routeId: 'medine-prophet-to-hotel', sedan: 200, van: 300, coster: 400 },
  { routeId: 'medine-hotel-to-prophet', sedan: 200, van: 300, coster: 400 },
];

export interface PriceCalculationInput {
  vehicleType: VehicleType;
  routeId?: string; // Rota ID'si (opsiyonel, rota bazlı fiyat için)
  distanceKm: number;
  isNightTime: boolean; // 00:00-06:00 arası mı?
  waitingHours?: number; // Bekleme süresi (saat)
  extraLuggage?: number; // Fazla bagaj sayısı (standart 2 bagaj üzeri)
  passengerCount: number;
}

export interface PriceCalculationResult {
  basePrice: number;
  distancePrice: number;
  nightSurcharge: number;
  waitingFee: number;
  luggageFee: number;
  total: number;
  breakdown: string[];
}

/**
 * Rota bazlı sabit fiyatı getir
 */
export function getRouteFixedPrice(routeId: string, vehicleType: VehicleType): number | null {
  const routePrice = ROUTE_FIXED_PRICES.find(r => r.routeId === routeId);
  if (!routePrice) return null;
  
  switch (vehicleType) {
    case 'sedan':
      return routePrice.sedan;
    case 'van':
      return routePrice.van;
    case 'coster':
      return routePrice.coster;
    case 'bus':
      return routePrice.coster * 1.5; // Bus için %50 daha pahalı
    case 'vip':
      return routePrice.sedan * 2; // VIP için %100 daha pahalı
    case 'jeep':
      return routePrice.sedan * 1.3; // Jeep için %30 daha pahalı
    default:
      return routePrice.sedan;
  }
}

/**
 * Transfer fiyatını hesapla
 * @param input - Fiyat hesaplama parametreleri
 * @returns Detaylı fiyat hesaplaması
 */
export function calculateTransferPrice(input: PriceCalculationInput): PriceCalculationResult {
  const pricing = VEHICLE_PRICING[input.vehicleType];
  
  // Önce rota bazlı sabit fiyatı kontrol et
  let basePrice = pricing.basePrice;
  let distancePrice = 0;
  
  if (input.routeId) {
    const routePrice = getRouteFixedPrice(input.routeId, input.vehicleType);
    if (routePrice) {
      basePrice = routePrice;
      distancePrice = 0; // Rota bazlı fiyat zaten mesafe dahil
    } else {
      // Rota bulunamazsa mesafe bazlı hesapla
      distancePrice = input.distanceKm * pricing.pricePerKm;
    }
  } else {
    // Rota ID yoksa mesafe bazlı hesapla
    distancePrice = input.distanceKm * pricing.pricePerKm;
  }
  
  // Gece sürşarjı (00:00-06:00 arası) - %20
  const nightSurcharge = input.isNightTime ? Math.round(basePrice * 0.2) : 0;
  
  // Bekleme ücreti
  const waitingFee = (input.waitingHours || 0) * pricing.waitingFeePerHour;
  
  // Fazla bagaj ücreti (standart 2 bagaj üzeri)
  const luggageFee = (input.extraLuggage || 0) * pricing.luggageFee;
  
  // Toplam
  const total = basePrice + distancePrice + nightSurcharge + waitingFee + luggageFee;
  
  // Fatura detayları
  const breakdown: string[] = [
    `Transfer ücreti: ${basePrice} TL`,
  ];
  
  if (distancePrice > 0) {
    breakdown.push(`Mesafe (${input.distanceKm} km × ${pricing.pricePerKm} TL): ${distancePrice.toFixed(0)} TL`);
  }
  
  if (nightSurcharge > 0) {
    breakdown.push(`Gece sürşarjı (%20): ${nightSurcharge} TL`);
  }
  
  if (waitingFee > 0) {
    breakdown.push(`Bekleme (${input.waitingHours} saat): ${waitingFee} TL`);
  }
  
  if (luggageFee > 0) {
    breakdown.push(`Fazla bagaj (${input.extraLuggage} adet): ${luggageFee} TL`);
  }
  
  return {
    basePrice,
    distancePrice,
    nightSurcharge,
    waitingFee,
    luggageFee,
    total,
    breakdown,
  };
}

/**
 * Saat string'inden gece saati kontrolü
 * @param timeString - "HH:mm" formatında saat
 * @returns Gece saati mi? (00:00-06:00)
 */
export function isNightTime(timeString: string): boolean {
  const hour = parseInt(timeString.split(':')[0], 10);
  return hour >= 0 && hour < 6;
}

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
  pickupTime: string = '09:00'
): { min: number; max: number } {
  const baseCalc = calculateTransferPrice({
    routeId,
    vehicleType,
    distanceKm: 0, // Rota bazlı fiyat kullanılacak
    isNightTime: isNightTime(pickupTime),
    passengerCount: 1,
  });

  const maxCalc = calculateTransferPrice({
    routeId,
    vehicleType,
    distanceKm: 0,
    isNightTime: true,
    waitingHours: 1,
    extraLuggage: 2,
    passengerCount: 4,
  });

  return {
    min: baseCalc.total,
    max: maxCalc.total,
  };
}

/**
 * Kapasite kontrolü - araç yolcu sayısını karşılayabiliyor mu?
 * @param vehicleType - Araç tipi
 * @param passengerCount - Yolcu sayısı
 * @returns Uygun mu?
 */
export function isVehicleSuitable(vehicleType: VehicleType, passengerCount: number): boolean {
  const capacities: Record<VehicleType, number> = {
    sedan: 4,
    van: 7,
    bus: 50,
    vip: 4,
    jeep: 5,
    coster: 12,
  };
  
  return capacities[vehicleType] >= passengerCount;
}

/**
 * Araç tipine göre kapasite getir
 */
export function getVehicleCapacity(vehicleType: VehicleType): number {
  const capacities: Record<VehicleType, number> = {
    sedan: 4,
    van: 7,
    bus: 50,
    vip: 4,
    jeep: 5,
    coster: 12,
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

/**
 * Turlardan yola çıkarak araç tipi için saatlik kiralama fiyatını hesapla (SAR cinsinden)
 * Formül: Her turun (vehiclePrices[araçTipi] / duration.hours) oranını hesapla,
 * en düşük değeri döndür.
 *
 * @param tours - Popüler turlar listesi
 * @param vehicleType - Araç tipi
 * @returns SAR cinsinden saatlik fiyat, tur yoksa null
 */
export function calculateHourlyRateFromTours(
  tours: PopularServiceModel[],
  vehicleType: VehicleType
): number | null {
  if (!tours || tours.length === 0) return null;

  let minRate = Infinity;

  for (const tour of tours) {
    const hours = tour.duration?.hours;
    if (!hours || hours <= 0) continue;

    // Araç tipine özel fiyat varsa onu kullan, yoksa baseAmount
    let tourPrice: number | undefined;
    if (tour.vehiclePrices) {
      tourPrice = tour.vehiclePrices[vehicleType as keyof typeof tour.vehiclePrices] ?? undefined;
    }
    if (tourPrice == null || tourPrice <= 0) {
      tourPrice = tour.price?.baseAmount;
    }
    if (!tourPrice || tourPrice <= 0) continue;

    const rate = Math.round(tourPrice / hours);
    if (rate < minRate) {
      minRate = rate;
    }
  }

  return minRate === Infinity ? null : minRate;
}

/**
 * Tüm araç tipleri için saatlik fiyat haritası oluştur (SAR cinsinden)
 * @param tours - Popüler turlar listesi
 * @returns Her araç tipi için SAR cinsinden saatlik fiyat
 */
export function calculateAllHourlyRates(
  tours: PopularServiceModel[]
): Record<VehicleType, number | null> {
  const vehicleTypes: VehicleType[] = ["sedan", "van", "bus", "vip", "jeep", "coster"];
  const rates: Record<string, number | null> = {};

  for (const vt of vehicleTypes) {
    rates[vt] = calculateHourlyRateFromTours(tours, vt);
  }

  return rates as Record<VehicleType, number | null>;
}
