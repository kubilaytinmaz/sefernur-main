// Transfer Lokasyonları - Mekke & Medine odaklı statik lokasyon verisi

export type LocationType = 'airport' | 'train_station' | 'city' | 'religious_site' | 'tour_destination';

export interface TransferLocation {
  id: string;
  name: string;
  city: string;
  type: LocationType;
  coordinates?: { lat: number; lng: number };
}

export type RouteCategory = 'transfer' | 'tour';
export type RouteSubCategory = 'mecca_departure' | 'mecca_arrival' | 'medina_departure' | 'medina_arrival';

export interface TransferRoute {
  id: string;
  from: TransferLocation;
  to: TransferLocation;
  via?: TransferLocation[];
  category: RouteCategory;
  subCategory: RouteSubCategory;
  tag?: string;
  distance?: { km: number; text: string };
  duration?: { minutes: number; text: string };
  icon: string;
}

// ─────────────────────────────────────────────────────────────
// LOKASYONLAR
// ─────────────────────────────────────────────────────────────

export const LOCATIONS: Record<string, TransferLocation> = {
  // Havalimanları
  jeddah_airport: {
    id: 'jeddah_airport',
    name: 'Cidde Havalimanı (JED)',
    city: 'Cidde',
    type: 'airport',
    coordinates: { lat: 21.6796, lng: 39.1565 },
  },
  medina_airport: {
    id: 'medina_airport',
    name: 'Medine Havalimanı',
    city: 'Medine',
    type: 'airport',
    coordinates: { lat: 24.5534, lng: 39.7051 },
  },
  taif_airport: {
    id: 'taif_airport',
    name: 'Taif Bölgesel Havaalanı',
    city: 'Taif',
    type: 'airport',
    coordinates: { lat: 21.4833, lng: 40.4167 },
  },

  // Tren İstasyonları
  mecca_train_station: {
    id: 'mecca_train_station',
    name: 'Mekke Tren İstasyonu',
    city: 'Mekke',
    type: 'train_station',
    coordinates: { lat: 21.4225, lng: 39.8262 },
  },
  medina_train_station: {
    id: 'medina_train_station',
    name: 'Medine Tren İstasyonu',
    city: 'Medine',
    type: 'train_station',
    coordinates: { lat: 24.4672, lng: 39.6157 },
  },

  // Şehirler
  mecca: {
    id: 'mecca',
    name: 'Mekke',
    city: 'Mekke',
    type: 'city',
    coordinates: { lat: 21.4225, lng: 39.8262 },
  },
  medina: {
    id: 'medina',
    name: 'Medine',
    city: 'Medine',
    type: 'city',
    coordinates: { lat: 24.4672, lng: 39.6157 },
  },
  jeddah: {
    id: 'jeddah',
    name: 'Cidde',
    city: 'Cidde',
    type: 'city',
    coordinates: { lat: 21.5433, lng: 39.1728 },
  },
  taif: {
    id: 'taif',
    name: 'Taif',
    city: 'Taif',
    type: 'city',
    coordinates: { lat: 21.2638, lng: 40.4168 },
  },

  // Dini Mekanlar
  haram: {
    id: 'haram',
    name: 'Harem (Kabe-i Muazzama)',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.4225, lng: 39.8262 },
  },
  prophet_mosque: {
    id: 'prophet_mosque',
    name: 'Mescid-i Nebevi',
    city: 'Medine',
    type: 'religious_site',
    coordinates: { lat: 24.4672, lng: 39.6157 },
  },
  hudeybiye: {
    id: 'hudeybiye',
    name: 'Hudeybiye',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 22.9333, lng: 39.1833 },
  },
  cirane: {
    id: 'cirane',
    name: 'Cirane',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.3583, lng: 39.8833 },
  },
  aisha_tanim: {
    id: 'aisha_tanim',
    name: 'Aişe Tenim (Mikat)',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.3667, lng: 39.8833 },
  },
  jabal_nur: {
    id: 'jabal_nur',
    name: 'Cebeli Nur (Hira Mağarası)',
    city: 'Mekke',
    type: 'religious_site',
    coordinates: { lat: 21.4333, lng: 39.9167 },
  },
  badr: {
    id: 'badr',
    name: 'Bedir',
    city: 'Medine',
    type: 'religious_site',
    coordinates: { lat: 23.7833, lng: 38.7833 },
  },
};

