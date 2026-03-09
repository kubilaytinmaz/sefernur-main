// Basitleştirilmiş Popüler Hizmetler - Transfer, Tur ve Rehberler
// Tek liste, fiyatlar görünür, çoklu seçim destekli

export type ServiceType = 'transfer' | 'tour' | 'guide';

export interface PopularService {
  id: string;
  type: ServiceType;
  name: string;
  description: string;
  icon: string;
  
  // Transfer için mesafe bilgisi
  distance?: {
    km: number;
    text: string;
  };
  
  // Süre bilgisi
  duration: {
    text: string;
    hours: number; // Toplam hesaplama için
  };
  
  // Fiyat gösterimi
  price: {
    display: string; // "150₺+" veya "200₺/kişi"
    baseAmount: number; // Hesaplamalar için
    type: 'per_km' | 'per_person' | 'fixed';
  };
  
  // Güzergah bilgisi (araç kartlarında gösterilecek)
  route?: {
    from: string;
    to: string;
    stops?: string[]; // Ara duraklar
  };
  
  // Tur/Rehber için ek bilgiler (opsiyonel)
  tourDetails?: {
    highlights: string[]; // Ziyaret edilecek yerler
    includes: string[]; // Fiyata dahil olanlar
    minParticipants: number;
    maxParticipants: number;
  };
  
  isPopular: boolean;
}

