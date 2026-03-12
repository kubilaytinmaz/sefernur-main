/**
 * Transfer Rezervasyon Yardımcı Fonksiyonları
 * Fiyat hesaplama, validasyon ve veri işleme
 */

import type {
  CalculatePriceInput,
  CalculatePriceResult,
  ContactInfo,
  DateTimeInfo,
  FormError,
  PassengerInfo,
  PriceBreakdown,
  ValidateFormInput,
  ValidateFormResult,
} from "@/types/booking";
import type { TransferModel } from "@/types/transfer";
import type { PopularService } from "./popular-services-simple";
import { calculateTransferPrice, isNightTime } from "./pricing";

/**
 * Toplam yolcu sayısını hesapla
 */
export function getTotalPassengers(passengers: PassengerInfo): number {
  return passengers.adults + passengers.children + passengers.infants;
}

/**
 * Transfer + Tur toplam fiyat hesapla
 */
export function calculateBookingPrice(input: CalculatePriceInput): CalculatePriceResult {
  const { transfer, tour, dateTime, passengers, luggageCount, childSeatNeeded, couponCode } = input;

  const errors: FormError[] = [];
  const warnings: string[] = [];
  const breakdown: string[] = [];

  // ────────── Transfer Fiyatı ──────────

  // Mesafe hesapla (adresler arası - şimdilik sabit varsayıyoruz)
  // Gerçek uygulamada Google Distance Matrix API kullanılmalı
  const distanceKm = tour?.distance?.km || 20; // Varsayılan 20km

  // Gece saati kontrolü
  const isNight = isNightTime(dateTime.pickupTime);

  // Transfer fiyatı hesapla
  const transferPriceResult = calculateTransferPrice({
    vehicleType: transfer.vehicleType,
    distanceKm,
    isNightTime: isNight,
    waitingHours: 0, // İlerilik eklenebilir
    extraLuggage: Math.max(0, luggageCount - transfer.luggageCapacity),
    passengerCount: getTotalPassengers(passengers),
  });

  // ────────── Tur Fiyatı ──────────

  let tourPrice = 0;
  let tourPricePerPerson = 0;

  if (tour) {
    if (tour.price.type === "per_person") {
      tourPricePerPerson = tour.price.baseAmount;
      tourPrice = tourPricePerPerson * getTotalPassengers(passengers);
    } else {
      tourPrice = tour.price.baseAmount;
      tourPricePerPerson = tour.price.baseAmount / getTotalPassengers(passengers);
    }
  }

  // ────────── İndirimler ──────────

  let couponDiscount = 0;
  let earlyBirdDiscount = 0;

  // Kupon kodu kontrolü (ileride eklenecek)
  if (couponCode) {
    // Şimdilik kupon yok
    warnings.push("Kupon kodu şu anda kullanılamıyor");
  }

  // Erken rezervasyon indirimi (7+ gün öncesi)
  const daysUntilPickup = Math.ceil(
    (dateTime.pickupDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilPickup >= 7) {
    earlyBirdDiscount = Math.round((transferPriceResult.total + tourPrice) * 0.05); // %5
    if (earlyBirdDiscount > 0) {
      breakdown.push(`Erken rezervasyon indirimi: -${earlyBirdDiscount}₺`);
    }
  }

  // ────────── Toplam ──────────

  const subtotal = transferPriceResult.total + tourPrice;
  const total = subtotal - couponDiscount - earlyBirdDiscount;

  // Fatura detayları
  breakdown.push(...transferPriceResult.breakdown);

  if (tour) {
    breakdown.push(
      `Tur ücreti (${tour.name}): ${tourPrice}₺`
    );
  }

  const price: PriceBreakdown = {
    transferBasePrice: transferPriceResult.basePrice,
    transferDistancePrice: transferPriceResult.distancePrice,
    transferNightSurcharge: transferPriceResult.nightSurcharge,
    transferWaitingFee: transferPriceResult.waitingFee,
    transferLuggageFee: transferPriceResult.luggageFee,
    transferTotal: transferPriceResult.total,
    tourPrice,
    tourPricePerPerson,
    couponDiscount,
    earlyBirdDiscount,
    subtotal,
    total,
    currency: "TRY",
    breakdown,
  };

  // Validasyon kontrolleri
  if (getTotalPassengers(passengers) > transfer.capacity) {
    errors.push({
      field: "passengers",
      message: `Bu araç maksimum ${transfer.capacity} kişi kapasitelidir.`,
    });
  }

  if (luggageCount > transfer.luggageCapacity + 2) {
    warnings.push(
      `Bagaj sayısı araç kapasitesini aşıyor. Fazla bagaj için ek ücret uygulanabilir.`
    );
  }

  return {
    price,
    errors,
    warnings,
  };
}

/**
 * Form validasyonu
 */
export function validateBookingForm(input: ValidateFormInput): ValidateFormResult {
  const { formData } = input;
  const errors: FormError[] = [];
  const warnings: string[] = [];

  // Tarih validasyonu
  if (formData.dateTime) {
    const { pickupDate, pickupTime } = formData.dateTime;
    const now = new Date();
    const pickupDateTime = new Date(pickupDate);

    const [hours, minutes] = pickupTime.split(":").map(Number);
    pickupDateTime.setHours(hours, minutes, 0, 0);

    if (pickupDateTime < now) {
      errors.push({
        field: "dateTime.pickupDate",
        message: "Alış tarihi gelecekte bir tarih olmalıdır.",
      });
    }

    // En az 1 saat önceden rezervasyon
    const minPickupTime = new Date(now.getTime() + 60 * 60 * 1000);
    if (pickupDateTime < minPickupTime) {
      errors.push({
        field: "dateTime.pickupTime",
        message: "En az 1 saat önceden rezervasyon yapmalısınız.",
      });
    }
  }

  // Yolcu validasyonu
  if (formData.passengers) {
    const total = getTotalPassengers(formData.passengers);
    if (total < 1) {
      errors.push({
        field: "passengers",
        message: "En az 1 yolcu olmalıdır.",
      });
    }
  }

  // İletişim validasyonu
  if (formData.contact) {
    const { name, phone, email } = formData.contact;

    if (!name || name.trim().length < 2) {
      errors.push({
        field: "contact.name",
        message: "İsim en az 2 karakter olmalıdır.",
      });
    }

    if (!phone || phone.trim().length < 10) {
      errors.push({
        field: "contact.phone",
        message: "Geçerli bir telefon numarası giriniz.",
      });
    }

    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({
        field: "contact.email",
        message: "Geçerli bir e-posta adresi giriniz.",
      });
    }
  }

  // Adres validasyonu
  if (formData.addresses) {
    const { pickup, dropoff } = formData.addresses;

    if (!pickup || pickup.trim().length < 10) {
      errors.push({
        field: "addresses.pickup",
        message: "Lütfen detaylı alış adresi giriniz.",
      });
    }

    if (!dropoff || dropoff.trim().length < 10) {
      errors.push({
        field: "addresses.dropoff",
        message: "Lütfen detaylı bırakış adresi giriniz.",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Varsayılan yolcu bilgileri
 */
export function getDefaultPassengers(): PassengerInfo {
  return {
    adults: 1,
    children: 0,
    infants: 0,
  };
}

/**
 * Varsayılan tarih bilgileri
 */
export function getDefaultDateTime(): DateTimeInfo {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  return {
    pickupDate: tomorrow,
    pickupTime: "09:00",
  };
}

/**
 * Varsayılan iletişim bilgileri
 */
export function getDefaultContact(user?: { name?: string; phone?: string; email?: string }): ContactInfo {
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    whatsapp: "",
  };
}

/**
 * Rezervasyon başlığı oluştur
 */
export function createReservationTitle(
  transfer: TransferModel,
  tour?: PopularService
): string {
  const vehicleName = transfer.vehicleName || transfer.vehicleType;
  if (tour) {
    return `${vehicleName} + ${tour.name}`;
  }
  return vehicleName;
}

/**
 * Rezervasyon alt başlığı oluştur
 */
export function createReservationSubtitle(
  transfer: TransferModel,
  tour: PopularService | undefined,
  passengers: PassengerInfo,
  dateTime: DateTimeInfo
): string {
  const totalPassengers = getTotalPassengers(passengers);
  const dateStr = dateTime.pickupDate.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (tour) {
    return `${tour.name} • ${dateStr} • ${totalPassengers} Yolcu`;
  }

  return `${dateStr} • ${totalPassengers} Yolcu`;
}

/**
 * URL'den slug'ı parse et ve ID'yi çıkar
 * Tire içeren ID'leri (tour-*, guide-*, transfer-*) doğru parse eder
 */
export function parseSlugWithId(slug: string): { slug: string; id: string } {
  // Tur ID formatları: tour-*, guide-*, transfer-*
  // Bu formatlara göre ID'yi bul

  // Önce bilinen prefix'leri kontrol et
  const knownPrefixes = ['tour-', 'guide-', 'transfer-'];

  for (const prefix of knownPrefixes) {
    const prefixIndex = slug.lastIndexOf(prefix);
    if (prefixIndex !== -1) {
      // Prefix bulundu, sonrası ID'dir
      const id = slug.substring(prefixIndex);
      const slugPart = slug.substring(0, prefixIndex - 1); // -1 tire için
      return { slug: slugPart, id };
    }
  }

  // Fallback: Eski davranış (son tire)
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  const slugPart = parts.slice(0, -1).join("-");

  return { slug: slugPart, id };
}

/**
 * Transfer ve tur için rezervasyon tipi belirle
 */
export function getReservationType(tour?: PopularService): "transfer" | "tour" | "transfer_tour" {
  if (tour) {
    return "transfer_tour";
  }
  return "transfer";
}
