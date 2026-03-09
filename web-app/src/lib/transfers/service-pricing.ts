// Popüler Hizmetler için Fiyat Hesaplama Sistemi
// Transfer, Rehber ve Tur fiyatlandırması

import type { VehicleType } from "@/types/transfer";
import type { PopularService } from "./popular-services";

export interface ServicePriceOptions {
  vehicleType?: VehicleType;  // Transfer için
  passengerCount: number;
  luggageCount?: number;      // Transfer için
}

export interface ServicePriceResult {
  total: number;
  priceType: 'per_person' | 'total';
  breakdown: string[];
  perPersonPrice?: number;    // Grup turları için kişi başı fiyat
}

/**
 * Transfer fiyatlandırması
 * - Baz fiyat x araç çarpanı
 * - Fazla bagaj ücreti (standart 2 üzeri)
 */
function calculateTransferPrice(
  service: PopularService,
  vehicleType: VehicleType,
  luggageCount: number
): ServicePriceResult {
  const basePrice = service.pricing.basePrice;
  const multiplier = service.pricing.vehicleMultipliers?.[vehicleType] || 1.0;

  // Mesafe bazlı fiyat
  let price = basePrice * multiplier;

  const breakdown: string[] = [
    `Baz fiyat: ${basePrice} TL`,
    `Araç çarpanı (${vehicleType}): x${multiplier.toFixed(1)}`,
  ];

  // Fazla bagaj (standart 2 üzeri)
  if (luggageCount > 2) {
    const extraLuggage = luggageCount - 2;
    const luggageFee = extraLuggage * 10; // 10 TL per bagaj
    price += luggageFee;
    breakdown.push(`Fazla bagaj (${extraLuggage} adet): +${luggageFee} TL`);
  }

  return {
    total: Math.round(price),
    priceType: 'total',
    breakdown,
  };
}

/**
 * Rehber/Tur fiyatlandırması
 * - Kişi başı fiyat x yolcu sayısı
 * - Minimum kişi kontrolü
 */
function calculateGuideTourPrice(
  service: PopularService,
  passengerCount: number
): ServicePriceResult {
  const pricePerPerson = service.pricing.basePrice;
  let totalPrice = pricePerPerson * passengerCount;
  let actualPassengerCount = passengerCount;

  const breakdown: string[] = [
    `Kişi başı: ${pricePerPerson} TL`,
  ];

  // Minimum kişi kontrolü
  if (passengerCount < service.minPassengers) {
    // Minimum grup fiyatı uygula
    totalPrice = pricePerPerson * service.minPassengers;
    actualPassengerCount = service.minPassengers;
    breakdown.push(`Minimum grup: ${service.minPassengers} kişi`);
    breakdown.push(`Yolcu sayınız: ${passengerCount} kişi`);
  } else {
    breakdown.push(`Yolcu sayısı: ${passengerCount} kişi`);
  }

  return {
    total: Math.round(totalPrice),
    priceType: 'per_person',
    breakdown,
    perPersonPrice: pricePerPerson,
  };
}

/**
 * Unified hizmet fiyat hesaplama
 * @param service - Popüler hizmet
 * @param options - Fiyat hesaplama seçenekleri
 * @returns Detaylı fiyat hesaplaması
 */
export function calculateServicePrice(
  service: PopularService,
  options: ServicePriceOptions
): ServicePriceResult {
  if (service.type === 'transfer') {
    return calculateTransferPrice(
      service,
      options.vehicleType || 'sedan',
      options.luggageCount || 0
    );
  } else {
    // guide veya tour
    return calculateGuideTourPrice(service, options.passengerCount);
  }
}

/**
 * Hızlı fiyat hesaplama (sadece toplam)
 */
export function getServicePrice(
  service: PopularService,
  vehicleType: VehicleType = 'sedan',
  passengerCount: number = 2,
  luggageCount: number = 2
): number {
  const result = calculateServicePrice(service, {
    vehicleType,
    passengerCount,
    luggageCount,
  });
  return result.total;
}

/**
 * Fiyat aralığı hesaplama (min-max)
 * Transfer için: Sedan (min) - Bus (max)
 * Rehber/Tur için: Minimum grup - Maksimum grup
 */
export function getServicePriceRange(
  service: PopularService,
  passengerCount: number = 4
): { min: number; max: number } {
  if (service.type === 'transfer') {
    // Sedan en ucuz, Bus en pahalı
    const sedanPrice = getServicePrice(service, 'sedan', 1, 0);
    const busPrice = getServicePrice(service, 'bus', 1, 0);
    
    return {
      min: Math.min(sedanPrice, busPrice),
      max: Math.max(sedanPrice, busPrice),
    };
  } else {
    // Rehber/Tur: Min ve max yolcu sayısı
    const minPrice = getServicePrice(service, 'sedan', service.minPassengers, 0);
    const maxPrice = getServicePrice(service, 'sedan', service.maxPassengers, 0);
    
    return {
      min: service.pricing.basePrice, // Kişi başı
      max: service.pricing.basePrice, // Kişi başı sabit
    };
  }
}

/**
 * Araç tipine göre fiyat çarpanı getir
 */
export function getVehicleMultiplier(
  service: PopularService,
  vehicleType: VehicleType
): number {
  if (service.type !== 'transfer') return 1.0;
  return service.pricing.vehicleMultipliers?.[vehicleType] || 1.0;
}

/**
 * Fiyat artış yüzdesi hesapla (sedan'a göre)
 */
export function getPriceIncrease(
  service: PopularService,
  vehicleType: VehicleType
): number {
  if (service.type !== 'transfer') return 0;
  
  const sedanMultiplier = service.pricing.vehicleMultipliers?.sedan || 1.0;
  const currentMultiplier = service.pricing.vehicleMultipliers?.[vehicleType] || 1.0;
  
  return Math.round(((currentMultiplier - sedanMultiplier) / sedanMultiplier) * 100);
}
