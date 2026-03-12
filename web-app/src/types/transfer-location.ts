/**
 * Transfer lokasyon ve rota yönetimi için tip tanımları
 * Firestore koleksiyonları: transfer_locations, transfer_routes
 */

/** Lokasyon tipleri */
export type TransferLocationType =
  | "airport"
  | "hotel"
  | "holy_site"
  | "city"
  | "landmark"
  | "train_station";

/** Lokasyon modeli */
export interface TransferLocationModel {
  id: string;
  name: string;
  nameEn: string;
  nameTr: string;
  type: TransferLocationType;
  city: string;
  country: string;
  address?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  icon: string;
  description?: string;
  descriptionEn?: string;
  descriptionTr?: string;
  isPopular: boolean;
  usageCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Rota kategorisi */
export type TransferRouteCategory = "transfer" | "tour";

/** Rota modeli */
export interface TransferRouteModel {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  viaLocationIds?: string[];
  category: TransferRouteCategory;
  subCategory?: string;
  distanceKm: number;
  durationMinutes: number;
  icon: string;
  description: string;
  descriptionEn?: string;
  descriptionTr?: string;
  isPopular: boolean;
  usageCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Lokasyon tipi Türkçe etiketleri */
export const locationTypeLabels: Record<TransferLocationType, string> = {
  airport: "Havalimanı",
  hotel: "Otel",
  holy_site: "Kutsal Yer",
  city: "Şehir",
  landmark: "Landmark",
  train_station: "Tren İstasyonu",
};

/** Lokasyon tipi ikon önerileri */
export const locationTypeIcons: Record<TransferLocationType, string[]> = {
  airport: ["✈️", "🛫", "🛬"],
  hotel: ["🏨", "🏩", "🏢"],
  holy_site: ["🕌", "🕋", "⛪"],
  city: ["🏙️", "🌆", "🏘️"],
  landmark: ["🏛️", "🗼", "🏰"],
  train_station: ["🚂", "🚉", "🚆"],
};

/** Rota kategori etiketleri */
export const routeCategoryLabels: Record<TransferRouteCategory, string> = {
  transfer: "Transfer",
  tour: "Tur",
};

/** Lokasyon filtre seçenekleri */
export interface LocationFilters {
  type?: TransferLocationType;
  city?: string;
  isPopular?: boolean;
  search?: string;
}

/** Rota filtre seçenekleri */
export interface RouteFilters {
  category?: TransferRouteCategory;
  isPopular?: boolean;
  fromLocationId?: string;
  toLocationId?: string;
  search?: string;
}
