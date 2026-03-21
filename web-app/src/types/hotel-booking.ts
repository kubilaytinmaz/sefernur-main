/**
 * Otel Rezervasyon Type Tanımlamaları
 * 2 Aşamalı Rezervasyon Akışı için
 */

import type { NormalizedRoom } from "@/lib/webbeds/types";

/**
 * Rezervasyon adımları
 */
export type BookingStep = "room" | "checkout" | "success";

/**
 * Check-in yapacak kişi bilgileri
 */
export interface GuestInfo {
  title: "Mr" | "Mrs" | "Ms";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identityTaxNumber: string;
}

/**
 * Ödeme kartı bilgileri
 */
export interface PaymentInfo {
  cardHolderName: string;
  cardNumber: string;
  cardExpireMonth: string;
  cardExpireYear: string;
  cardCvv: string;
}

/**
 * Seçili oda bilgileri
 */
export interface SelectedRoomInfo {
  rateId: string;
  roomTypeCode: string;
  roomName: string;
  boardBasis: string;
  price: number;
  currency: string;
  allocationDetails: string;
  maxAdults: number;
  maxChildren: number;
  refundable: boolean;
  leftToSell?: number;
}

/**
 * Otel temel bilgileri
 */
export interface HotelBasicInfo {
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  address: string;
  stars: number;
  cityName?: string;
  cityCode: number;
}

/**
 * Arama parametreleri
 */
export interface HotelSearchParams {
  checkIn: string;
  checkOut: string;
  adults: number;
  cityCode: number;
}

/**
 * Checkout form verisi
 */
export interface CheckoutFormData {
  guestInfo: GuestInfo;
  paymentInfo: PaymentInfo;
  specialRequests: string;
}

/**
 * Ana rezervasyon state
 */
export interface HotelBookingState {
  // Adım
  currentStep: BookingStep;

  // Otel bilgileri
  hotel: HotelBasicInfo;

  // Arama parametreleri
  searchParams: HotelSearchParams;

  // Seçili oda
  selectedRoom: SelectedRoomInfo | null;

  // Form verileri
  guestInfo: GuestInfo;
  paymentInfo: PaymentInfo;
  specialRequests: string;

  // UI state
  isProcessing: boolean;
  errors: Record<string, string>;
  bookingError: string | null;
  bookingMessage: string | null;
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
export type FormStatus =
  | "idle"
  | "validating"
  | "valid"
  | "submitting"
  | "success"
  | "error";

/**
 * Rezervasyon oluşturma sonucu
 */
export interface BookingResult {
  success: boolean;
  bookingReference?: string;
  confirmationNumber?: string;
  orderId?: string;
  paymentHtml?: string;
  error?: string;
}

/**
 * Gece sayısı hesaplama
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = d2.getTime() - d1.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

/**
 * NormalizedRoom'dan SelectedRoomInfo'ya dönüşüm
 */
export function normalizedRoomToSelectedRoom(
  room: NormalizedRoom
): SelectedRoomInfo {
  return {
    rateId: room.rateId || "",
    roomTypeCode: room.roomTypeCode || "",
    roomName: room.roomName || "",
    boardBasis: room.boardBasis || "",
    price: parseFloat(room.price || "0"),
    currency: room.currency || "USD",
    allocationDetails: room.allocationDetails || "",
    maxAdults: parseInt(room.maxAdults || "0"),
    maxChildren: parseInt(room.maxChildren || "0"),
    refundable: room.refundable || false,
    leftToSell: room.leftToSell ? parseInt(room.leftToSell) : undefined,
  };
}

/**
 * Form validasyon fonksiyonları
 */
export const validateGuestInfo = (guestInfo: GuestInfo): FormError[] => {
  const errors: FormError[] = [];

  if (!guestInfo.firstName.trim()) {
    errors.push({ field: "firstName", message: "Ad zorunludur" });
  }

  if (!guestInfo.lastName.trim()) {
    errors.push({ field: "lastName", message: "Soyad zorunludur" });
  }

  if (!guestInfo.email.trim()) {
    errors.push({ field: "email", message: "E-posta zorunludur" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
    errors.push({ field: "email", message: "Geçerli bir e-posta girin" });
  }

  if (!guestInfo.phone.trim()) {
    errors.push({ field: "phone", message: "Telefon zorunludur" });
  }

  if (!guestInfo.identityTaxNumber.trim()) {
    errors.push({
      field: "identityTaxNumber",
      message: "TC Kimlik / Vergi No zorunludur",
    });
  } else if (guestInfo.identityTaxNumber.length !== 11) {
    errors.push({
      field: "identityTaxNumber",
      message: "TC Kimlik 11 hane olmalıdır",
    });
  }

  return errors;
};

export const validatePaymentInfo = (paymentInfo: PaymentInfo): FormError[] => {
  const errors: FormError[] = [];

  if (!paymentInfo.cardHolderName.trim()) {
    errors.push({
      field: "cardHolderName",
      message: "Kart üzerindeki isim zorunludur",
    });
  }

  if (!paymentInfo.cardNumber.trim()) {
    errors.push({ field: "cardNumber", message: "Kart numarası zorunludur" });
  } else {
    // Sadece sayı kontrolü
    const cleanNumber = paymentInfo.cardNumber.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      errors.push({
        field: "cardNumber",
        message: "Geçerli bir kart numarası girin",
      });
    }
  }

  if (!paymentInfo.cardExpireMonth.trim()) {
    errors.push({ field: "cardExpireMonth", message: "Ay zorunludur" });
  } else {
    const month = parseInt(paymentInfo.cardExpireMonth);
    if (month < 1 || month > 12) {
      errors.push({
        field: "cardExpireMonth",
        message: "Ay 1-12 arası olmalıdır",
      });
    }
  }

  if (!paymentInfo.cardExpireYear.trim()) {
    errors.push({ field: "cardExpireYear", message: "Yıl zorunludur" });
  } else {
    const year = parseInt(paymentInfo.cardExpireYear);
    const currentYear = new Date().getFullYear() % 100;
    if (year < currentYear) {
      errors.push({ field: "cardExpireYear", message: "Kart süresi dolmuş" });
    }
  }

  if (!paymentInfo.cardCvv.trim()) {
    errors.push({ field: "cardCvv", message: "CVV zorunludur" });
  } else if (!/^\d{3,4}$/.test(paymentInfo.cardCvv)) {
    errors.push({ field: "cardCvv", message: "CVV 3-4 hane olmalıdır" });
  }

  return errors;
};

/**
 * Tüm checkout form validasyonu
 */
export const validateCheckoutForm = (
  data: CheckoutFormData
): FormError[] => {
  const guestErrors = validateGuestInfo(data.guestInfo);
  const paymentErrors = validatePaymentInfo(data.paymentInfo);
  return [...guestErrors, ...paymentErrors];
};
