// Popüler Transfer Rotaları - Mekke & Medine odaklı
// Gerçek SAR fiyatları TL'ye çevrilmiş (1 SAR = 9.5 TL)

export interface PopularRoute {
  id: string;
  name: string;
  from: {
    city: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
  to: {
    city: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
  distance: {
    km: number;
    text: string;
  };
  duration: {
    minutes: number;
    text: string;
  };
  basePrice: number; // Sedan fiyatı
  pricePerKm?: number;
  prices?: {
    sedan: number;
    van: number;
    coster: number; // Toyota Hiace
  };
  category: 'airport' | 'intercity' | 'local';
  isPopular: boolean;
  icon: string;
  description: string;
}

export const POPULAR_ROUTES: PopularRoute[] = [
  // ═══════════════════════════════════════════════════════
  // POPÜLER ROTALAR
  // ═══════════════════════════════════════════════════════
  {
    id: 'jeddah-airport-mecca',
    name: 'Cidde Havalimanı → Mekke',
    from: {
      city: 'Cidde',
      location: 'Kral Abdulaziz Uluslararası Havalimanı (JED)',
      coordinates: { lat: 21.6796, lng: 39.1565 },
    },
    to: {
      city: 'Mekke',
      location: 'Harem / Oteller',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    distance: { km: 75, text: '75 km' },
    duration: { minutes: 75, text: '60-90 dakika' },
    basePrice: 1425, // 150 SAR
    prices: {
      sedan: 1425,
      van: 1900,
      coster: 2375,
    },
    category: 'airport',
    isPopular: true,
    icon: '✈️',
    description: 'Havalimanından Mekke otelinize konforlu transfer',
  },
  {
    id: 'medina-airport-medina',
    name: 'Medine Havalimanı → Medine Şehir',
    from: {
      city: 'Medine',
      location: 'Prens Muhammed bin Abdulaziz Havalimanı (MED)',
      coordinates: { lat: 24.5534, lng: 39.7051 },
    },
    to: {
      city: 'Medine',
      location: 'Mescid-i Nebevi / Oteller',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    distance: { km: 15, text: '15 km' },
    duration: { minutes: 20, text: '15-25 dakika' },
    basePrice: 300,
    prices: {
      sedan: 300,
      van: 400,
      coster: 500,
    },
    category: 'airport',
    isPopular: true,
    icon: '✈️',
    description: 'Medine havalimanından şehir merkezine',
  },
  {
    id: 'mecca-medina',
    name: 'Mekke → Medine',
    from: {
      city: 'Mekke',
      location: 'Otel / Harem',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    to: {
      city: 'Medine',
      location: 'Mescid-i Nebevi / Oteller',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    distance: { km: 450, text: '450 km' },
    duration: { minutes: 300, text: '4-5 saat' },
    basePrice: 2375, // 250 SAR
    prices: {
      sedan: 2375,
      van: 2850,
      coster: 3325,
    },
    category: 'intercity',
    isPopular: true,
    icon: '🕌',
    description: 'İki kutsal şehir arası konforlu yolculuk',
  },
  {
    id: 'medina-mecca',
    name: 'Medine → Mekke',
    from: {
      city: 'Medine',
      location: 'Otel / Mescid-i Nebevi',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    to: {
      city: 'Mekke',
      location: 'Harem / Oteller',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    distance: { km: 450, text: '450 km' },
    duration: { minutes: 300, text: '4-5 saat' },
    basePrice: 2375, // 250 SAR
    prices: {
      sedan: 2375,
      van: 2850,
      coster: 3325,
    },
    category: 'intercity',
    isPopular: true,
    icon: '🕌',
    description: 'Medine\'den Mekke\'ye güvenli yolculuk',
  },
];

// Rota ID'sine göre popüler rota getir
export function getPopularRouteById(id: string): PopularRoute | undefined {
  return POPULAR_ROUTES.find(route => route.id === id);
}

// Kategoriye göre rotaları getir
export function getPopularRoutesByCategory(category: PopularRoute['category']): PopularRoute[] {
  return POPULAR_ROUTES.filter(route => route.category === category);
}

// Şehirler arası rotaları getir
export function getRoutesBetweenCities(fromCity: string, toCity: string): PopularRoute[] {
  return POPULAR_ROUTES.filter(
    route => route.from.city.toLowerCase() === fromCity.toLowerCase() && 
             route.to.city.toLowerCase() === toCity.toLowerCase()
  );
}

// Sadece popüler rotaları getir
export function getPopularRoutes(): PopularRoute[] {
  return POPULAR_ROUTES.filter(route => route.isPopular);
}

// Araç tipine göre rota fiyatını getir
export function getRoutePriceForVehicle(routeId: string, vehicleType: 'sedan' | 'van' | 'coster'): number | undefined {
  const route = getPopularRouteById(routeId);
  if (!route || !route.prices) return route?.basePrice;
  return route.prices[vehicleType];
}
