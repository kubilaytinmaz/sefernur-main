/**
 * WebBeds V4 API Type Definitions
 * 
 * This file contains all TypeScript types for WebBeds API integration
 * based on the V4 XSD schema and documentation.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Room {
  adults: number;
  children: number;
  childAges?: number[];
}

export interface DateRange {
  checkIn: string;  // YYYY-MM-DD format
  checkOut: string; // YYYY-MM-DD format
}

export interface SearchParams extends DateRange {
  cityCode?: number;
  countryCode?: number;
  rooms: Room[];
  nationality?: number;
  currency?: number;
}

// ============================================================================
// Hotel Types
// ============================================================================

export interface HotelGeoPoint {
  lat: string;
  lng: string;
}

export interface HotelImages {
  thumb?: string;
  image?: Array<string | { url: string }>;
}

export interface HotelFullAddress {
  hotelStreetAddress?: string;
  hotelCity?: string;
  hotelCountry?: string;
}

export interface Hotel {
  "@_HotelId"?: string;
  "@_HotelName"?: string;
  "@_Address"?: string;
  "@_CityName"?: string;
  "@_CityCode"?: string;
  "@_CountryName"?: string;
  "@_CountryCode"?: string;
  "@_Stars"?: string;
  "@_Price"?: string;
  "@_Image"?: string;
  "@_Lat"?: string;
  "@_Lng"?: string;
  "@_GuestRating"?: string;
  "@_ReviewCount"?: string;
  "@_GooglePlaceId"?: string;
  "@_DistanceToHolySite"?: number;
  "@_HolySiteName"?: string;
  "@_DistanceText"?: string;
  
  // Additional fields from API response
  geoPoint?: HotelGeoPoint;
  hotelImages?: HotelImages;
  fullAddress?: HotelFullAddress;
  checkInTime?: string;
  checkOutTime?: string;
  description1?: string;
  description?: string;
  rating?: string;
  cityName?: string;
  cityCode?: string;
  countryName?: string;
  countryCode?: string;
  stars?: string;
  name?: string;
  address?: string;
  image?: string;
  lat?: string;
  lng?: string;
}

export interface NormalizedHotel {
  hotelId: string;
  hotelName: string;
  address: string;
  cityName: string;
  cityCode?: string;
  countryName?: string;
  countryCode?: string;
  stars: string;
  price: string;
  image?: string;
  images?: string[]; // All hotel images
  lat?: string;
  lng?: string;
  rating?: string;
  guestRating?: number;
  reviewCount?: number;
  distanceToHolySite?: number;
  holySiteName?: string;
  distanceText?: string;
  checkInTime?: string;
  checkOutTime?: string;
  description?: string;
}

// ============================================================================
// Room Types
// ============================================================================

export interface RoomInfo {
  maxAdults?: string;
  maxChildren?: string;
  maxOccupancy?: string;
}

export interface RateType {
  "@_currencyid"?: string;
  "@_currencyshort"?: string;
  "@_nonrefundable"?: string;
  "@_notes"?: string;
}

export interface CancellationRule {
  fromDate?: string;
  toDate?: string;
  amendCharge?: string;
  cancelCharge?: string;
  charge?: string;
  amendRestricted?: string;
  cancelRestricted?: string;
  noShowPolicy?: string;
}

export interface RateBasis {
  "@_id"?: string;
  rateType?: RateType;
  total?: string;
  totalTaxes?: string;
  totalFee?: string;
  totalMinimumSelling?: string;
  totalInRequestedCurrency?: string;
  totalMinimumSellingInRequestedCurrency?: string;
  cancellationRules?: {
    rule?: CancellationRule[];
  };
  allocationDetails?: string;
  status?: string;
}

export interface RoomType {
  "@_roomtypecode"?: string;
  name?: string;
  roomInfo?: RoomInfo;
  leftToSell?: string;
  description?: string;
  rateBases?: {
    rateBasis?: RateBasis[];
  };
  rateBasis?: RateBasis; // Direct child without wrapper
}

export interface NormalizedRoom {
  rateId: string;
  roomName: string;
  roomTypeCode: string;
  boardBasis: string;
  price: string;
  minSellingPrice: string;
  currency: string;
  refundable: boolean;
  description?: string;
  leftToSell?: string;
  maxAdults?: string;
  maxChildren?: string;
  maxOccupancy?: string;
  allocationDetails?: string;
  status?: string;
  cancellationRules?: CancellationRule[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface WebBedsResponse {
  success: boolean;
  count?: number;
  error?: string;
  message?: string;
}

export interface HotelListResponse extends WebBedsResponse {
  data?: NormalizedHotel[];
  cityCode?: number;
}

export interface HotelDetailResponse extends WebBedsResponse {
  data?: {
    hotelId: string;
    hotelName: string;
    description?: string;
    address: string;
    fullAddress?: HotelFullAddress;
    stars: string;
    rating?: string;
    images: string[];
    geoPoint?: HotelGeoPoint;
    cityName: string;
    cityCode?: string;
    countryName?: string;
    countryCode?: string;
    checkInTime: string;
    checkOutTime: string;
  };
}

export interface RoomsResponse extends WebBedsResponse {
  data?: {
    hotel: {
      hotelId: string;
      hotelName: string;
      checkInTime: string;
      checkOutTime: string;
      description?: string;
    };
    rooms: NormalizedRoom[];
  };
}

// ============================================================================
// WebBeds Client Method Parameters
// ============================================================================

export interface SearchByCityParams extends SearchParams {
  cityCode: number;
}

export interface GetAllHotelsParams {
  cityCode: number;
  checkIn: string;
  checkOut: string;
  nationality?: number;
  currency?: number;
}

export interface GetHotelsByIdsParams {
  hotelIds: string[];
  checkIn: string;
  checkOut: string;
  nationality?: number;
  currency?: number;
}

export interface GetRoomsParams extends SearchParams {
  hotelId: string;
}

export interface BlockRoomParams extends GetRoomsParams {
  roomTypeCode: string;
  selectedRateBasis: string;
  allocationDetails: string;
}

// ============================================================================
// Parsed XML Types
// ============================================================================

export type XmlObject = Record<string, unknown>;

export interface ParsedWebBedsResponse {
  result?: {
    command?: string;
    date?: string;
    elapsedTime?: string;
    tID?: string;
    ip?: string;
    version?: string;
    hotels?: {
      hotel?: XmlObject | XmlObject[];
    };
    hotel?: XmlObject; // Single hotel response
    request?: {
      error?: {
        class?: string;
        code?: string;
        details?: string;
        extraDetails?: string;
      };
      successful?: string;
    };
    successful?: string;
  };
  Response?: {
    Body?: {
      SearchHotelsResponse?: {
        Hotels?: {
          Hotel?: XmlObject | XmlObject[];
        };
      };
      RoomsResponse?: {
        Rooms?: {
          Room?: XmlObject | XmlObject[];
        };
      };
    };
  };
}
