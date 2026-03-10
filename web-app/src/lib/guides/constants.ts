/**
 * Guide system constants
 * Rehber sistemi için sabitler
 */


export const GUIDE_SORT_OPTIONS = [
  { value: "recommended", label: "Önerilen" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "price-asc", label: "En Düşük Fiyat" },
  { value: "price-desc", label: "En Yüksek Fiyat" },
  { value: "reviews", label: "En Çok Yorum" },
  { value: "experience", label: "En Deneyimli" },
] as const;

export type GuideSortOption = typeof GUIDE_SORT_OPTIONS[number]["value"];

export const GUIDE_SPECIALTY_GROUPS = {
  religious: ["hac", "umre"],
  cultural: ["tarih", "kultur"],
  special: ["vip", "doga", "gastro"],
} as const;

export const GUIDE_PRICE_RANGES = [
  { min: 0, max: 500, label: "₺0 - ₺500" },
  { min: 500, max: 1000, label: "₺500 - ₺1,000" },
  { min: 1000, max: 2000, label: "₺1,000 - ₺2,000" },
  { min: 2000, max: 5000, label: "₺2,000 - ₺5,000" },
  { min: 5000, max: Infinity, label: "₺5,000+" },
] as const;

export const GUIDE_EXPERIENCE_RANGES = [
  { min: 0, max: 2, label: "0-2 yıl" },
  { min: 2, max: 5, label: "2-5 yıl" },
  { min: 5, max: 10, label: "5-10 yıl" },
  { min: 10, max: Infinity, label: "10+ yıl" },
] as const;

export const GUIDE_VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
  MAP: "map",
} as const;

export type GuideViewMode = typeof GUIDE_VIEW_MODES[keyof typeof GUIDE_VIEW_MODES];

export const MAX_COMPARE_GUIDES = 3;

export interface GuideFilterPreset {
  id: string;
  label: string;
  filters: {
    specialties?: string[];
    languages?: string[];
    minRating?: number;
  };
}

export const GUIDE_FILTER_PRESETS: GuideFilterPreset[] = [
  {
    id: "hac",
    label: "Hac için Rehber",
    filters: {
      specialties: ["hac"],
      languages: ["tr", "ar"],
    },
  },
  {
    id: "umre",
    label: "Umre için Rehber",
    filters: {
      specialties: ["umre"],
      languages: ["tr"],
    },
  },
  {
    id: "vip",
    label: "VIP Rehberlik",
    filters: {
      specialties: ["vip"],
      minRating: 4.5,
    },
  },
  {
    id: "cultural",
    label: "Kültür Turu",
    filters: {
      specialties: ["tarih", "kultur"],
    },
  },
];
