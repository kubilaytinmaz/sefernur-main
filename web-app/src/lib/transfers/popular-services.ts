// Popüler Transferler ve Rehberler Sistemi
// Unified veri yapısı - Transfer, Rehber ve Tur kategorileri

import type { VehicleType } from "@/types/transfer";

export type ServiceType = 'transfer' | 'guide' | 'tour';
export type ServiceCategory =
  | 'airport_transfer'      // Havalimanı transferleri
  | 'city_transfer'         // Şehir içi transferler
  | 'intercity_transfer'    // Şehirler arası transferler
  | 'mecca_tour'            // Mekke gezileri
  | 'medina_tour'           // Medine gezileri
  | 'taif_tour'             // Taif gezisi
  | 'jeddah_tour';          // Cidde gezisi

export interface PopularService {
  id: string;
  type: ServiceType;
  category: ServiceCategory;
  name: string;
  description: string;
  icon: string;

  // Lokasyon bilgileri
  from: {
    city: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
  to?: {
    city: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };

  // Mesafe ve süre
  distance?: {
    km: number;
    text: string;
  };
  duration: {
    hours: number;
    text: string;
  };

  // Fiyatlandırma
  pricing: {
    basePrice: number; // Transfer için: mesafe bazlı, Tur için: kişi başı
    vehicleMultipliers?: Record<VehicleType, number>; // Transfer için araç çarpanları
    includes: string[]; // Fiyata dahil olanlar
    excludes: string[]; // Fiyata dahil olmayanlar
  };

  // Ek bilgiler
  highlights: string[]; // Öne çıkan özellikler
  isPopular: boolean;
  minPassengers: number;
  maxPassengers: number;
  languages: string[]; // Rehber dilleri (guide/tour için)

  // İlgili rotalar ve turlar
  relatedRouteId?: string; // transfer-locations.ts'deki rota ID'si
  relatedTourIds?: string[]; // İlgili tur ID'leri
}

export const POPULAR_SERVICES: PopularService[] = [
  // ──────────────────────────────────────────────────────
  // HAVAALANI TRANSFERLERİ
  // ──────────────────────────────────────────────────────
  {
    id: 'jeddah-airport-mecca',
    type: 'transfer',
    category: 'airport_transfer',
    name: 'Cidde Havalimanı → Mekke',
    description: 'Havalimanından otelinize konforlu transfer',
    icon: '✈️',
    from: {
      city: 'Cidde',
      location: 'Kral Abdulaziz Havalimanı (JED)',
      coordinates: { lat: 21.6796, lng: 39.1565 },
    },
    to: {
      city: 'Mekke',
      location: 'Harem / Oteller',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    distance: { km: 75, text: '75 km' },
    duration: { hours: 1.25, text: '60-90 dakika' },
    pricing: {
      basePrice: 150,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.6,
        vip: 2.0,
        bus: 2.7,
        jeep: 1.3,
        coster: 2.0,
      },
      includes: ['Karşılama', 'Bagaj taşıma', 'Su ikramı'],
      excludes: ['Bekleme ücreti', 'Fazla bagaj'],
    },
    highlights: [
      'Profesyonel şoför',
      '7/24 hizmet',
      'Klimalı araç',
      'Güvenli sürüş',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça', 'İngilizce'],
    relatedRouteId: 'jeddah-airport-mecca',
  },

  {
    id: 'medina-airport-medina',
    type: 'transfer',
    category: 'airport_transfer',
    name: 'Medine Havalimanı → Otel',
    description: 'Havalimanından otelinize güvenli transfer',
    icon: '✈️',
    from: {
      city: 'Medine',
      location: 'Medine Havalimanı',
      coordinates: { lat: 24.5534, lng: 39.7051 },
    },
    to: {
      city: 'Medine',
      location: 'Mescid-i Nebevi / Oteller',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    distance: { km: 15, text: '15 km' },
    duration: { hours: 0.33, text: '15-25 dakika' },
    pricing: {
      basePrice: 80,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.5,
        vip: 2.0,
        bus: 3.0,
        jeep: 1.3,
        coster: 2.0,
      },
      includes: ['Karşılama', 'Bagaj taşıma'],
      excludes: ['Bekleme ücreti'],
    },
    highlights: [
      'Hızlı transfer',
      'Konforlu araçlar',
      'Deneyimli sürücü',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'medina-airport-medina',
  },

  {
    id: 'mecca-jeddah-airport',
    type: 'transfer',
    category: 'airport_transfer',
    name: 'Mekke → Cidde Havalimanı',
    description: 'Otelden havalimanına zamanında transfer',
    icon: '✈️',
    from: {
      city: 'Mekke',
      location: 'Harem / Oteller',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    to: {
      city: 'Cidde',
      location: 'Kral Abdulaziz Havalimanı (JED)',
      coordinates: { lat: 21.6796, lng: 39.1565 },
    },
    distance: { km: 75, text: '75 km' },
    duration: { hours: 1.25, text: '60-90 dakika' },
    pricing: {
      basePrice: 150,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.6,
        vip: 2.0,
        bus: 2.7,
        jeep: 1.3,
        coster: 2.0,
      },
      includes: ['Bagaj taşıma', 'Su ikramı'],
      excludes: ['Bekleme ücreti', 'Fazla bagaj'],
    },
    highlights: [
      'Zamanında teslimat',
      'Uçuş takibi',
      'Konforlu araç',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-jeddah-airport',
  },

  // ──────────────────────────────────────────────────────
  // ŞEHİRLER ARASI TRANSFERLER
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-medina-transfer',
    type: 'transfer',
    category: 'intercity_transfer',
    name: 'Mekke → Medine',
    description: 'İki kutsal şehir arası konforlu yolculuk',
    icon: '🕌',
    from: {
      city: 'Mekke',
      location: 'Harem / Otel',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    to: {
      city: 'Medine',
      location: 'Mescid-i Nebevi / Oteller',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    distance: { km: 450, text: '450 km' },
    duration: { hours: 4.5, text: '4-5 saat' },
    pricing: {
      basePrice: 500,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.4,
        vip: 1.8,
        bus: 2.0,
        jeep: 1.2,
        coster: 1.6,
      },
      includes: ['Molalar', 'Su ikramı', 'Bagaj taşıma'],
      excludes: ['Yemek', 'Konaklama'],
    },
    highlights: [
      'Modern araçlar',
      'Mola noktaları',
      'Deneyimli şoför',
      'Güvenli yolculuk',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-medina',
  },

  {
    id: 'medina-mecca-transfer',
    type: 'transfer',
    category: 'intercity_transfer',
    name: 'Medine → Mekke',
    description: 'Medine\'den Mekke\'ye konforlu yolculuk',
    icon: '🕌',
    from: {
      city: 'Medine',
      location: 'Mescid-i Nebevi / Oteller',
      coordinates: { lat: 24.4672, lng: 39.6157 },
    },
    to: {
      city: 'Mekke',
      location: 'Harem / Oteller',
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    distance: { km: 450, text: '450 km' },
    duration: { hours: 4.5, text: '4-5 saat' },
    pricing: {
      basePrice: 500,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.4,
        vip: 1.8,
        bus: 2.0,
        jeep: 1.2,
        coster: 1.6,
      },
      includes: ['Molalar', 'Su ikramı', 'Bagaj taşıma'],
      excludes: ['Yemek', 'Konaklama'],
    },
    highlights: [
      'Modern araçlar',
      'Mola noktaları',
      'Deneyimli şoför',
      'Güvenli yolculuk',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'medina-mecca',
  },

  // ──────────────────────────────────────────────────────
  // ŞEHİR İÇİ TRANSFERLER
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-haram-hotel',
    type: 'transfer',
    category: 'city_transfer',
    name: 'Mekke Harem → Otel',
    description: 'Harem\'den otelinize kısa mesafe transfer',
    icon: '🏨',
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
    duration: { hours: 0.25, text: '5-30 dakika' },
    pricing: {
      basePrice: 30,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.5,
        vip: 2.0,
        bus: 2.5,
        jeep: 1.3,
        coster: 1.8,
      },
      includes: ['Bagaj taşıma'],
      excludes: ['Bekleme ücreti'],
    },
    highlights: [
      'Hızlı transfer',
      'Ekonomik',
      'Kolay rezervasyon',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-haram-to-hotel',
  },

  {
    id: 'medina-mosque-hotel',
    type: 'transfer',
    category: 'city_transfer',
    name: 'Medine Mescid-i Nebevi → Otel',
    description: 'Mescid-i Nebevi\'den otelinize konforlu transfer',
    icon: '🏨',
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
    duration: { hours: 0.17, text: '5-20 dakika' },
    pricing: {
      basePrice: 25,
      vehicleMultipliers: {
        sedan: 1.0,
        van: 1.5,
        vip: 2.0,
        bus: 2.5,
        jeep: 1.3,
        coster: 1.8,
      },
      includes: ['Bagaj taşıma'],
      excludes: ['Bekleme ücreti'],
    },
    highlights: [
      'Hızlı transfer',
      'Ekonomik',
      'Kolay rezervasyon',
    ],
    isPopular: true,
    minPassengers: 1,
    maxPassengers: 50,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'medine-prophet-to-hotel',
  },

  // ──────────────────────────────────────────────────────
  // MEKKE GEZİLERİ - REHBERLİ TURLAR
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-city-tour',
    type: 'guide',
    category: 'mecca_tour',
    name: 'Mekke Şehir Turu',
    description: 'Mekke\'nin kutsal yerlerini rehberli keşfedin',
    icon: '🕌',
    from: {
      city: 'Mekke',
      location: 'Otel / Harem',
    },
    duration: { hours: 4, text: '4 saat' },
    pricing: {
      basePrice: 200, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Yemek', 'Kişisel harcamalar'],
    },
    highlights: [
      'Cebeli Nur (Hira Mağarası)',
      'Cebeli Sevr',
      'Mina, Arafat, Müzdelife',
      'Cehennem Vadisi',
      'Şeytan Taşlama Yeri',
    ],
    isPopular: true,
    minPassengers: 4,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-mecca-tour',
  },

  {
    id: 'mecca-umrah-visit',
    type: 'guide',
    category: 'mecca_tour',
    name: 'Umre Ziyaret Noktaları',
    description: 'Hudeybiye, Cirane, Aişe Tenim ziyareti',
    icon: '🕋',
    from: {
      city: 'Mekke',
      location: 'Otel / Harem',
    },
    duration: { hours: 3, text: '3 saat' },
    pricing: {
      basePrice: 150, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Mikat noktaları',
      ],
      excludes: ['Yemek'],
    },
    highlights: [
      'Hudeybiye (Mikat)',
      'Cirane (Mikat)',
      'Aişe Tenim (Mikat)',
      'Umre için ihram noktaları',
    ],
    isPopular: true,
    minPassengers: 4,
    maxPassengers: 30,
    languages: ['Türkçe', 'Arapça'],
  },

  {
    id: 'mecca-ziyarat-tour',
    type: 'guide',
    category: 'mecca_tour',
    name: 'Mekke Ziyaret Yerleri',
    description: 'Mekke\'nin tarihi ve dini yerlerini gezin',
    icon: '🕌',
    from: {
      city: 'Mekke',
      location: 'Otel / Harem',
    },
    duration: { hours: 5, text: '5 saat' },
    pricing: {
      basePrice: 180, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
      ],
      excludes: ['Yemek', 'Giriş ücretleri'],
    },
    highlights: [
      'Cebeli Nur',
      'Aişe Tenim',
      'Cirane',
      'Hudeybiye',
      'Mina ve Arafat',
    ],
    isPopular: true,
    minPassengers: 4,
    maxPassengers: 35,
    languages: ['Türkçe', 'Arapça'],
  },

  // ──────────────────────────────────────────────────────
  // MEDİNE GEZİLERİ - REHBERLİ TURLAR
  // ──────────────────────────────────────────────────────
  {
    id: 'medina-city-tour',
    type: 'guide',
    category: 'medina_tour',
    name: 'Medine Şehir Turu',
    description: 'Medine\'nin kutsal yerlerini rehberli gezin',
    icon: '🕌',
    from: {
      city: 'Medine',
      location: 'Otel / Mescid-i Nebevi',
    },
    duration: { hours: 5, text: '5 saat' },
    pricing: {
      basePrice: 220, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Yemek', 'Kişisel harcamalar'],
    },
    highlights: [
      'Uhud Dağı ve Şehitleri',
      'Kıble Camii',
      'Kuba Camii',
      'Seb\'a Mescitleri',
      'Bedir Savaş Alanı',
      'Hendek Savaşı',
    ],
    isPopular: true,
    minPassengers: 4,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'medina-medina-tour',
  },

  {
    id: 'medina-badr-tour',
    type: 'guide',
    category: 'medina_tour',
    name: 'Bedir Savaş Alanı Turu',
    description: 'İslam tarihinin önemli yerini ziyaret edin',
    icon: '⚔️',
    from: {
      city: 'Medine',
      location: 'Otel / Mescid-i Nebevi',
    },
    duration: { hours: 4, text: '4 saat' },
    pricing: {
      basePrice: 160, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
      ],
      excludes: ['Yemek'],
    },
    highlights: [
      'Bedir Savaş Alanı',
      'Şehitler Tepesi',
      'Tarihi anlatımlar',
    ],
    isPopular: false,
    minPassengers: 4,
    maxPassengers: 30,
    languages: ['Türkçe', 'Arapça'],
  },

  // ──────────────────────────────────────────────────────
  // TAİF GEZİSİ
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-taif-tour',
    type: 'tour',
    category: 'taif_tour',
    name: 'Taif Günübirlik Turu',
    description: 'Taif\'in tarihi ve doğal güzelliklerini keşfedin',
    icon: '🏔️',
    from: {
      city: 'Mekke',
      location: 'Otel',
    },
    to: {
      city: 'Taif',
      location: 'Tarihi Bölge',
    },
    distance: { km: 90, text: '90 km' },
    duration: { hours: 8, text: 'Tam gün (8 saat)' },
    pricing: {
      basePrice: 280, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Öğle yemeği',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Kişisel harcamalar'],
    },
    highlights: [
      'Taif Gül Bahçeleri',
      'Şifa Bahçeleri',
      'Taif Kalesi',
      'Abdullah ibn Abbas Türbesi',
      'Yerel pazar ziyareti',
    ],
    isPopular: true,
    minPassengers: 6,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-taif-tour',
  },

  // ──────────────────────────────────────────────────────
  // CİDDE GEZİSİ
  // ──────────────────────────────────────────────────────
  {
    id: 'mecca-jeddah-tour',
    type: 'tour',
    category: 'jeddah_tour',
    name: 'Cidde Tarihi Turu',
    description: 'Cidde\'nin tarihi ve kültürel yerlerini gezin',
    icon: '🌊',
    from: {
      city: 'Mekke',
      location: 'Otel',
    },
    to: {
      city: 'Cidde',
      location: 'Tarihi Bölge (Al-Balad)',
    },
    distance: { km: 80, text: '80 km' },
    duration: { hours: 6, text: 'Yarım gün (6 saat)' },
    pricing: {
      basePrice: 240, // Kişi başı
      includes: [
        'Türkçe rehber',
        'Araç transferi',
        'Su ikramı',
        'Giriş ücretleri',
      ],
      excludes: ['Yemek', 'Kişisel harcamalar'],
    },
    highlights: [
      'Al-Balad (Tarihi Cidde)',
      'Kızıldeniz sahili',
      'Cidde Çeşmesi',
      'Nasif Evi Müzesi',
      'Alışveriş bölgeleri',
    ],
    isPopular: false,
    minPassengers: 6,
    maxPassengers: 40,
    languages: ['Türkçe', 'Arapça'],
    relatedRouteId: 'mecca-jeddah-tour',
  },
];

// Yardımcı fonksiyonlar

export function getServiceById(id: string): PopularService | undefined {
  return POPULAR_SERVICES.find(service => service.id === id);
}

export function getServicesByType(type: ServiceType): PopularService[] {
  return POPULAR_SERVICES.filter(service => service.type === type);
}

export function getServicesByCategory(category: ServiceCategory): PopularService[] {
  return POPULAR_SERVICES.filter(service => service.category === category);
}

export function getPopularServices(): PopularService[] {
  return POPULAR_SERVICES.filter(service => service.isPopular);
}

export function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    transfer: 'Transferler',
    guide: 'Rehberler',
    tour: 'Turlar',
  };
  return labels[type];
}

export function getServiceCategoryLabel(category: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    airport_transfer: 'Havalimanı Transferleri',
    city_transfer: 'Şehir İçi Transferler',
    intercity_transfer: 'Şehirler Arası Transferler',
    mecca_tour: 'Mekke Gezileri',
    medina_tour: 'Medine Gezileri',
    taif_tour: 'Taif Gezisi',
    jeddah_tour: 'Cidde Gezisi',
  };
  return labels[category];
}
