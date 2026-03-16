// Transfer Fiyat Hesaplama Sistemi
// Rota bazlı sabit fiyatlar (USD'den TL'ye çevrilmiş)
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
    basePrice: 40, // JED-Mekke baz fiyatı (~150 SAR)
    pricePerKm: 0.07, // ~0.25 SAR/km
    nightSurcharge: 5, // ~20 SAR
    waitingFeePerHour: 3, // ~10 SAR
    luggageFee: 1, // ~4 SAR
  },
  van: {
    basePrice: 53, // JED-Mekke baz fiyatı (~200 SAR)
    pricePerKm: 0.10, // ~0.35 SAR/km
    nightSurcharge: 8, // ~30 SAR
    waitingFeePerHour: 4, // ~15 SAR
    luggageFee: 1, // ~4 SAR
  },
  bus: {
    basePrice: 133, // Büyük gruplar için (~500 SAR)
    pricePerKm: 0.13, // ~0.5 SAR/km
    nightSurcharge: 13, // ~50 SAR
    waitingFeePerHour: 5, // ~20 SAR
    luggageFee: 0, // Otobüste fazla bagaj ücreti yok
  },
  vip: {
    basePrice: 80, // VIP araçlar (~300 SAR)
    pricePerKm: 0.10, // ~0.4 SAR/km
    nightSurcharge: 11, // ~40 SAR
    waitingFeePerHour: 5, // ~20 SAR
    luggageFee: 3, // ~10 SAR
  },
  jeep: {
    basePrice: 53, // (~200 SAR)
    pricePerKm: 0.08, // ~0.3 SAR/km
    nightSurcharge: 7, // ~25 SAR
    waitingFeePerHour: 3, // ~12 SAR
    luggageFee: 1, // ~4 SAR
  },
  coster: {
    basePrice: 67, // Toyota Hiace baz fiyatı (~250 SAR)
    pricePerKm: 0.10, // ~0.4 SAR/km
    nightSurcharge: 8, // ~30 SAR
    waitingFeePerHour: 4, // ~15 SAR
    luggageFee: 1, // ~4 SAR
  },
};

// Rota bazlı sabit fiyatlar (USD'den TL'ye çevrilmiş, güncel kur kullanılır)
export interface RouteFixedPrice {
  routeId: string;
  sedan: number;
  van: number;
  coster: number; // Toyota Hiace
}

