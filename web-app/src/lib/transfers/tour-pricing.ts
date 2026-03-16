/**
 * Merkezi Tur Fiyat Hesaplama
 * 
 * Tüm tur fiyat hesaplamaları bu dosyadan yapılır.
 * popular-services.json'daki fiyatlar USD cinsindedir.
 * Bu fonksiyonlar USD → TL dönüşümünü otomatik yapar.
 * 
 * Admin panelden fiyat değiştirildiğinde, bu fonksiyonlar
 * aracılığıyla tüm sayfalar otomatik güncellenir.
 */

import { usdToTry } from "@/lib/currency";
import type { PopularServiceModel } from "@/types/popular-service";
import type { VehicleType } from "@/types/transfer";

/**
 * Tur için USD baz fiyatını getir (araç tipine göre)
 * 
 * vehiclePrices varsa araç tipine özel fiyatı, yoksa baseAmount'u döndürür.
 * 
 * @param tour - Popüler tur servisi
 * @param vehicleType - Araç tipi (opsiyonel)
 * @returns USD cinsinden fiyat
 */
export function getTourBasePriceUsd(
  tour: PopularServiceModel,
  vehicleType?: VehicleType
): number {
  // Araç tipine özel fiyat varsa onu kullan
  if (vehicleType && tour.vehiclePrices) {
    const vehiclePrice = tour.vehiclePrices[vehicleType as keyof typeof tour.vehiclePrices];
    if (vehiclePrice != null && vehiclePrice > 0) {
      return vehiclePrice;
    }
  }
  // Yoksa genel baz fiyatı kullan
  return tour.price.baseAmount;
}

/**
 * @deprecated USD kullanın. SAR desteği kaldırılacak.
 * Geriye dönük uyumluluk için
 */
export function getTourBasePriceSar(
  tour: PopularServiceModel,
  vehicleType?: VehicleType
): number {
  // USD fiyatını SAR'a çevir (yaklaşık 3.75 SAR = 1 USD)
  const priceUsd = getTourBasePriceUsd(tour, vehicleType);
  return Math.round(priceUsd * 3.75);
}

/**
 * Tur için toplam fiyat hesapla (TL cinsinden)
 * 
 * Tüm component'ler bu fonksiyonu kullanmalıdır.
 * USD → TL dönüşümü otomatik yapılır.
 * 
 * @param tour - Popüler tur servisi
 * @param vehicleType - Araç tipi (opsiyonel, araç bazlı fiyat için)
 * @param passengerCount - Yolcu sayısı (per_person fiyatlar için)
 * @returns TL cinsinden toplam fiyat
 */
export function calculateTourPriceTry(
  tour: PopularServiceModel,
  vehicleType?: VehicleType,
  passengerCount: number = 1
): number {
  // 1. USD baz fiyatını al
  const basePriceUsd = getTourBasePriceUsd(tour, vehicleType);

  // 2. USD'yi TL'ye çevir
  const basePriceTry = usdToTry(basePriceUsd);

  // 3. Fiyat tipine göre hesapla
  if (tour.price.type === "per_person") {
    return basePriceTry * passengerCount;
  }

  return basePriceTry;
}

/**
 * Tur için kişi başı fiyat hesapla (TL cinsinden)
 * 
 * @param tour - Popüler tur servisi
 * @param vehicleType - Araç tipi (opsiyonel)
 * @param passengerCount - Toplam yolcu sayısı
 * @returns TL cinsinden kişi başı fiyat
 */
export function calculateTourPricePerPersonTry(
  tour: PopularServiceModel,
  vehicleType?: VehicleType,
  passengerCount: number = 1
): number {
  const totalPrice = calculateTourPriceTry(tour, vehicleType, passengerCount);

  if (tour.price.type === "per_person") {
    // Kişi başı fiyatlarda, tek kişilik fiyat
    return usdToTry(getTourBasePriceUsd(tour, vehicleType));
  }

  // Sabit fiyatlarda, yolcu sayısına böl
  return passengerCount > 0 ? totalPrice / passengerCount : totalPrice;
}

/**
 * Minimum tur fiyatını USD olarak getir (en ucuz araç tipi)
 * 
 * @param tour - Popüler tur servisi
 * @returns USD cinsinden minimum fiyat
 */
export function getMinTourPriceUsd(tour: PopularServiceModel): number {
  if (tour.vehiclePrices) {
    const prices = Object.values(tour.vehiclePrices).filter(
      (p): p is number => p != null && p > 0
    );
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  return tour.price.baseAmount;
}

/**
 * @deprecated USD kullanın. SAR desteği kaldırılacak.
 * Geriye dönük uyumluluk için
 */
export function getMinTourPriceSar(tour: PopularServiceModel): number {
  const priceUsd = getMinTourPriceUsd(tour);
  return Math.round(priceUsd * 3.75);
}

/**
 * Minimum tur fiyatını TL olarak getir
 * 
 * @param tour - Popüler tur servisi
 * @returns TL cinsinden minimum fiyat
 */
export function getMinTourPriceTry(tour: PopularServiceModel): number {
  return usdToTry(getMinTourPriceUsd(tour));
}

/**
 * Birden fazla tur için toplam fiyat hesapla (TL cinsinden)
 * 
 * @param tours - Tur listesi
 * @param vehicleType - Araç tipi (opsiyonel)
 * @param passengerCount - Yolcu sayısı
 * @returns TL cinsinden toplam fiyat
 */
export function calculateMultiTourPriceTry(
  tours: PopularServiceModel[],
  vehicleType?: VehicleType,
  passengerCount: number = 1
): number {
  return tours.reduce((sum, tour) => {
    return sum + calculateTourPriceTry(tour, vehicleType, passengerCount);
  }, 0);
}
