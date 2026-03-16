/**
 * Transfer Lokasyonları Veri Katmanı
 * Admin panelinden yönetilebilir lokasyonlar için
 * 
 * NOT: Şimdilik bellekte tutuluyor (Firebase entegrasyonu sonrası Firestore'a taşınacak)
 */

import type { LocationType, TransferLocationInput, TransferLocationModel } from '@/types/transfer-location';

// ─────────────────────────────────────────────────────────────
// BAŞLANGIÇ VERİLERİ (transfer-locations.ts'ten migrate edildi)
// ─────────────────────────────────────────────────────────────

export const INITIAL_TRANSFER_LOCATIONS: TransferLocationModel[] = [
  // Havalimanları
  {
    id: 'jeddah_airport',
    name: 'Cidde Havalimanı (JED)',
    nameEn: 'Jeddah Airport (JED)',
    city: 'Cidde',
    type: 'airport',
    coordinates: { lat: 21.6796, lng: 39.1565 },
    icon: '✈️',
    isActive: true,
    order: 0,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'medina_airport',
    name: 'Medine Havalimanı (MED)',
    nameEn: 'Medina Airport (MED)',
    city: 'Medine',
    type: 'airport',
    coordinates: { lat: 24.5534, lng: 39.7051 },
    icon: '✈️',
    isActive: true,
    order: 1,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'taif_airport',
    name: 'Taif Bölgesel Havaalanı',
    nameEn: 'Taif Regional Airport',
    city: 'Taif',
    type: 'airport',
    coordinates: { lat: 21.4833, lng: 40.4167 },
    icon: '✈️',
    isActive: true,
    order: 2,
    updatedAt: new Date('2024-01-01'),
  },

  // Tren İstasyonları
  {
    id: 'mecca_train_station',
    name: 'Mekke Tren İstasyonu',
    nameEn: 'Mecca Train Station',
    city: 'Mekke',
    type: 'train_station',
    coordinates: { lat: 21.4225, lng: 39.8262 },
    icon: '🚉',
    isActive: true,
    order: 3,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'medina_train_station',
    name: 'Medine Tren İstasyonu',
    nameEn: 'Medina Train Station',
    city: 'Medine',
    type: 'train_station',
    coordinates: { lat: 24.4672, lng: 39.6157 },
    icon: '🚉',
    isActive: true,
    order: 4,
    updatedAt: new Date('2024-01-01'),
  },

  // Şehirler
  {
    id: 'mecca',
    name: 'Mekke',
    nameEn: 'Mecca',
    city: 'Mekke',
    type: 'city',
    coordinates: { lat: 21.4225, lng: 39.8262 },
    icon: '🏙️',
    isActive: true,
    order: 5,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'medina',
    name: 'Medine',
    nameEn: 'Medina',
    city: 'Medine',
    type: 'city',
    coordinates: { lat: 24.4672, lng: 39.6157 },
    icon: '🏙️',
    isActive: true,
    order: 6,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'jeddah',
    name: 'Cidde',
    nameEn: 'Jeddah',
    city: 'Cidde',
    type: 'city',
    coordinates: { lat: 21.5433, lng: 39.1728 },
    icon: '🏙️',
    isActive: true,
    order: 7,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'taif',
    name: 'Taif',
    nameEn: 'Taif',
    city: 'Taif',
    type: 'city',
    coordinates: { lat: 21.2638, lng: 40.4168 },
    icon: '🏙️',
    isActive: true,
    order: 8,
    updatedAt: new Date('2024-01-01'),
  },

  // Dini Mekanlar
  {
    id: 'haram',
    name: 'Harem (Kabe-i Muazzama)',
    nameEn: 'Haram (Grand Mosque)',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.4225, lng: 39.8262 },
    icon: '🕌',
    isActive: true,
    order: 9,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prophet_mosque',
    name: 'Mescid-i Nebevi',
    nameEn: "Prophet's Mosque",
    city: 'Medine',
    type: 'religious_site',
    coordinates: { lat: 24.4672, lng: 39.6157 },
    icon: '🕌',
    isActive: true,
    order: 10,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'hudeybiye',
    name: 'Hudeybiye',
    nameEn: 'Hudaibiyah',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 22.9333, lng: 39.1833 },
    icon: '🕌',
    isActive: true,
    order: 11,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cirane',
    name: 'Cirane',
    nameEn: 'Jirana',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.3583, lng: 39.8833 },
    icon: '🕌',
    isActive: true,
    order: 12,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'aisha_tanim',
    name: 'Aişe Tenim (Mikat)',
    nameEn: 'Aisha Tanim (Miqaat)',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.3667, lng: 39.8833 },
    icon: '🕌',
    isActive: true,
    order: 13,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'jabal_nur',
    name: 'Cebeli Nur (Hira Mağarası)',
    nameEn: 'Jabal Nur (Hira Cave)',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.4333, lng: 39.9167 },
    icon: '⛰️',
    isActive: true,
    order: 14,
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'badr',
    name: 'Bedir',
    nameEn: 'Badr',
    city: 'Medine',
    type: 'religious_site',
    coordinates: { lat: 23.7833, lng: 38.7833 },
    icon: '🕌',
    isActive: true,
    order: 15,
    updatedAt: new Date('2024-01-01'),
  },
];

