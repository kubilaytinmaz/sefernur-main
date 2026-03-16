/**
 * Transfer Lokasyonu Tipi
 * Admin panelinden yönetilebilir lokasyonlar için
 */

export type LocationType = 'airport' | 'train_station' | 'city' | 'religious_site' | 'tour_destination';

export interface TransferLocationModel {
  id: string;
  name: string;
  nameEn?: string;
  city: string;
  type: LocationType;
  coordinates?: {
    lat: number;
    lng: number;
  };
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt: Date;
}

export type TransferLocationInput = Omit<TransferLocationModel, 'id' | 'createdAt' | 'updatedAt'>;

// Lokasyon tipi etiketleri (Türkçe)
export const locationTypeLabels: Record<LocationType, string> = {
  airport: 'Havalimanı',
  train_station: 'Tren İstasyonu',
  city: 'Şehir',
  religious_site: 'Dini Mekan',
  tour_destination: 'Tur Destinasyonu',
};

// Lokasyon tipi etiketleri (İngilizce)
export const locationTypeLabelsEn: Record<LocationType, string> = {
  airport: 'Airport',
  train_station: 'Train Station',
  city: 'City',
  religious_site: 'Religious Site',
  tour_destination: 'Tour Destination',
};

// Lokasyon tipi ikonları
export const locationTypeIcons: Record<LocationType, string> = {
  airport: '✈️',
  train_station: '🚉',
  city: '🏙️',
  religious_site: '🕌',
  tour_destination: '🗺️',
};

// Lokasyon tipi renkleri (UI için)
export const locationTypeColors: Record<LocationType, { bg: string; text: string; border: string }> = {
  airport: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  train_station: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  city: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  religious_site: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  tour_destination: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

/**
 * Lokasyon tipi için etiket döndürür
 */
export function getLocationTypeLabel(type: LocationType, locale: 'tr' | 'en' = 'tr'): string {
  return locale === 'tr' ? locationTypeLabels[type] : locationTypeLabelsEn[type];
}

/**
 * Lokasyon tipi için ikon döndürür
 */
export function getLocationTypeIcon(type: LocationType): string {
  return locationTypeIcons[type];
}

/**
 * Lokasyon tipi için renkler döndürür
 */
export function getLocationTypeColors(type: LocationType) {
  return locationTypeColors[type];
}