export const ROUTE_FIXED_PRICES: RouteFixedPrice[] = [
  // Jeddah Havalimanı (JED) ↔ Mekke (~150 SAR = $40)
  { routeId: 'jeddah-airport-mecca', sedan: 40, van: 53, coster: 67 },
  { routeId: 'mecca-jeddah-airport', sedan: 40, van: 53, coster: 67 },
  
  // Jeddah Havalimanı (JED) ↔ Medine (~250 SAR = $67)
  { routeId: 'jeddah-airport-medina', sedan: 67, van: 80, coster: 93 },
  { routeId: 'medina-jeddah-airport', sedan: 67, van: 80, coster: 93 },
  
  // Mekke ↔ Medine (~250 SAR = $67)
  { routeId: 'mecca-medina', sedan: 67, van: 80, coster: 93 },
  { routeId: 'medina-mecca', sedan: 67, van: 80, coster: 93 },
  
  // Medine Havalimanı (MED) ↔ Mekke (tahmini ~300 SAR = $80)
  { routeId: 'medina-airport-mecca', sedan: 80, van: 93, coster: 107 },
  { routeId: 'mecca-medina-airport', sedan: 80, van: 93, coster: 107 },
  
  // Medine Havalimanı (MED) ↔ Medine Şehir (tahmini ~30 SAR = $8)
  { routeId: 'medina-airport-medina', sedan: 8, van: 11, coster: 13 },
  { routeId: 'medina-medina-airport', sedan: 8, van: 11, coster: 13 },
  
  // Mekke Şehir İçi (tahmini ~20 SAR = $5)
  { routeId: 'mecca-haram-to-hotel', sedan: 5, van: 8, coster: 11 },
  { routeId: 'mecca-hotel-to-haram', sedan: 5, van: 8, coster: 11 },
  
  // Medine Şehir İçi (tahmini ~20 SAR = $5)
  { routeId: 'medine-prophet-to-hotel', sedan: 5, van: 8, coster: 11 },
  { routeId: 'medine-hotel-to-prophet', sedan: 5, van: 8, coster: 11 },
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
  
  // Fatura detayları (USD cinsinden hesaplanır, TL'ye çevrilir)
  const breakdown: string[] = [
    `Transfer ücreti: $${basePrice.toFixed(0)}`,
  ];
  
  if (distancePrice > 0) {
    breakdown.push(`Mesafe (${input.distanceKm} km × $${pricing.pricePerKm.toFixed(2)}): $${distancePrice.toFixed(0)}`);
  }
  
  if (nightSurcharge > 0) {
    breakdown.push(`Gece sürşarjı (%20): $${nightSurcharge.toFixed(0)}`);
  }
  
  if (waitingFee > 0) {
    breakdown.push(`Bekleme (${input.waitingHours} saat): $${waitingFee.toFixed(0)}`);
  }
  
  if (luggageFee > 0) {
    breakdown.push(`Fazla bagaj (${input.extraLuggage} adet): $${luggageFee.toFixed(0)}`);
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

/**
 * Saatlik kiralama ücret aralıkları (USD cinsinden)
 * Kullanıcı tarafından admin panelinden belirlenen ücretler
 *
 * Önceki SAR fiyatları USD'ye çevrilmiştir (yaklaşık 3.75 SAR = 1 USD)
 */
export interface HourlyRateTier {
  minHours: number;      // Minimum saat (örneğin: 1)
  maxHours: number;      // Maksimum saat (örneğin: 4)
  pricePerHour: number;  // Saatlik ücret (USD)
}

export interface VehicleHourlyPricing {
  vehicleType: VehicleType;
  tiers: HourlyRateTier[];
  dailyRate?: number;     // Günlük ücret (opsiyonel, 8+ saat için)
}

/**
 * Varsayılan saatlik ücret aralıkları
 * Her araç tipi için farklı saat aralıkları ve fiyatlar
 */
export const DEFAULT_HOURLY_RATES: Record<VehicleType, VehicleHourlyPricing> = {
  sedan: {
    vehicleType: 'sedan',
    tiers: [
      { minHours: 1, maxHours: 4, pricePerHour: 67 },    // 1-4 saat: ~250 SAR/saat
      { minHours: 4, maxHours: 8, pricePerHour: 50 },    // 4-8 saat: ~190 SAR/saat
      { minHours: 8, maxHours: 24, pricePerHour: 40 },   // 8-24 saat: ~150 SAR/saat
    ],
    dailyRate: 400,  // Günlük (24+ saat): ~1500 SAR
  },
  van: {
    vehicleType: 'van',
    tiers: [
      { minHours: 1, maxHours: 4, pricePerHour: 80 },    // 1-4 saat: ~300 SAR/saat
      { minHours: 4, maxHours: 8, pricePerHour: 60 },    // 4-8 saat: ~225 SAR/saat
      { minHours: 8, maxHours: 24, pricePerHour: 50 },   // 8-24 saat: ~190 SAR/saat
    ],
    dailyRate: 500,  // Günlük (24+ saat): ~1875 SAR
  },
  vip: {
    vehicleType: 'vip',
    tiers: [
      { minHours: 1, maxHours: 4, pricePerHour: 133 },   // 1-4 saat: ~500 SAR/saat
      { minHours: 4, maxHours: 8, pricePerHour: 100 },   // 4-8 saat: ~375 SAR/saat
      { minHours: 8, maxHours: 24, pricePerHour: 80 },   // 8-24 saat: ~300 SAR/saat
    ],
    dailyRate: 800,  // Günlük (24+ saat): ~3000 SAR
  },
  coster: {
    vehicleType: 'coster',
    tiers: [
      { minHours: 1, maxHours: 4, pricePerHour: 93 },    // 1-4 saat: ~350 SAR/saat
      { minHours: 4, maxHours: 8, pricePerHour: 70 },    // 4-8 saat: ~260 SAR/saat
      { minHours: 8, maxHours: 24, pricePerHour: 60 },   // 8-24 saat: ~225 SAR/saat
    ],
    dailyRate: 600,  // Günlük (24+ saat): ~2250 SAR
  },
  jeep: {
    vehicleType: 'jeep',
    tiers: [
      { minHours: 1, maxHours: 4, pricePerHour: 67 },    // 1-4 saat: ~250 SAR/saat
      { minHours: 4, maxHours: 8, pricePerHour: 50 },    // 4-8 saat: ~190 SAR/saat
      { minHours: 8, maxHours: 24, pricePerHour: 40 },   // 8-24 saat: ~150 SAR/saat
    ],
    dailyRate: 400,  // Günlük (24+ saat): ~1500 SAR
  },
  bus: {
    vehicleType: 'bus',
    tiers: [
      { minHours: 1, maxHours: 4, pricePerHour: 267 },   // 1-4 saat: ~1000 SAR/saat
      { minHours: 4, maxHours: 8, pricePerHour: 200 },   // 4-8 saat: ~750 SAR/saat
      { minHours: 8, maxHours: 24, pricePerHour: 167 },  // 8-24 saat: ~625 SAR/saat
    ],
    dailyRate: 1600, // Günlük (24+ saat): ~6000 SAR
  },
};

/**
 * Sabit saatlik kiralama ücretleri (USD cinsinden) - Geriye uyumluluk için
 * @deprecated Bunun yerine DEFAULT_HOURLY_RATES kullanın
 */
export const HOURLY_RATES: Record<VehicleType, number> = {
  sedan: 67,     // ~250 SAR (3 kişilik)
  van: 80,       // ~300 SAR (6 kişilik)
  vip: 133,      // ~500 SAR (6 kişi GMC)
  coster: 93,    // ~350 SAR (8 kişilik)
  jeep: 67,      // ~250 SAR (5 kişilik)
  bus: 267,      // ~1000 SAR (45 kişilik)
};

/**
 * Saatlik ücret hesapla (USD cinsinden)
 * @param vehicleType - Araç tipi
 * @param hours - Kiralama süresi (saat)
 * @returns USD cinsinden toplam fiyat
 */
export function calculateHourlyPrice(vehicleType: VehicleType, hours: number): number {
  const pricing = DEFAULT_HOURLY_RATES[vehicleType];
  if (!pricing) return 0;

  // 24 saatten fazla ise günlük ücreti kullan
  if (hours > 24 && pricing.dailyRate) {
    const days = Math.ceil(hours / 24);
    return pricing.dailyRate * days;
  }

  // Uygun aralığı bul
  for (const tier of pricing.tiers) {
    if (hours >= tier.minHours && hours <= tier.maxHours) {
      return tier.pricePerHour * hours;
    }
  }

  // 24 saate kadar bir aralık bulunamazsa son aralığı kullan
  const lastTier = pricing.tiers[pricing.tiers.length - 1];
  return lastTier.pricePerHour * hours;
}

/**
 * Saatlik ücret bilgisi getir (USD cinsinden)
 * @param vehicleType - Araç tipi
 * @param hours - Kiralama süresi (saat)
 * @returns Saatlik ücret ve toplam fiyat
 */
export function getHourlyRateInfo(
  vehicleType: VehicleType,
  hours: number
): { hourlyRate: number; totalPrice: number; tier: HourlyRateTier } | null {
  const pricing = DEFAULT_HOURLY_RATES[vehicleType];
  if (!pricing) return null;

  // 24 saatten fazla ise günlük ücreti kullan
  if (hours > 24 && pricing.dailyRate) {
    const days = Math.ceil(hours / 24);
    return {
      hourlyRate: pricing.dailyRate / 24,
      totalPrice: pricing.dailyRate * days,
      tier: {
        minHours: 24,
        maxHours: Infinity,
        pricePerHour: pricing.dailyRate / 24,
      },
    };
  }

  // Uygun aralığı bul
  for (const tier of pricing.tiers) {
    if (hours >= tier.minHours && hours <= tier.maxHours) {
      return {
        hourlyRate: tier.pricePerHour,
        totalPrice: tier.pricePerHour * hours,
        tier,
      };
    }
  }

  return null;
}

/**
 * Turlardan yola çıkarak araç tipi için saatlik kiralama fiyatını hesapla (USD cinsinden)
 * Önce sabit ücretleri döndürür, tur yoksa null
 * @deprecated Bunun yerine calculateHourlyPrice kullanın
 *
 * @param tours - Popüler turlar listesi (uyumluluk için)
 * @param vehicleType - Araç tipi
 * @returns USD cinsinden saatlik fiyat
 */
export function calculateHourlyRateFromTours(
  tours: PopularServiceModel[],
  vehicleType: VehicleType
): number | null {
  // Sabit saatlik ücretleri kullan (1 saat için)
  return DEFAULT_HOURLY_RATES[vehicleType]?.tiers[0]?.pricePerHour ?? null;
}

/**
 * Tüm araç tipleri için saatlik fiyat haritası oluştur (USD cinsinden)
 * @param tours - Popüler turlar listesi (uyumluluk için)
 * @returns Her araç tipi için USD cinsinden saatlik fiyat (1 saat için)
 */
export function calculateAllHourlyRates(
  tours: PopularServiceModel[]
): Record<VehicleType, number | null> {
  // Her araç tipi için 1 saatlik ücreti döndür
  const rates: Record<VehicleType, number | null> = {} as Record<VehicleType, number | null>;
  for (const vehicleType of Object.keys(DEFAULT_HOURLY_RATES) as VehicleType[]) {
    rates[vehicleType] = DEFAULT_HOURLY_RATES[vehicleType]?.tiers[0]?.pricePerHour ?? null;
  }
  return rates;
}
