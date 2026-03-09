// Converted from lib/app/data/models/car/car_model.dart
import { AddressModel } from "./address";

export type CarType = "economy" | "suv" | "premium";
export type TransmissionType = "manual" | "automatic";
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";

export const carTypeLabels: Record<CarType, string> = {
  economy: "Ekonomi",
  suv: "SUV",
  premium: "Premium",
};

export const transmissionLabels: Record<TransmissionType, string> = {
  manual: "Manuel",
  automatic: "Otomatik",
};

export const fuelTypeLabels: Record<FuelType, string> = {
  petrol: "Benzin",
  diesel: "Dizel",
  hybrid: "Hibrit",
  electric: "Elektrik",
};

export interface CarDailyAvailability {
  date: string;
  isAvailable: boolean;
  availableCount: number;
  timeSlots?: Record<string, boolean>;
}

export interface CarModel {
  id: string;
  brand: string;
  model: string;
  type: CarType;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  company: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  addressModel?: AddressModel;
  dailyPrice: number;
  discountedDailyPrice?: number;
  rating: number;
  reviewCount: number;
  favoriteUserIds?: string[];
  images: string[];
  availability?: Record<string, CarDailyAvailability>;
  isActive: boolean;
  isPopular: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
