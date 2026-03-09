// Popüler Transfer Rotaları - Mekke & Medine odaklı

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
  basePrice: number;
  pricePerKm?: number;
  category: 'airport' | 'intercity' | 'local';
  isPopular: boolean;
  icon: string;
  description: string;
}

export const POPULAR_ROUTES: PopularRoute[] = [
  {
    id: 'jed-to-mecca',
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
    basePrice: 150,
    pricePerKm: 2,
    category: 'airport',
    isPopular: true,
    icon: '✈️',
    description: 'Havalimanından otelinize konforlu transfer',
  },
  {
    id: 'mecca-to-medina',
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
    basePrice: 500,
    pricePerKm: 1.5,
    category: 'intercity',
    isPopular: true,
    icon: '🕌',
    description: 'İki kutsal şehir arası konforlu yolculuk',
  },
  {
    id: 'medina-to-jed',
    name: 'Medine → Cidde Havalimanı',
    from: {
      city: 'Medine',
      location: 'Otel / Mescid-i Nebevi',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    to: {
      city: 'Cidde',
      location: 'Kral Abdulaziz Uluslararası Havalimanı (JED)',
      coordinates: { lat: 21.6796, lng: 39.1565 },
    },
    distance: { km: 420, text: '420 km' },
    duration: { minutes: 280, text: '4 saat' },
    basePrice: 480,
    pricePerKm: 1.5,
    category: 'airport',
    isPopular: true,
    icon: '✈️',
    description: 'Medine\'den uçağınızı kaçırmayın',
  },
  {
    id: 'mecca-haram-to-hotel',
    name: 'Mekke Harem → Otel',
    from: {
      city: 'Mekke',
      location: 'Harem (Kabe-i Muazzama)',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    to: {
      city: 'Mekke',
      location: 'Otel (Adres belirtilecek)',
    },
    distance: { km: 0, text: 'Değişken' },
    duration: { minutes: 15, text: '5-30 dakika' },
    basePrice: 30,
    category: 'local',
    isPopular: true,
    icon: '🏨',
    description: 'Harem\'den otelinize kısa mesafe transfer',
  },
  {
    id: 'medine-prophet-to-hotel',
    name: 'Medine Mescid-i Nebevi → Otel',
    from: {
      city: 'Medine',
      location: 'Mescid-i Nebevi',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    to: {
      city: 'Medine',
      location: 'Otel (Adres belirtilecek)',
    },
    distance: { km: 0, text: 'Değişken' },
    duration: { minutes: 10, text: '5-20 dakika' },
    basePrice: 25,
    category: 'local',
    isPopular: true,
    icon: '🏨',
    description: 'Mescid-i Nebevi\'den otelinize konforlu transfer',
  },
  {
    id: 'jed-airport-city-tour',
    name: 'Cidde Havalimanı → Şehir Turu',
    from: {
      city: 'Cidde',
      location: 'Kral Abdulaziz Uluslararası Havalimanı (JED)',
    },
    to: {
      city: 'Cidde',
      location: 'Cidde Şehir Merkezi / Tarihi Yerler',
    },
    distance: { km: 25, text: '25 km' },
    duration: { minutes: 45, text: '30-60 dakika' },
    basePrice: 100,
    category: 'local',
    isPopular: false,
    icon: '🌊',
    description: 'Cidde\'de tarihi yerleri ziyaret edin',
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