// ─────────────────────────────────────────────────────────────
// BELLEK DEPOSU (Firebase entegrasyonuna kadar)
// ─────────────────────────────────────────────────────────────

let TRANSFER_LOCATIONS: TransferLocationModel[] = [...INITIAL_TRANSFER_LOCATIONS];

// ─────────────────────────────────────────────────────────────
// PUBLIC CRUD FONKSİYONLARI
// ─────────────────────────────────────────────────────────────

/**
 * Tüm lokasyonları getir
 */
export async function getAllTransferLocations(): Promise<TransferLocationModel[]> {
  // Simüle edilmiş async işlem
  return [...TRANSFER_LOCATIONS].sort((a, b) => a.order - b.order);
}

/**
 * Sadece aktif lokasyonları getir
 */
export async function getActiveTransferLocations(): Promise<TransferLocationModel[]> {
  const all = await getAllTransferLocations();
  return all.filter(loc => loc.isActive);
}

/**
 * ID'ye göre lokasyon getir
 */
export async function getTransferLocationById(id: string): Promise<TransferLocationModel | null> {
  const all = await getAllTransferLocations();
  return all.find(loc => loc.id === id) || null;
}

/**
 * Tipe göre lokasyonları getir
 */
export async function getLocationsByType(type: LocationType): Promise<TransferLocationModel[]> {
  const all = await getAllTransferLocations();
  return all.filter(loc => loc.type === type);
}

/**
 * Şehire göre lokasyonları getir
 */
export async function getLocationsByCity(city: string): Promise<TransferLocationModel[]> {
  const all = await getAllTransferLocations();
  return all.filter(loc => loc.city === city);
}

/**
 * Yeni lokasyon ekle
 */
export async function createTransferLocation(data: TransferLocationInput): Promise<string> {
  const id = `loc-${Date.now()}`;
  const now = new Date();
  
  const newLocation: TransferLocationModel = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  TRANSFER_LOCATIONS.push(newLocation);
  return id;
}

/**
 * Lokasyon güncelle
 */
export async function updateTransferLocation(
  id: string,
  data: Partial<TransferLocationInput>
): Promise<void> {
  const index = TRANSFER_LOCATIONS.findIndex(loc => loc.id === id);
  if (index === -1) {
    throw new Error(`Lokasyon bulunamadı: ${id}`);
  }
  
  TRANSFER_LOCATIONS[index] = {
    ...TRANSFER_LOCATIONS[index],
    ...data,
    id, // ID değişmemeli
    updatedAt: new Date(),
  };
}

/**
 * Lokasyon sil
 */
export async function deleteTransferLocation(id: string): Promise<void> {
  const index = TRANSFER_LOCATIONS.findIndex(loc => loc.id === id);
  if (index === -1) {
    throw new Error(`Lokasyon bulunamadı: ${id}`);
  }
  
  TRANSFER_LOCATIONS.splice(index, 1);
}

/**
 * Lokasyonları yeniden sırala
 */
export async function reorderTransferLocations(orders: Record<string, number>): Promise<void> {
  for (const [id, order] of Object.entries(orders)) {
    const loc = TRANSFER_LOCATIONS.find(l => l.id === id);
    if (loc) {
      loc.order = order;
      loc.updatedAt = new Date();
    }
  }
}

/**
 * Lokasyon istatistikleri
 */
export async function getTransferLocationStats(): Promise<{
  total: number;
  active: number;
  byType: Record<LocationType, number>;
  byCity: Record<string, number>;
}> {
  const all = await getAllTransferLocations();
  
  const byType: Record<LocationType, number> = {
    airport: 0,
    train_station: 0,
    city: 0,
    religious_site: 0,
    tour_destination: 0,
  };
  
  const byCity: Record<string, number> = {};
  
  for (const loc of all) {
    byType[loc.type]++;
    byCity[loc.city] = (byCity[loc.city] || 0) + 1;
  }
  
  return {
    total: all.length,
    active: all.filter(loc => loc.isActive).length,
    byType,
    byCity,
  };
}