// ─────────────────────────────────────────────────────────────
// TRANSFER ROTALARI
// ─────────────────────────────────────────────────────────────

// 1️⃣ TRANSFERLER - Mekke Çıkışlı
const MECCA_DEPARTURE_TRANSFERS: TransferRoute[] = [
  {
    id: 'mecca-jeddah-airport',
    from: LOCATIONS.mecca,
    to: LOCATIONS.jeddah_airport,
    category: 'transfer',
    subCategory: 'mecca_departure',
    distance: { km: 75, text: '75 km' },
    duration: { minutes: 75, text: '60-90 dk' },
    icon: '✈️',
  },
  {
    id: 'mecca-medina',
    from: LOCATIONS.mecca,
    to: LOCATIONS.medina,
    category: 'transfer',
    subCategory: 'mecca_departure',
    distance: { km: 450, text: '450 km' },
    duration: { minutes: 300, text: '4-5 saat' },
    icon: '🕌',
  },
  {
    id: 'mecca-taif-airport',
    from: LOCATIONS.mecca,
    to: LOCATIONS.taif_airport,
    category: 'transfer',
    subCategory: 'mecca_departure',
    distance: { km: 90, text: '90 km' },
    duration: { minutes: 90, text: '1-1.5 saat' },
    icon: '✈️',
  },
  {
    id: 'mecca-mecca-train',
    from: LOCATIONS.mecca,
    to: LOCATIONS.mecca_train_station,
    category: 'transfer',
    subCategory: 'mecca_departure',
    distance: { km: 5, text: '5 km' },
    duration: { minutes: 15, text: '10-20 dk' },
    icon: '🚉',
  },
];

// 1️⃣ TRANSFERLER - Mekke Varışlı
const MECCA_ARRIVAL_TRANSFERS: TransferRoute[] = [
  {
    id: 'jeddah-airport-mecca',
    from: LOCATIONS.jeddah_airport,
    to: LOCATIONS.mecca,
    category: 'transfer',
    subCategory: 'mecca_arrival',
    distance: { km: 75, text: '75 km' },
    duration: { minutes: 75, text: '60-90 dk' },
    icon: '✈️',
  },
  {
    id: 'medina-mecca',
    from: LOCATIONS.medina,
    to: LOCATIONS.mecca,
    category: 'transfer',
    subCategory: 'mecca_arrival',
    distance: { km: 450, text: '450 km' },
    duration: { minutes: 300, text: '4-5 saat' },
    icon: '🕌',
  },
  {
    id: 'taif-airport-mecca',
    from: LOCATIONS.taif_airport,
    to: LOCATIONS.mecca,
    category: 'transfer',
    subCategory: 'mecca_arrival',
    distance: { km: 90, text: '90 km' },
    duration: { minutes: 90, text: '1-1.5 saat' },
    icon: '✈️',
  },
  {
    id: 'mecca-train-mecca',
    from: LOCATIONS.mecca_train_station,
    to: LOCATIONS.mecca,
    category: 'transfer',
    subCategory: 'mecca_arrival',
    distance: { km: 5, text: '5 km' },
    duration: { minutes: 15, text: '10-20 dk' },
    icon: '🚉',
  },
];

// 1️⃣ TRANSFERLER - Medine Çıkışlı
const MEDINA_DEPARTURE_TRANSFERS: TransferRoute[] = [
  {
    id: 'medina-mecca-dep',
    from: LOCATIONS.medina,
    to: LOCATIONS.mecca,
    category: 'transfer',
    subCategory: 'medina_departure',
    distance: { km: 450, text: '450 km' },
    duration: { minutes: 300, text: '4-5 saat' },
    icon: '🕌',
  },
  {
    id: 'medina-medina-airport',
    from: LOCATIONS.medina,
    to: LOCATIONS.medina_airport,
    category: 'transfer',
    subCategory: 'medina_departure',
    distance: { km: 15, text: '15 km' },
    duration: { minutes: 20, text: '15-25 dk' },
    icon: '✈️',
  },
  {
    id: 'medina-medina-train',
    from: LOCATIONS.medina,
    to: LOCATIONS.medina_train_station,
    category: 'transfer',
    subCategory: 'medina_departure',
    distance: { km: 5, text: '5 km' },
    duration: { minutes: 10, text: '5-15 dk' },
    icon: '🚉',
  },
  {
    id: 'medina-jeddah-airport',
    from: LOCATIONS.medina,
    to: LOCATIONS.jeddah_airport,
    category: 'transfer',
    subCategory: 'medina_departure',
    distance: { km: 420, text: '420 km' },
    duration: { minutes: 280, text: '4 saat' },
    icon: '✈️',
  },
];

