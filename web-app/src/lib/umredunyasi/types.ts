/**
 * UmreDunyasi API Types
 *
 * UmreDunyasi API'den gelen veri tipleri.
 * API response formatı: { success: boolean, data: Tour[], pagination: {...} }
 */

/**
 * UmreDunyasi API'den gelen tur firması bilgisi
 */
export interface UmreDunyasiFirm {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  trustScore: number;
  isVerified: boolean;
}

/**
 * UmreDunyasi API'den gelen kategori bilgisi
 */
export interface UmreDunyasiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

/**
 * UmreDunyasi API'den gelen tur kategorisi ilişkisi
 */
export interface UmreDunyasiTourCategoryRelation {
  category: UmreDunyasiCategory;
}

/**
 * UmreDunyasi API'den gelen tur verisi
 *
 * Not: API response'unda Decimal tipi number olarak döner
 */
export interface UmreDunyasiTour {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  priceQuad: number | null;
  priceTriple: number | null;
  priceDouble: number | null;
  priceSingle: number | null;
  priceChild: number | null;
  priceBaby: number | null;
  priceCurrency: string;
  currency: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  duration: number;
  totalQuota: number | null;
  remainingQuota: number | null;
  isSoldOut: boolean;
  hotelStars: number | null;
  hotelMakkah: string | null;
  hotelMadinah: string | null;
  makkahNights: number | null;
  madinahNights: number | null;
  makkahDistanceToHaram: number | null;
  madinahDistanceToMasjid: number | null;
  departureCity: string | null;
  airline: string | null;
  flightRoute: string | null;
  flightType: "DIRECT" | "TRANSFER" | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  sourceUrl: string | null;
  firmId: string;
  firm: UmreDunyasiFirm;
  categories: UmreDunyasiTourCategoryRelation[];
}

/**
 * UmreDunyasi API pagination bilgisi
 */
export interface UmreDunyasiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * UmreDunyasi API response formatı
 */
export interface UmreDunyasiResponse {
  success: boolean;
  data: UmreDunyasiTour[];
  pagination: UmreDunyasiPagination;
}

/**
 * API error response formatı
 */
export interface UmreDunyasiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Sefernur tarafında kullanılacak basitleştirilmiş tur tipi
 */
export interface SefernurTourPreview {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceCurrency: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  hotelStars: number | null;
  hotelMakkah: string | null;
  hotelMadinah: string | null;
  makkahNights: number | null;
  madinahNights: number | null;
  images: string[];
  firm: UmreDunyasiFirm;
  categories: UmreDunyasiCategory[];
  isFeatured: boolean;
  isSoldOut: boolean;
}

/**
 * Tour listesi için query parametreleri
 */
export interface UmreDunyasiToursQuery {
  isActive?: boolean;
  limit?: number;
  page?: number;
  sortBy?: "date" | "price" | "popularity";
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  firmId?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  hotelStars?: number;
  flightType?: "DIRECT" | "TRANSFER";
  search?: string;
  month?: number;
  year?: number;
}
