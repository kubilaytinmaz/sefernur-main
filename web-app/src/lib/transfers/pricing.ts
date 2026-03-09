// Transfer Fiyat Hesaplama Sistemi
import type { VehicleType } from "@/types/transfer";

export interface TransferPricing {
  basePrice: number;
  pricePerKm: number;
  nightSurcharge: number; // Gece 00:00-06:00 arası ek ücret
  waitingFeePerHour: number; // Bekleme ücreti
  luggageFee: number; // Fazla bagaj ücreti (standart 2 bagaj üzeri)
}

// Araç tipine göre fiyatlandırma
export const VEHICLE_PRICING: Record<VehicleType, TransferPricing> = {
  sedan: {
    basePrice: 50,
    pricePerKm: 2.5,
    nightSurcharge: 30,
    waitingFeePerHour: 50,
    luggageFee: 10,
  },
  van: {
    basePrice: 80,
    pricePerKm: 3.5,
    nightSurcharge: 50,
    waitingFeePerHour: 75,
    luggageFee: 15,
  },
  bus: {
    basePrice: 200,
    pricePerKm: 5,
    nightSurcharge: 100,
    waitingFeePerHour: 150,
    luggageFee: 0, // Otobüste fazla bagaj ücreti yok
  },
  vip: {
    basePrice: 150,
    pricePerKm: 4,
    nightSurcharge: 75,
    waitingFeePerHour: 100,
    luggageFee: 20,
  },
  jeep: {
    basePrice: 100,
    pricePerKm: 3,
    nightSurcharge: 40,
    waitingFeePerHour: 60,
    luggageFee: 15,
  },
  coster: {
    basePrice: 150,
    pricePerKm: 4,
    nightSurcharge: 60,
    waitingFeePerHour: 100,
    luggageFee: 10,
  },
};

export interface PriceCalculationInput {
  vehicleType: VehicleType;
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
 * Transfer fiyatını hesaplar
 * @param input - Fiyat hesaplama parametreleri
 * @returns Detaylı fiyat hesaplaması
 */
export function calculateTransferPrice(input: PriceCalculationInput): PriceCalculationResult {
  const pricing = VEHICLE_PRICING[input.vehicleType];
  
  // Mesafe fiyatı
  const distancePrice = input.distanceKm * pricing.pricePerKm;
  
  // Gece sürşarjı (00:00-06:00 arası)
  const nightSurcharge = input.isNightTime ? pricing.nightSurcharge : 0;
  
  // Bekleme ücreti
  const waitingFee = (input.waitingHours || 0) * pricing.waitingFeePerHour;
  
  // Fazla bagaj ücreti (standart 2 bagaj üzeri)
  const luggageFee = (input.extraLuggage || 0) * pricing.luggageFee;
  
  // Toplam
  const total = pricing.basePrice + distancePrice + nightSurcharge + waitingFee + luggageFee;
  
  // Fatura detayları
  const breakdown: string[] = [
    `Başlangıç ücreti: ${pricing.basePrice} TL`,
    `Mesafe (${input.distanceKm} km × ${pricing.pricePerKm} TL): ${distancePrice.toFixed(0)} TL`,
  ];
  
  if (nightSurcharge > 0) {
    breakdown.push(`Gece sürşarjı: ${nightSurcharge} TL`);
  }
  
  if (waitingFee > 0) {
    breakdown.push(`Bekleme (${input.waitingHours} saat): ${waitingFee} TL`);
  }
  
  if (luggageFee > 0) {
    breakdown.push(`Fazla bagaj (${input.extraLuggage} adet): ${luggageFee} TL`);
  }
  
  return {
    basePrice: pricing.basePrice,
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
  distanceKm: number,
  vehicleType: VehicleType,
  pickupTime: string = '09:00'
): { min: number; max: number } {
  const baseCalc = calculateTransferPrice({
    vehicleType,
    distanceKm,
    isNightTime: isNightTime(pickupTime),
    passengerCount: 1,
  });

  const maxCalc = calculateTransferPrice({
    vehicleType,
    distanceKm,
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
    van: 8,
    bus: 50,
    vip: 4,
    jeep: 5,
    coster: 15,
  };
  
  return capacities[vehicleType] >= passengerCount;
}