// 1️⃣ TRANSFERLER - Medine Varışlı
const MEDINA_ARRIVAL_TRANSFERS: TransferRoute[] = [
  {
    id: 'medina-airport-medina',
    from: LOCATIONS.medina_airport,
    to: LOCATIONS.medina,
    category: 'transfer',
    subCategory: 'medina_arrival',
    distance: { km: 15, text: '15 km' },
    duration: { minutes: 20, text: '15-25 dk' },
    icon: '✈️',
  },
  {
    id: 'medina-train-medina',
    from: LOCATIONS.medina_train_station,
    to: LOCATIONS.medina,
    category: 'transfer',
    subCategory: 'medina_arrival',
    distance: { km: 5, text: '5 km' },
    duration: { minutes: 10, text: '5-15 dk' },
    icon: '🚉',
  },
  {
    id: 'jeddah-airport-medina',
    from: LOCATIONS.jeddah_airport,
    to: LOCATIONS.medina,
    category: 'transfer',
    subCategory: 'medina_arrival',
    distance: { km: 420, text: '420 km' },
    duration: { minutes: 280, text: '4 saat' },
    icon: '✈️',
  },
];

// ─────────────────────────────────────────────────────────────
// TUR & ZİYARET ROTALARI
// ─────────────────────────────────────────────────────────────

// 2️⃣ TUR & ZİYARETLER - Mekke Çıkışlı
const MECCA_DEPARTURE_TOURS: TransferRoute[] = [
  {
    id: 'mecca-badr-medina-tour',
    from: LOCATIONS.mecca,
    to: LOCATIONS.medina,
    via: [LOCATIONS.badr],
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Tur',
    distance: { km: 480, text: '480 km' },
    duration: { minutes: 360, text: '6 saat' },
    icon: '🕌',
  },
  {
    id: 'mecca-mecca-tour',
    from: LOCATIONS.mecca,
    to: LOCATIONS.mecca,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Çevre Ziyareti Turu',
    distance: { km: 30, text: '30 km' },
    duration: { minutes: 180, text: '3 saat' },
    icon: '🕌',
  },
  {
    id: 'mecca-taif-tour',
    from: LOCATIONS.mecca,
    to: LOCATIONS.taif,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Tur',
    distance: { km: 90, text: '90 km' },
    duration: { minutes: 240, text: '4 saat' },
    icon: '🏔️',
  },
  {
    id: 'mecca-jeddah-tour',
    from: LOCATIONS.mecca,
    to: LOCATIONS.jeddah,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Tur',
    distance: { km: 80, text: '80 km' },
    duration: { minutes: 240, text: '4 saat' },
    icon: '🌊',
  },
  {
    id: 'mecca-hudeybiye-umrah',
    from: LOCATIONS.mecca,
    to: LOCATIONS.hudeybiye,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Umre Ziyareti',
    distance: { km: 25, text: '25 km' },
    duration: { minutes: 60, text: '1 saat' },
    icon: '🕋',
  },
  {
    id: 'mecca-cirane-umrah',
    from: LOCATIONS.mecca,
    to: LOCATIONS.cirane,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Umre Ziyareti',
    distance: { km: 15, text: '15 km' },
    duration: { minutes: 45, text: '45 dk' },
    icon: '🕋',
  },
  {
    id: 'mecca-aisha-tanim-umrah',
    from: LOCATIONS.mecca,
    to: LOCATIONS.aisha_tanim,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Umre Ziyareti',
    distance: { km: 12, text: '12 km' },
    duration: { minutes: 30, text: '30 dk' },
    icon: '🕋',
  },
  {
    id: 'mecca-jabal-nur-visit',
    from: LOCATIONS.mecca,
    to: LOCATIONS.jabal_nur,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'Ziyaret',
    distance: { km: 8, text: '8 km' },
    duration: { minutes: 60, text: '1 saat' },
    icon: '⛰️',
  },
  {
    id: 'mecca-medina-full-package',
    from: LOCATIONS.mecca,
    to: LOCATIONS.medina,
    category: 'tour',
    subCategory: 'mecca_departure',
    tag: 'MEKKE & MEDİNE Tam Paket',
    distance: { km: 450, text: '450 km' },
    duration: { minutes: 300, text: '4-5 saat' },
    icon: '🕌',
  },
];

