/**
 * Popüler Transfer Rotaları Type Definitions
 * Admin panelinden yönetilen popüler transfer rotaları
 */

export type PopularRouteCategory = 'airport' | 'intercity' | 'local';

export interface PopularRouteModel {
  id: string;
  name: string;
  nameEn?: string;
  nameTr?: string;
  icon: string;
  
  from: {
    locationId?: string;
    city: string;
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  to: {
    locationId?: string;
    city: string;
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  distance: {
    km: number;
    text: string;
  };
  
  duration: {
    minutes: number;
    text: string;
  };
  
  // Fiyat bilgileri (opsiyonel - transfer pricing'den de alınabilir)
  basePrice?: number;
  prices?: {
    sedan?: number;
    van?: number;
    coster?: number;
    bus?: number;
    vip?: number;
    jeep?: number;
  };
  
  category?: PopularRouteCategory;
  isPopular: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Form için input type (id ve timestamps olmadan)
export type PopularRouteInput = Omit<PopularRouteModel, 'id' | 'createdAt' | 'updatedAt'>;

// Kategori labels
export const popularRouteCategoryLabels: Record<PopularRouteCategory, string> = {
  airport: 'Havalimanı',
  intercity: 'Şehirler Arası',
  local: 'Şehir İçi',
};

// Kategori colors
export const popularRouteCategoryColors: Record<PopularRouteCategory, { bg: string; text: string; border: string }> = {
  airport: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  intercity: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  local: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
};
