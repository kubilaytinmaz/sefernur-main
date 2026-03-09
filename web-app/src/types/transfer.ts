// Converted from lib/app/data/models/transfer/transfer_model.dart
import { AddressModel } from "./address";

/** Vehicle types matching Firestore data */
export type VehicleType = "sedan" | "van" | "bus" | "vip" | "jeep" | "coster";

export const vehicleTypeLabels: Record<VehicleType, string> = {
  sedan: "Sedan",
  van: "Van / Minibüs",
  bus: "Otobüs",
  vip: "VIP",
  jeep: "Jeep",
  coster: "Coster",
};

/** Amenity keys stored in Firestore */
export type VehicleAmenity =
  | "insurance"
  | "air_condition"
  | "wifi"
  | "comfort"
  | "usb"
  | "water"
  | "snacks"
  | "tv"
  | "bluetooth"
  | "gps";

export const amenityLabels: Record<VehicleAmenity, string> = {
  insurance: "Tam Sigortalı",
  air_condition: "Klimalı",
  wifi: "WiFi",
  comfort: "Konforlu",
  usb: "USB Şarj",
  water: "Su İkramı",
  snacks: "Atıştırmalık",
  tv: "TV / Ekran",
  bluetooth: "Bluetooth",
  gps: "GPS Navigasyon",
};

export interface TransferDailyAvailability {
  date: string;
  isAvailable: boolean;
  availableSeats: number;
  specialPrice?: number;
}

export interface TransferModel {
  id: string;
  fromAddress: AddressModel;
  toAddress: AddressModel;
  vehicleType: VehicleType;
  vehicleName: string;
  capacity: number;
  luggageCapacity: number;
  childSeatCount: number;
  amenities: VehicleAmenity[];
  basePrice: number;
  durationMinutes: number;
  company: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  rating: number;
  reviewCount: number;
  images: string[];
  availability?: Record<string, TransferDailyAvailability>;
  isActive: boolean;
  isPopular: boolean;
  favoriteUserIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
