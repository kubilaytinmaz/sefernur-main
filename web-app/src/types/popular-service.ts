/**
 * Popüler Hizmetler Type Definitions
 * Transfer, Tur ve Rehber hizmetleri için ortak veri yapısı
 */

export type ServiceType = "transfer" | "tour" | "guide";
export type PriceType = "per_km" | "per_person" | "fixed";

export interface PopularServiceModel {
  id: string;
  type: ServiceType;
  name: string;
  nameEn?: string;
  nameTr?: string;
  description: string;
  descriptionEn?: string;
  descriptionTr?: string;
  icon: string;

  // Transfer için mesafe bilgisi
  distance?: {
    km: number;
    text: string;
  };

  // Süre bilgisi
  duration: {
    text: string;
    hours: number;
  };

  // Fiyat gösterimi
  price: {
    display: string;
    baseAmount: number;
    type: PriceType;
  };

  // Güzergah bilgisi (araç kartlarında gösterilecek)
  route?: {
    from: string;
    to: string;
    stops?: string[];
  };

  // Tur/Rehber için ek bilgiler (opsiyonel)
  tourDetails?: {
    highlights: string[];
    includes: string[];
    minParticipants: number;
    maxParticipants: number;
    fullDescription?: string;
    stopsDescription?: { stopName: string; description: string }[];
  };

  isPopular: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Form için input type (id ve timestamps olmadan)
export type PopularServiceInput = Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">;

// Filtreleme için helper types
export interface PopularServiceFilters {
  type?: ServiceType;
  isPopular?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// Service type labels
export const serviceTypeLabels: Record<ServiceType, string> = {
  transfer: "Transfer",
  tour: "Tur",
  guide: "Rehber",
};

// Service type colors
export const serviceTypeColors: Record<ServiceType, { bg: string; text: string; border: string }> = {
  transfer: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  tour: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  guide: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
};

// Price type labels
export const priceTypeLabels: Record<PriceType, string> = {
  per_km: "Kilometre Başı",
  per_person: "Kişi Başı",
  fixed: "Sabit Fiyat",
};

// Popüler emojiler için kategoriler
export interface EmojiCategory {
  name: string;
  emojis: string[];
}

export const emojiCategories: EmojiCategory[] = [
  {
    name: "Yerler & Binalar",
    emojis: ["🕌", "⛪", "🏛️", "🏰", "🏯", "🏢", "⛩️", "🕍", "🗼", "🗽"],
  },
  {
    name: "Doğa & Manzara",
    emojis: ["⛰️", "🏔️", "🌋", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🌊", "🏞️"],
  },
  {
    name: "Ulaşım",
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "✈️", "🚁", "🚂"],
  },
  {
    name: "İnsanlar",
    emojis: ["👤", "👥", "🧑‍🤝‍🧑", "👨‍👩‍👧‍👦", "🧑‍🎓", "👨‍🏫", "🧑‍🏫", "👳", "🧕", "👮", "👷"],
  },
  {
    name: "Yiyecek & İçecek",
    emojis: ["🍽️", "🍴", "🥘", "🍲", "🥗", "🍿", "🧇", "🧆", "🥙", "🧆"],
  },
  {
    name: "Nesneler",
    emojis: ["🎒", "🧳", "🌍", "🗺️", "🧭", "📷", "🔭", "🏅", "🎖️", "🏆"],
  },
  {
    name: "Semboller",
    emojis: ["⭐", "🌟", "✨", "💫", "🔥", "💎", "🎯", "📍", "🔖", "🏷️"],
  },
];