// 2️⃣ TUR & ZİYARETLER - Medine Çıkışlı
const MEDINA_DEPARTURE_TOURS: TransferRoute[] = [
  {
    id: 'medina-medina-tour',
    from: LOCATIONS.medina,
    to: LOCATIONS.medina,
    category: 'tour',
    subCategory: 'medina_departure',
    tag: 'Çevre Ziyareti Turu',
    distance: { km: 25, text: '25 km' },
    duration: { minutes: 180, text: '3 saat' },
    icon: '🕌',
  },
];

// ─────────────────────────────────────────────────────────────
// TÜM ROTALAR
// ─────────────────────────────────────────────────────────────

export const ALL_ROUTES: TransferRoute[] = [
  ...MECCA_DEPARTURE_TRANSFERS,
  ...MECCA_ARRIVAL_TRANSFERS,
  ...MEDINA_DEPARTURE_TRANSFERS,
  ...MEDINA_ARRIVAL_TRANSFERS,
  ...MECCA_DEPARTURE_TOURS,
  ...MEDINA_DEPARTURE_TOURS,
];

// ─────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────

/**
 * Başlangıç lokasyonuna göre varış lokasyonlarını döndürür
 */
export function getDestinationsByFromLocation(fromLocationId: string): TransferLocation[] {
  const destinations = new Set<string>();
  
  ALL_ROUTES.forEach(route => {
    if (route.from.id === fromLocationId) {
      destinations.add(route.to.id);
    }
  });
  
  return Array.from(destinations).map(id => LOCATIONS[id]).filter(Boolean);
}

/**
 * Başlangıç ve varış lokasyonuna göre rotaları döndürür
 */
export function getRoutesByLocations(fromLocationId: string, toLocationId: string): TransferRoute[] {
  return ALL_ROUTES.filter(
    route => route.from.id === fromLocationId && route.to.id === toLocationId
  );
}

/**
 * Kategoriye göre rotaları döndürür
 */
export function getRoutesByCategory(category: RouteCategory): TransferRoute[] {
  return ALL_ROUTES.filter(route => route.category === category);
}

/**
 * Alt kategoriye göre rotaları döndürür
 */
export function getRoutesBySubCategory(subCategory: RouteSubCategory): TransferRoute[] {
  return ALL_ROUTES.filter(route => route.subCategory === subCategory);
}

/**
 * Lokasyon tipine göre lokasyonları döndürür
 */
export function getLocationsByType(type: LocationType): TransferLocation[] {
  return Object.values(LOCATIONS).filter(loc => loc.type === type);
}

/**
 * Şehire göre lokasyonları döndürür
 */
export function getLocationsByCity(city: string): TransferLocation[] {
  return Object.values(LOCATIONS).filter(loc => loc.city === city);
}

/**
 * Lokasyon tipi için ikon döndürür
 */
export function getLocationIcon(type: LocationType): string {
  const icons: Record<LocationType, string> = {
    airport: '✈️',
    train_station: '🚉',
    city: '🏙️',
    religious_site: '🕌',
    tour_destination: '🗺️',
  };
  return icons[type] || '📍';
}

/**
 * Lokasyon tipi için etiket döndürür
 */
export function getLocationTypeLabel(type: LocationType): string {
  const labels: Record<LocationType, string> = {
    airport: 'Havalimanları',
    train_station: 'Tren İstasyonları',
    city: 'Şehirler',
    religious_site: 'Dini Mekanlar',
    tour_destination: 'Tur Destinasyonları',
  };
  return labels[type];
}
