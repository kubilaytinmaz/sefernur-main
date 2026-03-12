// Converted from lib/app/data/models/hotel/hotel_model.dart
import { AddressModel } from "./address";

export type HotelCategory = "budget" | "standard" | "luxury" | "boutique";

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number;
  capacity: number;
  amenities?: string[];
  images?: string[];
}

export interface DailyAvailability {
  isAvailable: boolean;
  capacity: number;
  sold: number;
  price?: number;
}

export interface HotelModel {
  id?: string;
  name: string;
  description?: string;
  images: string[];
  addressModel?: AddressModel;
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  roomTypes?: RoomType[];
  amenities?: string[];
  rating?: number;
  reviewCount?: number;
  category?: HotelCategory;
  availability?: Record<string, DailyAvailability>; // key: YYYY-MM-DD
  isActive: boolean;
  isPopular?: boolean;
  favoriteUserIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/* ────────── Hotel Capacity Types ────────── */

export interface HotelCapacity {
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  availableRooms: number;
  canAccommodate: boolean;
  requiredRooms: number;
  roomTypes: RoomTypeCapacity[];
}

export interface RoomTypeCapacity {
  roomTypeCode: string;
  name: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  price: number;
}

export interface CapacityValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/* ────────── Price Types ────────── */

export interface PriceBreakdown {
  totalPrice: number;
  pricePerNight: number;
  pricePerPerson: number;
  pricePerPersonPerNight: number;
  nights: number;
  guests: number;
}

export interface PriceComparisonResult {
  cheapest: boolean;
  savingsPercent?: number;
  savingsAmount?: number;
}

/* ────────── Guest Configuration Types ────────── */

export interface GuestPreset {
  label: string;
  description: string;
  icon: string;
  rooms: RoomConfig[];
}

export interface RoomConfig {
  adults: number;
  children: number;
  childAges: number[];
}
