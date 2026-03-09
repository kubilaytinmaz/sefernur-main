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
