// WebBeds API Types (from lib/app/data/models/webbeds/)

export interface WebBedsSearchRequest {
  cityCode: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  rooms: WebBedsRoom[];
  nationality: number;
  currency: number;
}

export interface WebBedsRoom {
  adults: number;
  children: number;
  childAges?: number[];
}

export interface WebBedsHotel {
  hotelId: string;
  hotelName: string;
  address?: string;
  cityName?: string;
  countryName?: string;
  starRating?: number;
  latitude?: number;
  longitude?: number;
  images?: string[];
  amenities?: string[];
  description?: string;
}

export interface WebBedsRoomRate {
  rateId: string;
  roomName: string;
  boardBasis: string;
  price: number;
  currency: string;
  isRefundable: boolean;
  cancellationPolicy?: string;
  maxOccupancy?: number;
  roomAmenities?: string[];
}

export interface WebBedsBlockRequest {
  hotelId: string;
  rateId: string;
  checkIn: string;
  checkOut: string;
  rooms: WebBedsRoom[];
}

export interface WebBedsBlockResponse {
  blockId: string;
  expiresAt: string;
  price: number;
  currency: string;
}

export interface WebBedsBookingRequest {
  blockId: string;
  leadPassenger: PassengerDetails;
  additionalPassengers?: PassengerDetails[];
  specialRequests?: string;
}

export interface PassengerDetails {
  title: string; // Mr, Mrs, Ms, Miss
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface WebBedsBookingResponse {
  bookingId: string;
  confirmationNumber: string;
  status: string;
  voucherUrl?: string;
}
