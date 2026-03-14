/**
 * Transfer Rezervasyon Tip Tanımları
 * Booking formu ve fiyat hesaplama için kullanılan tipler
 */

import type { PopularServiceModel } from "./popular-service";
import type { TransferModel } from "./transfer";

/**
 * Yolcu tipi
 */
export type PassengerType = "adult" | "child" | "infant";

/**
 * Yolcu bilgileri
 */
export interface PassengerInfo {
  adults: number;
  children: number;
  infants: number;
}

/**
 * İletişim bilgileri
 */
export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
}

/**
 * Adres bilgileri
 */
export interface AddressInfo {
  pickup: string;
  dropoff: string;
  pickupHotel?: string;
  dropoffHotel?: string;
}

/**
 * Uçuş bilgileri (opsiyonel)
 */
export interface FlightInfo {
  flightNumber: string;
  arrivalTime: string;
  airline?: string;
}

/**
 * Tarih ve saat bilgileri
 */
export interface DateTimeInfo {
  pickupDate: Date;
  pickupTime: string;
  returnDate?: Date;
  returnTime?: string;
}

/**
 * Fiyat kırılımı
 */
export interface PriceBreakdown {
  // Transfer fiyatı
  transferBasePrice: number;
  transferDistancePrice: number;
  transferNightSurcharge: number;
  transferWaitingFee: number;
  transferLuggageFee: number;
  transferTotal: number;

  // Tur fiyatı
  tourPrice: number;
  tourPricePerPerson: number;

  // İndirimler
  couponDiscount: number;
  earlyBirdDiscount: number;

  // Toplam
  subtotal: number;
  total: number;
  currency: "TRY" | "USD";

  // Açıklamalar
  breakdown: string[];
}

/**
 * Rezervasyon formu verisi
 */
export interface BookingFormData {
  // Transfer bilgileri
  transferId: string;
  transfer: TransferModel;

  // Tur bilgileri (opsiyonel)
  tourId?: string;
  tour?: PopularServiceModel;

  // Tarih ve saat
  dateTime: DateTimeInfo;

  // Yolcu bilgileri
  passengers: PassengerInfo;

  // Bagaj
  luggageCount: number;
  childSeatNeeded: boolean;

  // İletişim
  contact: ContactInfo;

  // Adres
  addresses: AddressInfo;

  // Uçuş (opsiyonel)
  flightInfo?: FlightInfo;

  // Notlar
  notes?: string;

  // Kupon
  couponCode?: string;

  // Fiyat
  price: PriceBreakdown;
}

/**
 * Form validasyon hatası
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * Form durumu
 */
export type FormStatus = "idle" | "validating" | "valid" | "submitting" | "success" | "error";

/**
 * Rezervasyon oluşturma inputu (Firebase için)
 */
export interface CreateReservationInput {
  userId: string;
  type: "transfer" | "tour" | "transfer_tour";
  itemId: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  people: number;
  price: number;
  currency: "TRY" | "USD";
  status: "pending" | "confirmed" | "cancelled";
  userPhone: string;
  userEmail: string;
  notes?: string;
  metadata?: {
    transferId?: string;
    tourId?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupTime?: string;
    flightNumber?: string;
  };
}

/**
 * Kupon kodu bilgisi
 */
export interface CouponCode {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  applicableTours?: string[];
  applicableVehicles?: string[];
}

/**
 * Fiyat hesaplama inputu
 */
export interface CalculatePriceInput {
  transfer: TransferModel;
  tour?: PopularServiceModel;
  dateTime: DateTimeInfo;
  passengers: PassengerInfo;
  luggageCount: number;
  childSeatNeeded: boolean;
  couponCode?: string;
}

/**
 * Fiyat hesaplama sonucu
 */
export interface CalculatePriceResult {
  price: PriceBreakdown;
  errors: FormError[];
  warnings: string[];
}

/**
 * Form validasyon inputu
 */
export interface ValidateFormInput {
  formData: Partial<BookingFormData>;
}

/**
 * Form validasyon sonucu
 */
export interface ValidateFormResult {
  isValid: boolean;
  errors: FormError[];
  warnings: string[];
}