export const POPULAR_SERVICES: PopularService[] = [
  // ══════════════════════════════════════════════════════
  // MEKKE GEZİLERİ (3 adet)
  // ══════════════════════════════════════════════════════
  {
    id: 'tour-mecca-city',
    type: 'tour',
    name: 'Mekke Şehir Turu',
    description: 'Mekke\'nin kutsal yerlerini rehberli keşfedin',
    icon: '🕌',
    duration: { text: '4 saat', hours: 4 },
    distance: { km: 45, text: '45 km' },
    price: {
      display: '200₺/kişi',
      baseAmount: 200,
      type: 'per_person',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Mekke Şehir Merkezi',
      stops: ['Cebeli Nur', 'Cebeli Sevr', 'Mina', 'Arafat', 'Müzdelife'],
    },
    tourDetails: {
      highlights: [
        'Cebeli Nur (Hira Mağarası)',
        'Cebeli Sevr',
        'Mina, Arafat, Müzdelife',
        'Cehennem Vadisi',
        'Şeytan Taşlama Yeri',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 4,
      maxParticipants: 40,
    },
    isPopular: true,
  },
  {
    id: 'guide-cebeli-nur',
    type: 'guide',
    name: 'Cebeli Nur (Hira Mağarası)',
    description: 'İlk vahyin indiği kutsal mağarayı ziyaret edin',
    icon: '⛰️',
    duration: { text: '3 saat', hours: 3 },
    distance: { km: 15, text: '15 km' },
    price: {
      display: '180₺/kişi',
      baseAmount: 180,
      type: 'per_person',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Cebeli Nur',
      stops: ['Hira Mağarası', 'Manzara noktaları'],
    },
    tourDetails: {
      highlights: [
        'Hira Mağarası ziyareti',
        'Cebeli Nur tırmanışı',
        'Mekke manzarası',
        'Tarihi anlatımlar',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı'],
      minParticipants: 4,
      maxParticipants: 30,
    },
    isPopular: true,
  },
  {
    id: 'tour-arafat-mina',
    type: 'tour',
    name: 'Arafat-Mina-Müzdelife',
    description: 'Hac ibadetinin yapıldığı kutsal yerleri gezin',
    icon: '🕋',
    duration: { text: '5 saat', hours: 5 },
    distance: { km: 60, text: '60 km' },
    price: {
      display: '200₺/kişi',
      baseAmount: 200,
      type: 'per_person',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Müzdelife',
      stops: ['Arafat Vakfesi', 'Mina Çadır Kenti', 'Cemre'],
    },
    tourDetails: {
      highlights: [
        'Arafat Vakfesi Yeri',
        'Mina Çadır Kenti',
        'Müzdelife',
        'Cemre (Şeytan Taşlama)',
        'Hac ibadeti anlatımı',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Öğle yemeği', 'Su ikramı'],
      minParticipants: 6,
      maxParticipants: 40,
    },
    isPopular: true,
  },

  // ══════════════════════════════════════════════════════
  // MEDİNE GEZİLERİ (3 adet)
  // ══════════════════════════════════════════════════════
  {
    id: 'tour-medina-city',
    type: 'tour',
    name: 'Medine Şehir Turu',
    description: 'Medine\'nin kutsal yerlerini rehberli gezin',
    icon: '🕌',
    duration: { text: '5 saat', hours: 5 },
    distance: { km: 55, text: '55 km' },
    price: {
      display: '220₺/kişi',
      baseAmount: 220,
      type: 'per_person',
    },
    route: {
      from: 'Medine Otel',
      to: 'Medine Şehir Merkezi',
      stops: ['Uhud Dağı', 'Kıble Camii', 'Kuba Camii', 'Seb\'a Mescitleri', 'Bedir'],
    },
    tourDetails: {
      highlights: [
        'Uhud Dağı ve Şehitleri',
        'Kıble Camii',
        'Kuba Camii',
        'Seb\'a Mescitleri',
        'Bedir Savaş Alanı',
        'Hendek Savaşı',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 4,
      maxParticipants: 40,
    },
    isPopular: true,
  },
  {
    id: 'tour-date-gardens',
    type: 'tour',
    name: 'Hurma Bahçeleri Gezisi',
    description: 'Medine\'nin meşhur hurma bahçelerini gezin',
    icon: '🌴',
    duration: { text: '3 saat', hours: 3 },
    distance: { km: 25, text: '25 km' },
    price: {
      display: '150₺/kişi',
      baseAmount: 150,
      type: 'per_person',
    },
    route: {
      from: 'Medine Otel',
      to: 'Hurma Bahçeleri',
      stops: ['Hurma üretim çiftlikleri', 'Tadım istasyonları'],
    },
    tourDetails: {
      highlights: [
        'Medine hurma bahçeleri',
        'Hurma çeşitleri tanıtımı',
        'Hurma tatımı',
        'Yerel üretici ziyareti',
        'Hurma alışverişi',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Hurma tatımı', 'Su ikramı'],
      minParticipants: 4,
      maxParticipants: 30,
    },
    isPopular: true,
  },
  {
    id: 'guide-uhud-mountain',
    type: 'guide',
    name: 'Uhud Dağı ve Şehitleri',
    description: 'Uhud Savaşı\'nın geçtiği tarihi yerleri ziyaret edin',
    icon: '⛰️',
    duration: { text: '2.5 saat', hours: 2.5 },
    distance: { km: 20, text: '20 km' },
    price: {
      display: '120₺/kişi',
      baseAmount: 120,
      type: 'per_person',
    },
    route: {
      from: 'Medine Otel',
      to: 'Uhud Dağı',
      stops: ['Şehitler Mezarlığı', 'Hz. Hamza Kabri'],
    },
    tourDetails: {
      highlights: [
        'Uhud Dağı',
        'Şehitler Mezarlığı',
        'Hz. Hamza Kabri',
        'Uhud Savaşı anlatımı',
        'Peygamber Efendimiz\'in yaralandığı yer',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Tarihi anlatım', 'Su ikramı'],
      minParticipants: 4,
      maxParticipants: 30,
    },
    isPopular: true,
  },

  // ══════════════════════════════════════════════════════
  // DİĞER GEZİLER (2 adet)
  // ══════════════════════════════════════════════════════
  {
    id: 'tour-taif',
    type: 'tour',
    name: 'Taif Günübirlik Turu',
    description: 'Taif\'in tarihi ve doğal güzelliklerini keşfedin',
    icon: '🏔️',
    duration: { text: 'Tam gün (8 saat)', hours: 8 },
    distance: { km: 180, text: '180 km' },
    price: {
      display: '280₺/kişi',
      baseAmount: 280,
      type: 'per_person',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Taif',
      stops: ['Gül Bahçeleri', 'Şifa Bahçeleri', 'Taif Kalesi', 'Yerel Pazar'],
    },
    tourDetails: {
      highlights: [
        'Taif Gül Bahçeleri',
        'Şifa Bahçeleri',
        'Taif Kalesi',
        'Abdullah ibn Abbas Türbesi',
        'Yerel pazar ziyareti',
        'Hurma ve bal alışverişi',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Öğle yemeği', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 6,
      maxParticipants: 40,
    },
    isPopular: true,
  },
  {
    id: 'tour-jeddah-coast',
    type: 'tour',
    name: 'Cidde Kızıldeniz Sahili',
    description: 'Kızıldeniz sahilinde gün batımı ve modern Cidde',
    icon: '🌊',
    duration: { text: '4 saat', hours: 4 },
    distance: { km: 160, text: '160 km' },
    price: {
      display: '180₺/kişi',
      baseAmount: 180,
      type: 'per_person',
    },
    route: {
      from: 'Mekke Otel',
      to: 'Cidde',
      stops: ['Kızıldeniz Sahili', 'Cidde Çeşmesi', 'Corniche', 'Al-Balad'],
    },
    tourDetails: {
      highlights: [
        'Kızıldeniz sahili',
        'Cidde Çeşmesi',
        'Corniche gezisi',
        'Gün batımı manzarası',
        'Modern alışveriş merkezleri',
        'Al-Balad (Tarihi Cidde)',
      ],
      includes: ['Türkçe rehber', 'Araç transferi', 'Su ikramı', 'Giriş ücretleri'],
      minParticipants: 6,
      maxParticipants: 40,
    },
    isPopular: true,
  },
];

// Yardımcı fonksiyonlar

export function getServiceById(id: string): PopularService | undefined {
  return POPULAR_SERVICES.find(service => service.id === id);
}

export function getServicesByType(type: ServiceType): PopularService[] {
  return POPULAR_SERVICES.filter(service => service.type === type);
}

export function getPopularServices(): PopularService[] {
  return POPULAR_SERVICES.filter(service => service.isPopular);
}

export function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    transfer: 'Transfer',
    guide: 'Rehber',
    tour: 'Tur',
  };
  return labels[type];
}

export function getServiceTypeColor(type: ServiceType): string {
  const colors: Record<ServiceType, string> = {
    transfer: 'blue', // Mavi tonlar
    tour: 'orange', // Turuncu tonlar
    guide: 'purple', // Mor tonlar
  };
  return colors[type];
}
