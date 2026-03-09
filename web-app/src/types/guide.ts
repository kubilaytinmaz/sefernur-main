/** Guide specialty categories matching Firestore data */
export type GuideSpecialty = "hac" | "umre" | "vip" | "tarih" | "kultur" | "doga" | "gastro";

export const specialtyLabels: Record<GuideSpecialty, string> = {
  hac: "Hac",
  umre: "Umre",
  vip: "VIP",
  tarih: "Tarih",
  kultur: "Kültür",
  doga: "Doğa",
  gastro: "Gastronomi",
};

/** Guide availability status */
export type GuideAvailabilityStatus = "available" | "busy" | "unavailable";

/** Daily availability for guide */
export interface GuideDailyAvailability {
  date: string; // YYYY-MM-DD format
  status: GuideAvailabilityStatus;
  notes?: string;
}

/** Language codes used in Firestore */
export const languageLabels: Record<string, string> = {
  tr: "Türkçe",
  en: "İngilizce",
  ar: "Arapça",
  fr: "Fransızca",
  de: "Almanca",
  es: "İspanyolca",
  ru: "Rusça",
  fa: "Farsça",
  ur: "Urduca",
};

export interface ServiceAddress {
  address: string;
  city: string;
  country: string;
  state: string;
}

export interface GuideModel {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  languages: string[];
  certifications: string[];
  yearsExperience: number;
  dailyRate: number;
  company?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  rating: number;
  reviewCount: number;
  images: string[];
  serviceAddresses: ServiceAddress[];
  city: string;
  isActive: boolean;
  isPopular: boolean;
  availability?: GuideDailyAvailability[]; // Müsaitlik takvimi
  maxGroupSize?: number; // Maksimum grup büyüklüğü
  minBookingDays?: number; // Minimum rezervasyon günü
  createdAt?: Date;
  updatedAt?: Date;
}
