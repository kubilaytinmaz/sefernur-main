import type { VehicleType } from "./transfer";

/**
 * Araç tipi bazlı fiyatlandırma modeli
 * Firestore koleksiyonu: transfer_pricing (type: "vehicle_type")
 */
export interface VehiclePricingModel {
  id: string; // vehicleType
  type: "vehicle_type";
  vehicleType: VehicleType;
  basePrice: number;
  pricePerKm: number;
  nightSurcharge: number;
  waitingFeePerHour: number;
  luggageFee: number;
  updatedAt: Date;
  updatedBy: string;
}

/**
 * Rota bazlı fiyatlandırma modeli
 * Firestore koleksiyonu: transfer_pricing (type: "route")
 */
export interface RoutePricingModel {
  id: string; // routeId
  type: "route";
  routeId: string;
  routeName: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  prices: {
    sedan: number;
    van: number;
    coster: number;
    bus?: number;
    vip?: number;
    jeep?: number;
  };
  updatedAt: Date;
  updatedBy: string;
}

/** Tüm fiyatlandırma belgeleri için union type */
export type TransferPricingDocument = VehiclePricingModel | RoutePricingModel;

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
