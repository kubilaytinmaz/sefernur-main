// Converted from lib/app/data/models/tour/tour_model.dart
import { AddressModel } from "./address";

export type TourCategory =
  | "umrah"
  | "hajj"
  | "religious"
  | "cultural"
  | "historical";
export type ServiceType =
  | "with_transport"
  | "without_transport"
  | "flight_included"
  | "custom";

export interface DailyProgram {
  day: number;
  title: string;
  description: string;
  activities?: string[];
}

export interface DailyAvailability {
  isAvailable: boolean;
  capacity: number;
  sold: number;
  price?: number;
}

export interface TourModel {
  id?: string;
  title: string;
  description?: string;
  category?: TourCategory;
  tags?: string[];
  serviceAddresses?: string[];
  durationDays: number;
  startDate?: Date;
  endDate?: Date;
  program?: DailyProgram[];
  basePrice: number;
  childPrice?: number;
  company?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  rating?: number;
  reviewCount?: number;
  images: string[];
  availability?: Record<string, DailyAvailability>; // key: YYYY-MM-DD
  isActive: boolean;
  isPopular?: boolean;
  favoriteUserIds?: string[];
  addressModel?: AddressModel;
  serviceType?: ServiceType;
  mekkeNights?: number;
  medineNights?: number;
  flightDepartureFrom?: string;
  flightDepartureTo?: string;
  flightReturnFrom?: string;
  flightReturnTo?: string;
  airline?: string;
  airlineLogo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
